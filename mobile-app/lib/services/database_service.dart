import 'package:drift/drift.dart';
import 'database/connection/connection.dart';
import '../models/sync_status.dart';

part 'database_service.g.dart';

// Tables

/// Farmers Table
class Farmers extends Table {
  IntColumn get id => integer().autoIncrement()();
  TextColumn get remoteId => text().nullable().unique()();

  // Basic Info
  TextColumn get firstName => text()();
  TextColumn get lastName => text()();
  TextColumn get nationalId => text()();
  TextColumn get phone => text().nullable()();
  TextColumn get cohortId => text().nullable()();
  TextColumn get vslaId => text().nullable()(); // Added for Offline VSLA
  TextColumn get householdType => text().nullable()();

  // Geospatial
  RealColumn get landSizeHa => real().nullable()();
  TextColumn get plotBoundaryCoordinates => text().nullable()();
  TextColumn get locationStr => text().nullable()();

  // Sync Meta
  IntColumn get syncStatus => integer()
      .map(const SyncStatusConverter())
      .withDefault(const Constant(1))();
  DateTimeColumn get localUpdatedAt =>
      dateTime().withDefault(currentDateAndTime)();
  DateTimeColumn get serverUpdatedAt => dateTime().nullable()();
  TextColumn get lastFailureReason => text().nullable()();
}

/// Sales Table
class Sales extends Table {
  IntColumn get id => integer().autoIncrement()();
  TextColumn get remoteId => text().nullable().unique()();
  TextColumn get farmerId => text().nullable()();

  TextColumn get cropType => text()();
  RealColumn get quantityKg => real()();
  RealColumn get pricePerKg => real()();

  // Financials
  RealColumn get grossAmount => real()();
  RealColumn get farmerSplitAmount => real()();
  RealColumn get sanzaSplitAmount => real()();
  RealColumn get inputDeductionAmount =>
      real().withDefault(const Constant(0.0))();

  DateTimeColumn get transactionDate => dateTime()();

  // Sync Meta
  IntColumn get syncStatus => integer()
      .map(const SyncStatusConverter())
      .withDefault(const Constant(1))();
  DateTimeColumn get localUpdatedAt =>
      dateTime().withDefault(currentDateAndTime)();
  DateTimeColumn get serverUpdatedAt => dateTime().nullable()();
  TextColumn get lastFailureReason => text().nullable()();
}

/// Input Invoices
class InputInvoices extends Table {
  IntColumn get id => integer().autoIncrement()();
  TextColumn get remoteId => text().nullable().unique()();
  TextColumn get farmerId => text()();

  TextColumn get supplier => text()();
  TextColumn get inputType => text()();
  RealColumn get quantity =>
      real().withDefault(const Constant(1.0))(); // Added quantity
  RealColumn get unitPrice => real()();
  RealColumn get totalCost => real()();

  IntColumn get installments => integer().withDefault(const Constant(1))();
  TextColumn get paymentStatus =>
      text().withDefault(const Constant('pending'))();

  DateTimeColumn get purchaseDate => dateTime()();
  TextColumn get notes => text().nullable()(); // Added notes

  // Sync Meta
  IntColumn get syncStatus => integer()
      .map(const SyncStatusConverter())
      .withDefault(const Constant(1))();
  DateTimeColumn get localUpdatedAt =>
      dateTime().withDefault(currentDateAndTime)();
  DateTimeColumn get serverUpdatedAt => dateTime().nullable()();
  TextColumn get lastFailureReason => text().nullable()();
}

/// VSLA Transactions
class VSLATransactions extends Table {
  IntColumn get id => integer().autoIncrement()();
  TextColumn get remoteId => text().nullable().unique()();
  TextColumn get farmerId => text().nullable()();

  RealColumn get amount => real()();
  TextColumn get type => text()();
  DateTimeColumn get transactionDate => dateTime()();
  TextColumn get notes => text().nullable()(); // Added notes

  // Sync Meta
  IntColumn get syncStatus => integer()
      .map(const SyncStatusConverter())
      .withDefault(const Constant(1))();
  DateTimeColumn get localUpdatedAt =>
      dateTime().withDefault(currentDateAndTime)();
  DateTimeColumn get serverUpdatedAt => dateTime().nullable()();
  TextColumn get lastFailureReason => text().nullable()();
}

