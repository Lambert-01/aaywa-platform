import 'dart:io';
import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:drift/drift.dart';
import 'database_service.dart';
import '../config/env.dart';
import '../utils/error_handler.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// Sync priority levels for intelligent synchronization
enum SyncPriority { critical, high, medium, low }

/// Represents a sync task with priority
class SyncTask {
  final String name;
  final SyncPriority priority;
  final Future<void> Function() execute;

  SyncTask({
    required this.name,
    required this.priority,
    required this.execute,
  });
}

/// Enhanced sync service with intelligent prioritization and conflict resolution
class SyncService {
  final DatabaseService _databaseService;
  final List<SyncTask> _syncQueue = [];
  bool _isSyncing = false;

  SyncService(this._databaseService);

  Future<Map<String, String>> _getHeaders() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('auth_token');
    return {
      'Content-Type': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }

  /// Main sync method with prioritization
  Future<void> syncData() async {
    if (_isSyncing) {
      debugPrint('Sync already in progress, skipping...');
      return;
    }

    _isSyncing = true;
    try {
      // Build sync queue with priorities
      await _buildSyncQueue();

      // Process queue by priority
      await _processSyncQueue();

      // Update last sync timestamp
      await _databaseService.updateLastSyncTimestamp();

      debugPrint('✅ Sync completed successfully');
    } catch (e, stackTrace) {
      ErrorHandler.logError('Sync', e, stackTrace);
      rethrow;
    } finally {
      _isSyncing = false;
      _syncQueue.clear();
    }
  }

  /// Build prioritized sync queue
  Future<void> _buildSyncQueue() async {
    _syncQueue.clear();

    // CRITICAL: Authentication and user data
    // (Nothing to sync here, but would be highest priority)

    // HIGH PRIORITY: Farmer Issues (Urgent feedback)
    final unsyncedIssues = await _databaseService.getUnsyncedFarmerIssues();
    if (unsyncedIssues.isNotEmpty) {
      _syncQueue.add(SyncTask(
        name: 'Issues (${unsyncedIssues.length})',
        priority: SyncPriority.critical, // Urgent!
        execute: () => _sendIssuesToServer(unsyncedIssues),
      ));
    }

    // HIGH PRIORITY: Core business data
    final unsyncedFarmers = await _databaseService.getUnsyncedFarmers();
    if (unsyncedFarmers.isNotEmpty) {
      _syncQueue.add(SyncTask(
        name: 'Farmers (${unsyncedFarmers.length})',
        priority: SyncPriority.high,
        execute: () => _sendFarmersToServer(unsyncedFarmers),
      ));
    }

    final unsyncedSales = await _databaseService.getUnsyncedSales();
    if (unsyncedSales.isNotEmpty) {
      _syncQueue.add(SyncTask(
        name: 'Sales (${unsyncedSales.length})',
        priority: SyncPriority.high,
        execute: () => _sendSalesToServer(unsyncedSales),
      ));
    }

    final unsyncedAttendance = await _databaseService.getUnsyncedAttendance();
    if (unsyncedAttendance.isNotEmpty) {
      _syncQueue.add(SyncTask(
        name: 'Attendance (${unsyncedAttendance.length})',
        priority: SyncPriority.high,
        execute: () => _sendAttendanceToServer(unsyncedAttendance),
      ));
    }

    // MEDIUM PRIORITY: Financial and activity data
    final unsyncedVSLATransactions =
        await _databaseService.getUnsyncedVSLATransactions();
    if (unsyncedVSLATransactions.isNotEmpty) {
      _syncQueue.add(SyncTask(
        name: 'VSLA Transactions (${unsyncedVSLATransactions.length})',
        priority: SyncPriority.medium,
        execute: () => _sendVSLATransactionsToServer(unsyncedVSLATransactions),
      ));
    }

    final unsyncedInvoices = await _databaseService.getUnsyncedInputInvoices();
    if (unsyncedInvoices.isNotEmpty) {
      _syncQueue.add(SyncTask(
        name: 'Input Invoices (${unsyncedInvoices.length})',
        priority: SyncPriority.medium,
        execute: () => _sendInputInvoicesToServer(unsyncedInvoices),
      ));
    }

    // LOW PRIORITY: Geospatial data
    final unsyncedBoundaries =
        await _databaseService.getUnsyncedPlotBoundaries();
    if (unsyncedBoundaries.isNotEmpty) {
      _syncQueue.add(SyncTask(
        name: 'Plot Boundaries (${unsyncedBoundaries.length})',
        priority: SyncPriority.low,
        execute: () => _sendPlotBoundariesGrouped(unsyncedBoundaries),
      ));
    }

    // Also add download tasks (always run after uploads)
    _syncQueue.add(SyncTask(
      name: 'Download Server Changes',
      priority: SyncPriority.high,
      execute: () => _syncServerChangesToLocal(),
    ));
  }

