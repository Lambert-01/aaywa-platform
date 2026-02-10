import 'package:drift/drift.dart';
import 'database/connection/connection.dart' as impl;

part 'database_service.g.dart';

// Tables
class Farmers extends Table {
  IntColumn get id => integer().autoIncrement()();
  TextColumn get remoteId => text().nullable()(); // ID from backend
  TextColumn get fullName => text()();
  TextColumn get nationalId => text()();
  RealColumn get landSizeHa => real()();
  TextColumn get locationStr =>
      text().nullable()(); // temporary location string
  BoolColumn get isSynced => boolean().withDefault(const Constant(false))();
}

class Sales extends Table {
  IntColumn get id => integer().autoIncrement()();
  IntColumn get farmerId => integer().references(Farmers, #id)();
  TextColumn get cropType => text()();
  RealColumn get quantityKg => real()();
  RealColumn get pricePerKg => real()();
  RealColumn get totalAmount => real()();
  TextColumn get date => text()(); // ISO8601 string
  BoolColumn get isSynced => boolean().withDefault(const Constant(false))();
}

class Trainings extends Table {
  IntColumn get id => integer().autoIncrement()();
  TextColumn get topic => text()();
  TextColumn get date => text()();
  TextColumn get location => text()();
}

class Attendance extends Table {
  IntColumn get id => integer().autoIncrement()();
  IntColumn get trainingId => integer().references(Trainings, #id)();
  IntColumn get farmerId => integer().references(Farmers, #id)();
  TextColumn get timestamp => text()();
  BoolColumn get isSynced => boolean().withDefault(const Constant(false))();
}

class VSLATransactions extends Table {
  IntColumn get id => integer().autoIncrement()();
  IntColumn get farmerId => integer().references(Farmers, #id)();
  RealColumn get amount => real()();
  TextColumn get type => text()(); // 'deposit', 'withdrawal', 'loan_repayment'
  TextColumn get date => text()();
  BoolColumn get isSynced => boolean().withDefault(const Constant(false))();
}

class SyncInfo extends Table {
  IntColumn get id => integer().autoIncrement()();
  TextColumn get entity => text()();
  TextColumn get lastSync => text()();
}

// Database Class
@DriftDatabase(
    tables: [Farmers, Sales, Trainings, Attendance, VSLATransactions, SyncInfo])
class AppDatabase extends _$AppDatabase {
  AppDatabase() : super(impl.openConnection());

  @override
  int get schemaVersion => 2; // Incremented version

  // Farmers
  Future<List<Farmer>> getAllFarmers() => select(farmers).get();
  Future<int> insertFarmer(FarmersCompanion farmer) =>
      into(farmers).insert(farmer);
  Future<List<Farmer>> getUnsyncedFarmers() =>
      (select(farmers)..where((tbl) => tbl.isSynced.equals(false))).get();
  Future<void> markFarmersAsSynced(List<int> ids) async {
    await (update(farmers)..where((tbl) => tbl.id.isIn(ids)))
        .write(const FarmersCompanion(isSynced: Value(true)));
  }

  Future<void> saveFarmers(List<Map<String, dynamic>> data) async {
    // Upsert logic
    await batch((batch) {
      for (final row in data) {
        batch.insert(
            farmers,
            FarmersCompanion(
              remoteId: Value(row['id'].toString()),
              fullName: Value(row['name']),
              nationalId: Value(row['national_id']),
              landSizeHa: Value(double.parse(row['land_size'].toString())),
              isSynced: const Value(true),
            ),
            mode: InsertMode.insertOrReplace);
      }
    });
  }

  // Sales
  Future<List<Sale>> getAllSales() => select(sales).get();
  Future<int> insertSale(SalesCompanion sale) => into(sales).insert(sale);
  Future<List<Sale>> getUnsyncedSales() =>
      (select(sales)..where((tbl) => tbl.isSynced.equals(false))).get();
  Future<void> markSalesAsSynced(List<int> ids) async {
    await (update(sales)..where((tbl) => tbl.id.isIn(ids)))
        .write(const SalesCompanion(isSynced: Value(true)));
  }

  Future<void> saveSales(List<Map<String, dynamic>> data) async {
    // Upsert logic
    // Implementation omitted for brevity, similar to saveFarmers
  }

  // VSLA
  Future<List<VSLATransaction>> getUnsyncedVSLATransactions() =>
      (select(vSLATransactions)..where((tbl) => tbl.isSynced.equals(false)))
          .get();
  Future<void> markVSLATransactionsAsSynced(List<int> ids) async {
    await (update(vSLATransactions)..where((tbl) => tbl.id.isIn(ids)))
        .write(const VSLATransactionsCompanion(isSynced: Value(true)));
  }

  Future<void> saveVSLATransactions(List<Map<String, dynamic>> data) async {
    // Upsert logic
  }

  // Sync Info
  Future<void> updateLastSyncTimestamp() async {
    final now = DateTime.now().toIso8601String();
    await into(syncInfo).insertOnConflictUpdate(SyncInfoCompanion(
        id: const Value(1), entity: const Value('all'), lastSync: Value(now)));
  }

  Future<DateTime?> getLastSyncTimestamp() async {
    final result = await (select(syncInfo)..where((tbl) => tbl.id.equals(1)))
        .getSingleOrNull();
    return result?.lastSync != null ? DateTime.parse(result!.lastSync) : null;
  }

  // Training
  Future<int> insertTraining(TrainingsCompanion training) =>
      into(trainings).insert(training);
  Future<int> recordAttendance(AttendanceCompanion entry) =>
      into(attendance).insert(entry);
}

typedef DatabaseService = AppDatabase;
