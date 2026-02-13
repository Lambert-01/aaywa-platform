/// Admin metrics data models for Phase 5
library admin_metrics;

/// Connects to real backend API endpoints

class ExecutiveSummary {
  final ProgramPerformance programPerformance;
  final FinancialOverview financialOverview;
  final OperationalEfficiency operationalEfficiency;
  final RiskIndicators riskIndicators;
  final Trends trends;
  final DateTime timestamp;

  ExecutiveSummary({
    required this.programPerformance,
    required this.financialOverview,
    required this.operationalEfficiency,
    required this.riskIndicators,
    required this.trends,
    required this.timestamp,
  });

  factory ExecutiveSummary.fromJson(Map<String, dynamic> json) {
    return ExecutiveSummary(
      programPerformance:
          ProgramPerformance.fromJson(json['programPerformance']),
      financialOverview: FinancialOverview.fromJson(json['financialOverview']),
      operationalEfficiency:
          OperationalEfficiency.fromJson(json['operationalEfficiency']),
      riskIndicators: RiskIndicators.fromJson(json['riskIndicators']),
      trends: Trends.fromJson(json['trends']),
      timestamp: DateTime.parse(json['timestamp']),
    );
  }
}

class ProgramPerformance {
  final int totalFarmers;
  final int activeFarmers;
  final int totalStaff;
  final int fieldStaff;
  final int trainingCompletionRate;
  final double totalLandHectares;
  final double avgPlotSize;
  final int mappedPlots;

  ProgramPerformance({
    required this.totalFarmers,
    required this.activeFarmers,
    required this.totalStaff,
    required this.fieldStaff,
    required this.trainingCompletionRate,
    required this.totalLandHectares,
    required this.avgPlotSize,
    required this.mappedPlots,
  });

  factory ProgramPerformance.fromJson(Map<String, dynamic> json) {
    return ProgramPerformance(
      totalFarmers: json['totalFarmers'] ?? 0,
      activeFarmers: json['activeFarmers'] ?? 0,
      totalStaff: json['totalStaff'] ?? 0,
      fieldStaff: json['fieldStaff'] ?? 0,
      trainingCompletionRate: json['trainingCompletionRate'] ?? 0,
      totalLandHectares: (json['totalLandHectares'] ?? 0).toDouble(),
      avgPlotSize: (json['avgPlotSize'] ?? 0).toDouble(),
      mappedPlots: json['mappedPlots'] ?? 0,
    );
  }
}

class FinancialOverview {
  final double budgetAllocated;
  final double budgetSpent;
  final double vslaFundTotal;
  final double salesRevenue;
  final double farmerEarnings;
  final double costPerFarmer;

  FinancialOverview({
    required this.budgetAllocated,
    required this.budgetSpent,
    required this.vslaFundTotal,
    required this.salesRevenue,
    required this.farmerEarnings,
    required this.costPerFarmer,
  });

  double get budgetUtilization =>
      budgetAllocated > 0 ? (budgetSpent / budgetAllocated * 100) : 0;

  factory FinancialOverview.fromJson(Map<String, dynamic> json) {
    return FinancialOverview(
      budgetAllocated: (json['budgetAllocated'] ?? 0).toDouble(),
      budgetSpent: (json['budgetSpent'] ?? 0).toDouble(),
      vslaFundTotal: (json['vslaFundTotal'] ?? 0).toDouble(),
      salesRevenue: (json['salesRevenue'] ?? 0).toDouble(),
      farmerEarnings: (json['farmerEarnings'] ?? 0).toDouble(),
      costPerFarmer: (json['costPerFarmer'] ?? 0).toDouble(),
    );
  }
}

class OperationalEfficiency {
  final int fieldVisitsThisMonth;
  final int trainingsDelivered;
  final int avgAttendanceRate;
  final int qualityInspectionPassRate;
  final int resourceUtilization;

  OperationalEfficiency({
    required this.fieldVisitsThisMonth,
    required this.trainingsDelivered,
    required this.avgAttendanceRate,
    required this.qualityInspectionPassRate,
    required this.resourceUtilization,
  });

  factory OperationalEfficiency.fromJson(Map<String, dynamic> json) {
    return OperationalEfficiency(
      fieldVisitsThisMonth: json['fieldVisitsThisMonth'] ?? 0,
      trainingsDelivered: json['trainingsDelivered'] ?? 0,
      avgAttendanceRate: json['avgAttendanceRate'] ?? 0,
      qualityInspectionPassRate: json['qualityInspectionPassRate'] ?? 0,
      resourceUtilization: json['resourceUtilization'] ?? 0,
    );
  }
}

