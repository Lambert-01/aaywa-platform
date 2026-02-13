import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import '../models/admin_metrics.dart';
import '../config/env.dart';
import '../services/cache_service.dart';
import '../utils/error_handler.dart';

class AdminProvider with ChangeNotifier {
  ExecutiveSummary? _executiveSummary;
  List<CohortAnalytics> _cohortAnalytics = [];
  List<CropAnalytics> _cropAnalytics = [];
  List<PeriodAnalytics> _periodAnalytics = [];
  SystemHealth? _systemHealth;
  List<AdminUser> _users = [];

  bool _isLoading = false;
  String? _error;

  final CacheService _cache = CacheService();

  // Getters
  ExecutiveSummary? get executiveSummary => _executiveSummary;
  List<CohortAnalytics> get cohortAnalytics => _cohortAnalytics;
  List<CropAnalytics> get cropAnalytics => _cropAnalytics;
  List<PeriodAnalytics> get periodAnalytics => _periodAnalytics;
  SystemHealth? get systemHealth => _systemHealth;
  List<AdminUser> get users => _users;
  bool get isLoading => _isLoading;
  String? get error => _error;

  // API Base URL
  // API Base URL
  static String get _baseUrl => '${Environment.apiBaseUrl}/api/admin';

  // Get auth token from secured storage (simplified for now)
  String? _authToken;

  void setAuthToken(String token) {
    _authToken = token;
  }

  Map<String, String> get _headers => {
        'Content-Type': 'application/json',
        if (_authToken != null) 'Authorization': 'Bearer $_authToken',
      };

  // Load Executive Summary
  Future<void> loadExecutiveSummary({bool forceRefresh = false}) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      if (!forceRefresh) {
        final cached = await _cache.get<ExecutiveSummary>(
          'admin_executive_summary',
          ttl: CacheTTL.dashboardMetrics,
        );
        if (cached != null) {
          _executiveSummary = cached;
          _isLoading = false;
          notifyListeners();
          return;
        }
      }

