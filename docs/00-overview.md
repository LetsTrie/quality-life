# 00 — Product Overview

## What QLife is

QLife ("Quality Life") is a Bangla-language mobile mental-health platform. It lets ordinary
people **self-assess their mental health** with validated psychological scales, **watch
educational/coping videos**, and **connect with mental-health professionals** to book
appointments and complete professional-suggested assessments. Professionals get their own
side of the app to **review client requests, accept appointments, view client histories, and
suggest/score assessment scales**.

There are two completely separate authenticated experiences sharing one codebase and one
backend, distinguished by a `role` (`user` vs `professional`), plus an admin web page used only
to approve new professionals.

---

## The User journey (role = `user`)

1. **Welcome** → choose to continue as a user (login/register) or switch to professional side.
2. **Register** with email + password (≥8 chars, ≥1 letter & ≥1 digit). Account is created and JWT issued immediately.
3. **Email verification** via 6-digit OTP (10-minute expiry) — gated by the backend on first protected call.
4. **Additional information** (name, age, gender, marital status, location: zila/upazila/union) — required to finish the profile. Until `age` is set, the backend treats the profile as incomplete and the client is auto-redirected here.
5. **Starting guideline** onboarding.
6. **Homepage** — shows the four "primary" scale cards with last score/date, a "complete your profile" nudge, links to professionals, videos, help center, etc.
7. **Self-assessments:**
   - **Intro scale** (`manoshikShasthoMullayon`, 5 questions, WHO-5-like) → result out of 100.
   - **Three primary scales:** GHQ (`manoshikObosthaJachaikoron`), PSS (`manoshikChapNirnoy`), Anxiety (`duschintaNirnoy`).
   - **Profile scales** (yes/no): corona, psychotic, suicide ideation, domestic violence, child care. Each can redirect to a coping **video**, the **help center** (emergency contacts), or just record the answer.
   - Every submission is stored in the `Test` collection with score/severity and updates the homepage cards.
8. **Result history** — last 10 results per scale type.
9. **Videos** — 20 curated YouTube coping videos; watching marks them seen and may prompt a **rating**.
10. **Professionals** — browse verified professionals, view details, **request an appointment** (pick date/time, optionally grant profile-view permission). Track **appointment status** (requested → accepted, with the professional's date and message).
11. **Professional-suggested scales** — when a professional suggests a scale, the user is notified (push-less: in-app + email), fills it in, and the result goes back to the professional.
12. **Settings** — about, privacy, change password, **delete account** (cascades).

## The Professional journey (role = `professional`)

1. **Welcome** → professional side → **Login** (only allowed once `isVerified` by admin).
2. **Registration** is a **4-step** wizard preceded by a consent screen:
   - **Step 1:** email, password, name, gender, designation, batch, BMDC, profession, workplace, location. Creates the account (`step=1`, `isVerified=false`) and **emails the admin** an approval link.
   - **Step 2:** experience, education, specialization (+ "other"), fee, telephone → `step=2`.
   - **Step 3:** weekly availability (days + time ranges) → `step=3`.
   - **Step 4:** max/avg weekly clients, clients-by-location, reference → `step=4` (registration complete).
   - The backend gates protected routes until `step===4`; the client auto-redirects the professional to the correct next step.
3. **Admin approval** flips `isVerified=true` and emails the professional; only then can they log in.
4. **Wait-for-verification** screen shown post-registration.
5. **Pro homepage** — counts of new appointment requests and unread notifications; entry to clients, requests, assessment tools, profile, notifications.
6. **Client requests** — list of pending appointment requests; mark seen; **respond** (set a date, write a message, optionally attach an initial suggested scale). Accepting converts the requester into a **client**.
7. **My clients** — list of active clients with basic demographics.
8. **Client profile** — a client's demographics + their primary-test history (only the data the user permitted / professionally relevant subset).
9. **Suggest a scale** to a client (from the assessment-tools catalogue); the user is notified; when they submit, the professional is notified and can **view the submitted scale result**.
10. **Profile** — view/update professional profile; toggle **visibility** (whether they appear in the user-facing list); change password; delete account.
11. **Notifications** — paginated list; tapping routes to the relevant appointment/assessment.

## The Admin journey

- A single server-rendered page `GET /admin/professionals` lists all professionals in a table with an **Approve** button on unverified rows.
- Clicking Approve `POST /prof/approve` with `{profId}` → sets `isVerified=true` and emails the professional.
- ⚠ This page has **no authentication** in the current code.

---

## Core domain objects (see [02-data-model.md](02-data-model.md))

- **User** — a member of the public.
- **Professional** — a verified clinician with a multi-step profile.
- **Test** — a completed self-assessment by a user (primary or profile scale).
- **Appointment** — a user's booking request to a professional and its lifecycle.
- **ProfessionalsClient** — the relationship formed when a professional accepts an appointment.
- **ProfessionalsAssessment** — a scale a professional suggested to a user and the user's answers/score.
- **Notification** — an in-app notification for a user or professional.
- **Rating** — a user's rating/comment on a video or content item.

## Key invariants & business rules (must preserve)

1. **A user cannot have two simultaneous active appointments with the same professional** (unique compound index `{user, prof, isActive}` on `Appointment`). Same for `ProfessionalsClient`.
2. **Professionals must be admin-verified (`isVerified`) before they can log in.**
3. **A professional only appears in the user-facing list when `isVerified && visibility && step===4`.**
4. **Email must be verified (OTP) before protected actions** for both roles.
5. **Profile completeness gating:** users blocked until `age` set; professionals blocked until `step===4`. The client turns these 401 responses into auto-navigation to the right screen.
6. **Scoring is deterministic** from per-option weights and fixed severity bands — see scale docs. Severity language is Bangla: `স্বাভাবিক মাত্রা` / `মাঝামাঝি মাত্রা` / `তীব্র মাত্রা` for primary scales.
7. **Account deletion cascades** across Appointments, ProfessionalsClient, ProfessionalsAssessment, Ratings, Tests, Notifications.
8. **Suggesting/submitting scales and requesting/accepting appointments each create a Notification and send an email** to the counterparty.

## Glossary (Bangla → meaning)

| Term / type key | Meaning |
|---|---|
| `manoshikShasthoMullayon` (মানসিক স্বাস্থ্য মূল্যায়ন) | Intro 5-question mental-health self-rating → result out of 100 |
| `manoshikObosthaJachaikoron` (মানসিক অবস্থা যাচাইকরণ) | GHQ-12 general mental state |
| `manoshikChapNirnoy` (মানসিক চাপ নির্ণয়) | PSS-10 perceived stress |
| `duschintaNirnoy` (দুশ্চিন্তা নির্ণয়) | Anxiety scale (36 items) |
| `childCare` (সন্তান পালন) | Parenting-concern profile (yes/no) |
| `coronaProfile` (করোনা সম্পর্কিত) | COVID profile (yes/no) |
| `domesticViolence` (পারিবারিক সহিংসতা) | Domestic-violence profile (yes/no) |
| `psychoticProfile` (গুরুতর সমস্যা) | Psychotic-symptom profile (yes/no) |
| `suicideIdeation` (আত্মহত্যা পরিকল্পনা) | Suicide-ideation profile (yes/no) |
| `স্বাভাবিক / মাঝামাঝি / তীব্র মাত্রা` | Normal / Moderate / Severe level |
| zila / upazila / union | Bangladesh administrative location levels (district / sub-district / union) |
| BMDC | Bangladesh Medical & Dental Council registration |
