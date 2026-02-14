import 'package:flutter/material.dart';
import '../../providers/auth_provider.dart';
import '../../providers/dashboard_provider.dart';
import '../../theme/design_system.dart';
import '../kpi_metric_card.dart';

import '../../screens/farmer/learning_path_screen.dart';
import '../../screens/farmer/market_intel_screen.dart';
import '../../screens/vsla/vsla_member_screen.dart';

class ChampionDashboard extends StatelessWidget {
  final AuthProvider auth;
  final DashboardProvider dashboard;

  const ChampionDashboard({
    super.key,
    required this.auth,
    required this.dashboard,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'CHAMPION TOOLS',
                style: AppTypography.overline
                    .copyWith(color: AppColors.primaryGreen),
              ),
              const SizedBox(height: AppSpacing.sm),
              // Champion Quick Actions Row
              SizedBox(
                height: 100,
                child: ListView(
                  scrollDirection: Axis.horizontal,
                  children: [
                    _buildQuickAction(
                      'My Farmers',
                      Icons.people,
                      AppColors.primaryGreen,
                      () {
                        // Navigate to farmer list
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                              content: Text('Farmer monitoring coming soon')),
                        );
                      },
                    ),
                    _buildQuickAction(
                      'Group Training',
                      Icons.school,
                      AppColors.blue,
                      () {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                              content: Text('Training recording coming soon')),
                        );
                      },
                    ),
                    _buildQuickAction(
                      'Input Dist.',
                      Icons.inventory_2,
                      AppColors.secondaryOrange,
                      () {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                              content: Text('Input distribution coming soon')),
                        );
                      },
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),

        const SizedBox(height: AppSpacing.lg),

        // KPI Cards Grid (2x2) - Similar to Farmer but maybe aggregated?
        // For now, keep personal stats as they are also farmers.
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
          child: GridView.count(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            crossAxisCount: 2,
            mainAxisSpacing: AppSpacing.md,
            crossAxisSpacing: AppSpacing.md,
            childAspectRatio: 0.85,
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

        const SizedBox(height: 24),

        // Premium Feature Cards
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // VSLA Group Card (Champions lead groups often)
              _buildPremiumFeatureCard(
                context,
                title: 'My VSLA Group',
                subtitle: 'Manage Savings & Loans',
                icon: Icons.groups,
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [AppColors.primaryGreen, AppColors.secondaryOrange],
                ),
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => const VSLAMemberScreen(),
                    ),
                  );
                },
              ),

              const SizedBox(height: 12),

              _buildPremiumFeatureCard(
                context,
                title: 'Market Intelligence',
                subtitle: 'Current prices & trends',
                icon: Icons.trending_up_rounded,
                gradient: const LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [Color(0xFF059669), Color(0xFF065F46)],
                ),
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => const MarketIntelScreen(),
                    ),
                  );
                },
              ),

              const SizedBox(height: 12),

              // Training Center Link
              _buildPremiumFeatureCard(
                context,
                title: 'Training Center',
                subtitle: 'Access learning materials',
                icon: Icons.menu_book,
                gradient: const LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [AppColors.blue, AppColors.indigo],
                ),
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => const LearningPathScreen(),
                    ),
                  );
                },
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildQuickAction(
      String title, IconData icon, Color color, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 100,
        margin: const EdgeInsets.only(right: AppSpacing.md),
        decoration: BoxDecoration(
          color: AppColors.surfaceWhite,
          borderRadius: BorderRadius.circular(AppRadius.md),
          border: Border.all(color: AppColors.border),
          boxShadow: [AppShadows.sm],
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(AppSpacing.sm),
              decoration: BoxDecoration(
                color: color.withValues(alpha: 0.1),
                shape: BoxShape.circle,
              ),
              child: Icon(icon, color: color, size: 24),
            ),
            const SizedBox(height: AppSpacing.xs),
            Text(
              title,
              textAlign: TextAlign.center,
              style: AppTypography.labelSmall
                  .copyWith(fontWeight: FontWeight.w600),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPremiumFeatureCard(
    BuildContext context, {
    required String title,
    required String subtitle,
    required IconData icon,
    required Gradient gradient,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(AppSpacing.md),
        decoration: BoxDecoration(
          gradient: gradient,
          borderRadius: BorderRadius.circular(AppRadius.md),
          boxShadow: const [AppShadows.sm],
        ),
        child: Row(
          children: [
            Icon(icon, color: Colors.white, size: 32),
            const SizedBox(width: AppSpacing.md),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title,
                      style: AppTypography.h4.copyWith(color: Colors.white)),
                  Text(subtitle,
                      style: AppTypography.bodySmall
                          .copyWith(color: Colors.white70)),
                ],
              ),
            ),
            const Icon(Icons.arrow_forward_ios,
                color: Colors.white70, size: 16),
          ],
        ),
      ),
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
