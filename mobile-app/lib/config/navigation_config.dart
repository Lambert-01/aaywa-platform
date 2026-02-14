import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import '../providers/auth_provider.dart';
import '../screens/vsla/treasurer_screen.dart';
import '../screens/mapping/farm_map_screen.dart';
import '../screens/sales/sales_entry_screen.dart';
import '../screens/sales/sales_history_screen.dart';
import '../screens/profile/farmer_profile_screen.dart';
import '../screens/training/training_screen.dart';
import '../screens/training/training_badges_screen.dart';
import '../screens/compost/compost_workday_screen.dart';
import '../screens/inputs/input_invoice_screen.dart';
import '../screens/vsla/meeting_mode_screen.dart';
import '../screens/sync/sync_status_screen.dart';
import '../screens/issues/issue_reporting_screen.dart'; // Added
import '../theme/design_system.dart';

// ────────────────────────────────────────────────────────────────
//  Data classes
// ────────────────────────────────────────────────────────────────

class DrawerMenuItem {
  final String title;
  final IconData icon;
  final String? subtitle;
  final Widget Function() screenBuilder;

  const DrawerMenuItem({
    required this.title,
    required this.icon,
    this.subtitle,
    required this.screenBuilder,
  });
}

class QuickActionItem {
  final String title;
  final IconData icon;
  final Color color;
  final Widget Function() screenBuilder;

  const QuickActionItem({
    required this.title,
    required this.icon,
    required this.color,
    required this.screenBuilder,
  });
}

class BottomNavItem {
  final String label;
  final IconData icon;
  final IconData selectedIcon;
  final Widget Function() screenBuilder;

  const BottomNavItem({
    required this.label,
    required this.icon,
    required this.selectedIcon,
    required this.screenBuilder,
  });
}

// ────────────────────────────────────────────────────────────────
//  Configuration
// ────────────────────────────────────────────────────────────────

class NavigationConfig {
  NavigationConfig._(); // prevent instantiation

  /// Returns the bottom navigation items appropriate for the given [role].
  static List<BottomNavItem> getBottomNavItems(UserRole role) {
    final items = <BottomNavItem>[];

    // 1. Home (All roles)
    // The screenBuilder here is a placeholder. HomeScreen handles index 0 specially.
    items.add(BottomNavItem(
      label: 'Home',
      icon: Icons.home_outlined,
      selectedIcon: Icons.home,
      screenBuilder: () => const SizedBox(),
    ));

    // 2. Training (Farmer only)
    if (role == UserRole.farmer) {
      items.add(BottomNavItem(
        label: 'Training',
        icon: Icons.school_outlined,
        selectedIcon: Icons.school,
        screenBuilder: () => const TrainingScreen(),
      ));
    }

    // 3. VSLA (Staff/Admin Only)
    if (role != UserRole.farmer) {
      items.add(BottomNavItem(
        label: 'VSLA',
        icon: Icons.groups_outlined,
        selectedIcon: Icons.groups,
        screenBuilder: () => const VSLAMeetingScreen(),
      ));
    }

    // 4. Reporting (Farmer Only - Issues)
    if (role == UserRole.farmer) {
      items.add(BottomNavItem(
        label: 'Issues', // Changed label to Issues for clarity
        icon: Icons.report_problem_outlined,
        selectedIcon: Icons.report_problem,
        screenBuilder: () => const IssueReportingScreen(),
      ));
    }

    // 5. Sales History (Farmer only)
    if (role == UserRole.farmer) {
      items.add(BottomNavItem(
        label: 'Sales',
        icon: Icons.history_outlined,
        selectedIcon: Icons.history,
        screenBuilder: () => const SalesHistoryScreen(),
      ));
    }
    // Note: Staff/Admin don't get a 'Reporting' tab on bottom bar per user request/plan.
    // They access reports via Drawer or Dashboard.

    // 5. Profile (All roles)
    items.add(BottomNavItem(
      label: 'Profile',
      icon: Icons.person_outline,
      selectedIcon: Icons.person,
      screenBuilder: () => const FarmerProfileScreen(),
    ));

    return items;
  }

