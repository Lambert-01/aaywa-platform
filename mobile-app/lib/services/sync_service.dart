import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:drift/drift.dart'; // For QueryRow
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
              'id': f.remoteId,
              'name': '${f.firstName} ${f.lastName}',
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
              'total_amount': s.grossAmount,
              'date': s.transactionDate.toIso8601String()
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
              'date': t.transactionDate.toIso8601String(),
              'notes': t.notes // Added notes
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
      Uri.parse('$baseUrl/api/inputs/invoices/batch'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'invoices': invoicesMap}),
    );

    if (response.statusCode == 200) {
      await _databaseService
          .markInputInvoicesAsSynced(invoices.map((i) => i.id).toList());
    } else {
      throw Exception('Failed to sync input invoices');
    }
  }

  Future<void> _sendAttendanceToServer(
      List<AttendanceData> attendanceList) async {
    // Group by VSLA or just batch send? API supports batch?
    // Current backend route is per-VSLA: POST /:id/attendance
    // We need to group by relatedId (VSLA ID)
    final grouped = <String, List<AttendanceData>>{};
    for (var a in attendanceList) {
      if (a.type == 'VSLA_MEETING' && a.relatedId != null) {
        if (!grouped.containsKey(a.relatedId)) {
          grouped[a.relatedId!] = [];
        }
        grouped[a.relatedId!]!.add(a);
      }
    }

    for (var vslaId in grouped.keys) {
      final list = grouped[vslaId]!;
      for (var item in list) {
        // Current API is single item per request
        final response = await http.post(
          Uri.parse('$baseUrl/api/vsla/$vslaId/attendance'),
          headers: {'Content-Type': 'application/json'},
          body: jsonEncode({
            'farmer_id': item.farmerId,
            'status':
                'present', // We only save present ones in mobile app currently
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

    // Assuming we have an endpoint for this
    // POST /api/farmers/:id/boundary
    final response = await http.post(
      Uri.parse('$baseUrl/api/farmers/$farmerId/boundary'),
      headers: {'Content-Type': 'application/json'},
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

  Future<List<Map<String, dynamic>>> _fetchInputInvoicesFromServer(
      DateTime? lastSync) async {
    final url = lastSync != null
        ? '$baseUrl/api/inputs/invoices?since=${lastSync.toIso8601String()}'
        : '$baseUrl/api/inputs/invoices';

    final response = await http.get(Uri.parse(url));

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return List<Map<String, dynamic>>.from(data['invoices']);
    } else {
      throw Exception('Failed to fetch input invoices');
    }
  }

  // Conflict resolution: server timestamp takes precedence for financial data
  Future<void> resolveConflicts() async {
    // Implementation for conflict resolution
    // For financial data, server version wins
    // For other data, user can choose or merge
  }
}
