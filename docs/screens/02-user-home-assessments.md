# 02 — User Home & Self-Assessment Scales (Core Scoring Flow)

This is the heart of the **Quality Life / QLife** app: the user homepage, the
self-assessment scale engine, the scoring math, and the result pages.

A developer should be able to rebuild the **entire assessment + scoring flow**
from this document without the source. Scoring is documented exhaustively and
literally (the app derives `score`/`totalScore`/`severity` on the **client**
and posts them to the backend; the backend does not recompute the primary
scores, it only stores them and applies its own severity bands for some flows).

> All Bangla strings below are copied verbatim from source. Route names are the
> string values from `App/navigation/constants.js`. Header titles are from
> `App/navigation/StackNavigator.js`.

---

## 0. Shared infrastructure (read this first)

### 0.1 Route name constants (`App/navigation/constants.js`)

| Constant | Route name string | Screen component file |
|---|---|---|
| `HOMEPAGE` | `Homepage` | `Homepage.js` |
| `THREE_SCALES` | `ThreeScales` | `ThreeScales.js` |
| `ASK_FOR_TEST` | `AskForTest` | `AskForTest.js` |
| `TEST` | `Test` | `Test.js` |
| `MENTAL_HEALTH_ASSESSMENT` | `HomepageScale` | `HomepageScale.js` |
| `MENTAL_HEALTH_ASSESSMENT_RESULT` | `CircularQuizResult` | `CircularQuizResult.js` |
| `QUIZ_RESULT_OUT_OF_100` | `QuizResultOutOf100` | `QuizResultOutOf100.js` |
| `RESULT_HISTORY` | `ResultHistory` | `ResultHistory.js` |
| `PROF_SUGGESTED_SCALE` | `ProfSuggestedScale` | `ProfSuggestedScale.js` |
| `PROF_SUGGESTED_SCALE_RESULT` | `ProfScaleResult` | `profScaleResult.js` |
| `VIDEO_SCREEN` | `VideoScreen` | — |
| `VIDEO_EXERCISE_LIST` | `VideoExerciseList` | — |
| `VIDEO_EXERCISE` | `VideoExercise` | — |
| `HELP_CENTER` | `HelpCenter` | — |
| `PROFESSIONALS_LIST` | `AllProfessionals` | — |
| `PROFILE` | `Profile` | — |
| `NOTIFICATIONS` | `Notifications` | — |

> Note: `ScaleResult.js` is a dead stub (renders `<Text>Hi there..</Text>`),
> not registered in the navigator. Documented at §11.

### 0.2 Header titles (from `StackNavigator.js`)

| Route | Header title (Bangla) |
|---|---|
| `Homepage` | `Quality Life` |
| `ThreeScales` | `মানসিক স্বাস্থ্য যাচাই` |
| `AskForTest` | (no explicit title set in navigator → uses default/none) |
| `Test` | `route.params.label \|\| 'স্কেলটি পূরণ করুন'` (dynamic) |
| `HomepageScale` | `মানসিক স্বাস্থ্য মূল্যায়ন` |
| `CircularQuizResult` | `ফলাফল` |
| `QuizResultOutOf100` | `আপনার স্কোর` |
| `ResultHistory` | (default) |
| `ProfSuggestedScale` | `স্কেলটি পূরণ করুন` |
| `ProfScaleResult` | `Your Score` |

### 0.3 Back-button behaviour — `useBackPress(screenName, previousPage=null)`

`App/contexts/BackPress.js` registers a hardware `hardwareBackPress` handler:

1. `backScreen = backScreenMap[screenName]`.
2. If either `backScreen` or `previousPage` equals `SPECIAL_LOGOUT_ACTION`
   (`':: logout ::'`) → `logout()`.
3. Else if either equals `GO_TO_BACK` (`':: go back ::'`) → `navigation.goBack()`.
4. Else `targetScreen = previousPage || backScreen`, then
   `selectHomepageByRole(targetScreen, role)` resolves the destination and the
   handler does `navigation.replace(destination)` (falls back to `navigate`).
5. Always returns `true` (consumes the event).

`backScreenMap` (relevant rows, `App/navigation/backScreenMap.js`):

| screenName | back target |
|---|---|
| `THREE_SCALES` | `HOMEPAGE` |
| `ASK_FOR_TEST` | `HOMEPAGE` |
| `TEST` | `HOMEPAGE` |
| `HELP_CENTER` | `HOMEPAGE` |
| `QUIZ_RESULT_OUT_OF_100` | `HOMEPAGE` |
| `MENTAL_HEALTH_ASSESSMENT` | `HOMEPAGE` |
| `MENTAL_HEALTH_ASSESSMENT_RESULT` | `HOMEPAGE` |
| `PROF_SUGGESTED_SCALE` | `HOMEPAGE` |
| `PROF_SUGGESTED_SCALE_RESULT` | `HOMEPAGE` |
| `VIDEO_SCREEN` | `PROFILE` |
| `VIDEO_EXERCISE_LIST` | `HOMEPAGE` |

`previousPage` (passed as the route param `goToBack`) **overrides** the map.

### 0.4 API layer

- **`ApiExecutor({ endpoint, method='GET', payload={}, headers={} })`**
  (`App/contexts/helper/index.js`, via `useHelper()`):
  - Adds `Content-Type: application/json` + `Authorization: Bearer <accessToken>`.
  - Returns `{ success: true, data }` (where `data = response.data.data`) or
    `{ success: false, error }`.
  - On `401 InvalidToken`: refresh-token retry up to 3×, then `logout()`.
  - On `401 EmailNotVerified`: toast + navigate to `EMAIL_VERIFICATION_PAGE`.
  - On `401 INCOMPLETE_PROFILE:STEP:n`: routes the user/prof to the right
    registration step.
- **`ApiDefinitions`** (`App/services/api.js`) — request builders used here:

| Builder | Method | Endpoint (`endpoints.js`) |
|---|---|---|
| `userProfile()` | GET | `USER_PROFILE` = `/user/all-informations` |
| `submitTest({payload})` | POST | `SUBMIT_TEST` = `/user/test` |
| `recent10TestResultsHistory({type})` | GET | `RECENT_10_TEST_RESULTS_HISTORY`/`{type}` = `/user/result-history-data/{type}` |
| `checkIfAssessmentIsAlreadyTaken({assessmentId})` | GET | `CHECK_IF_ASSESSMENT_IS_ALREADY_TAKEN`/`{id}` = `/user/suggested-scale-fillup-check/{id}` |
| `submitSuggestedScale({payload})` | POST | `SUBMIT_SUGGESTED_SCALE` = `/user/submit-suggested-scale` |

  `BaseUrl` is prepended to every endpoint (`App/config/BaseUrl.js`).

### 0.5 Redux `user` slice (`App/redux/reducers/user.js`)

