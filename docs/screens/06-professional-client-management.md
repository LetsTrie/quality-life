# 06 — Professional: Client Request, Client Management, Assessments & Notifications

> Rebuild spec for the PROFESSIONAL-side flow in the Quality Life / QLife React Native (Expo) app.
> Source root: `frontend/App`. This document is intentionally exhaustive so the feature can be rebuilt without the original source.

This module covers how a **professional** (therapist/counsellor) manages:

1. Incoming appointment requests from clients (`ClientRequest`)
2. Responding to / accepting an appointment, optionally suggesting an initial scale (`ResponseRequest`)
3. Their accepted clients list (`MyClients`)
4. A single client's full profile + test history, and recommending scales (`ClientProfile`)
5. Viewing a primary (3-scale / info) test result (`ClientTestResult`)
6. Browsing assessment tools (`Assessments`, `AssessmentDetails`)
7. A (dead/stubbed) suggested-scale result viewer (`SuggestedScaleResult`)
8. The notification feed and per-item routing (`Notification`, `NotificationTab`)

---

## 0. Shared context (read this first)

### 0.1 Route name constants (`App/navigation/constants.js`)

Constants used by this module (constant → route string):

| Constant | Route name string |
|---|---|
| `PROF_HOMEPAGE` | `ProHomepage` |
| `PROF_CLIENT_REQUEST` | `ClientRequestPro` |
| `PROF_RESPONSE_CLIENT_REQUEST` | `ResponseClientRequest` |
| `PROFESSIONALS_CLIENT` | `ProMyClients` |
| `CLIENT_PROFILE` | `ClientProfile` |
| `CLIENT_TEST_RESULT` | `ClientTestResult` |
| `PROF_ASSESSMENT_TOOLS` | `ProAssessments` |
| `PROF_ASSESSMENT_TOOL_DETAILS` | `ProAssessmentDetails` |
| `PROF_SUGGESTED_SCALE` | `ProfSuggestedScale` (user-side fill-up screen — not in this module) |
| `PROF_SUGGESTED_SCALE_RESULT` | `ProfScaleResult` |
| `NOTIFICATIONS` | `Notifications` |
| `APPOINTMENT_STATUS` | `AppointmentStatus` (user-side appointment status) |
| `GO_TO_BACK` | sentinel string `:: go back ::` |
| `SPECIAL_LOGOUT_ACTION` | sentinel string `:: logout ::` |

### 0.2 Header titles (`App/navigation/StackNavigator.js`)

Titles set in the native stack header (`options.title`):

| Route | Header title |
|---|---|
| `PROF_CLIENT_REQUEST` | `Client Requests` |
| `PROF_RESPONSE_CLIENT_REQUEST` | `Client Request` |
| `PROFESSIONALS_CLIENT` | `My Clients` |
| `CLIENT_PROFILE` | `Client Profile` |
| `CLIENT_TEST_RESULT` | `Scale Result` |
| `PROF_ASSESSMENT_TOOLS` | `Assessment tools` |
| `PROF_ASSESSMENT_TOOL_DETAILS` | `Tool Overview` |
| `NOTIFICATIONS` | `Notifications` |
| `PROF_SUGGESTED_SCALE_RESULT` | `Your Score` |

`SuggestedScaleResult.js` is registered (route file present) but the rendered component currently returns a stub (see §7). The `PROF_SUGGESTED_SCALE_RESULT` route in the navigator uses a separate scoring screen, not this stub.

### 0.3 Back-button system (`App/contexts/BackPress.js`, `App/navigation/backScreenMap.js`)

Every screen in this module calls the `useBackPress(screenName, previousPage?)` hook (re-exported from `App/hooks/index.js`). It registers an Android `hardwareBackPress` listener that runs `handleBackPress`:

1. Compute `backScreen = backScreenMap[screenName] || null`.
2. If either `backScreen` or the passed `previousPage` equals `SPECIAL_LOGOUT_ACTION` → call `logout()`.
3. Else if either equals `GO_TO_BACK` → `navigation.goBack()`.
4. Else `targetScreen = previousPage || backScreen`, resolve `destination = selectHomepageByRole(targetScreen, role)`, then `navigation.replace(destination)` (fallback to `navigate`). If no destination, log an error and swallow the press.
5. Always returns `true` (consumes the hardware back press).

`backScreenMap` entries relevant here:

| screenName | backScreenMap value |
|---|---|
| `PROF_CLIENT_REQUEST` | `PROF_HOMEPAGE` |
| `PROF_RESPONSE_CLIENT_REQUEST` | `PROF_HOMEPAGE` |
| `PROFESSIONALS_CLIENT` | `PROF_HOMEPAGE` |
| `CLIENT_PROFILE` | `GO_TO_BACK` |
| `CLIENT_TEST_RESULT` | `GO_TO_BACK` |
| `PROF_ASSESSMENT_TOOLS` | `GO_TO_BACK` |
| `PROF_ASSESSMENT_TOOL_DETAILS` | `GO_TO_BACK` |
| `NOTIFICATIONS` | `HOMEPAGE` (note: resolved by role; for a professional `selectHomepageByRole` maps to the prof homepage) |
| `PROF_SUGGESTED_SCALE` | `HOMEPAGE` |
| `PROF_SUGGESTED_SCALE_RESULT` | `HOMEPAGE` |

Several screens pass an explicit `goToBack` route param that becomes `previousPage`, overriding the map default. When `goToBack === GO_TO_BACK`, hardware back uses `navigation.goBack()` (returns to the actual previous stack screen).

### 0.4 API plumbing (`App/services/api.js`, `endpoints.js`, `App/contexts/helper/index.js`)

- All calls go through `const { ApiExecutor } = useHelper()`. `ApiExecutor({ endpoint, method='GET', payload={}, headers={} })`:
  - Injects `Content-Type: application/json` and `Authorization: Bearer <accessToken>`.
  - On success returns `sendSuccessResponse(response.data.data)` → `{ success: true, data, ...spread of data fields }`. **Note:** because the success envelope spreads `response.data.data`, top-level fields of the payload (e.g. `hasProfRespondedToClient`) are accessible directly on the returned object as well as under `.data`.
  - On `401 InvalidToken`: retries up to 3× via `refreshTokener`, re-issues the call with the new token, else `logout()`.
  - On `401 EmailNotVerified`: toasts "Please verify your email", navigates to `EMAIL_VERIFICATION_PAGE` with `{ accountType, email }`.
  - On `401 INCOMPLETE_PROFILE:STEP:n`: routes professional to the matching register step, user to additional-info.
  - Otherwise returns `sendErrorResponse(error)` → `{ success: false, error: { message, ... } }`.
