import 'package:flutter/material.dart';
import '../../providers/auth_provider.dart';
import '../../providers/dashboard_provider.dart';
import 'farmer_dashboard.dart';
import 'staff_dashboard.dart';
import 'manager_dashboard.dart';

import 'champion_dashboard.dart';

/// Factory that returns the correct dashboard widget based on the user's role.
class DashboardFactory {
  DashboardFactory._();

  static Widget getScreen({
    required AuthProvider auth,
    required DashboardProvider dashboard,
  }) {
    switch (auth.userRole) {
      case UserRole.champion:
        return ChampionDashboard(auth: auth, dashboard: dashboard);

      case UserRole.farmer:
        return FarmerDashboard(auth: auth, dashboard: dashboard);

      case UserRole.fieldFacilitator:
      case UserRole.agronomist:
        return StaffDashboard(auth: auth, dashboard: dashboard);

      case UserRole.projectManager:
        return ManagerDashboard(auth: auth, dashboard: dashboard);
    }
  }
}
