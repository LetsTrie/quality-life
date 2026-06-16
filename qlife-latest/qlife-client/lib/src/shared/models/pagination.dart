class Pagination {
  final int page;
  final int pageSize;
  final int total;
  final bool hasMore;

  const Pagination({
    required this.page,
    required this.pageSize,
    required this.total,
    required this.hasMore,
  });

  factory Pagination.fromJson(Map<String, dynamic> json) {
    return Pagination(
      page: (json['page'] as num).toInt(),
      pageSize: (json['pageSize'] as num).toInt(),
      total: (json['total'] as num).toInt(),
      hasMore: json['hasMore'] as bool,
    );
  }
}
