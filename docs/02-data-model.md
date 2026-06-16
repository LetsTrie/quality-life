# 02 — Data Model

All collections live in one MongoDB database. Mongoose model names (= MongoDB collection names)
are centralised in `models/model_name.js`:

| Logical name | Collection / model name |
|---|---|
| User | `qlife_user` |
| Professional | `qlife_professional` |
| Appointment | `qlife_appointment` |
| ProfessionalsClient | `qlife_professionals_client` |
| ProfessionalsAssessment | `qlife_professional_assessment` |
| Notification | `qlife_notification` |
| Test | `qlife_test` |
| Rating | `qlife_rating` |

Every schema has Mongoose `{ timestamps: true }` → adds `createdAt` and `updatedAt` (Date) unless noted.
All `_id` are MongoDB ObjectIds. References below are ObjectId foreign keys.

Shared enums (`utils/constants.js`):
- `ROLES = { USER: 'user', PROFESSIONAL: 'professional' }`
- OTP use cases: `FORGET_PASSWORD = 'forget-password'`, `VERIFY_EMAIL = 'email-verification'`
- Appointment / notification types: `APPOINTMENT_REQUESTED`, `APPOINTMENT_ACCEPTED`, `SUGGEST_A_SCALE`, `SCALE_FILLUP_BY_USER` (also `REQUESTED` defined but unused).

---

## 1. User — `qlife_user`

A member of the public.

| Field | Type | Required | Default | Notes |
|---|---|---|---|---|
| `email` | String | ✔ | — | **unique** |
| `password` | String | ✔ | — | bcrypt hash (cost 10) |
| `name` | String | | | |
| `age` | Number | | | min 5, max 150. **Presence of `age` = "profile completed enough" gate** |
| `gender` | String | | | client sends `Male`/`Female`/`Others` |
| `isMarried` | Boolean | | | |
| `location` | Object | | | `{ zila: String, upazila: String, union: String }` (embedded) |
| `lastIntroTestDate` | String | | | date string of last intro test |
| `mentalHealthProfile` | [String] | | | which "profile" scales the user has filled (e.g. `coronaProfile`); used to compute profile completeness (needs 5 distinct) |
| `shownVideo` | [String] | | | YouTube video ids the user has watched |
| `suggestedScale` | [String] | | | (legacy field; suggested scales now live in ProfessionalsAssessment) |
| `isEmailVerified` | Boolean | | `false` | set true after OTP verify |
| `otp` | String | | | current OTP code |
| `otpExpiredAt` | Date | | | OTP expiry (10 min) |
| `otpUseCase` | String enum | | | `forget-password` \| `email-verification` |
| `canResetPassword` | Boolean | | `false` | set true after OTP verify for forget-password; consumed by reset |
| `createdAt`/`updatedAt` | Date | | | timestamps |

**Method:** `generateTokens(id)` → returns `[accessToken, refreshToken]` signed with role `user` (see [05](05-auth-roles-and-sessions.md)).

**Indexes:** unique on `email`.

---

## 2. Professional — `qlife_professional`

A clinician. Built up over a 4-step registration. String fields use a max-length helper (`StringOfMaxLength(n)` → `{type:String, maxlength:n}`).

