# QLife (latest) — Local Dev

This is the new codebase under `qlife-latest/`:

- `qlife-client/` — Flutter mobile app.
- `qlife-server/` — NestJS + Prisma API.
- `qlife-infra/` — Terraform baseline.

## 1) Start Postgres (Docker)

```bash
cd qlife-latest/qlife-server
docker compose up -d
```

Postgres is exposed on **15432** on the host (chosen because 5432/5433/6543 were already in use).

## 2) Migrate + seed

```bash
cd qlife-latest/qlife-server
export DATABASE_URL='postgresql://qlife:qlife@127.0.0.1:15432/qlife?schema=public'

npx --yes prisma@6 migrate dev --name init --skip-generate
npm run prisma:generate
npm run seed:extract:legacy
npm run seed
```

## 3) Start the API server

```bash
cd qlife-latest/qlife-server
export DATABASE_URL='postgresql://qlife:qlife@127.0.0.1:15432/qlife?schema=public'
export PORT=3000

# Cognito env vars (required by the verifier). For local dev you can set placeholders,
# but real sign-in requires real values.
export COGNITO_REGION=ap-south-1
export COGNITO_USER_POOL_ID=ap-south-1_dummy
export COGNITO_APP_CLIENT_ID=dummy

npm run build
npm run start
```

## 4) Run Flutter

### Simulator/emulator (local machine)

```bash
cd qlife-latest/qlife-client
flutter pub get
flutter run
```

### Physical phone on your Wi‑Fi network

The phone cannot reach `127.0.0.1` on your Mac. Use your Mac's LAN IP:

```bash
# macOS: prints LAN IP (Wi‑Fi)
ipconfig getifaddr en0

cd qlife-latest/qlife-client
flutter run --dart-define=API_BASE_URL=http://<LAN_IP>:3000
```

## 5) Tests

### Server unit tests

```bash
cd qlife-latest/qlife-server
npm test
```

### Server DB-backed e2e tests (requires docker Postgres)

```bash
cd qlife-latest/qlife-server
export DATABASE_URL='postgresql://qlife:qlife@127.0.0.1:15432/qlife?schema=public'
npm run test:e2e
```

### Flutter tests

```bash
cd qlife-latest/qlife-client
flutter test
```