- `refreshNotificationCount()` (also from `useHelper`): GETs the role-correct unread-count endpoint and dispatches `setUnreadNotificationCount(response.data.unreadNotificationCount)` into the `notifications` reducer (`{ unreadCount }`).

API definitions used by this module (`ApiDefinitions.*` → method + endpoint):

| Definition | Method | Endpoint (relative to BaseUrl) |
|---|---|---|
| `getAppointments({ page })` | GET | `/prof/client-requests?page={page}` |
| `seenAppointmentRequest({ appointmentId })` | POST | `/prof/appointment-seen/{appointmentId}` |
| `respondToClientRequest({ appointmentId, payload })` | POST | `/prof/appointment-response/{appointmentId}` |
| `getProfessionalsClient()` | GET | `/prof/my-clients` |
| `getUserProfileForProfessional({ userId })` | GET | `/prof/user-profile/{userId}` |
| `suggestScaleToClient({ payload })` | POST | `/prof/suggest-scale` |
| `getPrimaryTestResult({ testId })` | GET | `/prof/primary-test-details/{testId}` |
| `getSuggestedScalesByClient({ clientId })` | GET | `/prof/scales/{clientId}` |
| `getAssessmentDetails({ assessmentId })` | GET | `/prof/assessment/{assessmentId}` |
| `getProfessionalsNotifications({ page })` (via `getNotifications({role,page})`) | GET | `/notifications/all/p?page={page}` |
| `getProfessionalsUnreadNotificationCount()` (via `getNotificationsCount`) | GET | `/notifications/unread-count/p` |

`getNotifications`/`getNotificationsCount` branch on `role` (user → `/u`, professional → `/p`).

### 0.5 Redux slices touched

- **`profRequests`** reducer (`redux/reducers/prof_req.js`), shape `{ requests: [] }`:
  - `PROF_REQUEST_ADD` → appends `payload.requests`.
  - `DELETE_ALL_PROF_REQUEST` → resets to `{ requests: [] }`.
  - `PROF_REQUEST_REMOVE` → removes by `_id`.
  - `PROF_REQUEST_SEEN` → mutates the matching request's `hasProfViewed = true` (in-place mutation, then returns a new array).
  - Action creators (`redux/actions/prof_req.js`): `addClientRequests`, `clearClientRequests`, `removeClientRequests`, and `seenRequestAction(request)` which, **only if `!request.hasProfViewed`**, dispatches `PROF_REQUEST_SEEN` and `NEW_NOTIFICATION_COUNT_MINUS` with `{ noti_type: 'APPOINTMENT_REQUESTED' }`.
- **`prof`** reducer (`redux/reducers/prof.js`): holds `numOfNewNotifications`, `numOfNewClientRequests`. `NEW_NOTIFICATION_COUNT_MINUS` with `noti_type === 'APPOINTMENT_REQUESTED'` decrements **both** counters by 1 (used to update homepage badges when a request is opened). Note: the `notifications` slice does **not** handle this action — only the `prof` slice does.
- **`notifications`** reducer: `{ unreadCount }`, set via `SET_UNREAD_NOTIFICATION_COUNT` (through `refreshNotificationCount`) and reset on logout.
- **`auth`** slice: `role` is read by `Notification` and `useBackPress`.

### 0.6 Backend domain model (reference)

- A **client request** is an `Appointment` document with `hasProfRespondedToClient === false`. It carries `user` (the client), `dateByClient`, `dateByProfessional`, `permissionToSeeProfile`, `hasProfViewed`.
- Marking a request seen (`/prof/appointment-seen/:id`) sets `hasProfViewed = true` server-side and returns the appointment + a top-level `hasProfRespondedToClient` flag.
- Responding (`/prof/appointment-response/:id`) creates/activates a `ProfessionalsClient` (status `ACCEPTED`), optionally creates a `ProfessionalsAssessment` (the suggested initial scale), and sends notifications + emails. After this the appointment's `hasProfRespondedToClient` becomes `true`.
- A **suggested scale** is a `ProfessionalsAssessment`: `{ _id, assessmentSlug, hasCompleted, stage, totalWeight, questionAnswers[], completedAt }`.
- Notifications have a `type` (one of `APPOINTMENT_REQUESTED`, `APPOINTMENT_ACCEPTED`, `SUGGEST_A_SCALE`, `SCALE_FILLUP_BY_USER`), a `for` field (`user` | `professional`), `hasSeen`, `createdAt`, and (depending on type) embedded `user`, `prof`, `appointment`, `assessment` docs.

---

## 1. `ClientRequest.js` — Incoming appointment requests list

**Route:** `PROF_CLIENT_REQUEST` (`ClientRequestPro`) · **Header title:** `Client Requests`

### Purpose
Paginated list of pending appointment requests (Appointments with `hasProfRespondedToClient=false`) addressed to the logged-in professional. Each card summarizes the requesting client and links to the respond screen.

### Navigation IN
- From `PROF_HOMEPAGE` (prof dashboard menu/badge).
- No required params.

### Local state
- `isLoading` (initial `true`), `seeMoreLoading`, `refreshing`, `page` (1), `hideSeeMoreButton` (true), `requestsCount` (0).
- `useIsFocused()` drives re-fetch on focus.

### Redux
- Reads `state.profRequests.requests`.
- Writes via `clearClientRequests()` (on page-1 fetch), `addClientRequests(response.data.requests)`, and `seenRequestAction(apRequest)` when a card's "Send Response" is tapped.

### Data fetch / pagination logic
`getClientRequests(page=1)`:
- If `page === 1`: `clearPageData()` (resets page to 1, `requestsCount` to 0, dispatches `clearClientRequests`) and sets `isLoading=true`; else sets `seeMoreLoading=true`.
- `GET /prof/client-requests?page={page}` via `ApiExecutor(ApiDefinitions.getAppointments({ page }))`.
- Clears the relevant loader. If `!response.success` → return silently (no error UI).
- `setPage(page)`, `dispatch(addClientRequests(response.data.requests))`.
- On page 1 only: `setRequestsCount(response.data.requestsCount)`.

**Response shape:** `{ requests: Appointment[], requestsCount: number }`.

**See-more visibility:** an effect sets `hideSeeMoreButton = requests.length >= requestsCount`. The button calls `getClientRequests(page + 1)`.

