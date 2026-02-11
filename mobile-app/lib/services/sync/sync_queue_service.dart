import 'dart:async';
import 'dart:convert';
import 'package:drift/drift.dart';
import 'package:flutter/foundation.dart';
import '../database_service.dart';
import '../api/api_client.dart';
import '../../models/sync_status.dart';

class SyncQueueService {
  final DatabaseService _db;
  final ApiClient _api = ApiClient();
  bool _isProcessing = false;

  SyncQueueService(this._db);

  /// Queue an action to be performed on the backend
  Future<void> queueOperation(String entityTable, String action, int localId,
      Map<String, dynamic> payload) async {
    await _db.into(_db.syncQueue).insert(
          SyncQueueCompanion(
            entityTable: Value(entityTable),
            action: Value(action),
            localRecordId: Value(localId),
            payload: Value(jsonEncode(payload)),
            status: const Value('PENDING'),
            createdAt: Value(DateTime.now()),
          ),
        );

    // Trigger processing immediately if online
    processQueue();
  }

  /// Process pending items in the queue
  Future<void> processQueue() async {
    if (_isProcessing) return;
    _isProcessing = true;

    try {
      final pendingItems = await (_db.select(_db.syncQueue)
            ..where((t) => t.status.equals('PENDING'))
            ..orderBy([(t) => OrderingTerm(expression: t.createdAt)]))
          .get();

      if (pendingItems.isEmpty) {
        _isProcessing = false;
        return;
      }

      for (final item in pendingItems) {
        try {
          await _processItem(item);
          await _db.delete(_db.syncQueue).delete(item); // Success
        } catch (e) {
          debugPrint('Sync failed for item ${item.id}: $e');
          await (_db.update(_db.syncQueue)..where((t) => t.id.equals(item.id)))
              .write(
            SyncQueueCompanion(
              status: const Value('FAILED'),
              lastError: Value(e.toString()),
              retryCount: Value(item.retryCount + 1),
            ),
          );
        }
      }
    } finally {
      _isProcessing = false;
    }
  }

  Future<void> _processItem(SyncQueueData item) async {
    final payload = jsonDecode(item.payload);

    // Switch based on entity table
    switch (item.entityTable) {
      case 'farmers':
        await _syncFarmer(item.action, payload, item.localRecordId);
        break;
      case 'sales':
        await _syncSale(item.action, payload, item.localRecordId);
        break;
      // Add other cases
    }
  }

  Future<void> _syncFarmer(
      String action, Map<String, dynamic> data, int localId) async {
    if (action == 'CREATE') {
      final response = await _api.client.post('/farmers', data: data);
      final remoteId = response.data['id']; // UUID from backend

      // Update local record with remoteId and syncStatus
      await (_db.update(_db.farmers)..where((t) => t.id.equals(localId))).write(
        FarmersCompanion(
          remoteId: Value(remoteId),
          syncStatus: const Value(SyncStatus.synced),
          serverUpdatedAt: Value(DateTime.now()),
        ),
      );
    }
  }

  Future<void> _syncSale(
      String action, Map<String, dynamic> data, int localId) async {
    if (action == 'CREATE') {
      // Sales depend on Farmer Remote ID. Ensure it exists.
      // In a robust system, we check if the farmer is synced first.
      final response = await _api.client.post('/sales', data: data);
      final remoteId = response.data['id']; // UUID

      await (_db.update(_db.sales)..where((t) => t.id.equals(localId))).write(
        SalesCompanion(
          remoteId: Value(remoteId),
          syncStatus: const Value(SyncStatus.synced),
          serverUpdatedAt: Value(DateTime.now()),
        ),
      );
    }
  }
}
