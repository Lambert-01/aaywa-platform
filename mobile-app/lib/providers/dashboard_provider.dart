import 'package:flutter/foundation.dart';
import '../services/api_service.dart';
import '../config/env.dart';

class DashboardProvider with ChangeNotifier {
  final ApiService _apiService = ApiService();

  bool _isLoading = false;
  String? _error;

  int _farmersCount = 0;
  int _salesCount = 0;
  int _trainingsCount = 0;
  int _farmPlotsCount = 0;

  // New properties for mobile redesign
  double _vslaBalance = 0.0;
  double _inputDebt = 0.0;
  double _salesTotal = 0.0;
  int _trustScore = 0;

  // Profile Data
  String? _cohortName;
  String? _householdType;
  String? _crops;
  String? _photoUrl;
  String? _status;

  bool get isLoading => _isLoading;
  String? get error => _error;
  int get farmersCount => _farmersCount;
  int get salesCount => _salesCount;
  int get trainingsCount => _trainingsCount;
  int get farmPlotsCount => _farmPlotsCount;

  // New getters
  double get vslaBalance => _vslaBalance;
  double get inputDebt => _inputDebt;
  double get salesTotal => _salesTotal;
  int get trustScore => _trustScore;

  String? get cohortName => _cohortName;
  String? get householdType => _householdType;
  String? get crops => _crops;
  String? get photoUrl => _photoUrl;
  String? get status => _status;

  // List of recent activities
  List<Map<String, dynamic>> _recentActivities = [];
  List<Map<String, dynamic>> get recentActivities => _recentActivities;

  // Pending trainings
  List<Map<String, dynamic>>? _pendingTrainings;
  List<Map<String, dynamic>>? get pendingTrainings => _pendingTrainings;

  Map<String, dynamic>? _location;
  Map<String, dynamic>? get location => _location;

  /// Load dashboard data - alias for fetchDashboardStats for compatibility
  Future<void> loadDashboardData() async {
    await fetchDashboardStats();
  }

  /// Fetch dashboard statistics from backend
  Future<void> fetchDashboardStats() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      // Fetch KPI data from dashboard endpoint
      final response = await _apiService.get('/dashboard/mobile');

      if (response != null) {
        // Parse the Mobile Dashboard response
        _farmersCount = response['farmers'] ?? 0;
        _salesCount = response['sales'] ?? 0;
        _trainingsCount = response['trainings'] ?? 0;
        _farmPlotsCount = response['plots'] ?? 0;

        _vslaBalance = (response['vslaBalance'] ?? 0.0).toDouble();
        _inputDebt = (response['inputDebt'] ?? 0.0).toDouble();
        _salesTotal = (response['salesTotal'] ?? 0.0).toDouble();
        _trustScore = response['trustScore'] ?? 0;
        _location = response['location']; // Map<String, dynamic> or null

        _cohortName = response['cohortName'];
        _householdType = response['householdType'];
        _crops = response['crops'];
        
        // Construct full photo URL if it's a relative path
        final rawPhotoUrl = response['photoUrl'];
        if (rawPhotoUrl != null && rawPhotoUrl.toString().isNotEmpty) {
          final photoStr = rawPhotoUrl.toString();
          if (photoStr.startsWith('http://') || photoStr.startsWith('https://')) {
            _photoUrl = photoStr;
          } else {
            // Remove /api from base URL and ensure proper path
            final baseUrl = Environment.apiBaseUrl.replaceAll('/api', '');
            final cleanPath = photoStr.startsWith('/') ? photoStr.substring(1) : photoStr;
            _photoUrl = '$baseUrl/$cleanPath';
          }
        } else {
          _photoUrl = null;
        }
        
        _status = response['status'];

        // Parse Recent Activities
        if (response['recentActivities'] != null) {
          _recentActivities =
              List<Map<String, dynamic>>.from(response['recentActivities']);
        }

        // Parse Pending Trainings
        if (response['pendingTrainings'] != null) {
          _pendingTrainings =
              List<Map<String, dynamic>>.from(response['pendingTrainings']);
        }

        if (kDebugMode) {
          debugPrint(
              '[DASHBOARD] Stats loaded: Balance=$_vslaBalance, Sales=$_salesTotal');
        }
      }
    } catch (e) {
      _error = 'Failed to load dashboard data: $e';
      if (kDebugMode) {
        debugPrint('[DASHBOARD] Error: $_error');
      }
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Refresh dashboard data
  Future<void> refresh() async {
    await fetchDashboardStats();
  }
}
