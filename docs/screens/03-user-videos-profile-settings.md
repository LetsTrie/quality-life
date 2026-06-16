# QLife / Quality Life — Screen Spec 03: Video Exercises, Help Center, Profile, Settings & Drawer

> Rebuild specification for the React Native (Expo) mental-health app **Quality Life / QLife**.
> Repo: `frontend/`. This document is exhaustive enough to rebuild the listed screens without the source.
> Source paths are relative to `frontend/App/`.

---

## 0. Shared infrastructure (referenced by every screen below)

### 0.1 Route name constants (`navigation/constants.js`)
Relevant constants (key → route name string):

| Constant | Route name |
| --- | --- |
| `VIDEO_SCREEN` | `VideoScreen` |
| `VIDEO_EXERCISE_LIST` | `VideoExerciseList` |
| `VIDEO_EXERCISE` | `VideoExercise` |
| `RATING` | `Rating` |
| `PROFILE` | `Profile` |
| `UPDATE_USER_PROFILE` | `UpdateProfile` |
| `SETTINGS` | `Setting` |
| `ABOUT_US` | `AboutUs` |
| `PRIVACY_POLICY` | `PrivacyPolicy` |
| `UPDATE_PASSWORD` | `UpdatePassword` |
| `HELP_CENTER` | `HelpCenter` |
| `CENTRAL_HELP_CENTER` | `CentralHelpCenter` |
| `SIDEBAR_APP_GUIDELINE` | `DrawerGuideline` |
| `MENTAL_HEALTH_ASSESSMENT` | `HomepageScale` |
| `TEST` | `Test` |
| `PROFESSIONALS_LIST` | `AllProfessionals` |
| `NOTIFICATIONS` | `Notifications` |
| `HOMEPAGE` | `Homepage` |
| `PROF_HOMEPAGE` | `ProHomepage` |
| `PROF_PROFILE` | `ProfProfile` |
| `WELCOME` / `LOGIN` / `PROF_LOGIN` | `Welcome` / `Login` / `LoginPro` |
| `SPECIAL_LOGOUT_ACTION` | `:: logout ::` |
| `GO_TO_BACK` | `:: go back ::` |
| `QUALITY_LIFE` | `Quality Life` |

### 0.2 Header titles (`navigation/StackNavigator.js`)
Each screen is a `Stack.Screen`. Titles below are what the navigation header shows.

| Route | Header title (Bangla) |
| --- | --- |
| `VideoExerciseList` | `অনুশীলন করুন` |
| `VideoExercise` | `অনুশীলন` |
| `VideoScreen` | dynamic — set at runtime to `page.title`, fallback `Quality Life` (no static title in navigator) |
| `Rating` | `মানসিক স্বাস্থ্য পরিমাপের অবস্থা` |
| `Profile` | `প্রোফাইল` |
| `UpdateProfile` | `প্রোফাইল আপডেট করুন` |
| `Setting` | `সেটিংস` |
| `AboutUs` | `আমাদের সম্পর্কিত তথ্য` |
| `PrivacyPolicy` | `গোপনীয়তা নীতি` |
| `UpdatePassword` | `পাসওয়ার্ড পরিবর্তন করুন` |
| `HelpCenter` | `সাহায্য কেন্দ্র` |
| `CentralHelpCenter` | `সাহায্য কেন্দ্র` |
| `DrawerGuideline` | `ব্যবহারিক নির্দেশিকা` |

Screens with a custom `headerLeft` (a `HeaderBackButton`) that overrides the default OS/stack back: `VideoExerciseList`, `VideoExercise`, `UpdateProfile`, `Rating`, `Profile`, `AboutUs`, `PrivacyPolicy`, `HelpCenter`, `VideoScreen`, `UpdatePassword`. `Setting`, `CentralHelpCenter`, `DrawerGuideline` have NO custom `headerLeft` (default stack back arrow). `Test` sets `headerLeft: () => undefined` (no header back button at all).

### 0.3 Back-button system
Two mechanisms work together. **Both** must be reproduced.

1. **Hardware/Android back** — the `useBackPress(screenName, previousPage?)` hook (`contexts/BackPress`). On `hardwareBackPress`:
   - Resolves `backScreen = backScreenMap[screenName]`.
   - If `backScreen` or `previousPage` equals `SPECIAL_LOGOUT_ACTION` (`:: logout ::`) → call `logout()`.
   - Else if either equals `GO_TO_BACK` (`:: go back ::`) → `navigation.goBack()`.
   - Else `target = previousPage || backScreen`; pass through `selectHomepageByRole(target, role)` (swaps `Homepage`↔`ProHomepage` to match the logged-in role); then `navigation.replace(destination)` (falls back to `navigate` on error). Returns `true` (consumes the event).
2. **Header back arrow** — defined per-screen in `StackNavigator.js`. Most call `navigation.navigate(backScreenMap[<route>])`; `HelpCenter` uses `navigation.replace(route.params.goToBack || backScreenMap.HelpCenter)`.

`backScreenMap` (`navigation/backScreenMap.js`) entries relevant here:

| Screen | Back target |
| --- | --- |
| `VideoScreen` | `Profile` |
| `VideoExerciseList` | `Homepage` |
| `VideoExercise` | `VideoExerciseList` |
| `UpdateProfile` | `Profile` |
| `Profile` | `Homepage` |
| `Setting` | `Homepage` |
| `AboutUs` | `Setting` |
| `PrivacyPolicy` | `Setting` |
| `UpdatePassword` | `Setting` |
| `HelpCenter` | `Homepage` |
| `CentralHelpCenter` | `Homepage` |
| `DrawerGuideline` | `Homepage` |
| `Rating` | `VideoExerciseList` |