State fields relevant here: `msm_score, msm_date, moj_score, moj_date,
mcn_score, mcn_date, dn_score, dn_date, mentalHealthProfile[], shownVideo[]`.

Actions (`App/redux/actions/user.js`) and their reducer effects:

| Action creator | Type | Effect |
|---|---|---|
| `storeUserProfile(user)` | `GET_PROFILE` | replaces all profile fields from `user` |
| `updateMsmAction(score, date)` | `UPDATE_MSM` | sets `msm_score`, `msm_date` |
| `updateMojAction(score, date)` | `UPDATE_MOJ` | sets `moj_score`, `moj_date` |
| `updateMcnAction(score, date)` | `UPDATE_MCN` | sets `mcn_score`, `mcn_date` |
| `updateDnAction(score, date)` | `UPDATE_DN` | sets `dn_score`, `dn_date` |
| `mentalHeathProfileAction(name)` | `UPDATE_MHP` | de-dupe push `name` into `mentalHealthProfile[]` |
| `shownVideoAction(url)` | `UPDATE_SV` | de-dupe push into `shownVideo[]` |

`msm` = manoshikShasthoMullayon (intro), `moj` = manoshikObosthaJachaikoron
(GHQ), `mcn` = manoshikChapNirnoy (PSS), `dn` = duschintaNirnoy (ANXIETY).

### 0.6 Backend `Test` document shape

`{ type, userId, questionAnswers:[{question,answer}], date, score, totalScore,
severity, postTest, fromVideo }`. The client computes `score/totalScore/severity`
and the backend persists them. The `submitTest` response used by the client is
`{ mDate, test:{ score, ... } }` (the response `score` is echoed back into redux).

---

## 1. Homepage — `Homepage.js`

**Purpose.** Landing screen for the logged-in user. Fetches the full profile,
shows profile-completion / notification banners, and renders the entry "Box"
tiles for the four primary self-assessments + the exercise-video tile.

- **Route name:** `Homepage` · **Header title:** `Quality Life`.
- **Navigation IN:** root after login; any `useBackPress` that resolves to
  `HOMEPAGE`; `redirectToHomepage()` from helper. No required params.

### 1.1 Local state / hooks
`refreshing` (bool), `isLoading` (bool, init `true`), `error` (string|null);
`isFocused` (`useIsFocused`); `unreadNotificationCount` from
`state.notifications.unreadCount`.

### 1.2 Redux reads
`{ msm_score, msm_date, moj_score, moj_date, mcn_score, mcn_date, dn_score,
dn_date, mentalHealthProfile }` from `state.user`.

- `isProfileCompleted`: `true` unless `mentalHealthProfile` is an array whose
  **distinct truthy** values count `!== 5`. (The 5 profile sub-scales —
  childCare, coronaProfile, domesticViolence, psychoticProfile, suicideIdeation
  — must all be present.)
- `getMatra(msm_score, moj_score, mcn_score, dn_score)` →
  `[lastMsmScore, lastMojScore, lastMcnScore, lastDnScore]`, each a Bangla
  label string (see §1.6). These are passed to each `Box` as `lastScore` only
  when the corresponding `*_date` exists.

### 1.3 Effects / API
On focus (`useEffect([isFocused])`, returns early if not focused):
1. `ApiExecutor(ApiDefinitions.userProfile())` → GET `/user/all-informations`.
2. `setIsLoading(false)`. On failure → `setError(error.message)`, return.
3. On success → `dispatch(storeUserProfile(userResponse.data.user))`.
4. `await refreshNotificationCount()` (GET unread-count for the user role; sets
   `notifications.unreadCount`).

`onRefresh` (pull-to-refresh): toggles `refreshing` and re-runs
`refreshNotificationCount()`.

### 1.4 UI content
Wrapped in a `ScrollView` (`backgroundColor: colors.background`) with a
`RefreshControl`.
- While `isLoading` → `<Loader>`. Else if `error` → `<ErrorButton title={error}>`.
- Else the content `View`:
  - **Notification banner** (only if `unreadNotificationCount !== 0`):
    `TouchableOpacity` → `navigation.navigate(NOTIFICATIONS)`. Text:
    ``আপনার কাছে ${numberWithCommas(unreadNotificationCount)} টি নতুন নোটিফিকেশন রয়েছে``.
  - **Profile-completion banner** (only if `!isProfileCompleted`):
    `TouchableOpacity` (secondary color) → `navigation.navigate(PROFILE)`.
    Text: `আপনার প্রোফাইল সম্পূর্ণ করুন`.
  - **Heading:** `আপনি কোন মানসিক রোগে ভুগছেন কিনা সেটা যাচাই করতে নিচে দেয়া যেকোনো টেস্ট করুন।`
  - **Box tiles** (`App/components/Homepage/Box`, each with image, `name`,
    optional `lastScore`/`lastDate`, `onPress`):

### 1.5 Navigation OUT (the five tiles)

| Tile `name` | onPress target + params |
|---|---|
| `মানসিক স্বাস্থ্য মূল্যায়ন` | `navigate(MENTAL_HEALTH_ASSESSMENT, { type:'manoshikShasthoMullayon', preTest:true })` |
| `মানসিক অবস্থা যাচাইকরণ (GHQ-12)` | `navigate(ASK_FOR_TEST, { scaleId:T.GHQ, label:'মানসিক অবস্থা যাচাইকরণ', link:T.GHQ, redirectTo:T.RESULT_OUT_OF_100, type:'manoshikObosthaJachaikoron', preTest:true })` |
| `মানসিক চাপ নির্ণয় (PSS-10)` | `navigate(ASK_FOR_TEST, { scaleId:T.PSS, label:'মানসিক চাপ নির্ণয়', link:T.PSS, redirectTo:T.RESULT_OUT_OF_100, type:'manoshikChapNirnoy', preTest:true })` |
| `দুশ্চিন্তা নির্ণয় (Anxiety Scale)` | `navigate(ASK_FOR_TEST, { scaleId:T.ANXIETY, label:'দুশ্চিন্তা নির্ণয়', link:T.ANXIETY, redirectTo:T.RESULT_OUT_OF_100, type:'duschintaNirnoy', preTest:true })` |
| `মানসিক স্বাস্থ্যের গুণগত মান উন্নয়ন` (only shown if `dn_date \|\| mcn_date \|\| moj_date`) | `navigate(VIDEO_EXERCISE_LIST)` |

(`T.*` are from `App/data/type.js`: `GHQ='GHQ'`, `PSS='PSS'`,
`ANXIETY='ANXIETY'`, `RESULT_OUT_OF_100='RESULT_OUT_OF_100'`.)

### 1.6 `getMatra` label bands (`App/helpers/getMatra.js`)
Used for the homepage tiles AND `ThreeScales`. Pure string formatting — does
**not** recompute severity, just buckets the stored score:

