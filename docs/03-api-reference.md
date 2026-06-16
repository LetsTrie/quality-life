# 03 — API Reference

Base URL = backend origin (client uses `EXPO_PUBLIC_API_URL`). All bodies are JSON.
Routers are mounted in `index.routes.js`:

```
/auth          → routes/auth.js
/user          → routes/user.js
/prof          → routes/prof.js
/admin         → routes/admin.js
/notifications → routes/notifications.js
GET /           → public/index.html
*               → 405 MethodNotAllowed {message:'API Method not found'}
```

## Conventions

### Success envelope
Most handlers use `sendJSONresponse(res, status, content)` which is just `res.status(status).json(content)`.
The common shape is:
```json
{ "data": { ... } }
```
…but several handlers return bare objects (no `data` wrapper) — these are noted per-endpoint.
The client unwraps `response.data.data` in `ApiExecutor`, so endpoints returning a bare object are read differently on the client (also noted).

### Error envelope
`sendErrorResponse(res, status, type, content)` returns:
```json
{ "success": false, "status": <code>, "type": "<TYPE>", "errors": [ { "message": "...", "data": {...}? } ] }
```
The central `errorHandler` (for thrown errors / validation / mongoose errors) returns:
```json
{ "success": false, "message": "...", "errorField": "<field>"? }
```
Mongoose specifics: duplicate key → `409 "<field> is already used."`; CastError → `400`; ValidationError → `400` with array of messages.

### Auth
Protected routes use `authentication.verifyToken(role)` middleware. Send `Authorization: Bearer <accessToken>`. The middleware:
1. Rejects missing/!Bearer header → `400 ValidationError`.
2. Verifies the access token with `JWT_ACCESS_TOKEN`. Expired → `401 InvalidToken "Token has expired…"`; malformed → `401 InvalidToken`.
3. Loads the `User`/`Professional` by `decoded.id`; not found → `401 InvalidToken "User not found"`.
4. **Profile-completeness gating** (unless the path is in the allow-list `/user/add-info`, `/prof/register/step-1..4`):
   - If `!isEmailVerified` → `401` with `type:'EmailNotVerified'`, body errors `[{message:'Incomplete profile', data:{accountType, email}}]`.
   - If user and `!age` → `401` `type:'INCOMPLETE_PROFILE:STEP:2'`.
   - If professional and `step<4` → `401` `type:'INCOMPLETE_PROFILE:STEP:<step>'`.
5. On success sets `req.user`, `req.isUser`, `req.isProfessional`.

The client (`ApiExecutor`) reacts to these `type` codes — see [05](05-auth-roles-and-sessions.md).

### Validation
`validate(schema)` runs Joi over `params`/`query`/`body`, `abortEarly:false`; on failure → `400` via `ApiError` (errorHandler formats it). Password rule (`custom.validation.js`): ≥8 chars and ≥1 letter & ≥1 digit, Bangla error messages.

Rate limit: 200 requests / 15 min across all routes.

---

# /auth

### POST /auth/refresh-token
- **Auth:** none (takes a refresh token in body).
- **Body:** `{ refreshToken }`.
- **Logic:** verify `refreshToken` with `JWT_REFRESH_TOKEN`; decode `{id, role}`; load User or Professional by id; issue a **new access + refresh** pair via `generateTokens(id)`.
- **200:** `{ data: { accessToken, refreshToken } }`.
- **Errors:** missing token → `400 ValidationError`; invalid/expired or user not found → `401` (`'দয়া করে আবার লগইন করুন।'` on verify failure).