      await ErrorHandler.handleApiCall(() async {
        final response = await http.get(
          Uri.parse('$_baseUrl/executive-summary'),
          headers: _headers,
        );

        if (response.statusCode == 200) {
          final data = json.decode(response.body);
          _executiveSummary = ExecutiveSummary.fromJson(data);
          _cache.set('admin_executive_summary', _executiveSummary);
        } else {
          throw http.ClientException(
              'Failed to load executive summary: ${response.statusCode}');
        }
      });
    } catch (e) {
      _error = ErrorHandler.getUserMessage(e);
      debugPrint(_error);
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Load Cohort Analytics
  Future<void> loadCohortAnalytics({
    String? startDate,
    String? endDate,
    bool forceRefresh = false,
  }) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    final cacheKey =
        'admin_cohort_analytics_${startDate ?? "all"}_${endDate ?? "all"}';

    try {
      if (!forceRefresh) {
        final cached = await _cache.get<List<CohortAnalytics>>(
          cacheKey,
          ttl: CacheTTL.analyticsResults,
        );
        if (cached != null) {
          _cohortAnalytics = cached;
          _isLoading = false;
          notifyListeners();
          return;
        }
      }

      await ErrorHandler.handleApiCall(() async {
        var uri = Uri.parse('$_baseUrl/analytics/by-cohort');
        if (startDate != null && endDate != null) {
          uri = uri.replace(queryParameters: {
            'startDate': startDate,
            'endDate': endDate,
          });
        }

        final response = await http.get(uri, headers: _headers);

        if (response.statusCode == 200) {
          final List data = json.decode(response.body);
          _cohortAnalytics =
              data.map((json) => CohortAnalytics.fromJson(json)).toList();
          _cache.set(cacheKey, _cohortAnalytics);
        } else {
          throw http.ClientException(
              'Failed to load cohort analytics: ${response.statusCode}');
        }
      });
    } catch (e) {
      _error = ErrorHandler.getUserMessage(e);
      debugPrint(_error);
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Load Crop Analytics
  Future<void> loadCropAnalytics({bool forceRefresh = false}) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      if (!forceRefresh) {
        final cached = await _cache.get<List<CropAnalytics>>(
          'admin_crop_analytics',
          ttl: CacheTTL.analyticsResults,
        );
        if (cached != null) {
          _cropAnalytics = cached;
          _isLoading = false;
          notifyListeners();
          return;
        }
      }

      await ErrorHandler.handleApiCall(() async {
        final response = await http.get(
          Uri.parse('$_baseUrl/analytics/by-crop'),
          headers: _headers,
        );

        if (response.statusCode == 200) {
          final List data = json.decode(response.body);
          _cropAnalytics =
              data.map((json) => CropAnalytics.fromJson(json)).toList();
          _cache.set('admin_crop_analytics', _cropAnalytics);
        } else {
          throw http.ClientException(
              'Failed to load crop analytics: ${response.statusCode}');
        }
      });
    } catch (e) {
      _error = ErrorHandler.getUserMessage(e);
      debugPrint(_error);
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Load Period Analytics
  Future<void> loadPeriodAnalytics({
    String groupBy = 'month',
    bool forceRefresh = false,
  }) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    final cacheKey = 'admin_period_analytics_$groupBy';

    try {
      if (!forceRefresh) {
        final cached = await _cache.get<List<PeriodAnalytics>>(
          cacheKey,
          ttl: CacheTTL.analyticsResults,
        );
        if (cached != null) {
          _periodAnalytics = cached;
          _isLoading = false;
          notifyListeners();
          return;
        }
      }

      await ErrorHandler.handleApiCall(() async {
        final response = await http.get(
          Uri.parse('$_baseUrl/analytics/by-period?groupBy=$groupBy'),
          headers: _headers,
        );

        if (response.statusCode == 200) {
          final List data = json.decode(response.body);
          _periodAnalytics =
              data.map((json) => PeriodAnalytics.fromJson(json)).toList();
          _cache.set(cacheKey, _periodAnalytics);
        } else {
          throw http.ClientException(
              'Failed to load period analytics: ${response.statusCode}');
        }
      });
    } catch (e) {
      _error = ErrorHandler.getUserMessage(e);
      debugPrint(_error);
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Load System Health
  Future<void> loadSystemHealth({bool forceRefresh = false}) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      if (!forceRefresh) {
        final cached = await _cache.get<SystemHealth>(
          'admin_system_health',
          ttl: CacheTTL.dashboardMetrics,
        );
        if (cached != null) {
          _systemHealth = cached;
          _isLoading = false;
          notifyListeners();
          return;
        }
      }

      await ErrorHandler.handleApiCall(() async {
        final response = await http.get(
          Uri.parse('$_baseUrl/system-health'),
          headers: _headers,
        );

        if (response.statusCode == 200) {
          final data = json.decode(response.body);
          _systemHealth = SystemHealth.fromJson(data);
          _cache.set('admin_system_health', _systemHealth);
        } else {
          throw http.ClientException(
              'Failed to load system health: ${response.statusCode}');
        }
      });
    } catch (e) {
      _error = ErrorHandler.getUserMessage(e);
      debugPrint(_error);
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Load Users
  Future<void> loadUsers({
    String? role,
    String? status,
    String? search,
    bool forceRefresh = false,
  }) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    final cacheKey =
        'admin_users_${role ?? "all"}_${status ?? "all"}_${search ?? "all"}';

    try {
      if (!forceRefresh) {
        final cached = await _cache.get<List<AdminUser>>(
          cacheKey,
          ttl: CacheTTL.shortLived,
        );
        if (cached != null) {
          _users = cached;
          _isLoading = false;
          notifyListeners();
          return;
        }
      }

      await ErrorHandler.handleApiCall(() async {
        var uri = Uri.parse('$_baseUrl/users');
        final queryParams = <String, String>{};
        if (role != null) queryParams['role'] = role;
        if (status != null) queryParams['status'] = status;
        if (search != null) queryParams['search'] = search;

        if (queryParams.isNotEmpty) {
          uri = uri.replace(queryParameters: queryParams);
        }

        final response = await http.get(uri, headers: _headers);

        if (response.statusCode == 200) {
          final List data = json.decode(response.body);
          _users = data.map((json) => AdminUser.fromJson(json)).toList();
          _cache.set(cacheKey, _users);
        } else {
          throw http.ClientException(
              'Failed to load users: ${response.statusCode}');
        }
      });
    } catch (e) {
      _error = ErrorHandler.getUserMessage(e);
      debugPrint(_error);
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Update User Status
  Future<bool> updateUserStatus(int userId, bool isActive) async {
    try {
      return await ErrorHandler.handleApiCall(() async {
        final response = await http.put(
          Uri.parse('$_baseUrl/users/$userId/status'),
          headers: _headers,
          body: json.encode({'is_active': isActive}),
        );

        if (response.statusCode == 200) {
          // Clear users cache since data changed
          _cache.clear('admin_users_all_all_all'); // Simple invalidation
          await loadUsers(forceRefresh: true);
          return true;
        } else {
          _error = 'Failed to update user status: ${response.statusCode}';
          notifyListeners();
          return false;
        }
      });
    } catch (e) {
      _error = ErrorHandler.getUserMessage(e);
      debugPrint(_error);
      notifyListeners();
      return false;
    }
  }

  // Refresh all data
  Future<void> refreshAll() async {
    await Future.wait([
      loadExecutiveSummary(forceRefresh: true),
      loadCohortAnalytics(forceRefresh: true),
      loadCropAnalytics(forceRefresh: true),
      loadSystemHealth(forceRefresh: true),
    ]);
  }
}
