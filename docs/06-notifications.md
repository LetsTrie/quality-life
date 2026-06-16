# 06 — Notifications

Notifications are in-app records (no push/FCM is wired — there is a `// TODO: FCM` note). Each
significant cross-party action also sends an **email** (see [07](07-emails-and-external-services.md)).
The orchestration lives in `services/notification.js` (`NotificationService`).

## 1. Model recap (`qlife_notification`)

`{ user, prof, for ('user'|'professional'), type, hasSeen, appointment, assessment, client, timestamps }`. Index `{user:1, type:1}`. See [02 §6](02-data-model.md).

`for` indicates **who should see it**. `user`/`prof` are the two parties. `type` ∈:
`APPOINTMENT_REQUESTED`, `APPOINTMENT_ACCEPTED`, `SUGGEST_A_SCALE`, `SCALE_FILLUP_BY_USER`.

## 2. The four notification types & their lifecycles

### APPOINTMENT_REQUESTED  (for: professional)
- **Created by:** `POST /user/take-appointment` → `sendAppointmentRequestToProfessional`. Stores `{user, prof, for:professional, type, appointment}` and emails the professional.
- **Marked seen:** `POST /prof/appointment-seen/:id` → `seenAppointmentRequestedByProfessional(appointmentId)` finds the `{type:APPOINTMENT_REQUESTED, appointment}` and sets `hasSeen:true`.
- **Deleted:** when the professional accepts (`appointmentAcceptedByProfessional` calls `Notification.findOneAndDelete({appointment, type:APPOINTMENT_REQUESTED})`).

### APPOINTMENT_ACCEPTED  (for: user)
- **Created by:** `POST /prof/appointment-response/:id` → `appointmentAcceptedByProfessional`. Stores `{user, prof, for:user, type, appointment}`, **deletes** the matching APPOINTMENT_REQUESTED notification, and emails the user.
- **Marked seen:** `GET /user/appointment-details/:id` → `seenAppointmentAcceptedNotificationByUser(appointmentId)`.

### SUGGEST_A_SCALE  (for: user)
- **Created by:** `POST /prof/suggest-scale` and also inside `POST /prof/appointment-response` when `initAssessmentSlug` is provided → `scaleSuggestedByProfessional`. Stores `{user, prof, for:user, type, assessment}` and emails the user.
- **Marked seen:** `GET /user/suggested-scale-fillup-check/:assessmentId` → `seenAssessmentNotification(assessmentId)`.
- **Deleted:** when the user submits the scale (`POST /user/submit-suggested-scale` → `removeAssessmentSuggestionNotification(assessmentId)`).

### SCALE_FILLUP_BY_USER  (for: professional)
- **Created by:** `POST /user/submit-suggested-scale` → `scaleSubmittedByUser`. Stores `{user, prof, for:professional, type, assessment}` and emails the professional.
- **Marked seen:** `GET /prof/assessment/:assessmentId` → `seenAssessmentSubmissionNotificationByProfessional(assessmentId)`.

## 3. Counts & listing API

| Endpoint | Returns |
|---|---|
| `GET /notifications/unread-count/:role` | `{ data:{ unreadNotificationCount } }` — count of `{<party>, hasSeen:false, for:role}` |
| `GET /notifications/all/:role?page=N` | `{ data:{ numberOfNotifications?(page1), notifications } }` — populated `prof user(name)`, `appointment(dateByProfessional)`, `assessment(assessmentSlug)`, newest first, LIMIT 10 |
| `GET /notifications/seen/:notificationId/:role` | marks one seen → `{ data:{} }` |

`:role` = `u`|`p`. Counts are queried by `for` matching the role and the corresponding party field (`user` for users, `prof` for professionals).

Professional homepage also gets counts via `GET /prof/homepage-notification-count` → `{ notificationCount (unread, for professional), appointmentCount (unviewed active requests) }`.

## 4. Client state

- `reducers/notifications.js`: `{ unreadCount }`. `SET_UNREAD_NOTIFICATION_COUNT` sets it; `RESET_NOTIFICATION_COUNT` clears (on logout).
- `useHelper().refreshNotificationCount()` calls the count endpoint for the current role and dispatches `setUnreadNotificationCount`.
- `reducers/prof.js`: `numOfNewClientRequests`, `numOfNewNotifications`; `NEW_NOTIFICATION_COUNT` (set request count) and `NEW_NOTIFICATION_COUNT_MINUS` (decrement on `APPOINTMENT_REQUESTED` seen).
- `reducers/prof_req.js`: cached request list; `seenRequestAction` marks a request `hasProfViewed` and decrements counts.

The notification list UI and tap-routing (which screen each notification opens) is documented in [screens/06](screens/06-professional-client-management.md) (professional) and the user notification handling in the user screen docs.

## 5. Known issues
- `controllers/user.js` has older `getNumberOfNotifications`/`unreadNotifications` that query `ProfAssessment.hasSeen` (nonexistent) and use wrong populate paths — **not wired to routes**, ignore/rewrite. The active counting path is `NotificationService`.
- No push notifications (FCM TODO). If adding push in the rebuild, fire it alongside each `Notification.create` + email.

## 6. Rebuild guidance
Model notifications as events with `{recipientRole, type, refs:{appointment|assessment|client}, seen}`. Keep the **create + email** pairing and the **seen-on-open** and **delete-on-resolve** semantics (REQUESTED deleted when accepted; SUGGEST_A_SCALE deleted when submitted). Consider a single polymorphic "link" instead of three nullable ref fields.
