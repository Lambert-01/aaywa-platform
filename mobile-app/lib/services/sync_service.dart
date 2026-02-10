import 'dart:convert';
import 'package:http/http.dart' as http;
import 'database_service.dart';

class SyncService {
  final String baseUrl = 'https://api.aaywa.com'; // Replace with actual API URL
  final DatabaseService _databaseService;

  SyncService(this._databaseService);

  Future<void> syncData() async {
    try {
      // Sync local changes to server
      await _syncLocalChangesToServer();

      // Sync server changes to local
      await _syncServerChangesToLocal();

      // Update last sync timestamp
      await _databaseService.updateLastSyncTimestamp();
    } catch (e) {
      print('Sync failed: $e');
      rethrow;
    }
  }

  Future<void> _syncLocalChangesToServer() async {
    // Get unsynced data from local database
    final unsyncedFarmers = await _databaseService.getUnsyncedFarmers();
    final unsyncedSales = await _databaseService.getUnsyncedSales();
    final unsyncedVSLATransactions =
        await _databaseService.getUnsyncedVSLATransactions();

    // Send to server
    if (unsyncedFarmers.isNotEmpty) {
      await _sendFarmersToServer(unsyncedFarmers);
    }

    if (unsyncedSales.isNotEmpty) {
      await _sendSalesToServer(unsyncedSales);
    }

    if (unsyncedVSLATransactions.isNotEmpty) {
      await _sendVSLATransactionsToServer(unsyncedVSLATransactions);
    }
  }

  Future<void> _syncServerChangesToLocal() async {
    final lastSync = await _databaseService.getLastSyncTimestamp();

    // Fetch new data from server since last sync
    final newFarmers = await _fetchFarmersFromServer(lastSync);
    final newSales = await _fetchSalesFromServer(lastSync);
    final newVSLATransactions =
        await _fetchVSLATransactionsFromServer(lastSync);

    // Save to local database
    await _databaseService.saveFarmers(newFarmers);
    await _databaseService.saveSales(newSales);
    await _databaseService.saveVSLATransactions(newVSLATransactions);
  }

  Future<void> _sendFarmersToServer(List<Farmer> farmers) async {
    final farmersMap = farmers
        .map((f) => {
              'id': f.remoteId,
              'name': f.fullName,
              'national_id': f.nationalId,
              'land_size': f.landSizeHa,
              'location': f.locationStr
            })
        .toList();

    final response = await http.post(
      Uri.parse('$baseUrl/api/farmers/batch'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'farmers': farmersMap}),
    );

    if (response.statusCode == 200) {
      // Mark as synced using local IDs
      await _databaseService
          .markFarmersAsSynced(farmers.map((f) => f.id).toList());
    } else {
      throw Exception('Failed to sync farmers');
    }
  }

  Future<void> _sendSalesToServer(List<Sale> sales) async {
    final salesMap = sales
        .map((s) => {
              'farmer_id': s.farmerId,
              'crop_type': s.cropType,
              'quantity_kg': s.quantityKg,
              'price_per_kg': s.pricePerKg,
              'total_amount': s.totalAmount,
              'date': s.date
            })
        .toList();

    final response = await http.post(
      Uri.parse('$baseUrl/api/sales/batch'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'sales': salesMap}),
    );

    if (response.statusCode == 200) {
      await _databaseService.markSalesAsSynced(sales.map((s) => s.id).toList());
    } else {
      throw Exception('Failed to sync sales');
    }
  }

  Future<void> _sendVSLATransactionsToServer(
      List<VSLATransaction> transactions) async {
    final transactionsMap = transactions
        .map((t) => {
              'farmer_id': t.farmerId,
              'amount': t.amount,
              'type': t.type,
              'date': t.date
            })
        .toList();

    final response = await http.post(
      Uri.parse('$baseUrl/api/vsla/transactions/batch'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'transactions': transactionsMap}),
    );

    if (response.statusCode == 200) {
      await _databaseService
          .markVSLATransactionsAsSynced(transactions.map((t) => t.id).toList());
    } else {
      throw Exception('Failed to sync VSLA transactions');
    }
  }

  Future<List<Map<String, dynamic>>> _fetchFarmersFromServer(
      DateTime? lastSync) async {
    final url = lastSync != null
        ? '$baseUrl/api/farmers?since=${lastSync.toIso8601String()}'
        : '$baseUrl/api/farmers';

    final response = await http.get(Uri.parse(url));

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return List<Map<String, dynamic>>.from(data['farmers']);
    } else {
      throw Exception('Failed to fetch farmers');
    }
  }

  Future<List<Map<String, dynamic>>> _fetchSalesFromServer(
      DateTime? lastSync) async {
    final url = lastSync != null
        ? '$baseUrl/api/sales?since=${lastSync.toIso8601String()}'
        : '$baseUrl/api/sales';

    final response = await http.get(Uri.parse(url));

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return List<Map<String, dynamic>>.from(data['sales']);
    } else {
      throw Exception('Failed to fetch sales');
    }
  }

  Future<List<Map<String, dynamic>>> _fetchVSLATransactionsFromServer(
      DateTime? lastSync) async {
    final url = lastSync != null
        ? '$baseUrl/api/vsla/transactions?since=${lastSync.toIso8601String()}'
        : '$baseUrl/api/vsla/transactions';

    final response = await http.get(Uri.parse(url));

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return List<Map<String, dynamic>>.from(data['transactions']);
    } else {
      throw Exception('Failed to fetch VSLA transactions');
    }
  }

  // Conflict resolution: server timestamp takes precedence for financial data
  Future<void> resolveConflicts() async {
    // Implementation for conflict resolution
    // For financial data, server version wins
    // For other data, user can choose or merge
  }
}
