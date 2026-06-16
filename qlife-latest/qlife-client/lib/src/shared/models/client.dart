class ClientUser {
  final String id;
  final String? displayName;
  final String? phone;

  const ClientUser({required this.id, this.displayName, this.phone});

  factory ClientUser.fromJson(Map<String, dynamic> json) {
    return ClientUser(
      id: json['id'] as String,
      displayName: json['displayName'] as String?,
      phone: json['phone'] as String?,
    );
  }
}

class Client {
  final String id;
  final String? referenceCode;
  final String status;
  final ClientUser user;

  const Client({
    required this.id,
    this.referenceCode,
    required this.status,
    required this.user,
  });

  factory Client.fromJson(Map<String, dynamic> json) {
    return Client(
      id: json['id'] as String,
      referenceCode: json['referenceCode'] as String?,
      status: json['status'] as String? ?? 'ACTIVE',
      user: ClientUser.fromJson(json['user'] as Map<String, dynamic>),
    );
  }
}