class RiskIndicators {
  final int lowTrustFarmers;
  final int smallPlots;
  final int inactiveFarmers;
  final int pendingSync;
  final int overdueInspections;

  RiskIndicators({
    required this.lowTrustFarmers,
    required this.smallPlots,
    required this.inactiveFarmers,
    required this.pendingSync,
    required this.overdueInspections,
  });

  int get totalRiskItems => lowTrustFarmers + smallPlots + inactiveFarmers;

  factory RiskIndicators.fromJson(Map<String, dynamic> json) {
    return RiskIndicators(
      lowTrustFarmers: json['lowTrustFarmers'] ?? 0,
      smallPlots: json['smallPlots'] ?? 0,
      inactiveFarmers: json['inactiveFarmers'] ?? 0,
      pendingSync: json['pendingSync'] ?? 0,
      overdueInspections: json['overdueInspections'] ?? 0,
    );
  }
}

class Trends {
  final String salesTrend; // 'up' or 'down'
  final String salesChange; // percentage as string
  final String trainingTrend; // 'up' or 'down'
  final int trainingChange; // absolute count

  Trends({
    required this.salesTrend,
    required this.salesChange,
    required this.trainingTrend,
    required this.trainingChange,
  });

  factory Trends.fromJson(Map<String, dynamic> json) {
    return Trends(
      salesTrend: json['salesTrend'] ?? 'stable',
      salesChange: json['salesChange'] ?? '0.0',
      trainingTrend: json['trainingTrend'] ?? 'stable',
      trainingChange: json['trainingChange'] ?? 0,
    );
  }
}

// Analytics Models
class CohortAnalytics {
  final int id;
  final String cohortName;
  final String croppingSystem;
  final int farmerCount;
  final double avgPlotSize;
  final double totalRevenue;
  final double avgRevenuePerSale;
  final int trainingSessions;
  final int avgTrustScore;
  final double vslaSavings;

  CohortAnalytics({
    required this.id,
    required this.cohortName,
    required this.croppingSystem,
    required this.farmerCount,
    required this.avgPlotSize,
    required this.totalRevenue,
    required this.avgRevenuePerSale,
    required this.trainingSessions,
    required this.avgTrustScore,
    required this.vslaSavings,
  });

  factory CohortAnalytics.fromJson(Map<String, dynamic> json) {
    return CohortAnalytics(
      id: json['id'] ?? 0,
      cohortName: json['cohort_name'] ?? '',
      croppingSystem: json['cropping_system'] ?? '',
      farmerCount: json['farmer_count'] ?? 0,
      avgPlotSize: (json['avg_plot_size'] ?? 0).toDouble(),
      totalRevenue: (json['total_revenue'] ?? 0).toDouble(),
      avgRevenuePerSale: (json['avg_revenue_per_sale'] ?? 0).toDouble(),
      trainingSessions: json['training_sessions'] ?? 0,
      avgTrustScore: json['avg_trust_score'] ?? 0,
      vslaSavings: (json['vsla_savings'] ?? 0).toDouble(),
    );
  }
}

class CropAnalytics {
  final String cropType;
  final int saleCount;
  final double totalQuantityKg;
  final double avgPricePerKg;
  final double totalRevenue;
  final double farmerEarnings;

  CropAnalytics({
    required this.cropType,
    required this.saleCount,
    required this.totalQuantityKg,
    required this.avgPricePerKg,
    required this.totalRevenue,
    required this.farmerEarnings,
  });

  factory CropAnalytics.fromJson(Map<String, dynamic> json) {
    return CropAnalytics(
      cropType: json['crop_type'] ?? '',
      saleCount: json['sale_count'] ?? 0,
      totalQuantityKg: (json['total_quantity_kg'] ?? 0).toDouble(),
      avgPricePerKg: (json['avg_price_per_kg'] ?? 0).toDouble(),
      totalRevenue: (json['total_revenue'] ?? 0).toDouble(),
      farmerEarnings: (json['farmer_earnings'] ?? 0).toDouble(),
    );
  }
}

class PeriodAnalytics {
  final String period;
  final int saleCount;
  final double totalRevenue;
  final double farmerEarnings;
  final double avgPrice;

  PeriodAnalytics({
    required this.period,
    required this.saleCount,
    required this.totalRevenue,
    required this.farmerEarnings,
    required this.avgPrice,
  });