### 0.4 API plumbing (`contexts/helper/index.js` → `useHelper()`)
- `ApiExecutor({ endpoint, method='GET', payload={}, headers={} })`: axios call with `Authorization: Bearer <accessToken>`, `Content-Type: application/json`. Returns `sendSuccessResponse(response.data.data)` → `{ success: true, data }`, or `sendErrorResponse(error)` → `{ success: false, ... }` (error object carries `.message` / `.error.message`).
  - On `401` + `type==='InvalidToken'`: silently refresh token (up to 3 retries) then retry; on exhaustion → toast `Logging out...` + `logout()`.
  - On `401` + `type` starting with `INCOMPLETE_PROFILE:` → redirects to the appropriate registration step.
  - On `401` + `type==='EmailNotVerified'` → toast + navigate to `EMAIL_VERIFICATION_PAGE`.
- `logout()`: dispatches `SIGN_OUT`, `PROF_SIGN_OUT`, `DELETE_PROFILE`, `DELETE_ALL_PROF_REQUEST`, `RESET_NOTIFICATION_COUNT`; then `navigation.reset({ index: 0, routes })` where routes = `[{Welcome}, {LoginPro}]` for professionals else `[{Welcome}, {Login}]`; then `DrawerActions.closeDrawer()`.

### 0.5 API definitions used here (`services/api.js` + `services/endpoints.js`)
All endpoints are `${BaseUrl}` + path.

| `ApiDefinitions.*` | Method | Endpoint path | Payload |
| --- | --- | --- | --- |
| `seenVideo({videoId})` | POST | `/user/seen-video/<videoId>` | none |
| `submitUserRating({payload})` | POST | `/user/add-rating` | `{ videoUrl, contentId, rating, comment }` |
| `updateUserProfile({payload})` | POST | `/user/update/profile` | `{ name, age, gender, isMarried(bool), location:{zila,upazila,union} }` |
| `resetUserPassword({payload})` | POST | `/user/reset-password` | `{ oldPassword, newPassword }` |
| `resetProfPassword({payload})` | POST | `/prof/reset-password` | `{ oldPassword, newPassword }` |
| `deleteUserAccount()` | POST | `/user/delete-account` | none |
| `deleteProfessionalAccount()` | POST | `/prof/delete-account` | none |
| `updateVisibility({visibility})` | POST | `/prof/update-visibility` | `{ visibility }` |

### 0.6 Redux user slice (`redux/reducers/user.js`, `redux/actions/user.js`)
State shape: `{ name, age, gender, isMarried, address, email, msm_score, msm_date, moj_score, moj_date, mcn_score, mcn_date, dn_score, dn_date, isProfileCompleted, mentalHealthProfile:[], shownVideo:[] }`.
- `UPDATE_SV` (action `shownVideoAction(videoUrl)`): `shownVideo = [...new Set([...shownVideo, payload])]` (dedup append of a videoId).
- `UPDATE_PROFILE` (action `updateProfileAction(data)`): replaces `name, age, gender, isMarried, address, email`.
- `UPDATE_MHP` (`mentalHeathProfileAction`): dedup-appends to `mentalHealthProfile`.
- `GET_PROFILE` / `DELETE_PROFILE` reset/hydrate the slice.
`role` lives in `state.auth.role` (`'user'` | `'professional'`, see `utils/roles.js`: `isUser`, `isProfessional`). Professional visibility flag lives in `state.prof.visibility`.

---

## 1. VideoExerciseList — `screens/VideoExerciseList.js`

**Purpose:** Grid/list of all 20 video exercises, each marked done/pending based on which videos the user has watched.

- **Route name:** `VideoExerciseList` · **Header title:** `অনুশীলন করুন`.
- **Navigation IN:** From Homepage (an "অনুশীলন করুন" entry point). No params required.
- **Back:** `useBackPress('VideoExerciseList')` → hardware back replaces with `Homepage`. Header back arrow → `navigate(Homepage)`.

**Redux reads:** `shownVideo` from `state.user`.
**Redux writes:** none.
**Local state:** none. **API calls:** none.

**UI:** `ScrollView` (bg `colors.background`, padding 10). Maps over `resources` (the 20 videos from `data/videos.js`, in array order) rendering a `Box` per video:
- `Box` is a `TouchableOpacity` row: video `name` (left, `numberOfLines={2}`) + status icon (right): `done.png` if `shownVideo.includes(resource.videoId)`, else `pending.png`.
- Card style: white, rounded 10, subtle shadow.

**The 20 videos** (order, Bangla name, YouTube videoId, content_id):

| # | Name (Bangla) | videoId | content_id |
| --- | --- | --- | --- |
| 0 | চিন্তা ও আচরণ | `eUc5pD9C2r0` | `thought_behave` |
| 1 | কথা বলার কিছু ধরন | `GP1qKfY5cU4` | `communication_skills` |
| 2 | মানুষ যে কারনে তার পছন্দের আচরণ করে | `FkEuVP3wNLo` | `health_belief_model` |
| 3 | একজন করোনা বিজয়ীর ইন্টারভিউ | `2W6P5Sag63w` | `corona_surrounding` |
| 4 | প্রিয়জনের মৃত্যুর পর নিজেকে সামলানোর উপায় | `MreOgt1-Z5w` | `grief_and_loss` |
| 5 | সংকটপূর্ণ সময়ে নিজেকে সামলানোর কৌশল | `wXqFhYjoTkE` | `mental_coping` |
| 6 | দাম্পত্য সম্পর্ক উন্নয়ন | `LT1VpMtPHNo` | `couple_relation` |
| 7 | রাগ নিয়ন্ত্রণের উপায় | `qbCIdHYakcg` | `anger_management` |
| 8 | বাবা-মা ও সন্তানের সম্পর্ক উন্নয়ন | `9yDlLvrmCDw` | `parent_child_relation` |
| 9 | আবেগীয় পরিবর্তনের তারতম্য ঠিক রাখার উপায় | `xFhKAs7BMLU` | `manage_up_downs` |
| 10 | মাইন্ডফুলনেস - ১ | `Ch7deOySu94` | `mindfulness_1` |
| 11 | মাইন্ডফুলনেস - ২ | `n0ylBFc3tMc` | `mindfulness_2` |
| 12 | ঘুমের গুণগত মান বৃদ্ধি করার কৌশল | `6auC-zErUpU` | `maximize_sleep` |
| 13 | ব্রিদিং এক্সারসাইজ | `WzkFqUbpen0` | `breath_excercise` |
| 14 | মাংসপেশির শিথিলায়ন | `oRya-GgT2vU` | `pmr` |
| 15 | দাম্পত্য সম্পর্ক ও পারিবারিক সহিংসতা | `jh1OYk9vSG4` | `dampotto_shomporko` |
| 16 | পারিবারিক সহিংসতা কি | `D7OGUCkrVkI` | `paribarik_sohinshota` |
| 17 | মানসিক সমস্যা ও রোগের লক্ষণ | `Wt8UB_fGe70` | `manoshik_somossa` |
| 18 | মানসিক স্বাস্থ্য বলতে কি বুঝি | `6RCL5fcJ_2Y` | `manoshik_sastho` |
| 19 | সহমর্মিতা ও সহানুভূতি | `EzpLr8ijVGE` | `sohomormita` |

