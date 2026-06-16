# Screen Spec 01 — User Onboarding & Authentication

This document is a behavioral specification of the **user-side onboarding and authentication flow** of the "Quality Life / QLife" React Native (Expo) app, written so the screens can be rebuilt on a new tech stack without reading the original source.

It covers these screens (in flow order):

1. Welcome
2. UserLogin (Login)
3. UserRegistrationConsent (+ `Consent` component)
4. Register
5. AdditionalInformation
6. StartingGuideline (onboarding guideline)
7. ForgetPassword
8. EmailVerification

> Professional (PROF) screens are out of scope here; they are referenced only where the user flow links to them.

---

## 0. Shared infrastructure (read this first)

### 0.1 Route-name constants (`App/navigation/constants.js`)

Constants object maps a logical key → the actual route-name string registered in the navigator. Relevant keys for this flow:

| Constant key | Route string |
|---|---|
| `WELCOME` | `"Welcome"` |
| `LOGIN` | `"Login"` |
| `REGISTER` | `"Register"` |
| `USER_REGISTER_CONSENT` | `"UserRegisterConsent"` |
| `REGISTER_WITH_EXTRA_INFORMATION` | `"AdditionalInformation"` |
| `ONBOARDING_GUIDELINE` | `"StartingGuideline"` |
| `HOMEPAGE` | `"Homepage"` |
| `FORGET_PASSWORD` | `"FORGET_PASSWORD"` |
| `EMAIL_VERIFICATION_PAGE` | `"EMAIL_VERIFICATION_PAGE"` |
| `PROF_LOGIN` | `"LoginPro"` |
| `PROF_REGISTRATION_CONSENT` | `"RegisterConsentPro"` |
| `PROF_HOMEPAGE` | `"ProHomepage"` |
| `SPECIAL_LOGOUT_ACTION` | `":: logout ::"` |
| `GO_TO_BACK` | `":: go back ::"` |

> Note the literal route strings `FORGET_PASSWORD` and `EMAIL_VERIFICATION_PAGE` (key == value), unlike the others.

### 0.2 Roles (`App/utils/roles.js`)

```
RoleEnum = { ADMIN: 'ADMIN', USER: 'user', PROFESSIONAL: 'professional' }
```

- `isUser(role)` → `role === 'user'`
- `isProfessional(role)` → `role === 'professional'`
- `selectHomepageByRole(page, role)`: if `page === HOMEPAGE` and role is professional → returns `PROF_HOMEPAGE`; if `page === PROF_HOMEPAGE` and role is user → returns `HOMEPAGE`; else returns `page` unchanged.

### 0.3 Auth Redux slice (`state.auth`, reducer `App/redux/reducers/auth.js`)

Shape: `{ role, accessToken, refreshToken }` (all initially `null`).
- `SIGN_IN` (created by `setAuthToken(role, accessToken, refreshToken)` in `redux/utils.js`) sets all three.
- `SIGN_OUT` resets to initial.
- `setAuthToken` payload `{ role, accessToken, refreshToken }`.

User profile is a separate slice; `storeUserProfile(user)` (thunk in `redux/actions/user.js`) dispatches `GET_PROFILE` with `{...user}`.

### 0.4 `useHelper()` / `ApiExecutor` (`App/contexts/helper/index.js`)

`useHelper()` returns `{ logout, ApiExecutor, refreshNotificationCount, redirectToHomepage }`.

**`ApiExecutor({ endpoint, method='GET', payload={}, headers={} })`** — the single HTTP wrapper used by every screen below. Behavior:

1. Sends `axios({ url, method, headers, data: payload })` with headers `Content-Type: application/json` + `Authorization: Bearer <accessToken>` (token read from `state.auth`).
2. On success returns `{ success: true, data: response.data.data }` (note: **unwraps `.data.data`** — server envelope is `{ data: {...} }`).
3. On error inspects `error.response`:
   - **`401` + `type === 'EmailNotVerified'`** → `ToastAndroid.show('Please verify your email')`, reads `error.response.data.errors[0].data` for `{ accountType, email }`, then `navigation.navigate(EMAIL_VERIFICATION_PAGE, { accountType, email })`. Returns error response.
   - **`401` + `type` starts with `'INCOMPLETE_PROFILE:'`** → parses step from `INCOMPLETE_PROFILE:STEP:n`. If professional: step 1→`PROF_REGISTER_STEP_2`, 2→`PROF_REGISTER_STEP_3`, 3→`PROF_REGISTER_STEP_4`, else→`PROF_HOMEPAGE`. If user: navigates to `REGISTER_WITH_EXTRA_INFORMATION`. Returns error response.
   - **`401` + `type === 'InvalidToken'`** → token refresh loop (max 3 attempts) calling `refreshTokener({ refreshToken })` (POST `/auth/refresh-token`). On success dispatches `setAuthToken(role, newAccess, newRefresh)` and retries the original request. If all attempts fail → `ToastAndroid.show('Logging out...')` + `logout()` and returns `undefined`.
   - Otherwise returns `sendErrorResponse(error)` → `{ success: false, status, type, error: { message } }` where `message` joins `errors[].message` or falls back to `error.response.data.message`.

**`logout()`** dispatches `SIGN_OUT`, `PROF_SIGN_OUT`, `DELETE_PROFILE`, `DELETE_ALL_PROF_REQUEST`, `RESET_NOTIFICATION_COUNT`; then `navigation.reset({ index:0, routes:[{name:WELCOME},{name: role===professional?PROF_LOGIN:LOGIN}] })` and closes the drawer. Important: the route pushed depends on `role` **before** sign-out (state still readable in the closure).

**`redirectToHomepage()`** → `navigation.navigate(HOMEPAGE)` if user, else `PROF_HOMEPAGE`.

> Quirk: `ApiExecutor` is memoized on `[role, accessToken]`. The `EmailNotVerified`/`IncompleteProfile` handlers use `navigation.navigate` (push), not `replace`/`reset`, so a back stack can build up.