  factory PeriodAnalytics.fromJson(Map<String, dynamic> json) {
    return PeriodAnalytics(
      period: json['period'] ?? '',
      saleCount: json['sale_count'] ?? 0,
      totalRevenue: (json['total_revenue'] ?? 0).toDouble(),
      farmerEarnings: (json['farmer_earnings'] ?? 0).toDouble(),
      avgPrice: (json['avg_price'] ?? 0).toDouble(),
    );
  }
}

// System Health Models
class SystemHealth {
  final DataQualityMetrics dataQuality;
  final UserActivityMetrics userActivity;
  final DatabaseMetrics database;
  final DateTime timestamp;

  SystemHealth({
    required this.dataQuality,
    required this.userActivity,
    required this.database,
    required this.timestamp,
  });

  factory SystemHealth.fromJson(Map<String, dynamic> json) {
    return SystemHealth(
      dataQuality: DataQualityMetrics.fromJson(json['dataQuality']),
      userActivity: UserActivityMetrics.fromJson(json['userActivity']),
      database: DatabaseMetrics.fromJson(json['database']),
      timestamp: DateTime.parse(json['timestamp']),
    );
  }
}

class DataQualityMetrics {
  final int completenessScore;
  final MissingDataCounts missingData;
  final int totalRecords;

  DataQualityMetrics({
    required this.completenessScore,
    required this.missingData,
    required this.totalRecords,
  });

  factory DataQualityMetrics.fromJson(Map<String, dynamic> json) {
    return DataQualityMetrics(
      completenessScore: json['completenessScore'] ?? 0,
      missingData: MissingDataCounts.fromJson(json['missingData']),
      totalRecords: json['totalRecords'] ?? 0,
    );
  }
}

class MissingDataCounts {
  final int phone;
  final int location;
  final int plotSize;
  final int cohort;

  MissingDataCounts({
    required this.phone,
    required this.location,
    required this.plotSize,
    required this.cohort,
  });

  factory MissingDataCounts.fromJson(Map<String, dynamic> json) {
    return MissingDataCounts(
      phone: json['phone'] ?? 0,
      location: json['location'] ?? 0,
      plotSize: json['plotSize'] ?? 0,
      cohort: json['cohort'] ?? 0,
    );
  }
}

class UserActivityMetrics {
  final int dailyActive;
  final int weeklyActive;
  final int monthlyActive;
  final int totalUsers;

  UserActivityMetrics({
    required this.dailyActive,
    required this.weeklyActive,
    required this.monthlyActive,
    required this.totalUsers,
  });

  factory UserActivityMetrics.fromJson(Map<String, dynamic> json) {
    return UserActivityMetrics(
      dailyActive: json['dailyActive'] ?? 0,
      weeklyActive: json['weeklyActive'] ?? 0,
      monthlyActive: json['monthlyActive'] ?? 0,
      totalUsers: json['totalUsers'] ?? 0,
    );
  }
}

class DatabaseMetrics {
  final int farmers;
  final int sales;
  final int trainings;
  final int invoices;

  DatabaseMetrics({
    required this.farmers,
    required this.sales,
    required this.trainings,
    required this.invoices,
  });

  int get totalRecords => farmers + sales + trainings + invoices;

  factory DatabaseMetrics.fromJson(Map<String, dynamic> json) {
    return DatabaseMetrics(
      farmers: json['farmers'] ?? 0,
      sales: json['sales'] ?? 0,
      trainings: json['trainings'] ?? 0,
      invoices: json['invoices'] ?? 0,
    );
  }
}

// User Management Models
class AdminUser {
  final int id;
  final String fullName;
  final String email;
  final String? phone;
  final String role;
  final bool isActive;
  final DateTime? lastLogin;
  final DateTime createdAt;
  final int? farmerId;
  final int? cohortId;
  final String? cohortName;

  AdminUser({
    required this.id,
    required this.fullName,
    required this.email,
    this.phone,
    required this.role,
    required this.isActive,
    this.lastLogin,
    required this.createdAt,
    this.farmerId,
    this.cohortId,
    this.cohortName,
  });

  factory AdminUser.fromJson(Map<String, dynamic> json) {
    return AdminUser(
      id: json['id'] ?? 0,
      fullName: json['full_name'] ?? '',
      email: json['email'] ?? '',
      phone: json['phone'],
      role: json['role'] ?? '',
      isActive: json['is_active'] ?? false,
      lastLogin: json['last_login'] != null
          ? DateTime.parse(json['last_login'])
          : null,
      createdAt: DateTime.parse(json['created_at']),
      farmerId: json['farmer_id'],
      cohortId: json['cohort_id'],
      cohortName: json['cohort_name'],
    );
  }
}
