import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../providers/sync_provider.dart';
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
            child: Row(
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
                          color: AppColors.primaryGreen.withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(AppRadius.full),
                        ),
                        child: Text(
                          (user?['role'] ?? 'Staff').toString().toUpperCase(),
                          style: AppTypography.labelSmall.copyWith(
                            color: AppColors.primaryGreen,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ],
                  ),
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
                        setState(() => _selectedLanguage = newValue);
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
                        setState(() => _notificationsPush = val),
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
                        setState(() => _notificationsEmail = val),
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
              'AAYWA Platform v1.0.0',
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