### 0.5 `useBackPress(screenName, previousPage = null)` (`App/contexts/BackPress.js`)

Hook every screen below calls to override the Android hardware back button. On back press:
- Resolves `backScreen = backScreenMap[screenName]`.
- If `backScreen` or `previousPage` equals `SPECIAL_LOGOUT_ACTION` → `logout()`.
- Else if either equals `GO_TO_BACK` → `navigation.goBack()`.
- Else `target = previousPage || backScreen`; `destination = selectHomepageByRole(target, role)`; `navigation.replace(destination)` (falls back to `navigate` on failure). Returns `true` (consumes the event).

`backScreenMap` (`App/navigation/backScreenMap.js`) entries relevant here:

| Screen (constant) | Back target |
|---|---|
| `LOGIN` | `WELCOME` |
| `REGISTER` | `WELCOME` |
| `HOMEPAGE` | `WELCOME` |
| `REGISTER_WITH_EXTRA_INFORMATION` | `SPECIAL_LOGOUT_ACTION` |
| `ONBOARDING_GUIDELINE` | `SPECIAL_LOGOUT_ACTION` |
| `FORGET_PASSWORD` | `GO_TO_BACK` |
| `EMAIL_VERIFICATION_PAGE` | `WELCOME` |
| `USER_REGISTER_CONSENT` | `GO_TO_BACK` |

### 0.6 Header config (`App/navigation/StackNavigator.js`)

`initialRouteName="Welcome"`. Default `screenOptions`: header bg `colors.primary`, height 60, white title (fontSize 20, centered), white tint, `headerBackTitle: 'Back'`, and a default `headerLeft` = a `backburger` MaterialCommunityIcon that **opens the drawer**.

`dontShowHeader` = `{ headerShown: false }`.

`safeTransit({navigation, route, role})`: if `route.params.goToBack` set → uses that; else looks up `backScreenMap[route.name]`; then `replaceNavigation` (which does `navigation.replace(selectHomepageByRole(target, role))`, with `GO_TO_BACK` → `goBack()`, and `navigate` fallback). Used by some `headerLeft` handlers below.

### 0.7 API definitions used in this flow (`App/services/api.js` + `endpoints.js`)

`BaseUrl` is from `App/config/BaseUrl`. All endpoints below are `` `${BaseUrl}<path>` ``.

| ApiDefinitions method | HTTP | Resolved path | Payload / query |
|---|---|---|---|
| `userLogin({payload})` | POST | `/user/sign-in` | body `{ email, password }` |
| `registerAsUser({payload})` | POST | `/user/sign-up` | body `{ email, password }` |
| `additionalInfo({payload})` | POST | `/user/add-info` | body (see AdditionalInformation) |
| `userProfile()` | GET | `/user/all-informations` | — |
| `getProfessionalsProfile()` | GET | `/prof/all-informations` | — |
| `sendEmailForOtpVerification({email,accountType,useCase})` | GET | `/auth/verify-email?email=&accountType=&useCase=` | query string |
| `verificationByOtp({email,otp,accountType,useCase})` | GET | `/auth/verify-otp?email=&otp=&accountType=&useCase=` | query string |
| `resetPasswordAfterForgetPassword({payload})` | POST | `/auth/update-password-with-otp` | body `{ password, email, accountType }` |
| `refreshTokener({refreshToken})` | POST | `/auth/refresh-token` | body `{ refreshToken }` |

> The `method` defaults to `GET` in `ApiExecutor` when a definition omits it (e.g. `userProfile`, `sendEmailForOtpVerification`, `verificationByOtp`).

### 0.8 Shared UI components

- **`Container`** (`components/Auth/Container.js`): outer `ScrollView` (white bg) wrapping a `LinearGradient` (colors `['#373b44', '#4286f4']`, start `[0,0]` end `[0.7,1]`).
- **`TopHeading`** ({heading, subHeading?, height=180}): centered white heading (28px bold). If `height===180 && !subHeading`, height becomes 170. Optional subheading rendered as `(subHeading)`.
- **`AuthIcon`**: centered logo `assests/images/new_logo.png` (170×130).
- **`EndOptions`** ({title1,title2,title3,onPress1,onPress2}): row of `title1`+underlined `title2` (both fire `onPress1`); separate underlined `title3` fires `onPress2`.
- **`TextInput`** (`components/TextInput.js`): icon + input; props `icon`, `placeholder`, `onChangeText`, `keyboardType`, `textContentType`, `autoCapitalize`, `autoCorrect`, `width`, `style`.
- **`Picker`**: dropdown with `placeholder`, `items` (`{label,value}[]`), `selectedItem`, `onSelectItem`, `onChange`, `name`, `icon`.
- **`Loader`** ({visible, style}): spinner shown when `visible`.
- **`ErrorButton`** ({visible, title, style, textStyle}): renders `title` as an error-styled box when `visible`.
- **`SubmitButton`** ({title, onPress, visible, disabled, style, textStyle}): primary button.
- **`useFormFields(initialState)`** (`components/HandleForm.js`): returns `{ formFields, setFormFields, createChangeHandler, resetForm }`. `createChangeHandler(text, key)` does `setFormFields(prev => ({...prev, [key]: text}))`. **Note signature: `(text, key)`** — call sites pass `createChangeHandler(text, 'fieldName')`.

---

## 1. Welcome

File: `App/screens/pages2024/Welcome/Welcome.js` (exports named `Welcome`). `Welcome.style.js` exists in the same folder but is **NOT imported** — the component defines its own inline `StyleSheet` (style file is dead/unused; note its `headerText` 45px differs from the used 30px).

### 1.1 Purpose
App entry / splash-like landing. Shows brand imagery + app description and a single "enter app" button. If the user already has a session, tapping the button silently routes them into their homepage instead of the login screen.