/// Sync Queue
class SyncQueue extends Table {
  IntColumn get id => integer().autoIncrement()();
  TextColumn get entityTable => text()();
  TextColumn get action => text()();
  TextColumn get payload => text()();

  IntColumn get localRecordId => integer()();

  IntColumn get retryCount => integer().withDefault(const Constant(0))();
  TextColumn get status => text().withDefault(const Constant('PENDING'))();
  DateTimeColumn get createdAt => dateTime().withDefault(currentDateAndTime)();
  TextColumn get lastError => text().nullable()();
}

/// Trainings
class Trainings extends Table {
  IntColumn get id => integer().autoIncrement()();
  TextColumn get remoteId => text().nullable()();
  TextColumn get topic => text()();
  DateTimeColumn get date => dateTime()();
  TextColumn get location => text()();

  IntColumn get syncStatus => integer()
      .map(const SyncStatusConverter())
      .withDefault(const Constant(1))();
  DateTimeColumn get localUpdatedAt =>
      dateTime().withDefault(currentDateAndTime)();
}

class Attendance extends Table {
  IntColumn get id => integer().autoIncrement()();
  TextColumn get remoteId => text().nullable()();
  TextColumn get trainingIds => text().nullable()();
  TextColumn get farmerId => text().nullable()();
  TextColumn get type => text()
      .withDefault(const Constant('TRAINING'))(); // TRAINING, VSLA_MEETING
  TextColumn get relatedId =>
      text().nullable()(); // Training ID or VSLA Group ID
  DateTimeColumn get timestamp => dateTime()();

  IntColumn get syncStatus => integer()
      .map(const SyncStatusConverter())
      .withDefault(const Constant(1))();
  DateTimeColumn get localUpdatedAt =>
      dateTime().withDefault(currentDateAndTime)();
}

/// Plot Boundaries Table
@DataClassName('PlotBoundary')
class PlotBoundaries extends Table {
  IntColumn get id => integer().autoIncrement()();
  TextColumn get remoteId => text().nullable().unique()();
  TextColumn get farmerId => text()();
  RealColumn get latitude => real()();
  RealColumn get longitude => real()();
  IntColumn get orderIndex => integer()();

  // Sync Meta
  IntColumn get syncStatus => integer()
      .map(const SyncStatusConverter())
      .withDefault(const Constant(1))();
  DateTimeColumn get localUpdatedAt =>
      dateTime().withDefault(currentDateAndTime)();
  DateTimeColumn get serverUpdatedAt => dateTime().nullable()();
  TextColumn get lastFailureReason => text().nullable()();
}

// Database Class
@DriftDatabase(tables: [
  Farmers,
  Sales,
  InputInvoices,
  VSLATransactions,
  SyncQueue,
  Trainings,
  Attendance,
  PlotBoundaries
])
class AppDatabase extends _$AppDatabase {
  AppDatabase() : super(openConnection());

  @override
  int get schemaVersion => 6; // Incremented to 6

  @override
  MigrationStrategy get migration {
    return MigrationStrategy(
      onCreate: (Migrator m) async {
        await m.createAll();
      },
      onUpgrade: (Migrator m, int from, int to) async {
        if (from < 3) {
          // Legacy reset for older versions
          for (final table in allTables) {
            await m.deleteTable(table.actualTableName);
            await m.createTable(table);
          }
        } else if (from == 4) {
          // Migration from 4 to 5: Add PlotBoundaries table
          await m.createTable(allTables
              .firstWhere((t) => t.actualTableName == 'plot_boundaries'));
        } else if (from == 5) {
          // Migration from 5 to 6: Add type and relatedId to Attendance
          await m.addColumn(attendance, attendance.type);
          await m.addColumn(attendance, attendance.relatedId);
        }
      },
    );
  }

  // --- Farmers Helpers ---
  Future<List<Farmer>> getAllFarmers() => select(farmers).get();

  Future<int> insertFarmer(FarmersCompanion entry) {
    return into(farmers).insert(entry);
  }

  Future<List<Farmer>> getFarmersByVSLA(String vslaId) {
    return (select(farmers)..where((t) => t.vslaId.equals(vslaId))).get();
  }

  // --- Attendance Helpers ---
  Future<int> insertAttendance(AttendanceCompanion entry) {
    return into(attendance).insert(entry);
  }