**Focus / refresh effect:** an effect keyed on `[refreshing, isFocused]`:
- If `refreshing` → `getClientRequests()` then clears `refreshing`.
- Else if focused → `getClientRequests()` (page 1).
- `onRefresh` (pull-to-refresh) just sets `refreshing=true`.

### UI content
- `ScrollView` (white bg) with `RefreshControl`.
- While `isLoading`: centered large `ActivityIndicator` (`colors.primary`).
- If no requests: centered bold Bangla text **`এই মুহূর্তে কোন ক্লায়েন্ট রিকোয়েস্ট নেই`** ("No client requests right now").
- Else each request card (`requestBlock`, gray border):
  - Client name (bold) — `apRequest.user.name`.
  - Icon `card-account-details` + marital/age: ``${isMarried ? 'বিবাহিত' : 'অবিবাহিত'}, বয়স - ${age}`` (Married/Unmarried, Age - N).
  - Icon `map-marker-radius` + location: `union, upazila, zila` joined with `, ` (falsy parts filtered out) from `apRequest.user.location`.
  - Icon `clock-time-three` + `formatDateTime(apRequest.dateByClient)` (the client's proposed time).
  - **"Send Response"** button (English label) bottom-right.
- `seeMoreLoading` spinner and `SeeMoreButton text="See more"` shown when more pages remain.

### Respond entry (`handleSendResponse(apRequest)`)
1. `dispatch(seenRequestAction(apRequest))` — if not already viewed, marks the request seen locally and decrements prof badge counters.
2. `navigation.navigate(PROF_RESPONSE_CLIENT_REQUEST, { appointmentId: apRequest._id, goToBack: PROF_CLIENT_REQUEST })`.

### Navigation OUT
- → `PROF_RESPONSE_CLIENT_REQUEST` (see §2).

### Back behavior
`useBackPress(PROF_CLIENT_REQUEST)` → map default `PROF_HOMEPAGE`, so `navigation.replace(<prof homepage>)`.

### Edge cases
- Failed fetch shows nothing extra (returns silently) — list keeps prior content; an empty page-1 yields the "no requests" message.
- The `requests` array persists in redux across navigations; page-1 fetch always clears it first to avoid duplicates.

---

## 2. `ResponseRequest.js` (`ResponseClientRequest`) — Respond to / accept an appointment

**Route:** `PROF_RESPONSE_CLIENT_REQUEST` (`ResponseClientRequest`) · **Header title:** `Client Request`

### Purpose
Show the selected appointment request, let the professional (a) optionally pick a flexible date/time, (b) optionally suggest an initial assessment scale, (c) optionally write a message, then confirm — which accepts the appointment and (server-side) creates the `ProfessionalsClient`, sends the client the professional's phone number, and optionally creates a suggested scale.

### Navigation IN
- From `ClientRequest` ("Send Response") with `{ appointmentId, goToBack: PROF_CLIENT_REQUEST }`.
- From `NotificationTab` on an `APPOINTMENT_REQUESTED` notification with `{ appointmentId, goToBack: NOTIFICATIONS }`.
- Params: `appointmentId` (required), `goToBack` (optional; defaults to `backScreenMap[PROF_RESPONSE_CLIENT_REQUEST]` = `PROF_HOMEPAGE`). `previousPage` is set from `goToBack`.

### Module-level setup
- `times[]`: 24 generated `{label,value}` time slots starting 6:00AM (built by `calculateTime`) — **defined but not used** by the rendered UI (time is chosen via the time picker instead).
- `assessmentList`: derived from `profScales` (`App/data/profScales`) as `{ label: name, value: name, id }`.

### Local state
- `isLoading` (true), `error` (null), `appointmentInfo` (null).
- `isSubmitLoading`, `day`, `time`, `assessment`, `message`.

### Initial load (effect on `[appointmentId]`)
1. If no `appointmentId` → `setError('অনুগ্রহ করে আবার চেষ্টা করুন')` ("Please try again") and stop.
2. `POST /prof/appointment-seen/{appointmentId}` via `seenAppointmentRequest`.
   - `!success` → `setError(seenResponse.error?.message)`.
   - If `seenResponse.hasProfRespondedToClient` (already responded) → `setError('ইতোমধ্যে রেসপন্স দেওয়া হয়েছে')` ("A response has already been given") and stop.
   - Else `await refreshNotificationCount()`, clear error, `setAppointmentInfo(seenResponse.data.appointment)`, `setIsLoading(false)`.
- An effect on `[error]`: when error is set, also clears `isLoading` and `isSubmitLoading`.

**`appointment` shape consumed:** `{ _id, user: { _id, name }, dateByClient, permissionToSeeProfile }`.

### UI content
- Background: `lightenColor(colors.background, 60)`; `ScrollView`.
- Guard: `if (!appointmentInfo) return null;` (renders nothing until loaded — note this runs even while `isLoading`).
- While `isLoading` → `Loader`. If `error` → `ErrorButton` with the error title. Else the form:
  - Client name centered, uppercase (`username`).
  - **Profile access**: if `permissionToSeeProfile === true` → a "See Profile" button (`navigation.push(CLIENT_PROFILE, { userId })`). Else Bangla note **`ইউজার তার প্রফাইলের তথ্য দেখার অনুমতি প্রদান করেনি`** ("The user has not granted permission to view their profile information").
  - **Proposed time:** label `Proposed time:` + `formatDateTime(dateByClient)`.
  - **Select a flexible time: (optional)** — two `AppDateTimePicker`s side by side: a date picker (`mode="date"`, sets `day`) and a time picker (`mode="time"`, sets `time`).
  - **Select an Assessment Tool: (optional)** — `Picker` over `assessmentList`; sets `assessment` (`{label,value,id}`).
  - **Send a message: (optional)** — multiline `TextInput` (5 lines), placeholder describing contact hours; sets `message`.
  - Gray note: **"After confirming the request, your phone number will be send to client."**
  - `Loader` while submitting; `SubmitButton` titled **"Confirm Request"** (hidden while submitting).

### Submit flow (`onSubmitHandler`)
1. Start from `appointmentDateTime = new Date(appointmentInfo.dateByClient)`.
2. If `day` is a valid date → override year/month/date.
3. If `time` is a valid date → override hours/minutes.
4. Zero out seconds & ms.
5. Build payload:
   ```js
   { dateByProfessional: appointmentDateTime, message, initAssessmentSlug: assessment?.id, userId }
   ```
   where `userId = appointmentInfo.user._id` (computed below the early-return, in render scope).
6. `setIsSubmitLoading(true)`, `POST /prof/appointment-response/{appointmentId}` via `respondToClientRequest`.
   - `!success` → `setError(response.error?.message)` (note: loader is not explicitly reset here, but the `[error]` effect resets it).
   - Success → `await refreshNotificationCount()`, `setIsSubmitLoading(false)`, toast **`ক্লায়েন্টের অনুরোধটি গ্রহণ করা হয়েছে`** ("The client's request has been accepted"), then `navigation.replace(previousPage)`.

**Server effects:** activates `ProfessionalsClient` (status `ACCEPTED`), optionally creates a `ProfessionalsAssessment` from `initAssessmentSlug`, sends notifications (`APPOINTMENT_ACCEPTED`, and `SUGGEST_A_SCALE` if a slug was sent) + emails to the client.

### Navigation OUT
- → `CLIENT_PROFILE` (`{ userId }`) via `push`, only if `permissionToSeeProfile === true`. (Because `goToBack` is not passed here, ClientProfile's back resolves to its map default `GO_TO_BACK`, and the "Suggest Scale" section is hidden — see §4 condition.)
- After successful submit → `navigation.replace(previousPage)` (the request list or notifications).

### Back behavior
`useBackPress(PROF_RESPONSE_CLIENT_REQUEST, previousPage)`. With `goToBack=PROF_CLIENT_REQUEST` or `NOTIFICATIONS`, hardware back replaces to that screen (role-resolved). Default (no param) → `PROF_HOMEPAGE`.

### Edge cases
- Missing/invalid `appointmentId` → error message, no form.
- Already-responded appointment → error message; no double-accept.
- `userId` is referenced inside `payload` before its `const` declaration appears in source order, but both run inside the same render after the `if (!appointmentInfo) return null` guard, so `appointmentInfo` is non-null when `onSubmitHandler` is invoked. Rebuild should hoist `userId`/`username`/`proposedAppointmentDate` above usage for clarity.
- Date/time pickers are optional; if untouched, the client's proposed datetime is confirmed as-is.

---

## 3. `MyClients.js` (`ProMyClients`) — Accepted clients list

**Route:** `PROFESSIONALS_CLIENT` (`ProMyClients`) · **Header title:** `My Clients`

### Purpose
List the professional's accepted clients (`ProfessionalsClient` records). Each card → that client's profile.

### Navigation IN
- From `PROF_HOMEPAGE`. Optional `goToBack` param (used by back handler).

### Local state
`clients` ([]), `isLoading` (true), `isRefreshing`, `error`.

### Data fetch (`fetchClients`)
- `GET /prof/my-clients` via `getProfessionalsClient()`.
- `setIsLoading(false)`; `!success` → `setError(response.error.message)`; else `setClients([...response.data.clients])`.
- Runs once on mount; `onRefresh` re-runs it with `isRefreshing` toggling.

**Client shape:** `{ _id (clientId), customId, user: { _id, name, age, gender, isMarried, location:{union,upazila,zila} } }`.

### UI content
- `ScrollView` + `RefreshControl`.
- `isLoading` → `Loader`; `error` → `ErrorButton`; empty → centered Bangla **`এই মুহূর্তে কোন ক্লায়েন্ট নেই`** ("No clients right now").
- Else each `clientCard`:
  - `ID: {customId}` (gray small).
  - Name (`capitalizeFirstLetter(user.name)`).
  - Line: ``বয়স - ${numberWithCommas(age)} বছর, ${genderMap(gender)}, ${isMarried ? 'বিবাহিত' : 'অবিবাহিত'}`` — `genderMap`: `Male→পুরুষ`, `Female→মহিলা`, else `অন্যান্য`.
  - Location line: `union, upazila, zila` (falsy filtered, joined `, `).
  - **"See Profile"** button (secondary color).

### Navigation OUT
- "See Profile" → `navigation.navigate(CLIENT_PROFILE, { clientId: client._id, userId: client.user._id, goToBack: PROFESSIONALS_CLIENT })`.
  - Passing `goToBack=PROFESSIONALS_CLIENT` is what **enables** the "Suggest Scale" and "Previous Suggested Scales" sections in ClientProfile (§4).

### Back behavior
`useBackPress(PROFESSIONALS_CLIENT, goToBack)` → default map `PROF_HOMEPAGE`.

---

## 4. `ClientProfile.js` (`ClientProfile`) — Client profile, test history, recommend scales

**Route:** `CLIENT_PROFILE` (`ClientProfile`) · **Header title:** `Client Profile`

### Purpose
Full read of a client's profile + the three primary scales + important-info profiles, plus (when reached from MyClients) the ability to recommend an assessment scale and review previously suggested scales.

### Navigation IN
- From `MyClients` with `{ clientId, userId, goToBack: PROFESSIONALS_CLIENT }` → full feature set.
- From `ResponseRequest` "See Profile" with `{ userId }` only (via `push`) → read-only (no `clientId`, no suggest section).
- Params: `goToBack`, `userId`, `clientId` (clientId optional).

### Module-level
`assessmentList` from `profScales` (`{label,value,id}`).

### Local state
`refreshing`, `isLoading` (true), `scaleLoading`, `showAdviceToDoTest` (false), `userData` (null), `userStatus` (null), `assessment` (null), `error`, `prevSuggestedScalesLoading`, `prevSuggestedScales` ([]). `useIsFocused()` triggers `init` on focus.

### Data fetch
`init()` = `getProfileDetails()` then `getSuggestedScalesByClient()`.

`getProfileDetails`:
- `GET /prof/user-profile/{userId}` via `getUserProfileForProfessional`.
- `!success` → `setError`. Else `setUserData(response.data)` and set `userStatus`:
  - if `user.isMarried === 'Unmarried'` → ``অবিবাহিত, বয়স - ${age}`` else ``বিবাহিত, বয়স - ${age}``. (Note the comparison is against the string `'Unmarried'`.)

`getSuggestedScalesByClient`:
- Returns early if no `clientId` (so read-only mode skips it).
- `GET /prof/scales/{clientId}` via `getSuggestedScalesByClient`.
- `!success` → `setError`. Else `setPrevSuggestedScales(response.data.scales)`.

**`userData` shape consumed:**
```
{
  user: { name, age, isMarried, address, email },
  progress: {
    manoshikObosthaJachaikoron: { test_id, stage } | null,
    manoshikChapNirnoy: {...} | null,
    duschintaNirnoy: {...} | null,
    coronaProfile, psychoticProfile, suicideIdeation, domesticViolence, childCare (same shape)
  }
}
```
**suggested scale shape:** `{ _id, assessmentSlug, hasCompleted, stage }`.

`onRefresh`: sets `refreshing`, runs `init`, clears `refreshing`.

### Guards
`if (!userData) return null;` and `if (!userData?.user?.name) return null;` — render nothing until data loads.

### UI content
Within `ScrollView` + `RefreshControl`:
- `isLoading` → `Loader`; `error` → `ErrorButton`.
- **Profile block**: name (`capitalizeFirstLetter`); rows with icons:
  - `card-account-details` + `userStatus` (marital + age).
  - `map-marker-radius` + `user.address`.
  - `email` + `user.email`.
- **"Three Scales" block** — three `ThreeScaleTestBlock`s:
  - `মানসিক অবস্থা যাচাইকরণ` ← `progress.manoshikObosthaJachaikoron`
  - `মানসিক চাপ নির্ণয়` ← `progress.manoshikChapNirnoy`
  - `দুশ্চিন্তা নির্ণয়` ← `progress.duschintaNirnoy`
  - All `isSpecialTest={false}`.
- **"গুরুত্বপূর্ণ তথ্যাবলী" (Important Information) block** — five blocks:
  - `করোনা সম্পর্কিত তথ্য` ← `coronaProfile`
  - `গুরুতর সমস্যা সম্পর্কিত তথ্য` ← `psychoticProfile`
  - `আত্মহত্যা পরিকল্পনা সম্পর্কিত তথ্য` ← `suicideIdeation`
  - `পারিবারিক সহিংসতা সম্পর্কিত তথ্য` ← `domesticViolence`
  - `সন্তান পালন সম্পর্কিত তথ্য` ← `childCare`
  - All `isSpecialTest={false}`.

**`ThreeScaleTestBlock({ name, isDataPresent, testId, stage, isSpecialTest })`** (inner component):
- `isDataPresent = !!progress.<key>`.
- If present: shows **`স্কোর দেখুন`** ("See score") + `arrow-right` icon and the `stage` text; tappable.
- If absent: right-aligned **`পূরণ করেনি`** ("Has not completed"); tap is a no-op (`if (!isDataPresent) return`).
- onPress → `navigation.navigate(CLIENT_TEST_RESULT, { testId, isSpecialTest })`.

- **"Suggest Scale" block** — rendered **only if `goToBack === PROFESSIONALS_CLIENT`**:
  - `Picker` over `assessmentList` → sets `assessment`.
  - While `scaleLoading` → `Loader`; else optional advice text `Assessment recommended for {name}` (shown when `showAdviceToDoTest` — note this flag is set `false` in the handler and never set `true`, so the line is effectively dormant) + **"Recommend Assessment"** `SubmitButton` (secondary color).
- **"Previous Suggested Scales" block** — rendered only if `goToBack === PROFESSIONALS_CLIENT` **and** `prevSuggestedScales.length > 0`:
  - For each suggested scale, a `ThreeScaleTestBlock` with `name = typeLabelMap(assessmentSlug)`, `isDataPresent = hasCompleted`, `testId = _id`, `stage`, `isSpecialTest={true}` → so tapping a completed one opens `CLIENT_TEST_RESULT` in special-test mode.
  - `prevSuggestedScalesLoading` shows a `Loader`.

### Suggest-scale flow (`suggestScaleHandler`)
1. Return if no `assessment` selected.
2. Throw if `userId` or `clientId` missing.
3. `setShowAdviceToDoTest(false)`, `setScaleLoading(true)`.
4. `assessmentSlug = assessment.id`; payload `{ userId, clientId, assessmentSlug }`.
5. `POST /prof/suggest-scale` via `suggestScaleToClient`.
6. `setScaleLoading(false)`; `!success` → `setError`; else `setAssessment(null)` and re-fetch `getSuggestedScalesByClient()` (so the new scale appears under "Previous Suggested Scales").

**Server effect:** creates a `ProfessionalsAssessment` and sends a `SUGGEST_A_SCALE` notification + email to the client.

### Navigation OUT
- → `CLIENT_TEST_RESULT` from any test block (params depend on `isSpecialTest`).

### Back behavior
`useBackPress(CLIENT_PROFILE, goToBack)`. From MyClients `goToBack=PROFESSIONALS_CLIENT` → replace to that screen; from ResponseRequest (no goToBack) → map default `GO_TO_BACK` → `navigation.goBack()`.

### Edge cases
- Read-only mode (no `clientId`) hides both suggest/previous sections and skips `/prof/scales`.
- `isMarried` is compared to the literal `'Unmarried'`; any other truthy value renders "বিবাহিত". Rebuild should confirm the backend field's exact type/values.
- `error` shown via `ErrorButton` but never auto-cleared.

---

## 5. `ClientTestResult.js` (`ClientTestResult`) — View a test result

**Route:** `CLIENT_TEST_RESULT` (`ClientTestResult`) · **Header title:** `Scale Result`

### Purpose
Read-only display of a single test result — either a **primary** test (3-scale / info profile) or a **special** test (a suggested `ProfessionalsAssessment`). Shows type, severity, score, completion date, and the per-question answers.

### Navigation IN
- From `ClientProfile` `ThreeScaleTestBlock` with `{ testId, isSpecialTest }`.
- From `NotificationTab` on a `SCALE_FILLUP_BY_USER` notification with `{ testId: assessment._id, isSpecialTest: true }`.
- Params: `testId`, `isSpecialTest` (boolean).

### Local state
`isLoading` (true), `error`, `type`, `severity`, `questionAnswers` ([]), `score` (0), `completedAt`.

### Data fetch (`getResult`, on mount)
- **If `isSpecialTest`:** `GET /prof/assessment/{testId}` via `getAssessmentDetails`. Reads `response.data.scale`:
  - `type = scale.assessmentSlug`, `severity = scale.stage`, `questionAnswers = scale.questionAnswers (array)`, `score = +scale.totalWeight`, `completedAt = formatDateTime(scale.completedAt)`.
- **Else (primary):** `GET /prof/primary-test-details/{testId}` via `getPrimaryTestResult`. Reads `response.data.test`:
  - `type = test.type`, `severity = test.severity`, `questionAnswers = test.questionAnswers`, `score = +test.score`, `completedAt = formatDateTime(test.createdAt)`.
- `!success` → `setError(response.error.message)`.

**`questionAnswers` item:** `{ question, answer }`.

### UI content
- `isLoading` → `Loader`. `error` → `ErrorButton` with retry `onPress={() => getResult()}`.
- Guard: if `!type || questionAnswers.length === 0` → render nothing.
- Header card: `typeLabelMap(type)` (big primary), `severity` if present, `স্কোর: {numberWithCommas(score)}` if `score > 0`, and `completedAt`.
- Scrollable list: each `{index+1}. {question}` then `arrow-right` icon + `{answer}`.

### Navigation OUT
None (terminal screen).

### Back behavior
`useBackPress(CLIENT_TEST_RESULT)` → map default `GO_TO_BACK` → `navigation.goBack()` (returns to ClientProfile or Notifications).

### Edge cases
- Empty `questionAnswers` → blank screen (guard returns null).
- `score === 0` hides the score line; absent `severity` hides that line.
- `typeLabelMap` (`utils/type.js`) maps known slugs (e.g. `depression_scale`, the Bangla 3-scale keys) to display names, else returns the raw type.

---

## 6. `Assessments.js` (`ProAssessments`) — Assessment tools list

**Route:** `PROF_ASSESSMENT_TOOLS` (`ProAssessments`) · **Header title:** `Assessment tools`

### Purpose
Static, scrollable list of all professional assessment tools (from `profScales`), each opening a detail view.

### Navigation IN
- From `PROF_HOMEPAGE` (informational; not gated to clients). No params.

### Data
`scales` = `App/data/profScales` (the full scale definitions). `formattedScales = scales.map(s => ({ id, name }))`.

### UI content
- Notice (Bangla): **`এখানে সর্বমোট ১০ টি অ্যাসেসমেন্ট টুলস রয়েছে। এগুলো সম্পর্কে বিস্তারিত জানতে নিচে ক্লিক করুন।`** ("There are a total of 10 assessment tools here. Click below to learn more about them.")
  - Note: the text says "১০" (10) but `profScales` actually defines 11 scales; the count is hardcoded and stale. Rebuild should derive the count from `scales.length`.
- One gray `block` per scale showing `scale.name`; tap → `onScalePress(scale.id)`.

### Navigation OUT
- → `navigation.navigate(PROF_ASSESSMENT_TOOL_DETAILS, { assessmentId: scale.id })`.

### Back behavior
`useBackPress(PROF_ASSESSMENT_TOOLS)` → map `GO_TO_BACK` → `goBack()`.

---

## 7. `AssessmentDetails.js` (`ProAssessmentDetails`) — Tool overview

**Route:** `PROF_ASSESSMENT_TOOL_DETAILS` (`ProAssessmentDetails`) · **Header title:** `Tool Overview`

### Purpose
Show one scale's name, copyright/attribution, and the list of its questions (no options, no scoring) — a preview of the instrument.

### Navigation IN
- From `Assessments` with `{ assessmentId }` (= `scale.id`).

### Data
`scale = scales.find(s => s.id === assessmentId)` from `profScales`. `if (!scale) return null`.

### UI content
- `scale.name` (centered bold title).
- `scale.copyright` (centered attribution).
- For each `scale.ques[]`: an `arrow-right-circle` icon + `s.question`. (Options/weights are **not** shown.)

### Navigation OUT / Back
No outward navigation. `useBackPress(PROF_ASSESSMENT_TOOL_DETAILS)` → `GO_TO_BACK` → `goBack()`.

---

## 8. `SuggestedScaleResult.js` — Suggested-scale viewer (STUB / dead)

**Route file present; renders a placeholder.**

### Current behavior
- Reads `assessmentId` from route params; finds `scale` in `profScales`.
- `getResult()` toggles a loader but its network call is commented out (`// const response = await axios.get(.../prof/test-details/${testId})`).
- **The component returns `<><p> Hello there </p></>`** — `<p>` is not a valid React Native element; this would not render correctly on device. The full scored UI exists only as commented-out JSX.
- Local state `answers`, `isLoading` are declared but effectively unused.

### Rebuild guidance
This screen is **non-functional** and should be rebuilt from scratch or removed. The actual "view a scale the client submitted" path is served by `ClientTestResult` in special-test mode (`isSpecialTest=true` → `/prof/assessment/:id`). If a dedicated professional scale viewer is desired, model it on `ClientTestResult`: fetch the `ProfessionalsAssessment`, render `scale.name` + per-question `{question, answer}` rows. The commented JSX hints at that exact layout (heading + numbered questions + `arrow-right` + answer).

---

## 9. `Notification.js` (`Notifications`) — Notification feed

**Route:** `NOTIFICATIONS` (`Notifications`) · **Header title:** `Notifications`

> Shared by both roles; `role` from `state.auth` selects the user vs professional endpoints. This module documents the professional path (`/notifications/all/p`).

### Purpose
Paginated, pull-to-refresh notification list. Renders each item via `NotificationTab`, which handles per-type routing. Refreshes the unread badge count on every fetch.

### Navigation IN
- From `PROF_HOMEPAGE` (bell/badge). No params.

### Local state
`currentPage` (1), `notifications` ([]), `isLoading` (true), `refreshing`, `seeMoreLoading`, `hideSeeMoreButton` (true), `totalNotificationCount` (0). `useIsFocused()` triggers a page-1 fetch on focus.

### Redux
- Reads `state.auth.role`.
- `refreshNotificationCount()` dispatches `setUnreadNotificationCount` after every fetch.

### Data fetch / pagination (`getNotifications(page=1)`)
- Page 1: `isLoading=true`, reset `totalNotificationCount=0` and `notifications=[]`. Else `seeMoreLoading=true`.
- `GET /notifications/all/p?page={page}` via `getNotifications({ role, page })` (role-branched).
- `await refreshNotificationCount()` (marks-as-seen happens server-side when the feed is fetched; unread count is refreshed).
- Clear the relevant loader. `!success` → `console.error(response)` and return (TODO: surface via ErrorButton).
- `response.data` = `{ notifications: [], numberOfNotifications: number }`.
- If the returned array is non-empty → `setCurrentPage(page)`. Append: `setNotifications(prev => [...(prev??[]), ...notifications])`.
- Page 1 only: `setTotalNotificationCount(numberOfNotifications)`.
- Effect: `hideSeeMoreButton = notifications.length >= totalNotificationCount`.
- `onRefresh`: sets `refreshing`, runs page-1 fetch, clears `refreshing`.

### UI content
- `ScrollView` (`colors.background`) + `RefreshControl`.
- `isLoading` → `Loader`.
- Empty → centered bold **"No new notifications"**.
- Else list of `NotificationTab` (key=index), `seeMoreLoading` `Loader`, and `SeeMoreButton text="আরো দেখুন"` ("See more") calling `getNotifications(currentPage + 1)`.

### Back behavior
`useBackPress(NOTIFICATIONS)` → map default `HOMEPAGE`, role-resolved to the prof homepage for a professional.

### Edge cases
- Fetch errors only `console.error` (no visible error UI) — a known TODO.
- Marking notifications seen is implicit (server marks on feed fetch); `hasSeen` on each item drives the highlight styling in `NotificationTab`.

---

## 10. `components/NotificationTab.js` — Single notification row

### Purpose
Render one notification with a type-specific icon, message (with bolded names), relative timestamp, unread highlight, and tap → route.

### Props
`{ notification }`.

### Derived fields
- `username = capitalizeFirstLetter(notification.user?.name)`, `profname = capitalizeFirstLetter(notification.prof?.name)`.
- **Guard:** `if (!username || !profname) return null;` — a notification missing either embedded name renders nothing. (Rebuild caution: this hides notifications whose payload lacks one of the two parties; verify the backend always embeds both, or relax this guard.)

### Type → message / icon / route mapping
Uses `TYPES` and `typeLabelMap` from `utils/type.js`. Message uses `{...}` markers that `renderMessage()` splits and bolds (the brace content is bolded + capitalized).

| `notification.type` | Icon | Message template | Tap target (`screen`) | Params |
|---|---|---|---|---|
| `APPOINTMENT_REQUESTED` | `account-clock` | `{username} has requested an appointment.` | `PROF_RESPONSE_CLIENT_REQUEST` | `{ appointmentId: appointment._id, goToBack: NOTIFICATIONS }` |
| `APPOINTMENT_ACCEPTED` | `calendar-check` | `{profname} has scheduled an appointment on {date} at {time}.` | `APPOINTMENT_STATUS` | `{ appointmentId: appointment._id, professionalId: prof._id, goToBack: NOTIFICATIONS }` |
| `SUGGEST_A_SCALE` | `clipboard-text` | `{profname} suggested scale - {scaleName}.` | `PROF_SUGGESTED_SCALE` | `{ assessmentId: assessment._id, goToBack: NOTIFICATIONS }` |
| `SCALE_FILLUP_BY_USER` | `check-circle` | `{username} has completed the {scaleName} assessment.` | `CLIENT_TEST_RESULT` | `{ testId: assessment._id, isSpecialTest: true }` |
| (any other) | — | — | — | returns `null` (row not rendered) |

Details:
- `APPOINTMENT_ACCEPTED`: `date`/`time` formatted from `appointment.dateByProfessional` via `toLocaleDateString`/`toLocaleTimeString` (`en-US`, e.g. "Jun 16, 2026" / "3:00 PM").
- `SUGGEST_A_SCALE` / `SCALE_FILLUP_BY_USER`: `scaleName = typeLabelMap(notification.assessment.assessmentSlug)`.
- `timeAgo = formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })` (date-fns).

> Note on audiences: `APPOINTMENT_REQUESTED` and `SCALE_FILLUP_BY_USER` are notifications shown to the **professional** (and route to prof screens). `APPOINTMENT_ACCEPTED` and `SUGGEST_A_SCALE` are oriented to the **user** (route to user screens: appointment status, fill-up scale). The backend `for` field (`user`|`professional`) governs which feed (`/u` vs `/p`) returns which items; this single component renders all types and is reused for both feeds.

### UI / styling
- Row: icon circle (left) + text column (message + timestamp).
- If `!notification.hasSeen`: container background/border use `colors.highlight` and icon color `colors.textPrimary` (unread emphasis).
- `renderMessage()` splits the template on `/(\{.*?\})/`; brace segments → bold (`capitalizeFirstLetter(inner)`), other segments → normal text.

### Tap behavior
`onPress` → `navigation.navigate(screen, params)`. (No mark-as-seen call here; seen state comes from the feed fetch / `refreshNotificationCount`.)

---

## 11. Assessment data model

### 11.1 `App/data/pro/assessmentTools/list.js`
A lightweight id+name catalog of 11 tools (CommonJS `module.exports = { assessments }`). Each `{ id (uuid), name }`. **Not imported by the screens in this module** — the response/profile/assessment screens use `profScales` instead (whose `id`s are slugs, not these uuids). This list appears to be a parallel/legacy catalog. The 11 names:

1. Depression Scale
2. Dhaka University Obsessive Compulsive Disorder Scale
3. Dhaka University Cognitive Distortion Scale
4. Beck Hopelessness Scale
5. Locke-Wallace Short Marital Adjustment Test
6. Social Interaction Anxiety Scale
7. Somatic Complaints Scale
8. Nicotine Addiction Scale
9. Social Avoidance and Distress Scale
10. Satisfaction with Life Scale
11. Aggression Scale

> Rebuild note: reconcile these uuid-based ids with the slug-based ids in `profScales` (see below). The live suggest-scale flow keys off `profScales[].id` (slugs like `depression_scale`).

### 11.2 `App/data/profScales.js` — the live professional scale definitions

Default-exports an **array of scale objects** (the source file is ~2352 lines; structure summarized below, not transcribed). The header comment documents the schema:

```js
{
  id,               // slug, e.g. 'depression_scale' — used as assessmentSlug
  name,             // display name
  needToEvaluate,   // boolean (true for all defined scales)
  copyright,        // attribution string (shown on AssessmentDetails)
  ques: [
    {
      question,     // Bangla prompt text
      options: [ { label, value, weight } ]   // note: schema comment says "option" but data uses "options"
    }
  ],
  range: [ { min, max, severity } ]   // score band → severity label
}
```

**Scales defined (id → name):**

| id (slug) | name | answer style | range bands (min–max → severity) |
|---|---|---|---|
| `depression_scale` | Depression Scale | 5-point Likert (weights 1–5) | 30–93 Minimal; 94–100 Depressed; 101–114 Mild; 115–123 Moderate; 124–150 Severe |
| `dhaka_university_obsessive_compulsive_scale_(duocs)` | DUOCS | Likert | 0–17 Cut-off; 18–23 Mild; 24–40 Moderate; 41–49 Severe; 50–80 Profound |
| `somatic_complaints_scale` | Somatic Complaints Scale | Likert | 0–28 Cut-off; 29–42 Mild; 43–50 Moderate; 51–55 Severe; 56–72 Profound |
| `dhaka_university_cognitive_distortion_scale_(ducds)` | DUCDS | Likert | 0–55 Cut-off; 56–72 Mild; 73–91 Moderate; 92–109 Severe; 110–100000 Profound |
| `aggression_scale` | Aggression Scale | Likert | 0–45 / 46–60 / 61–89 / 90–106 / 107–100000 (Bangla severity labels: স্বাভাবিক→চরম ক্রোধ) |
| `satisfaction_with_life_scale` | Satisfaction with life scale | 7-point | 31–35 down to 5–9 (Bangla satisfaction bands; note this scale's bands are descending) |
| `hopelessness_scale_(beck)` | Hopelessness Scale (Beck) | true/false (0/1) | 0–3 None/minimal; 4–8 Mild; 9–14 Moderate; 15–100000 Severe |
| `social_interaction_anxiety_scale` | Social Interaction Anxiety Scale | Likert | 0–20 Slightly; 21–40 Moderately; 41–60 Very Much; 61–80 Extremely |
| `nicotine_addiction_scale` | Nicotine Addiction Scale | Likert | 0–20 / 21–40 / 41–60 / 61–80 (Slightly→Extremely) |
| `social_avoidance_and_distress_scale` | Social avoidance and distress scale | true/false (সত্য/মিথ্যা, 0/1) | 0–5 সর্বনিম্ন; 6–15 মধ্যম; 16–28 সর্বোচ্চ |

(11 total when counting the `list.js` "Aggression Scale" / "Satisfaction" variants; the live array contains 10–11 fully-defined objects depending on duplicates — derive `scales.length` at runtime rather than trusting any hardcoded count.)

**Option-value variety to handle in a rebuild:**
- **Likert scales** use 5 (or 7) options with `value`/`weight` typically equal and increasing (e.g. `১ … ৫`).
- **True/false scales** (Beck Hopelessness, Social Avoidance) use two options `{label, value, weight}` where the scored direction can be **reversed per question** — e.g. `সত্য` may be `weight 0` on one item and `weight 1` on another. Reverse scoring is encoded in the per-question `weight`, so scoring must read each option's `weight`, not assume a fixed mapping.

### 11.3 How a suggested scale is rendered and scored

- **Recommend (professional side):** `ClientProfile.suggestScaleHandler` posts `{ userId, clientId, assessmentSlug: scale.id }` to `/prof/suggest-scale`. The backend creates a `ProfessionalsAssessment` with that `assessmentSlug` and notifies the client (`SUGGEST_A_SCALE`).
- **Fill-up (client side, outside this module):** the client opens the scale (via `PROF_SUGGESTED_SCALE` route), answers each `ques[]` using its `options[]`, and submits. Scoring = sum of selected options' `weight`. The total maps into `range[]` (`min ≤ total ≤ max`) to derive `severity` (the `stage`). The result becomes `{ totalWeight, stage, questionAnswers:[{question, answer}], completedAt, hasCompleted: true }`.
- **Review (professional side):** the completed `ProfessionalsAssessment` is fetched by `ClientTestResult` in special mode (`/prof/assessment/:id`) — showing `assessmentSlug` (→ `typeLabelMap`), `stage` as severity, `totalWeight` as score, and the `questionAnswers`. In `ClientProfile`, completed suggested scales appear under "Previous Suggested Scales" with their `stage`.

---

## 12. Cross-screen flow summary

```
PROF_HOMEPAGE
  ├─▶ ClientRequest (/prof/client-requests, paginated)
  │      └─(Send Response, seenRequestAction)──▶ ResponseRequest
  │                                                ├─ POST /prof/appointment-seen/:id  (on open)
  │                                                ├─(See Profile, if permitted)──▶ ClientProfile (userId only, read-only)
  │                                                └─(Confirm Request)─ POST /prof/appointment-response/:id
  │                                                       → creates ProfessionalsClient(ACCEPTED) [+ optional suggested scale]
  │                                                       → replace(previousPage)
  ├─▶ MyClients (/prof/my-clients)
  │      └─(See Profile)──▶ ClientProfile (clientId+userId, goToBack=ProMyClients → full features)
  │                           ├─ GET /prof/user-profile/:userId
  │                           ├─ GET /prof/scales/:clientId (previous suggested scales)
  │                           ├─(Recommend Assessment)─ POST /prof/suggest-scale → refetch scales
  │                           └─(test block)──▶ ClientTestResult
  │                                              ├─ primary:  GET /prof/primary-test-details/:testId
  │                                              └─ special:  GET /prof/assessment/:testId
  ├─▶ Assessments (profScales list)
  │      └─▶ AssessmentDetails (questions + copyright)
  └─▶ Notifications (/notifications/all/p, paginated)
         └─ NotificationTab (per-type routing)
              ├─ APPOINTMENT_REQUESTED  ──▶ ResponseRequest
              ├─ APPOINTMENT_ACCEPTED   ──▶ AppointmentStatus (user)
              ├─ SUGGEST_A_SCALE        ──▶ ProfSuggestedScale (user fill-up)
              └─ SCALE_FILLUP_BY_USER   ──▶ ClientTestResult (isSpecialTest)
```

## 13. Known issues / rebuild cautions

1. `SuggestedScaleResult.js` renders an invalid `<p>` stub — rebuild or delete (use `ClientTestResult` special mode as the model).
2. `Assessments.js` hardcodes "১০ টি" (10) tools while `profScales` defines 11 — derive count from data.
3. `NotificationTab` returns `null` if either `user.name` or `prof.name` is missing — verify backend always embeds both parties or loosen the guard.
4. `Notification` swallows fetch errors with only `console.error` (TODO to add an ErrorButton).
5. `ResponseRequest` references `userId` in the payload object before its `const` is declared (works due to render ordering after the null guard) — hoist for clarity.
6. `PROF_REQUEST_SEEN` reducer mutates state in place before returning a new array — replace with an immutable update.
7. `list.js` (uuid ids) and `profScales.js` (slug ids) are two parallel catalogs; the live flows use slug ids — reconcile.
8. `error` state in `ClientProfile`/`ClientTestResult` is set but never auto-cleared on successful retry/refresh — consider clearing at the start of each fetch.
