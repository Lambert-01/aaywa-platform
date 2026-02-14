import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../providers/dashboard_provider.dart';
import '../../config/navigation_config.dart';
import '../../theme/design_system.dart';
import '../../widgets/common/aaywa_card.dart';
import '../../widgets/dashboards/dashboard_factory.dart';

import '../settings/settings_screen.dart';

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
    final auth = Provider.of<AuthProvider>(context);
    final bottomTabs = NavigationConfig.getBottomNavItems(auth.userRole);

    // Safety check: if role changed and index is out of bounds
    if (_selectedIndex >= bottomTabs.length) {
      _selectedIndex = 0;
    }

    return Scaffold(
      key: _scaffoldKey,
      backgroundColor: AppColors.backgroundGray,
      drawer: _buildDrawer(context),
      body: _buildBody(bottomTabs),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _selectedIndex,
        onDestinationSelected: (index) {
          setState(() => _selectedIndex = index);
        },
        backgroundColor: AppColors.surfaceWhite,
        indicatorColor: AppColors.accentGreen.withValues(alpha: 0.2),
        destinations: bottomTabs.map((item) {
          return NavigationDestination(
            icon: Icon(item.icon),
            selectedIcon: Icon(item.selectedIcon),
            label: item.label,
          );
        }).toList(),
      ),
    );
  }

  Widget _buildBody(List<BottomNavItem> tabs) {
    // If index 0 (Home), show Dashboard
    if (_selectedIndex == 0) {
      return _buildDashboard();
    }

    // Otherwise use the builder from config
    return tabs[_selectedIndex].screenBuilder();
  }

  // ────────────────────────────────────────────────────────────
  //  ROLE-AWARE DRAWER
  // ────────────────────────────────────────────────────────────

  Widget _buildDrawer(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);
    final user = auth.user;
    final drawerItems = NavigationConfig.getDrawerItems(auth.userRole);

    return Drawer(
      child: ListView(
        padding: EdgeInsets.zero,
        children: [
          // ─── user header ──────────────────────────────────
          UserAccountsDrawerHeader(
            decoration: const BoxDecoration(
              color: AppColors.primaryGreen,
            ),
            accountName: Text(
              user?['name'] ?? user?['full_name'] ?? 'User Name',
              style: AppTypography.h4.copyWith(color: Colors.white),
            ),
            accountEmail: Text(
              '${auth.roleDisplayName}  •  ${user?['email'] ?? ''}',
              style: AppTypography.bodySmall.copyWith(color: Colors.white70),
            ),
            currentAccountPicture: CircleAvatar(
              backgroundColor: Colors.white,
              child: Text(
                (user?['name'] ?? user?['full_name'] ?? 'U')
                    .substring(0, 1)
                    .toUpperCase(),
                style: AppTypography.h3.copyWith(color: AppColors.primaryGreen),
              ),
            ),
          ),

          // ─── dashboard link ─────────────────────────────
          _buildDrawerItem(
            icon: Icons.home_outlined,
            title: 'Dashboard',
            onTap: () {
              Navigator.pop(context);
              setState(() => _selectedIndex = 0);
            },
            isSelected: _selectedIndex == 0,
          ),

          const Divider(),

          // ─── dynamic role-based items ────────────────────
          ...drawerItems.map(
            (item) => _buildDrawerItem(
              icon: item.icon,
              title: item.title,
              subtitle: item.subtitle,
              onTap: () {
                Navigator.pop(context);
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => item.screenBuilder()),
                );
              },
            ),
          ),

          const Divider(),

          // ─── Settings (everyone) ────────────────────────
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

          // ─── Logout (everyone) ──────────────────────────
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

  // ────────────────────────────────────────────────────────────
  //  DASHBOARD
  // ────────────────────────────────────────────────────────────

  Widget _buildDashboard() {
    final auth = Provider.of<AuthProvider>(context);
    final dashboard = Provider.of<DashboardProvider>(context);

    // ────────────────────────────────────────────────────────────
    //  FARMER LAYOUT (Unique)
    // ────────────────────────────────────────────────────────────
    if (auth.userRole == UserRole.farmer) {
      return CustomScrollView(
        slivers: [
          // Standard App Bar
          SliverAppBar(
            floating: true,
            snap: true,
            backgroundColor: AppColors.surfaceWhite,
            elevation: 0,
            title: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Muraho, ${auth.user?['name'] ?? auth.user?['full_name'] ?? 'Farmer'}',
                  style: AppTypography.h3.copyWith(
                    color: AppColors.textDark,
                  ),
                ),
                Text(
                  'Your Dashboard',
                  style: AppTypography.caption.copyWith(
                    color: AppColors.textMedium,
                  ),
                ),
              ],
            ),
            actions: [
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

          // Farmer Content - No generic headers
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.only(
                  top: AppSpacing.md, bottom: AppSpacing.xxl),
              child:
                  DashboardFactory.getScreen(auth: auth, dashboard: dashboard),
            ),
          ),
        ],
      );
    }

    // ────────────────────────────────────────────────────────────
    //  STAFF LAYOUT (Generic)
    // ────────────────────────────────────────────────────────────
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
                'Muraho, ${auth.user?['name'] ?? auth.user?['full_name'] ?? 'User'}',
                style: AppTypography.h3.copyWith(
                  color: AppColors.textDark,
                ),
              ),
              Text(
                '${auth.roleDisplayName} · Last sync: ${_getLastSyncTime()}',
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
                      'OPERATIONAL OVERVIEW',
                      style: AppTypography.overline.copyWith(
                        color: AppColors.textMedium,
                      ),
                    ),
                    const SizedBox(height: AppSpacing.sm),
                  ],
                ),
              ),

              // Dynamic Dashboard based on Role (factory)
              DashboardFactory.getScreen(auth: auth, dashboard: dashboard),

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

              // Role-filtered Quick Actions
              _buildQuickActions(auth.userRole),

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

  // ────────────────────────────────────────────────────────────
  //  ROLE-FILTERED QUICK ACTIONS
  // ────────────────────────────────────────────────────────────

  Widget _buildQuickActions(UserRole role) {
    final actions = NavigationConfig.getQuickActions(role);

    // Always add a "Sync Data" card at the end (not a screen)
    return SizedBox(
      height: 120,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
        itemCount: actions.length + 1, // +1 for Sync
        itemBuilder: (context, index) {
          if (index < actions.length) {
            final action = actions[index];
            return _buildQuickActionCard(
              action.title,
              action.icon,
              action.color,
              () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => action.screenBuilder()),
                );
              },
            );
          }
          // Last item = Sync Data
          return _buildQuickActionCard(
            'Sync Data',
            Icons.sync,
            AppColors.indigo,
            () {
              Provider.of<DashboardProvider>(context, listen: false)
                  .loadDashboardData();
            },
          );
        },
      ),
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

  // ────────────────────────────────────────────────────────────
  //  ACTIVITY FEED
  // ────────────────────────────────────────────────────────────

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

  String _getLastSyncTime() {
    return 'Just now';
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
}
