# 04 — Navigation, Redirects & the Drawer

The client uses React Navigation: a **Drawer** navigator wrapping a single **Stack** navigator
(`MainStackNavigator`). All real screens are stack screens; the drawer only provides the side menu.
This document defines the navigation graph, the route-name constants, the **back-navigation engine**,
the **server-driven redirects**, and the drawer. Per-screen "navigation in/out" details live in the
`screens/*.md` docs; this is the shared model.

## 1. Route-name constants (`App/navigation/constants.js`)

Routes are referenced everywhere by these constants (the value is the actual route name string). Key mappings (constant → route name → screen file → header title):

| Constant | Route name | Screen file | Header title |
|---|---|---|---|
| WELCOME | `Welcome` | pages2024/Welcome | (no header) |
| LOGIN | `Login` | pages2024/UserLogin | (no header) |
| FORGET_PASSWORD | `FORGET_PASSWORD` | ForgetPassword | পাসওয়ার্ড পরিবর্তন করুন |
| EMAIL_VERIFICATION_PAGE | `EMAIL_VERIFICATION_PAGE` | EmailVerification | অ্যাকাউন্ট ভেরিফাই করুন |
| USER_REGISTER_CONSENT | `UserRegisterConsent` | UserRegistrationConsent | মানসিক স্বাস্থ্য মূল্যায়ন |
| REGISTER_WITH_EXTRA_INFORMATION | `AdditionalInformation` | AdditionalInformation | (no header) |
| ONBOARDING_GUIDELINE | `StartingGuideline` | pages2024/StartingGuideline | অভিনন্দন |
| HOMEPAGE | `Homepage` | Homepage | Quality Life |
| REGISTER | `Register` | Register | (no header) |
| PROFILE | `Profile` | Profile | প্রোফাইল |
| UPDATE_USER_PROFILE | `UpdateProfile` | UpdateProfile | প্রোফাইল আপডেট করুন |
| MENTAL_HEALTH_ASSESSMENT | `HomepageScale` | HomepageScale | মানসিক স্বাস্থ্য মূল্যায়ন |
| THREE_SCALES | `ThreeScales` | ThreeScales | মানসিক স্বাস্থ্য যাচাই |
| TEST | `Test` | Test | route param `label` or স্কেলটি পূরণ করুন |
| MENTAL_HEALTH_ASSESSMENT_RESULT | `CircularQuizResult` | CircularQuizResult | ফলাফল |
| QUIZ_RESULT_OUT_OF_100 | `QuizResultOutOf100` | QuizResultOutOf100 | আপনার স্কোর |
| ASK_FOR_TEST | `AskForTest` | AskForTest | (no header) |
| RESULT_HISTORY | `ResultHistory` | ResultHistory | পূর্ববর্তী রেজাল্টসমূহ |
| RATING | `Rating` | Rating | মানসিক স্বাস্থ্য পরিমাপের অবস্থা |
| VIDEO_EXERCISE_LIST | `VideoExerciseList` | VideoExerciseList | অনুশীলন করুন |
| VIDEO_EXERCISE | `VideoExercise` | VideoExercise | অনুশীলন |
| VIDEO_SCREEN | `VideoScreen` | VideoScreen | (icon-only) |
| HELP_CENTER | `HelpCenter` | HelpCenter | সাহায্য কেন্দ্র |
| CENTRAL_HELP_CENTER | `CentralHelpCenter` | CentralHelpCenter | সাহায্য কেন্দ্র |
| SIDEBAR_APP_GUIDELINE | `DrawerGuideline` | DrawerGuideline | ব্যবহারিক নির্দেশিকা |
| SETTINGS | `Setting` | Setting/Setting | সেটিংস |
| ABOUT_US | `AboutUs` | Setting/AboutUs | আমাদের সম্পর্কিত তথ্য |
| PRIVACY_POLICY | `PrivacyPolicy` | Setting/PrivacyPolicy | গোপনীয়তা নীতি |
| UPDATE_PASSWORD | `UpdatePassword` | Setting/UpdatePassword | পাসওয়ার্ড পরিবর্তন করুন |
| NOTIFICATIONS | `Notifications` | prof/Notification | Notifications |
| PROFESSIONALS_LIST | `AllProfessionals` | AllProfessionals | আমাদের প্রফেশনালস |
| PROFESSIONAL_DETAILS | `professionalDetails` | professionalDetails | অ্যাপয়েন্টমেন্ট নিন |
| USER_APPOINTMENT_TAKEN | `AppointmentSuccess` | AppointmentSuccess | অভিনন্দন |
| APPOINTMENT_STATUS | `AppointmentStatus` | UserIntProf/AppointmentStatus | Appointment |
| PROF_SUGGESTED_SCALE | `ProfSuggestedScale` | ProfSuggestedScale | স্কেলটি পূরণ করুন |
| PROF_SUGGESTED_SCALE_RESULT | `ProfScaleResult` | profScaleResult | Your Score |
| PROF_LOGIN | `LoginPro` | prof/Login | (no header) |
| PROF_REGISTRATION_CONSENT | `RegisterConsentPro` | prof/RegisterConsentPro | সম্মতিপত্র |
| PROF_REGISTER_STEP_1 | `RegisterPro` | prof/RegisterStep1 | (no header) |
| PROF_REGISTER_STEP_2 | `RegisterProStep2` | prof/RegisterStep2 | Registration - Step 2 |
| PROF_REGISTER_STEP_3 | `RegisterProStep3` | prof/RegisterStep3 | Registration - Step 3 |
| PROF_REGISTER_STEP_4 | `RegisterProStep4` | prof/RegisterStep4 | Pre-evaluation |
| WAIT_FOR_VERIFICATION | `AccountConfirmation` | prof/WaitForVerification | ধন্যবাদ |
| PROF_HOMEPAGE | `ProHomepage` | prof/ProHomepage | Homepage |
| PROF_PROFILE | `ProfProfile` | prof/ProfProfile | My Profile |
| PROF_UPDATE_PROFILE | `ProfUpdateProfile` | prof/ProfUpdateProfile | Update Profile |
| PROF_ASSESSMENT_TOOLS | `ProAssessments` | prof/Assessments | Assessment tools |
| PROF_ASSESSMENT_TOOL_DETAILS | `ProAssessmentDetails` | prof/AssessmentDetails | Tool Overview |
| PROF_CLIENT_REQUEST | `ClientRequestPro` | prof/ClientRequest | Client Requests |
| PROF_RESPONSE_CLIENT_REQUEST | `ResponseClientRequest` | prof/ResponseRequest | Client Request |
| PROFESSIONALS_CLIENT | `ProMyClients` | prof/MyClients | My Clients |
| CLIENT_PROFILE | `ClientProfile` | prof/ClientProfile | Client Profile |
| CLIENT_TEST_RESULT | `ClientTestResult` | prof/ClientTestResult | Scale Result |

