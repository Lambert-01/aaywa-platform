import 'package:drift/drift.dart';

enum SyncStatus {
  synced,
  pending,
  failed,
}

/// Converter for storing [SyncStatus] as an integer in the database.
class SyncStatusConverter extends TypeConverter<SyncStatus, int> {
  const SyncStatusConverter();

  @override
  SyncStatus fromSql(int fromDb) {
    return SyncStatus.values[fromDb];
  }

  @override
  int toSql(SyncStatus value) {
    return value.index;
  }
}
