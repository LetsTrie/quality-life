# 01 — Architecture, Stack, Build & Environment

## 1. System topology

```
┌─────────────────────────────┐         HTTPS / JSON          ┌──────────────────────────────┐
│  Mobile app (Expo / RN)     │  ───────────────────────────▶ │  Express API (Node + Mongoose)│
│  - Redux + redux-persist    │  ◀─────────────────────────── │  - JWT auth (access+refresh)  │
│  - React Navigation         │     Bearer access token       │  - Joi validation             │
│  - Axios                    │                               │  - rate limit, helmet, cors   │
└─────────────────────────────┘                               └───────────────┬──────────────┘
                                                                               │
                  ┌───────────────────────────────┬────────────────────────────┼───────────────┐
                  ▼                                ▼                            ▼               ▼
        ┌──────────────────┐            ┌───────────────────┐      ┌────────────────┐  ┌──────────────┐
        │ MongoDB (Atlas)  │            │ SMTP (Brevo) email │      │ Admin EJS page │  │ YouTube (CDN)│
        │ via Mongoose     │            │ (SES wired, unused)│      │ /admin/profs   │  │ video embeds │
        └──────────────────┘            └───────────────────┘      └────────────────┘  └──────────────┘
```

- The mobile client talks **only** to the Express API over JSON.
- The API persists everything to **MongoDB** via Mongoose.
- The API sends **transactional email** through SMTP (Brevo) — appointment/scale/OTP/approval mails.
- The API also serves a **server-rendered admin page** (EJS) and static assets (`/public`).
- The client embeds **YouTube** videos directly (no media stored by us).
- **Sentry** is configured in the Expo app for crash reporting.

## 2. Tech stack (current)

### Frontend (`/frontend`)
- **Expo SDK 50**, **React Native 0.73.6**, React 18.2.
- **Navigation:** `@react-navigation/native` v6 with a **drawer** wrapping a **stack** navigator.
- **State:** `redux` v5 + `redux-thunk` + `react-redux` v9, persisted with `redux-persist` v6 backed by `@react-native-async-storage/async-storage`.
- **HTTP:** `axios`.
- **UI/util libs:** `react-native-paper`, `expo-linear-gradient`, `react-native-svg`, `react-native-chart-kit` (result charts), `react-native-swiper`, `@react-native-community/datetimepicker`, `react-native-webview` + `react-native-youtube-iframe` (videos), `react-native-ratings`, `moment`, `date-fns`, `validator`.
- **Crash reporting:** `@sentry/react-native`.
- **Node engine:** v18.18.0 (per `notes.txt` / `package.json`).
- **Builds:** EAS (`eas.json`); Android APK via `eas build -p android --profile preview`. Bundle id / package: `com.letstrie.qlife`. App name "QLife", slug "qlife".

### Backend (`/backend`)
- **Node v20.11.0**, **Express 4**, **Mongoose 8** (MongoDB).
- **Auth:** `jsonwebtoken`, `bcrypt`.
- **Validation:** `joi` (via a `validate` middleware + `pick` util).
- **Security/infra:** `helmet`, `cors`, `compression`, `express-rate-limit`.
- **Logging:** `winston` (+ custom levels) and `morgan`, plus `express-winston` request logging in non-prod.
- **Email:** `nodemailer` (active, SMTP Brevo) and `@aws-sdk/client-ses` + `resend` (present but not used by the active path).
- **Templating:** `ejs` for the admin page.
- **Dev:** `nodemon`, `madge` (circular-dependency check on dev boot).

## 3. Backend project layout

```
backend/
  index.js               # boots dotenv, starts server on PORT (default 3000)
  server.js              # express app: middleware chain, routes, error handlers
  index.routes.js        # mounts /auth /user /prof /admin /notifications
  config/
    database.js          # mongoose.connect(MONGO_URL, maxPoolSize:10); connects on import
    winston.js           # logger (console + file transports, exception handlers)
    index.js             # exports { logger }
  models/                # Mongoose schemas (see 02-data-model.md)
    model_name.js        # central map of collection names (all qlife_*)
    user.js prof.js appointment.js myClient.js profAssessment.js
    rating.js Notification.js test.js index.js
  controllers/           # request handlers (see 03-api-reference.md)
    auth.js user.js user-professional.js prof.js notification.js helpers.js
  routes/                # express routers
    auth.js user.js prof.js admin.js notifications.js
  middlewares/
    authentication.js    # verifyToken(role): JWT verify + profile-completeness gating
    validate.js          # Joi validation wrapper
    asyncHandler.js      # promise .catch(next)
    errorHandler.js      # central error → JSON
    rateLimiter.js       # 200 req / 15 min
    requestLogger.js     # express-winston (non-prod)
  services/
    email.js             # nodemailer transport + sendEmail()
    sesClient.js         # AWS SES client (unused by active path)
    notification.js      # NotificationService: create/seen/count + email orchestration
    email-templates/     # 7 HTML email templates + index
    index.js             # exports { NotificationService }
  utils/                 # constants, jsonResponse, otpGenerator, string, datetime, pick, ApiError, errorResponse, environment
  validations/           # joi schemas: auth/user/prof + custom (password, objectId)
  views/professionals.ejs        # admin approval table
  public/
    index.html                   # served at GET /
    images/                      # landing images
    scripts/approve-professionals.js  # admin approve button handler
  deployment/            # deploy.sh, installation.txt
  .env.development       # env var template
```

### Express middleware order (`server.js`) — preserve this order

