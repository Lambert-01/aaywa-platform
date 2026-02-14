import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../services/api_service.dart';

/// User roles matching the backend JWT payload values.
enum UserRole {
  farmer,
  champion,
  fieldFacilitator,
  agronomist,
  projectManager,
}

class AuthProvider with ChangeNotifier {
  bool _isAuthenticated = false;
  String? _token;
  Map<String, dynamic>? _user;
  bool _isLoading = false;

  bool get isAuthenticated => _isAuthenticated;
  bool get isLoading => _isLoading;
  Map<String, dynamic>? get user => _user;
  String? get token => _token;

  // ── Role getters ──────────────────────────────────────────────
  /// Parses the role string from the user payload into a type-safe enum.
  UserRole get userRole {
    final roleStr = _user?['role']?.toString().toLowerCase() ?? 'farmer';
    switch (roleStr) {
      case 'champion':
        return UserRole.champion;
      case 'field_facilitator':
        return UserRole.fieldFacilitator;
      case 'agronomist':
        return UserRole.agronomist;
      case 'project_manager':
        return UserRole.projectManager;
      default:
        return UserRole.farmer;
    }
  }

  String get roleDisplayName {
    switch (userRole) {
      case UserRole.farmer:
        return 'Farmer';
      case UserRole.champion:
        return 'Champion';
      case UserRole.fieldFacilitator:
        return 'Field Facilitator';
      case UserRole.agronomist:
        return 'Agronomist';
      case UserRole.projectManager:
        return 'Project Manager';
    }
  }

  bool get isFarmer => userRole == UserRole.farmer;
  bool get isStaff =>
      userRole == UserRole.fieldFacilitator || userRole == UserRole.agronomist;
  bool get isAdmin => userRole == UserRole.projectManager;

  final ApiService _apiService = ApiService();

  AuthProvider() {
    checkAuthStatus();
  }

  Future<void> checkAuthStatus() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('token');
    if (token != null) {
      _isAuthenticated = true;
      _token = token;
      // Restore user data from prefs
      final role = prefs.getString('user_role');
      final name = prefs.getString('user_name');
      final email = prefs.getString('user_email');
      if (role != null) {
        _user = {
          'role': role,
          'name': name ?? 'User',
          'email': email ?? '',
        };
      }
      notifyListeners();
    }
  }

  Future<void> login(String email, String password) async {
    _isLoading = true;
    notifyListeners();

    try {
      debugPrint('[AUTH] Attempting login for: $email');
      final data = await _apiService.login(email, password);

      debugPrint('[AUTH] Login response: $data');

      _token = data['token'];
      _user =
          data['user'] != null ? Map<String, dynamic>.from(data['user']) : null;
      _isAuthenticated = true;

      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('token', _token!);
      // Persist user data so role survives app restart
      if (_user != null) {
        await prefs.setString(
            'user_role', _user!['role']?.toString() ?? 'farmer');
        await prefs.setString(
            'user_name',
            _user!['full_name']?.toString() ??
                _user!['name']?.toString() ??
                'User');
        await prefs.setString('user_email', _user!['email']?.toString() ?? '');
      }

      debugPrint('[AUTH] Login successful – role: ${userRole.name}');

      notifyListeners();
    } catch (e) {
      debugPrint('[AUTH] Login error: $e');
      rethrow;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> updateProfile(Map<String, dynamic> updates) async {
    try {
      final response = await _apiService.patch('/auth/profile', updates);
      if (response['success'] == true && response['user'] != null) {
        // Update local user data
        final updatedUser = Map<String, dynamic>.from(response['user']);

        // Preserve role if not in response
        if (!updatedUser.containsKey('role')) {
          updatedUser['role'] = _user?['role'];
        }

        _user = updatedUser;

        // Persist critical fields
        final prefs = await SharedPreferences.getInstance();
        if (updatedUser['full_name'] != null) {
          await prefs.setString('user_name', updatedUser['full_name']);
        }
        if (updatedUser['email'] != null) {
          await prefs.setString('user_email', updatedUser['email']);
        }

        notifyListeners();
      }
    } catch (e) {
      debugPrint('[AUTH] Update profile error: $e');
      rethrow;
    }
  }

  Future<void> logout() async {
    _isAuthenticated = false;
    _token = null;
    _user = null;

    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('token');
    await prefs.remove('user_role');
    await prefs.remove('user_name');
    await prefs.remove('user_email');

    notifyListeners();
  }
}