- **msm** (`lastMsmScore`): `<=50` → `"{score} (কম ওয়েল-বিং)"`, else `"{score} (বেশি ওয়েল-বিং)"`.
- **moj/GHQ** (`lastMojScore`): `<=4` → স্বাভাবিক; `<=9` → মাঝামাঝি; else তীব্র, formatted `"{score} (… মাত্রা)"`.
- **mcn/PSS** (`lastMcnScore`): `<=13` → স্বাভাবিক; `<=26` → মাঝামাঝি; else তীব্র.
- **dn/ANXIETY** (`lastDnScore`): `<=54` → স্বাভাবিক; `<=66` → মাঝামাঝি; else তীব্র.

### 1.7 Back behaviour & edge cases
`useBackPress(HOMEPAGE)` → `backScreenMap[HOMEPAGE] = WELCOME`. The exercise tile
gates on having taken at least one of GHQ/PSS/ANXIETY (`*_date` present). The
profile banner uses **distinct** values, so duplicates don't satisfy the `=== 5`
requirement.

---

## 2. ThreeScales — `ThreeScales.js`

**Purpose.** Secondary hub showing only the three measurable scales (GHQ, PSS,
ANXIETY). Reached **after** the intro assessment as the "next step".

- **Route:** `ThreeScales` · **Header:** `মানসিক স্বাস্থ্য যাচাই`.
- **Navigation IN:** `CircularQuizResult` "পরবর্তী ধাপ" button does
  `navigation.replace(THREE_SCALES)` when not from a video.
- **Redux reads:** `{ msm_score, moj_score, moj_date, mcn_score, mcn_date,
  dn_score, dn_date }`; `getMatra(...)` for labels (ignores `lastMsmScore`).
- **No API calls. No local state.**

### 2.1 UI / Navigation OUT
Three `Box` tiles (same images as homepage). Shared helper:

```
navigate(link, type, label) =>
  navigation.navigate(ASK_FOR_TEST, {
    scaleId: link, label, goToBack: 'ThreeScales',
    link, redirectTo: RESULT_OUT_OF_100, type, preTest: false,
  })
```

| Tile | `navigate(...)` args |
|---|---|
| GHQ-12 | `(T.GHQ, 'manoshikObosthaJachaikoron', 'মানসিক অবস্থা যাচাইকরণ')` |
| PSS-10 | `(T.PSS, 'manoshikChapNirnoy', 'মানসিক চাপ নির্ণয়')` |
| Anxiety | `(T.ANXIETY, 'duschintaNirnoy', 'দুশ্চিন্তা নির্ণয়')` |

> Key difference vs Homepage: `preTest:false` (so `postTest:true`) and
> `goToBack:'ThreeScales'`. This is the **post-test** path taken after the intro
> or after watching a video.

- **Back:** `useBackPress(THREE_SCALES)` → `HOMEPAGE`. The navigator header back
  also `navigation.navigate(backScreenMap[THREE_SCALES])`.

---

## 3. AskForTest — `AskForTest.js`

**Purpose.** Pre-test "info / consent" splash for a scale: title, short
description, copyright, "fill the scale" / "see previous results" buttons, and a
"read more" modal with the long explanatory text.

- **Route:** `AskForTest`. **Navigation IN:** Homepage tiles (GHQ/PSS/ANXIETY)
  and `ThreeScales.navigate`. Receives the full param bag (`scaleId, label,
  link, redirectTo, type, preTest`, and optionally `goToBack`).
- **Local state:** `modalVisible` (bool). `scale = scaleContent.find(s => s.id === scaleId)`
  (memoized) from `App/data/scales/content.js`.

### 3.1 `scaleContent` (`content.js`)
Array of `{ id, title, description, copyright? }`:
- `GHQ` → title `মানসিক অবস্থা যাচাইকরণ`, desc mentions ১২টি প্রশ্ন, no copyright.
- `PSS` → title `মানসিক চাপ নির্ণয়`, ১০টি প্রশ্ন, copyright `এই স্কেলটি বাংলা অনুবাদ করেছেন মোঃ জিয়াউল ইসলাম`.
- `ANXIETY` → title `দুশ্চিন্তা নির্ণয়`, ৩৬টি প্রশ্ন, copyright `এই স্কেলটি ডেভেলপ করেছেন ড. ফারাহ দিবা`.

### 3.2 UI
`ImageBackground` (ReadyForTest.png) + dark `LinearGradient`. Shows
`scale.title` (heading), `scale.description`, `scale.copyright`, then two
`Button`s and a "বিস্তারিত পড়ুন" link opening `AppModal`. The modal `description`
comes from `getDetails()` which switches on `scale.title` and returns the long
Bangla paragraphs (GHQ-12 explanation / Stress symptoms with `:::` sub-headers /
Anxiety explanation — verbatim in source lines 26-54). `default` branch returns
the Anxiety text.

### 3.3 Navigation OUT
- **`স্কেলটি পূরণ করুন`** → `navigation.navigate(TEST, { ...route.params, scaleId })`.
- **`আগের রেজাল্ট গুলো দেখুন`** → `navigation.navigate('ResultHistory', { ...route.params })` (needs `type`).
- **Back:** `useBackPress(ASK_FOR_TEST, goToBack)` → `goToBack` or `HOMEPAGE`.
- **Edge case:** if `scale`/`scale.title` is missing, `getDetails` logs an error
  and returns `undefined` (modal title falls back to `'Untitled'`).

---

## 4. The quiz engine (used by Test, HomepageScale, ProfSuggestedScale)

### 4.1 `Quizes.js` (`App/components/Quiz/Quizes.js`)
Props: `{ questions, answers, setAnswers, setSubmitted, isLoading }`.
- Local `currentQuestion` (index, init 0). Shows `Questions {n} of {len}` + a
  `ProgressBar` (`(currentQuestion+1)/length`).
- Renders only the current question's text + an `OptionForm`.
- `handleQuestionChange(next, prev)` advances/decrements `currentQuestion` after
  a 100ms `setTimeout` (so the radio selection is visible before moving on).
- **PreviousButton:** disabled on first question; else go back one.
- **SubmitButton:** rendered **only on the last question**. Disabled (greyed) if
  `answers[last]` is falsy. When enabled, `onPress` → `setSubmitted(true)`.
- While `isLoading`, the two buttons are replaced by an `ActivityIndicator`.

### 4.2 `OptionForm.js`
Props `{ options, handleQuestionChange, answers, setAnswers, currentQuestion }`.
Local `selected`. `handleClick(ans)` copies `answers`, sets
`answers[currentQuestion] = ans` (**the option `label` string**, not value/weight),
calls `setAnswers`, sets `selected`. Renders one `<Option>` per option keyed by
`op.label`, passing `text={op.label}`.

### 4.3 `Option.js`
Renders a row with the option `label` + a `RadioButton`. `checked` when
`selected === text || answers[currentQuestion] === text`. `onPress` →
`handleClick(text)` then `handleQuestionChange(true, false)` (auto-advance).

