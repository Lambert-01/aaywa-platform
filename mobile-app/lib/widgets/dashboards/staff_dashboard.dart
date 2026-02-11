import 'package:flutter/material.dart';
import '../../providers/auth_provider.dart';
import '../../providers/dashboard_provider.dart';
import '../../theme/design_system.dart';
import '../kpi_metric_card.dart';

class StaffDashboard extends StatelessWidget {
  final AuthProvider auth;
  final DashboardProvider dashboard;

  const StaffDashboard({
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
              Text('Field Staff', style: AppTypography.h3),
              Text('Daily Activities', style: AppTypography.bodySmall),
            ],
          ),
        ),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
          child: GridView.count(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            crossAxisCount: 2,
            mainAxisSpacing: AppSpacing.md,
            crossAxisSpacing: AppSpacing.md,
            childAspectRatio: 1.1,
            children: [
              KPIMetricCard(
                title: 'Farmers Managed',
                value: '${dashboard.farmersCount}',
                icon: Icons.people,
                color: AppColors.primaryGreen,
              ),
              const KPIMetricCard(
                title: 'Active Batches',
                value: '12', // Mock from dashboard response
                icon: Icons.eco,
                color: AppColors.teal,
              ),
              KPIMetricCard(
                title: 'Trainings Held',
                value: '${dashboard.trainingsCount}',
                icon: Icons.school,
                color: AppColors.blue,
              ),
              KPIMetricCard(
                title: 'Plots Visited',
                value: '${dashboard.farmPlotsCount}',
                icon: Icons.map,
                color: AppColors.orange,
              ),
            ],
          ),
        ),
      ],
    );
  }
}