| Field | Type | Required | Default | Constraints / notes |
|---|---|---|---|---|
| `name` | String | ✔ | — | min 2, max 50 |
| `email` | String | ✔ | — | **unique**, max 254 |
| `gender` | String enum | | | `Male` \| `Female` \| `Others` |
| `password` | String | | | bcrypt hash, max 128 |
| `designation` | String | | | max 50 |
| `batch` | String | | | max 20 |
| `bmdc` | String | | | max 50 (BMDC registration no.) |
| `workplace` | String | | | max 100 |
| `profession` | String | | | max 50; values: `Clinical psychologist` / `Assistant clinical psychologist` / `Psychiatrist` |
| `zila` | String | | | max 25 |
| `upazila` | String | | | max 25 |
| `union` | String | | | max 25 |
| `isVerified` | Boolean | | `false` | **admin approval gate** — login blocked until true |
| `step` | Number | | `1` | min 1, max 4. **Registration progress gate** — protected routes blocked until `step===4` |
| `experience` | String | | | max 100 (step 2) |
| `eduQualification` | String | | | max 100 (step 2) |
| `specializationArea` | String | | | max 100 (step 2) |
| `otherSpecializationArea` | String | | | max 100 (step 2, when specialization = "অন্যান্য"/other) |
| `fee` | String | | | max 20 (step 2) |
| `telephone` | String | | | max 20 (step 2) |
| `availableTime` | Array | | | (step 3) `[{ day: String, timeRange: [{ from: String, to: String }] }]`. `from`/`to` formatted `hh:mmAM/PM`. day ∈ Sunday…Saturday |
| `maximumWeeklyClient` | String | | | max 20 (step 4) — from fixed Bangla option list |
| `averageWeeklyClient` | String | | | max 20 (step 4) |
| `numberOfClients` | Array | | | (step 4) `[{ location: String(max20), count: String(max5) }]` |
| `reference` | String | | | max 100 (step 4) |
| `visibility` | Boolean | | `true` | whether the professional appears in the user-facing list |
| `isEmailVerified` | Boolean | | `false` | OTP verification |
| `otp` | String | | | max 10 |
| `otpExpiredAt` | Date | | | |
| `otpUseCase` | String enum | | | `forget-password` \| `email-verification` |
| `canResetPassword` | Boolean | | `false` | |
| `createdAt`/`updatedAt` | Date | | | |

**Fixed option list for `maximumWeeklyClient` / `averageWeeklyClient`** (Bangla):
`০-৫ জন`, `৬-১০ জন`, `১১-১৫ জন`, `১৬-২০ জন`, `২১ বা তার উর্ধে`.

**Method:** `generateTokens(id)` → role `professional`.

**Indexes:** unique on `email`.

**Visibility in user list requires:** `isVerified === true && visibility === true && step === 4`.

---

## 3. Appointment — `qlife_appointment`

A user's booking request to a professional and its full lifecycle.

| Field | Type | Required | Default | Notes |
|---|---|---|---|---|
| `user` | ObjectId → User | | | the requester |
| `prof` | ObjectId → Professional | ✔ | | target professional |
| `permissionToSeeProfile` | Boolean | | `false` | did the user allow the prof to view their profile/test history |
| `dateByClient` | Date | ✔ | | requested date/time |
| `status` | String enum | | `APPOINTMENT_REQUESTED` | `APPOINTMENT_REQUESTED` \| `APPOINTMENT_ACCEPTED` |
| `hasProfViewed` | Boolean | | `false` | prof opened/saw the request |
| `profViewedAt` | Date | | | |
| `hasProfRespondedToClient` | Boolean | | `false` | prof accepted/responded |
| `profRespondedAt` | Date | | | |
| `dateByProfessional` | Date | | | date the prof proposed when accepting |
| `messageFromProf` | String | | | max 500 |
| `isActive` | Boolean | | `true` | soft state for the unique constraint |
| `createdAt`/`updatedAt` | Date | | | |

**Index:** **unique** compound `{ user: 1, prof: 1, isActive: 1 }` → a user can have only one *active* appointment per professional.

**Lifecycle:**
1. Created on `POST /user/take-appointment` (status `APPOINTMENT_REQUESTED`, `isActive:true`). Notification + email to prof.
2. `POST /prof/appointment-seen/:id` → sets `hasProfViewed`/`profViewedAt`; marks the request notification seen.
3. `POST /prof/appointment-response/:id` → sets `hasProfRespondedToClient`, `profRespondedAt`, `status=APPOINTMENT_ACCEPTED`, optional `dateByProfessional` + `messageFromProf`; creates/activates a `ProfessionalsClient`; optionally creates a suggested `ProfessionalsAssessment`; notification + email to user.

---

## 4. ProfessionalsClient — `qlife_professionals_client`

The relationship created when a professional accepts an appointment. Represents "this user is a client of this professional".

