import 'package:flutter/material.dart';
import '../../providers/auth_provider.dart';
import '../../providers/dashboard_provider.dart';
import '../../theme/design_system.dart';
import '../kpi_metric_card.dart';

class ManagerDashboard extends StatelessWidget {
  final AuthProvider auth;
  final DashboardProvider dashboard;

  const ManagerDashboard({
    super.key,
    required this.auth,
    required this.dashboard,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Padding(
          padding: EdgeInsets.all(AppSpacing.md),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Project Manager', style: AppTypography.h3),
              Text('Portfolio Overview', style: AppTypography.bodySmall),
            ],
          ),
        ),
        const SizedBox(height: AppSpacing.lg),
        // Assuming _buildKPIGrid() is a new method that will be added elsewhere
        // For now, I'll keep the original KPI grid structure but apply const where possible.
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
          child: Column(
            children: [
              const KPIMetricCard(
                title: 'Total Network Revenue',
                value: '45.2M RWF',
                icon: Icons.payments,
                color: AppColors.success,
              ),
              const SizedBox(height: AppSpacing.md),
              GridView.count(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                crossAxisCount: 2,
                mainAxisSpacing: AppSpacing.md,
                crossAxisSpacing: AppSpacing.md,
                childAspectRatio: 1.1,
                children: const [
                  KPIMetricCard(
                    title: 'Total Farmers',
                    value: '1,240',
                    icon: Icons.groups,
                    color: AppColors.primaryGreen,
                  ),
                  KPIMetricCard(
                    title: 'VSLA Total Capital',
                    value: '15.8M',
                    icon: Icons.account_balance,
                    color: AppColors.blue,
                  ),
                ],
              ),
            ],
          ),
        ),
      ],
    );
  }
}
