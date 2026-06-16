# 04 — User ↔ Professional Interaction (Browse & Book Appointments)

> **Audience:** Engineers rebuilding the QLife / Quality Life mobile app (React Native / Expo) from scratch, without access to the original source.
>
> **Scope of this document:** Everything a *regular USER* (role `USER`) does to discover mental-health professionals, request an appointment, and track that appointment's status.
>
> **Screens documented here (exact files in the legacy repo):**
> - `App/screens/AllProfessionals.js` → route `AllProfessionals`
> - `App/screens/professionalDetails.js` → route `professionalDetails`
> - `App/screens/AppointmentSuccess.js` → route `AppointmentSuccess`
> - `App/screens/UserIntProf/AppointmentStatus.js` → route `AppointmentStatus`
> - `App/components/DateTimePicker.js` → shared component `AppDateTimePicker`

---

## 0. Shared infrastructure used by every screen here

These are referenced repeatedly below. Read this section first.

### 0.1 Route-name constants (`App/navigation/constants.js`)

The constants relevant to this flow (the *value* is the actual React Navigation route name registered in the stack):

| Constant | Route name (string) |
|---|---|
| `PROFESSIONALS_LIST` | `AllProfessionals` |
| `PROFESSIONAL_DETAILS` | `professionalDetails` |
| `USER_APPOINTMENT_TAKEN` | `AppointmentSuccess` |
| `APPOINTMENT_STATUS` | `AppointmentStatus` |
| `PROF_SUGGESTED_SCALE` | `ProfSuggestedScale` |
| `HOMEPAGE` | `Homepage` |
| `APPOINTMENT_REQUESTED` | `APPOINTMENT_REQUESTED` *(status value, not a route)* |
| `APPOINTMENT_ACCEPTED` | `APPOINTMENT_ACCEPTED` *(status value, not a route)* |
| `GO_TO_BACK` | `:: go back ::` *(sentinel)* |
| `SPECIAL_LOGOUT_ACTION` | `:: logout ::` *(sentinel)* |

### 0.2 Header titles (`App/navigation/StackNavigator.js`)

| Route | Header title (Bangla/English as in source) | Custom `headerLeft`? |
|---|---|---|
| `AllProfessionals` | **আমাদের প্রফেশনালস** | No (default back arrow) |
| `professionalDetails` | **অ্যাপয়েন্টমেন্ট নিন** | Yes — overrides back to `navigation.replace(backScreenMap[PROFESSIONAL_DETAILS])` = `AllProfessionals` |
| `AppointmentSuccess` | **অভিনন্দন** | Yes — overrides back to `navigation.navigate(backScreenMap[USER_APPOINTMENT_TAKEN])` = `AllProfessionals` |
| `AppointmentStatus` | **Appointment** | Yes — if `route.params.goToBack` set → `navigation.replace(goToBack)`, else `navigation.navigate(backScreenMap[APPOINTMENT_STATUS])` = `AllProfessionals` |

### 0.3 Back-screen map (`App/navigation/backScreenMap.js`)

```
PROFESSIONALS_LIST   (AllProfessionals)   → HOMEPAGE       (Homepage)
PROFESSIONAL_DETAILS (professionalDetails)→ PROFESSIONALS_LIST (AllProfessionals)
APPOINTMENT_STATUS   (AppointmentStatus)  → PROFESSIONALS_LIST (AllProfessionals)
USER_APPOINTMENT_TAKEN (AppointmentSuccess)→ PROFESSIONALS_LIST (AllProfessionals)
```

### 0.4 `useBackPress(screenName, previousPage = null)` (`App/contexts/BackPress.js`)

Hook every screen calls at the top. Registers an Android **hardware back** handler. Logic on back press:

1. `backScreen = backScreenMap[screenName] || null`.
2. If either `backScreen` or `previousPage` equals `SPECIAL_LOGOUT_ACTION` (`:: logout ::`) → `logout()`.
3. Else if either equals `GO_TO_BACK` (`:: go back ::`) → `navigation.goBack()`.
4. Else `targetScreen = previousPage || backScreen`; run it through `selectHomepageByRole(targetScreen, role)` (maps generic homepage to the role-specific route), then `navigation.replace(destination)` (falls back to `navigate` on error). If destination is falsy it logs an error and does nothing.
5. Always returns `true` (consumes the hardware back event).