  Future<List<AttendanceData>> getUnsyncedAttendance() {
    return (select(attendance)
          ..where((t) => t.syncStatus.equals(SyncStatus.pending.index)))
        .get();
  }

  Future<void> markAttendanceAsSynced(List<int> ids) async {
    await (update(attendance)..where((t) => t.id.isIn(ids))).write(
      const AttendanceCompanion(
        syncStatus: Value(SyncStatus.synced),
        // serverUpdatedAt: Value(DateTime.now()), // No serverUpdatedAt in Attendance table def above, check if needed
      ),
    );
  }

  // --- Sales Helpers ---
  Future<List<Sale>> getAllSales() => select(sales).get();

  Future<List<Sale>> getUnsyncedSales() {
    return (select(sales)
          ..where((t) => t.syncStatus.equals(SyncStatus.pending.index)))
        .get();
  }

  Future<int> insertSale(SalesCompanion entry) {
    return into(sales).insert(entry);
  }

  // --- Input Invoice Helpers ---
  Future<int> insertInputInvoice(InputInvoicesCompanion entry) {
    return into(inputInvoices).insert(entry);
  }

  // --- VSLA Helpers ---
  Future<List<VSLATransaction>> getUnsyncedVSLATransactions() {
    return (select(vSLATransactions)
          ..where((t) => t.syncStatus.equals(SyncStatus.pending.index)))
        .get();
  }

  Future<int> insertVSLATransaction(VSLATransactionsCompanion entry) {
    return into(vSLATransactions).insert(entry);
  }

  // --- Sync Helpers ---
  Future<void> markSalesAsSynced(List<int> ids) async {
    await (update(sales)..where((t) => t.id.isIn(ids))).write(
      SalesCompanion(
        syncStatus: const Value(SyncStatus.synced),
        serverUpdatedAt: Value(DateTime.now()),
      ),
    );
  }

  Future<void> markVSLATransactionsAsSynced(List<int> ids) async {
    await (update(vSLATransactions)..where((t) => t.id.isIn(ids))).write(
      VSLATransactionsCompanion(
        syncStatus: const Value(SyncStatus.synced),
        serverUpdatedAt: Value(DateTime.now()),
      ),
    );
  }

  // --- Missing SyncService Methods ---

  Future<List<Farmer>> getUnsyncedFarmers() {
    return (select(farmers)
          ..where((t) => t.syncStatus.equals(SyncStatus.pending.index)))
        .get();
  }

  Future<void> markFarmersAsSynced(List<int> ids) async {
    await (update(farmers)..where((t) => t.id.isIn(ids))).write(
      FarmersCompanion(
        syncStatus: const Value(SyncStatus.synced),
        serverUpdatedAt: Value(DateTime.now()),
      ),
    );
  }

  Future<void> saveFarmers(List<Map<String, dynamic>> dataList) async {
    await batch((batch) {
      for (final data in dataList) {
        batch.insert(
          farmers,
          FarmersCompanion(
            remoteId: Value(data['id']),
            firstName: Value(data['first_name'] ??
                (data['name'] as String).split(' ').first),
            lastName: Value(data['last_name'] ??
                (data['name'] as String).split(' ').skip(1).join(' ')),
            nationalId: Value(data['national_id'] ?? 'N/A'),
            phone: Value(data['phone']),
            syncStatus: const Value(SyncStatus.synced),
          ),
          mode: InsertMode.insertOrReplace,
        );
      }
    });
  }

  Future<void> saveSales(List<Map<String, dynamic>> dataList) async {
    await batch((batch) {
      for (final data in dataList) {
        batch.insert(
          sales,
          SalesCompanion(
            remoteId: Value(data['id']),
            farmerId: Value(data['farmer_id']),
            cropType: Value(data['crop_type']),
            quantityKg: Value((data['quantity_kg'] as num).toDouble()),
            pricePerKg: Value((data['price_per_kg'] as num).toDouble()),
            grossAmount: Value((data['total_amount'] as num).toDouble()),
            farmerSplitAmount: const Value(0.0), // Calc if needed
            sanzaSplitAmount: const Value(0.0), // Calc if needed
            transactionDate: Value(DateTime.parse(data['date'])),
            syncStatus: const Value(SyncStatus.synced),
          ),
          mode: InsertMode.insertOrReplace,
        );
      }
    });
  }