### GET /auth/verify-email  (send OTP)
- **Auth:** none. **Validation:** `verifyEmail` query schema.
- **Query:** `email`, `accountType` (`user`|`professional`), `useCase` (`forget-password`|`email-verification`).
- **Logic:** pick model by `accountType`; find by email (404 `'এই ইমেইল এ কোন অ্যাকাউন্ট নেই'` if none). If an OTP for the same `useCase` is still unexpired → return early `200 {data:{message:'আপনাকে ইতোমধ্যে অনুসন্ধান কোড পাঠানো হয়েছে।'}}`. Otherwise generate a 6-digit OTP, set `otpExpiredAt = now+10min`, `otpUseCase=useCase`, **email the OTP** (subject differs for reset vs verification). If email send fails → `400 'ইমেইল পাঠানো সম্ভব হয়নি।'`. Save.
- **200:** `{ data: { message: 'আপনার ইমেইলে অনুসন্ধান কোড পাঠানো হয়েছে।' } }`.

### GET /auth/verify-otp
- **Auth:** none. **Validation:** `verifyOtp` query schema.
- **Query:** `email`, `otp` (number), `accountType`, `useCase`.
- **Logic:** find entity; compare OTP (string-coerced); wrong → `400 'Invalid OTP'`; expired (`otpExpiredAt < now`) → `400 OTP_EXPIRED 'OTP has expired'`. On success: set `isEmailVerified=true`, clear `otp/otpExpiredAt/otpUseCase`; if `useCase===forget-password` set `canResetPassword=true`. Save.
- **200:** `{ data: {} }`.

### POST /auth/update-password-with-otp
- **Auth:** none. **Validation:** `updatePasswordWithOtp` body schema.
- **Body:** `{ email, accountType, password }`.
- **Logic:** find entity; if `!canResetPassword` → `400 'আপনি এই ইমেইল এ পুনরায় পাসওয়ার্ড পরিবর্তন করতে পারবেন না।'`. Hash new password (bcrypt 10), set it, set `canResetPassword=false`. Save.
- **200:** `{ data: {} }`.

---

# /user

## Auth (user)
### POST /user/sign-in
- **Validation:** `loginAsUser` (email, password).
- **Logic:** find user by email (401 `'ইমেইল/পাসওয়ার্ডটি ভুল'` if none); bcrypt compare (401 same msg if mismatch); `generateTokens`. `isNewUser = !user.age`.
- **200:** `{ data: { user, accessToken, refreshToken, isNewUser } }`.

### POST /user/sign-up
- **Validation:** `registerUserStep1` (email, password with custom rule).
- **Logic:** if email exists → `401 UNAUTHORIZED 'এই পরিচয়ে ইতোমধ্যে অ্যাকাউন্ট তৈরি করা হয়েছে'`. Hash password, create user, `generateTokens`.
- **201:** `{ data: { user, accessToken, refreshToken } }`.
- Note: account is usable immediately for the token, but email verification + additional-info gating kicks in on the next protected call.

### POST /user/reset-password  *(auth: user)*
- **Validation:** `resetPassword` (oldPassword, newPassword).
- **Logic:** bcrypt compare `oldPassword` vs `req.user.password` (401 `'পুরনো পাসওয়ার্ড সঠিক নয়।'`); hash + save newPassword.
- **200:** `{ data: {} }`.

### POST /user/delete-account  *(auth: user)*
- **Logic:** cascade delete (see [02 §10](02-data-model.md)) then delete user.
- **200:** `{ data: {} }`.

## User info
### POST /user/add-info  *(auth: user; exempt from completeness gate)*
- **Validation:** `additionalInfoValidationSchema` — `name` (1–255), `age` (int 1–120), `gender` (Male/Female/Others), `isMarried` (bool), `location{ zila(req), upazila(opt), union(opt) }`.
- **Logic:** copy every body field onto `req.user`, save. (This is what sets `age` and clears the incomplete-profile gate.)
- **200:** `{ data: {} }`.

### GET /user/homepage  *(auth: user)*
- **Logic:** compute last result (score+date) for the four primary scales via `getProgress` (uses `controllers/user.js` helpers). `completeYourProfile = !age`.
- **200 (bare, no data wrapper):** `{ completeYourProfile, manoshikShasthoMullayon, manoshikObosthaJachaikoron, manoshikChapNirnoy, duschintaNirnoy }` where each scale value is `{ score, date }` or `{}`.

