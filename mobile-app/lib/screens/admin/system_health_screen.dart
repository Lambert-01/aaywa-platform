import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../theme/design_system.dart';
import '../../widgets/common/aaywa_card.dart';
import '../../providers/admin_provider.dart';
import '../../models/admin_metrics.dart';
import '../../providers/auth_provider.dart';

class SystemHealthScreen extends StatefulWidget {
  const SystemHealthScreen({super.key});

  @override
  State<SystemHealthScreen> createState() => _SystemHealthScreenState();
}

class _SystemHealthScreenState extends State<SystemHealthScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final authProvider = context.read<AuthProvider>();
      final adminProvider = context.read<AdminProvider>();
      if (authProvider.token != null) {
        adminProvider.setAuthToken(authProvider.token!);
      }
      adminProvider.loadSystemHealth();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.backgroundGray,
      appBar: AppBar(
        title: const Text('System Health'),
        backgroundColor: AppColors.primaryGreen,
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => context.read<AdminProvider>().loadSystemHealth(),
          ),
        ],
      ),
      body: Consumer<AdminProvider>(
        builder: (context, provider, child) {
          if (provider.isLoading && provider.systemHealth == null) {
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
                      'Error loading system health',
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
                      onPressed: () => provider.loadSystemHealth(),
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

          final health = provider.systemHealth;
          if (health == null) {
            return const Center(child: Text('No system health data available'));
          }

          return RefreshIndicator(
            onRefresh: () => provider.loadSystemHealth(),
            child: ListView(
              padding: const EdgeInsets.all(AppSpacing.lg),
              children: [
                // Data Quality Section
                const Text(
                  'DATA QUALITY',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    color: AppColors.textMedium,
                    letterSpacing: 1.2,
                  ),
                ),
                const SizedBox(height: AppSpacing.sm),

                _DataQualityCard(dataQuality: health.dataQuality),

                const SizedBox(height: AppSpacing.xl),

                // User Activity Section
                const Text(
                  'USER ACTIVITY',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    color: AppColors.textMedium,
                    letterSpacing: 1.2,
                  ),
                ),
                const SizedBox(height: AppSpacing.sm),

                AaywaCard(
                  child: Column(
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: _ActivityMetric(
                              icon: Icons.today,
                              label: 'Daily Active',
                              value: health.userActivity.dailyActive.toString(),
                              color: const Color(0xFF10B981),
                            ),
                          ),
                          const SizedBox(width: AppSpacing.md),
                          Expanded(
                            child: _ActivityMetric(
                              icon: Icons.view_week,
                              label: 'Weekly Active',
                              value:
                                  health.userActivity.weeklyActive.toString(),
                              color: const Color(0xFF6366F1),
                            ),
                          ),
                        ],
                      ),
                      const Divider(height: 32),
                      Row(
                        children: [
                          Expanded(
                            child: _ActivityMetric(
                              icon: Icons.calendar_month,
                              label: 'Monthly Active',
                              value:
                                  health.userActivity.monthlyActive.toString(),
                              color: const Color(0xFFF59E0B),
                            ),
                          ),
                          const SizedBox(width: AppSpacing.md),
                          Expanded(
                            child: _ActivityMetric(
                              icon: Icons.people,
                              label: 'Total Users',
                              value: health.userActivity.totalUsers.toString(),
                              color: AppColors.primaryGreen,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: AppSpacing.xl),

                // Database Statistics Section
                const Text(
                  'DATABASE STATISTICS',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    color: AppColors.textMedium,
                    letterSpacing: 1.2,
                  ),
                ),
                const SizedBox(height: AppSpacing.sm),

                AaywaCard(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Total Records: ${health.database.totalRecords}',
                        style: AppTypography.h3.copyWith(
                          fontWeight: FontWeight.bold,
                          color: AppColors.primaryGreen,
                        ),
                      ),
                      const Divider(height: 24),
                      _DatabaseItem(
                        icon: Icons.people,
                        label: 'Farmers',
                        count: health.database.farmers,
                      ),
                      const SizedBox(height: AppSpacing.md),
                      _DatabaseItem(
                        icon: Icons.shopping_cart,
                        label: 'Sales',
                        count: health.database.sales,
                      ),
                      const SizedBox(height: AppSpacing.md),
                      _DatabaseItem(
                        icon: Icons.school,
                        label: 'Training Sessions',
                        count: health.database.trainings,
                      ),
                      const SizedBox(height: AppSpacing.md),
                      _DatabaseItem(
                        icon: Icons.receipt,
                        label: 'Input Invoices',
                        count: health.database.invoices,
                      ),
                    ],
                  ),
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

// Data Quality Card
class _DataQualityCard extends StatelessWidget {
  final DataQualityMetrics dataQuality;

  const _DataQualityCard({required this.dataQuality});

  @override
  Widget build(BuildContext context) {
    final score = dataQuality.completenessScore;
    final color = score >= 90
        ? const Color(0xFF10B981)
        : score >= 70
            ? const Color(0xFFF59E0B)
            : const Color(0xFFEF4444);

    return AaywaCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Completeness Score',
                style: AppTypography.bodyLarge
                    .copyWith(fontWeight: FontWeight.bold),
              ),
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: color.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: color),
                ),
                child: Row(
                  children: [
                    Icon(Icons.verified, size: 16, color: color),
                    const SizedBox(width: 4),
                    Text(
                      '$score%',
                      style: AppTypography.bodyMedium.copyWith(
                        fontWeight: FontWeight.bold,
                        color: color,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.md),
          LinearProgressIndicator(
            value: score / 100,
            backgroundColor: AppColors.divider,
            valueColor: AlwaysStoppedAnimation<Color>(color),
            minHeight: 8,
            borderRadius: BorderRadius.circular(4),
          ),
          if (dataQuality.missingData.phone > 0 ||
              dataQuality.missingData.location > 0 ||
              dataQuality.missingData.plotSize > 0 ||
              dataQuality.missingData.cohort > 0) ...[
            const Divider(height: 32),
            Text(
              'Missing Data',
              style: AppTypography.bodyMedium
                  .copyWith(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: AppSpacing.sm),
            if (dataQuality.missingData.phone > 0)
              _MissingDataItem(
                icon: Icons.phone,
                label: 'Phone Numbers',
                count: dataQuality.missingData.phone,
              ),
            if (dataQuality.missingData.location > 0)
              _MissingDataItem(
                icon: Icons.location_on,
                label: 'GPS Locations',
                count: dataQuality.missingData.location,
              ),
            if (dataQuality.missingData.plotSize > 0)
              _MissingDataItem(
                icon: Icons.landscape,
                label: 'Plot Sizes',
                count: dataQuality.missingData.plotSize,
              ),
            if (dataQuality.missingData.cohort > 0)
              _MissingDataItem(
                icon: Icons.groups,
                label: 'Cohort Assignment',
                count: dataQuality.missingData.cohort,
              ),
          ],
        ],
      ),
    );
  }
}

class _MissingDataItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final int count;

  const _MissingDataItem({
    required this.icon,
    required this.label,
    required this.count,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(top: 8),
      child: Row(
        children: [
          Icon(icon, size: 18, color: const Color(0xFFF59E0B)),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              label,
              style: AppTypography.bodySmall,
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
            decoration: BoxDecoration(
              color: const Color(0xFFF59E0B).withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Text(
              count.toString(),
              style: AppTypography.caption.copyWith(
                fontWeight: FontWeight.bold,
                color: const Color(0xFFF59E0B),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// Activity Metric Widget
class _ActivityMetric extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  final Color color;

  const _ActivityMetric({
    required this.icon,
    required this.label,
    required this.value,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Icon(icon, color: color, size: 32),
        const SizedBox(height: 8),
        Text(
          value,
          style: AppTypography.h2.copyWith(
            fontWeight: FontWeight.bold,
            color: color,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          label,
          style: AppTypography.caption.copyWith(color: AppColors.textMedium),
          textAlign: TextAlign.center,
        ),
      ],
    );
  }
}

// Database Item Widget
class _DatabaseItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final int count;

  const _DatabaseItem({
    required this.icon,
    required this.label,
    required this.count,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: AppColors.primaryGreen.withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Icon(icon, size: 20, color: AppColors.primaryGreen),
        ),
        const SizedBox(width: AppSpacing.md),
        Expanded(
          child: Text(
            label,
            style: AppTypography.bodyMedium,
          ),
        ),
        Text(
          count.toString(),
          style: AppTypography.h3.copyWith(
            fontWeight: FontWeight.bold,
            color: AppColors.primaryGreen,
          ),
        ),
      ],
    );
  }
}
