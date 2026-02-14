import 'package:flutter/material.dart';
import '../../providers/auth_provider.dart';
import '../../providers/dashboard_provider.dart';
import '../../theme/design_system.dart';
import '../kpi_metric_card.dart';

import '../../screens/farmer/learning_path_screen.dart';
import '../../screens/farmer/market_intel_screen.dart';
import '../../screens/vsla/vsla_member_screen.dart';
import '../../screens/issues/issue_reporting_screen.dart';
import '../../screens/mapping/farm_map_screen.dart';

import '../common/mini_map_preview.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';

// ... other imports ...

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
        // 1. Profile Summary Card (NEW)
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
          child: _buildProfileSummary(context),
        ),

        const SizedBox(height: AppSpacing.md),

        // KPI Cards Grid (2x2)
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
              _buildFarmLocationWidget(context),
              _buildTrainingPendingWidget(context),
              _buildPendingIssuesWidget(context),

              const SizedBox(height: 12),

              // VSLA Group Card
              _buildPremiumFeatureCard(
                context,
                title: 'My VSLA Group',
                subtitle: 'Savings, Loans & Meetings',
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
            ],
          ),
        ),
      ],
    );
  }

  // ─── NEW WIDGETS ───────────────────────────────────────────────

  Widget _buildProfileSummary(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.md),
      decoration: BoxDecoration(
        color: AppColors.surfaceWhite,
        borderRadius: BorderRadius.circular(AppRadius.md),
        border: Border.all(color: AppColors.border),
        boxShadow: const [AppShadows.sm],
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Photo
          CircleAvatar(
            radius: 30,
            backgroundImage: dashboard.photoUrl != null
                ? NetworkImage(dashboard.photoUrl!)
                : null,
            backgroundColor: AppColors.primaryGreen.withOpacity(0.1),
            child: dashboard.photoUrl == null
                ? Text(
                    (auth.user?['name'] ?? 'U').substring(0, 1).toUpperCase(),
                    style: AppTypography.h3
                        .copyWith(color: AppColors.primaryGreen),
                  )
                : null,
          ),
          const SizedBox(width: AppSpacing.md),

          // Details
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  auth.user?['name'] ?? 'Welcome Farmer',
                  style: AppTypography.h4,
                ),
                const SizedBox(height: 4),
                Wrap(
                  spacing: 8,
                  runSpacing: 4,
                  children: [
                    if (dashboard.cohortName != null)
                      _buildTag(dashboard.cohortName!, Colors.blue),
                    if (dashboard.householdType != null)
                      _buildTag(dashboard.householdType!.replaceAll('_', ' '),
                          Colors.purple),
                  ],
                ),
                if (dashboard.crops != null) ...[
                  const SizedBox(height: 6),
                  Text(
                    'Crops: ${dashboard.crops}',
                    style: AppTypography.caption
                        .copyWith(color: AppColors.textLight),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ]
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTag(String text, MaterialColor color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
      decoration: BoxDecoration(
        color: color.shade50,
        borderRadius: BorderRadius.circular(4),
        border: Border.all(color: color.shade100),
      ),
      child: Text(
        text,
        style: TextStyle(
          fontSize: 10,
          fontWeight: FontWeight.w500,
          color: color.shade700,
        ),
      ),
    );
  }

  Widget _buildFarmLocationWidget(BuildContext context) {
    // If we have proper location data, show the MiniMapPreview
    if (dashboard.location != null && dashboard.location!['lat'] != null) {
      try {
        final lat = double.parse(dashboard.location!['lat'].toString());
        final lng = double.parse(dashboard.location!['lng'].toString());
        final center = LatLng(lat, lng);

        // Try to parse polygon if available, otherwise just use center
        List<LatLng> polygonPoints = [];
        // Simple polygon placeholder if needed, or real parsing logic here if structure matches

        return MiniMapPreview(
          title: 'Farm Location',
          center: center,
          polygons: polygonPoints.isNotEmpty
              ? [
                  Polygon(
                    points: polygonPoints,
                    color: AppColors.primaryGreen.withValues(alpha: 0.3),
                    borderColor: AppColors.primaryGreen,
                    borderStrokeWidth: 2,
                  )
                ]
              : [],
          subtitle:
              'Verified: ${dashboard.location!['address'] ?? 'Coordinates set'}',
          actionLabel: 'View Full Map',
          onActionPressed: () {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (context) => FarmMapScreen(
                  farmerId: auth.user?['id']?.toString(),
                  farmerName: auth.user?['name'],
                  viewOnly: true,
                  initialCenter: center,
                ),
              ),
            );
          },
        );
      } catch (e) {
        debugPrint('Error parsing location for map: $e');
      }
    }

    final hasLocation = dashboard.location != null;

    return Container(
      margin: const EdgeInsets.only(bottom: AppSpacing.md),
      padding: const EdgeInsets.all(AppSpacing.md),
      decoration: BoxDecoration(
        color: AppColors.surfaceWhite,
        borderRadius: BorderRadius.circular(AppRadius.md),
        border: Border.all(color: AppColors.border),
        boxShadow: const [AppShadows.sm],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.location_on, color: AppColors.primaryGreen),
              const SizedBox(width: AppSpacing.sm),
              Text(
                'Farm Location',
                style: AppTypography.h4,
              ),
              const Spacer(),
              TextButton(
                onPressed: () {
                  // Parse location if available
                  LatLng? center;
                  if (dashboard.location != null && dashboard.location!['lat'] != null) {
                    try {
                      final lat = double.parse(dashboard.location!['lat'].toString());
                      final lng = double.parse(dashboard.location!['lng'].toString());
                      center = LatLng(lat, lng);
                    } catch (e) {
                      debugPrint('Error parsing location: $e');
                    }
                  }
                  
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => FarmMapScreen(
                        farmerId: auth.user?['id']?.toString(),
                        farmerName: auth.user?['name'],
                        viewOnly: hasLocation,
                        initialCenter: center,
                      ),
                    ),
                  );
                },
                child: Text(hasLocation ? 'View Map' : 'Set Location'),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.sm),
          Container(
            height: 150,
            decoration: BoxDecoration(
              color: AppColors.backgroundGray,
              borderRadius: BorderRadius.circular(AppRadius.sm),
              gradient: hasLocation
                  ? const LinearGradient(
                      colors: [Color(0xFFE8F5E9), Color(0xFFC8E6C9)],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    )
                  : null,
            ),
            child: Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                      hasLocation ? Icons.check_circle : Icons.add_location_alt,
                      size: 48,
                      color: (hasLocation
                              ? AppColors.success
                              : AppColors.primaryGreen)
                          .withValues(alpha: 0.5)),
                  const SizedBox(height: AppSpacing.sm),
                  Text(
                    hasLocation ? 'Location Set' : 'Tap to map your farm',
                    style: AppTypography.bodySmall
                        .copyWith(color: AppColors.textLight),
                  ),
                ],
              ),
            ),
          ),
          if (hasLocation) ...[
            const SizedBox(height: AppSpacing.sm),
            Row(
              children: [
                const Icon(Icons.check, size: 16, color: AppColors.success),
                const SizedBox(width: 4),
                Text(
                  'Verified Coordinates',
                  style:
                      AppTypography.caption.copyWith(color: AppColors.success),
                ),
              ],
            )
          ],
        ],
      ),
    );
  }

  Widget _buildTrainingPendingWidget(BuildContext context) {
    final pendingTrainings = dashboard.pendingTrainings ?? [];
    
    return Container(
      margin: const EdgeInsets.only(bottom: AppSpacing.md),
      padding: const EdgeInsets.all(AppSpacing.md),
      decoration: BoxDecoration(
        color: AppColors.surfaceWhite,
        borderRadius: BorderRadius.circular(AppRadius.md),
        border: Border.all(color: AppColors.border),
        boxShadow: const [AppShadows.sm],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.school, color: AppColors.blue),
              const SizedBox(width: AppSpacing.sm),
              Text(
                'Training Pending',
                style: AppTypography.h4,
              ),
              const Spacer(),
              if (pendingTrainings.isNotEmpty)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                  decoration: BoxDecoration(
                    color: AppColors.blue.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    '${pendingTrainings.length}',
                    style: AppTypography.labelSmall.copyWith(
                      color: AppColors.blue,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
            ],
          ),
          const SizedBox(height: AppSpacing.md),
          if (pendingTrainings.isEmpty)
            Center(
              child: Padding(
                padding: const EdgeInsets.all(AppSpacing.lg),
                child: Column(
                  children: [
                    Icon(Icons.check_circle_outline,
                        size: 48, color: AppColors.success.withValues(alpha: 0.5)),
                    const SizedBox(height: AppSpacing.sm),
                    Text('No pending trainings',
                        style: AppTypography.bodyMedium
                            .copyWith(color: AppColors.textMedium)),
                  ],
                ),
              ),
            )
          else
            ...pendingTrainings.take(2).map((training) {
              return Column(
                children: [
                  _buildTrainingItem(
                    training['title'] ?? 'Training Session',
                    training['date'] ?? 'Date TBD',
                    0.0,
                  ),
                  if (training != pendingTrainings.take(2).last)
                    const Divider(height: 24),
                ],
              );
            }),
          const SizedBox(height: AppSpacing.md),
          SizedBox(
            width: double.infinity,
            child: OutlinedButton(
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => const LearningPathScreen(),
                  ),
                );
              },
              child: const Text('Go to Training Center'),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTrainingItem(String title, String subtitle, double progress) {
    return Row(
      children: [
        CircleAvatar(
          backgroundColor: AppColors.blue.withValues(alpha: 0.1),
          child: const Icon(Icons.play_circle_outline, color: AppColors.blue),
        ),
        const SizedBox(width: AppSpacing.md),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(title,
                  style: AppTypography.bodyMedium
                      .copyWith(fontWeight: FontWeight.w600)),
              Text(subtitle, style: AppTypography.caption),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildPendingIssuesWidget(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: AppSpacing.md),
      padding: const EdgeInsets.all(AppSpacing.md),
      decoration: BoxDecoration(
        color: AppColors.surfaceWhite,
        borderRadius: BorderRadius.circular(AppRadius.md),
        border: Border.all(color: AppColors.border),
        boxShadow: const [AppShadows.sm],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.report_problem, color: AppColors.error),
              const SizedBox(width: AppSpacing.sm),
              Text(
                'Reported Issues',
                style: AppTypography.h4,
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.md),
          // Sync existing issues count if available in dashboard provider
          // For now, placeholder is fine, but button must work
          Center(
            child: Column(
              children: [
                Icon(Icons.check_circle_outline,
                    size: 48, color: AppColors.success.withValues(alpha: 0.5)),
                const SizedBox(height: AppSpacing.sm),
                Text('No pending issues', style: AppTypography.bodyMedium),
              ],
            ),
          ),
          const SizedBox(height: AppSpacing.md),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              icon: const Icon(Icons.add, size: 18),
              label: const Text('Report New Issue'),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.error,
                foregroundColor: Colors.white,
              ),
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => const IssueReportingScreen(),
                  ),
                );
              },
            ),
          ),
        ],
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
    // Keeping this method signature to avoid breaking existing calls if any,
    // but in new design we use specific widgets.
    return InkWell(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(bottom: AppSpacing.md),
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