### 1.2 Route & header
- Route: `"Welcome"` (`constants.WELCOME`). Registered as `initialRouteName`.
- Header: **hidden** (`dontShowHeader`). No header title, no header-left.

### 1.3 Navigation INTO
- App start (initial route).
- `logout()` resets the stack to `[Welcome, Login|LoginPro]` (Welcome is index 0).
- `useBackPress` back targets from Login/Register/Homepage resolve to Welcome.
No params consumed.

### 1.4 UI content
- **ImageSlider**: `react-native-swiper` (loop, autoplay, no pagination dots) cycling two images `assests/images/Slide1.png` and `Slide3.png`. Occupies top 45% height.
- Header text: **"কোয়ালিটি লাইফ"** (30px, bold, primary, centered).
- Sub-header (justified, 16px): **"মানসিক স্বাস্থ্য সম্পর্কিত যেকোনো তথ্য এবং বিভিন্ন টেস্ট আপনি এই অ্যাপ থেকে পাবেন। বিভিন্ন চিকিৎসক এবং স্বাস্থ্যকেন্দ্রে আপনি এই অ্যাপটি থেকে যোগাযোগ করতে পারবেন।"**
- `Loader` shown while `isLoading`.
- `AppButton` title **"অ্যাপে প্রবেশ করুন"** (secondary bg, uppercase text). `visible={!isLoading}` (hidden while loading).

No form fields.

### 1.5 Local state
- `isLoading` (bool) — toggled around the redirection check.
- Derived: `isAuthenticated = !!role`.

### 1.6 Redux
- Reads `state.auth.role`.
- Writes: `storeUserProfile(user)` (GET_PROFILE) or `storeProfessionalsProfile(prof)` after profile fetch.

### 1.7 API calls
- If authenticated as user: `ApiExecutor(ApiDefinitions.userProfile())` → GET `/user/all-informations`. On success dispatch `storeUserProfile(response.data.user)`.
- If authenticated as professional: `ApiExecutor(ApiDefinitions.getProfessionalsProfile())` → GET `/prof/all-informations`. On success dispatch `storeProfessionalsProfile(response.data.prof)`.
- On `!success`, the function `return`s (button press just stops; no error UI). 401/refresh/incomplete-profile handled inside `ApiExecutor`.

### 1.8 Navigation OUT (button `onPress = authNavigate(constants.LOGIN)`)
Logic: set loading → `tokenBasedRedirection()` → clear loading.
- `tokenBasedRedirection` returns `false` immediately if not authenticated.
- If user & profile fetch succeeds → `navigation.navigate(HOMEPAGE)`, returns `true`.
- If professional & profile fetch succeeds → `navigation.navigate(PROF_HOMEPAGE)`, returns `true`.
- On profile failure it `return`s `undefined` (note: **not `false`**).
- After: `if (typeof redirectionHandled === 'boolean' && !redirectionHandled) navigation.navigate(LOGIN)`. So the fallback to **Login** only happens when redirection explicitly returned `false` (i.e. unauthenticated). If a profile fetch failed (`undefined`), neither homepage nor login navigation occurs — button effectively no-ops.

**Hardware back**: `BackHandler` listener — if focused and on Welcome → `BackHandler.exitApp()` (exits the app); otherwise lets default happen.

### 1.9 Edge cases / quirks
- Authenticated-but-profile-fails → dead button (no nav, no error message). 
- Uses `navigate` not `replace`, so going to Homepage keeps Welcome underneath.
- Two separate StyleSheets; the `.style.js` file is unused.

---

## 2. UserLogin (Login)

File: `App/screens/pages2024/UserLogin/UserLogin.js` (named export `UserLogin`) + `UserLogin.style.js`.
`SCREEN_SIZE = constants.LOGIN`.

### 2.1 Purpose
Email/password login for normal users. On success stores tokens + profile and routes to onboarding (new user) or homepage.

### 2.2 Route & header
- Route: `"Login"` (`constants.LOGIN`). Component is `UserLogin`.
- Header: **hidden** (`dontShowHeader`). The screen renders its own `TopHeading`.

### 2.3 Navigation INTO
- From Welcome (fallback `navigate(LOGIN)`).
- From Register `EndOptions` "লগইন করুন" (`navigate(LOGIN)`).
- From ForgetPassword on success for user (`replace(LOGIN)`).
- From `logout()` reset (for user role).
No params consumed.

### 2.4 UI content
- `Container` + `TopHeading heading="অ্যাপে প্রবেশ করুন"` + `AuthIcon`.
- **Email** `TextInput`: icon `email`, placeholder **"ইমেইল"**, `keyboardType="email-address"`, `textContentType="emailAddress"`, no autocap/autocorrect. Bound via `createChangeHandler(text,'email')`.
- **Password** `TextInput`: icon `lock`, placeholder **"পাসওয়ার্ড"**, `textContentType="password"`. Bound to `'password'`. (No `secureTextEntry` prop passed at call site — masking depends on `TextInput` internals.)
- **"পাসওয়ার্ড ভুলে গিয়েছেন?"** link (right-aligned, primary, bold) → forgot password.
- `Loader` while loading; `ErrorButton` when `error && !isLoading`; `SubmitButton` title **"লগইন করুন"**, `visible={!isLoading}`.
- `EndOptions`: title1 **"আপনার কি অ্যাকাউন্ট নেই?"**, title2 **"রেজিস্ট্রেশন করুন"**, title3 **"প্রফেশনাল হিসেবে লগইন করুন"**.

### 2.5 Form validation (`submitLoginForm`)
1. If email or password empty → error **"ফর্মটি সঠিকভাবে পূরণ করুন"**, return.
2. Else if `!validator.isEmail(email)` → error **"ইমেলটি বৈধ নয়"**, return.
3. Then `email = email.trim().toLowerCase()`, `password = password.trim()`.