| Field | Type | Required | Default | Notes |
|---|---|---|---|---|
| `user` | ObjectId → User | ✔ | | |
| `prof` | ObjectId → Professional | ✔ | | |
| `customId` | String | | random 7-digit (`1000000–9999999`) | human-friendly client id, generated by default function |
| `isActive` | Boolean | | `true` | |
| `createdAt`/`updatedAt` | Date | | | |

**Index:** **unique** compound `{ user: 1, prof: 1, isActive: 1 }`.

Created (or reactivated if previously `isActive:false`) inside the appointment-response flow.

---

## 5. ProfessionalsAssessment — `qlife_professional_assessment`

A scale a professional suggested to a user, and the user's answers/score once submitted.

| Field | Type | Required | Default | Notes |
|---|---|---|---|---|
| `user` | ObjectId → User | | | who fills it |
| `prof` | ObjectId → Professional | | | who suggested it |
| `client` | ObjectId → ProfessionalsClient | | | the client relationship |
| `assessmentSlug` | String | | | identifies which professional scale (maps to scale data) |
| `hasCompleted` | Boolean | | `false` | true once the user submits |
| `totalWeight` | String | | | computed total score (string) |
| `stage` | String | | | derived severity band label |
| `maxWeight` | String | | | max possible score (string) |
| `questionAnswers` | Array | | | `[{ question: String, answer: String }]` |
| `completedAt` | Date | | | set on submission |
| `createdAt`/`updatedAt` | Date | | | |

> ⚠ Note: `model_name.js` also defines `PROFESSIONAL_ASSESSMENT_RESULT = 'qlife_professional_assessment_result'` but **no model uses it** — results are stored inline on this document.

> ⚠ `controllers/user.js` (`unreadNotifications`, `getNumberOfNotifications`) queries `ProfAssessment.hasSeen` which **does not exist on this schema** — see [03](03-api-reference.md).

---

## 6. Notification — `qlife_notification`

In-app notification for a user or professional.

| Field | Type | Required | Default | Notes |
|---|---|---|---|---|
| `user` | ObjectId → User | | | the user party |
| `prof` | ObjectId → Professional | | | the professional party |
| `for` | String enum | ✔ | | recipient role: `user` \| `professional` |
| `type` | String enum | ✔ | | `APPOINTMENT_REQUESTED` \| `APPOINTMENT_ACCEPTED` \| `SUGGEST_A_SCALE` \| `SCALE_FILLUP_BY_USER` |
| `hasSeen` | Boolean | | `false` | |
| `appointment` | ObjectId → Appointment | | | linked appointment (for appointment types) |
| `assessment` | ObjectId → ProfessionalsAssessment | | | linked assessment (for scale types) |
| `client` | ObjectId → ProfessionalsClient | | | optional link |
| `createdAt`/`updatedAt` | Date | | | |

**Index:** `{ user: 1, type: 1 }`.

See [06-notifications.md](06-notifications.md) for the full lifecycle of each type.

---

## 7. Test — `qlife_test`

A completed self-assessment by a user (both the primary scales and the yes/no profile scales).

| Field | Type | Required | Default | Notes |
|---|---|---|---|---|
| `type` | String | | | scale key, e.g. `manoshikShasthoMullayon`, `manoshikObosthaJachaikoron`, `manoshikChapNirnoy`, `duschintaNirnoy`, `childCare`, `coronaProfile`, `domesticViolence`, `psychoticProfile`, `suicideIdeation` |
| `userId` | String | | | the user's id (stored as string, not a populated ref) |
| `questionAnswers` | Array | | | `[{ question: String, answer: String }]` |
| `date` | String | | | date string; **format differs between writers** (see ⚠ below) |
| `score` | String | | | computed score (string) |
| `totalScore` | String | | | max score (string) |
| `severity` | String | | | severity band label |
| `fromVideo` | Boolean | | `false` | whether the test was launched from a video flow |
| `postTest` | Boolean | | | whether it's a post-intervention test |
| `createdAt`/`updatedAt` | Date | | | |

