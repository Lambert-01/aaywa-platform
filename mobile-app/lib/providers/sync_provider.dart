import 'package:flutter/foundation.dart';
import '../services/database_service.dart';
import '../services/sync_service.dart';

class SyncProvider with ChangeNotifier {
  // ignore: unused_field
  final DatabaseService _databaseService;
  bool _isSyncing = false;
  String? _lastSyncTime;

  SyncProvider(this._databaseService);

  bool get isSyncing => _isSyncing;
  String? get lastSyncTime => _lastSyncTime;

  Future<void> syncData() async {
    if (_isSyncing) return;

    _isSyncing = true;
    notifyListeners();

    try {
      final syncService = SyncService(_databaseService);
      await syncService.syncData();

      _lastSyncTime = DateTime.now().toIso8601String();
    } catch (e) {
      if (kDebugMode) {
        debugPrint('Sync failed: $e');
      }
    } finally {
      _isSyncing = false;
      notifyListeners();
    }
  }
}
