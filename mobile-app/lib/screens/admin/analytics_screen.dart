import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:fl_chart/fl_chart.dart';
import '../../theme/design_system.dart';
import '../../widgets/common/aaywa_card.dart';
import '../../providers/admin_provider.dart';
import '../../providers/auth_provider.dart';

class AnalyticsScreen extends StatefulWidget {
  const AnalyticsScreen({super.key});

  @override
  State<AnalyticsScreen> createState() => _AnalyticsScreenState();
}

class _AnalyticsScreenState extends State<AnalyticsScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  String _selectedPeriod = 'month';

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);

    WidgetsBinding.instance.addPostFrameCallback((_) {
      final authProvider = context.read<AuthProvider>();
      final adminProvider = context.read<AdminProvider>();
      if (authProvider.token != null) {
        adminProvider.setAuthToken(authProvider.token!);
      }
      _loadAllAnalytics();
    });
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _loadAllAnalytics() async {
    final provider = context.read<AdminProvider>();
    await Future.wait([
      provider.loadCohortAnalytics(),
      provider.loadCropAnalytics(),
      provider.loadPeriodAnalytics(groupBy: _selectedPeriod),
    ]);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.backgroundGray,
      appBar: AppBar(
        title: const Text('Analytics & Reports'),
        backgroundColor: AppColors.primaryGreen,
        foregroundColor: Colors.white,
        bottom: TabBar(
          controller: _tabController,
          labelColor: Colors.white,
          unselectedLabelColor: Colors.white70,
          indicatorColor: Colors.white,
          tabs: const [
            Tab(text: 'By Cohort', icon: Icon(Icons.groups, size: 20)),
            Tab(text: 'By Crop', icon: Icon(Icons.agriculture, size: 20)),
            Tab(text: 'By Period', icon: Icon(Icons.timeline, size: 20)),
          ],
        ),
      ),
      body: Consumer<AdminProvider>(
        builder: (context, provider, child) {
          if (provider.isLoading &&
              provider.cohortAnalytics.isEmpty &&
              provider.cropAnalytics.isEmpty &&
              provider.periodAnalytics.isEmpty) {
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
                      'Error loading analytics',
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
                      onPressed: _loadAllAnalytics,
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

          return RefreshIndicator(
            onRefresh: _loadAllAnalytics,
            child: TabBarView(
              controller: _tabController,
              children: [
                _CohortAnalyticsTab(cohortData: provider.cohortAnalytics),
                _CropAnalyticsTab(cropData: provider.cropAnalytics),
                _PeriodAnalyticsTab(
                  periodData: provider.periodAnalytics,
                  selectedPeriod: _selectedPeriod,
                  onPeriodChanged: (period) {
                    setState(() => _selectedPeriod = period);
                    provider.loadPeriodAnalytics(groupBy: period);
                  },
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}

// Cohort Analytics Tab
class _CohortAnalyticsTab extends StatelessWidget {
  final List cohortData;

  const _CohortAnalyticsTab({required this.cohortData});

  @override
  Widget build(BuildContext context) {
    if (cohortData.isEmpty) {
      return const Center(
        child: Text('No cohort data available'),
      );
    }

    return ListView(
      padding: const EdgeInsets.all(AppSpacing.lg),
      children: [
        const Text(
          'COHORT PERFORMANCE COMPARISON',
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.bold,
            color: AppColors.textMedium,
            letterSpacing: 1.2,
          ),
        ),
        const SizedBox(height: AppSpacing.md),

        // Revenue Comparison Chart
        AaywaCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Total Revenue by Cohort',
                style: AppTypography.bodyMedium
                    .copyWith(fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: AppSpacing.lg),
              SizedBox(
                height: 250,
                child: BarChart(
                  BarChartData(
                    alignment: BarChartAlignment.spaceAround,
                    maxY: cohortData
                            .map((c) => c.totalRevenue)
                            .reduce((a, b) => a > b ? a : b) *
                        1.2,
                    barGroups: cohortData.asMap().entries.map((entry) {
                      return BarChartGroupData(
                        x: entry.key,
                        barRods: [
                          BarChartRodData(
                            toY: entry.value.totalRevenue,
                            color: AppColors.primaryGreen,
                            width: 16,
                            borderRadius: const BorderRadius.vertical(
                                top: Radius.circular(4)),
                          ),
                        ],
                      );
                    }).toList(),
                    titlesData: FlTitlesData(
                      leftTitles: AxisTitles(
                        sideTitles: SideTitles(
                          showTitles: true,
                          reservedSize: 40,
                          getTitlesWidget: (value, meta) {
                            return Text(
                              '${(value / 1000).toStringAsFixed(0)}k',
                              style: const TextStyle(fontSize: 10),
                            );
                          },
                        ),
                      ),
                      bottomTitles: AxisTitles(
                        sideTitles: SideTitles(
                          showTitles: true,
                          getTitlesWidget: (value, meta) {
                            if (value.toInt() < cohortData.length) {
                              return Padding(
                                padding: const EdgeInsets.only(top: 8),
                                child: Text(
                                  cohortData[value.toInt()].cohortName,
                                  style: const TextStyle(fontSize: 10),
                                  maxLines: 2,
                                  textAlign: TextAlign.center,
                                ),
                              );
                            }
                            return const SizedBox();
                          },
                        ),
                      ),
                      topTitles: const AxisTitles(
                          sideTitles: SideTitles(showTitles: false)),
                      rightTitles: const AxisTitles(
                          sideTitles: SideTitles(showTitles: false)),
                    ),
                    gridData: FlGridData(
                      show: true,
                      drawVerticalLine: false,
                      horizontalInterval: 50000,
                    ),
                    borderData: FlBorderData(show: false),
                  ),
                ),
              ),
            ],
          ),
        ),

        const SizedBox(height: AppSpacing.lg),

        // Cohort Details Cards
        const Text(
          'COHORT DETAILS',
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.bold,
            color: AppColors.textMedium,
            letterSpacing: 1.2,
          ),
        ),
        const SizedBox(height: AppSpacing.sm),

        ...cohortData.map((cohort) => Padding(
              padding: const EdgeInsets.only(bottom: AppSpacing.md),
              child: AaywaCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Text(
                            cohort.cohortName,
                            style: AppTypography.bodyLarge
                                .copyWith(fontWeight: FontWeight.bold),
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 12, vertical: 4),
                          decoration: BoxDecoration(
                            color:
                                AppColors.primaryGreen.withValues(alpha: 0.1),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Text(
                            cohort.croppingSystem.toUpperCase(),
                            style: AppTypography.caption.copyWith(
                              color: AppColors.primaryGreen,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const Divider(height: 24),
                    Row(
                      children: [
                        Expanded(
                          child: _MetricItem(
                            label: 'Farmers',
                            value: cohort.farmerCount.toString(),
                            icon: Icons.people,
                          ),
                        ),
                        Expanded(
                          child: _MetricItem(
                            label: 'Trainings',
                            value: cohort.trainingSessions.toString(),
                            icon: Icons.school,
                          ),
                        ),
                        Expanded(
                          child: _MetricItem(
                            label: 'Trust Score',
                            value: cohort.avgTrustScore.toString(),
                            icon: Icons.verified,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: AppSpacing.sm),
                    Row(
                      children: [
                        Expanded(
                          child: _MetricItem(
                            label: 'Revenue',
                            value:
                                'RWF ${(cohort.totalRevenue / 1000).toStringAsFixed(0)}k',
                            icon: Icons.payments,
                          ),
                        ),
                        Expanded(
                          child: _MetricItem(
                            label: 'VSLA Savings',
                            value:
                                'RWF ${(cohort.vslaSavings / 1000).toStringAsFixed(0)}k',
                            icon: Icons.savings,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            )),
      ],
    );
  }
}

// Crop Analytics Tab
class _CropAnalyticsTab extends StatelessWidget {
  final List cropData;

  const _CropAnalyticsTab({required this.cropData});

  @override
  Widget build(BuildContext context) {
    if (cropData.isEmpty) {
      return const Center(
        child: Text('No crop data available'),
      );
    }

    final totalRevenue =
        cropData.fold(0.0, (sum, crop) => sum + crop.totalRevenue);

    return ListView(
      padding: const EdgeInsets.all(AppSpacing.lg),
      children: [
        const Text(
          'CROP TYPE PERFORMANCE',
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.bold,
            color: AppColors.textMedium,
            letterSpacing: 1.2,
          ),
        ),
        const SizedBox(height: AppSpacing.md),

        // Pie Chart - Revenue Distribution
        AaywaCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Revenue Distribution by Crop',
                style: AppTypography.bodyMedium
                    .copyWith(fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: AppSpacing.lg),
              SizedBox(
                height: 200,
                child: PieChart(
                  PieChartData(
                    sections: cropData.asMap().entries.map((entry) {
                      final crop = entry.value;
                      final percentage =
                          (crop.totalRevenue / totalRevenue * 100);
                      final colors = [
                        AppColors.primaryGreen,
                        const Color(0xFF10B981),
                        const Color(0xFF6366F1),
                        const Color(0xFFF59E0B),
                        const Color(0xFFEF4444),
                      ];

                      return PieChartSectionData(
                        value: crop.totalRevenue,
                        title: '${percentage.toStringAsFixed(0)}%',
                        color: colors[entry.key % colors.length],
                        radius: 80,
                        titleStyle: const TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      );
                    }).toList(),
                    centerSpaceRadius: 40,
                    sectionsSpace: 2,
                  ),
                ),
              ),
              const SizedBox(height: AppSpacing.md),
              // Legend
              Wrap(
                spacing: AppSpacing.md,
                runSpacing: 8,
                children: cropData.asMap().entries.map((entry) {
                  final colors = [
                    AppColors.primaryGreen,
                    const Color(0xFF10B981),
                    const Color(0xFF6366F1),
                    const Color(0xFFF59E0B),
                    const Color(0xFFEF4444),
                  ];
                  return Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Container(
                        width: 12,
                        height: 12,
                        decoration: BoxDecoration(
                          color: colors[entry.key % colors.length],
                          borderRadius: BorderRadius.circular(2),
                        ),
                      ),
                      const SizedBox(width: 4),
                      Text(
                        entry.value.cropType,
                        style: AppTypography.caption,
                      ),
                    ],
                  );
                }).toList(),
              ),
            ],
          ),
        ),

        const SizedBox(height: AppSpacing.lg),

        // Crop Details
        const Text(
          'CROP DETAILS',
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.bold,
            color: AppColors.textMedium,
            letterSpacing: 1.2,
          ),
        ),
        const SizedBox(height: AppSpacing.sm),

        ...cropData.map((crop) => Padding(
              padding: const EdgeInsets.only(bottom: AppSpacing.md),
              child: AaywaCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      crop.cropType.toUpperCase(),
                      style: AppTypography.h3.copyWith(
                        fontWeight: FontWeight.bold,
                        color: AppColors.primaryGreen,
                      ),
                    ),
                    const Divider(height: 24),
                    Row(
                      children: [
                        Expanded(
                          child: _MetricItem(
                            label: 'Sales',
                            value: crop.saleCount.toString(),
                            icon: Icons.shopping_cart,
                          ),
                        ),
                        Expanded(
                          child: _MetricItem(
                            label: 'Quantity',
                            value:
                                '${crop.totalQuantityKg.toStringAsFixed(0)} kg',
                            icon: Icons.scale,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: AppSpacing.sm),
                    Row(
                      children: [
                        Expanded(
                          child: _MetricItem(
                            label: 'Avg Price',
                            value:
                                'RWF ${crop.avgPricePerKg.toStringAsFixed(0)}/kg',
                            icon: Icons.attach_money,
                          ),
                        ),
                        Expanded(
                          child: _MetricItem(
                            label: 'Revenue',
                            value:
                                'RWF ${(crop.totalRevenue / 1000).toStringAsFixed(0)}k',
                            icon: Icons.payments,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            )),
      ],
    );
  }
}

// Period Analytics Tab
class _PeriodAnalyticsTab extends StatelessWidget {
  final List periodData;
  final String selectedPeriod;
  final Function(String) onPeriodChanged;

  const _PeriodAnalyticsTab({
    required this.periodData,
    required this.selectedPeriod,
    required this.onPeriodChanged,
  });

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(AppSpacing.lg),
      children: [
        // Period Selector
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text(
              'TIME PERIOD',
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.bold,
                color: AppColors.textMedium,
                letterSpacing: 1.2,
              ),
            ),
            SegmentedButton<String>(
              segments: const [
                ButtonSegment(
                    value: 'day',
                    label: Text('Day', style: TextStyle(fontSize: 11))),
                ButtonSegment(
                    value: 'week',
                    label: Text('Week', style: TextStyle(fontSize: 11))),
                ButtonSegment(
                    value: 'month',
                    label: Text('Month', style: TextStyle(fontSize: 11))),
              ],
              selected: {selectedPeriod},
              onSelectionChanged: (Set<String> selection) {
                onPeriodChanged(selection.first);
              },
              style: ButtonStyle(
                backgroundColor: WidgetStateProperty.resolveWith((states) {
                  if (states.contains(WidgetState.selected)) {
                    return AppColors.primaryGreen;
                  }
                  return Colors.grey.shade200;
                }),
                foregroundColor: WidgetStateProperty.resolveWith((states) {
                  if (states.contains(WidgetState.selected)) {
                    return Colors.white;
                  }
                  return Colors.black87;
                }),
              ),
            ),
          ],
        ),

        const SizedBox(height: AppSpacing.lg),

        if (periodData.isEmpty)
          const Center(
              child: Padding(
            padding: EdgeInsets.all(AppSpacing.xl),
            child: Text('No period data available'),
          ))
        else ...[
          // Line Chart - Revenue Trend
          AaywaCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Revenue Trend Over Time',
                  style: AppTypography.bodyMedium
                      .copyWith(fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: AppSpacing.lg),
                SizedBox(
                  height: 250,
                  child: LineChart(
                    LineChartData(
                      gridData: FlGridData(
                        show: true,
                        drawVerticalLine: false,
                      ),
                      titlesData: FlTitlesData(
                        leftTitles: AxisTitles(
                          sideTitles: SideTitles(
                            showTitles: true,
                            reservedSize: 40,
                            getTitlesWidget: (value, meta) {
                              return Text(
                                '${(value / 1000).toStringAsFixed(0)}k',
                                style: const TextStyle(fontSize: 10),
                              );
                            },
                          ),
                        ),
                        bottomTitles: AxisTitles(
                          sideTitles: SideTitles(
                            showTitles: true,
                            interval: (periodData.length / 6).ceilToDouble(),
                            getTitlesWidget: (value, meta) {
                              final index = value.toInt();
                              if (index >= 0 && index < periodData.length) {
                                return Padding(
                                  padding: const EdgeInsets.only(top: 8),
                                  child: Text(
                                    periodData[index]
                                        .period
                                        .toString()
                                        .substring(0, 7), // Show partial date
                                    style: const TextStyle(fontSize: 9),
                                  ),
                                );
                              }
                              return const SizedBox();
                            },
                          ),
                        ),
                        topTitles: const AxisTitles(
                            sideTitles: SideTitles(showTitles: false)),
                        rightTitles: const AxisTitles(
                            sideTitles: SideTitles(showTitles: false)),
                      ),
                      borderData: FlBorderData(show: false),
                      lineBarsData: [
                        LineChartBarData(
                          spots: periodData.asMap().entries.map((entry) {
                            return FlSpot(
                              entry.key.toDouble(),
                              entry.value.totalRevenue,
                            );
                          }).toList(),
                          isCurved: true,
                          color: AppColors.primaryGreen,
                          barWidth: 3,
                          dotData: const FlDotData(show: true),
                          belowBarData: BarAreaData(
                            show: true,
                            color:
                                AppColors.primaryGreen.withValues(alpha: 0.1),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: AppSpacing.lg),

          // Period Details
          const Text(
            'PERIOD BREAKDOWN',
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.bold,
              color: AppColors.textMedium,
              letterSpacing: 1.2,
            ),
          ),
          const SizedBox(height: AppSpacing.sm),

          ...periodData.take(10).map((period) => Padding(
                padding: const EdgeInsets.only(bottom: AppSpacing.sm),
                child: AaywaCard(
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            period.period,
                            style: AppTypography.bodyMedium
                                .copyWith(fontWeight: FontWeight.bold),
                          ),
                          Text(
                            '${period.saleCount} sales',
                            style: AppTypography.caption
                                .copyWith(color: AppColors.textMedium),
                          ),
                        ],
                      ),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          Text(
                            'RWF ${(period.totalRevenue / 1000).toStringAsFixed(1)}k',
                            style: AppTypography.bodyMedium.copyWith(
                              fontWeight: FontWeight.bold,
                              color: AppColors.primaryGreen,
                            ),
                          ),
                          Text(
                            'Avg: RWF ${period.avgPrice.toStringAsFixed(0)}/kg',
                            style: AppTypography.caption
                                .copyWith(color: AppColors.textMedium),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              )),
        ],
      ],
    );
  }
}

// Metric Item Widget
class _MetricItem extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;

  const _MetricItem({
    required this.label,
    required this.value,
    required this.icon,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Icon(icon, size: 14, color: AppColors.textMedium),
            const SizedBox(width: 4),
            Text(
              label,
              style:
                  AppTypography.caption.copyWith(color: AppColors.textMedium),
            ),
          ],
        ),
        const SizedBox(height: 2),
        Text(
          value,
          style: AppTypography.bodyMedium.copyWith(fontWeight: FontWeight.bold),
        ),
      ],
    );
  }
}
