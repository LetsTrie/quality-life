# QLife Mobile (Flutter)

This is the Flutter client for QLife.

## Compatibility goals

- **Android**: target broad device support (MVP default when generating native project: `minSdkVersion 21`).
- **iOS**: target broad device support (MVP default: `iOS 12.0+`).

## Auth

- Uses **Cognito Hosted UI** via OAuth Authorization Code + PKCE.
- Tokens are stored in **Keychain/Keystore** using `flutter_secure_storage`.
- The backend trusts a verified JWT per request (no server-side sessions).

## First run

1. Install Flutter SDK.
2. Run `flutter pub get`.
3. Configure Cognito placeholders in `lib/src/features/auth/data/auth_repository.dart`.

