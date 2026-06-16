# 05 — Professional Registration & Core Account Screens

Exhaustive rebuild spec for the **Professional (therapist / psychologist)** authentication, multi-step registration, homepage, profile, and account-management screens of the **Quality Life / QLife** React Native (Expo) app.

> Source root: `App/screens/prof/`. This document is intended to be sufficient to rebuild these screens **without** the original source.

---

## 0. Shared Context (read this first)

### 0.1 Roles

`App/utils/roles.js`:

```js
RoleEnum = { USER: 'user', PROFESSIONAL: 'professional', ADMIN: ... }
isUser(role)         => role === 'user'
isProfessional(role) => role === 'professional'
selectHomepageByRole(page, role):
  - if page === HOMEPAGE      && role === PROFESSIONAL => returns PROF_HOMEPAGE
  - if page === PROF_HOMEPAGE && role === USER         => returns HOMEPAGE
  - else returns page unchanged
```

### 0.2 Route name constants (`App/navigation/constants.js`)

| Constant | Route name (string) |
|---|---|
| `PROF_LOGIN` | `LoginPro` |
| `PROF_REGISTRATION_CONSENT` | `RegisterConsentPro` |
| `PROF_REGISTER_STEP_1` | `RegisterPro` |
| `PROF_REGISTER_STEP_2` | `RegisterProStep2` |
| `PROF_REGISTER_STEP_3` | `RegisterProStep3` |
| `PROF_REGISTER_STEP_4` | `RegisterProStep4` |
| `WAIT_FOR_VERIFICATION` | `AccountConfirmation` |
| `PROF_HOMEPAGE` | `ProHomepage` |
| `PROF_PROFILE` | `ProfProfile` |
| `PROF_UPDATE_PROFILE` | `ProfUpdateProfile` |
| `PROF_CLIENT_REQUEST` | `ClientRequestPro` |
| `PROFESSIONALS_CLIENT` | `ProMyClients` |
| `PROF_ASSESSMENT_TOOLS` | `ProAssessments` |
| `NOTIFICATIONS` | `Notifications` |
| `SETTINGS` | `Setting` |
| `UPDATE_PASSWORD` | `UpdatePassword` |
| `FORGET_PASSWORD` | `FORGET_PASSWORD` |
| `EMAIL_VERIFICATION_PAGE` | `EMAIL_VERIFICATION_PAGE` |
| `LOGIN` | `Login` (user login) |
| `REGISTER` | `Register` (user register) |
| `WELCOME` | `Welcome` |
| `SPECIAL_LOGOUT_ACTION` | `:: logout ::` (sentinel) |
| `GO_TO_BACK` | `:: go back ::` (sentinel) |

### 0.3 Stack header titles (`App/navigation/StackNavigator.js`)

| Route | Header title | Notes |
|---|---|---|
| `LoginPro` | *(no header)* | `options={dontShowHeader}` |
| `RegisterConsentPro` | `সম্মতিপত্র` | |
| `RegisterPro` (Step 1) | *(verify in nav file — sibling auth screens use no header; Step 1 is a full custom header inside the screen)* | |
| `AccountConfirmation` | `ধন্যবাদ` | |
| `RegisterProStep2` | `Registration - Step 2` | |
| `RegisterProStep3` | `Registration - Step 3` | |
| `RegisterProStep4` | `Pre-evaluation` | |
| `ProHomepage` | `Quality Life` (= `constants.QUALITY_LIFE`) | uses `title: constants.HOMEPAGE`’s display string `Quality Life` |
| `ProfProfile` | `My Profile` | |
| `ProfUpdateProfile` | `Update Profile` | |
| `Setting` | `সেটিংস` | |
| `UpdatePassword` | `পাসওয়ার্ড পরিবর্তন করুন` | |

### 0.4 Back-button map (`App/navigation/backScreenMap.js`)

The hardware back handler (`useBackPress`) looks up `backScreenMap[screenName]`:

| Screen | Back target |
|---|---|
| `PROF_LOGIN` | `WELCOME` |
| `PROF_REGISTRATION_CONSENT` | *(not in map — see USER_REGISTER_CONSENT-style; consent uses default goBack; not explicitly mapped — falls to “no valid target” → back is a no-op)* |
| `PROF_REGISTER_STEP_1` | `PROF_REGISTRATION_CONSENT` |
| `PROF_REGISTER_STEP_2` | `SPECIAL_LOGOUT_ACTION` → **logout** |
| `PROF_REGISTER_STEP_3` | `SPECIAL_LOGOUT_ACTION` → **logout** |
| `PROF_REGISTER_STEP_4` | `SPECIAL_LOGOUT_ACTION` → **logout** |
| `WAIT_FOR_VERIFICATION` | `WELCOME` |
| `PROF_HOMEPAGE` | `WELCOME` |
| `PROF_PROFILE` | `PROF_HOMEPAGE` |
| `PROF_UPDATE_PROFILE` | `GO_TO_BACK` → `navigation.goBack()` |
| `PROFESSIONALS_CLIENT` | `PROF_HOMEPAGE` |
| `PROF_CLIENT_REQUEST` | `PROF_HOMEPAGE` |
| `SETTINGS` | `HOMEPAGE` (resolved per-role → `PROF_HOMEPAGE` for professionals) |
| `UPDATE_PASSWORD` | `SETTINGS` |

### 0.5 `useBackPress(screenName, previousPage = null)` (`App/contexts/BackPress.js`)

Registers a `hardwareBackPress` listener. On back:

1. `backScreen = backScreenMap[screenName] || null`.
2. If `backScreen` **or** `previousPage` equals `SPECIAL_LOGOUT_ACTION` → `logout()`.
3. Else if either equals `GO_TO_BACK` → `navigation.goBack()`.
4. Else `targetScreen = previousPage || backScreen`; `destination = selectHomepageByRole(targetScreen, role)`. If no destination → log error and consume the event (no-op). Otherwise `navigation.replace(destination)` (fallback to `navigate` on error).
5. Always returns `true` (consumes the hardware back press).

This is the **only** back behavior for these screens (there is no swipe/gesture back since most auth screens hide the header). The stack header back button (where a header exists) is the default React Navigation pop unless overridden.

### 0.6 `ApiExecutor` (`App/contexts/helper/index.js`) — used by every API call

`const { ApiExecutor, logout, redirectToHomepage, refreshNotificationCount } = useHelper();`

`ApiExecutor({ endpoint, method='GET', payload={}, headers={} })`:

- Sends `axios({ url, method, headers, data: payload })` with headers
  `{ 'Content-Type': 'application/json', Authorization: 'Bearer <accessToken>' }` (accessToken from `state.auth`).