### 2.6 Local state
- `formFields = { email:'', password:'' }` (via `useFormFields`).
- `error`, `isLoading`, `userLoginDone` (bool), `loginResponse` (object).
- Reads `state.auth.accessToken`.

### 2.7 Redux
- Reads `accessToken`.
- Writes `setAuthToken(USER, accessToken, refreshToken)` (SIGN_IN) and `storeUserProfile(user)` (GET_PROFILE).

### 2.8 API calls
1. `ApiExecutor(ApiDefinitions.userLogin({payload:{email,password}}))` → POST `/user/sign-in`. On `!success`: `setError(error.message)` and **return** (note: `isLoading` is NOT reset here directly; see effect below). On success: `dispatch(setAuthToken(USER, data.accessToken, data.refreshToken))`, then after `setTimeout(500ms)` set `userLoginDone=true` and `loginResponse=data`.
   - Response data consumed: `data.accessToken`, `data.refreshToken`, `data.isNewUser`.
2. Effect on `[loginResponse, userLoginDone, accessToken]`: once all truthy → `ApiExecutor(ApiDefinitions.userProfile())` (GET `/user/all-informations`), `setIsLoading(false)`. On success `dispatch(storeUserProfile(data.user))`.

### 2.9 Navigation OUT
- After profile fetch in the effect:
  - if `loginResponse.isNewUser` → `navigation.replace(REGISTER_WITH_EXTRA_INFORMATION)`.
  - else → `navigation.replace(HOMEPAGE)`.
- "পাসওয়ার্ড ভুলে গিয়েছেন?" → `navigation.navigate(FORGET_PASSWORD, { accountType: RoleEnum.USER })`.
- EndOptions onPress1 → `navigation.navigate(USER_REGISTER_CONSENT)`.
- EndOptions onPress2 → `navigation.navigate(PROF_LOGIN)`.
- **Hardware back** (`useBackPress(LOGIN)`): `backScreenMap[LOGIN]=WELCOME`, no previousPage → `navigation.replace(WELCOME)`.