(Each record also has `type:'video'`, `iconName:'cancel'`, and `order` = index.)

**Navigation OUT:** Tap a `Box` → `navigate('VideoExercise', { title, isCompleted, id })` where `id` = `videoId`.

---

## 2. VideoExercise — `screens/VideoExercise.js`

**Purpose:** Plays a single exercise video and (on completion) marks it seen + routes to Rating.

- **Route name:** `VideoExercise` · **Header title:** `অনুশীলন`.
- **Navigation IN:** From `VideoExerciseList` (`{title, isCompleted, id}`) and from `Rating`'s "next video" button (`navigation.replace('VideoExercise', {title, isCompleted:false, id})`).
- **Params:** `title` (string, shown), `id` (videoId, passed to player), `isCompleted` (currently unused for rendering).
- **Back:** `useBackPress('VideoExercise')` → replaces with `VideoExerciseList`. Header back → `navigate(VideoExerciseList)`. NOTE: the `YouTube` component ALSO registers its own hardware-back handler that navigates to `VideoExerciseList` (see §5) — both resolve to the same place.

**Local state / redux / API:** none directly (delegated to `<YouTube>`).

**UI:** `View` (flex, bg `colors.background`, padded). Centered bold `route.params.title`, then `<YouTube videoId={route.params.id} />` (default `needAction=true`).

**Navigation OUT:** Driven by `<YouTube>` — on video `ended`, after marking seen, `navigate('Rating', { videoId })`.

---

## 3. VideoScreen — `screens/VideoScreen.js`

**Purpose:** Generic informational video page used by the **profile / scale** flow (not the exercise list). Looks up a page config by `scaleId` and renders heading + description + embedded video. Used to show e.g. corona-survivor or child-care videos referenced from the mental-health profile.

- **Route name:** `VideoScreen` · **Header title:** set dynamically via `navigation.setOptions({ title: page?.title ?? 'Quality Life' })`.
- **Navigation IN:** Reached when a profile/scale entry has `redirectTo === SHOW_VIDEO`. Params: `scaleId` (required key into `videoScreenPages`), `needAction` (optional, default `true`).
- **Back:** `useBackPress('VideoScreen')` → replaces with `Profile`. Header back arrow → `navigate(Profile)`.

**Local state:** `videoScreen` (the matched page object, init `null`), `isLoading` (init `true`).
**Effect:** when `scaleId` present, find page in `videoScreenPages` by `page.name === scaleId`, set it, set header title, set `isLoading=false`. Guard: `if (!videoScreen) return null;`.
**Redux / API:** none directly. (Video player may still POST seen-video when `needAction` true — see §5.)

**UI:** `View` (bg white) → `ScrollView`: heading (`postHeading`), description (`postDescription`, justified), then a `<Loader visible={isLoading}/>` and, once loaded, `<YouTube videoId={videoScreen.videoId} needAction={needAction} />`.

**`data/videoScreenPages.js` contents** (only 2 entries; `name` values come from `data/type.js`):

| `name` (type const value) | `title` | `videoId` | postHeading | postDescription |
| --- | --- | --- | --- | --- |
| `coronaProfile` (`CORONA_PROFILE`) | একজন করোনা যোদ্ধার গল্প | `2W6P5Sag63w` | `''` | `''` |
| `childCare` (`CHILD_CARE`) | বাবা-মা ও সন্তানের সম্পর্ক উন্নয়ন | `9yDlLvrmCDw` | `''` | `''` |

**Edge cases:** If `scaleId` doesn't match any page, `videoScreen` stays `null` → screen renders nothing (blank). With `needAction=false`, the embedded player does NOT mark-seen or route to Rating, and does NOT hijack hardware back (so the screen's `useBackPress('VideoScreen')` → Profile applies).

---

## 4. (covered above) — VideoExercise vs VideoScreen distinction
Two separate video screens exist:
- **VideoExercise** (`needAction=true` always): part of the 20-video exercise program; on end → seen-video API + Rating.
- **VideoScreen** (`needAction` configurable): part of the profile/scale informational flow; back goes to `Profile`.
Both embed the same `<YouTube>` component.

---

## 5. YouTube player component — `components/Youtube.js`

**Purpose:** Reusable wrapper around `react-native-youtube-iframe` that autoplays, shows a loader until ready, and (when `needAction`) performs the "mark seen → go to Rating" business logic.

**Props:** `videoId` (string), `needAction` (bool, default `true`).
**Local state:** `showLoader` (init `true`), `playing` (init `false`).
**Hooks:** `useDispatch`, `useNavigation`, `useHelper()` (for `ApiExecutor`).

**Behavior:**
- On mount (only if `needAction`): registers `hardwareBackPress` listener → `navigation.navigate('VideoExerciseList')`, returns `true`; removed on unmount. (When `needAction=false`, no back hijack.)
- `onReady`: `showLoader=false`, `playing=true` (autoplay). Player props: `height={200}`, `play={playing}`, `forceAndroidAutoplay`.
- `onChangeState(state)`:
  - `'playing'` → `playing=true`; `'paused'` → `playing=false`.
  - `'ended'` → `playing=false`; if `!needAction` stop. Else:
    1. `await ApiExecutor(ApiDefinitions.seenVideo({ videoId }))` → **POST `/user/seen-video/<videoId>`** (no body). If `!response.success` → return (do nothing further).
    2. `dispatch(shownVideoAction(videoId))` → `UPDATE_SV` (dedup-append videoId to `shownVideo`).
    3. `navigation.navigate('Rating', { videoId })`.