> **Rebuild note:** This is the *hardware* back. The *header* back arrow behavior is defined separately in `StackNavigator.js` (§0.2). They are intentionally consistent but implemented in two places.

### 0.5 `useHelper().ApiExecutor` (`App/contexts/helper/index.js`)

Single async wrapper used for every network call.

- Signature: `ApiExecutor({ endpoint, method = 'GET', payload = {}, headers = {} })`.
- Injects headers `Content-Type: application/json` and `Authorization: Bearer <accessToken>` (token read from `state.auth.accessToken`).
- Performs `axios({ url, method, headers, data: payload })`.
- **Success:** returns `sendSuccessResponse(response.data.data)` → shape `{ success: true, data: <response.data.data> }`. Note the **double `.data`** — the server envelope is `{ data: {...} }` and axios wraps it once more.
- **Errors handled centrally:**
  - `401` + `type === 'InvalidToken'` → tries `refreshTokener` up to 3× ; on success retries the original call; on failure shows toast “Logging out…” and `logout()`.
  - `401` + `type` starting with `INCOMPLETE_PROFILE:` → for USER navigates to `REGISTER_WITH_EXTRA_INFORMATION`.
  - `401` + `type === 'EmailNotVerified'` → toast “Please verify your email”, navigates to `EMAIL_VERIFICATION_PAGE` with `{ accountType, email }`.
  - Any other error → returns `sendErrorResponse(error)` → shape `{ success: false, error: <error object> }`. Screens read `response.error.message`.

> **Implication for all screens:** A failed call never throws; it returns `{ success:false }`. Screens must check `response.success` before reading `response.data`.

### 0.6 Redux reads/writes in this flow

- **Reads:** `state.auth` (`role`, `accessToken`, `refreshToken`) — consumed indirectly via `ApiExecutor` and `useBackPress`. None of the four screens read `state.user` directly.
- **Writes:** **None.** No screen in this flow dispatches actions. All state is local component state. (Becoming a `ProfessionalsClient` and scale suggestions are server-side effects, surfaced only by re-fetching.)

### 0.7 Backend data model (for accuracy — not stored client-side)

An **Appointment** document carries:

