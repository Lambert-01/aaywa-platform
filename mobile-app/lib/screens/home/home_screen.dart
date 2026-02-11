import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../providers/dashboard_provider.dart';
import '../../theme/design_system.dart';
import '../../widgets/kpi_metric_card.dart';
import '../../widgets/common/aaywa_card.dart';

import '../vsla/treasurer_screen.dart';
import '../mapping/farm_map_screen.dart';
import '../sales/sales_entry_screen.dart';
import '../sales/sales_history_screen.dart';
import '../settings/settings_screen.dart';
import '../profile/farmer_profile_screen.dart';
import '../training/training_screen.dart';
import '../training/training_badges_screen.dart';
import '../compost/compost_workday_screen.dart';
import '../inputs/input_invoice_screen.dart';
import '../vsla/meeting_mode_screen.dart';
import '../sync/sync_status_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _selectedIndex = 0;
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();

  @override
  void initState() {
    super.initState();
    // Load dashboard data on init
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<DashboardProvider>(context, listen: false)
          .loadDashboardData();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      key: _scaffoldKey,
      backgroundColor: AppColors.backgroundGray,
      drawer: _buildDrawer(context),
      body: _buildBody(),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _selectedIndex,
        onDestinationSelected: (index) {
          setState(() => _selectedIndex = index);
        },
        backgroundColor: AppColors.surfaceWhite,
        indicatorColor: AppColors.accentGreen.withValues(alpha: 0.2),
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.home_outlined),
            selectedIcon: Icon(Icons.home),
            label: 'Home',
          ),
          NavigationDestination(
            icon: Icon(Icons.account_balance_wallet_outlined),
            selectedIcon: Icon(Icons.account_balance_wallet),
            label: 'VSLA',
          ),
          NavigationDestination(
            icon: Icon(Icons.history_outlined),
            selectedIcon: Icon(Icons.history),
            label: 'Sales',
          ),
          NavigationDestination(
            icon: Icon(Icons.person_outline),
            selectedIcon: Icon(Icons.person),
            label: 'Profile',
          ),
        ],
      ),
    );
  }

  Widget _buildBody() {
    switch (_selectedIndex) {
      case 0:
        return _buildDashboard();
      case 1:
        return const VSLATreasurerScreen();
      case 2:
        return const SalesHistoryScreen();
      case 3:
        return const FarmerProfileScreen();
      default:
        return _buildDashboard();
    }
  }

  Widget _buildDrawer(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);
    final user = auth.user;

    return Drawer(
      child: ListView(
        padding: EdgeInsets.zero,
        children: [
          UserAccountsDrawerHeader(
            decoration: const BoxDecoration(
              color: AppColors.primaryGreen,
            ),
            accountName: Text(
              user?['name'] ?? 'User Name',
              style: AppTypography.h4.copyWith(color: Colors.white),
            ),
            accountEmail: Text(
              user?['email'] ?? 'user@example.com',
              style: AppTypography.bodySmall.copyWith(color: Colors.white70),
            ),
            currentAccountPicture: CircleAvatar(
              backgroundColor: Colors.white,
              child: Text(
                (user?['name'] ?? 'U').substring(0, 1).toUpperCase(),
                style: AppTypography.h3.copyWith(color: AppColors.primaryGreen),
              ),
            ),
          ),
          _buildDrawerItem(
            icon: Icons.home_outlined,
            title: 'Dashboard',
            onTap: () {
              Navigator.pop(context);
              setState(() => _selectedIndex = 0);
            },
            isSelected: _selectedIndex == 0,
          ),
          _buildDrawerItem(
            icon: Icons.school_outlined,
            title: 'Training Center',
            onTap: () {
              Navigator.pop(context);
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const TrainingScreen()),
              );
            },
          ),
          _buildDrawerItem(
            icon: Icons.military_tech_outlined,
            title: 'My Badges',
            onTap: () {
              Navigator.pop(context);
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const TrainingBadgesScreen()),
              );
            },
          ),
          const Divider(),
          _buildDrawerItem(
            icon: Icons.eco_outlined,
            title: 'Compost Log',
            onTap: () {
              Navigator.pop(context);
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const CompostWorkdayScreen()),
              );
            },
          ),
          _buildDrawerItem(
            icon: Icons.receipt_long_outlined,
            title: 'Input Invoices',
            onTap: () {
              Navigator.pop(context);
              Navigator.push(
                context,
                MaterialPageRoute(
                    builder: (_) => const InputInvoiceEntryScreen()),
              );
            },
          ),
          if (!kIsWeb)
            _buildDrawerItem(
              icon: Icons.map_outlined,
              title: 'Farm Map',
              onTap: () {
                Navigator.pop(context);
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const FarmMapScreen()),
                );
              },
            ),
          const Divider(),
          _buildDrawerItem(
            icon: Icons.groups_outlined,
            title: 'VSLA Meeting Mode',
            subtitle: 'Officer Tool',
            onTap: () {
              Navigator.pop(context);
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const VSLAMeetingScreen()),
              );
            },
          ),
          _buildDrawerItem(
            icon: Icons.sync_outlined,
            title: 'Sync Status',
            onTap: () {
              Navigator.pop(context);
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const SyncStatusScreen()),
              );
            },
          ),
          const Divider(),
          _buildDrawerItem(
            icon: Icons.settings_outlined,
            title: 'Settings',
            onTap: () {
              Navigator.pop(context);
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const SettingsScreen()),
              );
            },
          ),
          _buildDrawerItem(
            icon: Icons.logout,
            title: 'Logout',
            textColor: AppColors.error,
            iconColor: AppColors.error,
            onTap: () {
              Navigator.pop(context);
              auth.logout();
            },
          ),
        ],
      ),
    );
  }

  Widget _buildDrawerItem({
    required IconData icon,
    required String title,
    String? subtitle,
    required VoidCallback onTap,
    bool isSelected = false,
    Color? textColor,
    Color? iconColor,
  }) {
    return ListTile(
      leading: Icon(
        icon,
        color: isSelected
            ? AppColors.primaryGreen
            : (iconColor ?? AppColors.textMedium),
      ),
      title: Text(
        title,
        style: AppTypography.bodyMedium.copyWith(
          color: isSelected
              ? AppColors.primaryGreen
              : (textColor ?? AppColors.textDark),
          fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
        ),
      ),
      subtitle: subtitle != null
          ? Text(
              subtitle,
              style: AppTypography.caption.copyWith(
                color: AppColors.textLight,
              ),
            )
          : null,
      onTap: onTap,
      selected: isSelected,
      selectedTileColor: AppColors.primaryGreen.withValues(alpha: 0.1),
      contentPadding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
    );
  }

  Widget _buildDashboard() {
    final auth = Provider.of<AuthProvider>(context);
    final dashboard = Provider.of<DashboardProvider>(context);

    return CustomScrollView(
      slivers: [
        // App Bar
        SliverAppBar(
          floating: true,
          snap: true,
          backgroundColor: AppColors.surfaceWhite,
          elevation: 0,
          title: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Muraho, ${auth.user?['name'] ?? 'User'}',
                style: AppTypography.h3.copyWith(
                  color: AppColors.textDark,
                ),
              ),
              Text(
                'Cohort ${auth.user?['cohort'] ?? 'N/A'} · Last sync: ${_getLastSyncTime()}',
                style: AppTypography.caption.copyWith(
                  color: AppColors.textMedium,
                ),
              ),
            ],
          ),
          actions: [
            // Sync Status Indicator
            if (dashboard.isLoading)
              const Padding(
                padding: EdgeInsets.symmetric(horizontal: AppSpacing.md),
                child: Center(
                  child: SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  ),
                ),
              )
            else
              IconButton(
                icon: const Icon(Icons.sync),
                onPressed: () {
                  dashboard.loadDashboardData();
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('Syncing data...'),
                      duration: Duration(seconds: 2),
                    ),
                  );
                },
              ),
            // Settings
            IconButton(
              icon: const Icon(Icons.settings_outlined),
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const SettingsScreen()),
                );
              },
            ),
          ],
        ),

        // Content
        SliverToBoxAdapter(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: AppSpacing.md),

              // KPI Summary Section
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'OVERVIEW',
                      style: AppTypography.overline.copyWith(
                        color: AppColors.textMedium,
                      ),
                    ),
                    const SizedBox(height: AppSpacing.sm),
                  ],
                ),
              ),

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
                    // VSLA Balance
                    KPIMetricCard(
                      title: 'VSLA Balance',
                      value: _formatCurrency(dashboard.vslaBalance),
                      icon: Icons.account_balance_wallet,
                      color: AppColors.primaryGreen,
                      trendValue: 12.5,
                      trendIsPositive: true,
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (_) => const VSLATreasurerScreen(),
                          ),
                        );
                      },
                    ),

                    // Input Debt
                    KPIMetricCard(
                      title: 'Input Debt',
                      value: _formatCurrency(dashboard.inputDebt),
                      icon: Icons.receipt_long,
                      color: AppColors.warning,
                      subtitle: 'Next payment: Feb 15',
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                              builder: (_) => const InputInvoiceEntryScreen()),
                        );
                      },
                    ),

                    // Sales Total
                    KPIMetricCard(
                      title: 'Sales Total',
                      value: _formatCurrency(dashboard.salesTotal),
                      icon: Icons.trending_up,
                      color: AppColors.success,
                      trendValue: 8.3,
                      trendIsPositive: true,
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (_) => const SalesEntryScreen(),
                          ),
                        );
                      },
                    ),

                    // Trust Score
                    KPIMetricCard(
                      title: 'Trust Score',
                      value: '${dashboard.trustScore}/100',
                      icon: Icons.stars,
                      color: AppColors.indigo,
                      subtitle: 'Good Standing',
                      onTap: () {
                        _showTrustScoreDialog();
                      },
                    ),
                  ],
                ),
              ),

              const SizedBox(height: AppSpacing.xl),

              // Quick Actions Section
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'QUICK ACTIONS',
                      style: AppTypography.overline.copyWith(
                        color: AppColors.textMedium,
                      ),
                    ),
                    const SizedBox(height: AppSpacing.sm),
                  ],
                ),
              ),

              // Quick Actions Horizontal Scroll
              SizedBox(
                height: 120,
                child: ListView(
                  scrollDirection: Axis.horizontal,
                  padding:
                      const EdgeInsets.symmetric(horizontal: AppSpacing.md),
                  children: [
                    _buildQuickActionCard(
                      'Record Sale',
                      Icons.add_shopping_cart,
                      AppColors.primaryGreen,
                      () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (_) => const SalesEntryScreen(),
                          ),
                        );
                      },
                    ),
                    _buildQuickActionCard(
                      'VSLA Operations',
                      Icons.account_balance_wallet,
                      AppColors.blue,
                      () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (_) => const VSLATreasurerScreen(),
                          ),
                        );
                      },
                    ),
                    if (!kIsWeb)
                      _buildQuickActionCard(
                        'Map Farm',
                        Icons.map_outlined,
                        AppColors.teal,
                        () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) => const FarmMapScreen(),
                            ),
                          );
                        },
                      ),
                    _buildQuickActionCard(
                      'View Invoices',
                      Icons.receipt,
                      AppColors.orange,
                      () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                              builder: (_) => const InputInvoiceEntryScreen()),
                        );
                      },
                    ),
                    _buildQuickActionCard(
                      'Training',
                      Icons.school_outlined,
                      AppColors.purple,
                      () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                              builder: (_) => const TrainingScreen()),
                        );
                      },
                    ),
                    _buildQuickActionCard(
                      'Sync Data',
                      Icons.sync,
                      AppColors.indigo,
                      () {
                        dashboard.loadDashboardData();
                      },
                    ),
                  ],
                ),
              ),

              const SizedBox(height: AppSpacing.xl),

              // Recent Activity Section
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'RECENT ACTIVITY',
                      style: AppTypography.overline.copyWith(
                        color: AppColors.textMedium,
                      ),
                    ),
                    const SizedBox(height: AppSpacing.sm),
                  ],
                ),
              ),

              // Activity Feed
              _buildActivityFeed(dashboard),

              const SizedBox(height: AppSpacing.xxl),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildQuickActionCard(
    String title,
    IconData icon,
    Color color,
    VoidCallback onTap,
  ) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 140,
        margin: const EdgeInsets.only(right: AppSpacing.md),
        decoration: BoxDecoration(
          color: AppColors.surfaceWhite,
          borderRadius: BorderRadius.circular(AppRadius.md),
          border: Border.all(color: AppColors.border),
          boxShadow: const [AppShadows.sm],
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(AppSpacing.md),
              decoration: BoxDecoration(
                color: color.withValues(alpha: 0.1),
                shape: BoxShape.circle,
              ),
              child: Icon(icon, color: color, size: 28),
            ),
            const SizedBox(height: AppSpacing.sm),
            Text(
              title,
              style: AppTypography.labelMedium.copyWith(
                color: AppColors.textDark,
                fontWeight: FontWeight.w600,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildActivityFeed(DashboardProvider dashboard) {
    final activities = _getRecentActivities(dashboard);

    if (activities.isEmpty) {
      return Padding(
        padding: const EdgeInsets.all(AppSpacing.xl),
        child: Center(
          child: Column(
            children: [
              Icon(
                Icons.inbox_outlined,
                size: 64,
                color: AppColors.textLight.withValues(alpha: 0.5),
              ),
              const SizedBox(height: AppSpacing.md),
              Text(
                'No recent activity',
                style: AppTypography.bodyMedium.copyWith(
                  color: AppColors.textMedium,
                ),
              ),
            ],
          ),
        ),
      );
    }

    return ListView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: activities.length,
      itemBuilder: (context, index) {
        final activity = activities[index];
        return AaywaListCard(
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(AppSpacing.sm),
                decoration: BoxDecoration(
                  color: activity['color'].withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(AppRadius.sm),
                ),
                child: Icon(
                  activity['icon'],
                  color: activity['color'],
                  size: 20,
                ),
              ),
              const SizedBox(width: AppSpacing.md),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      activity['title'],
                      style: AppTypography.bodyMedium.copyWith(
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: AppSpacing.xs),
                    Text(
                      activity['subtitle'],
                      style: AppTypography.bodySmall.copyWith(
                        color: AppColors.textMedium,
                      ),
                    ),
                  ],
                ),
              ),
              Text(
                activity['time'],
                style: AppTypography.caption.copyWith(
                  color: AppColors.textLight,
                ),
              ),
            ],
          ),
        );
      },
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

  String _getLastSyncTime() {
    return '2m ago';
  }

  List<Map<String, dynamic>> _getRecentActivities(DashboardProvider dashboard) {
    if (dashboard.recentActivities.isEmpty) {
      return [];
    }

    return dashboard.recentActivities.map((activity) {
      // Map API activity to UI format
      IconData icon = Icons.info;
      Color color = AppColors.textMedium;

      if (activity['type'] == 'sale') {
        icon = Icons.shopping_bag;
        color = AppColors.success;
      } else if (activity['type'] == 'invoice') {
        icon = Icons.receipt_long;
        color = AppColors.warning;
      } else if (activity['type'] == 'training') {
        icon = Icons.school;
        color = AppColors.blue;
      }

      // Format time
      String timeStr = 'Just now';
      if (activity['time'] != null) {
        final date = DateTime.tryParse(activity['time']);
        if (date != null) {
          final diff = DateTime.now().difference(date);
          if (diff.inDays > 0) {
            timeStr = '${diff.inDays}d ago';
          } else if (diff.inHours > 0) {
            timeStr = '${diff.inHours}h ago';
          } else {
            timeStr = '${diff.inMinutes}m ago';
          }
        }
      }

      return {
        'title': activity['title'] ?? 'Activity',
        'subtitle': activity['subtitle'] ?? '',
        'time': timeStr,
        'icon': icon,
        'color': color,
      };
    }).toList();
  }

  void _showTrustScoreDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Row(
          children: [
            Icon(Icons.stars, color: AppColors.indigo),
            SizedBox(width: AppSpacing.sm),
            Text('Trust Score', style: AppTypography.h4),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Your trust score is calculated based on:',
              style: AppTypography.bodyMedium,
            ),
            const SizedBox(height: AppSpacing.md),
            _buildScoreItem('Payment history', '40 points'),
            _buildScoreItem('Attendance', '30 points'),
            _buildScoreItem('VSLA participation', '20 points'),
            _buildScoreItem('Training completion', '10 points'),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Close'),
          ),
        ],
      ),
    );
  }

  Widget _buildScoreItem(String label, String points) {
    return Padding(
      padding: const EdgeInsets.only(bottom: AppSpacing.sm),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text('• $label', style: AppTypography.bodySmall),
          Text(points, style: AppTypography.labelSmall),
        ],
      ),
    );
  }
}