> ⚠ **Date format inconsistency.** `controllers/user.js getDate()` writes `mm/dd/yyyy`; `controllers/helpers.js getDate()` writes `dd/mm/yyyy`; both have `modifyTime()` that swap parts before formatting with moment `'ll'`. The user-side homepage/profile progress and the professional-side client profile use *different* helpers. Preserve carefully or normalise to ISO in the rebuild. Severity bands used by the professional helper: `manoshikChapNirnoy` [13,26], `duschintaNirnoy` [54,66], `manoshikObosthaJachaikoron` [4,9] → `স্বাভাবিক/মাঝামাঝি/তীব্র মাত্রা`.

The four **"primary"/progress** scales surfaced on the homepage are:
`manoshikShasthoMullayon`, `manoshikObosthaJachaikoron`, `manoshikChapNirnoy`, `duschintaNirnoy`.
Allowed `type` values are enforced in `POST /user/test` (see [03](03-api-reference.md)).

---

## 8. Rating — `qlife_rating`

A user's rating/comment on a video or content item.

| Field | Type | Required | Default | Notes |
|---|---|---|---|---|
| `user` | ObjectId → User | | | |
| `rating` | Number | ✔ | | min 0, max 5 |
| `comment` | String | | | |
| `videoUrl` | String | | | video/content URL or id rated |
| `contentId` | String | | | content identifier |
| `createdAt`/`updatedAt` | Date | | | |

---

## 9. Relationships diagram

```
User 1───∞ Test                       (Test.userId = User._id, stored as string)
User 1───∞ Rating                     (Rating.user)
User 1───∞ Appointment ∞───1 Professional
User 1───∞ ProfessionalsClient ∞───1 Professional
User 1───∞ ProfessionalsAssessment ∞───1 Professional   (also → ProfessionalsClient)
(User|Professional) 1───∞ Notification  (Notification.user / .prof, recipient via .for)
Notification ∞───1 Appointment | ProfessionalsAssessment | ProfessionalsClient
```

## 10. Cascade-delete rules (must preserve)

**Delete User** (`POST /user/delete-account`): delete all `Appointment{user}`, `ProfessionalsClient{user}`, `ProfessionalsAssessment{user}`, `Rating{user}`, `Test{userId}`, `Notification{user}`, then the `User`.

**Delete Professional** (`POST /prof/delete-account`): delete all `ProfessionalsClient{prof}`, `Appointment{prof}`, `ProfessionalsAssessment{prof}`, `Notification{prof}`, then the `Professional`.

> Note: deleting a professional does **not** clean up the counterpart user notifications referencing those appointments/assessments, and deleting a user does not clean up the professional's notifications referencing them. Decide whether to tighten this in the rebuild.

## 11. Static reference data (not in the DB)

These are shipped as static files in the **frontend** and define questionnaire content and scoring. They are effectively part of the data model and must be carried over:

- **User self-assessment scales:** `App/data/scales/GHQ.js`, `PSS.js`, `ANXIETY.js`, `content.js`; `App/data/mentalHealthRating.js` (intro 5-Q). See [screens/02](screens/02-user-home-assessments.md).
- **Yes/No profile scales:** `childCare.js`, `coronaProfile.js`, `domesticViolence.js`, `psychoticProfile.js`, `suicideIdeation.js`, `YesNo.js`, plus routing in `profileScales.js`.
- **Professional scales:** `App/data/profScales.js` + `App/data/pro/assessmentTools/list.js`. See [scales-professional-catalog.md](scales-professional-catalog.md).
- **Videos:** `App/data/videos.js` (20 YouTube items + `content_id`s), `videoScreenPages.js`.
- **Help center / emergency contacts:** `App/data/helpCenter.js`.
- **Bangladesh location data:** `App/data/RegionInformation.json` (~16k lines: zila/upazila/union hierarchy for the location pickers).

If moving scale data server-side in the rebuild, model each scale as
`{ slug, name, questions:[{ text, options:[{ label, value, weight }] }], ranges:[{ min, max, severity }], needToEvaluate }`.
