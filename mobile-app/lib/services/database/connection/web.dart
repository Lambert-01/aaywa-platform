import 'package:drift/drift.dart';
// ignore: deprecated_member_use
import 'package:drift/web.dart';

LazyDatabase openConnection() {
  return LazyDatabase(() async {
    return WebDatabase.withStorage(DriftWebStorage.indexedDb('db'));
  });
}
