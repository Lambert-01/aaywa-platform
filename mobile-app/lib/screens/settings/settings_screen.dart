import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../providers/sync_provider.dart';
import '../../services/api_service.dart';
import '../../theme/design_system.dart';
import '../../widgets/common/aaywa_card.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  bool _notificationsEmail = true;
  bool _notificationsPush = true;
  String _selectedLanguage = 'English';

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadSettings();
    });
  }

  void _loadSettings() {
    final auth = Provider.of<AuthProvider>(context, listen: false);
    if (auth.user != null) {
      setState(() {
        _selectedLanguage = auth.user?['language'] ?? 'English';
        // Check preferences map
        final prefs = auth.user?['preferences'];
        if (prefs != null && prefs is Map) {
          _notificationsPush = prefs['push_notifications'] ?? true;
          _notificationsEmail = prefs['email_notifications'] ?? true;
        }
      });
    }
  }

  Future<void> _updateSupport(String key, dynamic value) async {
    final auth = Provider.of<AuthProvider>(context, listen: false);
    // Optimistic update
    setState(() {
      if (key == 'language') _selectedLanguage = value;
      if (key == 'push_notifications') _notificationsPush = value;
      if (key == 'email_notifications') _notificationsEmail = value;
    });

    try {
      Map<String, dynamic> updates = {};

      if (key == 'language') {
        updates['language'] = value;
      } else {
        // Handle preferences object merging
        final currentPrefs =
            Map<String, dynamic>.from(auth.user?['preferences'] ?? {});
        currentPrefs[key] = value;
        updates['preferences'] = currentPrefs;
      }

      await auth.updateProfile(updates);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
              content: Text('Settings saved'), duration: Duration(seconds: 1)),
        );
      }
    } catch (e) {
      // Revert on error
      _loadSettings();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
              content: Text('Failed to save settings: $e'),
              backgroundColor: AppColors.error),
        );
      }
    }
  }

  // Edit Profile Dialog
  void _showEditProfileDialog(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context, listen: false);
    final _nameController = TextEditingController(
        text: auth.user?['full_name'] ?? auth.user?['name']);
    final _phoneController = TextEditingController(text: auth.user?['phone']);
    bool _isUpdating = false;

    showDialog(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setState) => AlertDialog(
          title: const Text('Edit Profile'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: _nameController,
                decoration: const InputDecoration(labelText: 'Full Name'),
              ),
              const SizedBox(height: 16),
              TextField(
                controller: _phoneController,
                decoration: const InputDecoration(labelText: 'Phone Number'),
                keyboardType: TextInputType.phone,
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel'),
            ),
            ElevatedButton(
              onPressed: _isUpdating
                  ? null
                  : () async {
                      setState(() => _isUpdating = true);
                      try {
                        await auth.updateProfile({
                          'full_name': _nameController.text,
                          'phone': _phoneController.text,
                        });
                        if (context.mounted) Navigator.pop(context);
                      } catch (e) {
                        setState(() => _isUpdating = false);
                        if (context.mounted) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(content: Text('Error: $e')),
                          );
                        }
                      }
                    },
              child: _isUpdating
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(strokeWidth: 2))
                  : const Text('Save'),
            ),
          ],
        ),
      ),
    );
  }

  // Change Password Dialog
  void _showChangePasswordDialog(BuildContext context) {
    final _oldPasswordController = TextEditingController();
    final _newPasswordController = TextEditingController();
    bool _isUpdating = false;

    showDialog(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setState) => AlertDialog(
          title: const Text('Change Password'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: _oldPasswordController,
                decoration:
                    const InputDecoration(labelText: 'Current Password'),
                obscureText: true,
              ),
              const SizedBox(height: 16),
              TextField(
                controller: _newPasswordController,
                decoration: const InputDecoration(labelText: 'New Password'),
                obscureText: true,
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel'),
            ),
            ElevatedButton(
              onPressed: _isUpdating
                  ? null
                  : () async {
                      setState(() => _isUpdating = true);
                      final api = ApiService();
                      try {
                        await api.post('/auth/change-password', {
                          'old_password': _oldPasswordController.text,
                          'new_password': _newPasswordController.text,
                        });
                        if (context.mounted) {
                          Navigator.pop(context);
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(
                                content: Text('Password changed successfully')),
                          );
                        }
                      } catch (e) {
                        setState(() => _isUpdating = false);
                        if (context.mounted) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(content: Text('Error: $e')),
                          );
                        }
                      }
                    },
              child: _isUpdating
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(strokeWidth: 2))
                  : const Text('Update'),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);
    final sync = Provider.of<SyncProvider>(context);
    final user = auth.user;

    return Scaffold(
      backgroundColor: AppColors.backgroundGray,
      appBar: AppBar(
        title: const Text('Settings'),
        backgroundColor: AppColors.surfaceWhite,
        foregroundColor: AppColors.textDark,
        elevation: 0,
      ),
      body: ListView(
        padding: const EdgeInsets.all(AppSpacing.md),
        children: [
          // User Profile Section
          _buildSectionHeader('ACCOUNT PROFILE'),
          AaywaCard(
            padding: const EdgeInsets.all(AppSpacing.md),
            child: Column(
              children: [
                Row(
                  children: [
                    CircleAvatar(
                      radius: 30,
                      backgroundColor:
                          AppColors.primaryGreen.withValues(alpha: 0.1),
                      child: Text(
                        (user?['name'] ?? 'U')[0].toUpperCase(),
                        style: AppTypography.h3
                            .copyWith(color: AppColors.primaryGreen),
                      ),
                    ),
                    const SizedBox(width: AppSpacing.md),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(user?['name'] ?? 'User Name',
                              style: AppTypography.h4),
                          Text(user?['email'] ?? 'user@example.com',
                              style: AppTypography.bodySmall),
                          const SizedBox(height: AppSpacing.xs),
                          Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 8, vertical: 2),
                            decoration: BoxDecoration(
                              color:
                                  AppColors.primaryGreen.withValues(alpha: 0.1),
                              borderRadius:
                                  BorderRadius.circular(AppRadius.full),
                            ),
                            child: Text(
                              (user?['role'] ?? 'Staff')
                                  .toString()
                                  .toUpperCase(),
                              style: AppTypography.labelSmall.copyWith(
                                color: AppColors.primaryGreen,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                    IconButton(
                      icon:
                          const Icon(Icons.edit, color: AppColors.primaryGreen),
                      onPressed: () => _showEditProfileDialog(context),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: AppSpacing.lg),

          // Security Settings
          _buildSectionHeader('SECURITY'),
          AaywaCard(
            child: Column(
              children: [
                _buildSettingTile(
                  icon: Icons.fingerprint,
                  title: 'Biometric Login',
                  trailing: Switch(
                    value: false,
                    onChanged: (val) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Coming soon')),
                      );
                    },
                    activeColor: AppColors.primaryGreen,
                  ),
                ),
                const Divider(height: 1),
                ListTile(
                  leading: const Icon(Icons.lock_outline,
                      color: AppColors.textMedium),
                  title: const Text('Change Password',
                      style: AppTypography.bodyMedium),
                  trailing: const Icon(Icons.chevron_right, size: 20),
                  onTap: () => _showChangePasswordDialog(context),
                ),
              ],
            ),
          ),
          const SizedBox(height: AppSpacing.lg),

          // App Settings Section
          _buildSectionHeader('APP SETTINGS'),
          AaywaCard(
            child: Column(
              children: [
                _buildSettingTile(
                  icon: Icons.language,
                  title: 'Language',
                  trailing: DropdownButton<String>(
                    value: _selectedLanguage,
                    underline: const SizedBox(),
                    onChanged: (String? newValue) {
                      if (newValue != null) {
                        _updateSupport('language', newValue);
                      }
                    },
                    items: <String>['English', 'French']
                        .map<DropdownMenuItem<String>>((String value) {
                      return DropdownMenuItem<String>(
                        value: value,
                        child: Text(value, style: AppTypography.bodyMedium),
                      );
                    }).toList(),
                  ),
                ),
                const Divider(height: 1),
                _buildSettingTile(
                  icon: Icons.notifications_none,
                  title: 'Push Notifications',
                  trailing: Switch(
                    value: _notificationsPush,
                    onChanged: (val) =>
                        _updateSupport('push_notifications', val),
                    activeColor: AppColors.primaryGreen,
                  ),
                ),
                const Divider(height: 1),
                _buildSettingTile(
                  icon: Icons.alternate_email,
                  title: 'Email Notifications',
                  trailing: Switch(
                    value: _notificationsEmail,
                    onChanged: (val) =>
                        _updateSupport('email_notifications', val),
                    activeColor: AppColors.primaryGreen,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: AppSpacing.lg),

          // Data & Sync Section
          _buildSectionHeader('DATA & SYNCHRONIZATION'),
          AaywaCard(
            child: Column(
              children: [
                _buildSettingTile(
                  icon: Icons.sync,
                  title: 'Last Synchronized',
                  trailing: Text(
                    _formatSyncTime(sync.lastSyncTime),
                    style: AppTypography.bodySmall,
                  ),
                ),
                const Divider(height: 1),
                ListTile(
                  leading: const Icon(Icons.cloud_upload_outlined,
                      color: AppColors.primaryGreen),
                  title: const Text('Force Manual Sync',
                      style: AppTypography.bodyMedium),
                  subtitle: const Text('Upload all offline changes now',
                      style: AppTypography.caption),
                  onTap: sync.isSyncing ? null : () => sync.syncData(),
                  trailing: sync.isSyncing
                      ? const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(strokeWidth: 2))
                      : const Icon(Icons.chevron_right, size: 20),
                ),
              ],
            ),
          ),
          const SizedBox(height: AppSpacing.lg),

          // Support Section
          _buildSectionHeader('SUPPORT'),
          AaywaCard(
            child: Column(
              children: [
                ListTile(
                  leading: const Icon(Icons.help_outline,
                      color: AppColors.textMedium),
                  title: const Text('Help Center',
                      style: AppTypography.bodyMedium),
                  trailing: const Icon(Icons.chevron_right, size: 20),
                  onTap: () {},
                ),
                const Divider(height: 1),
                ListTile(
                  leading:
                      const Icon(Icons.policy, color: AppColors.textMedium),
                  title: const Text('Privacy Policy',
                      style: AppTypography.bodyMedium),
                  trailing: const Icon(Icons.chevron_right, size: 20),
                  onTap: () {},
                ),
              ],
            ),
          ),
          const SizedBox(height: AppSpacing.xl),

          // Logout Button
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
            child: OutlinedButton.icon(
              onPressed: () {
                Navigator.pop(context);
                auth.logout();
              },
              icon: const Icon(Icons.logout, color: AppColors.error),
              label: Text('LOGOUT ACCOUNT',
                  style: AppTypography.button.copyWith(color: AppColors.error)),
              style: OutlinedButton.styleFrom(
                side: const BorderSide(color: AppColors.error),
                padding: const EdgeInsets.symmetric(vertical: AppSpacing.md),
              ),
            ),
          ),
          const SizedBox(height: AppSpacing.xl),
          const Center(
            child: Text(
              'AAYWA Platform v1.0.1',
              style: AppTypography.caption,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Padding(
      padding:
          const EdgeInsets.only(left: AppSpacing.xs, bottom: AppSpacing.sm),
      child: Text(
        title,
        style: AppTypography.overline.copyWith(color: AppColors.textMedium),
      ),
    );
  }

  Widget _buildSettingTile({
    required IconData icon,
    required String title,
    required Widget trailing,
  }) {
    return ListTile(
      leading: Icon(icon, color: AppColors.textMedium, size: 22),
      title: Text(title, style: AppTypography.bodyMedium),
      trailing: trailing,
    );
  }

  String _formatSyncTime(String? time) {
    if (time == null) return 'Never';
    final dt = DateTime.tryParse(time);
    if (dt == null) return 'N/A';
    // Simplified format
    return '${dt.hour}:${dt.minute.toString().padLeft(2, '0')}';
  }
}