  /// Returns the drawer-menu items appropriate for the given [role].
  static List<DrawerMenuItem> getDrawerItems(UserRole role) {
    final items = <DrawerMenuItem>[];

    // ─── Training Center (everyone) ──────────────────────────
    items.add(DrawerMenuItem(
      title: 'Training Center',
      icon: Icons.school_outlined,
      screenBuilder: () => const TrainingScreen(),
    ));

    // ─── My Badges (farmer only) ─────────────────────────────
    if (role == UserRole.farmer || role == UserRole.projectManager) {
      items.add(DrawerMenuItem(
        title: 'My Badges',
        icon: Icons.military_tech_outlined,
        screenBuilder: () => const TrainingBadgesScreen(),
      ));
    }

    // ─── VSLA Meeting Mode (staff + admin) ───────────────────
    if (role != UserRole.farmer) {
      items.add(DrawerMenuItem(
        title: 'VSLA Meeting Mode',
        icon: Icons.groups_outlined,
        subtitle: 'Officer Tool',
        screenBuilder: () => const VSLAMeetingScreen(),
      ));
    }

    // ─── Compost Log (agronomist + admin) ────────────────────
    if (role == UserRole.agronomist || role == UserRole.projectManager) {
      items.add(DrawerMenuItem(
        title: 'Compost Log',
        icon: Icons.eco_outlined,
        screenBuilder: () => const CompostWorkdayScreen(),
      ));
    }

    // ─── Input Invoices (field facilitator, agronomist, admin)
    if (role != UserRole.farmer) {
      items.add(DrawerMenuItem(
        title: 'Input Invoices',
        icon: Icons.receipt_long_outlined,
        screenBuilder: () => const InputInvoiceEntryScreen(),
      ));
    }

    // ─── Farm Map (not on web, field_facilitator + agronomist + admin)
    if (!kIsWeb) {
      items.add(DrawerMenuItem(
        title: 'Farm Map',
        icon: Icons.map_outlined,
        screenBuilder: () => const FarmMapScreen(),
      ));
    }

    // ─── Sync Status (staff + admin) ─────────────────────────
    if (role != UserRole.farmer) {
      items.add(DrawerMenuItem(
        title: 'Sync Status',
        icon: Icons.sync_outlined,
        screenBuilder: () => const SyncStatusScreen(),
      ));
    }

    return items;
  }

  /// Returns quick-action cards appropriate for the given [role].
  static List<QuickActionItem> getQuickActions(UserRole role) {
    final actions = <QuickActionItem>[];

    // Record Sale – everyone EXCEPT Farmer (they have a dedicated tab)
    if (role != UserRole.farmer) {
      actions.add(QuickActionItem(
        title: 'Record Sale',
        icon: Icons.add_shopping_cart,
        color: AppColors.primaryGreen,
        screenBuilder: () => const SalesEntryScreen(),
      ));
    }

    // VSLA Operations – everyone EXCEPT Farmer
    if (role != UserRole.farmer) {
      actions.add(QuickActionItem(
        title: 'VSLA Operations',
        icon: Icons.account_balance_wallet,
        color: AppColors.blue,
        screenBuilder: () => const VSLATreasurerScreen(),
      ));
    }

    // Map Farm – not on web
    if (!kIsWeb) {
      actions.add(QuickActionItem(
        title: 'Map Farm',
        icon: Icons.map_outlined,
        color: AppColors.teal,
        screenBuilder: () => const FarmMapScreen(),
      ));
    }

    // View Invoices – staff + admin
    if (role != UserRole.farmer) {
      actions.add(QuickActionItem(
        title: 'View Invoices',
        icon: Icons.receipt,
        color: AppColors.orange,
        screenBuilder: () => const InputInvoiceEntryScreen(),
      ));
    }

    // Training – everyone
    actions.add(QuickActionItem(
      title: 'Training',
      icon: Icons.school_outlined,
      color: AppColors.purple,
      screenBuilder: () => const TrainingScreen(),
    ));

    // Report Issue (Farmer Only)
    if (role == UserRole.farmer) {
      actions.add(QuickActionItem(
        title: 'Report Issue',
        icon: Icons.report_problem,
        color: AppColors.error,
        screenBuilder: () => const IssueReportingScreen(),
      ));
    }

    return actions;
  }
}