### 2.10 Quirks / edge cases
- `useEffect([error])`: whenever `error` becomes truthy, `setIsLoading(false)`. This is how loading is cleared after a login failure (`submitLoginForm` itself doesn't reset it on the login-failure path).
- The 500 ms `setTimeout` artificially gates profile fetch behind a state flag + token write — relies on the auth-token effect dependency to fire.
- Tokens are stored even if the subsequent profile fetch fails (user is "logged in" in redux but stays on Login).

---

## 3. UserRegistrationConsent (+ `Consent` component)

Files: `App/screens/UserRegistrationConsent.js` (screen, internal component name `Consent`, default export) which renders `RegConsent` = `App/components/Consent.js`.

### 3.1 Purpose
Static consent / privacy statement shown before user registration. User reads it and taps a button to proceed to the Register form.

### 3.2 Route & header
- Route: `"UserRegisterConsent"` (`constants.USER_REGISTER_CONSENT`).
- Header (StackNavigator): title **"মানসিক স্বাস্থ্য মূল্যায়ন"**, `headerLeft: () => undefined` (no back button in header).

### 3.3 Navigation INTO
- From UserLogin EndOptions "রেজিস্ট্রেশন করুন" → `navigate(USER_REGISTER_CONSENT)`.
No params.

### 3.4 UI content (rendered by `Consent` component)
- `ScrollView` (white, padded).
- Header text (28px bold, centered): **"সম্মতিপত্র"** (passed as `header`).
- Description (16px justified) — exact text passed from the screen:
  > "এই মোবাইল এপ্লিকেশনটি এমনি একটা ব্যাতিক্রমধর্মী উদ্যোগ যার মাধ্যমে আপনার মানসিক স্বাস্থ্যের অবস্থা যাচাই করতে পারবেন ও তার সাথে মানসিক অবস্থা উন্নয়নের কিছু সহজ পদ্ধতি প্রদান করা হবে। এছাড়া প্রয়োজনে মানসিক স্বাস্থ্য সেবা প্রদানকারীর সাথে আপনার যোগাযোগ করার ব্যবস্থাও রয়েছে। এই এপ্লিকেশনটি ব্যবহার করতে গিয়ে আপনি যেই তথ্যগুলো প্রদান করবেন তা আমাদের কাছে খুবই গুরুত্বপূর্ণ এবং অত্যন্ত সতর্কতার সাথে তথ্যগুলোর গোপনীয়তা বজায় রাখা হবে। পরিচয় সম্পূর্ণ গোপন রেখে এই এপ্লিকেশনটির ব্যবহারকারীদের তথ্যগুলো একটি গবেষনা কাজে ব্যবহৃত হবে। এই তথ্য গুলো বিশ্লেষণ করার জন্য কেবলমাত্র তিন জন গবেষক ব্যতিত অন্যকেউ দেখতে পাবে না।"
- `Button` title **"রেজিস্ট্রেশন করুন"** (primary, full width). `accessibilityLabel` set to the header/description/button text.

No form fields, no checkbox (consent is implicit by tapping the button).

### 3.5 Local state
None (component is stateless aside from navigation hook).

### 3.6 Redux
None.

### 3.7 API calls
None.

### 3.8 Navigation OUT
- Button `onPress` → `navigation.navigate(redirectTo)` where `redirectTo = constants.REGISTER` → navigates to `"Register"`. Wrapped in try/catch that only `console.error`s.
- **Hardware back** (`useBackPress(USER_REGISTER_CONSENT)`): `backScreenMap[USER_REGISTER_CONSENT] = GO_TO_BACK` → `navigation.goBack()`.

### 3.9 Quirks
- `Consent` component has an unused `styles.header` block (only `headerText` used).
- `handlePress` is `async` but does nothing async.

---

## 4. Register

File: `App/screens/Register.js`. `SCREEN_SIZE = constants.REGISTER`.

### 4.1 Purpose
Creates a new user account (email + password). On success stores tokens + a (partial) profile, then sends the user to the AdditionalInformation step.

### 4.2 Route & header
- Route: `"Register"` (`constants.REGISTER`).
- Header: **hidden** (`dontShowHeader`). Renders own `TopHeading`.

### 4.3 Navigation INTO
- From UserRegistrationConsent button (`navigate(REGISTER)`).
No params.

### 4.4 UI content
- `Container` + `TopHeading heading="রেজিস্ট্রেশন করুন"` + `AuthIcon`.
- **Email** `TextInput`: icon `email`, placeholder **"ইমেইল"**, email keyboard.
- **Password** `TextInput`: icon `lock`, placeholder **"পাসওয়ার্ড"**.
- **Confirm password** `TextInput`: icon `lock`, placeholder **"পুনরায় পাসওয়ার্ড দিন "** (trailing space in source).
- `Loader`, `ErrorButton` (when `error && !isLoading`), `SubmitButton` title **"অ্যাকাউন্ট তৈরি করুন"** (`visible={!isLoading}`).
- `EndOptions`: title1 **"ইতোমধ্যে একটি অ্যাকাউন্ট আছে?"**, title2 **"লগইন করুন"**, title3 **"প্রফেশনাল হিসেবে যোগদান করুন"**.

### 4.5 Form validation (`submitLoginForm`)
1. Empty email or password → **"ফর্মটি সঠিকভাবে পূরণ করুন"**, return.
2. `!validator.isEmail(email)` → **"ইমেলটি বৈধ নয়"**, return.
3. `password !== confirmPassword` → **"পাসওয়ার্ড মেলেনি"**, return.
4. Normalizes: `email.trim().toLowerCase()`, `password.trim()`, then `delete payload.confirmPassword`.

### 4.6 Local state
- `formFields = { email:'', password:'', confirmPassword:'' }`.
- `error`, `isLoading`.

### 4.7 Redux
- Writes `storeUserProfile(response.data.user)` (GET_PROFILE) and `setAuthToken(USER, accessToken, refreshToken)` (SIGN_IN).

### 4.8 API calls
- `ApiExecutor(ApiDefinitions.registerAsUser({payload:{email,password}}))` → POST `/user/sign-up`. `setIsLoading(true)` before, `false` after.
  - On `!success`: `setError(response.error.message)`, return.
  - On success: dispatch `storeUserProfile(data.user)`, `setAuthToken(USER, data.accessToken, data.refreshToken)`.

### 4.9 Navigation OUT
- On success → `navigation.navigate(REGISTER_WITH_EXTRA_INFORMATION)`.
- EndOptions onPress1 → `navigate(LOGIN)`.
- EndOptions onPress2 → `navigate(PROF_REGISTRATION_CONSENT)`.
- **Hardware back**: Register defines **its own** `BackHandler` listener `handleBackButtonClick` → `navigation.reset({index:0, routes:[{name: WELCOME}]})`. (It does NOT call `useBackPress`; `backScreenMap[REGISTER]=WELCOME` is unused here. Net effect is equivalent — back goes to Welcome, but via a full reset.)

### 4.10 Quirks
- Function still named `submitLoginForm` (copy/paste from Login).
- Tokens + profile are stored on register success; navigation forward to additional-info is a `navigate` (Register remains in stack until the reset/back).

---

## 5. AdditionalInformation

File: `App/screens/AdditionalInformation.js`. `SCREEN_NAME = constants.REGISTER_WITH_EXTRA_INFORMATION`.

### 5.1 Purpose
Collects demographic / location profile after account creation (step required to complete a user profile). Server enforces this via `INCOMPLETE_PROFILE:STEP:n` (handled in `ApiExecutor` → routes back here for users).

### 5.2 Route & header
- Route: `"AdditionalInformation"` (`constants.REGISTER_WITH_EXTRA_INFORMATION`).
- Header: **hidden** (`dontShowHeader`). Renders own `TopHeading heading="প্রয়োজনীয় তথ্য" height={150}`.

### 5.3 Navigation INTO
- From Register on success (`navigate`).
- From UserLogin on success if `isNewUser` (`replace`).
- From `ApiExecutor` incomplete-profile handler for user role (`navigate`).
No explicit params consumed.

### 5.4 UI content / fields
Loaded district data from `App/data/RegionInformation.json` (`Region.districts`). Cascading address pickers.

| UI element | Type | Placeholder (Bangla) | Binds to field | Notes |
|---|---|---|---|---|
| Name | TextInput (icon `account`) | "নাম" | `name` | textContentType name |
| Age | TextInput (icon `account-clock`, numeric) | "বয়স" | `age` | numeric keyboard |
| Gender | Picker (icon `gender-male-female-variant`) | "লিঙ্গ" | `gender` | items `genderLists` |
| Marital status | Picker (icon `card-account-details-star`) | "বৈবাহিক অবস্থা" | `maritalStatus` | items `maritalStatusLists` |
| District (জেলা) | Picker (icon `home-map-marker`) | "বর্তমান ঠিকানা (জেলা)" | `zila` | items `zillaList` (all districts) |
| Sub-district (উপজেলা) | Picker (icon `map-marker-radius`) | "বর্তমান ঠিকানা (উপজেলা)" | `upazila` | items depend on district |
| Union (ইউনিয়ন) | Picker (icon `map-marker-check`) | "বর্তমান ঠিকানা (ইউনিয়ন)" | `union` | items depend on sub-district |

Picker option lists:
- `genderLists`: পুরুষ→`Male`, মহিলা→`Female`, অন্যান্য→`Others`.
- `maritalStatusLists`: বিবাহিত→`Married`, অবিবাহিত→`Single`.

Bottom: `Loader`, `ErrorButton` (when `error && !isLoading`), `SubmitButton` title **"সাবমিট করুন"** (`visible={!isLoading}`).

### 5.5 Cascading picker logic
- `zillaHandleChange(item)`: sets `zilla=item`; builds `upozilaList` from the district's `subDistricts`; resets `upozila=null`, `union=null`.
- `upozilaHandleChange(item)`: sets `upozila=item`; builds `unionList` from selected district→subDistrict `unions`; resets `union=null`.
- Each picker also calls `createChangeHandler(value, name)` via its `onChange` prop, which is what actually writes into `formFields` (the `selectedItem`/`onSelectItem` drive display + cascade).

### 5.6 Validation (`handleFormSubmit`)
- Iterates `initialState` keys; for every key **except `union` and `upazila`**, if `formFields[key] === ''` → `fieldAbsent=true`.
- If any required field absent → error **"ফর্মটি সঠিকভাবে পূরণ করুন"**, return.
- So **union and upazila are optional**; name/age/gender/maritalStatus/zila are required.

### 5.7 Local state
- `formFields = { name, age, gender, maritalStatus, zila, upazila, union }` (all `''`).
- `error`, `isLoading`.
- Display/cascade state: `gender`, `maritalStatus`, `zilla`, `upozila`, `upozilaList`, `union`, `unionList`.

### 5.8 Redux
None (no reads/writes).

### 5.9 API call
- Payload built:
  ```
  {
    name, age, gender,
    isMarried: maritalStatus === 'Married',   // boolean
    location: { zila, upazila, union }
  }
  ```
- `ApiExecutor(ApiDefinitions.additionalInfo({payload}))` → POST `/user/add-info`. `isLoading` toggled around it.
- On `!success`: `setError(error.message)`, return.

### 5.10 Navigation OUT
- On success → `navigation.navigate(ONBOARDING_GUIDELINE)`.
- **Hardware back** (`useBackPress(REGISTER_WITH_EXTRA_INFORMATION)`): `backScreenMap` = `SPECIAL_LOGOUT_ACTION` → calls `logout()` (clears session, resets to Welcome+Login). I.e. backing out of profile-completion logs the user out.

### 5.11 Quirks
- `age` is submitted as a string (TextInput value), not parsed to number.
- `location` values come from `formFields.zila/upazila/union` which are set via `onChange`; if `onChange` wiring differs from `onSelectItem`, the cascade display and the submitted value can diverge (the Picker is responsible for keeping them in sync).

---

## 6. StartingGuideline (onboarding guideline)

File: `App/screens/pages2024/StartingGuideline/StartingGuideline.js` (named export `StartingGuideline`, also default). A `.style.js` sibling exists but is **NOT imported** — component uses its own inline styles.
`SCREEN_NAME = constants.ONBOARDING_GUIDELINE`.

### 6.1 Purpose
Final onboarding step: shows app purpose + privacy guideline, then fetches the freshly-completed profile and enters the homepage.

### 6.2 Route & header
- Route: `"StartingGuideline"` (`constants.ONBOARDING_GUIDELINE`).
- Header (StackNavigator): title **"অভিনন্দন"**, `headerLeft: () => undefined` (no header back).

### 6.3 Navigation INTO
- From AdditionalInformation on success (`navigate(ONBOARDING_GUIDELINE)`).
No params.

### 6.4 UI content
- `ScrollView` (white).
- Header (28px bold, primary, centered): **"ব্যবহারিক নির্দেশিকা"**.
- Card with two justified paragraphs (16px, `#555`):
  - P1: **"এই মোবাইল এপ্লিকেশনটি একটি ব্যাতিক্রমধর্মী উদ্যোগ যার মাধ্যমে আপনার মানসিক স্বাস্থ্যের অবস্থা যাচাই করতে পারবেন। এতে মানসিক অবস্থা উন্নয়নের সহজ পদ্ধতি প্রদান করা হয় এবং প্রয়োজনে মানসিক স্বাস্থ্য সেবা প্রদানকারীর সাথে যোগাযোগের ব্যবস্থাও রয়েছে।"**
  - P2: **"আপনার প্রদত্ত তথ্যের গোপনীয়তা বজায় রাখা আমাদের অগ্রাধিকার। তথ্যগুলো শুধুমাত্র গবেষণা কাজে ব্যবহৃত হবে এবং কেবলমাত্র তিনজন গবেষকের জন্য উপলব্ধ থাকবে। অনুগ্রহ করে প্রশ্ন এবং রেটিং মনোযোগ দিয়ে পূরণ করুন।"**
- `Loader`, `ErrorButton` (when `error && !isLoading`), `SubmitButton` title **"হোমপেইজে প্রবেশ করুন"** (`visible={!isLoading}`).

No form fields.

### 6.5 Local state
- `isLoading`, `error`.

### 6.6 Redux
- Writes `storeUserProfile(response.data.user)` (GET_PROFILE).

### 6.7 API call (`handleClick`)
- `ApiExecutor(ApiDefinitions.userProfile())` → GET `/user/all-informations`. `isLoading` toggled.
- On `!success`: `setError(error.message)`, return.
- On success: `setError(null)`, dispatch `storeUserProfile(data.user)`.

### 6.8 Navigation OUT
- On success → `navigation.replace(HOMEPAGE)`.
- **Hardware back** (`useBackPress(ONBOARDING_GUIDELINE)`): `backScreenMap = SPECIAL_LOGOUT_ACTION` → `logout()`.

### 6.9 Quirks
- The two paragraphs duplicate content already shown in the consent screen.

---

## 7. ForgetPassword

File: `App/screens/ForgetPassword.js`. `SCREEN_NAME = constants.FORGET_PASSWORD`. Default export.

### 7.1 Purpose
Multi-step (3-step) password reset by email OTP. Works for both `user` and `professional` accounts (selected by the `accountType` param). Steps: (1) enter email → send OTP, (2) enter OTP → verify, (3) set new password.

### 7.2 Route & header
- Route: `"FORGET_PASSWORD"` (`constants.FORGET_PASSWORD`).
- Header (StackNavigator): title **"পাসওয়ার্ড পরিবর্তন করুন"**, custom `headerLeft` = `HeaderBackButton` whose `onPress` calls `safeTransit({navigation, route, role})`. `safeTransit` → `backScreenMap[FORGET_PASSWORD] = GO_TO_BACK` → `navigation.goBack()` (unless `route.params.goToBack` overrides).

### 7.3 Navigation INTO
- From UserLogin "পাসওয়ার্ড ভুলে গিয়েছেন?" → `navigate(FORGET_PASSWORD, { accountType: RoleEnum.USER })`.
- (Professional login screen passes `accountType: 'professional'`.)
- **Param required: `accountType`** (`route.params.accountType`). On mount, if `accountType` not in `[USER, PROFESSIONAL]` it **throws** `new Error('Invalid account type')` (screen crashes without it).

### 7.4 UI content (by `step`)
**Step 1:**
- Email `AppTextInput`: icon `email`, placeholder **"ইমেইল"**, email keyboard, full width, primary border.
- `Loader` (emailVerificationLoading), `ErrorButton` (emailVerificationError).
- `SubmitButton` title **"Send OTP"**, `disabled={!validator.isEmail(email)}`, `visible={!emailVerificationLoading}`.

**Step 2:**
- OTP `AppTextInput`: icon `lock-outline`, placeholder **"OTP"**, `keyboardType="number-pad"`.
- `Loader` (OTPLoading), `ErrorButton` (otpError).
- `SubmitButton` title **"Verify OTP"**, `disabled={!otp}`, `visible={!OTPLoading}`.

**Step 3:**
- New password `AppTextInput`: icon `lock`, placeholder **"নতুন পাসওয়ার্ড"**.
- Confirm password `AppTextInput`: icon `lock`, placeholder **"পুনরায় পাসওয়ার্ড দিন"**.
- `Loader` (PasswordLoading), `ErrorButton` (PasswordError).
- `SubmitButton` title **"Update Password"**, `disabled={!newPassword || !confirmPassword || newPassword !== confirmPassword}`, `visible={!PasswordLoading}`.

### 7.5 Local state
- `step` (1|2|3, init 1).
- `email`, `emailVerificationLoading`, `emailVerificationError`.
- `otp`, `OTPLoading`, `otpError`.
- `newPassword`, `confirmPassword`, `PasswordLoading`, `PasswordError`.

### 7.6 Redux
None.

### 7.7 API calls
**Step 1 — `handleMessageVerification`:**
- Guard: `!validator.isEmail(email)` → error **"Invalid email address"**, return.
- `ApiExecutor(ApiDefinitions.sendEmailForOtpVerification({ email, accountType, useCase: 'forget-password' }))` → GET `/auth/verify-email?email=&accountType=&useCase=forget-password`. Loading toggled.
- On `!success`: set `emailVerificationError`. On success: `setStep(2)`.

**Step 2 — `handleOtpVerification`:**
- Guard: `!validator.isNumeric(otp)` → error **"OTP must be a number"**, return.
- `ApiExecutor(ApiDefinitions.verificationByOtp({ email, otp, accountType, useCase: 'forget-password' }))` → GET `/auth/verify-otp?...`. Loading toggled.
- On `!success`:
  - if `response.type === 'OTP_EXPIRED'` → set otpError **"আপনার OTP কোডটি বাতিল হয়ে গিয়েছে। পুনরায় একটি কোড পাঠানো হয়েছে।"** then `await handleMessageVerification()` (auto-resends OTP, which on success re-`setStep(2)`).
  - else set `otpError = response.error.message`.
  - return.
- On success: `setStep(3)`.

**Step 3 — `handleChangePassword`:**
- Guard: `newPassword !== confirmPassword` → error **"Passwords do not match"**, return.
- Payload `{ password: newPassword, email, accountType }`.
- `ApiExecutor(ApiDefinitions.resetPasswordAfterForgetPassword({ payload }))` → POST `/auth/update-password-with-otp`. Loading toggled.
- On `!success`: set `PasswordError`.

### 7.8 Navigation OUT
- On step-3 success: if `isUser(accountType)` → `navigation.replace(LOGIN)`, else → `navigation.replace(PROF_LOGIN)`.
- **Hardware back** (`useBackPress(FORGET_PASSWORD, GO_TO_BACK)`): previousPage `GO_TO_BACK` → `navigation.goBack()`.
- Header back → same `goBack()` via `safeTransit`.

### 7.9 OTP / business logic
- OTP must be numeric only (`validator.isNumeric`); no fixed length enforced client-side.
- Expired OTP auto-triggers a resend and shows a Bangla notice while staying on step 2.
- No client-side cooldown/timer; resend is implicit (only on expiry path).
- These OTP endpoints go through `ApiExecutor`, so they carry the `Authorization: Bearer` header even though the user is unauthenticated during password reset (token is `null`) — server presumably ignores it for these routes.

### 7.10 Quirks
- The component performs the `accountType` validity check during render and throws — there is no error boundary shown; navigating here without a valid `accountType` param will crash the screen.
- Step-3 password has no length/strength validation, only equality.

---

## 8. EmailVerification

File: `App/screens/EmailVerification.js`. `SCREEN_NAME = constants.EMAIL_VERIFICATION_PAGE`. Default export.

### 8.1 Purpose
Verifies a user's (or professional's) email via OTP. Reached automatically when any API call returns `401 EmailNotVerified`. On entry it auto-sends an OTP; user enters it to verify, then is routed to their homepage. Also offers a Logout escape.