- **Success** → `sendSuccessResponse(response.data.data)` → `{ success: true, data }`. **The unwrapped payload is `response.data.data`** (note double `.data`).
- **Error handling** (all keyed off HTTP 401 + `error.response.data.type`):
  - `type === 'InvalidToken'` → token-refresh loop (up to 3 attempts via `refreshTokener({ refreshToken })`); on success re-dispatches `setAuthToken` and retries the original call; on exhaustion → toast “Logging out…” + `logout()`.
  - `type === 'EmailNotVerified'` → toast “Please verify your email”, then `navigation.navigate(EMAIL_VERIFICATION_PAGE, { accountType, email })` from `error.response.data.errors[0].data`. Returns error response.
  - `type` starts with `'INCOMPLETE_PROFILE:'` → parse `STEP:n` and, for PROFESSIONAL role, redirect:
    - `step === 1` → `PROF_REGISTER_STEP_2`
    - `step === 2` → `PROF_REGISTER_STEP_3`
    - `step === 3` → `PROF_REGISTER_STEP_4`
    - else → `PROF_HOMEPAGE`
    (For USER role → `REGISTER_WITH_EXTRA_INFORMATION`.) Returns error response.
  - Otherwise → `sendErrorResponse(error)` → `{ success: false, error: { message, ... }, status }`.
- `logout()` dispatches `SIGN_OUT`, `PROF_SIGN_OUT`, `DELETE_PROFILE`, `DELETE_ALL_PROF_REQUEST`, `RESET_NOTIFICATION_COUNT`, then `navigation.reset({ index:0, routes:[{Welcome}, {LoginPro|Login}] })` (LoginPro when role is professional) and closes the drawer.

> **Key consequence:** the *INCOMPLETE_PROFILE auto-redirect* fires from **any** prof API call when the backend rejects with `401 INCOMPLETE_PROFILE:STEP:n`. So a half-registered professional who hits e.g. `ProHomepage` data fetch will be bounced to the correct next registration step automatically.

### 0.7 Auth token persistence

`setAuthToken(role, accessToken, refreshToken)` (`App/redux/utils`) writes `state.auth = { role, accessToken, refreshToken }`. Login dispatches this with `RoleEnum.PROFESSIONAL`.

### 0.8 Redux — professional slice

`App/redux/reducers/prof.js`, initial state:

```js
{ _id:null, prof:null, numOfNewNotifications:0, numOfNewClientRequests:0,
  name:null, email:null, profession:null, designation:null,
  eduQualification:null, experience:null, fee:null, step:null }
```

Action types & reducer behavior:

| Action (creator) | Type | Effect |
|---|---|---|
| `storeProfessionalsProfile(prof)` | `SET_PROFESSIONAL_INFO` | sets `prof`, plus flattened `_id` (`action.payload._id` — *note: creator only passes `{prof}`, so `_id` is `undefined` here*), `name/email/profession/designation/eduQualification/experience/fee`, `step`, `visibility` from `prof.*`. |
| `numOfNewNotificationsAction(n)` | `NEW_NOTIFICATION_COUNT` | sets `numOfNewClientRequests = n`. |
| — | `NEW_NOTIFICATION_COUNT_MINUS` | decrements counts when `noti_type==='APPOINTMENT_REQUESTED'`. |
| `updateProfileActionProf(data)` | `UPDATE_PROFILE_PROF` | replaces `prof` with `data` and flattens `name/profession/designation/eduQualification/experience/fee`. |
| `updateVisibilityInStore(visibility)` | `UPDATE_VISIBLITY` | sets `state.visibility`. |
| — | `PROF_SIGN_OUT` | resets to initial state. |

Reads used by these screens: `state.prof.prof`, `state.prof.visibility`, `state.prof.numOfNewClientRequests`, `state.notifications.unreadCount`, `state.auth.role`, `state.auth.accessToken/refreshToken`.

### 0.9 Endpoints (`App/services/endpoints.js`, `App/services/api.js`)

| `ApiDefinitions` method | Method | Endpoint |
|---|---|---|
| `loginProfessional({payload})` | POST | `/prof/login` |
| `registerProfessionalStep1({payload})` | POST | `/prof/register/step-1` |
| `registerProfessionalStep2({payload})` | POST | `/prof/register/step-2` |
| `registerProfessionalStep3({payload})` | POST | `/prof/register/step-3` |
| `registerProfessionalStep4({payload})` | POST | `/prof/register/step-4` |
| `getProfessionalsProfile()` | GET | `/prof/all-informations` |
| `getProfessionalHomepageNotificationCount()` | GET | `/prof/homepage-notification-count` |
| `deleteProfessionalAccount()` | POST | `/prof/delete-account` |
| `resetProfPassword({payload})` | POST | `/prof/reset-password` |
| `updateVisibility({visibility})` | POST | `/prof/update-visibility` (payload `{ visibility }`) |
| *(unused legacy)* `PROF_PROFILE_UPDATE` | POST | `/prof/update/profile` |

All are wrapped in `ApiExecutor(...)` except the legacy `updateProfProfile` (see §13).

### 0.10 Shared value lists (`App/utils/values.js`)

```
genderLists      = [ {label:'পুরুষ',value:'Male'}, {label:'মহিলা',value:'Female'}, {label:'অন্যান্য',value:'Others'} ]
professionLists  = [ 'Clinical psychologist', 'Assistant clinical psychologist', 'Psychiatrist' ]  // label===value
batchLists       = generated: for year 1997..currentYear-1 →
                   label/value = `Batch <n> - <year>/<lastTwoDigitsOfNextYear>`, newest first (reversed)
specAreaLists    = [ 'কগনিটিভ বিহ্যাভিওরাল থেরাপি (সি বি টি)', 'সাইকো অ্যানালাইস',
                     'ট্রাঞ্জেকসনাল অ্যানালাইস (টি এ)', 'ই এম ডি আর', 'কাপল থেরাপি',
                     'ফ্যামিলি থেরাপি', 'ডায়ালেকটিকাল বিহ্যাভিওরাল থেরাপি',
                     'মেডিসিনাল ট্রিট্মেন্ট', 'অন্যান্য', 'প্রযোজ্য নয়' ]  // label===value (Bangla)
```

### 0.11 `BasedOnProfession` component (`App/components/BasedOnProfession.js`)

Conditional field rendered after the profession Picker:

- If `profession.label === 'Psychiatrist'` → render a **TextInput** `name="bmdc"` placeholder `BMDC`, icon `account-check`, writing `bmdc`.
- Else (psychologist roles) → render a **Picker** placeholder `ব্যাচ` (icon `account-check`) with `items={batchLists}`, controlled by `batch/setBatch`, writing `batch`.
- Renders `null` if `profession` is falsy.
- Props: `{ profession, createChangeHandler, batch, setBatch, pickerWidth='92%' }`.

### 0.12 `Region` data

`App/data/RegionInformation.json` → `{ districts: [ { districtName, subDistricts: [ { subDistrictName, unions: [ { unionName } ] } ] } ] }`. Used to build cascading জেলা → উপজেলা → ইউনিয়ন pickers (option `{label, value}` pairs equal to the names).

### 0.13 Registration / approval lifecycle (backend semantics)