**Edge cases:** A video is only marked seen when it actually reaches `ended` (watching to completion). Seeking past or closing early does NOT mark it seen. If the seen-video API fails, neither redux nor navigation updates (user stays on player). No `Video*` helper component exists besides `Youtube.js`.

---

## 6. Rating — `screens/Rating.js`

**Purpose:** After finishing an exercise video, collect a star rating + comment, submit to backend, then suggest the next unwatched video and offer a mental-health assessment.

- **Route name:** `Rating` · **Header title:** `মানসিক স্বাস্থ্য পরিমাপের অবস্থা`.
- **Navigation IN:** From `<YouTube>` on video end → `{ videoId }` (the just-finished video).
- **Back:** `useBackPress('Rating')` → replaces with `VideoExerciseList`. Header back arrow → `navigate(VideoExerciseList)`.

**Params:** `videoId`.
**Redux reads:** `msm_score`, `msm_date`, `shownVideo` from `state.user`.
**Redux writes:** none.
**Local state:** `userRating` (number, init 0), `comment` (string, init ''), `ratingSubmitted` (bool, init false), `loading` (bool, init false).

**Derived:**
- `currentOrderIndex = resources.findIndex(v => v.videoId === videoId)`.
- `nextVideo = findNextVideo(resources, videoId, shownVideo)` — starts at `currentIndex+1` and wraps around the 20-item array (`% totalVideos`), returning the first video whose `videoId` is NOT in `shownVideo`; returns `null` if all watched.

**UI (in a `ScrollView`):**
1. **Rating card** — if `ratingSubmitted` → show thank-you text `আপনার মতামতের জন্য অশেষ ধন্যবাদ`. Else:
   - Title `ভিডিওটি সম্পর্কে আপনার মতামত দিন`.
   - `<Rating>` (react-native-ratings): 5 stars, start 0, size 32, color `#542e71`, half-star steps (`jumpValue=0.5`, `fractions=1`); `onFinishRating(n) → setUserRating(n)`.
   - `<TextInput placeholder="মতামত">` → `setComment`.
   - `<Loader visible={loading}/>` and `<SubmitButton title="সাবমিট করুন" onPress={handleSubmit} visible={!loading}/>`.
2. **Assessment `Box`** (`components/Homepage/Box`): image `mentalexcercise.png`, name `মানসিক স্বাস্থ্য মূল্যায়ন করুন`, `lastScore = msm_score ? "${msm_score}/100" : undefined`, `lastDate = msm_date`. (Always rendered.)
3. **Next-video card** (only if `nextVideo` truthy): title `পরবর্তী ভিডিও`; hint text recommending `"{nextVideo.name}"`; button `ভিডিওটি দেখুন`.

**Business logic — `handleSubmit`:**
- Guard: if `userRating === 0 && comment.trim() === ''` → return (do nothing; no validation message shown).
- Build payload: `{ videoUrl: videoId, contentId: resources[currentOrderIndex].content_id, rating: userRating, comment }`.
- `setRatingSubmitted(false); setLoading(true)`.
- `await ApiExecutor(ApiDefinitions.submitUserRating({ payload }))` → **POST `/user/add-rating`**.
- `setLoading(false); setRatingSubmitted(true)` (set to true regardless of success — thank-you shows even on error; on failure `console.error(response)`).

**Navigation OUT:**
- Assessment `Box` onPress → `navigation.replace('HomepageScale', { goToBack:'VideoExerciseList', type:'manoshikShasthoMullayon', fromVideo:true, videoTitle:nextVideo?.name, videoIsCompleted:false, videoId:nextVideo?.videoId, preTest:false })`.
- Next-video button → `navigation.replace('VideoExercise', { title:nextVideo.name, isCompleted:false, id:nextVideo.videoId })`.

**Edge cases:** When all 20 videos are watched, `nextVideo` is `null` → next-video card hidden; the assessment Box still renders but passes `videoTitle/videoId = undefined`. `ratingSubmitted` being set true on failure means a failed submission still looks successful to the user.

---

## 7. HelpCenter — `screens/HelpCenter.js`

**Purpose:** Context-filtered emergency contact list shown when a scale result indicates a serious condition (e.g. psychotic/suicide/domestic-violence). Lets the user call/WhatsApp helplines or jump to the professionals list.

- **Route name:** `HelpCenter` · **Header title:** `সাহায্য কেন্দ্র`.
- **Navigation IN:** From a scale/profile result whose `redirectTo === HELP_CENTER`. Params: `scaleId` (filter key), `goToBack` (where back should go).
- **Back:** `useBackPress('HelpCenter', goToBack)` → hardware back replaces with `goToBack` (or fallback `Homepage`). Header back arrow → `navigation.replace(route.params.goToBack || Homepage)`.

**Local state / redux / API:** none.
**Filtering:** `filteredNumbers = helpCenterNumbers.filter(item => item.keywords.includes(scaleId))`.

**`scaleId` filter keys** (from `data/type.js`): `psychoticProfile` (`PSYCHOTIC_PROFILE`), `suicideIdeation` (`SUICIDE_IDEATION`), `domesticViolence` (`DOMESTIC_VIOLENCE`).

**UI:**
- Top button `প্রফেশনালের সাথে যোগাযোগ করুন` → `navigation.replace('AllProfessionals')`.
- For each filtered place: card with `place` name, optional `location`, and a list of contacts. Each contact is a `TouchableOpacity` row: `MaterialCommunityIcons name={contact.type}` (`phone` or `whatsapp`), the `number`, optional `time`, and `টোল ফ্রি` label if `hasToll`.