### GET /user/profile/all  *(auth: user)*
- **Logic:** build `user{ name, age, gender, isMarried:'Married'|'Unmarried', address, email }` (address = union, upazila, zila joined). Compute `progress` for the four primary scales with `'format-date'`.
- **200 (bare):** `{ user, progress:{ manoshikShasthoMullayon, manoshikObosthaJachaikoron, manoshikChapNirnoy, duschintaNirnoy } }`.

### GET /user/all-informations  *(auth: user)*
- **Logic:** like above plus `mentalHealthProfile`, `isProfileCompleted` (true only if all of name/age/gender/isMarried/address/email present **and** `mentalHealthProfile` has exactly 5 distinct entries), per-scale score/date flattened (`msm_*`, `moj_*`, `mcn_*`, `dn_*`), and `shownVideo`.
- **200:** `{ data: { user } }`. (Client stores this in the `user` redux slice.)

### POST /user/seen-video/:videoUrl  *(auth: user)*
- **Logic:** push `videoUrl` into `user.shownVideo` if not present; save.
- **200:** `{ data: {} }`. (400 if `videoUrl` missing.)

### POST /user/add-rating  *(auth: user)*
- **Body:** `{ rating, contentId, comment, videoUrl }`.
- **Logic:** create a `Rating` for `req.user`.
- **200:** `{ data: {} }`.

### POST /user/update/profile  *(auth: user)*
- **Body:** any user fields.
- **Logic:** copy body onto `req.user`, save; recompute address.
- **200:** `{ data: { user:{ name, age, gender, isMarried, address } } }`.

## Tests & suggested scales (user)
### POST /user/test  *(auth: user)*
- **Body:** `{ questionAnswers, type, score, fromProfile, totalScore, severity, postTest }`.
- **Logic:** `type` must be in the allow-list (`manoshikShasthoMullayon`, `manoshikObosthaJachaikoron`, `manoshikChapNirnoy`, `duschintaNirnoy`, `childCare`, `coronaProfile`, `domesticViolence`, `psychoticProfile`, `suicideIdeation`) else `400`. If `fromProfile`, add `type` to `user.mentalHealthProfile` (dedup) and save. Create a `Test{questionAnswers,type,userId,date,score,totalScore,severity,postTest}` (`date` = `mm/dd/yyyy`).
- **200:** `{ data: { test, mDate } }` where `mDate` is the formatted date.

### POST /user/submit-suggested-scale  *(auth: user)*
- **Body:** `{ assessmentId, totalWeight, stage, maxWeight, questionAnswers }`.
- **Logic:** update the `ProfessionalsAssessment` by id: `hasCompleted=true, completedAt=now, totalWeight, stage, maxWeight, questionAnswers` (404 if not found). Load the professional (404 if missing). Remove the SUGGEST_A_SCALE notification, then create a `SCALE_FILLUP_BY_USER` notification + **email the professional** (`scaleSubmittedByUser`).
- **200:** `{ data: { assessment } }`.

### GET /user/suggested-scale-fillup-check/:assessmentId  *(auth: user)*
- **Logic:** load assessment (404 if none). If `hasCompleted` → `400 'Assessment has been completed'`. Mark the SUGGEST_A_SCALE notification seen.
- **200:** `{ data: { assessment } }`.

### GET /user/result-history-data/:testType  *(auth: user)*
- **Logic:** last 10 `Test` of that `type` for the user, newest first.
- **200:** `{ data: { tests } }`.

## Public (user router, no auth) — ⚠ exposure risk
### GET /user/all → `200` array of **all** users (full docs). ⚠ no auth.
### POST /user/userInfo → body `{ _id }` → `200 { user, tests }`. ⚠ no auth.

