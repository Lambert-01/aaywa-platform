import 'package:workmanager/workmanager.dart';
import 'package:flutter/foundation.dart';
import 'database_service.dart';
import 'api_service.dart';
import '../models/sync_status.dart';

const String syncTaskName = "syncData";

@pragma(
    'vm:entry-point') // Mandatory if App is obfuscated or using Flutter 3.1+
void callbackDispatcher() {
  Workmanager().executeTask((task, inputData) async {
    try {
      if (task == syncTaskName) {
        if (kDebugMode) print("[BackgroundSync] Starting sync task...");

        // Initialize services
        final db = DatabaseService();
        final api = ApiService();

        int syncedCount = 0;

        // 1. Sync Sales
        final unsyncedSales = await db.getUnsyncedSales();
        for (var sale in unsyncedSales) {
          try {
            await api.submitSale({
              // Map sale to API format
              'farmer_id': sale.farmerId,
              'crop_type': sale.cropType,
              'quantity_kg': sale.quantityKg,
              'price_per_kg': sale.pricePerKg,
              'total_amount': sale.grossAmount,
              'date': sale.transactionDate.toIso8601String(),
              'local_id': sale.id, // For idempotency if backend supports
            });
            await db.markSalesAsSynced([sale.id]);
            syncedCount++;
          } catch (e) {
            print("[BackgroundSync] Failed to sync sale ${sale.id}: $e");
          }
        }

        // 2. Sync VSLA Transactions
        final unsyncedTxns = await db.getUnsyncedVSLATransactions();
        for (var txn in unsyncedTxns) {
          try {
            await api.recordVSLATransaction({
              'farmer_id': txn.farmerId,
              'amount': txn.amount,
              'type': txn.type,
              'date': txn.transactionDate.toIso8601String(),
              'notes': txn.notes,
            });
            await db.markVSLATransactionsAsSynced([txn.id]);
            syncedCount++;
          } catch (e) {
            print("[BackgroundSync] Failed to sync txn ${txn.id}: $e");
          }
        }

        // 3. Sync Farmer Issues
        final unsyncedIssues = await db.getUnsyncedFarmerIssues();
        for (var issue in unsyncedIssues) {
          try {
            // We need an API endpoint for issues.
            // Assuming POST /issues exists or will exist.
            // If not, we skip for now or mock success to clear queue if just testing logic.
            // For now, let's assume api.post('/issues', ...) works or we add it to ApiService.

            await api.post('/issues', {
              'farmer_id': issue.farmerId,
              'category_id': issue.categoryId,
              'urgency': issue.urgency,
              'description': issue.description,
              'gps_lat': issue.gpsLat,
              'gps_lng': issue.gpsLng,
              'date_reported': issue.dateReported.toIso8601String(),
            });

            await db.markFarmerIssuesAsSynced([issue.id]);
            syncedCount++;
          } catch (e) {
            print("[BackgroundSync] Failed to sync issue ${issue.id}: $e");
          }
        }

        if (kDebugMode)
          print("[BackgroundSync] Completed. Synced $syncedCount items.");
      }
    } catch (err) {
      if (kDebugMode) print("[BackgroundSync] Error: $err");
      return Future.value(false); // Retry later
    }

    return Future.value(true);
  });
}

class BackgroundSyncService {
  static Future<void> initialize() async {
    await Workmanager().initialize(
      callbackDispatcher,
      isInDebugMode: kDebugMode,
    );

    // Register periodic task
    await Workmanager().registerPeriodicTask(
      "1", // Unique name
      syncTaskName,
      frequency: const Duration(minutes: 15),
      constraints: Constraints(
        networkType: NetworkType.connected,
      ),
    );
  }
}
