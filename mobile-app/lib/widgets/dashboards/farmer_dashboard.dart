import 'package:flutter/material.dart';
import '../../providers/auth_provider.dart';
import '../../providers/dashboard_provider.dart';
import '../../theme/design_system.dart';
import '../kpi_metric_card.dart';

class FarmerDashboard extends StatelessWidget {
  final AuthProvider auth;
  final DashboardProvider dashboard;

  const FarmerDashboard({
    super.key,
    required this.auth,
    required this.dashboard,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // KPI Cards Grid (2x2)
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
                title: 'VSLA Balance',
                value: _formatCurrency(dashboard.vslaBalance),
                icon: Icons.account_balance_wallet,
                color: AppColors.primaryGreen,
              ),
              KPIMetricCard(
                title: 'Input Debt',
                value: _formatCurrency(dashboard.inputDebt),
                icon: Icons.receipt_long,
                color: AppColors.warning,
              ),
              KPIMetricCard(
                title: 'Sales Total',
                value: _formatCurrency(dashboard.salesTotal),
                icon: Icons.trending_up,
                color: AppColors.success,
              ),
              KPIMetricCard(
                title: 'Trust Score',
                value: '${dashboard.trustScore}/100',
                icon: Icons.stars,
                color: AppColors.indigo,
              ),
            ],
          ),
        ),
      ],
    );
  }

  String _formatCurrency(double amount) {
    if (amount >= 1000000) {
      return '${(amount / 1000000).toStringAsFixed(1)}M RWF';
    } else if (amount >= 1000) {
      return '${(amount / 1000).toStringAsFixed(1)}K RWF';
    }
    return '${amount.toStringAsFixed(0)} RWF';
  }
}