- **Step counter (`step` 1–4)** on the Professional document tracks how far registration has progressed.
- **Step 1** creates the account (`step=1`) and **emails the admin for approval**. The professional **cannot fully log in** until an admin sets `isVerified=true`.
- Login is permitted to return tokens, but if `step < 4` the professional is routed into the remaining registration steps; if the account is **not approved (`isVerified=false`)**, login is **blocked** by the backend with an error message surfaced in the UI (see §1 edge cases).
- Step submissions advance `step`. Backend validations live in `validations/prof.validation.js`:
  - Step 2 requires `experience`, `eduQualification`, `specializationArea`, `fee`, `telephone`.
  - Step 3 requires `availableTime` with each entry `{ day, timeRange:[{from,to}] }`, times formatted `hh:mmAM/PM`.
  - Step 4 requires `maximumWeeklyClient` & `averageWeeklyClient` from the fixed Bangla option list, plus `numberOfClients` and `reference`.

---

## 1. `Login.js` — Professional Login

- **Component:** `ProfLoginComponent`
- **Route name:** `LoginPro` (`constants.PROF_LOGIN`)
- **Header title:** none (`dontShowHeader`).
- **Back behavior:** `useBackPress(PROF_LOGIN)` → back target `WELCOME`; `navigation.replace('Welcome')`.

### Navigation IN
- From `Welcome` screen (role selection).
- From `RegisterStep1` “লগইন করুন” link (`navigation.navigate('LoginPro')`).
- From `helper.logout()` reset stack (when role was professional).

### Local state
- `isLoading` (bool), `error` (string|null).
- `useFormFields({ email:'', password:'' })` → `formFields`, `createChangeHandler`.

### UI content (top→bottom)
- Gradient `Container` with `colors={[secondary, secondary]}`.
- Header: `প্রফেশনাল হিসেবে` (26px) + `লগইন করুন` (23px), white, centered, height 180.
- White rounded sheet (`borderTopLeft/RightRadius: 35`) containing:
  - `<AuthIcon />`
  - **Email** `TextInput` — icon `email`, placeholder `ইমেইল`, `keyboardType="email-address"`, `textContentType="emailAddress"`, no autocaps/autocorrect → writes `email`.
  - **Password** `TextInput` — icon `lock`, placeholder `পাসওয়ার্ড`, `textContentType="password"` → writes `password`. (Note: `secureTextEntry` is **not** applied — password is visible. Match original or fix during rebuild.)
  - **“পাসওয়ার্ড ভুলে গিয়েছেন?”** TouchableOpacity (right-aligned, bold primary) → `navigation.navigate(FORGET_PASSWORD, { accountType: RoleEnum.PROFESSIONAL })`.
  - `<Loader visible={isLoading} />`
  - `<ErrorButton title={error} visible={!!error && !isLoading} />`
  - `<SubmitButton title="লগইন করুন" onPress={HandleFormSubmit} visible={!isLoading} />`
  - `<EndOptions>` block:
    - title1 `আপনার কি অ্যাকাউন্ট নেই?`
    - title2 `রেজিস্ট্রেশন করুন` → `onPress1` → `navigation.navigate(PROF_REGISTRATION_CONSENT)`
    - title3 `ইউজার হিসেবে লগইন করুন` → `onPress2` → `navigation.navigate(LOGIN)`

### Submit flow (`HandleFormSubmit`)
1. Empty-field check across `{email,password}` → if any empty: `error = 'ফর্মটি সঠিকভাবে পূরণ করুন'`, return.
2. `!validator.isEmail(email)` → `error = 'ইমেলটি বৈধ নয়'`, return.
3. `setIsLoading(true)`, clear error. Normalize: `email = trim().toLowerCase()`, `password = trim()`.
4. **API:** `ApiExecutor(loginProfessional({ payload: { email, password } }))` → `POST /prof/login`.
5. `setIsLoading(false)`.
6. On failure → `error = response.error.message` (this is where “account not approved / not verified” backend messages surface). Return.
7. On success: destructure `{ prof, accessToken, refreshToken } = response.data`.
   - If `!('step' in prof)` → `error = 'Step count not found'`, return.
   - `dispatch(setAuthToken(PROFESSIONAL, accessToken, refreshToken))`.
   - `dispatch(storeProfessionalsProfile(prof))`.
   - **Routing by step:** `step==1`→`PROF_REGISTER_STEP_2`; `step==2`→`PROF_REGISTER_STEP_3`; `step==3`→`PROF_REGISTER_STEP_4`; else→`PROF_HOMEPAGE`. (`navigation.navigate`.)

### API call summary
- `POST /prof/login`, payload `{ email, password }`. Success data `{ prof, accessToken, refreshToken }`. Errors surfaced via `ErrorButton`.

### Edge cases
- **Unapproved login blocked:** backend returns an error (non-success) → message shown in `ErrorButton`; no token stored, no navigation.
- **Email not verified:** backend may return `401 EmailNotVerified` → `ApiExecutor` toasts and redirects to `EMAIL_VERIFICATION_PAGE` with `{accountType,email}`.
- Incomplete-profile auto-redirect (step<4) is handled explicitly here by the step routing above (and also by `ApiExecutor` if a `401 INCOMPLETE_PROFILE` were returned).
- Password field is not masked in source.

---

## 2. `RegisterConsentPro.js` — Professional Registration Consent

- **Component:** `RegisterConsentPro` (wraps shared `Consent`)
- **Route name:** `RegisterConsentPro` (`constants.PROF_REGISTRATION_CONSENT`)
- **Header title:** `সম্মতিপত্র`.
- **Back behavior:** no `useBackPress` call inside; relies on default header back / `Consent` has no back logic. (Not in `backScreenMap`.)

### Navigation IN
- From `LoginPro` → `EndOptions` “রেজিস্ট্রেশন করুন”.

### UI content
Renders `<Consent>` (`App/components/Consent.js`):
- ScrollView, white background, no header text (only `description`).
- **Description** (Bangla consent paragraph):
  > “মোবাইল এপ্লিকেশনের মাধ্যমে প্রাপ্ত মানসিক স্বাস্থ্য উন্নয়নের অনুসন্ধানকারীগণকে যথাযথ পেশাদারিত্বের মাধ্যমে গ্রহণ করে প্রয়োজন অনুযায়ী সেবা প্রদান করা হবে এবং তাদের তথ্যগুলোকে অপব্যবহার করা হবে না। … শুধু মাত্র তিনজন গবেষক ব্যাতিত এই তথ্য আর কেউ দেখতে পারবে না।”
- **Button** `রেজিস্ট্রেশন করুন` (primary, full width) → `handlePress` → `navigation.navigate(redirectTo)` where `redirectTo = PROF_REGISTER_STEP_1` (`RegisterPro`).

### Navigation OUT
- `navigation.navigate('RegisterPro')` on button press.

### State / API
- None. Pure presentational.

---

## 3. `RegisterStep1.js` — Account Creation (Step 1)

- **Component:** `RegisterStep1`
- **Route name:** `RegisterPro` (`constants.PROF_REGISTER_STEP_1`)
- **Header title:** custom in-screen header (no nav title relied upon).
- **Back behavior:** `useBackPress(PROF_REGISTER_STEP_1)` → back target `PROF_REGISTRATION_CONSENT` → `navigation.replace('RegisterConsentPro')`.

### Navigation IN
- From `RegisterConsentPro` consent button.