  /// Process sync queue by priority
  Future<void> _processSyncQueue() async {
    // Sort by priority (critical first)
    _syncQueue.sort((a, b) => a.priority.index.compareTo(b.priority.index));

    for (final task in _syncQueue) {
      debugPrint('🔄 Syncing: ${task.name} (${task.priority.name})');

      // Use error handler for resilient sync
      await ErrorHandler.handleSyncOperation(
        () => task.execute(),
        task.name,
      );
    }
  }

  Future<void> _syncServerChangesToLocal() async {
    final lastSync = await _databaseService.getLastSyncTimestamp();

    // Fetch new data from server since last sync
    final results = await Future.wait([
      ErrorHandler.handleSyncOperation(
        () => _fetchFarmersFromServer(lastSync),
        'Fetch Farmers',
      ),
      ErrorHandler.handleSyncOperation(
        () => _fetchSalesFromServer(lastSync),
        'Fetch Sales',
      ),
      ErrorHandler.handleSyncOperation(
        () => _fetchVSLATransactionsFromServer(lastSync),
        'Fetch VSLA',
      ),
      ErrorHandler.handleSyncOperation(
        () => _fetchInputInvoicesFromServer(lastSync),
        'Fetch Invoices',
      ),
    ]);

    // Save to local database (with null checks)
    if (results[0] != null) await _databaseService.saveFarmers(results[0]!);
    if (results[1] != null) await _databaseService.saveSales(results[1]!);
    if (results[2] != null) {
      await _databaseService.saveVSLATransactions(results[2]!);
    }
    if (results[3] != null) {
      await _databaseService.saveInputInvoices(results[3]!);
    }
  }

  // ========== SEND TO SERVER (with batching) ==========

  Future<void> _sendFarmersToServer(List<Farmer> farmers) async {
    const batchSize = 50;
    for (int i = 0; i < farmers.length; i += batchSize) {
      final batch = farmers.skip(i).take(batchSize).toList();
      await _sendFarmersBatch(batch);
    }
  }

  Future<void> _sendFarmersBatch(List<Farmer> farmers) async {
    final farmersMap = farmers
        .map((f) => {
              'full_name': '${f.firstName} ${f.lastName}',
              'phone': f.phone,
              'plot_size_hectares': f.landSizeHa,
              'cohort_id': f.cohortId,
              'vsla_id': f.vslaId,
            })
        .toList();

    final response = await http
        .post(
          Uri.parse('${Environment.apiBaseUrl}/farmers/batch'),
          headers: await _getHeaders(),
          body: jsonEncode({'farmers': farmersMap}),
        )
        .timeout(const Duration(seconds: 30));

    if (response.statusCode == 200 || response.statusCode == 207) {
      await _databaseService
          .markFarmersAsSynced(farmers.map((f) => f.id).toList());
    } else {
      throw Exception('Failed to sync farmers: ${response.body}');
    }
  }

  Future<void> _sendSalesToServer(List<Sale> sales) async {
    const batchSize = 50;
    for (int i = 0; i < sales.length; i += batchSize) {
      final batch = sales.skip(i).take(batchSize).toList();
      await _sendSalesBatch(batch);
    }
  }

  Future<void> _sendSalesBatch(List<Sale> sales) async {
    final salesMap = sales
        .map((s) => {
              'farmer_id': s.farmerId,
              'crop_type': s.cropType,
              'quantity_kg': s.quantityKg,
              'price_per_kg': s.pricePerKg,
              'total_amount': s.grossAmount,
              'date': s.transactionDate.toIso8601String()
            })
        .toList();

    final response = await http
        .post(
          Uri.parse('${Environment.apiBaseUrl}/sales/batch'),
          headers: await _getHeaders(),
          body: jsonEncode({'sales': salesMap}),
        )
        .timeout(const Duration(seconds: 30));

    if (response.statusCode == 200 || response.statusCode == 207) {
      await _databaseService.markSalesAsSynced(sales.map((s) => s.id).toList());
    } else {
      throw Exception('Failed to sync sales: ${response.body}');
    }
  }

  Future<void> _sendVSLATransactionsToServer(
      List<VSLATransaction> transactions) async {
    const batchSize = 50;
    for (int i = 0; i < transactions.length; i += batchSize) {
      final batch = transactions.skip(i).take(batchSize).toList();
      await _sendVSLATransactionsBatch(batch);
    }
  }