### 8.2 Route & header
- Route: `"EMAIL_VERIFICATION_PAGE"` (`constants.EMAIL_VERIFICATION_PAGE`).
- Header (StackNavigator): title **"অ্যাকাউন্ট ভেরিফাই করুন"**, custom `headerLeft` = `HeaderBackButton` → `safeTransit({navigation, route, role})`. `safeTransit` → `backScreenMap[EMAIL_VERIFICATION_PAGE] = WELCOME` → `navigation.replace(WELCOME)` (unless `route.params.goToBack`).

### 8.3 Navigation INTO
- From `ApiExecutor` `EmailNotVerified` handler: `navigation.navigate(EMAIL_VERIFICATION_PAGE, { accountType, email })` (values from `error.response.data.errors[0].data`).
- **Params required: `accountType` and `email`** (`router.params` — read directly; no guard, so missing params will throw on access).

### 8.4 UI content
- Instruction `AppText` (bold, justified):
  > "`{email}` এ একটি ভেরিফিকেশন কোড পাঠানো হয়েছে। দয়া করে আপনার ইনবক্স চেক করুন এবং কোডটি নিচের ঘরে লিখুন।"
  (`{email}` interpolated.)
- OTP `AppTextInput`: icon `lock-outline`, placeholder **"OTP"**, `keyboardType="number-pad"`, full width, primary border.
- `Loader` (OTPLoading), `ErrorButton` (otpError).
- `SubmitButton` title **"Verify OTP"**, `disabled={!otp}`, `visible={!OTPLoading}`.
- Bottom-anchored `SubmitButton` title **"Logout"** (danger bg) → `logout()`.

