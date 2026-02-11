import 'package:flutter/foundation.dart';
import '../services/api_service.dart';

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

  // List of recent activities
  List<Map<String, dynamic>> _recentActivities = [];
  List<Map<String, dynamic>> get recentActivities => _recentActivities;

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
        _trustScore = response['trustScore'] ?? 80;

        // Parse Recent Activities
        if (response['recentActivities'] != null) {
          _recentActivities =
              List<Map<String, dynamic>>.from(response['recentActivities']);
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