**`dialCall(number, type)`:**
- `type==='whatsapp'`: if number starts with `01`, prefix `+88`; open `whatsapp://send?text=Hello&phone=<number>`.
- else: Android → `tel:<number>`, iOS → `telprompt:<number>`. Errors are `console.error`'d.

**Emergency contacts (`data/helpCenter.js`)** — full data, with which `scaleId`s surface them:

| Place | Location | Surfaced for keywords | Contacts |
| --- | --- | --- | --- |
| জাতীয় মানসিক স্বাস্থ্য ইনস্টিউট ও হাসপাতাল | — | `psychoticProfile`, `suicideIdeation` | `01404000080` (phone, সকাল ৮ টা থেকে ১০ টা); `01404000081` (phone, সকাল ৮ টা থেকে ১০ টা); `01404000082` (whatsapp, সকাল ৮ টা থেকে ১০ টা (WhatsApp)); `01404000083` (whatsapp, সকাল ৮ টা থেকে ১০ টা (WhatsApp)) |
| নাসিরুল্লাহ সাইকথেরাপি ইউনিট | ঢাকা বিশ্ববিদ্যালয় | `psychoticProfile`, `suicideIdeation` | `01715654538` (phone) |
| আইন ও সালিশ কেন্দ্র হেল্পলাইন নাম্বার | — | `domesticViolence` | `01724415677` (phone, সকাল ৯ টা থেকে ৫ টা, hasToll=false) |
| মহিলা ও শিশু বিষয়ক মন্ত্রণালয় | — | `domesticViolence` | `109` (phone, hasToll=true → shows টোল ফ্রি) |

**Edge case:** If `scaleId` matches no keywords, only the top "contact a professional" button shows (empty list).

---

## 8. CentralHelpCenter — `screens/CentralHelpCenter.js`

**Purpose:** Same emergency data as HelpCenter but **unfiltered** — the full directory, reachable from the drawer. No top "professionals" button.

- **Route name:** `CentralHelpCenter` · **Header title:** `সাহায্য কেন্দ্র`.
- **Navigation IN:** Drawer item `হেল্প সেন্টার`. No params.
- **Back:** `useBackPress('CentralHelpCenter')` → replaces with `Homepage`. No custom header back (default stack back).

**Local state / redux / API:** none. `lists = helpCenterNumbers` (all 4 entries above, unfiltered).
**UI:** Same card layout as HelpCenter (place / optional location / contact rows with icon + number + optional time + optional `টোল ফ্রি`). Same `dialCall` logic (whatsapp `+88` prefix; `tel:`/`telprompt:`).

---

## 9. DrawerGuideline — `screens/DrawerGuideline.js`

**Purpose:** Static informational page describing the app's purpose and data-privacy/research stance.

- **Route name:** `DrawerGuideline` · **Header title:** `ব্যবহারিক নির্দেশিকা`.
- **Navigation IN:** Drawer item `ব্যবহারিক নির্দেশিকা`. No params.
- **Back:** `useBackPress('DrawerGuideline')` → replaces with `Homepage`. Default stack back arrow.
- **State / redux / API:** none.

**UI:** `ScrollView` with a single justified Bangla paragraph block (two paragraphs separated by `\n\n`):

> এই মোবাইল এপ্লিকেশনটি এমনি একটা ব্যাতিক্রমধর্মী উদ্যোগ যার মাধ্যমে আপনার মানসিক স্বাস্থ্যের অবস্থা যাচাই করতে পারবেন ও তার সাথে মানসিক অবস্থা উন্নয়নের কিছু সহজ পদ্ধতি প্রদান করা হবে। এছাড়া প্রয়োজনে মানসিক স্বাস্থ্য সেবা প্রদানকারীর সাথে আপনার যোগাযোগ করার ব্যবস্থাও রয়েছে।
>
> এই এপ্লিকেশনটি ব্যবহার করতে গিয়ে আপনি যেই তথ্যগুলো প্রদান করবেন তা আমাদের কাছে খুবই গুরুত্বপূর্ণ এবং অত্যন্ত সতর্কতার সাথে তথ্যগুলোর গোপনীয়তা বজায় রাখা হবে। পরিচয় সম্পূর্ণ গোপন রেখে এই এপ্লিকেশনটির ব্যবহারকারীদের তথ্যগুলো একটি গবেষণা কাজে ব্যবহৃত হবে। এই তথ্য গুলো বিশ্লেষণ করার জন্য কেবলমাত্র তিন জন গবেষক ব্যতিত অন্যকেউ দেখতে পাবে না। অনুগ্রহ করে প্রশ্নের উত্তর ও রেটিং গুলো মনোযোগ সহকারে প্রদান করুন।

---

## 10. Profile — `screens/Profile.js`

**Purpose:** User's profile dashboard: identity blocks, previous scale scores table, and a mental-health profile checklist that deep-links into informational tests.

- **Route name:** `Profile` · **Header title:** `প্রোফাইল`.
- **Navigation IN:** Drawer `আমার প্রোফাইল` (when role is user); also the return target after `UpdateProfile`.
- **Back:** `useBackPress('Profile')` → replaces with `Homepage`. Header back arrow → `navigate(Homepage)`.

**Redux reads (`state.user`):** `name, age, gender, address, msm_score, moj_score, moj_date, mcn_score, mcn_date, dn_score, dn_date, mentalHealthProfile, isMarried`.
**Redux writes / API:** none.
**Local state:** `tableData` (array, init `[]`).

**Effect (on mount):** builds the scores table via `getMatra(msm_score, moj_score, mcn_score, dn_score)` (`helpers/getMatra.js`), extracting the parenthetical মাত্রা label. Rows (header `['তারিখ','Test','মাত্রা']`, col widths `[68,155,68]`):
- `মানসিক অবস্থা যাচাইকরণ` — date `moj_date`, level from `moj_score` (`≤4` স্বাভাবিক / `≤9` মাঝামাঝি / else তীব্র), `-` if no date.
- `মানসিক চাপ নির্ণয়` — date `mcn_date`, level from `mcn_score` (`≤13` / `≤26` / else তীব্র).
- `দুশ্চিন্তা নির্ণয়` — date `dn_date`, level from `dn_score` (`≤54` / `≤66` / else তীব্র).
- Dates are reformatted by `modifyDate` (parses `MMM DD, YYYY` via moment → `DD/MM/YY`-style swap). `genderMap`: Male→পুরুষ, Female→মহিলা, else অন্যান্য. `isMarried`: `'Unmarried'`→অবিবাহিত else বিবাহিত.