## User ↔ Professional (user side)
### GET /user/professionals?page=N  *(auth: user)*
- **Logic (page 1 also returns context):**
  - `professionalsCount` = count of `{isVerified:true, visibility:true, step:4}`.
  - `appointmentsTaken` = active appointments of this user.
  - `isClient` = active ProfessionalsClient rows of this user.
  - `recentlyContactedProfessionals` = professionals whose ids appear in the above (deduped), newest first.
  - `professionals` = page of verified/visible/step4 professionals **excluding** the already-contacted ids, LIMIT 10, newest first.
- **200:** `{ data: { professionalsCount?, appointmentsTaken?, isClient?, recentlyContactedProfessionals?, professionals } }`.

### POST /user/take-appointment  *(auth: user)*
- **Body:** `{ profId, permissionToSeeProfile, dateByClient }`.
- **Logic:** load prof (404 `'এই নামে কোন প্রোফেসনাল খুঁজে পাওয়া যাইনি!'`). If an active appointment with this prof exists → `400 'আপনি ইতোমধ্যে এই প্রোফেসনালের সাথে একটি অ্যাপয়েন্টমেন্ট করেছেন!'`. Create appointment; create `APPOINTMENT_REQUESTED` notification (for professional) + **email the professional**.
- **201:** `{ data: { appointmentId } }`.

### GET /user/appointment-details/:appointmentId  *(auth: user)*
- **Logic:** load appointment populated with `user(name)` and `prof(name,email,telephone)` (404 if none). Mark the APPOINTMENT_ACCEPTED notification seen for this user.
- **200:** `{ data: { appointment } }`.

### GET /user/find-suggested-scales/:profId  *(auth: user)*
- **Logic:** find `ProfessionalsAssessment{user, prof, hasCompleted:false}`.
- **200:** `{ data: { scales } }`.

---

# /prof

## Registration & auth (professional)
### POST /prof/register/step-1
- **Validation:** `registerProfessionalStep1` — email, password (custom), confirmPassword (must match), name, gender, profession, designation/batch/bmdc/workplace (optional), zila/upazila required, union optional.
  > ⚠ `gender` and `profession` use `Joi.number().valid(<string list>)` — a number can never equal a string, so this schema is effectively broken for those two; the client sends strings. **Fix in rebuild** to `Joi.string().valid(...)`.
- **Logic:** if email taken → `400 'এই ইমেলটি ইতোমধ্যেই ব্যবহার করা হয়েছে'`. Hash password, create professional (`step` defaults 1, `isVerified` false). **Email the admin** (`ADMIN_EMAIL`) a new-registration notice with an approval link `${APP_URL}/admin/professionals`.
- **201:** `{ data: { id, email } }`.
- Note: step-1 does **not** return tokens here; the client logs the professional in / continues via the login + incomplete-profile flow (see screen spec 05).

### POST /prof/login
- **Logic:** find prof by email (401 `'ইমেইল/পাসওয়ার্ডটি ভুল'`); bcrypt compare (401 same); if `!isVerified` → `401 'অ্যাকাউন্ট এখনও যাচাই করা হয়নি'`; `generateTokens`.
- **200:** `{ data: { prof, accessToken, refreshToken } }`.
- Note: after login, if `step<4` the next protected call returns `INCOMPLETE_PROFILE:STEP:<step>` and the client routes to the right step.

### POST /prof/register/step-2  *(auth: prof; exempt from gate)*  — Validation `registerProfessionalStep2`
- experience, eduQualification, specializationArea (req), otherSpecializationArea (req when specialization='অন্যান্য'), fee (number), telephone (digits).
- **Logic:** copy body fields onto `req.user`, set `step=2`, save. **200:** `{ data: { user } }`.

### POST /prof/register/step-3  *(auth: prof; exempt)* — Validation `registerProfessionalStep3`
- `availableTime: [{ day(Sun–Sat), timeRange:[{ from, to }] }]`, `from`/`to` match `hh:mmAM/PM`.
- **Logic:** set `availableTime`, `step=3`, save. **200:** `{ data: {} }`.

