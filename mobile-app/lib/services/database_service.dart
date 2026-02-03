import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart';

class DatabaseService {
  Database? _database;

  Future<Database> get database async {
    if (_database != null) return _database!;
    _database = await _initDatabase();
    return _database!;
  }

  Future<Database> _initDatabase() async {
    final path = join(await getDatabasesPath(), 'aaywa.db');
    return await openDatabase(
      path,
      version: 1,
      onCreate: _createTables,
    );
  }

  Future<void> _createTables(Database db, int version) async {
    // Create tables for local data storage
    await db.execute('''
      CREATE TABLE users (
        id INTEGER PRIMARY KEY,
        email TEXT UNIQUE,
        name TEXT,
        role TEXT
      )
    ''');

    await db.execute('''
      CREATE TABLE farmers (
        id INTEGER PRIMARY KEY,
        name TEXT,
        location TEXT,
        cohort_id INTEGER
      )
    ''');

    await db.execute('''
      CREATE TABLE vsla_transactions (
        id INTEGER PRIMARY KEY,
        farmer_id INTEGER,
        amount REAL,
        type TEXT,
        date TEXT,
        FOREIGN KEY (farmer_id) REFERENCES farmers (id)
      )
    ''');
  }

  Future<void> init() async {
    await database;
  }

  // Add methods for CRUD operations as needed
}