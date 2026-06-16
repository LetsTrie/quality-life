class AuthTokens {
  final String accessToken;
  final String? refreshToken;
  final String? idToken;

  const AuthTokens({
    required this.accessToken,
    required this.refreshToken,
    required this.idToken,
  });
}