### 8.5 Local state
- `otp`, `OTPLoading`, `otpError`.
- Const `useCase = 'email-verification'`.
- From route: `accountType`, `email`.

### 8.6 Redux
None directly (uses `useHelper`).

### 8.7 API calls
**Auto-send on focus — `sendOtp` (called in `useEffect` keyed on `isFocused`):**
- When `isFocused`, `ApiExecutor(ApiDefinitions.sendEmailForOtpVerification({ useCase:'email-verification', email, accountType }))` → GET `/auth/verify-email?...&useCase=email-verification`.
- On `!success`: `setOtpError(error.message)`. (No loading indicator for the auto-send.)

**Verify — `handleOtpVerification`:**
- Guard: `!validator.isNumeric(otp)` → error **"OTP must be a number"**, return.
- `ApiExecutor(ApiDefinitions.verificationByOtp({ email, otp, accountType, useCase:'email-verification' }))` → GET `/auth/verify-otp?...`. `OTPLoading` toggled.
- On `!success`:
  - if `response.type === 'OTP_EXPIRED'` → set otpError **"আপনার OTP কোডটি বাতিল হয়ে গিয়েছে। পুনরায় একটি কোড পাঠানো হয়েছে।"** then `await sendOtp()` (resend).
  - else set `otpError = response.error.message`.
  - return.