Special action sentinels:
- `SPECIAL_LOGOUT_ACTION = ':: logout ::'` — back here means **log out**.
- `GO_TO_BACK = ':: go back ::'` — back here means `navigation.goBack()`.
- `USER_TYPE='USER'`, `PROF_TYPE='PROF'`.

`initialRouteName = 'Welcome'`. Default stack header: primary-color bar, white centered title, and a **drawer-toggle "backburger" icon** on the left (`screenOptions`). Many screens override `headerLeft` with a custom back handler (below).

## 2. Header back-button behaviour

Three patterns are used in `StackNavigator.js`:

1. **`safeTransit({navigation, route, role})`** — the standard. Looks at `route.params.goToBack` first (if set, redirect there), else `backScreenMap[route.name]`. Resolves the target via `selectHomepageByRole` (so HOMEPAGE↔PROF_HOMEPAGE swap by role), then `navigation.replace(target)` (falls back to `navigate`). If target is `GO_TO_BACK` → `navigation.goBack()`. Used by most prof screens, ForgetPassword, EmailVerification, Notifications, etc.
2. **Direct `navigation.navigate(backScreenMap[CONST])`** — simpler screens (Profile, Settings sub-pages, ThreeScales, VideoExercise…).
3. **`route.params.goToBack ? navigation.replace(goToBack) : navigation.navigate(backScreenMap[CONST])`** — result screens that may be reached from different places (CircularQuizResult, QuizResultOutOf100, AppointmentStatus, ProfSuggestedScale, ProfScaleResult).

## 3. Hardware back-button (`App/contexts/BackPress.js`)

`useBackPress(screenName, previousPage=null)` registers an Android hardware-back handler that mirrors the header logic:
- target = `backScreenMap[screenName]` (or `previousPage` if provided).
- if target is `SPECIAL_LOGOUT_ACTION` → `logout()`.
- if target is `GO_TO_BACK` → `navigation.goBack()`.
- else `navigation.replace(selectHomepageByRole(target, role))` (fallback `navigate`).
Screens call this hook to get consistent hardware-back behaviour.

## 4. Back-navigation map (`App/navigation/backScreenMap.js`)

The authoritative "where does Back go" table. Resolve constants via §1.