> **Critical consequence for scoring:** `answers[]` holds **label strings**. All
> scoring code maps a stored label back to its option to read `.weight`.
> Therefore option labels **must be unique within a question** (they are).

---

## 5. HomepageScale (intro / "WHO-5-like") — `HomepageScale.js`

**Purpose.** The 5-question intro mental-health well-being assessment
(`manoshikShasthoMullayon`). Component is named `MentalHealthAssessment`.

- **Route:** `HomepageScale` (`MENTAL_HEALTH_ASSESSMENT`) · **Header:** `মানসিক স্বাস্থ্য মূল্যায়ন`.
- **Navigation IN:** Homepage first tile (`{type:'manoshikShasthoMullayon',
  preTest:true}`); also reached from the video flow with `{fromVideo:true,
  videoId, videoTitle, videoIsCompleted, goToBack}`.
- **Params:** `{ goToBack, fromVideo=false, preTest }`. `postTest = !preTest`.
- **Local state:** `submitted`, `isLoading`, `answers` (array length 5, init `null`).

### 5.1 Question data (`App/data/mentalHealthRating.js`)
Default export = `questions` (5 items). Each option built by
`getAnswers(weights)` where the option list (label/value/weight) is:

| label (Bangla) | value | weight = `weights[i]` |
|---|---|---|
| সবসময় | 5 | `weights[5]` |
| বেশিরভাগ সময় | 4 | `weights[4]` |
| অর্ধেকের বেশি সময় | 3 | `weights[3]` |
| অর্ধেকের কম সময় | 2 | `weights[2]` |
| মাঝে মাঝে | 1 | `weights[1]` |
| কখনোই না | 0 | `weights[0]` |

All 5 questions use `getAnswers([0,1,2,3,4,5])`, so weight == value:
সবসময়=5 … কখনোই না=0. Max weight per question = 5; **max total = 25**.

Questions (verbatim): 1 `গত দুই সপ্তাহে আমি উৎফুল্ল এবং উৎসাহিতবোধ করেছি`;
2 `গত দুই সপ্তাহে আমি শান্ত এবং হালকা বোধ করেছি`;
3 `গত দুই সপ্তাহে আমি কর্মক্ষম এবং সজীব অনুভব করেছি`;
4 `গত দুই সপ্তাহে সতেজ এবং আরামের অনুভূতি নিয়ে আমি ঘুম থেকে জেগে উঠেছি`;
5 `গত দুই সপ্তাহে আমি যা কিছু পছন্দ করি তা দিয়ে আমার দৈনন্দিন জীবন পূর্ণ রয়েছে`.

This module also exports `severityText` (2 strings) and `socreMessage` (used by
result page §8).

### 5.2 Scoring math (exact, `useEffect([submitted])`)
On `submitted`:
1. Build `questionAnswers = answers.map((answer,i)=>({question: questions[i].question, answer}))`.
2. Compute raw `_score` and `maxWeight`:
   ```
   _score = 0; maxWeight = 0;
   for each (answer, i):
     _score   += questions[i].options.find(x => x.label === answer).weight
     maxWeight += Math.max(...questions[i].options.map(o => o.weight))   // = 5 each → 25
   _score = Math.round(_score)
   ```
3. **Severity** with `range = [35, 55]` (note this is buggy/dead logic — see
   below):
   ```
   if (_score <= 55) stage = 'তীব্র মাত্রা'
   else if (_score <= 35) stage = 'মাঝামাঝি মাত্রা'
   else stage = 'স্বাভাবিক মাত্রা'
   ```
   Since the raw `_score` is 0–25 it is always `<= 55`, so `stage` is **always**
   `'তীব্র মাত্রা'` here. This `severity` is sent to the backend but the result
   screen ignores it (it re-derives from the scaled score). Preserve the actual
   behaviour on rebuild unless intentionally fixing.
4. **Payload** (`submitTest`):
   ```
   { questionAnswers,
     type: 'manoshikShasthoMullayon',
     score: _score * 4,          // SCALED to 0–100 (25*4 = 100)
     severity: stage,
     totalScore: maxWeight,      // 25
     fromVideo, postTest }
   ```
   So the **stored/returned score is `_score*4`, a 0–100 well-being number**.
5. POST `/user/test`. On failure → `console.error`, stop (stays on screen).
6. On success: `const {mDate}=data; const {score}=data.test;`
   `dispatch(updateMsmAction(score, mDate))`.
7. `navigation.replace(MENTAL_HEALTH_ASSESSMENT_RESULT, { ...route.params,
   goToBack, meanResult: score })`.

- **Back:** `useBackPress(MENTAL_HEALTH_ASSESSMENT, goToBack)` → `goToBack` or `HOMEPAGE`.
- **Edge case:** `answers.find(...).weight` will throw if any answer is null, but
  the engine prevents submission until the last answer is set; intermediate
  nulls are impossible because each question auto-advances only after selection
  and Submit is gated on the last answer.

---

## 6. Test (GHQ / PSS / ANXIETY + profile scales) — `Test.js`

**Purpose.** The generic scale runner for the three measurable scales AND the
five binary "profile" scales. Picks the dataset via `chooseTest(scaleId)`,
computes score/severity, posts, updates redux, and routes onward.

- **Route:** `Test` · **Header:** `route.params.label || 'স্কেলটি পূরণ করুন'`.
- **Navigation IN:** `AskForTest` ("স্কেলটি পূরণ করুন"); also from the Profile
  flow with `fromProfile:true` and a profile `scaleId`/`redirectTo`.
- **Params:** `{ goToBack, preTest, scaleId, type, fromProfile, redirectTo, label }`.
  `postTest = !preTest`.