### Local state
- Pickers: `gender`, `profession`, `batch` (selected items), `zilla`, `upozila`, `union`.
- `upozilaList`, `unionList` (cascading option arrays).
- `error`, `isLoading`.
- `useFormFields(initialState)` where:
```js
initialState = { name:'', email:'', gender:'', password:'', confirmPassword:'',
  designation:'', batch:'', bmdc:'', profession:'', workplace:'', zila:'', upazila:'', union:'' }
```

### UI content (top→bottom)
- `Container` gradient `[secondary, secondary]`, header `প্রফেশনাল হিসেবে` (28px) + `এখনই জয়েন করুন!` (19px), height 165.
- White sheet (radius 35) with fields:
  1. **নাম** TextInput (icon `account`) → `name`.
  2. **ইমেইল** TextInput (icon `email`, email keyboard) → `email`.
  3. **লিঙ্গ** Picker (icon `gender-male-female-variant`, width 92%) items `genderLists` → controls `gender`, writes `gender` (value `Male`/`Female`/`Others`).
  4. **পাসওয়ার্ড** TextInput (icon `lock`) → `password` (not masked in source).
  5. **পুনরায় পাসওয়ার্ড দিন** TextInput (icon `lock`) → `confirmPassword`.
  6. **বর্তমান ঠিকানা (জেলা)** Picker (icon `home-map-marker`) items `zillaList` (built from `Region.districts`) → `zillaHandleChange` (sets `zilla`, rebuilds `upozilaList`, clears `upozila`/`union`), writes `zila`.
  7. **বর্তমান ঠিকানা (উপজেলা)** Picker (icon `map-marker-radius`) items `upozilaList` → `upozilaHandleChange` (sets `upozila`, rebuilds `unionList`, clears `union`), writes `upazila`.
  8. **বর্তমান ঠিকানা (ইউনিয়ন)** Picker (icon `map-marker-check`) items `unionList` → sets `union`, writes `union`.
  9. **পেশা** Picker (icon `card-account-details-star`) items `professionLists` → sets `profession`, writes `profession`.
  10. **`<BasedOnProfession>`** — after profession select: Psychiatrist → `BMDC` TextInput (writes `bmdc`); else → `ব্যাচ` Picker (writes `batch`).
  11. **পদবি** TextInput (icon `briefcase-account`) → `designation`.
  12. **কর্মস্থল** TextInput (icon `map-marker-radius`) → `workplace`.
  - `<Loader>`, `<ErrorButton>`, `<SubmitButton title="রেজিস্ট্রেশন করুন">`.
  - `<EndOptions>`:
    - title1 `ইতোমধ্যে একটি অ্যাকাউন্ট আছে?`
    - title2 `লগইন করুন` → `onPress1` → `navigation.navigate('LoginPro')`
    - title3 `ইউজার হিসাবে রেজিস্ট্রেশন করুন` → `onPress2` → `navigation.navigate('Register')`

### Submit flow (`handleFormSubmit`)
1. Empty-field loop over `initialState` keys with special handling:
   - `union` is skipped (optional).
   - `batch`/`bmdc`: buggy guard in source — `if (fields.batch === '' && fields.key === '')` (`fields.key` is always undefined). **Effect:** an empty `batch` flags `fieldAbsent` regardless of `bmdc`. For rebuild, intended rule is “at least one of batch/bmdc present per profession”; recommend: Psychiatrist requires `bmdc`, others require `batch`.
   - All other keys: empty string → `fieldAbsent=true`.
2. If `fieldAbsent` → `error='ফর্মটি সঠিকভাবে পূরণ করুন'`, return.
3. `!validator.isEmail(email)` → `error='ইমেলটি বৈধ নয়'`, return.
4. `password !== confirmPassword` → `error='পাসওয়ার্ড মেলেনি'`, return.
5. `setIsLoading(true)`, clear error; normalize `email` (trim+lowercase), `password` (trim).
6. **API:** `ApiExecutor(registerProfessionalStep1({ payload: fields }))` → `POST /prof/register/step-1`.
   - Payload = all `formFields` (incl. `confirmPassword`).
7. `setIsLoading(false)`.
8. Failure → `error = response.error.message`, return (e.g. email already exists).
9. **Success → `navigation.navigate(WAIT_FOR_VERIFICATION)`** (`AccountConfirmation`). Backend creates account `step=1` and emails admin for approval. No tokens are stored here.

### Edge cases
- Duplicate email / weak password → backend error in `ErrorButton`.
- Cascading pickers reset downstream selections when an upstream value changes.
- After Step 1, the professional is **not** logged in; they must wait for approval, then log in (which routes them to Step 2 because `step==1`).

---

## 4. `RegisterStep2.js` — Professional Details (Step 2)

- **Component:** `RegisterStep2`
- **Route name:** `RegisterProStep2` (`constants.PROF_REGISTER_STEP_2`)
- **Header title:** `Registration - Step 2`.
- **Back behavior:** `useBackPress(PROF_REGISTER_STEP_2)` → back target `SPECIAL_LOGOUT_ACTION` → **logout** (resets to Welcome/LoginPro). Hardware back logs the user out.

### Navigation IN
- From `LoginPro` when `prof.step==1`.
- From `ApiExecutor` INCOMPLETE_PROFILE auto-redirect when backend reports `STEP:1`.

### Local state
- `error`, `isLoading`, `specArea` (selected Picker item).
- `useFormFields({ experience:'', eduQualification:'', specializationArea:'', otherSpecializationArea:'', fee:'', telephone:'' })`.

### UI content
- `Container` (default colors), white sheet.
  1. **অভিজ্ঞতা** TextInput (icon `account-tie`) → `experience`.
  2. **শিক্ষাগত যোগ্যতা** TextInput (icon `account-star`) → `eduQualification`.
  3. **স্পেশ্যালাইজেশন এরিয়া** Picker (icon `card-account-details`, width 92%) items `specAreaLists` → sets `specArea`, writes `specializationArea`.
  4. **(conditional)** if `formFields.specializationArea === 'অন্যান্য'` → **এরিয়া উল্লেখ করুন** TextInput (icon `card-account-details-outline`) → `otherSpecializationArea`.
  5. **ফি** TextInput (icon `cash`, `number-pad`) → `fee`.
  6. **টেলিফোন নম্বর** TextInput (icon `phone-in-talk`, `number-pad`) → `telephone`.
  - `<Loader>`, `<ErrorButton>`, `<SubmitButton title="সাবমিট করুন">`.

### Submit flow (`HandleFormSubmit`)
1. Empty-field loop:
   - For `specializationArea`/`otherSpecializationArea`: only flags absent if `specializationArea === 'অন্যান্য'` **and** `otherSpecializationArea === ''`. (Note: `specializationArea` itself is not explicitly required by this loop — it’s a controlled Picker; backend enforces presence.)
   - Other keys (`experience`, `eduQualification`, `fee`, `telephone`): empty → `fieldAbsent`.
2. `fieldAbsent` → `error='ফর্মটি সঠিকভাবে পূরণ করুন'`, return.
3. `setIsLoading(true)`, clear error.
4. **API:** `ApiExecutor(registerProfessionalStep2({ payload: formFields }))` → `POST /prof/register/step-2`. Payload includes all six fields.
5. `setIsLoading(false)`.
6. Success → `navigation.navigate(PROF_REGISTER_STEP_3)`. Failure → `error = response.error.message`.

