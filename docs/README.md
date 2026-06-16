# Quality Life (QLife) — Rebuild Specification

This folder is a **complete, implementation-independent specification** of the existing
Quality Life mental‑health application, written so the product can be **rebuilt from scratch
on a new technology stack** (frontend, backend, cloud) while preserving 100% of the current
behaviour and business logic.

The current system is:

- **Frontend:** Expo / React Native (mobile, Android-first), Redux + redux-persist, React Navigation.
- **Backend:** Node.js + Express + Mongoose (MongoDB).
- **Admin:** a server-rendered EJS page for approving professionals.
- **Email:** transactional email via SMTP (Brevo), with AWS SES wiring present but unused.

The app serves **two end-user roles** plus an admin:

| Role | Who | Entry |
|------|-----|-------|
| **User** (`user`) | A member of the public assessing their own mental health | Mobile app |
| **Professional** (`professional`) | A psychologist / psychiatrist who reviews clients, books appointments and suggests scales | Mobile app |
| **Admin** | Operator who approves professional sign-ups | Web page `/admin/professionals` |

The product domain is **Bangla (Bengali)** — most user-facing strings are in Bangla and must be preserved verbatim.

---

## How to read these docs

Read the backbone documents first (they define the cross-cutting contracts), then the
per-screen specs (they define each page).

### Backbone (cross-cutting)

| Doc | Contents |
|-----|----------|
| [00-overview.md](00-overview.md) | Product summary, the two role journeys end-to-end, glossary, key invariants |
| [01-architecture.md](01-architecture.md) | System topology, tech stack, project layout, build/deploy, environment variables |
| [02-data-model.md](02-data-model.md) | Every database collection, all fields, types, defaults, indexes, relationships, cascade-delete rules |
| [03-api-reference.md](03-api-reference.md) | Every HTTP endpoint: method, auth, validation, request, server logic, response, errors |
| [04-navigation-and-redirects.md](04-navigation-and-redirects.md) | Navigation graph, route constants, back-navigation map, redirect engine, the drawer |
| [05-auth-roles-and-sessions.md](05-auth-roles-and-sessions.md) | JWT access/refresh, OTP verify/reset, incomplete-profile gating, role model, session persistence |
| [06-notifications.md](06-notifications.md) | Notification model, all notification types, unread counts, lifecycle (create/seen/delete) |
| [07-emails-and-external-services.md](07-emails-and-external-services.md) | All transactional emails, templates, triggers; external services (SMTP, SES, Sentry, YouTube) |

### Scales / scoring

| Doc | Contents |
|-----|----------|
| [scales-professional-catalog.md](scales-professional-catalog.md) | Catalogue of every professional-administered scale: questions, option weights, severity bands, scoring |

The **user-facing self-assessment scales** (intro 5-question scale, GHQ, PSS, Anxiety, and the five
yes/no "profile" scales) and their scoring math are documented inside
[screens/02-user-home-assessments.md](screens/02-user-home-assessments.md).

### Per-screen specs (one section per page)

| Doc | Screens |
|-----|---------|
| [screens/01-user-onboarding-auth.md](screens/01-user-onboarding-auth.md) | Welcome, User Login, Registration consent, Register, Additional info, Starting guideline, Forget password, Email verification |
| [screens/02-user-home-assessments.md](screens/02-user-home-assessments.md) | User homepage, scale picker, three primary scales, the quiz engine, all result screens, result history, profile-suggested-scale fill-up |
| [screens/03-user-videos-profile-settings.md](screens/03-user-videos-profile-settings.md) | Video exercises, video player, rating, help center, guideline, user profile, update profile, settings, about, privacy, change password, delete account, **the drawer** |
| [screens/04-user-professional-interaction.md](screens/04-user-professional-interaction.md) | Professionals list, professional details, take-appointment flow, appointment success, appointment status |
| [screens/05-professional-registration-core.md](screens/05-professional-registration-core.md) | Professional login, consent, 4-step registration, wait-for-verification, pro homepage, pro profile, update profile, visibility |
| [screens/06-professional-client-management.md](screens/06-professional-client-management.md) | Client requests, respond to request, my clients, client profile, client test result, assessment tools, suggested-scale result, professional notifications |

---

## Important conventions used throughout

- **Bangla strings are quoted verbatim.** They are product copy and must be carried over unchanged.
- **"Logic must be maintained."** Where the original code contains a quirk or bug, the spec
  records both the *intended* behaviour and the *actual* behaviour, flagged as **⚠ Quirk/Bug**.
  When rebuilding, decide deliberately whether to preserve or fix each one — do not silently change behaviour.
- Endpoints are written as `METHOD /path`. All API paths are relative to the backend base URL
  (`EXPO_PUBLIC_API_URL` on the client).
- MongoDB collection names are the literal Mongoose model names (all prefixed `qlife_`).

## Known quirks / bugs catalogue (must-read before rebuild)

These were found while reading the source. Each is detailed in the linked doc.

- **Hardcoded SMTP credentials** in `services/email.js` (Brevo user/pass in plain text). Move to secrets. → [07](07-emails-and-external-services.md)
- **`getScaleResult` controller throws `Not implemented`** (`POST /prof/result-suggested-scale`) — dead endpoint. → [03](03-api-reference.md)
- **`ScaleResult.js`** is an unregistered dead screen stub. → [screens/02](screens/02-user-home-assessments.md)
- **`prof/SuggestedScaleResult.js`** is a non-functional `<p>` stub. → [screens/06](screens/06-professional-client-management.md)
- **Intro-scale severity logic** in `HomepageScale.js` is dead/always-severe; the result page re-derives severity. → [screens/02](screens/02-user-home-assessments.md)
- **`profession`/`gender` Joi validation** in `prof.validation.js` uses `Joi.number().valid(<strings>)` — can never match; see note. → [03](03-api-reference.md)
- **Assessment unread count** in `user.js` queries `ProfAssessment.hasSeen` which does not exist on that schema. → [03](03-api-reference.md)
- **`assessmentTools/list.js` ids (uuid) do not match `profScales.js` slugs**, and the tool count is hardcoded. → [scales-professional-catalog.md](scales-professional-catalog.md)
- **`approveProfessionalFromAdminPanel`** calls `sendErrorResponse` with wrong argument order on the not-found path. → [03](03-api-reference.md)
- Several **`.style.js` files are unused**; several screens have a dead "Welcome profile failure" button. → screen docs.