- **Local state:** `submitted`, `answers` (length = #questions, init `null`), `isLoading`.

### 6.1 `chooseTest(filename)` (`App/config/chooseTest.js`)
Maps a `scaleId` (a `T.*` key) to a dataset:

| key | dataset module | #Q |
|---|---|---|
| `childCare` | `childCare.js` | 1 |
| `coronaProfile` | `coronaProfile.js` | 6 |
| `domesticViolence` | `domesticViolence.js` | 1 |
| `psychoticProfile` | `psychoticProfile.js` | 4 |
| `suicideIdeation` | `suicideIdeation.js` | 3 |
| `GHQ` | `scales/GHQ.js` | 12 |
| `PSS` | `scales/PSS.js` | 10 |
| `ANXIETY` | `scales/ANXIETY.js` | 36 |

Returns `undefined` for unknown keys → `Test` logs `'Scale not found'` and
renders `null`.

### 6.2 Scale datasets (questions + option weights)

**GHQ-12 (`scales/GHQ.js`)** — 4 options per question via `getAnswers(weights)`:
labels `মোটেই না`(value 1), `কিছুটা`(2), `বেশ খানিকটা`(3), `সর্বাধিক পরিমাণ`(4),
weights = `weights[0..3]`. Each question supplies its own weight vector; **all
are either `[1,1,0,0]` or `[0,0,1,1]`** (classic GHQ bimodal scoring → each
question contributes 0 or 1, max total = 12):

| # | weights | (0 if first-two chosen / 1 if last-two) |
|---|---|---|
| 1 মনোনিবেশ করতে পারছেন | `[1,1,0,0]` |
| 2 নিদ্রায় ব্যাঘাত | `[0,0,1,1]` |
| 3 প্রয়োজনীয় কাজে মনোযোগ | `[1,1,0,0]` |
| 4 সিদ্ধান্ত গ্রহণ | `[1,1,0,0]` |
| 5 সর্বদা মানসিক চাপ | `[0,0,1,1]` |
| 6 অসুবিধা দূর করতে অক্ষম | `[0,0,1,1]` |
| 7 দৈনন্দিন কাজ উপভোগ | `[1,1,0,0]` |
| 8 সমস্যা মোকাবেলা | `[1,1,0,0]` |
| 9 অসুখী ও বিমর্ষ | `[0,0,1,1]` |
| 10 আত্মবিশ্বাস হারানো | `[0,0,1,1]` |
| 11 অযোগ্য ব্যক্তি | `[0,0,1,1]` |
| 12 মোটামুটিভাবে সুখী | `[1,1,0,0]` |

→ **GHQ raw score range 0–12**, `maxWeight` (totalScore) = sum of per-question
max = `1×12 = 12`.

**PSS-10 (`scales/PSS.js`)** — 5 options: `কখনোই না`(v1),`অনেকাংশে না`(v2),
`মাঝে মাঝে`(v3),`প্রায়শই`(v4),`ঘন ঘন`(v5), weights `weights[0..4]`.
- Q1,Q2,Q3,Q6,Q9,Q10 use `[0,1,2,3,4]` (direct).
- Q4,Q5,Q7,Q8 use `[4,3,2,1,0]` (reverse-scored).
- Per-question max weight = 4 → `maxWeight` = `4×10 = 40`. **Raw score 0–40.**

**ANXIETY (`scales/ANXIETY.js`)** — 36 questions, 5 options each:
`একেবারেই হয় না`(v1),`খুব সামান্য হয়`(v2),`মোটামুটি হয়`(v3),`বেশী হয়`(v4),
`অনেক বেশী`(v5); **all** questions use `[0,1,2,3,4]`. Per-question max = 4 →
`maxWeight` = `4×36 = 144`. **Raw score 0–144.**

**Profile scales** all use `YesNo` options (`App/data/YesNo.js`):
`{label:'হ্যাঁ',value:1,weight:0}`, `{label:'না',value:2,weight:0}` — **both
weights 0**, so profile tests are NOT scored (score forced to 0; see §6.4).
Questions (verbatim) per dataset:
- `childCare`: 1 Q — `আপনি কি সন্তান পালন নিয়ে উদ্বিগ্ন?`
- `coronaProfile`: 6 Qs (corona symptoms in self / close ones / prior MH issue /
  treatment / post-corona MH issue / treatment).
- `domesticViolence`: 1 Q — `আপনি কি ঘরোয়া সহিংসতার স্বীকার?`
- `psychoticProfile`: 4 Qs (paranoia / thought-control / unusual-events /
  hallucination-type).
- `suicideIdeation`: 3 Qs (think about suicide / had a plan / past attempt).

### 6.3 Branch A — profile scale (`fromProfile === true`)
1. `questionAnswers` built as in §5.2 step 1.
2. `payload = { questionAnswers, type, score:0, fromProfile:true, postTest }`.
3. POST `/user/test`. On failure → `console.error`, stop.
4. `dispatch(mentalHeathProfileAction(scaleId))` (adds scaleId to
   `mentalHealthProfile[]` → counts toward the homepage "5 distinct" check).
5. **All-"না" short-circuit:** for
   `scaleId ∈ {childCare, domesticViolence, suicideIdeation, psychoticProfile}`,
   if every answer is `'না'` (`uniqueAnswers.length===1 && [0]==='না'`) →
   `navigation.navigate(PROFILE)` and **return** (skip redirect). (coronaProfile
   is intentionally excluded from this short-circuit.)
6. Otherwise `goToAnotherPage(route.params.redirectTo)` (no `stage`).

### 6.4 Branch B — measurable scale (GHQ/PSS/ANXIETY)
1. `questionAnswers` built.
2. Compute `_score` + `maxWeight` exactly as §5.2 step 2 (`find(label).weight`,
   sum of per-question `Math.max(weights)`), `_score = Math.round(_score)`.
3. **Severity bands** (`range = [low, high]`, the client-side bands — these
   match the backend helper's bands):
   ```
   if (type === 'manoshikChapNirnoy')        range = [13, 26]   // PSS
   else if (type === 'duschintaNirnoy')      range = [54, 66]   // ANXIETY
   if (type === 'manoshikObosthaJachaikoron') range = [4, 9]    // GHQ
   ```
   ```
   if (_score <= range[0]) stage = 'স্বাভাবিক মাত্রা'
   else if (_score <= range[1]) stage = 'মাঝামাঝি মাত্রা'
   else stage = 'তীব্র মাত্রা'
   ```
   | type | স্বাভাবিক | মাঝামাঝি | তীব্র | raw max |
   |---|---|---|---|---|
   | GHQ `manoshikObosthaJachaikoron` | `≤4` | `5–9` | `≥10` | 12 |
   | PSS `manoshikChapNirnoy` | `≤13` | `14–26` | `≥27` | 40 |
   | ANXIETY `duschintaNirnoy` | `≤54` | `55–66` | `≥67` | 144 |
   (Matches `getMatra` bands in §1.6.)
4. **Payload:** `{ questionAnswers, type, score:_score, severity:stage,
   totalScore:maxWeight, postTest }`. Note the **raw** `_score` is stored here
   (not scaled, unlike the intro scale).
5. POST `/user/test`. On failure → `console.error`, stop.
6. On success `const {mDate}=data; const {score}=data.test;` and dispatch the
   matching action: `duschintaNirnoy→updateDnAction`,
   `manoshikChapNirnoy→updateMcnAction`,
   `manoshikObosthaJachaikoron→updateMojAction`.
7. `goToAnotherPage(route.params.redirectTo, stage)`.

### 6.5 `goToAnotherPage(redirectTo, stage=null)` — redirect map
Switch on `redirectTo` (values from `App/data/type.js`):

| `redirectTo` | action |
|---|---|
| `SHOW_VIDEO` | `navigation.replace(VIDEO_SCREEN, { scaleId, needAction:false })` |
| `HELP_CENTER` | `navigation.replace(HELP_CENTER, { scaleId, goToBack: PROFILE })` |
| `RESULT_OUT_OF_100` | `navigation.replace(QUIZ_RESULT_OUT_OF_100, { type, stage })` |
| `NO_ACTION` | `navigation.navigate('Profile', { ...route.params })` |
| (default) | `navigation.navigate('Homepage')` |

The three measurable scales always pass `redirectTo: RESULT_OUT_OF_100`. Profile
scales' `redirectTo` comes from `profileScales.js` (§9).

- **Back:** `useBackPress(TEST, goToBack)` → `goToBack` or `HOMEPAGE`.

---

## 7. QuizResultOutOf100 — `QuizResultOutOf100.js`

**Purpose.** Result page for GHQ/PSS/ANXIETY. Shows the textual severity stage
(not a number) and CTA buttons.

- **Route:** `QuizResultOutOf100` · **Header:** `আপনার স্কোর`.
- **Navigation IN:** `Test.goToAnotherPage` with `{ type, stage }`. No API, no
  redux, no local state besides route params.

### 7.1 Content / logic
- `typeMapping`: `manoshikObosthaJachaikoron→'মানসিক অবস্থা'`,
  `manoshikChapNirnoy→'মানসিক চাপ'`, `duschintaNirnoy→'দুশ্চিন্তা'`;
  `mtype = typeMapping[type] || 'অজানা'`.
- `isSevere = stage === 'তীব্র মাত্রা'`.
- **Heading:** PSS → `আপনার মানসিক চাপের পরিমাণঃ`; GHQ → `আপনার মানসিক অবস্থার পরিমানঃ`;
  else (ANXIETY) → `আপনার দুশ্চিন্তার পরিমাণঃ`.
- **`scoreDesc`** = `stage` (the Bangla band string), styled in `colors.primary`.
- **`stageDescriptions[stage]`** (templated with `mtype`):
  - স্বাভাবিক/মাঝামাঝি: `আপনার {mtype} {band} মাত্রায় রয়েছে। এই অবস্থার গুনগত মান উন্নয়নের জন্য অ্যাপসের ভিডিওগুলো দেখুন ও অনুশীলন করুন।`
  - তীব্র: `… তীব্র মাত্রায় রয়েছে। … দ্রুত সময়ের মধ্যে মানসিক স্বাস্থ্য সেবা প্রফেশনালদের সাথে যোগাযোগ করুন। পাশাপাশি অ্যাপসের ভিডিওগুলো দেখুন ও অনুশীলন করুন।`

### 7.2 Navigation OUT
- If `isSevere` → extra button `প্রফেশনালদের সাথে যোগাযোগ করুন` →
  `navigation.replace(PROFESSIONALS_LIST)` (`AllProfessionals`).
- Always: `অনুশীলন করুন` → `navigation.replace(VIDEO_EXERCISE_LIST)`.
- **Back:** `useBackPress(QUIZ_RESULT_OUT_OF_100)` → `HOMEPAGE`. Navigator header
  back also navigates to `backScreenMap[QUIZ_RESULT_OUT_OF_100]` = `HOMEPAGE`.
- **Edge case:** unknown `stage` → `stageDescriptions[stage]` is `undefined`
  (blank description box).

---

## 8. CircularQuizResult (intro result) — `CircularQuizResult.js`

**Purpose.** Result page for the intro 5-Q well-being scale
(`manoshikShasthoMullayon`). Component named `MentalHealthAssessmentResult`.

- **Route:** `CircularQuizResult` · **Header:** `ফলাফল`.
- **Navigation IN:** `HomepageScale.replace(... , { meanResult: score, ... })`.
- **Params:** `{ meanResult, goToBack, fromVideo, videoTitle, videoIsCompleted, videoId }`.
- No API/redux. Imports `severityText` from `mentalHealthRating.js`.

### 8.1 Scoring presentation (exact)
`meanResult` is the scaled 0–100 score (`_score*4`). The page derives a binary
band purely from this number:
- **Score color:** `parseInt(meanResult) <= 50 ? colors.danger : colors.primary`.
- **Severity text:** `parseInt(meanResult) <= 50 ? severityText[1] : severityText[0]`.
  - `severityText[0]` (score > 50, "normal"): `এই স্কোরের মানে হল আপনার মানসিক অবস্থা স্বাভাবিক। তারপরও খেয়াল রাখতে হবে যে, আপনি আপনার দৈনন্দিন কাজ গুলো করতে পারছেন কিনা। যদি না পারেন তাহলে পরবর্তী ধাপগুলো অতিক্রম করুন।`
  - `severityText[1]` (score ≤ 50, "needs care"): `এই স্কোরের মানে হল আপনার মানসিক স্বাস্থ্য সম্পর্কে আরও সতর্ক ও যত্নশীল হতে হবে। আপনি অনুগ্রহ করে পরবর্তী ধাপগুলো অতিক্রম করুন।`

### 8.2 UI / Navigation OUT
Title `মানসিক স্বাস্থ্য মূল্যায়ন`, big `meanResult` number, severity paragraph.
Button:
- If `fromVideo` → label `পরবর্তী ভিডিও দেখুন`, `navigation.replace(VIDEO_EXERCISE,
  { id: videoId, title: videoTitle, isCompleted: videoIsCompleted })`.
- Else → label `পরবর্তী ধাপ`, `navigation.replace(THREE_SCALES)`.
- **Back:** `useBackPress(MENTAL_HEALTH_ASSESSMENT_RESULT, goToBack)` → `goToBack`
  or `HOMEPAGE`.

> `socreMessage` (exported from `mentalHealthRating.js`) is **not** used by this
> screen in the current code; documented for completeness.

---

## 9. Profile binary scales — `profileScales.js` + redirect semantics

`App/data/profileScales.js` is the list driving the Profile-screen "based on
profession / profile info" sub-assessments. Each entry:
`{ label, scaleId, redirectTo, type, link }`. `redirectTo` is consumed by
`Test.goToAnotherPage` (§6.5):

| label (Bangla) | scaleId / type | `redirectTo` | resulting action |
|---|---|---|---|
| করোনা সম্পর্কিত তথ্য | `coronaProfile` | `SHOW_VIDEO` | replace → `VideoScreen {scaleId, needAction:false}` |
| গুরুতর সমস্যা সম্পর্কিত তথ্য | `psychoticProfile` | `HELP_CENTER` | replace → `HelpCenter {scaleId, goToBack:Profile}` |
| আত্মহত্যা পরিকল্পনা সম্পর্কিত তথ্য | `suicideIdeation` | `HELP_CENTER` | → `HelpCenter` |
| পারিবারিক সহিংসতা সম্পর্কিত তথ্য | `domesticViolence` | `HELP_CENTER` | → `HelpCenter` |
| সন্তান পালন সম্পর্কিত তথ্য | `childCare` | `SHOW_VIDEO` | → `VideoScreen` |

`type.js` constants: `SHOW_VIDEO`, `HELP_CENTER`, `SHOW_RESULT`, `NO_ACTION`,
`RESULT_OUT_OF_100`, plus the scale-id strings. `SHOW_RESULT` is defined but not
referenced by `goToAnotherPage` (would fall through to the default → `Homepage`).
`NO_ACTION` → navigate to `Profile`.

Combined with §6.3's all-"না" short-circuit: a profile scale answered entirely
"না" (for childCare/domesticViolence/suicideIdeation/psychoticProfile) sends the
user straight back to `Profile` without showing the video/help-center.

---

## 10. BasedOnProfession — `App/components/BasedOnProfession.js`

**Purpose.** A small profile-form helper (not a scale itself). Conditionally
renders a `BMDC` text input vs a `ব্যাচ` (batch) picker depending on profession.

- Props: `{ profession, createChangeHandler, batch, setBatch, pickerWidth='92%' }`.
- Returns `null` if no `profession`.
- If `profession.label === 'Psychiatrist'` → `<TextInput name="bmdc"
  placeholder="BMDC">` calling `createChangeHandler(text,'bmdc')`.
- Else → `<Picker name="batch" placeholder="ব্যাচ" items={batchLists}>` (from
  `App/utils/values`), calling `setBatch(b)` / `createChangeHandler(text,'batch')`.
- No API/redux/navigation. Pure presentational; included here because it appears
  in the user profile-info flow that gates the profile sub-scales.

---

## 11. ScaleResult — `ScaleResult.js` (DEAD STUB)

Renders only `<Text>Hi there..</Text>`. Not registered in `StackNavigator`, no
params, no logic. Safe to delete on rebuild. Documented because it was listed.

---

## 12. ProfSuggestedScale (user fills a professional-suggested scale) — `ProfSuggestedScale.js`

**Purpose.** When a professional suggests one of the large clinical scales
(`profScales.js`), the user fills it here. The scale is resolved at runtime from
the assessment record, scored against per-scale `range` bands, and submitted.

- **Route:** `ProfSuggestedScale` · **Header:** `স্কেলটি পূরণ করুন`.
- **Navigation IN:** from a notification / suggested-scale list, with
  `{ assessmentId, goToBack }`. Throws `'Params is missing!!'` if no `assessmentId`.
- **Local state:** `isLoading` (init `true`), `submitted`, `error`, `slug`,
  `questions`, `questionObject`, `answers`.

### 12.1 Load effect
`ApiExecutor(checkIfAssessmentIsAlreadyTaken({ assessmentId }))` →
GET `/user/suggested-scale-fillup-check/{assessmentId}`.
- On failure → `setError(message)` (a second effect then `setIsLoading(false)`).
- On success: `_assessment = data.assessment`; `setSlug(_assessment.assessmentSlug)`;
  `_questionObject = data.find(d => d.id === assessmentSlug)` from
  `App/data/profScales.js`; `setQuestionObject(_questionObject)`;
  `setQuestions(_questionObject.ques)`; init `answers = Array(len).fill(null)`;
  `setIsLoading(false)`.

### 12.2 `profScales.js` structure (LARGE — ~2350 lines)
Default export = array of scale objects:
```
{ id, name, needToEvaluate, copyright?,
  ques: [ { question, options:[{label,value,weight}] } ],
  range: [ { min, max, severity } ] }
```
The 10 scales present (`id` → `name`):

| id | name | severity bands (min–max → severity) |
|---|---|---|
| `depression_scale` | Depression Scale | 30–93 Minimal · 94–100 Depressed · 101–114 Mild · 115–123 Moderate · 124–150 Severe |
| `dhaka_university_obsessive_compulsive_scale_(duocs)` | DUOCS | 0–17 Cut-off · 18–23 Mild · 24–40 Moderate · 41–49 Severe · 50–80 Profound |
| `somatic_complaints_scale` | Somatic Complaints Scale | 0–28 Cut-off · 29–42 Mild · 43–50 Moderate · 51–55 Severe · 56–72 Profound |
| `dhaka_university_cognitive_distortion_scale_(ducds)` | DUCDS | 0–55 Cut-off · 56–72 Mild · 73–91 Moderate · 92–109 Severe · 110–100000 Profound |
| `aggression_scale` | Aggression Scale | 0–45 স্বাভাবিক · 46–60 নিম্ন · 61–89 মাঝারি · 90–106 উচ্চ · 107–100000 চরম মাত্রার ক্রোধ |
| `satisfaction_with_life_scale` | Satisfaction with Life Scale | 31–35 চরমভাবে সন্তুষ্ট · 26–30 সন্তুষ্ট · 21–25 কিছুটা সন্তুষ্ট · 20 নিরপেক্ষ · 15–19 কিছুটা অসন্তুষ্ট · 10–14 অসন্তুষ্ট · 5–9 চরমভাবে অসন্তুষ্ট |
| `hopelessness_scale_(beck)` | Hopelessness Scale (Beck) | 0–3 None/minimal · 4–8 Mild · 9–14 Moderate · 15–100000 Severe |
| `social_interaction_anxiety_scale` | Social Interaction Anxiety Scale | 0–20 Slightly · 21–40 Moderately · 41–60 Very Much · … |
| `nicotine_addiction_scale` | Nicotine Addiction Scale | (own `range`) |
| `social_avoidance_and_distress_scale` | Social Avoidance and Distress Scale | (own `range`) |

(Each scale's `options`/`weights` vary per question; some use Likert 1–5, some
reverse-scored, etc. The scoring code never hard-codes them — it reads each
question's `options` at runtime.)

### 12.3 Scoring math (exact, `useEffect([submitted])`)
Guards: if `!submitted` return; if `!slug` throw `'slug is missing!!'`.
```
questionAnswers = questions.map((q,i) => ({ question:q.question, answer:answers[i] }))
totalWeight = 0; maxWeight = 0;
for i in 0..answers.length-1:
  maxx = Math.max(...questions[i].options.map(o => o.weight))
  wght = questions[i].options.find(o => o.label === answers[i]).weight
  totalWeight += wght
  maxWeight   += maxx
// severity = first range bucket containing totalWeight
stage = undefined
for j in 0..questionObject.range.length-1:
  if range[j].min <= totalWeight && range[j].max >= totalWeight:
    stage = range[j].severity; break
```
- **Payload** (`submitSuggestedScale`):
  `{ questionAnswers, assessmentId, totalWeight, stage, maxWeight }`.
- POST `/user/submit-suggested-scale`. (Note: result is awaited but **not
  checked** for `success`.)
- `setIsLoading(false)`; then
  `navigation.replace(PROF_SUGGESTED_SCALE_RESULT, { slug, totalWeight, stage,
  maxWeight, goToBack })`.

### 12.4 Render states & back
- `isLoading` → `<Loader>`; `error` → `<ErrorButton title={error}>`;
  `questions` empty/non-array → `null`; else `<Quizes>` inside a `ScrollView`.
- **Back:** `useBackPress(PROF_SUGGESTED_SCALE, goToBack)` → `goToBack`/`HOMEPAGE`.
- **Edge cases:** if `assessmentSlug` has no match in `profScales`,
  `_questionObject` is `undefined` → `_questionObject.ques` throws. If `stage`
  stays `undefined` (score outside all bands) it is still posted/forwarded.

---

## 13. ProfScaleResult — `profScaleResult.js`

**Purpose.** Result page for a professional-suggested scale.

- **Route:** `ProfScaleResult` · **Header:** `Your Score`.
- **Navigation IN:** `ProfSuggestedScale.replace(...)` with
  `{ goToBack, totalWeight, stage, maxWeight, slug }`.
- No API/redux state (only `redirectToHomepage` from `useHelper`).

### 13.1 Logic / UI
- `questionObject = data.find(d => d.id === slug)`; throws `'Question Object is
  missing!!'` if not found.
- `percentage = maxWeight>0 ? Math.round((totalWeight/maxWeight)*100) : 0`
  (computed but **not rendered** in the current layout).
- Renders: heading `{questionObject.name}`; `তীব্রতা: {stage}` (the band label);
  a `SubmitButton` `হোমপেইজে যান` → `redirectToHomepage()` (→ `Homepage` for
  users, `ProHomepage` for professionals).
- **Back:** `useBackPress(PROF_SUGGESTED_SCALE_RESULT, goToBack)` →
  `goToBack`/`HOMEPAGE`.

---

## 14. ResultHistory — `ResultHistory.js`

**Purpose.** Shows the last 10 results for a given `type` as a line chart +
a 3-column table.

- **Route:** `ResultHistory`. **Navigation IN:** `AskForTest` "আগের রেজাল্ট গুলো
  দেখুন" with `{ ...route.params }` (must include `type`). Throws
  `'ResultHistory: type is required'` if `type` missing.
- **Local state:** `isLoading` (init `true`), `data[]`, `error`, `tableData[]`, `label[]`.

### 14.1 Effect / API
`ApiExecutor(recent10TestResultsHistory({ type }))` →
GET `/user/result-history-data/{type}`. Response: `{ tests:[{date, score,
severity}] }`.
- Build per-test row `[date, "{score}", severity]` → `tableData` (in response
  order).
- `dataArray.unshift(parseInt(test.score))` and `dateArray.unshift("DD/MM/YY")`
  (date split on `/`, year sliced to 2 digits) → chart data **reversed**
  (oldest→newest left to right).

### 14.2 Render
- `isLoading` → `<Loader>`; `error` → `<ErrorButton>`; empty data →
  `<ErrorButton title="কোনো তথ্য পাওয়া যায়নি">`.
- Else: `<Chart data={data} labels={label} />`, heading `সর্বশেষ ১০টি স্কোর`,
  `<Table widthArr={[100,100,120]} tableData={tableData} />`.
- **Back:** `ResultHistory` is **not** in `backScreenMap` and the component does
  not call `useBackPress`, so hardware back uses default React Navigation
  behaviour (pop).

---

## 15. Chart — `App/components/Chart.js`

`<AppChart data labels />` wraps `react-native-chart-kit` `LineChart`.
- `width = Dimensions.window.width * 0.99`, `height = 250`, `bezier`, `fromZero`,
  `withDots={false}`, `yAxisInterval=1`.
- `chartConfig`: white gradient, black line color, `decimalPlaces:2`,
  `fillShadowGradient: colors.primary` @ 0.5 opacity, dot stroke `#ff2e63`,
  label font 12.5.
- `ingoreIndex(len)` (passed to `hidePointsAtIndex`): if `len<=6` returns `[]`
  (show all). Else hides all indices **except** roughly every `ceil(len/5)`-th
  index counting back from the last — i.e. keeps ~5 evenly spaced x-labels on
  long histories. (Misspelled `ingoreIndex`; keep or rename on rebuild.)

---

## 16. End-to-end flow summary

```
Homepage
 ├─ Intro tile  → HomepageScale (5Q, msm, score=raw*4 → 0..100)
 │                  → submitTest → CircularQuizResult(meanResult)
 │                       ├─ fromVideo → VideoExercise
 │                       └─ else      → ThreeScales
 ├─ GHQ/PSS/ANX → AskForTest(scaleId,type,preTest:true,redirectTo:RESULT_OUT_OF_100)
 │                  ├─ "স্কেলটি পূরণ করুন" → Test
 │                  │     → submitTest(raw score, severity, totalScore)
 │                  │     → updateMoj/Mcn/Dn → goToAnotherPage(RESULT_OUT_OF_100)
 │                  │         → QuizResultOutOf100(stage)
 │                  │             ├─ severe → AllProfessionals
 │                  │             └─ always → VideoExerciseList
 │                  └─ "আগের রেজাল্ট" → ResultHistory(type) → Chart + Table
 └─ exercise tile (gated) → VideoExerciseList

ThreeScales (post-intro hub) → AskForTest(preTest:false, goToBack:ThreeScales) → …

Profile flow → Test(fromProfile, profile scaleId, redirectTo from profileScales)
   ├─ all "না" (4 of 5 scales) → Profile
   ├─ SHOW_VIDEO  → VideoScreen
   ├─ HELP_CENTER → HelpCenter
   └─ (score:0 always; YesNo weights are 0)

Professional-suggested scale → ProfSuggestedScale(assessmentId)
   → checkIfAssessmentIsAlreadyTaken → resolve profScales[slug]
   → submitSuggestedScale(totalWeight, maxWeight, stage from range[])
   → ProfScaleResult(name, stage) → Homepage
```

### 16.1 Scoring cheat-sheet

| Scale | type | options→weights | raw range | stored `score` | `totalScore` | severity source |
|---|---|---|---|---|---|---|
| Intro 5Q | `manoshikShasthoMullayon` | 0..5 (=value) | 0–25 | **raw×4 (0–100)** | 25 | result page: `≤50` danger else ok (severity in payload is buggy, always তীব্র) |
| GHQ-12 | `manoshikObosthaJachaikoron` | 0/1 bimodal | 0–12 | raw | 12 | client bands `≤4 / ≤9 / >9` |
| PSS-10 | `manoshikChapNirnoy` | 0–4 (4 reversed) | 0–40 | raw | 40 | client bands `≤13 / ≤26 / >26` |
| Anxiety-36 | `duschintaNirnoy` | 0–4 | 0–144 | raw | 144 | client bands `≤54 / ≤66 / >66` |
| Profile (5) | childCare/corona/domestic/psychotic/suicide | YesNo, weight 0 | 0 | 0 | — | none; routes by `redirectTo` |
| Prof-suggested (10) | (slug) | per-scale | per-scale | `totalWeight` | `maxWeight` | first matching `range[]` band |