**UI blocks:**
1. Identity card using `<Block>` rows:
   - `নাম` (icon `account`) = `name`.
   - `ব্যক্তিগত বিবরণ` (icon `account-details`) = `"<age বছর>, <gender>, <maritalStatus>"` (age via `numberWithCommas`).
   - `বর্তমান ঠিকানা` (icon `map-marker-radius`) = `address`.
   - Button `আপডেট করুন` → `navigate('UpdateProfile')`.
2. `পূর্ববর্তী স্কোরসমূহ` card → `<Table tableData={tableData} widthArr={[68,155,68]}/>`.
3. `মানসিক স্বাস্থ্য প্রোফাইল` card → list of 5 `Tests` (`data/profileScales.js`), each a `TouchableOpacity` with label + done/pending icon (done if `mentalHealthProfile.includes(test.link)`).

**`data/profileScales.js`** (label → scaleId/link → redirectTo):

| Label | scaleId / link | redirectTo |
| --- | --- | --- |
| করোনা সম্পর্কিত তথ্য | `coronaProfile` | `SHOW_VIDEO` → VideoScreen |
| গুরুতর সমস্যা সম্পর্কিত তথ্য | `psychoticProfile` | `HELP_CENTER` |
| আত্মহত্যা পরিকল্পনা সম্পর্কিত তথ্য | `suicideIdeation` | `HELP_CENTER` |
| পারিবারিক সহিংসতা সম্পর্কিত তথ্য | `domesticViolence` | `HELP_CENTER` |
| সন্তান পালন সম্পর্কিত তথ্য | `childCare` | `SHOW_VIDEO` → VideoScreen |

**Navigation OUT:**
- `আপডেট করুন` → `navigate('UpdateProfile')`.
- A test row → `navigate('Test', { ...test, goToBack:'Profile', fromProfile:true })`.

**Edge cases:** Effect runs once (`[]` deps) so the table will not refresh if scores update while mounted. Scores with no date render `-`.

### 10.1 Block — `components/Profile/Block.js`
Presentational row used in Profile. Props: `name`, `data`, `icon`. Renders a circular bordered `MaterialCommunityIcons` (primary color) on the left, then a two-line text block: small secondary `name` label above bold primary `data` value. No state/logic.

---

## 11. UpdateProfile — `screens/UpdateProfile.js`

**Purpose:** Edit user identity + cascading address (district → upazila → union) and submit.

- **Route name:** `UpdateProfile` · **Header title:** `প্রোফাইল আপডেট করুন`.
- **Navigation IN:** From `Profile` (`আপডেট করুন`). No required params.
- **Back:** `useBackPress('UpdateProfile')` → replaces with `Profile`. Header back arrow → `navigate(Profile)`.

**Redux reads:** `name, age, gender, isMarried, address` from `state.user`.
**Redux writes:** on success → `dispatch(updateProfileAction(response.data.user))` (`UPDATE_PROFILE`).
**Local state:** `error`, `isLoading`, `userGender`, `maritalStatus`, `zilla`, `upozila`+`upozilaList`, `union`+`unionList`; plus a `useFormFields` form (`formFields`, `createChangeHandler`, `setFormFields`) with initial keys `{name, age, gender, maritalStatus, zila, upazila, union}`.

**Reference data:** `genderLists` (`পুরুষ`→Male, `মহিলা`→Female, `অন্যান্য`→Others), `maritalStatusLists` (`বিবাহিত`→Married, `অবিবাহিত`→Single), `zillaList` from `data/RegionInformation.json` districts.

**Effect (on mount):** Pre-fills fields from redux. Parses `address` by splitting on `,` (trimmed) into union/upazila/zila depending on parts length (3 → union,upazila,zila; 2 → upazila,zila; 1 → zila). Resolves matching picker items and builds `upozilaList`/`unionList` from the Region JSON. Seeds `formFields`.

**Cascading handlers:**
- `handleZillaChange(item)`: set zilla, rebuild upozilaList, clear upozila & union (state + form fields).
- `handleUpozilaChange(item)`: set upozila, rebuild unionList from selected district+upazila, clear union.

**UI (ScrollView, white bg):** `TextInput` নাম (icon account), `TextInput` বয়স (icon account-clock, numeric), `Picker` লিঙ্গ, `Picker` বৈবাহিক অবস্থা, `Picker` বর্তমান ঠিকানা (জেলা), `Picker` (উপজেলা), `Picker` (ইউনিয়ন), `<Loader>`, conditional error `Button`, submit `Button` `আপডেট করুন`.

**Business logic — `handleFormSubmit`:**
- Required: all keys except `union` and `upazila` must be non-empty after trim. If any missing → `setError('ফর্মটি সঠিকভাবে পূরণ করুন')`, return.
- Payload: `{ name, age, gender, isMarried: (maritalStatus === 'Married'), location:{ zila, upazila||'', union||'' } }`.
- `setIsLoading(true)` → `await ApiExecutor(ApiDefinitions.updateUserProfile({payload}))` → **POST `/user/update/profile`** → `setIsLoading(false)`.
- On `!success` → `setError(response.message)`, return.
- On success → `dispatch(updateProfileAction(response.data.user))`, `navigate('Profile')`, `ToastAndroid.show('প্রোফাইল আপডেট সম্পন্ন হয়েছে!')`.

**Edge cases:** `union`/`upazila` optional. Cascading dropdowns reset children when a parent changes. Note the picker change handler writes `'Married'`/`'Single'` into `maritalStatus`, and the payload computes `isMarried` as `=== 'Married'`.

