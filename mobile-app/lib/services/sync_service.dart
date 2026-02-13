import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:drift/drift.dart'; // For QueryRow
import 'database_service.dart';
import '../config/env.dart';
import 'package:shared_preferences/shared_preferences.dart';

class SyncService {
  final DatabaseService _databaseService;

  SyncService(this._databaseService);

  Future<Map<String, String>> _getHeaders() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('auth_token');
    return {
      'Content-Type': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }

  Future<void> syncData() async {
    try {
      // Sync local changes to server
      await _syncLocalChangesToServer();

      // Sync server changes to local
      await _syncServerChangesToLocal();

      // Update last sync timestamp
      await _databaseService.updateLastSyncTimestamp();
    } catch (e) {
      if (kDebugMode) {
        debugPrint('Sync failed: $e');
      }
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

    final unsyncedInvoices = await _databaseService.getUnsyncedInputInvoices();
    if (unsyncedInvoices.isNotEmpty) {
      await _sendInputInvoicesToServer(unsyncedInvoices);
    }

    // Sync Attendance
    final unsyncedAttendance = await _databaseService.getUnsyncedAttendance();
    if (unsyncedAttendance.isNotEmpty) {
      await _sendAttendanceToServer(unsyncedAttendance);
    }

    // Sync Plot Boundaries
    final unsyncedBoundaries =
        await _databaseService.getUnsyncedPlotBoundaries();
    if (unsyncedBoundaries.isNotEmpty) {
      // Group by farmer_id
      final groupedBoundaries = <String, List<QueryRow>>{};
      for (var row in unsyncedBoundaries) {
        final farmerId = row.read<String>('farmer_id');
        if (!groupedBoundaries.containsKey(farmerId)) {
          groupedBoundaries[farmerId] = [];
        }
        groupedBoundaries[farmerId]!.add(row);
      }

      for (var farmerId in groupedBoundaries.keys) {
        await _sendPlotBoundariesToServer(
            farmerId, groupedBoundaries[farmerId]!);
      }
    }
  }

  Future<void> _syncServerChangesToLocal() async {
    final lastSync = await _databaseService.getLastSyncTimestamp();

    // Fetch new data from server since last sync
    final newFarmers = await _fetchFarmersFromServer(lastSync);
    final newSales = await _fetchSalesFromServer(lastSync);
    final newVSLATransactions =
        await _fetchVSLATransactionsFromServer(lastSync);
    final newInvoices = await _fetchInputInvoicesFromServer(lastSync);

    // Save to local database
    await _databaseService.saveFarmers(newFarmers);
    await _databaseService.saveSales(newSales);
    await _databaseService.saveVSLATransactions(newVSLATransactions);
    await _databaseService.saveInputInvoices(newInvoices);
  }

  Future<void> _sendFarmersToServer(List<Farmer> farmers) async {
    final farmersMap = farmers
        .map((f) => {
              'full_name': '${f.firstName} ${f.lastName}',
              'phone': f.phone,
              'plot_size_hectares': f.landSizeHa,
              'cohort_id': f.cohortId,
              'vsla_id': f.vslaId,
            })
        .toList();

    final response = await http.post(
      Uri.parse('${Environment.apiBaseUrl}/farmers/batch'),
      headers: await _getHeaders(),
      body: jsonEncode({'farmers': farmersMap}),
    );

    if (response.statusCode == 200 || response.statusCode == 207) {
      // Mark as synced using local IDs
      await _databaseService
          .markFarmersAsSynced(farmers.map((f) => f.id).toList());
    } else {
      throw Exception('Failed to sync farmers: ${response.body}');
    }
  }

  Future<void> _sendSalesToServer(List<Sale> sales) async {
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

    final response = await http.post(
      Uri.parse('${Environment.apiBaseUrl}/sales/batch'),
      headers: await _getHeaders(),
      body: jsonEncode({'sales': salesMap}),
    );

    if (response.statusCode == 200 || response.statusCode == 207) {
      await _databaseService.markSalesAsSynced(sales.map((s) => s.id).toList());
    } else {
      throw Exception('Failed to sync sales: ${response.body}');
    }
  }

  Future<void> _sendVSLATransactionsToServer(
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

    final response = await http.post(
      Uri.parse('${Environment.apiBaseUrl}/vsla/transactions/batch'),
      headers: await _getHeaders(),
      body: jsonEncode({'transactions': transactionsMap}),
    );

    if (response.statusCode == 200 || response.statusCode == 207) {
      await _databaseService
          .markVSLATransactionsAsSynced(transactions.map((t) => t.id).toList());
    } else {
      throw Exception('Failed to sync VSLA transactions: ${response.body}');
    }
  }

  Future<void> _sendInputInvoicesToServer(List<InputInvoice> invoices) async {
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

    final response = await http.post(
      Uri.parse('${Environment.apiBaseUrl}/inputs/invoices/batch'),
      headers: await _getHeaders(),
      body: jsonEncode({'invoices': invoicesMap}),
    );

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
        final response = await http.post(
          Uri.parse('${Environment.apiBaseUrl}/vsla/$vslaId/attendance'),
          headers: headers,
          body: jsonEncode({
            'farmer_id': item.farmerId,
            'status': 'present',
            'date': item.timestamp.toIso8601String(),
          }),
        );

        if (response.statusCode == 201) {
          await _databaseService.markAttendanceAsSynced([item.id]);
        } else {
          debugPrint(
              'Failed to sync attendance for ${item.id}: ${response.body}');
        }
      }
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

    final response = await http.post(
      Uri.parse('${Environment.apiBaseUrl}/farmers/$farmerId/boundary'),
      headers: await _getHeaders(),
      body: jsonEncode({'boundary': pointsMap}),
    );

    if (response.statusCode == 200) {
      await _databaseService.markPlotBoundariesAsSynced(farmerId);
    } else {
      debugPrint('Failed to sync boundary for $farmerId: ${response.body}');
    }
  }

  Future<List<Map<String, dynamic>>> _fetchFarmersFromServer(
      DateTime? lastSync) async {
    final url = lastSync != null
        ? '${Environment.apiBaseUrl}/farmers?since=${lastSync.toIso8601String()}'
        : '${Environment.apiBaseUrl}/farmers';

    final response =
        await http.get(Uri.parse(url), headers: await _getHeaders());

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

    final response =
        await http.get(Uri.parse(url), headers: await _getHeaders());

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

    final response =
        await http.get(Uri.parse(url), headers: await _getHeaders());

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

    final response =
        await http.get(Uri.parse(url), headers: await _getHeaders());

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return List<Map<String, dynamic>>.from(data['invoices'] ?? data);
    } else {
      throw Exception('Failed to fetch input invoices: ${response.body}');
    }
  }

  Future<void> resolveConflicts() async {
    // Implementation for conflict resolution
  }
}