### Edge cases
- Backend validation (`prof.validation.js`) enforces `experience/eduQualification/specializationArea/fee/telephone` — server errors surface in `ErrorButton`.
- No redux writes here; advances backend `step` to 2.

---

## 5. `RegisterStep3.js` — Available Time Schedule (Step 3)

- **Component:** `RegisterProStep3`
- **Route name:** `RegisterProStep3` (`constants.PROF_REGISTER_STEP_3`)
- **Header title:** `Registration - Step 3`.
- **Back behavior:** `useBackPress(PROF_REGISTER_STEP_3)` → `SPECIAL_LOGOUT_ACTION` → **logout**.

### Navigation IN
- From `LoginPro` when `prof.step==2`; from Step 2 submit; from `ApiExecutor` INCOMPLETE_PROFILE `STEP:2`.

### Constant data
- `days` = 7 entries `{ label:<English>, value:<Bangla> }`: Sunday/রবিবার, Monday/সোমবার, Tuesday/মঙ্গলবার, Wednesday/বুধবার, Thursday/বৃহস্পতিবার, Friday/শুক্রবার, Saturday/শনিবার.
- `times` = 24 generated options. Built by iterating `i=0..23`, computing `calculateTime(6+i, 'AM')` (so the day starts at 6:00AM and rolls through 12-hour AM/PM format). Each option `{label,value}` like `6:00AM`, `7:00AM`, … `5:00AM` wrapping. Format is `h:00AM/PM` (used for `from`/`to`).

### Local state
- `error`, `isLoading`.
- **Per-day triples** (7 days × 3): `<Day>From`, `<Day>To`, `<Day>Time` (array of added ranges). e.g. `SundayFrom/setSundayFrom`, `SundayTo/setSundayTo`, `SundayTime/setSundayTime`, … for all 7 days.
- `selectHook(day)` returns `{ to:[fromState,setFrom], from:[toState,setTo], time:[arr,setArr] }`. **Note the deliberate swap:** the object key `from` holds the *To* picker state and `to` holds the *From* picker state. The rest of the code is internally consistent with this swap, so the net behavior is correct, but be careful when rebuilding — model it cleanly as `{ from, to, ranges }`.

### UI content
- `ScrollView` (white). Header text:
  > `মোবাইল অ্যাপ্লিকেশনের মাধ্যমে মানসিক স্বাস্থ্য সেবা প্রদানে বরাদ্দকৃত সময়ঃ`
- For each `day` in `days`:
  - Day label (Bangla `d.value`).
  - Row with two Pickers (width 38% each, bordered): **From** and **To**, items `times`, controlled per-day.
  - **Add** TouchableOpacity (primary) → `onPressHandler(d.label)`.
  - Below: `SelectedTimeTable` — chips for each added `{from,to}` range showing `"<from.value> - <to.value>"` with a `close-circle-outline` delete icon → `deleteTime(day, from, to)`.
- Footer: `<Loader>`, `<ErrorButton>`, `<SubmitButton title="সাবমিট করুন">`.

### Interaction logic
- `onPressHandler(day)`: read the day’s `from`/`to` selections; if either missing → no-op. Else push `{ from: <fromState>, to: <toState> }` to that day’s `time` array and clear both pickers.
- `deleteTime(day, from, to)`: remove the matching range (compared by `from.value`/`to.value`).
- `SelectedTimeTable({day})`: renders the chips for that day.

### Submit flow (`onSubmitHandler`)
1. Build `availableTime` = `days.map(d.label)` → for each day `{ day, timeRange: ranges.map(t => ({ from: t.from.value, to: t.to.value })) }`. (`day` here is the **English** label.)
2. `payload = { availableTime }`.
3. Validation: require at least one day with ≥1 time range; else `error='You must schedule at least one time'`, return.
4. `setError(null)`, `setIsLoading(true)`.
5. **API:** `ApiExecutor(registerProfessionalStep3({ payload }))` → `POST /prof/register/step-3`.
6. `setIsLoading(false)`.
7. Failure → `error = response.error.message`, return. Success → `navigation.navigate(PROF_REGISTER_STEP_4)`.

### Edge cases
- Time strings must match backend `hh:mmAM/PM` expectation (the generated `times` already conform, e.g. `6:00AM`).
- Days with no ranges submit `timeRange: []` (allowed as long as ≥1 day has ranges).
- Hardware back → logout (mid-registration safety).

---

## 6. `RegisterStep4.js` — Pre-evaluation / Client Volume (Step 4)

- **Component:** `RegisterStep4`
- **Route name:** `RegisterProStep4` (`constants.PROF_REGISTER_STEP_4`)
- **Header title:** `Pre-evaluation`.
- **Back behavior:** `useBackPress(PROF_REGISTER_STEP_4)` → `SPECIAL_LOGOUT_ACTION` → **logout**.

### Navigation IN
- From `LoginPro` when `prof.step==3`; from Step 3 submit; from `ApiExecutor` INCOMPLETE_PROFILE `STEP:3`.

### Constant data
- `locationMap` (English key → Bangla label): Dhaka/ঢাকা, Barisal/বরিশাল, Khulna/খুলনা, Chittagong/চট্টগ্রাম, Mymensingh/ময়মনসিংহ, Rajshahi/রাজশাহী, Sylhet/সিলেট, Rangpur/রংপুর, Others/`অন্যান্য (উল্লেখ করুন)`.
- `initialClientData` = `[{ location:<EnglishKey>, count:'' }, …]` for all 9 locations.
- `optionList` (Bangla fixed list, `{label,value}`): `০-৫ জন`, `৬-১০ জন`, `১১-১৫ জন`, `১৬-২০ জন`, `২১ বা তার উর্ধে`.

### Local state
- `error`, `isLoading`.
- `option1` (max weekly), `option2` (avg weekly) — selected Picker items.
- `numOfClient` (array initialized to `initialClientData`).
- `ref` (reference string).

### UI content (ScrollView, white)
- **Q1** `আপনার মতে আপনি সপ্তাহে সর্বোচ্চ কতজন ক্লায়েন্টকে সেবা দিতে পারবেন?` → Picker (width 98%, placeholder `সিলেক্ট করুন`, gray placeholder) items `optionList` → `option1`.
- **Q2** `বর্তমানে আপনি সপ্তাহে গড়ে কতজন ক্লায়েন্টকে সেবা দিচ্ছেন?` → Picker items `optionList` → `option2`.
- **Q3** `আপনার সেবা গ্রহণকারী ক্লায়েন্টের কতজন নিচে বর্ণিত স্থানগুলোতে অবস্থান করছেঃ` → for each `numOfClient` entry: a row `「<Bangla location>:」` + bare RN `TextInput` (bottom-border). `keyboardType` = `number-pad` except `অন্যান্য (উল্লেখ করুন)` which uses `default`. `onChangeText` → `numOfClientHandler(index, text)` updates that entry’s `count`. *(Note: the `keyboardType` check compares `item.location` against the Bangla string, but `location` holds the English key — so “Others” effectively also gets `number-pad`. Cosmetic; preserve or fix.)*
- **Q4** `আপনার নিকট বর্তমানে সেবা গ্রহণকারী অধিকাংশ ক্লায়েন্টের রেফারালের উৎস উল্লেখ করুনঃ` → app `TextInput` (placeholder `রেফারালের উৎস`, width 98%) → `setRef`.
- Footer: `<Loader>`, `<ErrorButton>`, `<SubmitButton title="সাবমিট করুন">`.