---

## 12. Setting — `screens/Setting/Setting.js`

**Purpose:** Settings menu: About, Privacy, change password, (professional-only visibility toggle), delete account, logout.

- **Route name:** `Setting` · **Header title:** `সেটিংস`.
- **Navigation IN:** Drawer `সেটিংস`. No params.
- **Back:** `useBackPress('Setting')` → replaces with `Homepage`. Default stack back arrow.

**Redux reads:** `role` from `state.auth`; `visibility` from `state.prof`.
**Local state:** `modalVisibleForDeleteAcc` (bool), `modalViewForVisibility` (bool).
**Hooks:** `useHelper()` → `ApiExecutor`, `logout`.

**UI — list of `TouchableOpacity` cards (icon + label):**
1. `account-outline` → `আমাদের সম্পর্কিত তথ্য` → `navigate('AboutUs')`.
2. `shield-check-outline` → `গোপনীয়তা নীতি` → `navigate('PrivacyPolicy')`.
3. `lock-reset` → `পাসওয়ার্ড পরিবর্তন করুন` → `navigate('UpdatePassword')`.
4. **Professional-only** visibility toggle (`isProfessional(role)`):
   - if `visibility` → `eye-off-outline` (danger) `অ্যাকাউন্ট গোপন করুন`;
   - else → `eye-outline` (success) `অ্যাকাউন্ট দৃশ্যমান করুন`. onPress → open visibility confirm modal.
5. `trash-can-outline` → `অ্যাকাউন্ট ডিলিট করুন` → open delete confirm modal.
6. `exit-to-app` → `লগ আউট করুন` → `logout()` directly (no confirm).

**Two `DeleteAccountModal`s:**
- Delete-account modal, title `আপনি কি নিশ্চিত? আপনার অ্যাকাউন্ট স্থায়ীভাবে মুছে ফেলা হবে।`, `onPress={onDelete}`.
- Visibility modal, title `আপনি কি আপনার অ্যাকাউন্ট গোপন করতে চান?` (if currently visible) / `আপনি কি আপনার অ্যাকাউন্ট দৃশ্যমান করতে চান?`, `onPress={onVisibilityChange}`.

**Business logic:**
- `onDelete()`: if `isUser(role)` → `ApiExecutor(deleteUserAccount())` (**POST `/user/delete-account`**); else if `isProfessional(role)` → `ApiExecutor(deleteProfessionalAccount())` (**POST `/prof/delete-account`**). Then close modal + `logout()` (regardless of API result).
- `onVisibilityChange()`: throws if not professional; `newVisibility = !visibility`; `ApiExecutor(updateVisibility({visibility:newVisibility}))` (**POST `/prof/update-visibility`**); `dispatch(updateVisibilityInStore(newVisibility))`; close modal.

**Edge cases:** Logout card bypasses confirmation. Account deletion logs out even if the delete API call fails.

### 12.1 DeleteAccountModal — `components/DeleteAccountModal.js`
Reusable transparent fade `Modal`. Props: `modalVisible`, `setModalVisible`, `onPress`, `title`. Centered card with `title` text and two buttons: `হ্যাঁ` (success/green, calls `onPress`) and `না` (danger/red, calls `setModalVisible(false)`). `onRequestClose` toggles visibility off. Used for both delete and visibility confirmations.

---

## 13. AboutUs — `screens/Setting/AboutUs.js`

- **Route:** `AboutUs` · **Title:** `আমাদের সম্পর্কিত তথ্য`.
- **IN:** Setting → `আমাদের সম্পর্কিত তথ্য`. **Back:** `useBackPress('AboutUs')` → replaces with `Setting`; header back → `navigate(Setting)`.
- Renders `<ShowContent container={aboutUs}/>` where `aboutUs` is from `Setting/content.js`. No state/API.
- **Content:** one section titled `About us` with two long Bangla paragraphs — a history of the Dhaka University Clinical Psychology department and the creation of the Q-life app during the COVID pandemic. (Full text in `content.js`; load-bearing identifiers within: department founded 1997, Q-life app described.)

---

## 14. PrivacyPolicy — `screens/Setting/PrivacyPolicy.js`

- **Route:** `PrivacyPolicy` · **Title:** `গোপনীয়তা নীতি`.
- **IN:** Setting → `গোপনীয়তা নীতি`. **Back:** `useBackPress('PrivacyPolicy')` → replaces with `Setting`; header back → `navigate(Setting)`.
- Renders `<ShowContent container={policy}/>`. No state/API.
- **Content (`policy` in `content.js`)** — English sections, each `{title, description[]}`:
  1. Privacy Policy (intro + right-to-change)
  2. Information We Collect (personal info, device info)
  3. Confidentiality and Security (contact `mon.o.biggan2020@gmail.com`)
  4. Email Communication (unsubscribe via same email)
  5. Mobile Analytics
  6. Where We Store Your Personal Information (servers; laws of Bangladesh)
  7. Protecting Your Password
  8. Uses Made of the Information
  9. Disclosure of Your Information
  10. Contact us with Questions (`mon.o.biggan2020@gmail.com`)

---

## 15. ShowContent — `screens/Setting/ShowContent.js`

Presentational renderer for AboutUs / PrivacyPolicy. Prop: `container` = array of `{ title?, description: string[] }`. Renders a `ScrollView` (bg `#F3F4F6`); each item → white card with optional centered bold `title` and each `description` paragraph as justified text. `key`s derive from `description[0]` / paragraph text. No state/logic/API.

---

## 16. content.js — `screens/Setting/content.js`
Data module exporting `{ aboutUs, policy }` consumed by AboutUs & PrivacyPolicy (structure & content summarized in §13/§14). Not a screen.

---

## 17. UpdatePassword — `screens/Setting/UpdatePassword.js`

**Purpose:** Change password for the logged-in account (user or professional).

- **Route:** `UpdatePassword` · **Title:** `পাসওয়ার্ড পরিবর্তন করুন`.
- **IN:** Setting → `পাসওয়ার্ড পরিবর্তন করুন`. **Back:** `useBackPress('UpdatePassword')` → replaces with `Setting`; header back → `navigate(Setting)`.