### POST /prof/register/step-4  *(auth: prof; exempt)* — Validation `registerProfessionalStep4`
- `maximumWeeklyClient`/`averageWeeklyClient` (from fixed Bangla list), `numberOfClients:[{location,count}]` (≥1), `reference` (optional ≤255).
- **Logic:** copy body fields, set `step=4`, save (registration complete). **200:** `{ data: {} }`.

### GET /prof/all-informations  *(auth: prof)* → `{ data: { prof: req.user } }`.
### POST /prof/delete-account  *(auth: prof)* → cascade delete (see [02 §10]) → `{ success: true }`.
### POST /prof/reset-password  *(auth: prof)* → same as user reset-password (shared `AuthController.resetPassword`).
### POST /prof/update-visibility  *(auth: prof)* — Validation `profVisibility{ visibility:bool }* → sets `req.user.visibility = !!visibility`, save → `{ success: true }`.

## Professional dashboards / clients
### GET /prof/homepage-notification-count  *(auth: prof)*
- **Logic:** `notificationCount` = unread notifications `for:professional`; `appointmentCount` = `{prof, hasProfViewed:false, isActive:true}` count.
- **200:** `{ data: { notificationCount, appointmentCount } }`.

### GET /prof/my-clients  *(auth: prof)*
- **Logic:** active ProfessionalsClient of this prof, populate `user(name,location,age,gender,isMarried)`.
- **200:** `{ data: { clients } }`.

### GET /prof/user-profile/:userId  *(no auth middleware on the route!)* ⚠
- **Logic:** load user (404 if none); build `user{name,age,gender,isMarried,address,email}` and `progress` for **eight** scales (manoshikObosthaJachaikoron, manoshikChapNirnoy, duschintaNirnoy, childCare, coronaProfile, domesticViolence, psychoticProfile, suicideIdeation) via `controllers/helpers.getProgress` (each `{ test_id, score, last_date, stage }` or null; stage derived from severity ranges).
- **200:** `{ data: { user, progress } }`.

### GET /prof/primary-test-details/:testId  *(no auth on route)* ⚠ → `{ data: { test } }` (404 if none).

### POST /prof/result-suggested-scale  *(auth: prof)* — ⚠ **DEAD**: marks a notification seen then `throw new Error('Not implemented')`. Do not rebuild as-is; intended to return a submitted scale's result.

### GET /prof/allProf  *(no auth)* → `200` array of all professionals. ⚠
### POST /prof/:profId/update/profile  *(auth: prof)* → copies body onto the professional found by `:profId`, save → `{ success:true, data:{ professional } }`.
### POST /prof/approve  *(no auth)* — admin approval (called by the EJS page): load prof by `{profId}`; set `isVerified=true`; **email** the professional account-approved → `{ success:true }`. ⚠ Not-found path calls `sendErrorResponse(res,'NOT_FOUND',{...})` with wrong arg order (status missing) — bug.

## Appointments & assessments (professional side)
### POST /prof/appointment-seen/:appointmentId  *(auth: prof)*
- Load appointment populate `user(name,age,isMarried,location,email)` (404 if none). If already responded → return it with a message. Else set `hasProfViewed=true, profViewedAt=now`, save; mark APPOINTMENT_REQUESTED notification seen. **200:** `{ data: { appointment } }`.

### GET /prof/client-requests?page=N  *(auth: prof)*
- Query `{prof, hasProfRespondedToClient:false, isActive:true}`; page-1 also returns `requestsCount`. Populate `user(name,age,isMarried,location,email)`, LIMIT 10, newest first. **200:** `{ data: { requestsCount?, requests } }`.

