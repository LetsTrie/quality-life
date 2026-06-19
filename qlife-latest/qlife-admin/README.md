# QLife Admin

Next.js (App Router) admin console for QLife. Lets administrators review and
approve/reject professional applications, create professionals from minimal
info, and browse users with a full activity profile (self-checks, appointments,
resources watched).

## Auth

Admins sign in with a Cognito account (same user pool as the mobile app) whose
`role` is `ADMIN` in the database (`UPDATE "Account" SET role='ADMIN' WHERE
email=...`). Login uses Cognito SRP via `amazon-cognito-identity-js`; the ID
token is stored in `localStorage` and sent as a Bearer token. Every `/v1/admin`
endpoint is guarded by `@Roles('ADMIN')` on the server, so a non-admin can sign
in but receives 403s.

## Setup

```bash
cp .env.example .env.local   # adjust API URL / Cognito ids if needed
npm install
npm run dev                  # http://localhost:5011
```

Requires the qlife-server backend running (default `http://127.0.0.1:5012`).

## Backend endpoints used

- `GET  /v1/admin/professionals?status=&page=` — list professionals
- `POST /v1/admin/professionals` — create a professional (minimal info)
- `POST /v1/professionals/verifications/:id/review` — approve / reject
- `GET  /v1/admin/users?q=&page=` — list users
- `GET  /v1/admin/users/:id` — full user activity profile