  Future<void> _sendVSLATransactionsBatch(
      List<VSLATransaction> transactions) async {
    final transactionsMap = transactions
        .map((t) => {
              'member_id': t.farmerId,
              'amount': t.amount,
              'type': t.type,
              'date': t.transactionDate.toIso8601String(),
              'notes': t.notes
            })
        .toList();

    final response = await http
        .post(
          Uri.parse('${Environment.apiBaseUrl}/vsla/transactions/batch'),
          headers: await _getHeaders(),
          body: jsonEncode({'transactions': transactionsMap}),
        )
        .timeout(const Duration(seconds: 30));

    if (response.statusCode == 200 || response.statusCode == 207) {
      await _databaseService
          .markVSLATransactionsAsSynced(transactions.map((t) => t.id).toList());
    } else {
      throw Exception('Failed to sync VSLA transactions: ${response.body}');
    }
  }

  Future<void> _sendInputInvoicesToServer(List<InputInvoice> invoices) async {
    const batchSize = 50;
    for (int i = 0; i < invoices.length; i += batchSize) {
      final batch = invoices.skip(i).take(batchSize).toList();
      await _sendInputInvoicesBatch(batch);
    }
  }

  Future<void> _sendInputInvoicesBatch(List<InputInvoice> invoices) async {
    final invoicesMap = invoices
        .map((i) => {
              'farmer_id': i.farmerId,
              'supplier': i.supplier,
              'input_type': i.inputType,
              'quantity': i.quantity,
              'unit_price': i.unitPrice,
              'total_cost': i.totalCost,
              'installments': i.installments,
              'date': i.purchaseDate.toIso8601String(),
              'notes': i.notes
            })
        .toList();

    final response = await http
        .post(
          Uri.parse('${Environment.apiBaseUrl}/inputs/invoices/batch'),
          headers: await _getHeaders(),
          body: jsonEncode({'invoices': invoicesMap}),
        )
        .timeout(const Duration(seconds: 30));

    if (response.statusCode == 200 || response.statusCode == 207) {
      await _databaseService
          .markInputInvoicesAsSynced(invoices.map((i) => i.id).toList());
    } else {
      throw Exception('Failed to sync input invoices: ${response.body}');
    }
  }

  Future<void> _sendAttendanceToServer(
      List<AttendanceData> attendanceList) async {
    final grouped = <String, List<AttendanceData>>{};
    for (var a in attendanceList) {
      if (a.type == 'VSLA_MEETING' && a.relatedId != null) {
        if (!grouped.containsKey(a.relatedId)) {
          grouped[a.relatedId!] = [];
        }
        grouped[a.relatedId!]!.add(a);
      }
    }

    final headers = await _getHeaders();
    for (var vslaId in grouped.keys) {
      final list = grouped[vslaId]!;
      for (var item in list) {
        final response = await http
            .post(
              Uri.parse('${Environment.apiBaseUrl}/vsla/$vslaId/attendance'),
              headers: headers,
              body: jsonEncode({
                'farmer_id': item.farmerId,
                'status': 'present',
                'date': item.timestamp.toIso8601String(),
              }),
            )
            .timeout(const Duration(seconds: 15));

        if (response.statusCode == 201) {
          await _databaseService.markAttendanceAsSynced([item.id]);
        } else {
          debugPrint(
              'Failed to sync attendance for ${item.id}: ${response.body}');
        }
      }
    }
  }

  Future<void> _sendPlotBoundariesGrouped(List<QueryRow> points) async {
    // Group by farmer_id
    final groupedBoundaries = <String, List<QueryRow>>{};
    for (var row in points) {
      final farmerId = row.read<String>('farmer_id');
      if (!groupedBoundaries.containsKey(farmerId)) {
        groupedBoundaries[farmerId] = [];
      }
      groupedBoundaries[farmerId]!.add(row);
    }

    for (var farmerId in groupedBoundaries.keys) {
      await _sendPlotBoundariesToServer(farmerId, groupedBoundaries[farmerId]!);
    }
  }

  Future<void> _sendPlotBoundariesToServer(
      String farmerId, List<QueryRow> points) async {
    final pointsMap = points
        .map((p) => {
              'lat': p.read<double>('latitude'),
              'lng': p.read<double>('longitude'),
              'order': p.read<int>('order_index')
            })
        .toList();

    final response = await http
        .post(
          Uri.parse('${Environment.apiBaseUrl}/farmers/$farmerId/boundary'),
          headers: await _getHeaders(),
          body: jsonEncode({'boundary': pointsMap}),
        )
        .timeout(const Duration(seconds: 15));

    if (response.statusCode == 200) {
      await _databaseService.markPlotBoundariesAsSynced(farmerId);
    } else {
      debugPrint('Failed to sync boundary for $farmerId: ${response.body}');
    }
  }

  // ========== FETCH FROM SERVER ==========