### POST /prof/appointment-response/:appointmentId  *(auth: prof)*
- **Body:** `{ dateByProfessional, message, initAssessmentSlug, userId }`.
- **Logic:** load user (404) and appointment (404). If already responded → `400`. Find or create/activate `ProfessionalsClient{user,prof}`. Set appointment `hasProfRespondedToClient=true, profRespondedAt=now, status=APPOINTMENT_ACCEPTED`, plus `dateByProfessional`/`messageFromProf` if provided. If `initAssessmentSlug`, create a `ProfessionalsAssessment` and notify+email the user (`scaleSuggestedByProfessional`). Save appointment. Create APPOINTMENT_ACCEPTED notification (deleting the APPOINTMENT_REQUESTED one) + **email the user**.
- **200:** `{ data: { appointment } }`.

### POST /prof/suggest-scale  *(auth: prof)*
- **Body:** `{ userId, clientId, assessmentSlug }`.
- **Logic:** load user (404); create `ProfessionalsAssessment{user,client,prof,assessmentSlug}`; notify+email the user (`scaleSuggestedByProfessional`).
- **201:** `{ data: { assessmentId } }`.

### GET /prof/scales/:clientId  *(auth: prof)* → all `ProfessionalsAssessment{client}` newest first → `{ data:{ scales } }`.
### GET /prof/assessment/:assessmentId  *(auth: prof)* → load assessment; mark SCALE_FILLUP_BY_USER notification seen → `{ data:{ scale } }`.

---

# /admin
### GET /admin/professionals  *(no auth)* ⚠
- Renders `views/professionals.ejs` with all professionals — a table with an **Approve** button on unverified rows. The button (`public/scripts/approve-professionals.js`) `POST`s `/prof/approve {profId}` and swaps the cell to "Approved" on success.

---

# /notifications

Role is taken from the URL param: `:role` ∈ `u` (→ user) | `p` (→ prof). Each route resolves the role then runs `verifyToken(role)`.

### GET /notifications/unread-count/:role  *(auth)*
- `NotificationService.getUnreadNotificationsCount(_id, isUser, isProfessional)` → counts `{user|prof, hasSeen:false, for:role}`.
- **200:** `{ data: { unreadNotificationCount } }`.

### GET /notifications/all/:role?page=N  *(auth)*
- `getNotifications`: query by `{user|prof, for:role}`; page-1 also returns `numberOfNotifications`; populate `prof user(name)`, `appointment(dateByProfessional)`, `assessment(assessmentSlug)`; newest first, LIMIT 10.
- **200:** `{ data: { numberOfNotifications?, notifications } }`.

### GET /notifications/seen/:notificationId/:role  *(auth)*
- `seenNotificationById` → set `hasSeen:true`.
- **200:** `{ data: {} }`.

---

## Endpoint → client mapping

The client builds requests in `App/services/api.js` (`ApiDefinitions`) using URLs from `App/services/endpoints.js`. Per-screen usage is in the `screens/*.md` docs. Notable client/endpoint facts:
- `getNotificationsCount`/`getNotifications` pick the `/u` or `/p` variant by redux role.
- Bare-object endpoints (`/user/homepage`, `/user/profile/all`, `/user/professionals`'s wrapper) — note that `ApiExecutor` returns `response.data.data`; endpoints returning a bare object (e.g. `/user/homepage`) are therefore consumed by screens that call axios more directly or read `response.data`. Verify each consumer in the screen docs when rebuilding and **standardise the envelope** (recommended: always `{data:{…}}`).

## Server-logic quirks to decide on (rebuild)
- Hardcoded SMTP creds in `services/email.js`.
- `getScaleResult` not implemented.
- `controllers/user.js` `getNumberOfNotifications`/`unreadNotifications` reference non-existent `ProfAssessment.hasSeen` and `p.assessmentId`/`p.user`/`p.prof` populate paths that don't match the schema (`path: MODEL_NAME.USER` is wrong) — these handlers are **not wired to active routes** but exist; ignore/rewrite.
- Several `/user/all`, `/user/userInfo`, `/prof/allProf`, `/prof/user-profile/:id`, `/prof/primary-test-details/:id`, `/admin/professionals`, `/prof/approve` are **unauthenticated**. Add auth/authorization in the rebuild.
