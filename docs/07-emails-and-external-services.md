# 07 — Emails & External Services

## 1. Email transport (`services/email.js`)

Active transport = **nodemailer over Brevo SMTP**:

```
host: smtp-relay.brevo.com   port: 465   secure: true
auth: { user: '<brevo-smtp-user>', pass: '<brevo-smtp-pass>' }   ← ⚠ HARDCODED in source
from: '"Tasnuva from Qlife" <EMAIL_SENDER>'
```

`sendEmail(toAddress, subject, htmlBody)` → returns `{ success:true, messageId }` or `{ success:false, error }`. Callers branch on `result.success` (e.g. OTP send aborts with `400` if email fails).

⚠ **Move the SMTP host/user/pass to environment variables/secrets in the rebuild.** They are committed in plain text today.

### AWS SES (present but unused)
`services/sesClient.js` constructs an `SESClient` from `AWS_*` env vars, and `@aws-sdk/client-ses` + `resend` are dependencies — but the **active send path is nodemailer/Brevo**. Treat SES/Resend as an alternative provider to choose during the rebuild.

## 2. Transactional emails (templates in `services/email-templates/`)

All templates are HTML strings (inline CSS, blue `#007BFF` header, Qlife footer with current year). Index re-exports them. The seven emails:

| Template file | Function | Sent to | Trigger | Key content |
|---|---|---|---|---|
| `otp-verification.js` | `otpVerificationEmailTemplate(name, otp)` | user/prof | `GET /auth/verify-email` | greeting + the OTP code; subject "OTP for reset password" or "OTP for verification" by useCase |
| `prof-reg-step1-verification.js` | `profRegStep1EmailTemplate({name,email,profession,designation,workplace,batch,gender,bmdc,union,upazila,zila,approvalLink})` | **admin** (`ADMIN_EMAIL`) | `POST /prof/register/step-1` | new-professional details + approval link `${APP_URL}/admin/professionals`; subject "New Professional Registration: Approval Required!" |
| `account-approved.js` | `accountApprovedEmailTemplate(name)` | professional | `POST /prof/approve` | "Your Account is Activated!" |
| `generateAppointmentRequestEmail.js` | `generateAppointmentRequestEmail({profName,userName,userEmail,dateByClient,permissionToSeeProfile})` | professional | `POST /user/take-appointment` | appointment request; tailors copy by whether profile-view permission was granted; subject "New Appointment Request from {userName}" |
| `generateAppointmentResponseEmail.js` | `generateAppointmentResponseEmail({userName,profName,appointmentDate,message})` | user | `POST /prof/appointment-response` | confirmation with scheduled date + optional message; subject "Confirmation of Your Appointment with {profName}" |
| `generateScaleSuggestionEmail.js` | `generateScaleSuggestionEmail({userName,profName,assessmentName})` | user | `POST /prof/suggest-scale` (and accept-with-initial-scale) | "New Scale Suggested"; subject "A New Scale Has Been Suggested for You" |
| `generateScaleSubmissionEmail.js` | `generateScaleSubmissionEmail({userName,profName,assessmentName})` | professional | `POST /user/submit-suggested-scale` | "Scale Submission Notification"; subject "A Scale Has Been Submitted by {userName}" |

Names are capitalized (`capitalizeFirstLetter`) and slugs are humanised (`formatSlugToTitle`, splits on `_`, capitalises, keeps trailing acronyms in parens uppercase) before being placed in emails.

Dates in emails use `utils/datetime.formatDate` → `Intl.DateTimeFormat('en-US', {weekday:'long', year, month:'short', day, hour, minute, hour12})`.

## 3. Email ↔ event matrix

Every email is paired with a `Notification.create` (see [06](06-notifications.md)) except the OTP, admin-registration, and account-approved emails (which are not in-app notifications):

| Event | Notification | Email |
|---|---|---|
| User requests appointment | APPOINTMENT_REQUESTED → prof | request email → prof |
| Prof accepts appointment | APPOINTMENT_ACCEPTED → user (delete REQUESTED) | response email → user |
| Prof suggests scale | SUGGEST_A_SCALE → user | suggestion email → user |
| User submits scale | SCALE_FILLUP_BY_USER → prof (delete SUGGEST) | submission email → prof |
| User/prof requests OTP | — | OTP email |
| Prof completes step-1 | — | admin approval-request email |
| Admin approves prof | — | account-approved email → prof |

## 4. Other external services

- **YouTube** — coping/educational videos are embedded via `react-native-youtube-iframe` / `react-native-webview`. Video ids live in `App/data/videos.js` (20 items) and `videoScreenPages.js`. No media is hosted by the app. See [screens/03](screens/03-user-videos-profile-settings.md) for the full video table.
- **Sentry** — `@sentry/react-native` configured in `app.json` (`org: quality-life`, `project: react-native`) for crash reporting.
- **Google OAuth client IDs** — present in `config/config.js` and `config/3rdPartyLogin.js` but **social login is not active**; email/password only. Optional for rebuild.
- **ngrok** — used in dev to expose the local backend to the device (`notes.txt`).
- **Bangladesh region data** — static `App/data/RegionInformation.json` powers zila/upazila/union pickers (no external geo API).

## 5. Rebuild guidance
- Replace the hardcoded SMTP creds with a provider abstraction (`sendEmail(to, subject, html)`) backed by env-configured SMTP / SES / Resend — the call sites already assume that single function and a `{success}` result.
- Keep the **event→(notification+email)** pairing intact.
- Consider templating with a real engine (MJML/Handlebars/React Email) but preserve the exact subjects and the Bangla/English copy where users rely on it.
- Add **push notifications** (the codebase already flags `// TODO: FCM`) at the same points emails are sent, if desired.
