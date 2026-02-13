import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../theme/design_system.dart';
import '../../widgets/common/aaywa_card.dart';
import '../../providers/admin_provider.dart';
import '../../providers/auth_provider.dart';
import '../../models/admin_metrics.dart';

class ExecutiveDashboardScreen extends StatefulWidget {
  const ExecutiveDashboardScreen({super.key});

  @override
  State<ExecutiveDashboardScreen> createState() =>
      _ExecutiveDashboardScreenState();
}

class _ExecutiveDashboardScreenState extends State<ExecutiveDashboardScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      // Set auth token from auth provider
      final authProvider = context.read<AuthProvider>();
      final adminProvider = context.read<AdminProvider>();
      if (authProvider.token != null) {
        adminProvider.setAuthToken(authProvider.token!);
      }
      adminProvider.loadExecutiveSummary();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.backgroundGray,
      appBar: AppBar(
        title: const Text('Executive Dashboard'),
        backgroundColor: AppColors.primaryGreen,
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () =>
                context.read<AdminProvider>().loadExecutiveSummary(),
          ),
        ],
      ),
      body: Consumer<AdminProvider>(
        builder: (context, provider, child) {
          if (provider.isLoading && provider.executiveSummary == null) {
            return const Center(child: CircularProgressIndicator());
          }

          if (provider.error != null) {
            return Center(
              child: Padding(
                padding: const EdgeInsets.all(AppSpacing.xl),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.error_outline,
                        size: 64, color: Colors.red),
                    const SizedBox(height: AppSpacing.md),
                    Text(
                      'Error loading data',
                      style: AppTypography.h3
                          .copyWith(fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: AppSpacing.sm),
                    Text(
                      provider.error!,
                      textAlign: TextAlign.center,
                      style: AppTypography.bodyMedium
                          .copyWith(color: AppColors.textMedium),
                    ),
                    const SizedBox(height: AppSpacing.lg),
                    ElevatedButton.icon(
                      onPressed: () => provider.loadExecutiveSummary(),
                      icon: const Icon(Icons.refresh),
                      label: const Text('Retry'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primaryGreen,
                        foregroundColor: Colors.white,
                      ),
                    ),
                  ],
                ),
              ),
            );
          }

          final summary = provider.executiveSummary;
          if (summary == null) {
            return const Center(child: Text('No data available'));
          }

          return RefreshIndicator(
            onRefresh: () => provider.loadExecutiveSummary(),
            child: ListView(
              padding: const EdgeInsets.all(AppSpacing.lg),
              children: [
                // Risk Indicators (Top Priority)
                if (summary.riskIndicators.totalRiskItems > 0)
                  _RiskAlert(riskIndicators: summary.riskIndicators),

                const SizedBox(height: AppSpacing.lg),

                // Program Performance Section
                const _SectionHeader(title: 'PROGRAM PERFORMANCE'),
                const SizedBox(height: AppSpacing.sm),
                Row(
                  children: [
                    Expanded(
                      child: _MetricCard(
                        title: 'Active Farmers',
                        value: '${summary.programPerformance.activeFarmers}',
                        subtitle:
                            'of ${summary.programPerformance.totalFarmers} total',
                        icon: Icons.people,
                        color: AppColors.primaryGreen,
                      ),
                    ),
                    const SizedBox(width: AppSpacing.md),
                    Expanded(
                      child: _MetricCard(
                        title: 'Field Staff',
                        value: '${summary.programPerformance.fieldStaff}',
                        subtitle:
                            'of ${summary.programPerformance.totalStaff} staff',
                        icon: Icons.badge,
                        color: const Color(0xFF6366F1),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: AppSpacing.md),
                Row(
                  children: [
                    Expanded(
                      child: _MetricCard(
                        title: 'Land Under Management',
                        value:
                            '${summary.programPerformance.totalLandHectares.toStringAsFixed(1)} ha',
                        subtitle:
                            'Avg: ${summary.programPerformance.avgPlotSize.toStringAsFixed(2)} ha/farmer',
                        icon: Icons.landscape,
                        color: const Color(0xFF10B981),
                      ),
                    ),
                    const SizedBox(width: AppSpacing.md),
                    Expanded(
                      child: _MetricCard(
                        title: 'Training Completion',
                        value:
                            '${summary.programPerformance.trainingCompletionRate}%',
                        subtitle:
                            '${summary.programPerformance.mappedPlots} plots mapped',
                        icon: Icons.school,
                        color: const Color(0xFFF59E0B),
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: AppSpacing.xl),

                // Financial Overview Section
                const _SectionHeader(title: 'FINANCIAL OVERVIEW'),
                const SizedBox(height: AppSpacing.sm),
                _FinancialSummaryCard(financial: summary.financialOverview),

                const SizedBox(height: AppSpacing.xl),

                // Operational Efficiency Section
                const _SectionHeader(title: 'OPERATIONAL EFFICIENCY'),
                const SizedBox(height: AppSpacing.sm),
                Row(
                  children: [
                    Expanded(
                      child: _ProgressMetricCard(
                        title: 'Field Visits',
                        value:
                            summary.operationalEfficiency.fieldVisitsThisMonth,
                        subtitle: 'this month',
                        icon: Icons.location_on,
                      ),
                    ),
                    const SizedBox(width: AppSpacing.md),
                    Expanded(
                      child: _ProgressMetricCard(
                        title: 'Trainings',
                        value: summary.operationalEfficiency.trainingsDelivered,
                        subtitle: 'delivered',
                        icon: Icons.school,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: AppSpacing.md),
                Row(
                  children: [
                    Expanded(
                      child: _ProgressMetricCard(
                        title: 'Attendance',
                        value: summary.operationalEfficiency.avgAttendanceRate,
                        subtitle: 'average rate',
                        isPercentage: true,
                        icon: Icons.people,
                      ),
                    ),
                    const SizedBox(width: AppSpacing.md),
                    Expanded(
                      child: _ProgressMetricCard(
                        title: 'Quality',
                        value: summary
                            .operationalEfficiency.qualityInspectionPassRate,
                        subtitle: 'pass rate',
                        isPercentage: true,
                        icon: Icons.verified,
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: AppSpacing.xl),

                // Trends Section
                const _SectionHeader(title: 'TRENDS (30-DAY)'),
                const SizedBox(height: AppSpacing.sm),
                Row(
                  children: [
                    Expanded(
                      child: _TrendCard(
                        title: 'Sales Revenue',
                        trend: summary.trends.salesTrend,
                        change: summary.trends.salesChange,
                      ),
                    ),
                    const SizedBox(width: AppSpacing.md),
                    Expanded(
                      child: _TrendCard(
                        title: 'Training Sessions',
                        trend: summary.trends.trainingTrend,
                        change: summary.trends.trainingChange.toString(),
                        isCount: true,
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: AppSpacing.xl),
              ],
            ),
          );
        },
      ),
    );
  }
}

// Section Header Widget
class _SectionHeader extends StatelessWidget {
  final String title;

  const _SectionHeader({required this.title});

  @override
  Widget build(BuildContext context) {
    return Text(
      title,
      style: AppTypography.overline.copyWith(
        color: AppColors.textMedium,
        fontWeight: FontWeight.bold,
      ),
    );
  }
}

// Risk Alert Widget
class _RiskAlert extends StatelessWidget {
  final RiskIndicators riskIndicators;

  const _RiskAlert({required this.riskIndicators});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.md),
      decoration: BoxDecoration(
        color: const Color(0xFFEF4444).withValues(alpha: 0.1),
        border: Border.all(color: const Color(0xFFEF4444)),
        borderRadius: BorderRadius.circular(AppRadius.md),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.warning, color: Color(0xFFEF4444), size: 24),
              const SizedBox(width: AppSpacing.sm),
              Text(
                'RISK INDICATORS',
                style: AppTypography.bodyMedium.copyWith(
                  fontWeight: FontWeight.bold,
                  color: const Color(0xFFEF4444),
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.sm),
          if (riskIndicators.lowTrustFarmers > 0)
            _RiskItem(
              icon: Icons.person_off,
              text:
                  '${riskIndicators.lowTrustFarmers} farmers with low trust score',
            ),
          if (riskIndicators.smallPlots > 0)
            _RiskItem(
              icon: Icons.landscape,
              text: '${riskIndicators.smallPlots} plots below minimum area',
            ),
          if (riskIndicators.inactiveFarmers > 0)
            _RiskItem(
              icon: Icons.block,
              text: '${riskIndicators.inactiveFarmers} inactive farmers',
            ),
        ],
      ),
    );
  }
}

class _RiskItem extends StatelessWidget {
  final IconData icon;
  final String text;

  const _RiskItem({required this.icon, required this.text});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(top: 4),
      child: Row(
        children: [
          Icon(icon, size: 16, color: AppColors.textMedium),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              text,
              style:
                  AppTypography.bodySmall.copyWith(color: AppColors.textDark),
            ),
          ),
        ],
      ),
    );
  }
}

// Metric Card Widget
class _MetricCard extends StatelessWidget {
  final String title;
  final String value;
  final String subtitle;
  final IconData icon;
  final Color color;

  const _MetricCard({
    required this.title,
    required this.value,
    required this.subtitle,
    required this.icon,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return AaywaCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: color.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(AppRadius.sm),
                ),
                child: Icon(icon, color: color, size: 20),
              ),
              const SizedBox(width: AppSpacing.sm),
              Expanded(
                child: Text(
                  title,
                  style: AppTypography.caption.copyWith(
                    color: AppColors.textMedium,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.sm),
          Text(
            value,
            style: AppTypography.h2.copyWith(
              fontWeight: FontWeight.bold,
              color: color,
            ),
          ),
          Text(
            subtitle,
            style: AppTypography.caption.copyWith(
              color: AppColors.textMedium,
            ),
          ),
        ],
      ),
    );
  }
}