  Future<List<Map<String, dynamic>>> _fetchFarmersFromServer(
      DateTime? lastSync) async {
    final url = lastSync != null
        ? '${Environment.apiBaseUrl}/farmers?since=${lastSync.toIso8601String()}'
        : '${Environment.apiBaseUrl}/farmers';

    final response = await http
        .get(
          Uri.parse(url),
          headers: await _getHeaders(),
        )
        .timeout(const Duration(seconds: 30));

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return List<Map<String, dynamic>>.from(data['farmers'] ?? data);
    } else {
      throw Exception('Failed to fetch farmers: ${response.body}');
    }
  }

  Future<List<Map<String, dynamic>>> _fetchSalesFromServer(
      DateTime? lastSync) async {
    final url = lastSync != null
        ? '${Environment.apiBaseUrl}/sales?since=${lastSync.toIso8601String()}'
        : '${Environment.apiBaseUrl}/sales';

    final response = await http
        .get(
          Uri.parse(url),
          headers: await _getHeaders(),
        )
        .timeout(const Duration(seconds: 30));

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return List<Map<String, dynamic>>.from(data['sales'] ?? data);
    } else {
      throw Exception('Failed to fetch sales: ${response.body}');
    }
  }

  Future<List<Map<String, dynamic>>> _fetchVSLATransactionsFromServer(
      DateTime? lastSync) async {
    final url = lastSync != null
        ? '${Environment.apiBaseUrl}/vsla/transactions?since=${lastSync.toIso8601String()}'
        : '${Environment.apiBaseUrl}/vsla/transactions';

    final response = await http
        .get(
          Uri.parse(url),
          headers: await _getHeaders(),
        )
        .timeout(const Duration(seconds: 30));

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return List<Map<String, dynamic>>.from(data['transactions'] ?? data);
    } else {
      throw Exception('Failed to fetch VSLA transactions: ${response.body}');
    }
  }

  Future<List<Map<String, dynamic>>> _fetchInputInvoicesFromServer(
      DateTime? lastSync) async {
    final url = lastSync != null
        ? '${Environment.apiBaseUrl}/inputs/invoices?since=${lastSync.toIso8601String()}'
        : '${Environment.apiBaseUrl}/inputs/invoices';

    final response = await http
        .get(
          Uri.parse(url),
          headers: await _getHeaders(),
        )
        .timeout(const Duration(seconds: 30));

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return List<Map<String, dynamic>>.from(data['invoices'] ?? data);
    } else {
      throw Exception('Failed to fetch input invoices: ${response.body}');
    }
  }

  /// Conflict resolution: Last-Write-Wins with timestamp comparison
  Future<void> resolveConflicts() async {
    // Placeholder for conflict resolution logic
    // In production, compare updated_at timestamps and keep most recent
    debugPrint('Conflict resolution not yet implemented');
  }

  /// Get sync statistics
  Map<String, dynamic> getSyncStats() {
    return {
      'is_syncing': _isSyncing,
      'queue_size': _syncQueue.length,
      'queued_tasks': _syncQueue.map((t) => t.name).toList(),
    };
  }

  Future<void> _sendIssuesToServer(List<FarmerIssue> issues) async {
    for (var issue in issues) {
      await ErrorHandler.handleSyncOperation(
        () => _sendSingleIssue(issue),
        'Issue Sync ${issue.id}',
      );
    }
  }

  Future<void> _sendSingleIssue(FarmerIssue issue) async {
    final uri = Uri.parse('${Environment.apiBaseUrl}/farmer-issues');
    final request = http.MultipartRequest('POST', uri);

    final headers = await _getHeaders();
    request.headers.addAll(headers);
    // Content-Type is set automatically by MultipartRequest

    request.fields['farmer_id'] = issue.farmerId;
    request.fields['category'] = issue.categoryId;
    request.fields['description'] = issue.description;
    request.fields['urgency'] = issue.urgency;
    request.fields['gps_lat'] = issue.gpsLat?.toString() ?? '';
    request.fields['gps_lng'] = issue.gpsLng?.toString() ?? '';
    request.fields['date_reported'] = issue.dateReported.toIso8601String();

    if (issue.photoPath != null && issue.photoPath!.isNotEmpty) {
      final file = File(issue.photoPath!);
      if (await file.exists()) {
        request.files.add(await http.MultipartFile.fromPath(
          'photo',
          issue.photoPath!,
        ));
      }
    }

    final response = await request.send();
    final responseBody = await response.stream.bytesToString();

    if (response.statusCode == 200 || response.statusCode == 201) {
      await _databaseService.markFarmerIssuesAsSynced([issue.id]);
    } else {
      throw Exception('Failed to sync issue ${issue.id}: $responseBody');
    }
  }
}
