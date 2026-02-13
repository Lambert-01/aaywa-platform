import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../theme/design_system.dart';
import '../../widgets/common/aaywa_card.dart';
import '../../providers/admin_provider.dart';
import '../../providers/auth_provider.dart';
import '../../models/admin_metrics.dart';

class UserManagementScreen extends StatefulWidget {
  const UserManagementScreen({super.key});

  @override
  State<UserManagementScreen> createState() => _UserManagementScreenState();
}

class _UserManagementScreenState extends State<UserManagementScreen> {
  String? _selectedRole;
  String? _selectedStatus;
  final TextEditingController _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final authProvider = context.read<AuthProvider>();
      final adminProvider = context.read<AdminProvider>();
      if (authProvider.token != null) {
        adminProvider.setAuthToken(authProvider.token!);
      }
      adminProvider.loadUsers();
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _applyFilters() {
    context.read<AdminProvider>().loadUsers(
          role: _selectedRole,
          status: _selectedStatus,
          search:
              _searchController.text.isNotEmpty ? _searchController.text : null,
        );
  }

  Future<void> _toggleUserStatus(AdminUser user) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(user.isActive ? 'Deactivate User' : 'Activate User'),
        content: Text(
          user.isActive
              ? 'Are you sure you want to deactivate ${user.fullName}? They will not be able to access the system.'
              : 'Are you sure you want to activate ${user.fullName}? They will regain access to the system.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(context, true),
            style: ElevatedButton.styleFrom(
              backgroundColor:
                  user.isActive ? Colors.red : AppColors.primaryGreen,
              foregroundColor: Colors.white,
            ),
            child: Text(user.isActive ? 'Deactivate' : 'Activate'),
          ),
        ],
      ),
    );

    if (confirmed == true && mounted) {
      final success = await context.read<AdminProvider>().updateUserStatus(
            user.id,
            !user.isActive,
          );

      if (success && mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              user.isActive
                  ? 'User deactivated successfully'
                  : 'User activated successfully',
            ),
            backgroundColor: AppColors.success,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.backgroundGray,
      appBar: AppBar(
        title: const Text('User Management'),
        backgroundColor: AppColors.primaryGreen,
        foregroundColor: Colors.white,
      ),
      body: Column(
        children: [
          // Filters Section
          Container(
            color: Colors.white,
            padding: const EdgeInsets.all(AppSpacing.md),
            child: Column(
              children: [
                // Search Bar
                TextField(
                  controller: _searchController,
                  decoration: InputDecoration(
                    hintText: 'Search by name or email...',
                    prefixIcon: const Icon(Icons.search),
                    suffixIcon: _searchController.text.isNotEmpty
                        ? IconButton(
                            icon: const Icon(Icons.clear),
                            onPressed: () {
                              _searchController.clear();
                              _applyFilters();
                            },
                          )
                        : null,
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(AppRadius.md),
                    ),
                    contentPadding: const EdgeInsets.symmetric(
                        horizontal: 16, vertical: 12),
                  ),
                  onSubmitted: (_) => _applyFilters(),
                ),
                const SizedBox(height: AppSpacing.md),

                // Filter Row
                Row(
                  children: [
                    Expanded(
                      child: DropdownButtonFormField<String>(
                        value: _selectedRole,
                        decoration: InputDecoration(
                          labelText: 'Role',
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(AppRadius.md),
                          ),
                          contentPadding: const EdgeInsets.symmetric(
                              horizontal: 12, vertical: 8),
                        ),
                        items: [
                          const DropdownMenuItem(
                              value: null, child: Text('All Roles')),
                          const DropdownMenuItem(
                              value: 'farmer', child: Text('Farmer')),
                          const DropdownMenuItem(
                              value: 'field_facilitator',
                              child: Text('Field Facilitator')),
                          const DropdownMenuItem(
                              value: 'agronomist', child: Text('Agronomist')),
                          const DropdownMenuItem(
                              value: 'project_manager',
                              child: Text('Project Manager')),
                        ],
                        onChanged: (value) {
                          setState(() => _selectedRole = value);
                          _applyFilters();
                        },
                      ),
                    ),
                    const SizedBox(width: AppSpacing.md),
                    Expanded(
                      child: DropdownButtonFormField<String>(
                        value: _selectedStatus,
                        decoration: InputDecoration(
                          labelText: 'Status',
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(AppRadius.md),
                          ),
                          contentPadding: const EdgeInsets.symmetric(
                              horizontal: 12, vertical: 8),
                        ),
                        items: const [
                          DropdownMenuItem(
                              value: null, child: Text('All Status')),
                          DropdownMenuItem(
                              value: 'active', child: Text('Active')),
                          DropdownMenuItem(
                              value: 'inactive', child: Text('Inactive')),
                        ],
                        onChanged: (value) {
                          setState(() => _selectedStatus = value);
                          _applyFilters();
                        },
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),

          // Users List
          Expanded(
            child: Consumer<AdminProvider>(
              builder: (context, provider, child) {
                if (provider.isLoading && provider.users.isEmpty) {
                  return const Center(child: CircularProgressIndicator());
                }

                if (provider.error != null) {
                  return Center(
                    child: Padding(
                      padding: const EdgeInsets.all(AppSpacing.xl),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.error_outline,
                              size: 64, color: Colors.red),
                          const SizedBox(height: AppSpacing.md),
                          Text(
                            'Error loading users',
                            style: AppTypography.h3
                                .copyWith(fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(height: AppSpacing.sm),
                          Text(
                            provider.error!,
                            textAlign: TextAlign.center,
                            style: AppTypography.bodyMedium
                                .copyWith(color: AppColors.textMedium),
                          ),
                          const SizedBox(height: AppSpacing.lg),
                          ElevatedButton.icon(
                            onPressed: _applyFilters,
                            icon: const Icon(Icons.refresh),
                            label: const Text('Retry'),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppColors.primaryGreen,
                              foregroundColor: Colors.white,
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                }

                if (provider.users.isEmpty) {
                  return Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.people_outline,
                            size: 64, color: Colors.grey.shade400),
                        const SizedBox(height: AppSpacing.md),
                        Text(
                          'No users found',
                          style: AppTypography.h3
                              .copyWith(color: AppColors.textMedium),
                        ),
                      ],
                    ),
                  );
                }

                return RefreshIndicator(
                  onRefresh: () => provider.loadUsers(
                    role: _selectedRole,
                    status: _selectedStatus,
                    search: _searchController.text.isNotEmpty
                        ? _searchController.text
                        : null,
                  ),
                  child: ListView.builder(
                    padding: const EdgeInsets.all(AppSpacing.md),
                    itemCount: provider.users.length,
                    itemBuilder: (context, index) {
                      final user = provider.users[index];
                      return _UserCard(
                        user: user,
                        onToggleStatus: () => _toggleUserStatus(user),
                      );
                    },
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

class _UserCard extends StatelessWidget {
  final AdminUser user;
  final VoidCallback onToggleStatus;

  const _UserCard({
    required this.user,
    required this.onToggleStatus,
  });

  String _getRoleBadgeLabel(String role) {
    switch (role) {
      case 'farmer':
        return 'Farmer';
      case 'field_facilitator':
        return 'Field Facilitator';
      case 'agronomist':
        return 'Agronomist';
      case 'project_manager':
        return 'Project Manager';
      case 'admin':
        return 'Admin';
      default:
        return role.toUpperCase();
    }
  }

  Color _getRoleBadgeColor(String role) {
    switch (role) {
      case 'farmer':
        return const Color(0xFF10B981);
      case 'field_facilitator':
        return const Color(0xFF6366F1);
      case 'agronomist':
        return const Color(0xFFF59E0B);
      case 'project_manager':
        return const Color(0xFFEF4444);
      case 'admin':
        return const Color(0xFF8B5CF6);
      default:
        return AppColors.textMedium;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: AppSpacing.md),
      child: AaywaCard(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                CircleAvatar(
                  radius: 24,
                  backgroundColor:
                      _getRoleBadgeColor(user.role).withValues(alpha: 0.1),
                  child: Text(
                    user.fullName.isNotEmpty
                        ? user.fullName[0].toUpperCase()
                        : 'U',
                    style: AppTypography.h3.copyWith(
                      color: _getRoleBadgeColor(user.role),
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                const SizedBox(width: AppSpacing.md),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        user.fullName,
                        style: AppTypography.bodyLarge
                            .copyWith(fontWeight: FontWeight.bold),
                      ),
                      Text(
                        user.email,
                        style: AppTypography.bodySmall
                            .copyWith(color: AppColors.textMedium),
                      ),
                      if (user.phone != null)
                        Text(
                          user.phone!,
                          style: AppTypography.caption
                              .copyWith(color: AppColors.textMedium),
                        ),
                    ],
                  ),
                ),
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: user.isActive
                        ? const Color(0xFF10B981).withValues(alpha: 0.1)
                        : Colors.grey.shade200,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: user.isActive
                          ? const Color(0xFF10B981)
                          : Colors.grey.shade400,
                    ),
                  ),
                  child: Text(
                    user.isActive ? 'Active' : 'Inactive',
                    style: AppTypography.caption.copyWith(
                      color: user.isActive
                          ? const Color(0xFF10B981)
                          : Colors.grey.shade600,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ],
            ),
            const Divider(height: 24),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                  decoration: BoxDecoration(
                    color: _getRoleBadgeColor(user.role).withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Row(
                    children: [
                      Icon(Icons.badge,
                          size: 14, color: _getRoleBadgeColor(user.role)),
                      const SizedBox(width: 4),
                      Text(
                        _getRoleBadgeLabel(user.role),
                        style: AppTypography.caption.copyWith(
                          color: _getRoleBadgeColor(user.role),
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ),
                if (user.cohortName != null)
                  Row(
                    children: [
                      const Icon(Icons.groups,
                          size: 14, color: AppColors.textMedium),
                      const SizedBox(width: 4),
                      Text(
                        user.cohortName!,
                        style: AppTypography.caption
                            .copyWith(color: AppColors.textMedium),
                      ),
                    ],
                  ),
              ],
            ),
            if (user.lastLogin != null) ...[
              const SizedBox(height: AppSpacing.sm),
              Row(
                children: [
                  const Icon(Icons.access_time,
                      size: 14, color: AppColors.textMedium),
                  const SizedBox(width: 4),
                  Text(
                    'Last login: ${user.lastLogin!.toString().substring(0, 16)}',
                    style: AppTypography.caption
                        .copyWith(color: AppColors.textMedium),
                  ),
                ],
              ),
            ],
            const SizedBox(height: AppSpacing.md),
            SizedBox(
              width: double.infinity,
              child: OutlinedButton.icon(
                onPressed: onToggleStatus,
                icon: Icon(user.isActive ? Icons.block : Icons.check_circle),
                label:
                    Text(user.isActive ? 'Deactivate User' : 'Activate User'),
                style: OutlinedButton.styleFrom(
                  foregroundColor:
                      user.isActive ? Colors.red : AppColors.primaryGreen,
                  side: BorderSide(
                      color:
                          user.isActive ? Colors.red : AppColors.primaryGreen),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