// Financial Summary Card
class _FinancialSummaryCard extends StatelessWidget {
  final FinancialOverview financial;

  const _FinancialSummaryCard({required this.financial});

  @override
  Widget build(BuildContext context) {
    return AaywaCard(
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              _FinancialItem(
                label: 'Budget',
                value:
                    'RWF ${(financial.budgetAllocated / 1000).toStringAsFixed(0)}k',
                color: const Color(0xFF6366F1),
              ),
              _FinancialItem(
                label: 'Spent',
                value:
                    'RWF ${(financial.budgetSpent / 1000).toStringAsFixed(0)}k',
                color: const Color(0xFFF59E0B),
              ),
              _FinancialItem(
                label: 'Utilization',
                value: '${financial.budgetUtilization.toStringAsFixed(0)}%',
                color: AppColors.primaryGreen,
              ),
            ],
          ),
          const Divider(height: 32),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              _FinancialItem(
                label: 'VSLA Savings',
                value:
                    'RWF ${(financial.vslaFundTotal / 1000).toStringAsFixed(0)}k',
                color: const Color(0xFF10B981),
              ),
              _FinancialItem(
                label: 'Sales Revenue',
                value:
                    'RWF ${(financial.salesRevenue / 1000).toStringAsFixed(0)}k',
                color: AppColors.success,
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _FinancialItem extends StatelessWidget {
  final String label;
  final String value;
  final Color color;

  const _FinancialItem({
    required this.label,
    required this.value,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: AppTypography.caption.copyWith(
            color: AppColors.textMedium,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          value,
          style: AppTypography.bodyMedium.copyWith(
            fontWeight: FontWeight.bold,
            color: color,
          ),
        ),
      ],
    );
  }
}

// Progress Metric Card
class _ProgressMetricCard extends StatelessWidget {
  final String title;
  final int value;
  final String subtitle;
  final IconData icon;
  final bool isPercentage;