  Future<void> saveVSLATransactions(List<Map<String, dynamic>> dataList) async {
    await batch((batch) {
      for (final data in dataList) {
        batch.insert(
          vSLATransactions,
          VSLATransactionsCompanion(
            remoteId: Value(data['id']),
            farmerId: Value(data['farmer_id']),
            amount: Value((data['amount'] as num).toDouble()),
            type: Value(data['type']),
            transactionDate: Value(DateTime.parse(data['date'])),
            notes: Value(data['notes']),
            syncStatus: const Value(SyncStatus.synced),
          ),
          mode: InsertMode.insertOrReplace,
        );
      }
    });
  }

  // --- Input Invoice Sync Helpers ---
  Future<List<InputInvoice>> getUnsyncedInputInvoices() {
    return (select(inputInvoices)
          ..where((t) => t.syncStatus.equals(SyncStatus.pending.index)))
        .get();
  }

  Future<void> markInputInvoicesAsSynced(List<int> ids) async {
    await (update(inputInvoices)..where((t) => t.id.isIn(ids))).write(
      InputInvoicesCompanion(
        syncStatus: const Value(SyncStatus.synced),
        serverUpdatedAt: Value(DateTime.now()),
      ),
    );
  }

  Future<void> saveInputInvoices(List<Map<String, dynamic>> dataList) async {
    await batch((batch) {
      for (final data in dataList) {
        batch.insert(
          inputInvoices,
          InputInvoicesCompanion(
            remoteId: Value(data['id']),
            farmerId: Value(data['farmer_id']),
            supplier: Value(data['supplier']),
            inputType: Value(data['input_type']),
            quantity: Value((data['quantity'] as num).toDouble()),
            unitPrice: Value((data['unit_price'] as num).toDouble()),
            totalCost: Value((data['total_cost'] as num).toDouble()),
            installments: Value(data['installments'] as int),
            purchaseDate: Value(DateTime.parse(data['date'])),
            notes: Value(data['notes']),
            syncStatus: const Value(SyncStatus.synced),
          ),
          mode: InsertMode.insertOrReplace,
        );
      }
    });
  }

  // Placeholder for SharedPrefs timestamp wrapper if needed,
  // but usually SyncService handles this.
  // Keeping it for compatibility if UI calls it directly.
  Future<DateTime?> getLastSyncTimestamp() async {
    // This logic usually belongs in SharedPreferences, not DB,
    // unless we store it in a Meta table.
    // For now returning null or implementing via prefs if we add the dependency here.
    return null;
  }

  Future<void> updateLastSyncTimestamp() async {
    // Placeholder / Todo: Implement SharedPrefs
  }

  // --- Geospatial Helpers ---
  Future<List<QueryRow>> getPlotBoundariesByFarmer(String farmerId) {
    return customSelect(
      'SELECT * FROM plot_boundaries WHERE farmer_id = ? ORDER BY order_index ASC',
      variables: [Variable(farmerId)],
    ).get();
  }

  Future<void> savePlotBoundary(
      String farmerId, List<Map<String, double>> points) async {
    await transaction(() async {
      // Clear existing local points for this farmer to sync full polygon
      await customStatement(
          'DELETE FROM plot_boundaries WHERE farmer_id = ?', [farmerId]);

      // Insert new points
      for (int i = 0; i < points.length; i++) {
        await customStatement(
          'INSERT INTO plot_boundaries (farmer_id, latitude, longitude, order_index, sync_status) VALUES (?, ?, ?, ?, ?)',
          [
            farmerId,
            points[i]['lat'],
            points[i]['lng'],
            i,
            2 // Pending
          ],
        );
      }
    });
  }

  Future<void> markPlotBoundariesAsSynced(String farmerId) async {
    await customUpdate(
      'UPDATE plot_boundaries SET sync_status = 1, server_updated_at = ? WHERE farmer_id = ?',
      variables: [Variable(DateTime.now()), Variable(farmerId)],
    );
  }

  Future<List<QueryRow>> getUnsyncedPlotBoundaries() {
    return customSelect(
      'SELECT * FROM plot_boundaries WHERE sync_status = 2',
    ).get();
  }
}

typedef DatabaseService = AppDatabase;