| Field | Meaning |
|---|---|
| `_id` | appointment id |
| `prof` | professional id (also populated to an object on detail endpoints) |
| `user` | user id (populated to `{ name, ... }` on detail) |
| `status` | `APPOINTMENT_REQUESTED` or `APPOINTMENT_ACCEPTED` |
| `dateByClient` | date/time the user requested |
| `dateByProfessional` | date/time the prof confirmed (may override client's) |
| `permissionToSeeProfile` | bool — did user allow prof to view their profile |
| `hasProfViewed` | bool — prof opened the request |
| `hasProfRespondedToClient` | bool |
| `messageFromProf` | optional text shown to user once accepted |

**Constraints / behaviors to honor in the rebuild:**
- A user **cannot hold two active appointments with the same professional** (DB unique index). Re-requesting returns an error (surfaced on `professionalDetails`).
- When a prof **accepts**, the user becomes a `ProfessionalsClient` and may be assigned **suggested scales** to fill out.

---

## 1. Screen: `AllProfessionals` — professional directory

**File:** `App/screens/AllProfessionals.js`
**Route name:** `AllProfessionals` (`constants.PROFESSIONALS_LIST`)
**Header title:** আমাদের প্রফেশনালস

### 1.1 Purpose
Paginated, pull-to-refresh directory of all professionals visible to this user, plus a pinned “your appointments” section for professionals the user has already contacted. Each card lets the user reveal the fee and take a context-sensitive action (request appointment / view update / contact).

### 1.2 Navigation IN
- From **Homepage** drawer / Homepage actions (route is `AllProfessionals`).
- From `QuizResultOutOf100.js`: `navigation.replace(PROFESSIONALS_LIST)`.
- From `HelpCenter.js`: `navigation.replace(PROFESSIONALS_LIST)`.
- No params required/consumed.

### 1.3 Local state
| State | Init | Purpose |
|---|---|---|
| `isLoading` | `true` | full-screen loader for page 1 |
| `isRefreshing` | `false` | pull-to-refresh spinner |
| `currentPage` | `1` | last page successfully fetched (only advanced when a non-empty page returns) |
| `isSeeMoreLoading` | `false` | inline loader under the list during “see more” |
| `isSeeMoreHidden` | `true` | hide the “আরো দেখুন” button when all loaded |
| `professionals` | `[]` | accumulated main list (appended across pages) |
| `totalProfessionalsCount` | `0` | server total (`professionalsCount`) used to decide if more remain |
| `contactedProfessionals` | `[]` | `appointmentsTaken` — appointments not yet relevant for the “client” path |
| `professionalsClient` | `[]` | `isClient` — professionals the user is already a client of |
| `recentlyContactedProfessionals` | `[]` | pinned top section |

### 1.4 API call — `getAllProfessionalsForUser`
- **Definition:** `ApiDefinitions.getAllProfessionalsForUser({ page })`.
- **Method/Endpoint:** `GET {BaseUrl}/user/professionals?page=<n>` (`FIND_PROFESSIONALS_FOR_USER`).
- **Payload:** none (page in query string).
- **Response `data` shape:**
  ```jsonc
  {
    "professionalsCount": <number>,          // total professionals (excludes recently-contacted)
    "professionals": [                       // current page slice
      {
        "_id": "...",
        "name": "...",
        "profession": "...",
        "designation": "...",
        "fee": <number>,
        "union": "...", "upazila": "...", "zila": "...",
        "availableTime": [ { "day": "Sunday", "timeRange": [ { "from": "10:00", "to": "12:00" } ] } ],
        "email": "...", "telephone": "..."
        // ...other profile fields, all passed to professionalDetails via `prof`
      }
    ],
    "appointmentsTaken": [                    // user's existing appointment summaries
      { "_id": "<appointmentId>", "prof": "<profId>", "status": "APPOINTMENT_REQUESTED" | "APPOINTMENT_ACCEPTED" }
    ],
    "isClient": [                             // professionals the user is already a confirmed client of
      { "_id": "...", "prof": "<profId>" /* ... */ }
    ],
    "recentlyContactedProfessionals": [ /* same card fields as `professionals` */ ]
  }
  ```
- **Error:** if `!response.success`, the fetch silently returns (no error UI on this screen). On page-1 failure the screen ends up empty with the “no professionals” message; on see-more failure nothing is appended.

### 1.5 Fetch / pagination logic (`fetchProfessionals(page = 1)`)
- **Page 1 (or refresh):** set `isLoading=true`, clear `professionals`, `totalProfessionalsCount`, `contactedProfessionals`, `recentlyContactedProfessionals`. **Pages > 1:** set `isSeeMoreLoading=true`.
- Await the call; clear the relevant loader.
- If `!success` → return.
- If returned `professionals` array is non-empty → `setCurrentPage(page)` (page only advances when there was real data — prevents incrementing past the end).
- Append: `setProfessionals(prev => [...prev, ...professionals])`.
- **Only on page 1**, set `totalProfessionalsCount`, `contactedProfessionals` (=`appointmentsTaken`), `professionalsClient` (=`isClient`), `recentlyContactedProfessionals`.
- **See-more visibility effect:** `isSeeMoreHidden = (professionals.length + recentlyContactedProfessionals.length) >= totalProfessionalsCount`. Recomputed whenever those three change.

> **Rebuild caveat (bug-preserving vs. fixing):** Because `recentlyContactedProfessionals` is counted toward the “loaded” total but `professionalsCount` excludes them, the “see more” button can hide early. Keep behavior identical unless explicitly fixing.

### 1.6 Pull-to-refresh
`RefreshControl` on the `ScrollView`; `onRefresh` (useCallback, `[]` deps) sets `isRefreshing=true`, calls `fetchProfessionals()` (page 1), then `isRefreshing=false`.

### 1.7 Initial load
`useEffect([])` calls `fetchProfessionals()` once on mount.

### 1.8 UI content

Root: `ScrollView` (background `colors.background`, padding 10) with the `RefreshControl`.

While `isLoading` → `<Loader visible />` (marginVertical 10).

Otherwise:
- **Empty state:** if `professionals.length + recentlyContactedProfessionals.length === 0` → centered bold text **“এ মুহূর্তে কোনো প্রফেশনাল নেই।”**
- **Recently-contacted section** (only if `recentlyContactedProfessionals.length > 0`):
  - If main list also non-empty, a centered bold header **“আপনার অ্যাপয়েন্টমেন্ট তালিকা”**.
  - One card per recently-contacted professional (same card layout as below).
  - If main list non-empty, a centered bold header **“ বিশেষজ্ঞদের তালিকা ”** before the main list.
- **Main list:** one card per `professionals` entry.
- **Inline loader** `<Loader visible={isSeeMoreLoading} />`.
- **See-more button** `<SeeMoreButton visible={!isSeeMoreHidden && !isSeeMoreLoading} text="আরো দেখুন" onPress={() => fetchProfessionals(currentPage + 1)} />` (secondary-color pill, right-aligned).

**Professional card (`eProContiner`)** — white card, 1px `#ddd` border, radius 5:
| Row | Icon (`MaterialCommunityIcons`) | Field shown |
|---|---|---|
| Name (large bold, `colors.textPrimary`, 22px) | — | `professional.name` |
| Profession | `card-account-details-star` | `professional.profession` |
| Designation | `briefcase-account` | `professional.designation` |
| Location | `map-marker` | `[union, upazila, zila].filter(Boolean).join(', ')` |
| Action row | — | **FeeComponent** (left) + **RequestAppointmentBtn** (right) |

> Note: `workplace` / `availableTime` are **not** displayed on the card; `availableTime` is used only on `professionalDetails`.

**`FeeComponent` (local)** — primary-color pill. Default label **“ফি দেখুন”**. Tapping toggles `isVisible`; when visible shows **`${numberWithCommas(fee)} টাকা`** (digits rendered in Bangla numerals; `0`/empty → “০”). Toggling again hides it. Local state `fee`, `isVisible`; effect re-derives `fee` from `isVisible`/`feeValue`.

**`RequestAppointmentBtn` (local)** — primary-color pill whose label and action depend on the user's relationship with `prof`:

```
isClient   = professionalsClient.find(c => c.prof === prof._id)
existingAp = contactedProfessionals.find(c => c.prof === prof._id)
```

| Condition | Button label | Action on press |
|---|---|---|
| `isClient` truthy | **যোগাযোগ করুন** | `navigate(APPOINTMENT_STATUS, { appointmentId: existingAp._id, professionalId: existingAp.prof, goToBack: 'AllProfessionals' })` |
| not client, `existingAp.status === APPOINTMENT_REQUESTED` | **ইতোমধ্যেই অনুরোধ করা হয়েছে** | *(no-op — handler only acts when `isClient` or `!existingAp`)* |
| not client, `existingAp.status === APPOINTMENT_ACCEPTED` | **আপডেট দেখুন** | *(no-op via handler; see note)* |
| not client, `existingAp` exists other status | **অ্যাপয়েন্টমেন্ট নিন** | *(no-op)* |
| no `existingAp` at all | **অ্যাপয়েন্টমেন্ট নিন** | `navigation.replace(PROFESSIONAL_DETAILS, { prof })` |

> **Important behavioral subtlety:** `handleAppointmentAction` only does something when `isClient` (→ AppointmentStatus) **or** when `!existingAp` (→ professionalDetails). If `existingAp` exists but the user is *not yet* a client (status still `APPOINTMENT_REQUESTED`, or `APPOINTMENT_ACCEPTED` but not yet promoted to client), the button is effectively inert. Preserve unless fixing. The `professionalId` param passed to AppointmentStatus is unused by that screen but kept for parity.

### 1.9 Navigation OUT
| Target | Trigger | Params |
|---|---|---|
| `professionalDetails` | tap card action when no existing appointment | `{ prof }` (full professional object) via `navigation.replace` |
| `AppointmentStatus` | tap card action when user is already a client | `{ appointmentId, professionalId, goToBack: 'AllProfessionals' }` via `navigation.navigate` |

### 1.10 Back behavior
- Hardware back (`useBackPress('AllProfessionals')`) → `backScreenMap` → `Homepage` (role-resolved), via `replace`.
- Header back: default arrow (no override) → standard stack pop.

### 1.11 Edge cases
- Empty directory → “এ মুহূর্তে কোনো প্রফেশনাল নেই।”
- Already-requested appointment → button is informational only (“ইতোমধ্যেই অনুরোধ করা হয়েছে”).
- Refresh resets everything before re-fetching page 1.
- Non-array / empty `professionals` page does **not** advance `currentPage`, so “see more” re-requests the same page.

---

## 2. Screen: `professionalDetails` — appointment request form

**File:** `App/screens/professionalDetails.js`
**Route name:** `professionalDetails` (`constants.PROFESSIONAL_DETAILS`)
**Header title:** অ্যাপয়েন্টমেন্ট নিন

### 2.1 Purpose
Show a chosen professional's profile and the form to request an appointment: pick a day + time, choose whether to share the user's profile, see the fee, and submit. On success the user is sent to the confirmation screen.

### 2.2 Navigation IN
- From `AllProfessionals` via `navigation.replace(PROFESSIONAL_DETAILS, { prof })`.
- **Param:** `prof` — the full professional object (read as `route.params.prof || {}`). If absent, `prof` is `{}` (the early `if (!prof) return null` never triggers because `{}` is truthy; screen renders with blank fields).

### 2.3 Local state
| State | Init | Purpose |
|---|---|---|
| `day` | `null` | selected `Date` (date portion) |
| `time` | `null` | selected `Date` (time portion) |
| `permission` | `true` | share-profile choice (bool) |
| `error` | `null` | inline error string |
| `isLoading` | `false` | submit spinner |

### 2.4 Derived data — `dateTime` map (prof's available times)
Built from `prof.availableTime` (array of `{ day, timeRange:[{from,to}] }`):
```
dateTime[t.day] = t.timeRange.map(ft => `${ft.from} - ${ft.to}`)   // only when timeRange.length > 0
```
Rendered grouped by weekday using the canonical `days` list (`App/utils/date.js`, Bangla labels রবিবার…শনিবার). Section only renders if at least one day has times.

### 2.5 UI content

`ScrollView` (white bg):
1. **General info card** (centered, elevated): `prof.name` (26px bold primary), then `prof.profession`, `prof.designation`, `prof.email` (16px gray).
2. **Available-time block** (conditional): header **“প্রফেশনালদের নির্ধারিত সময়”**; per weekday a `blockHeader` (Bangla day label) + wrapped chips of `"from - to"` (secondary-color chips).
3. **Date/time picker block:** header **“দিন সময় বাছাই করুন ”**; two side-by-side `AppDateTimePicker`s:
   - Left (width 49%, inner width 97%): `placeholder="দিন"`, `mode="date"`, `onSelectDateTime={setDay}`, `selectedDateTime={day}`.
   - Right (width 49%): `placeholder="সময়"`, `mode="time"`, `onSelectDateTime={setTime}`, `selectedDateTime={time}`.
4. **Permission block:** header **“আপনি কি আপনার প্রোফাইলটি প্রফেশনালের সাথে শেয়ার করতে ইচ্ছুক?”**; `RadioButton.Group` (react-native-paper), `value={permission}`, options from `permissions = [{label:'হ্যাঁ',value:true},{label:'না',value:false}]`.
5. **Fee block:** header **“ অ্যাপয়েন্টমেন্ট ফি ”**; value `${numberWithCommas(prof.fee)} টাকা` (Bangla numerals).
6. **Loader** while `isLoading`.
7. **`ErrorButton`** `title={error} visible={error && !isLoading}`.
8. **`SubmitButton`** title **“অ্যাপয়েন্টমেন্ট নিন”**, `onPress={onPressHandler}`, `disabled={!(day && time)}`, `visible={!isLoading}`.

### 2.6 Submit flow — `onPressHandler`
1. Guard: if `!day || !time` → `setError('দয়া করে দিন ও সময় নির্বাচন করুন')` and return. (Button is also disabled until both set, so this is a secondary guard.)
2. Build `payload = { profId: prof._id, permissionToSeeProfile: permission }`.
3. Compose `appointmentDateTime` = `new Date()` then overwrite Y/M/D from `day` (if valid `Date`) and H/M from `time` (if valid), seconds & ms set to 0. Assign to `payload.dateByClient`.
4. `setIsLoading(true)` → `ApiExecutor(ApiDefinitions.requestForAppointment({ payload }))` → `setIsLoading(false)`.
5. If `!response.success` → `setError(response.error.message)` and return.
6. On success → `navigation.replace(USER_APPOINTMENT_TAKEN)` (no params).

### 2.7 API call — `requestForAppointment`
- **Method/Endpoint:** `POST {BaseUrl}/user/take-appointment` (`TAKE_APPOINTMENT`).
- **Payload:** `{ profId, permissionToSeeProfile, dateByClient }`.
- **Response:** success envelope (data unused by the screen).
- **Error:** `response.error.message` shown via `ErrorButton`. The most important real error is the **duplicate-appointment** case (DB unique index: user already has an active appointment with this prof) — its server message surfaces here verbatim.

### 2.8 Navigation OUT
| Target | Trigger | Params |
|---|---|---|
| `AppointmentSuccess` (`USER_APPOINTMENT_TAKEN`) | successful request | none — via `navigation.replace` |

### 2.9 Back behavior
- Hardware back (`useBackPress('professionalDetails')`) → `backScreenMap` → `AllProfessionals` (replace).
- Header back arrow (override): `navigation.replace(backScreenMap[PROFESSIONAL_DETAILS])` = `AllProfessionals`.

### 2.10 Edge cases
- No `availableTime` → available-time block hidden entirely.
- `prof` missing → renders with empty strings / `০ টাকা` fee (`numberWithCommas(undefined)` → “০”).
- Submit disabled until both day and time chosen.
- Picking, then clearing a value (via the picker's Clear button) sets it back to `null`, re-disabling submit.

---

## 3. Component: `AppDateTimePicker` (`App/components/DateTimePicker.js`)

Shared field used twice on `professionalDetails` (and elsewhere). Wraps `@react-native-community/datetimepicker`.

### 3.1 Props
| Prop | Default | Meaning |
|---|---|---|
| `icon` | — | optional left `MaterialCommunityIcons` glyph |
| `placeholder` | — | shown when nothing selected |
| `mode` | `'date'` | `'date'` or `'time'` |
| `onSelectDateTime(date\|null)` | — | callback with selected `Date`, or `null` when cleared |
| `selectedDateTime` | — | current `Date` value (controlled) |
| `style` | — | extra container style |
| `width` | `'100%'` | container width |

### 3.2 Behavior
- Local `showPicker` (bool).
- Tapping the field (`TouchableWithoutFeedback`) → `setShowPicker(true)`.
- Renders the native picker only while `showPicker`, `value={selectedDateTime || new Date()}`, `mode`, `display="default"`.
- `handleChange(_event, date)` → `setShowPicker(false)`; if `date` truthy → `onSelectDateTime(date)`. (If the user dismisses without choosing, no callback.)
- **Display:** when `selectedDateTime` set → `mode==='date'` shows `toLocaleDateString()`, else `toLocaleTimeString([], {hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:true})`. When unset → the `placeholder`.
- Right-side glyph: `calendar` (date mode) or `clock` (time mode).
- **Clear button:** rendered only when `selectedDateTime` set; red bold “Clear” text; press → `onSelectDateTime(null)`.

### 3.3 Rebuild notes
- Time display includes seconds in the label but `professionalDetails` zeroes seconds before sending — cosmetic only.
- The component is fully controlled; parent owns the value.

---

## 4. Screen: `AppointmentSuccess` — confirmation

**File:** `App/screens/AppointmentSuccess.js`
**Route name:** `AppointmentSuccess` (`constants.USER_APPOINTMENT_TAKEN`)
**Header title:** অভিনন্দন

### 4.1 Purpose
Static thank-you / confirmation screen shown immediately after a successful appointment request.

### 4.2 Navigation IN
- From `professionalDetails` via `navigation.replace(USER_APPOINTMENT_TAKEN)`. No params.

### 4.3 UI content
`ScrollView` (`#eee` bg) → single white elevated card containing:
- `<AuthIcon />` (the app logo image `new_logo.png`, 170×130, centered).
- Centered bold text (17px, lineHeight 28):
  **“অ্যাপয়েন্টমেন্ট নেওয়ার জন্য আপনাকে ধন্যবাদ। মেইলের মাধ্যমে আপনাকে পরবর্তী আপডেট জানানো হবে!”**

No state, no API calls, no redux.

### 4.4 Back behavior
- Hardware back (`useBackPress('AppointmentSuccess')`) → `backScreenMap` → `AllProfessionals` (replace).
- Header back arrow (override): `navigation.navigate(backScreenMap[USER_APPOINTMENT_TAKEN])` = `AllProfessionals`.

### 4.5 Navigation OUT
None initiated by the screen (only back).

---

## 5. Screen: `AppointmentStatus` — appointment detail & contact

**File:** `App/screens/UserIntProf/AppointmentStatus.js`
**Route name:** `AppointmentStatus` (`constants.APPOINTMENT_STATUS`)
**Header title:** Appointment

### 5.1 Purpose
Once a user is a confirmed client, this screen shows the accepted appointment: the professional's contact info (call/email), the schedule, an optional message from the professional, and any **suggested scales** the professional asked the user to complete.

### 5.2 Navigation IN
- From `AllProfessionals` `RequestAppointmentBtn` (when `isClient`): `navigation.navigate(APPOINTMENT_STATUS, { appointmentId, professionalId, goToBack: 'AllProfessionals' })`.
- **Params consumed:** `appointmentId` (required), `goToBack` (optional — drives back nav). `professionalId` is passed but unused here.

### 5.3 Local state
| State | Init | Purpose |
|---|---|---|
| `isLoading` | `true` | loader while fetching details, then again while fetching scales |
| `curAppointment` | `null` | the populated appointment; screen returns `null` until set |
| `suggestedScales` | `[]` | scales suggested by the prof for this user |

### 5.4 Data load — `getAppointmentDetails()` (in `useEffect([])`)
Two sequential calls:

**(a) `findAppointmentById`**
- **Method/Endpoint:** `GET {BaseUrl}/user/appointment-details/<appointmentId>` (`APPOINTMENT_DETAILS`).
- Then `setIsLoading(false)`. If `!success` → return.
- `response.data.appointment` shape (populated):
  ```jsonc
  {
    "_id": "...",
    "status": "APPOINTMENT_ACCEPTED",
    "prof":  { "_id": "...", "name": "...", "email": "...", "telephone": "..." },
    "user":  { "name": "..." },
    "dateByClient": "<ISO>",
    "dateByProfessional": "<ISO>|null",
    "messageFromProf": "..."|null,
    "permissionToSeeProfile": <bool>
  }
  ```
- `setCurAppointment(appointment)`.

**(b) `findSuggestedScales`** (only proceeds after appointment loaded)
- `setIsLoading(true)` again, then:
- **Method/Endpoint:** `GET {BaseUrl}/user/find-suggested-scales/<appointment.prof._id>` (`FIND_SUGGESTED_SCALES_FOR_USER`).
- `setIsLoading(false)`. If `!success` → return.
- `response.data.scales` → array of `{ _id, assessmentSlug, ... }`. `setSuggestedScales(scales ?? [])`.

### 5.5 `dialCall(number)`
Android → `Linking.openURL('tel:'+number)`; iOS → `Linking.openURL('telprompt:'+number)`.

### 5.6 UI content
Guard: `if (!curAppointment) return null;` (blank screen until first call resolves).

`ScrollView` (white). While `isLoading` → `<Loader />`. Otherwise:
1. **Header block:** `prof.name` (26px bold primary, centered), `prof.email` (gray), and a tappable `prof.telephone` → `dialCall`.
2. **Info line (gray, centered):** **“আপনি এখন প্রফেশনালের সাথে কল বা ইমেইলের মাধ্যমে সরাসরি যোগাযোগ করতে পারবেন”**.
3. **Detail section:**
   - `Patient:` → `curAppointment.user.name`.
   - `Appointment schedule:` → `formatDateTime(dateByProfessional || dateByClient)` → e.g. `January 5, 2026, 3:00 PM (Monday)` (English long date; weekday from `getUTCDay()`).
   - `Message:` → `curAppointment.messageFromProf` (row rendered only if present).
   - **Suggested scales** (only if `suggestedScales.length > 0`): info text **“দয়া করে প্রফেশনাল নির্দেশিত এই স্কেলগুলো পূরণ করুন”**, then one secondary-color button per scale **whose `assessmentSlug` matches an entry in `scalesData` (`App/data/profScales.js`)** — unmatched slugs are filtered out. Button label = the matched scale's `name`.

### 5.7 The three appointment-status states & how each is rendered

> The user reaches this screen only when already a *client* (status `APPOINTMENT_ACCEPTED`). The “three states” describe how the appointment is surfaced across this flow:

| State | Where surfaced | Rendering |
|---|---|---|
| **Requested** (`APPOINTMENT_REQUESTED`) | `AllProfessionals` card button | Button label **“ইতোমধ্যেই অনুরোধ করা হয়েছে”**, inert. User has *not* yet reached `AppointmentStatus`. |
| **Accepted, not yet client** (`APPOINTMENT_ACCEPTED`, not in `isClient`) | `AllProfessionals` card button | Button label **“আপডেট দেখুন”** (currently inert in handler). |
| **Accepted & client** (in `isClient`) | `AppointmentStatus` screen | Full detail: contact info, schedule (`dateByProfessional || dateByClient`), optional `messageFromProf`, suggested scales. |

On `AppointmentStatus` itself, the schedule line transparently prefers the professional's confirmed time (`dateByProfessional`) and falls back to the user's requested time (`dateByClient`).

### 5.8 Navigation OUT
| Target | Trigger | Params |
|---|---|---|
| `ProfSuggestedScale` (`PROF_SUGGESTED_SCALE`) | tap a suggested-scale button | `{ assessmentId: scale._id, slug: scale.assessmentSlug, goToBack, appointmentId }` via `navigation.replace` |
| Phone dialer | tap telephone | `tel:`/`telprompt:` via `Linking` |

### 5.9 Back behavior
- Hardware back (`useBackPress('AppointmentStatus', goToBack)`): if `goToBack` provided it's the `previousPage`; resolved per §0.4 → typically `AllProfessionals` (replace).
- Header back arrow (override): if `route.params.goToBack` → `navigation.replace(goToBack)`; else `navigation.navigate(backScreenMap[APPOINTMENT_STATUS])` = `AllProfessionals`.

### 5.10 Edge cases
- Appointment fetch fails → `curAppointment` stays `null` → screen renders nothing (blank). No error UI.
- No suggested scales → scales section omitted.
- Suggested scale whose `assessmentSlug` has no local `scalesData` match → button not rendered.
- `messageFromProf` empty → Message row omitted.
- `telephone` missing → tappable area still renders (empty), dialing a blank number.

---

## 6. End-to-end flow summary

```
Homepage
  └─(navigate)→ AllProfessionals (GET /user/professionals?page=n, paginated + pull-refresh)
        ├─ card "অ্যাপয়েন্টমেন্ট নিন" (no existing appt) ──replace──▶ professionalDetails {prof}
        │        └─ pick day+time, share-profile?, fee ──POST /user/take-appointment──▶
        │                 success ──replace──▶ AppointmentSuccess (static thank-you)
        │                 error (e.g. duplicate active appt) ──▶ inline ErrorButton
        ├─ card "ইতোমধ্যেই অনুরোধ করা হয়েছে" (REQUESTED) ── inert
        ├─ card "আপডেট দেখুন" (ACCEPTED, not client) ── inert
        └─ card "যোগাযোগ করুন" (client) ──navigate──▶ AppointmentStatus {appointmentId, goToBack:'AllProfessionals'}
                 ├─ GET /user/appointment-details/:id  → contact + schedule + message
                 ├─ GET /user/find-suggested-scales/:profId → scale buttons
                 ├─ tap telephone → tel:/telprompt:
                 └─ tap scale ──replace──▶ ProfSuggestedScale {assessmentId, slug, goToBack, appointmentId}
```

Back routing throughout collapses to `AllProfessionals` (and from there to `Homepage`), via both the hardware-back hook and the per-screen header overrides.