1. `express.static(public)` (twice; second time with `maxAge: 1d`).
2. `cors()` (open — all origins).
3. `express.json()`.
4. `helmet()` + `helmet.xssFilter()` + `helmet.frameguard()` + `helmet.noSniff()`.
5. `compression()`.
6. `requestLogger()` (non-prod only).
7. `morgan('dev')` (dev) or `morgan('combined')` writing 4xx/5xx to `logs/error.log` (prod). A second morgan logs 4xx+/5xx to stderr (skips `<400` and `405`).
8. `rateLimiter` (200 requests / 15 minutes / window; returns `{success:false, message:'Too many requests…'}`).
9. `view engine = ejs`.
10. `GET /` → serves `public/index.html`.
11. `app.use(require('./index.routes'))` — all API routers.
12. Catch-all → `405 MethodNotAllowed` `{message:'API Method not found'}`.
13. `errorHandler` (central error formatter).
14. Process-level handlers: `unhandledRejection` logged; `uncaughtException` logged then `process.exit(1)`.

On **dev boot**, `madge` scans for circular dependencies and logs them.

## 4. Frontend project layout

```
frontend/
  App.js                       # Provider → PersistGate → NavigationContainer → Helper/BackPress providers → Drawer→Stack
  App/
    navigation/
      StackNavigator.js        # all stack screens + header options + redirect helpers
      constants.js             # route-name string constants (single source of truth)
      backScreenMap.js         # screen → back-target map
      components/DrawerContent.js  # the drawer menu
    redux/
      store.js  reducers/  actions/  utils.js
    services/
      api.js                   # ApiDefinitions (endpoint+method+payload builders) + refreshTokener
      endpoints.js             # absolute URLs from BaseUrl
      utils.js                 # sendSuccessResponse / sendErrorResponse normalizers
    contexts/
      helper/index.js          # HelperProvider: ApiExecutor, logout, refreshNotificationCount, redirectToHomepage
      BackPress.js             # hardware back-button handling per screen
    config/                    # BaseUrl, colors, chooseTest, const, config
    data/                      # all scale/test/video/help/region data (static content)
    screens/                   # all screens (see screens/*.md)
    components/                # shared UI components
    utils/                     # roles, date, string, array, number, ui, values, type
    hooks/                     # re-exports useBackPress / useHelper
```

### App bootstrap (`App.js`) — composition order
`<Screen>` → `<ErrorBoundary>` → `<Provider store>` → `<PersistGate persistor>` → `<NavigationContainer>` → `<HelperProvider>` → `<BackPressProvider>` → `<Drawer.Navigator>` (header hidden, swipe disabled) → single drawer screen "Drawer" = `MainStackNavigator`.

## 5. Environment variables

### Backend (`.env`)
| Var | Purpose |
|-----|---------|
| `PORT` | API port (default 3000) |
| `MONGO_URL` | MongoDB connection string |
| `JWT_SECRET` | (declared; the active code uses the access/refresh secrets below) |
| `JWT_ACCESS_TOKEN` | Secret for signing access tokens |
| `JWT_REFRESH_TOKEN` | Secret for signing refresh tokens |
| `JWT_EXPIRATION` | Access-token TTL (e.g. `15m`) |
| `JWT_REFRESH_EXPIRATION` | Refresh-token TTL (e.g. `30d`) |
| `NODE_ENV` | `development` / `production` |
| `EMAIL_SENDER` | From-address shown in emails (`"Tasnuva from Qlife" <EMAIL_SENDER>`) |
| `ADMIN_EMAIL` | Recipient of the new-professional approval email |
| `SUPPORT_EMAIL` | Support contact (referenced in env; surface in UI/footers) |
| `APP_URL` | Base URL used to build the admin approval link in emails (`${APP_URL}/admin/professionals`) |
| `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_SES_REGION` | AWS SES (wired but not used by the active SMTP path) |

⚠ **The active SMTP transport in `services/email.js` has the Brevo host, user and password hardcoded** — these must become environment variables / secrets in the rebuild.

### Frontend (`.env.development`)
| Var | Purpose |
|-----|---------|
| `EXPO_PUBLIC_API_URL` | Backend base URL used by `config/BaseUrl.js` (all endpoints derive from it). During dev this is tunnelled via ngrok (see `notes.txt`). |

Google OAuth client IDs are present (`config/config.js`, `config/3rdPartyLogin.js`) but **social login is not wired into the active flow** (email/password only). Treat as future/optional.

## 6. Build, run & deploy notes (from `notes.txt`, `eas.json`, `deployment/`)

- **Backend:** `npm run server` (nodemon) / `npm start` (node). Connects to Mongo on import of `config/database.js`.
- **Frontend dev:** Node 18.18.0 (`nvm use v18.18.0`), `npx expo start`. API reached via ngrok tunnel during dev.
- **Android build:** `eas build -p android --profile preview` (APK).
- **macOS dev gotchas (notes.txt):** `EMFILE: too many open files` fix; kill port 3000 with `sudo kill -9 $(sudo lsof -t -i:3000)`.

## 7. Rebuild guidance (stack-agnostic)

- The client/server contract is **plain JSON over HTTP with a Bearer access token + a refresh token**. Any stack can implement [03-api-reference.md](03-api-reference.md) verbatim.
- The data model ([02](02-data-model.md)) maps cleanly to either a document DB or a relational DB (relationships are simple FKs). If moving to SQL, model the embedded arrays (`availableTime`, `numberOfClients`, `questionAnswers`, `location`) as child tables or JSON columns.
- Keep the **role-based JWT payload** (`{id, role}`) and the **two-secret access/refresh** scheme, or replace with an equivalent session system — but preserve the **incomplete-profile gating** semantics (see [05](05-auth-roles-and-sessions.md)) because the client UX depends on those specific 401 `type` codes.
- All **Bangla content and scale definitions** are static data; carry them over exactly (see scale docs).