**Redux reads:** `role` from `state.auth`.
**Local state:** `oldPassword`, `newPassword`, `confirmPassword`, `loading`, `error`.

**UI:** three `TextInput`s (lock icon, secure) — `বর্তমান পাসওয়ার্ড`, `নতুন পাসওয়ার্ড`, `নতুন পাসওয়ার্ড নিশ্চিত করুন`; `<Loader>`; `<ErrorButton>` (shows `error`); `<SubmitButton title="পরিবর্তন করুন">`.

**Business logic — `handleSubmit`:**
- If any of the three fields empty → `setError('ফর্মটি সঠিকভাবে পূরণ করুন')`, return.
- If `newPassword !== confirmPassword` → `setError('নতুন পাসওয়ার্ড এবং নিশ্চিত পাসওয়ার্ড মেলেনি।')`, return.
- Clear error; payload `{ oldPassword, newPassword }`.
- Choose definition: `resetUserPassword` (**POST `/user/reset-password`**) by default; if `isProfessional(role)` → `resetProfPassword` (**POST `/prof/reset-password`**).
- `setLoading(true)` → `ApiExecutor` → `setLoading(false)`.
- On `!success` → `setError(response.error.message)`, return.
- On success → `ToastAndroid.show('পাসওয়ার্ড সফলভাবে পরিবর্তিত হয়েছে')`, `navigation.goBack()`.

**Edge cases:** Only client-side checks are non-empty + match; old-password correctness is validated server-side (error surfaced from `response.error.message`).

---

## 18. Global Drawer navigation — `navigation/components/DrawerContent.js`

**Purpose:** Left navigation drawer, rendered only when authenticated (`role` truthy). Custom drawer content with a logo header, menu items, and a pinned logout at the bottom.

**Redux reads:** `role` from `state.auth` → `isAuthenticated = !!role`, `isUserRole = isUser(role)`, `isProfessionalRole = isProfessional(role)`.
**Hooks:** `useNavigation`, `useHelper()` → `logout`.

If `!isAuthenticated`, renders nothing (empty `Screen`).

**Header:** centered logo image `assests/images/drawer_logo.png` (105×120).

**Menu items (top → bottom), each a `DrawerItem` (MaterialCommunityIcons + Bangla label):**

| Order | Icon | Color | Bangla label | Target | Visibility |
| --- | --- | --- | --- | --- | --- |
| 1 | `home` | primary | হোমপেইজ | `Homepage` (user) / `ProHomepage` (professional) | always |
| 2 | `account` | success | আমার প্রোফাইল | `Profile` (user) / `ProfProfile` (professional) via `onProfileClick` | always |
| 3 | `badge-account-horizontal` | info | আমাদের প্রোফেসনালস | `AllProfessionals` | **user only** |
| 4 | `bell` | highlight | নোটিফিকেশন | `Notifications` | always |
| 5 | `phone-plus` | textSecondary | হেল্প সেন্টার | `CentralHelpCenter` | always |
| 6 | `calendar-text` | focus | ব্যবহারিক নির্দেশিকা | `DrawerGuideline` | always |
| 7 | `cog` | accent | সেটিংস | `Setting` | always |

**Footer (pinned, primary-color background):**
| Icon | Label | Action |
| --- | --- | --- |
| `exit-to-app` (white) | লগ আউট করুন | `logout` |

**Role logic:**
- `onProfileClick()`: user → `navigate('Profile')`; professional → `navigate('ProfProfile')`.
- `onNotificationClick()`: `navigate('Notifications')`.
- Homepage item routes to the role-appropriate homepage.

**Logout flow (`logout` from `useHelper`):** dispatches `SIGN_OUT`, `PROF_SIGN_OUT`, `DELETE_PROFILE`, `DELETE_ALL_PROF_REQUEST`, `RESET_NOTIFICATION_COUNT`; then `navigation.reset({ index:0, routes })` — routes `[{Welcome},{LoginPro}]` for professionals, else `[{Welcome},{Login}]`; then `DrawerActions.closeDrawer()`. (Same `logout` is also called from Setting's logout card and the InvalidToken-refresh-exhaustion path.)

---

## 19. Cross-screen flow summary

```
Homepage ──"অনুশীলন করুন"──▶ VideoExerciseList ──tap Box──▶ VideoExercise
                                                              │ (YouTube ended)
                                                              ▼
                                              seenVideo API + UPDATE_SV redux
                                                              │
                                                              ▼
                                                            Rating ──"next video"──▶ VideoExercise
                                                              │  └──"assessment Box"──▶ HomepageScale
                                                              ▼ submitUserRating API

Profile ──"আপডেট করুন"──▶ UpdateProfile ──submit (updateUserProfile)──▶ Profile (UPDATE_PROFILE)
Profile ──test (SHOW_VIDEO)──▶ VideoScreen        Profile ──test (HELP_CENTER)──▶ (Test → HelpCenter)

Drawer ──সেটিংস──▶ Setting ──┬─ AboutUs / PrivacyPolicy (ShowContent)
                             ├─ UpdatePassword (reset-password)
                             ├─ delete account (DeleteAccountModal → delete API → logout)
                             ├─ [prof] visibility toggle (updateVisibility)
                             └─ logout
Drawer ──হেল্প সেন্টার──▶ CentralHelpCenter (full directory)
Drawer ──ব্যবহারিক নির্দেশিকা──▶ DrawerGuideline
```

**Note:** `data/scales/content.js` defines the three primary scales (GHQ → `মানসিক অবস্থা যাচাইকরণ`; PSS → `মানসিক চাপ নির্ণয়`, copyright মোঃ জিয়াউল ইসলাম; ANXIETY → `দুশ্চিন্তা নির্ণয়`, copyright ড. ফারাহ দিবা) whose results feed the Profile scores table and trigger the HELP_CENTER/SHOW_VIDEO redirects — included here for reference as the data origin of Profile §10 and HelpCenter §7.
