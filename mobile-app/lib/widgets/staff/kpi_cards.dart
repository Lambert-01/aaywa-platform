import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import '../../theme/design_system.dart';
import '../../providers/staff_kpi_provider.dart';

/// Widget displaying today's KPI performance summary
class TodayKPICard extends StatelessWidget {
  final StaffKPIMetrics metrics;

  const TodayKPICard({
    super.key,
    required this.metrics,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppRadius.lg),
      ),
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.lg),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(
                  Icons.analytics_outlined,
                  color: AppColors.primaryGreen,
                  size: 24,
                ),
                const SizedBox(width: AppSpacing.sm),
                Text(
                  'TODAY\'S PERFORMANCE',
                  style: AppTypography.overline.copyWith(
                    color: AppColors.textDark,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.lg),

            // KPI Grid
            Row(
              children: [
                Expanded(
                  child: _KPIItem(
                    icon: Icons.person_add,
                    label: 'Farmers Registered',
                    value: metrics.farmersRegistered,
                    target: metrics.farmersRegisteredTarget,
                    progress: metrics.registrationProgress,
                    color: const Color(0xFF6366F1),
                  ),
                ),
                const SizedBox(width: AppSpacing.md),
                Expanded(
                  child: _KPIItem(
                    icon: Icons.school,
                    label: 'Trainings',
                    value: metrics.trainingsCompleted,
                    target: metrics.trainingsCompletedTarget,
                    progress: metrics.trainingProgress,
                    color: const Color(0xFF10B981),
                  ),
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.md),
            Row(
              children: [
                Expanded(
                  child: _KPIItem(
                    icon: Icons.location_on,
                    label: 'Plots Verified',
                    value: metrics.plotsVerified,
                    target: metrics.plotsVerifiedTarget,
                    progress: metrics.verificationProgress,
                    color: const Color(0xFFF59E0B),
                  ),
                ),
                const SizedBox(width: AppSpacing.md),
                Expanded(
                  child: _KPIItem(
                    icon: Icons.schedule,
                    label: 'Hours Worked',
                    value: metrics.hoursWorked.toInt(),
                    target: metrics.hoursWorkedTarget.toInt(),
                    progress: metrics.hoursProgress,
                    color: const Color(0xFFEC4899),
                    valueFormat: '${metrics.hoursWorked.toStringAsFixed(1)}h',
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _KPIItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final int value;
  final int target;
  final double progress;
  final Color color;
  final String? valueFormat;

  const _KPIItem({
    required this.icon,
    required this.label,
    required this.value,
    required this.target,
    required this.progress,
    required this.color,
    this.valueFormat,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.md),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(AppRadius.md),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: color, size: 20),
          const SizedBox(height: AppSpacing.sm),
          Text(
            valueFormat ?? '$value',
            style: AppTypography.h3.copyWith(
              fontWeight: FontWeight.bold,
              color: color,
            ),
          ),
          Text(
            '/ $target',
            style: AppTypography.bodySmall.copyWith(
              color: AppColors.textMedium,
            ),
          ),
          const SizedBox(height: AppSpacing.xs),
          ClipRRect(
            borderRadius: BorderRadius.circular(AppRadius.full),
            child: LinearProgressIndicator(
              value: progress.clamp(0.0, 1.0),
              minHeight: 4,
              backgroundColor: Colors.white,
              valueColor: AlwaysStoppedAnimation<Color>(color),
            ),
          ),
          const SizedBox(height: AppSpacing.xs),
          Text(
            label,
            style: AppTypography.caption.copyWith(
              color: AppColors.textMedium,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }
}

/// Widget displaying weekly performance trends
class WeeklyTrendsCard extends StatelessWidget {
  final List<DailyMetrics> weeklyMetrics;

  const WeeklyTrendsCard({
    super.key,
    required this.weeklyMetrics,
  });

  @override
  Widget build(BuildContext context) {
    if (weeklyMetrics.isEmpty) {
      return const SizedBox.shrink();
    }

    // Find best performing day
    final bestDay = weeklyMetrics.reduce((a, b) {
      final aTotal =
          a.farmersRegistered + a.trainingsCompleted + a.plotsVerified;
      final bTotal =
          b.farmersRegistered + b.trainingsCompleted + b.plotsVerified;
      return aTotal > bTotal ? a : b;
    });

    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppRadius.lg),
      ),
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.lg),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    const Icon(
                      Icons.trending_up,
                      color: AppColors.primaryGreen,
                      size: 24,
                    ),
                    const SizedBox(width: AppSpacing.sm),
                    Text(
                      'WEEKLY TRENDS',
                      style: AppTypography.overline.copyWith(
                        color: AppColors.textDark,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: AppSpacing.sm,
                    vertical: AppSpacing.xs,
                  ),
                  decoration: BoxDecoration(
                    color: AppColors.primaryGreen.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(AppRadius.sm),
                  ),
                  child: Row(
                    children: [
                      const Icon(
                        Icons.star,
                        size: 14,
                        color: AppColors.primaryGreen,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        'Best: ${bestDay.formattedDate}',
                        style: AppTypography.caption.copyWith(
                          color: AppColors.primaryGreen,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.lg),

            // Mini bar chart
            SizedBox(
              height: 120,
              child: BarChart(
                BarChartData(
                  alignment: BarChartAlignment.spaceAround,
                  maxY: _getMaxValue().toDouble() * 1.2,
                  barTouchData: BarTouchData(enabled: false),
                  titlesData: FlTitlesData(
                    show: true,
                    bottomTitles: AxisTitles(
                      sideTitles: SideTitles(
                        showTitles: true,
                        getTitlesWidget: (value, meta) {
                          if (value.toInt() >= 0 &&
                              value.toInt() < weeklyMetrics.length) {
                            return Padding(
                              padding: const EdgeInsets.only(top: 8.0),
                              child: Text(
                                weeklyMetrics[value.toInt()].formattedDate,
                                style: AppTypography.caption.copyWith(
                                  color: AppColors.textMedium,
                                ),
                              ),
                            );
                          }
                          return const Text('');
                        },
                      ),
                    ),
                    leftTitles: const AxisTitles(
                      sideTitles: SideTitles(showTitles: false),
                    ),
                    topTitles: const AxisTitles(
                      sideTitles: SideTitles(showTitles: false),
                    ),
                    rightTitles: const AxisTitles(
                      sideTitles: SideTitles(showTitles: false),
                    ),
                  ),
                  gridData: const FlGridData(show: false),
                  borderData: FlBorderData(show: false),
                  barGroups: _createBarGroups(),
                ),
              ),
            ),
            const SizedBox(height: AppSpacing.md),

            // Legend
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: const [
                _LegendItem(
                  color: Color(0xFF6366F1),
                  label: 'Registered',
                ),
                SizedBox(width: AppSpacing.lg),
                _LegendItem(
                  color: Color(0xFF10B981),
                  label: 'Trainings',
                ),
                SizedBox(width: AppSpacing.lg),
                _LegendItem(
                  color: Color(0xFFF59E0B),
                  label: 'Verified',
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  List<BarChartGroupData> _createBarGroups() {
    return weeklyMetrics.asMap().entries.map((entry) {
      final index = entry.key;
      final metrics = entry.value;

      return BarChartGroupData(
        x: index,
        barRods: [
          BarChartRodData(
            toY: (metrics.farmersRegistered +
                    metrics.trainingsCompleted +
                    metrics.plotsVerified)
                .toDouble(),
            width: 16,
            borderRadius: BorderRadius.circular(4),
            rodStackItems: [
              BarChartRodStackItem(
                0,
                metrics.farmersRegistered.toDouble(),
                const Color(0xFF6366F1),
              ),
              BarChartRodStackItem(
                metrics.farmersRegistered.toDouble(),
                (metrics.farmersRegistered + metrics.trainingsCompleted)
                    .toDouble(),
                const Color(0xFF10B981),
              ),
              BarChartRodStackItem(
                (metrics.farmersRegistered + metrics.trainingsCompleted)
                    .toDouble(),
                (metrics.farmersRegistered +
                        metrics.trainingsCompleted +
                        metrics.plotsVerified)
                    .toDouble(),
                const Color(0xFFF59E0B),
              ),
            ],
          ),
        ],
      );
    }).toList();
  }

  int _getMaxValue() {
    return weeklyMetrics
        .map(
            (m) => m.farmersRegistered + m.trainingsCompleted + m.plotsVerified)
        .reduce((a, b) => a > b ? a : b);
  }
}

class _LegendItem extends StatelessWidget {
  final Color color;
  final String label;

  const _LegendItem({
    required this.color,
    required this.label,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(
          width: 12,
          height: 12,
          decoration: BoxDecoration(
            color: color,
            borderRadius: BorderRadius.circular(2),
          ),
        ),
        const SizedBox(width: 4),
        Text(
          label,
          style: AppTypography.caption.copyWith(
            color: AppColors.textMedium,
          ),
        ),
      ],
    );
  }
}

/// Widget displaying resource tracking
class ResourceTrackingCard extends StatelessWidget {
  final int materialsDistributed;
  final int inputsAllocated;
  final int farmerVisits;

  const ResourceTrackingCard({
    super.key,
    required this.materialsDistributed,
    required this.inputsAllocated,
    required this.farmerVisits,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppRadius.lg),
      ),
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.lg),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(
                  Icons.inventory_2_outlined,
                  color: AppColors.primaryGreen,
                  size: 24,
                ),
                const SizedBox(width: AppSpacing.sm),
                Text(
                  'RESOURCE TRACKING',
                  style: AppTypography.overline.copyWith(
                    color: AppColors.textDark,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.md),
            _ResourceItem(
              icon: Icons.book,
              label: 'Training Materials Distributed',
              value: materialsDistributed,
              color: const Color(0xFF8B5CF6),
            ),
            const SizedBox(height: AppSpacing.sm),
            _ResourceItem(
              icon: Icons.agriculture,
              label: 'Input Supplies Allocated',
              value: inputsAllocated,
              color: const Color(0xFF06B6D4),
            ),
            const SizedBox(height: AppSpacing.sm),
            _ResourceItem(
              icon: Icons.location_on,
              label: 'Farmer Visits Logged',
              value: farmerVisits,
              color: const Color(0xFFEF4444),
            ),
          ],
        ),
      ),
    );
  }
}

class _ResourceItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final int value;
  final Color color;

  const _ResourceItem({
    required this.icon,
    required this.label,
    required this.value,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: color.withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(AppRadius.sm),
          ),
          child: Icon(icon, color: color, size: 20),
        ),
        const SizedBox(width: AppSpacing.md),
        Expanded(
          child: Text(
            label,
            style: AppTypography.bodySmall.copyWith(
              color: AppColors.textDark,
            ),
          ),
        ),
        Text(
          '$value',
          style: AppTypography.h4.copyWith(
            fontWeight: FontWeight.bold,
            color: color,
          ),
        ),
      ],
    );
  }
}
