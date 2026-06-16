# 05 — Authentication, Roles, OTP & Sessions

This document defines the complete identity/session contract: how tokens are issued and refreshed,
how OTP email-verification and password reset work, how the two roles are gated, and how the client
persists and restores sessions.

## 1. Roles

Two authenticated roles, encoded in the JWT payload and in redux:
- `user` — public member.
- `professional` — clinician.

There is also an unauthenticated **admin** surface (the EJS approval page) — currently no admin auth.

Client role helpers (`App/utils/roles.js`): `RoleEnum = {ADMIN, USER:'user', PROFESSIONAL:'professional'}`, `isUser`, `isProfessional`, `selectHomepageByRole`.

## 2. JWT tokens

Each model has `generateTokens(id)` returning `[accessToken, refreshToken]`:

```
accessToken  = jwt.sign({ id, role }, JWT_ACCESS_TOKEN,  { expiresIn: JWT_EXPIRATION })
refreshToken = jwt.sign({ id, role }, JWT_REFRESH_TOKEN, { expiresIn: JWT_REFRESH_EXPIRATION })
```

- Payload: `{ id, role }` where role is `'user'` or `'professional'`.
- **Two separate secrets** for access vs refresh.
- Sent by the client as `Authorization: Bearer <accessToken>`.

### Verification middleware — `verifyToken(role)` (`middlewares/authentication.js`)
Bound per-router with a fixed expected `role` (`'user'` or `'prof'`). Steps:
1. role must be `user`|`prof` else `400`.
2. `Authorization` must be `Bearer <token>` else `400`.
3. `jwt.verify(accessToken, JWT_ACCESS_TOKEN)`; decoded must have `id`.
4. Load `User` (role user) or `Professional` (role prof) by id; not found → `401 InvalidToken`.
5. **Completeness gating** (skipped for the allow-listed registration routes — see §4).
6. Set `req.user`, `req.isUser`, `req.isProfessional`.
- Expired → `401 InvalidToken "Token has expired, please login again"`.
- Malformed → `401 InvalidToken "Invalid token…"`.
- Other → `500 ServerError`.

> The `/notifications/:role` routes derive the role from the `:role` URL param (`u`→user, `p`→prof) and then apply `verifyToken`.

### Refresh flow
- `POST /auth/refresh-token {refreshToken}` verifies against `JWT_REFRESH_TOKEN`, reloads the entity, and returns a brand-new access+refresh pair.
- The client (`ApiExecutor`) auto-refreshes on `401 InvalidToken`: up to **3 attempts**; on success it stores the new pair (`setAuthToken(role, access, refresh)`) and **retries the original request**; on failure it logs out.

## 3. OTP — email verification & password reset

OTP fields live on both User and Professional: `otp`, `otpExpiredAt`, `otpUseCase` (`email-verification`|`forget-password`), plus `isEmailVerified` and `canResetPassword`.

### Generation (`utils/otpGenerator.js`)
6-digit numeric string: `Math.floor(100000 + random*900000)`. Expiry = now + 10 minutes.

### Verify-email / send-OTP — `GET /auth/verify-email`
- Query: `email`, `accountType` (`user`|`professional`), `useCase` (`email-verification`|`forget-password`).
- If a same-useCase OTP is still unexpired, returns "already sent" without re-sending.
- Otherwise sets `otp/otpExpiredAt/otpUseCase`, emails the OTP, saves. Subject differs by useCase.

### Verify-OTP — `GET /auth/verify-otp`
- Query: `email`, `otp`, `accountType`, `useCase`.
- Validates code + expiry. On success: `isEmailVerified=true`, clears OTP fields; if `useCase=forget-password` sets `canResetPassword=true`.

### Reset password with OTP — `POST /auth/update-password-with-otp`
- Body: `{ email, accountType, password }`. Requires `canResetPassword`. Hashes & sets new password; clears `canResetPassword`.

### Change password while logged in
- `POST /user/reset-password` / `POST /prof/reset-password` (shared handler): verify `oldPassword`, set `newPassword`. Bangla error `'পুরনো পাসওয়ার্ড সঠিক নয়।'` if old is wrong.