### Submit flow (`handleSubmit`)
1. `payload = { maximumWeeklyClient: option1?.label, averageWeeklyClient: option2?.label, numberOfClients: numOfClient, reference: ref }`.
2. Validation: if `!maximumWeeklyClient || !averageWeeklyClient` → `error='ফর্মটি সঠিকভাবে পূরণ করুন'`, return. (numberOfClients / reference not validated client-side; backend may require.)
3. `setIsLoading(true)`, clear error.
4. **API:** `ApiExecutor(registerProfessionalStep4({ payload }))` → `POST /prof/register/step-4`.
5. `setIsLoading(false)`.
6. Success → `navigation.navigate(PROF_HOMEPAGE)`. Failure → `error = response.error.message`.

### Edge cases
- `maximumWeeklyClient`/`averageWeeklyClient` are sent as the **Bangla label** strings (e.g. `১১-১৫ জন`) — must match backend’s fixed option list.
- `numberOfClients` entries keep English `location` keys with string `count` values (may be empty for unfilled locations).
- On success the professional is now `step=4`; subsequent logins go straight to `PROF_HOMEPAGE`.

---

## 7. `WaitForVerification.js` — Account Confirmation

- **Component:** `AccountConfirmation`
- **Route name:** `AccountConfirmation` (`constants.WAIT_FOR_VERIFICATION`)
- **Header title:** `ধন্যবাদ`.
- **Back behavior:** `useBackPress(WAIT_FOR_VERIFICATION)` → back target `WELCOME` → `navigation.replace('Welcome')`.

### Navigation IN
- From `RegisterStep1` on successful step-1 submit (`navigation.navigate(WAIT_FOR_VERIFICATION)`).

### UI content (static)
- White full-screen view, top padding.
- `<AuthIcon />`.
- Bold centered text (18px, lineHeight 34):
  - `আপনার নিবন্ধনের জন্য ধন্যবাদ।`
  - `অনুগ্রহ করে যাচাইয়ের জন্য অপেক্ষা করুন। আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব।`

### State / API / Navigation OUT
- None. Terminal informational screen. User leaves via hardware back (→ Welcome) or by relaunching and logging in after admin approval.

---

## 8. `ProHomepage.js` — Professional Homepage

- **Component:** `Homepage`
- **Route name:** `ProHomepage` (`constants.PROF_HOMEPAGE`)
- **Header title:** `Quality Life`.
- **Back behavior:** `useBackPress(PROF_HOMEPAGE)` → back target `WELCOME` → `navigation.replace('Welcome')`.

### Navigation IN
- From `LoginPro` (step==4), `RegisterStep4` submit, and various back-map targets that point to `PROF_HOMEPAGE`.

### Redux reads
- `state.notifications.unreadCount` → `unreadNotificationCount`.
- `state.prof` → `{ numOfNewClientRequests, prof = {} }`.

### Local state
- `isLoading` (init `true`), `refreshing`, `error`.
- `isFocused = useIsFocused()`.

### Data fetch (`getAllInformations`)
1. `setIsLoading(true)`, clear error.
2. **API 1:** `ApiExecutor(getProfessionalHomepageNotificationCount())` → `GET /prof/homepage-notification-count`. On failure → `setError` and **return** (note: leaves `isLoading` true; a `useEffect` on `[error]` then flips it false).
   - Success data: `{ appointmentCount, notificationCount }`.
3. **API 2:** `ApiExecutor(getProfessionalsProfile())` → `GET /prof/all-informations`. On failure → `setError`, return.
   - Success data: `{ prof }`.
4. Dispatch:
   - `numOfNewNotificationsAction(parseFloat(appointmentCount))` (→ `numOfNewClientRequests`).
   - `setUnreadNotificationCount(parseFloat(notificationCount))`.
   - `storeProfessionalsProfile(prof)`.
5. `setIsLoading(false)`.
- Triggered on focus (`useEffect [isFocused]`) and via pull-to-refresh (`RefreshControl` → `onRefresh`).
- `useEffect [error]`: if `isLoading && error` → `setIsLoading(false)`.

### Derived
- `anyNewNotifications = !(!unreadNotificationCount || unreadNotificationCount <= 0)`.

### UI content
- `ScrollView` with `RefreshControl`.
- While `isLoading` → centered `ActivityIndicator` (primary).
- Else content:
  - If `error` → `<ErrorButton title={error} />`.
  - **New Notifications card** (only if `anyNewNotifications`): icon `notifications-active`, title `New Notifications`, subtitle `You have <n> new notifications`, color `highlight` → `navigate(NOTIFICATIONS)`.
  - **WarningBlock** (only if `!prof.visibility`): red box “Your account is hidden. No appointments can be booked. You can update your visibility in settings.” → `navigate(SETTINGS)`.
  - **Client Requests card**: icon `person-add`, color `danger`, badge `numOfNewClientRequests` (if >0) → `navigate(PROF_CLIENT_REQUEST)`.
  - **My Clients card**: icon `group`, color `#337AB7` → `navigate(PROFESSIONALS_CLIENT, { goToBack: PROF_HOMEPAGE })`.
  - **Assessment Tools card**: icon `assessment`, color `success` → `navigate(PROF_ASSESSMENT_TOOLS)`.
  - **Notifications card** (only if `!anyNewNotifications`): icon `notifications-active`, color `#FFC107` → `navigate(NOTIFICATIONS)`.
  - **My Profile card**: icon `verified-user`, color `#6F42C1` → `navigate(PROF_PROFILE)`.
- `CardItem` = pressable row: colored left border, circular icon, title/subtitle, optional badge pill, `chevron-right`.
- Early return `null` if `prof` is falsy.

### Edge cases
- If first API fails, `isLoading` is corrected to `false` by the `[error]` effect, so the error is shown.
- Visibility warning derives from `prof.visibility` (from the freshly fetched profile, also written to redux).
- INCOMPLETE_PROFILE auto-redirect: if either fetch returns `401 INCOMPLETE_PROFILE:STEP:n`, `ApiExecutor` navigates to the appropriate register step.

---

## 9. `ProfProfile.js` — Professional Profile (read-only)

- **Component:** `MyProfileScreen`
- **Route name:** `ProfProfile` (`constants.PROF_PROFILE`)
- **Header title:** `My Profile`.
- **Back behavior:** `useBackPress(PROF_PROFILE)` → back target `PROF_HOMEPAGE` → `navigation.replace('ProHomepage')`.

### Navigation IN
- From `ProHomepage` “My Profile” card.

### Local state
- `isFetching`, `error`, `data` (the prof object).

### Data fetch (on mount)
- **API:** `ApiExecutor(getProfessionalsProfile())` → `GET /prof/all-informations`.
  - Success → `data = response.data.prof`.
  - Failure → `error = response.error.message`.