### 8.8 Navigation OUT
- On verify success → `redirectToHomepage()` from `useHelper`: navigates to `HOMEPAGE` (user) or `PROF_HOMEPAGE` (professional) **based on `state.auth.role`**, NOT on the `accountType` param.
- Logout button → `logout()` (resets stack to Welcome + Login/LoginPro per role).
- **Hardware back** (`useBackPress(EMAIL_VERIFICATION_PAGE)`): no previousPage → `backScreenMap = WELCOME` → `navigation.replace(WELCOME)`.
- Header back → `safeTransit` → `navigation.replace(WELCOME)`.

### 8.9 OTP / business logic & quirks
- OTP auto-sent on every focus of the screen (`isFocused` effect). `sendOtp` is memoized with empty deps `[]`, so it closes over the initial `email`/`accountType`/`ApiExecutor` (fine since they don't change for this mount).
- Expired-OTP path auto-resends and shows the Bangla notice.
- `redirectToHomepage` relies on the redux `role` already being set (the user was authenticated enough to trigger `EmailNotVerified`), so role is expected to be present.
- No guard on missing `router.params` — destructuring `{ accountType, email }` from undefined params would throw.

---

## 9. End-to-end flow summary

```
Welcome ─(enter app, no session)─▶ Login
Welcome ─(enter app, has session)─▶ Homepage / ProHomepage   (replace? no: navigate)

Login ──"রেজিস্ট্রেশন করুন"──▶ UserRegisterConsent ──button──▶ Register
Login ──submit (existing user)──▶ Homepage (replace)
Login ──submit (isNewUser)──▶ AdditionalInformation (replace)
Login ──"পাসওয়ার্ড ভুলে গিয়েছেন?"──▶ ForgetPassword {accountType:user}
Login ──"প্রফেশনাল হিসেবে লগইন করুন"──▶ LoginPro

Register ──submit success──▶ AdditionalInformation (navigate)
Register ──"লগইন করুন"──▶ Login
Register ──"প্রফেশনাল হিসেবে যোগদান করুন"──▶ RegisterConsentPro

AdditionalInformation ──submit success──▶ StartingGuideline (navigate)
AdditionalInformation ──hardware back──▶ logout → Welcome+Login

StartingGuideline ──"হোমপেইজে প্রবেশ করুন"──▶ Homepage (replace)
StartingGuideline ──hardware back──▶ logout

ForgetPassword step1→2→3 ──success──▶ Login or LoginPro (replace)

EmailVerification (auto-sends OTP) ──verify success──▶ redirectToHomepage()
EmailVerification ──Logout──▶ logout → Welcome+Login
```

### Cross-cutting notes
- Every authenticated API in this flow runs through `ApiExecutor`, which transparently handles token refresh (401 InvalidToken), forced email-verification (401 EmailNotVerified → push EmailVerification), and incomplete-profile redirects (401 INCOMPLETE_PROFILE:STEP:n → AdditionalInformation for users).
- Server response envelope is `{ data: <payload> }`; `ApiExecutor` returns `<payload>` as `response.data`. Login/register payloads expose `accessToken`, `refreshToken`, `user`, and `isNewUser`. Profile payloads expose `user` (or `prof`).
- Bangla button/label strings are load-bearing UI copy and must be preserved verbatim (quoted above).