  const _ProgressMetricCard({
    required this.title,
    required this.value,
    required this.subtitle,
    required this.icon,
    this.isPercentage = false,
  });

  @override
  Widget build(BuildContext context) {
    final displayValue = isPercentage ? '$value%' : value.toString();
    final progress =
        isPercentage ? (value / 100) : (value / 100).clamp(0.0, 1.0);

    return AaywaCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, size: 20, color: AppColors.primaryGreen),
              const SizedBox(width: 8),
              Text(
                title,
                style: AppTypography.caption.copyWith(
                  color: AppColors.textMedium,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.sm),
          Text(
            displayValue,
            style: AppTypography.h2.copyWith(
              fontWeight: FontWeight.bold,
              color: AppColors.primaryGreen,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            subtitle,
            style: AppTypography.caption.copyWith(
              color: AppColors.textMedium,
            ),
          ),
          const SizedBox(height: AppSpacing.sm),
          LinearProgressIndicator(
            value: progress,
            backgroundColor: AppColors.divider,
            valueColor:
                const AlwaysStoppedAnimation<Color>(AppColors.primaryGreen),
          ),
        ],
      ),
    );
  }
}

// Trend Card
class _TrendCard extends StatelessWidget {
  final String title;
  final String trend; // 'up', 'down', or 'stable'
  final String change;
  final bool isCount;

  const _TrendCard({
    required this.title,
    required this.trend,
    required this.change,
    this.isCount = false,
  });

  @override
  Widget build(BuildContext context) {
    final isUp = trend == 'up';
    final color = isUp ? const Color(0xFF10B981) : const Color(0xFFEF4444);
    final icon = isUp ? Icons.trending_up : Icons.trending_down;

    return AaywaCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: AppTypography.caption.copyWith(
              color: AppColors.textMedium,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: AppSpacing.sm),
          Row(
            children: [
              Icon(icon, color: color, size: 32),
              const SizedBox(width: 8),
              Text(
                isCount ? change : '$change%',
                style: AppTypography.h3.copyWith(
                  fontWeight: FontWeight.bold,
                  color: color,
                ),
              ),
            ],
          ),
          const SizedBox(height: 4),
          Text(
            isUp ? 'Increase' : 'Decrease',
            style: AppTypography.caption.copyWith(
              color: color,
            ),
          ),
        ],
      ),
    );
  }
}