### Render states
- `isFetching` → `<Loader />`.
- `error` → `<ErrorButton title={error} />`.
- `!data` → `null`.
- Else → ScrollView with sections.

### UI sections (all read-only)
- `address = [data.union, data.upazila, data.zila].filter(Boolean).join(', ')`.
- **Personal Details:** Name (`capitalizeFirstLetter(data.name)`), Email, Gender, Telephone, Address.
- **Professional Details:** Designation, Workplace, Profession, Specialization Area, *(if present)* Other Specialization Area, Education Qualification, Experience, *(if `bmdc`)* BMDC, *(if `batch`)* Batch, Fee (`<fee> BDT`), Visibility Status (`Visible`/`Hidden` from `data.visibility`), Average Weekly Client, Maximum Weekly Client, *(if `reference`)* Reference.
- **Available Time:** `renderAvailableTime(data.availableTime)` → for each `{day, timeRange}`: day name; each range `「<from> - <to>」`; or `No availability` (red italic) if empty.
- **Number of Clients:** `renderClients(data.numberOfClients)` → for each `{location, count}`: `「<location>: <count||'0'> clients」`.
- An “Edit Profile” `SubmitButton` exists but is **commented out** (would navigate to `PROF_UPDATE_PROFILE`). So there is currently **no UI path** to the update screen from here.

### API / redux
- One GET; no redux writes (uses local `data`).

---

## 10. `ProfUpdateProfile.js` — Update Profile (form, non-functional submit)

- **Component:** `UpdateProfileProf` (note: file name `ProfUpdateProfile.js`)
- **Route name:** `ProfUpdateProfile` (`constants.PROF_UPDATE_PROFILE`)
- **Header title:** `Update Profile`.
- **Back behavior:** `useBackPress(PROF_UPDATE_PROFILE, constants.GO_TO_BACK)` → since `previousPage === GO_TO_BACK` → `navigation.goBack()`. (Map also has `GO_TO_BACK` for this route.)

### Navigation IN
- Registered in the stack; reachable only if something navigates to `PROF_UPDATE_PROFILE` (the ProfProfile “Edit Profile” entry is commented out, so currently unreachable in normal flow).

### Local state
- `data`, `error`, `formFields` (object), `isLoading`, `isSubmitting`.
- Picker selections: `gender`, `specArea`, `zilla`, `upozila`, `union`, `profession`, `batch`.
- `upozilaList`, `unionList`.

### Data fetch (on mount)
- **API:** `ApiExecutor(getProfessionalsProfile())` → `GET /prof/all-informations`.
- On failure → `setError` (and the `[error]` effect resets loading/submitting). On success:
  - `data = formFields = response.data.prof`.
  - Pre-select pickers by matching values: `profession` (in `professionLists`), `batch` (in `batchLists`), `gender` (in `genderLists`), `specArea` (in `specAreaLists`).
  - Rebuild cascading `zilla`/`upozila`/`union` from `Region` to match the stored `zila`/`upazila`/`union`.

### UI content (`Container`, white form)
- **Personal Information** section header (24px, secondary, underlined):
  - নাম TextInput → `name` (value-bound).
  - লিঙ্গ Picker (`genderLists`) → `gender`/`gender`.
  - জেলা Picker (`zillaList`) → `zillaHandleChange`/`zila`.
  - উপজেলা Picker (`upozilaList`) → `upozilaHandleChange`/`upazila`.
  - ইউনিয়ন Picker (`unionList`) → `union`.
- **Professional Information** section:
  - পেশা Picker (`professionLists`) → `profession`.
  - `<BasedOnProfession pickerWidth='97%'>` → `bmdc` or `batch`.
  - পদবি (`designation`), কর্মস্থল (`workplace`), অভিজ্ঞতা (`experience`), শিক্ষাগত যোগ্যতা (`eduQualification`) TextInputs (value-bound).
  - স্পেশ্যালাইজেশন এরিয়া Picker (`specAreaLists`) → `specializationArea`; conditional এরিয়া উল্লেখ করুন TextInput when `specializationArea==='অন্যান্য'` → `otherSpecializationArea`.
  - ফি (`fee`, number-pad), টেলিফোন নম্বর (`telephone`, number-pad).
- **Available Time** and **Number of Clients** section headers exist but render **no inputs** (placeholders only — incomplete feature).
- `<Loader visible={isSubmitting}>`, `<ErrorButton>`, `<SubmitButton title="Update Profile">`.

### Submit flow (`handleSubmit`)
- **Currently a stub:** `console.log(formFields)` only. **No API call, no redux write, no navigation.** For rebuild, this should POST to `PROF_PROFILE_UPDATE` (`/prof/update/profile`) and dispatch `updateProfileActionProf`.

### `handleChange(value, key)`
- `setFormFields(prev => ({ ...prev, [key]: value }))`.

### Notes for rebuild
- This is a partially-built screen: profile editing is not wired. Available Time / Number of Clients editing is unimplemented.

---

## 11. `UpdateProfileProf.js` — Legacy Update Profile (dead code)

- **Component:** `UpdateProfileProf` (file `UpdateProfileProf.js`, distinct from §10).
- **Route name:** also uses `SCREEN_NAME = constants.PROF_UPDATE_PROFILE` but is **not** the component registered in `StackNavigator.js` (the stack imports `ProfUpdateProfile.js`). **This file is unreferenced/legacy.**
- **Back behavior:** `useBackPress(PROF_UPDATE_PROFILE)` (no previousPage) → would `goBack` via the `GO_TO_BACK` map entry.

### What it does (for completeness)
- Local `professionLists` (label→numeric value 10/11/12) and locally-generated `batchLists`.
- Redux reads: `state.prof.prof` (`_id, name, profession, batch, bmdc, designation, eduQualification, experience, fee`) and `state.auth.jwtToken`.
- Pre-selects `profession`/`batch` from current values via effects.
- Form (English placeholders): Name, Profession Picker, `<BasedOnProfession>`, Designation, Edu. Qualifications, Experience, Fee.
- **Submit (`handleFormSubmit`):**
  - Builds payload with `?? current` fallbacks for each field.
  - Calls `updateProfProfile({ _id, jwtToken, payload })` — **a function that is NOT exported from `App/services/api.js`** (import would fail). Confirms this file is dead.
  - On success: `dispatch(updateProfileActionProf(response.data))`, `navigation.navigate('ProfileProf')`.
  - On 401: `dispatch(logoutAction())`; also calls undefined `processApiError`.
- **Recommendation:** delete in rebuild; use the §10 screen (properly wired) instead.

---

## 12. `ProfileActModal.js` — Confirmation Modal (legacy/unused)

- **Component:** `ProfileActModal`
- Not a route; a reusable RN `Modal`. Appears unused by current prof screens (account actions now use `DeleteAccountModal` in Settings — see §14).

### Props
- `{ modalVisibleAct, setModalVisibleAct, activation }`.