Client OTP UX: `EmailVerification.js` (enter OTP, resend) and `ForgetPassword.js` (request → OTP → new password). See [screens/01](screens/01-user-onboarding-auth.md). The client navigates to `EMAIL_VERIFICATION_PAGE` automatically whenever the server returns `EmailNotVerified`.

## 4. Profile-completeness gating (the auto-onboarding mechanism)

After token verification, unless the requested path is in the allow-list, the middleware enforces:

Allow-list (gating skipped): `/user/add-info`, `/prof/register/step-1`, `/prof/register/step-2`, `/prof/register/step-3`, `/prof/register/step-4`.

| Condition | 401 `type` returned | Client action |
|---|---|---|
| `!isEmailVerified` (either role) | `EmailNotVerified` (errors[0].data = {accountType,email}) | navigate to EmailVerification |
| user with `!age` | `INCOMPLETE_PROFILE:STEP:2` | navigate to AdditionalInformation |
| professional with `step<4` | `INCOMPLETE_PROFILE:STEP:<step>` | navigate to the matching RegisterStep (step1→2, 2→3, 3→4) |

This is how a half-registered account is always funnelled to the next required screen on its very next API call. The exact `type` strings are a **contract** between server and client (`INCOMPLETE_PROFILE:` prefix + `STEP:n`).

Additional gates:
- **Professional login** is blocked unless `isVerified` (admin approval): `401 'অ্যাকাউন্ট এখনও যাচাই করা হয়নি'`.
- A user's `isNewUser` (`!age`) at sign-in tells the client to send them to AdditionalInformation.

## 5. Session persistence (client)

Redux store (`App/redux`) is persisted via `redux-persist` + AsyncStorage. Persisted slices: `auth`, `user`, `prof`, `notifications`, `profRequests` (each individually `persistReducer`-wrapped under key `root`).

- **auth slice** (`reducers/auth.js`): `{ role, accessToken, refreshToken }`. `SIGN_IN` sets them; `SIGN_OUT` resets. `setAuthToken(role, access, refresh)` dispatches `SIGN_IN`.
- On app launch, `PersistGate` rehydrates; a stored `auth.role` + tokens means the user resumes logged-in. The drawer/menus and `selectHomepageByRole` use `auth.role`.
- **Logout** clears every slice (`SIGN_OUT, PROF_SIGN_OUT, DELETE_PROFILE, DELETE_ALL_PROF_REQUEST, RESET_NOTIFICATION_COUNT`) and resets navigation to Welcome + the role's login screen.

Other persisted slices:
- **user** (`reducers/user.js`): cached profile + per-scale scores/dates (`msm/moj/mcn/dn_*`), `mentalHealthProfile`, `shownVideo`, `isProfileCompleted`.
- **prof** (`reducers/prof.js`): cached professional profile fields + `numOfNewClientRequests`/`numOfNewNotifications` + `visibility` + `step`.
- **notifications** (`reducers/notifications.js`): `{ unreadCount }`.
- **profRequests** (`reducers/prof_req.js`): cached list of client requests (`requests[]`) with add/seen/remove actions.

## 6. Security notes for the rebuild (current weaknesses)

- **Hardcoded SMTP credentials** (`services/email.js`). Move to secrets.
- **Unauthenticated endpoints:** `GET /user/all`, `POST /user/userInfo`, `GET /prof/allProf`, `GET /prof/user-profile/:userId`, `GET /prof/primary-test-details/:testId`, `GET /admin/professionals`, `POST /prof/approve`. Several leak full user/professional records. Add auth + role checks.
- **Admin approval has no authentication** — anyone who can reach `/admin/professionals` can approve professionals. Add an admin auth layer.
- **CORS is fully open** (`cors()` with no options).
- Access tokens are sent as Bearer (fine); consider short access TTL + rotating refresh tokens with reuse detection in the rebuild.
- `JWT_SECRET` env var is declared but the active code uses `JWT_ACCESS_TOKEN`/`JWT_REFRESH_TOKEN`. Consolidate.
