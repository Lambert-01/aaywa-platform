import 'package:shared_preferences/shared_preferences.dart';

/// Cache service for storing frequently accessed data with TTL support
class CacheService {
  static final CacheService _instance = CacheService._internal();
  factory CacheService() => _instance;
  CacheService._internal();

  final Map<String, _CachedData> _cache = {};
  static const String _prefix = 'cache_';

  /// Get cached data if not expired
  Future<T?> get<T>(String key, {Duration? ttl}) async {
    final cached = _cache[key];
    if (cached != null && !cached.isExpired(ttl)) {
      return cached.data as T;
    }

    // Try to get from persistent storage if not in memory
    final prefs = await SharedPreferences.getInstance();
    final persistedData = prefs.getString('$_prefix$key');
    if (persistedData != null) {
      // Data exists in persistent storage, but we don't deserialize complex types
      // This is mainly for simple string/number caching
      return null;
    }

    return null;
  }

  /// Set data in cache with current timestamp
  void set(String key, dynamic data, {bool persist = false}) {
    _cache[key] = _CachedData(data, DateTime.now());

    // Optionally persist simple data types
    if (persist &&
        (data is String || data is int || data is double || data is bool)) {
      _persistData(key, data);
    }
  }

  /// Clear specific cache entry
  void clear(String key) {
    _cache.remove(key);
    _clearPersisted(key);
  }

  /// Clear all cache entries
  void clearAll() {
    _cache.clear();
    _clearAllPersisted();
  }

  /// Clear expired cache entries
  void clearExpired({Duration? maxAge}) {
    _cache.removeWhere((key, value) => value.isExpired(maxAge));
  }

  Future<void> _persistData(String key, dynamic data) async {
    final prefs = await SharedPreferences.getInstance();
    if (data is String) {
      await prefs.setString('$_prefix$key', data);
    } else if (data is int) {
      await prefs.setInt('$_prefix$key', data);
    } else if (data is double) {
      await prefs.setDouble('$_prefix$key', data);
    } else if (data is bool) {
      await prefs.setBool('$_prefix$key', data);
    }
  }

  Future<void> _clearPersisted(String key) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('$_prefix$key');
  }

  Future<void> _clearAllPersisted() async {
    final prefs = await SharedPreferences.getInstance();
    final keys = prefs.getKeys().where((k) => k.startsWith(_prefix));
    for (final key in keys) {
      await prefs.remove(key);
    }
  }

  /// Get cache statistics
  Map<String, dynamic> getStats() {
    return {
      'total_entries': _cache.length,
      'memory_cache_size': _cache.length,
    };
  }
}

class _CachedData {
  final dynamic data;
  final DateTime timestamp;

  _CachedData(this.data, this.timestamp);

  bool isExpired(Duration? ttl) {
    if (ttl == null) return false;
    return DateTime.now().difference(timestamp) > ttl;
  }
}

/// Role-specific cache TTL configurations
class CacheTTL {
  // Farmer-specific cache durations
  static const Duration trustScore = Duration(hours: 1);
  static const Duration marketPrices = Duration(minutes: 30);
  static const Duration learningModules = Duration(hours: 24);

  // Staff-specific cache durations
  static const Duration cohortList = Duration(hours: 24);
  static const Duration farmerProfiles = Duration(hours: 6);
  static const Duration trainingMaterials = Duration(hours: 24);

  // Admin-specific cache durations
  static const Duration dashboardMetrics = Duration(minutes: 15);
  static const Duration analyticsResults = Duration(hours: 1);

  // Common cache durations
  static const Duration staticData = Duration(hours: 24);
  static const Duration shortLived = Duration(minutes: 5);
  static const Duration mediumLived = Duration(minutes: 30);
  static const Duration longLived = Duration(hours: 2);
}
