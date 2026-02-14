import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../screens/common/access_denied_screen.dart';

// ────────────────────────────────────────────────────────────────
//  Route Guard – Centralised Permission Rules
// ────────────────────────────────────────────────────────────────

class RouteGuard {
  RouteGuard._();

  // Map route name → list of roles that may access it.
  // Routes NOT listed here are open to everyone.
  static final Map<String, List<UserRole>> _routePermissions = {
    '/compost': [UserRole.agronomist, UserRole.projectManager],
    '/farmers': [
      UserRole.fieldFacilitator,
      UserRole.agronomist,
      UserRole.projectManager,
    ],
    '/cohorts': [UserRole.agronomist, UserRole.projectManager],
    '/warehouse': [UserRole.agronomist, UserRole.projectManager],
    '/vsla-meeting': [
      UserRole.fieldFacilitator,
      UserRole.agronomist,
      UserRole.projectManager,
    ],
    '/input-invoices': [
      UserRole.fieldFacilitator,
      UserRole.agronomist,
      UserRole.projectManager,
    ],
    '/sync-status': [
      UserRole.fieldFacilitator,
      UserRole.agronomist,
      UserRole.projectManager,
    ],
    '/executive-dashboard': [UserRole.projectManager],
  };

  /// Returns true when [userRole] is allowed to access [routeName].
  static bool canAccess(UserRole userRole, String routeName) {
    final allowed = _routePermissions[routeName];
    if (allowed == null) return true; // no restriction registered
    return allowed.contains(userRole);
  }
}

/// Convenience wrapper: returns [screen] if the current user may access
/// [routeName], otherwise returns the Access-Denied screen.
Widget guardedRoute(
  BuildContext context, {
  required Widget screen,
  required String routeName,
}) {
  final auth = Provider.of<AuthProvider>(context, listen: false);
  if (RouteGuard.canAccess(auth.userRole, routeName)) {
    return screen;
  }
  return const AccessDeniedScreen();
}