| From screen | Back target |
|---|---|
| AllProfessionals | Homepage |
| professionalDetails | AllProfessionals |
| AppointmentStatus | AllProfessionals |
| VideoScreen | Profile |
| VideoExerciseList | Homepage |
| VideoExercise | VideoExerciseList |
| ThreeScales | Homepage |
| UpdateProfile (user) | Profile |
| Profile | Homepage |
| Login | Welcome |
| Register | Welcome |
| WaitForVerification (AccountConfirmation) | Welcome |
| RegisterPro (step1) | RegisterConsentPro |
| RegisterProStep2/3/4 | **SPECIAL_LOGOUT_ACTION** (back logs out) |
| ProHomepage | Welcome |
| Homepage | Welcome |
| LoginPro | Welcome |
| ProfProfile | ProHomepage |
| ProfUpdateProfile | GO_TO_BACK |
| ProAssessments | GO_TO_BACK |
| ProAssessmentDetails | GO_TO_BACK |
| ClientRequestPro | ProHomepage |
| ResponseClientRequest | ProHomepage |
| ProMyClients | ProHomepage |
| ClientProfile | GO_TO_BACK |
| AppointmentSuccess | AllProfessionals |
| AskForTest | Homepage |
| Test | Homepage |
| HelpCenter | Homepage |
| Setting | Homepage |
| AboutUs | Setting |
| PrivacyPolicy | Setting |
| QuizResultOutOf100 | Homepage |
| AdditionalInformation | **SPECIAL_LOGOUT_ACTION** |
| StartingGuideline | **SPECIAL_LOGOUT_ACTION** |
| UpdatePassword | Setting |
| CentralHelpCenter | Homepage |
| DrawerGuideline | Homepage |
| Rating | VideoExerciseList |
| HomepageScale | Homepage |
| CircularQuizResult | Homepage |
| Notifications | Homepage |
| ProfSuggestedScale | Homepage |
| ProfScaleResult | Homepage |
| ClientTestResult | GO_TO_BACK |
| FORGET_PASSWORD | GO_TO_BACK |
| EMAIL_VERIFICATION_PAGE | Welcome |
| UserRegisterConsent | GO_TO_BACK |

`selectHomepageByRole(page, role)`: if page is HOMEPAGE and role is professional → PROF_HOMEPAGE; if page is PROF_HOMEPAGE and role is user → HOMEPAGE; else page unchanged. (Keeps "home" correct per role when the same back-target is shared.)

## 5. Server-driven redirects (the most important runtime navigation logic)

`ApiExecutor` in `App/contexts/helper/index.js` inspects 401 responses and **navigates automatically**:

| Server 401 `type` | Client reaction |
|---|---|
| `EmailNotVerified` | Toast "Please verify your email"; read `{accountType, email}` from `errors[0].data`; `navigate(EMAIL_VERIFICATION_PAGE, {accountType, email})`. |
| `INCOMPLETE_PROFILE:STEP:n` (professional) | `n===1`→ step2, `2`→ step3, `3`→ step4, else → PROF_HOMEPAGE. |
| `INCOMPLETE_PROFILE:STEP:n` (user) | → `REGISTER_WITH_EXTRA_INFORMATION` (AdditionalInformation). |
| `InvalidToken` (expired/invalid access token) | Try `refreshTokener({refreshToken})` up to **3** times; on success store new tokens (`setAuthToken`) and **retry the original request**; on exhaustion Toast "Logging out…" + `logout()`. |

This is why the server's exact 401 `type` strings are part of the contract — preserve them or re-implement the equivalent client routing.

## 6. Login / logout / session entry

- **Login (user):** `POST /user/sign-in` → store role `user` + tokens (`setAuthToken`), store profile; navigate to Homepage (or AdditionalInformation if `isNewUser`). Details in [screens/01](screens/01-user-onboarding-auth.md).
- **Login (prof):** `POST /prof/login` → store role `professional` + tokens + prof info; navigate to ProHomepage (or the incomplete step). Details in [screens/05](screens/05-professional-registration-core.md).
- **Logout (`useHelper().logout`):** dispatch `SIGN_OUT, PROF_SIGN_OUT, DELETE_PROFILE, DELETE_ALL_PROF_REQUEST, RESET_NOTIFICATION_COUNT`; `navigation.reset({index:0, routes:[Welcome, (role===professional?PROF_LOGIN:LOGIN)]})`; close drawer.

## 7. The Drawer (`App/navigation/components/DrawerContent.js`)

Shown only when authenticated (`auth.role` set). Header swipe disabled; opened via the header backburger icon. Items (Bangla label → target), with icon:

| Label | Icon | Target | Visibility |
|---|---|---|---|
| হোমপেইজ | home | Homepage (user) / ProHomepage (prof) | all |
| আমার প্রোফাইল | account | Profile (user) / ProfProfile (prof) | all |
| আমাদের প্রোফেসনালস | badge-account-horizontal | AllProfessionals | **user only** |
| নোটিফিকেশন | bell | Notifications | all |
| হেল্প সেন্টার | phone-plus | CentralHelpCenter | all |
| ব্যবহারিক নির্দেশিকা | calendar-text | DrawerGuideline | all |
| সেটিংস | cog | Setting | all |
| লগ আউট করুন | exit-to-app | `logout()` | all (footer, primary bg) |

The drawer header shows `drawer_logo.png`.

## 8. Rebuild guidance
- The route graph is small and explicit; replicate the **constants + backScreenMap + selectHomepageByRole** triple on any stack.
- The **server-driven redirects** (§5) are the subtle part: keep the 401 `type` taxonomy and the client's reaction, or fold the equivalent gating into your router/guards.
- The **back-to-logout** behaviour for professional registration steps 2–4 and user onboarding (AdditionalInformation, StartingGuideline) is intentional — pressing back there ends the half-finished session.
