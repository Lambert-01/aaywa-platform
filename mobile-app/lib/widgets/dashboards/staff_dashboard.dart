import 'package:flutter/material.dart';
import 'package:latlong2/latlong.dart';
import '../../providers/auth_provider.dart';
import '../../providers/dashboard_provider.dart';
import '../../theme/design_system.dart';
import '../kpi_metric_card.dart';
import '../common/mini_map_preview.dart';
import '../../screens/mapping/farm_map_screen.dart';

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
    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Padding(
            padding: EdgeInsets.all(AppSpacing.md),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Field Staff', style: AppTypography.h3),
                Text('Daily Activities Overview',
                    style: AppTypography.bodySmall),
              ],
            ),
          ),

          // KPI Grid
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
                KPIMetricCard(
                  title: 'Sales Processed',
                  value: '${dashboard.salesCount}',
                  icon: Icons.shopping_basket,
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

          const SizedBox(height: AppSpacing.lg),

          // Missing Map Layout Implementation
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
            child: MiniMapPreview(
              polygons: const [], // In a real app, fetch regional boundaries
              center: const LatLng(-1.9441, 30.0619),
              title: 'OPERATIONAL AREA',
              subtitle: 'Showing active clusters in the current region.',
              actionLabel: 'OPEN MAP',
              onActionPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const FarmMapScreen()),
                );
              },
            ),
          ),

          const SizedBox(height: AppSpacing.xl),
        ],
      ),
    );
  }
}