### UI
- Slide-up transparent modal, centered white card.
- Text `Are you sure?`.
- Buttons row (right-aligned): **Yes** (green) → `onPress={activation}`; **No** (red) → `setModalVisibleAct(!modalVisibleAct)`.
- `onRequestClose` (hardware back) → `Alert.alert('Modal has been closed.')` then toggles visibility.

### Notes
- For rebuild this can be replaced by the shared `DeleteAccountModal` confirmation pattern used in Settings.

---

## 13. Profile Update API (reference)

- Endpoint `PROF_PROFILE_UPDATE = POST /prof/update/profile`.
- Intended payload: profile fields (name, profession, batch/bmdc, designation, eduQualification, experience, fee, etc.).
- On success, dispatch `updateProfileActionProf(data)` (`UPDATE_PROFILE_PROF`) to update redux `prof` + flattened fields.
- **No screen currently calls this through `ApiExecutor`** (the wired §10 screen stubs submit; the legacy §11 screen calls a non-exported helper). Rebuild should wire §10’s submit to `ApiExecutor(...)` against this endpoint.

---

## 14. Account-management flows (live in `Setting/Setting.js` + `Setting/UpdatePassword.js`)

These flows are reachable for professionals from the homepage’s visibility warning (`→ SETTINGS`) and the drawer/Settings entry. They are documented here because they own the prof **visibility toggle, delete-account, and password-change** behavior.

### 14.1 Settings screen (`Setting`, title `সেটিংস`, back → `HOMEPAGE`→`PROF_HOMEPAGE`)
- Reads `state.auth.role`, `state.prof.visibility`.
- Rows: About Us, Privacy Policy, **পাসওয়ার্ড পরিবর্তন করুন** (→ `UPDATE_PASSWORD`), *(professional only)* visibility toggle, **অ্যাকাউন্ট ডিলিট করুন**, **লগ আউট করুন** (`logout`).

#### Visibility toggle (professional only)
- Row label depends on current `visibility`: if visible → `অ্যাকাউন্ট গোপন করুন` (eye-off, danger); if hidden → `অ্যাকাউন্ট দৃশ্যমান করুন` (eye, success). Tapping opens a `DeleteAccountModal`-style confirm with text `আপনি কি আপনার অ্যাকাউন্ট গোপন করতে চান?` / `…দৃশ্যমান করতে চান?`.
- `onVisibilityChange`: guards `isProfessional(role)`; `newVisibility = !visibility`; **API:** `ApiExecutor(updateVisibility({ visibility: newVisibility }))` → `POST /prof/update-visibility` payload `{ visibility }`. Then `dispatch(updateVisibilityInStore(newVisibility))` (`UPDATE_VISIBLITY`) and close modal.
- Effect: drives the `ProHomepage` `WarningBlock` (`!prof.visibility`) and the `ProfProfile` Visibility Status field. Hidden = not bookable by users.

#### Delete account
- `onDelete`: `isProfessional(role)` → **API:** `ApiExecutor(deleteProfessionalAccount())` → `POST /prof/delete-account`. Then close modal and `logout()` (clears all slices, resets to Welcome/LoginPro). Confirm modal text: `আপনি কি নিশ্চিত? আপনার অ্যাকাউন্ট স্থায়ীভাবে মুছে ফেলা হবে।`.

### 14.2 Change password (`UpdatePassword`, title `পাসওয়ার্ড পরিবর্তন করুন`, back → `SETTINGS`)
- Fields: বর্তমান পাসওয়ার্ড (`oldPassword`), নতুন পাসওয়ার্ড (`newPassword`), পুনঃনিশ্চিত (`confirmPassword`).
- Validation: all required (`ফর্মটি সঠিকভাবে পূরণ করুন`); `newPassword===confirmPassword` else `নতুন পাসওয়ার্ড এবং নিশ্চিত পাসওয়ার্ড মেলেনি।`.
- Role-routed API: professionals use `resetProfPassword({ payload:{ oldPassword, newPassword } })` → `POST /prof/reset-password` (users use `resetUserPassword`).
- Success → toast `পাসওয়ার্ড সফলভাবে পরিবর্তিত হয়েছে`, `navigation.goBack()`. Failure → `ErrorButton`.

### 14.3 Forgot password
- From `LoginPro` “পাসওয়ার্ড ভুলে গিয়েছেন?” → `FORGET_PASSWORD` with `{ accountType: RoleEnum.PROFESSIONAL }` (OTP-based reset via `/auth/verify-email`, `/auth/verify-otp`, `/auth/update-password-with-otp`; documented in the auth/forgot-password spec).

---

## 15. End-to-end flow summary

```
Welcome
  └─(Professional)→ LoginPro ──(no account)──→ RegisterConsentPro ──→ RegisterPro (Step 1)
                       │                                                   │ POST /prof/register/step-1
                       │                                                   ▼  (account created step=1, admin emailed)
                       │                                              AccountConfirmation  ──back──→ Welcome
                       │
                       │  POST /prof/login (admin must have approved isVerified)
                       ▼
                 step==1 → RegisterProStep2 (POST step-2) → step==2 → RegisterProStep3 (POST step-3)
                                                                          → step==3 → RegisterProStep4 (POST step-4)
                                                                                        → step==4 → ProHomepage
  (Hardware back on Step2/3/4 = LOGOUT.  Any prof API returning 401 INCOMPLETE_PROFILE:STEP:n auto-routes to the matching next step.)

ProHomepage ──→ Client Requests | My Clients | Assessment Tools | Notifications | My Profile(ProfProfile)
            └─(visibility warning)→ Setting → {visibility toggle, delete account, change password, logout}
```

### Backend Professional schema fields (for field accuracy)
`name, email, gender(Male/Female/Others), password, designation, batch, bmdc,
workplace, profession(Clinical psychologist/Assistant clinical psychologist/Psychiatrist),
zila, upazila, union, isVerified, step(1-4), experience, eduQualification,
specializationArea, otherSpecializationArea, fee, telephone,
availableTime[{day, timeRange[{from,to}]}], maximumWeeklyClient, averageWeeklyClient,
numberOfClients[{location,count}], reference, visibility, isEmailVerified`

### Known bugs / cleanup notes for the rebuild
1. **Step1 batch/bmdc validation bug** — `fields.key` is undefined; effectively requires `batch` always. Implement per-profession requirement instead.
2. **Step3 `selectHook` from/to swap** — internally consistent but confusing; model as `{from, to, ranges}` cleanly.
3. **Step4 `keyboardType` check** compares against Bangla string while `location` holds English key → “Others” gets numeric keyboard. Decide intended behavior.
4. **ProfUpdateProfile (§10) submit is a stub** — wire to `POST /prof/update/profile` + `updateProfileActionProf`. Available Time / Number of Clients editing unimplemented.
5. **UpdateProfileProf.js (§11) is dead code** — imports a non-exported `updateProfProfile`; delete.
6. **ProfileActModal.js (§12) appears unused** — consolidate on `DeleteAccountModal`.
7. **ProfProfile “Edit Profile” button is commented out** — no live navigation to the update screen.
8. **Password fields are not masked** in Login/Step1 (no `secureTextEntry`).
9. **ProHomepage first-fetch failure** leaves `isLoading` true until the `[error]` effect corrects it; consider setting loading false in the failure branch directly.
