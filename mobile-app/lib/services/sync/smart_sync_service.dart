import 'dart:async';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../database_service.dart';
import 'sync_queue_service.dart';
import '../api/api_client.dart';

class SmartSyncService {
  final DatabaseService _db;
  late final SyncQueueService _queueService;
  final ApiClient _api = ApiClient();

  StreamSubscription? _connectivitySubscription;
  bool _isSyncing = false;

  SmartSyncService(this._db) {
    _queueService = SyncQueueService(_db);
    _init();
  }

  void _init() {
    _connectivitySubscription = Connectivity()
        .onConnectivityChanged
        .listen((List<ConnectivityResult> results) {
      if (results.contains(ConnectivityResult.mobile) ||
          results.contains(ConnectivityResult.wifi)) {
        syncNow();
      }
    });
  }

  void dispose() {
    _connectivitySubscription?.cancel();
  }

  /// Triggers a full sync cycle (Push pending -> Pull updates)
  Future<void> syncNow() async {
    if (_isSyncing) return;
    _isSyncing = true;

    try {
      if (kDebugMode) print('[SmartSync] Starting sync cycle...');

      // 1. Push Local Changes
      await _queueService.processQueue();

      // 2. Pull Server Changes
      await _pullData();

      if (kDebugMode) print('[SmartSync] Sync cycle completed.');
    } catch (e) {
      if (kDebugMode) print('[SmartSync] Sync failed: $e');
    } finally {
      _isSyncing = false;
    }
  }

  Future<void> _pullData() async {
    final prefs = await SharedPreferences.getInstance();
    final lastSync = prefs.getString('last_sync_timestamp');

    try {
      final response = await _api.client.get(
        '/sync/delta',
        queryParameters: lastSync != null ? {'since': lastSync} : null,
      );

      final data = response.data; // Map<String, List>

      if (data != null) {
        await _processDelta(data);

        // Update timestamp
        await prefs.setString(
            'last_sync_timestamp', DateTime.now().toIso8601String());
      }
    } catch (e) {
      if (kDebugMode) print('[SmartSync] Pull failed: $e');
      rethrow;
    }
  }

  Future<void> _processDelta(Map<String, dynamic> data) async {
    // Process Farmers
    if (data['farmers'] != null) {
      if (data['farmers'] != null) {
        // for (final f in data['farmers']) {
        //   // Upsert logic here using Drift
        //   // This requires mapping JSON to Drift Companions
        //   // Placeholder for now
        // }
      }
    }

    // Process Sales, etc.
  }
}
