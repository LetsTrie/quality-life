import 'pagination.dart';

class PagedResult<T> {
  final List<T> items;
  final Pagination pagination;
  const PagedResult({required this.items, required this.pagination});
}
