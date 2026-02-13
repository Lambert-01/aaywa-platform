import 'package:flutter/foundation.dart';

import 'package:intl/intl.dart';
import '../services/cache_service.dart';
import '../utils/error_handler.dart';

/// Provider for managing and exposing field staff KPI metrics
class StaffKPIProvider extends ChangeNotifier {
  // TODO: Add database service when implementing real DB queries
  // final DatabaseService _db;

  StaffKPIMetrics? _todayMetrics;
  List<DailyMetrics> _weeklyMetrics = [];
  bool _isLoading = false;
  String? _error;

  final CacheService _cache = CacheService();

  // Constructor no longer requires DatabaseService until real DB queries implemented
  StaffKPIProvider();

  StaffKPIMetrics? get todayMetrics => _todayMetrics;
  List<DailyMetrics> get weeklyMetrics => _weeklyMetrics;
  bool get isLoading => _isLoading;
  String? get error => _error;

  /// Load KPI metrics for today
  Future<void> loadTodayMetrics(String staffUserId,
      {bool forceRefresh = false}) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      if (!forceRefresh) {
        final cached = await _cache.get<StaffKPIMetrics>(
          'staff_metrics_today_$staffUserId',
          ttl: CacheTTL.shortLived,
        );
        if (cached != null) {
          _todayMetrics = cached;
          _isLoading = false;
          notifyListeners();
          return;
        }
      }

      await ErrorHandler.handleApiCall(() async {
        final today = DateTime.now();
        final startOfDay = DateTime(today.year, today.month, today.day);
        final endOfDay = startOfDay.add(const Duration(days: 1));

        // Calculate today's metrics
        _todayMetrics = await _calculateMetricsForPeriod(
          staffUserId,
          startOfDay,
          endOfDay,
        );

        _cache.set('staff_metrics_today_$staffUserId', _todayMetrics);
      });

      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _error = ErrorHandler.getUserMessage(e);
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Load weekly metrics for trend visualization
  Future<void> loadWeeklyMetrics(String staffUserId,
      {bool forceRefresh = false}) async {
    try {
      if (!forceRefresh) {
        final cached = await _cache.get<List<DailyMetrics>>(
          'staff_metrics_weekly_$staffUserId',
          ttl: CacheTTL.mediumLived,
        );
        if (cached != null) {
          _weeklyMetrics = cached;
          notifyListeners();
          return;
        }
      }

      await ErrorHandler.handleApiCall(() async {
        final today = DateTime.now();
        final weeklyData = <DailyMetrics>[];

        // Get metrics for the past 7 days
        for (int i = 6; i >= 0; i--) {
          final date = today.subtract(Duration(days: i));
          final startOfDay = DateTime(date.year, date.month, date.day);
          final endOfDay = startOfDay.add(const Duration(days: 1));

          final metrics = await _calculateMetricsForPeriod(
            staffUserId,
            startOfDay,
            endOfDay,
          );

          weeklyData.add(DailyMetrics(
            date: startOfDay,
            farmersRegistered: metrics.farmersRegistered,
            trainingsCompleted: metrics.trainingsCompleted,
            plotsVerified: metrics.plotsVerified,
          ));
        }

        _weeklyMetrics = weeklyData;
        _cache.set('staff_metrics_weekly_$staffUserId', _weeklyMetrics);
      });

      notifyListeners();
    } catch (e) {
      _error = ErrorHandler.getUserMessage(e);
      notifyListeners();
    }
  }

  /// Calculate metrics for a specific time period
  Future<StaffKPIMetrics> _calculateMetricsForPeriod(
    String staffUserId,
    DateTime startDate,
    DateTime endDate,
  ) async {
    // TODO: Replace with actual database queries
    // For now, using mock data

    // In a real implementation, query the database:
    // - Count farmers registered by this staff member in the period
    // - Count training sessions completed in the period
    // - Count plots verified in the period
    // - Calculate hours worked from task completion timestamps

    return StaffKPIMetrics(
      farmersRegistered: 3,
      farmersRegisteredTarget: 5,
      trainingsCompleted: 2,
      trainingsCompletedTarget: 3,
      plotsVerified: 5,
      plotsVerifiedTarget: 8,
      hoursWorked: 6.5,
      hoursWorkedTarget: 8.0,
      materialsDistributed: 15,
      inputsAllocated: 8,
      farmerVisits: 12,
    );
  }

  /// Refresh all metrics
  Future<void> refreshMetrics(String staffUserId) async {
    await Future.wait([
      loadTodayMetrics(staffUserId, forceRefresh: true),
      loadWeeklyMetrics(staffUserId, forceRefresh: true),
    ]);
  }
}

/// Today's KPI metrics for a staff member
class StaffKPIMetrics {
  final int farmersRegistered;
  final int farmersRegisteredTarget;
  final int trainingsCompleted;
  final int trainingsCompletedTarget;
  final int plotsVerified;
  final int plotsVerifiedTarget;
  final double hoursWorked;
  final double hoursWorkedTarget;
  final int materialsDistributed;
  final int inputsAllocated;
  final int farmerVisits;

  StaffKPIMetrics({
    required this.farmersRegistered,
    required this.farmersRegisteredTarget,
    required this.trainingsCompleted,
    required this.trainingsCompletedTarget,
    required this.plotsVerified,
    required this.plotsVerifiedTarget,
    required this.hoursWorked,
    required this.hoursWorkedTarget,
    required this.materialsDistributed,
    required this.inputsAllocated,
    required this.farmerVisits,
  });

  double get registrationProgress => farmersRegisteredTarget > 0
      ? farmersRegistered / farmersRegisteredTarget
      : 0.0;

  double get trainingProgress => trainingsCompletedTarget > 0
      ? trainingsCompleted / trainingsCompletedTarget
      : 0.0;

  double get verificationProgress =>
      plotsVerifiedTarget > 0 ? plotsVerified / plotsVerifiedTarget : 0.0;

  double get hoursProgress =>
      hoursWorkedTarget > 0 ? hoursWorked / hoursWorkedTarget : 0.0;
}

/// Daily metrics for trend analysis
class DailyMetrics {
  final DateTime date;
  final int farmersRegistered;
  final int trainingsCompleted;
  final int plotsVerified;

  DailyMetrics({
    required this.date,
    required this.farmersRegistered,
    required this.trainingsCompleted,
    required this.plotsVerified,
  });

  String get formattedDate =>
      DateFormat('E').format(date); // Mon, Tue, Wed, etc.
}
