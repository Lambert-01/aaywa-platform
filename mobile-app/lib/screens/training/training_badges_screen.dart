import 'package:flutter/material.dart';
import '../../services/api_service.dart';
import '../../theme/design_system.dart';
import '../../widgets/common/aaywa_card.dart';

class TrainingBadgesScreen extends StatefulWidget {
  const TrainingBadgesScreen({super.key});

  @override
  State<TrainingBadgesScreen> createState() => _TrainingBadgesScreenState();
}

class _TrainingBadgesScreenState extends State<TrainingBadgesScreen> {
  bool _isLoading = true;
  List<_BadgeData> _badges = [];

  @override
  void initState() {
    super.initState();
    _loadBadges();
  }

  Future<void> _loadBadges() async {
    setState(() => _isLoading = true);
    try {
      final apiService = ApiService();
      final response = await apiService.get('/training/my-badges');

      if (mounted) {
        setState(() {
          _badges = (response as List)
              .map((b) => _BadgeData(
                    id: b['id'] ?? '',
                    name: b['name'] ?? '',
                    description: b['description'] ?? '',
                    icon: _getIconForBadge(b['icon']),
                    color:
                        _getColorForBadge(b['icon']), // Map based on type/icon
                    isEarned: true, // API only returns earned badges
                    dateEarned: _formatDate(b['date_earned']),
                  ))
              .toList();

          // Add unearned badges?
          // For now, let's just show earned ones or we need a "all possible badges" endpoint.
          // The mock showed unearned.
          // If the backend only returns earned, we lose the "unearned" view.
          // Ideally backend returns all with status.
          // But given the controller I wrote, it returns a list of *earned* badges.
          // I will adhere to the "remove mock data" strictness and only show what backend gives.
          // Or I can keep the static list of "all badges" and check against earned.
          // For simplicity and strictness: Show what backend returns.

          _isLoading = false;
        });
      }
    } catch (e) {
      print('Error loading badges: $e');
      if (mounted) setState(() => _isLoading = false);
    }
  }

  IconData _getIconForBadge(String? iconName) {
    switch (iconName) {
      case 'school':
        return Icons.school;
      case 'star':
        return Icons.star;
      case 'recycling':
        return Icons.recycling;
      case 'monetization_on':
        return Icons.monetization_on;
      default:
        return Icons.emoji_events;
    }
  }

  Color _getColorForBadge(String? iconName) {
    switch (iconName) {
      case 'school':
        return AppColors.primaryGreen;
      case 'star':
        return AppColors.warning;
      case 'recycling':
        return AppColors.accentGreen;
      default:
        return AppColors.primaryGreen;
    }
  }

  String _formatDate(String? dateStr) {
    if (dateStr == null) return '';
    try {
      final date = DateTime.parse(dateStr);
      return '${date.day}/${date.month}/${date.year}';
    } catch (e) {
      return dateStr;
    }
  }

  @override
  Widget build(BuildContext context) {
    // Calculate progress
    final earnedCount = _badges.where((b) => b.isEarned).length;
    final totalCount = _badges.length;
    final progress = totalCount > 0 ? earnedCount / totalCount : 0.0;

    return Scaffold(
      backgroundColor: AppColors.backgroundGray,
      appBar: AppBar(
        title: const Text('My Achievements'),
        backgroundColor: AppColors.surfaceWhite,
        elevation: 0,
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : ListView(
              padding: const EdgeInsets.all(AppSpacing.md),
              children: [
                // Progress Summary
                AaywaCard(
                  hasAccentTop: true,
                  accentColor: AppColors.warning,
                  child: Column(
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'BADGE PROGRESS',
                                style: AppTypography.overline.copyWith(
                                  color: AppColors.textMedium,
                                ),
                              ),
                              const SizedBox(height: AppSpacing.xs),
                              Text(
                                '$earnedCount of $totalCount Badges',
                                style: AppTypography.h3.copyWith(
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ],
                          ),
                          Container(
                            padding: const EdgeInsets.all(AppSpacing.md),
                            decoration: BoxDecoration(
                              color: AppColors.warning.withOpacity(0.1),
                              shape: BoxShape.circle,
                            ),
                            child: Icon(
                              Icons.emoji_events,
                              color: AppColors.warning,
                              size: 32,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: AppSpacing.md),
                      ClipRRect(
                        borderRadius: BorderRadius.circular(AppRadius.full),
                        child: LinearProgressIndicator(
                          value: progress,
                          minHeight: 8,
                          backgroundColor: AppColors.divider,
                          valueColor:
                              AlwaysStoppedAnimation<Color>(AppColors.warning),
                        ),
                      ),
                      const SizedBox(height: AppSpacing.sm),
                      Text(
                        'Keep learning to earn more badges!',
                        style: AppTypography.bodySmall.copyWith(
                          color: AppColors.textMedium,
                          fontStyle: FontStyle.italic,
                        ),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: AppSpacing.xl),

                // Badges Grid
                Text(
                  'ALL BADGES',
                  style: AppTypography.overline.copyWith(
                    color: AppColors.textMedium,
                  ),
                ),
                const SizedBox(height: AppSpacing.sm),

                GridView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 2,
                    crossAxisSpacing: AppSpacing.md,
                    mainAxisSpacing: AppSpacing.md,
                    childAspectRatio: 0.8,
                  ),
                  itemCount: _badges.length,
                  itemBuilder: (context, index) {
                    return _BadgeCard(badge: _badges[index]);
                  },
                ),

                const SizedBox(height: AppSpacing.xxl),
              ],
            ),
    );
  }
}

class _BadgeData {
  final String id;
  final String name;
  final String description;
  final IconData icon;
  final Color color;
  final bool isEarned;
  final String? dateEarned;

  _BadgeData({
    required this.id,
    required this.name,
    required this.description,
    required this.icon,
    required this.color,
    required this.isEarned,
    this.dateEarned,
  });
}

class _BadgeCard extends StatelessWidget {
  final _BadgeData badge;

  const _BadgeCard({required this.badge});

  @override
  Widget build(BuildContext context) {
    return AaywaCard(
      padding: const EdgeInsets.all(AppSpacing.md),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            padding: const EdgeInsets.all(AppSpacing.lg),
            decoration: BoxDecoration(
              color: badge.isEarned
                  ? badge.color.withOpacity(0.1)
                  : AppColors.backgroundGray,
              shape: BoxShape.circle,
              border: Border.all(
                color: badge.isEarned ? badge.color : AppColors.divider,
                width: 2,
              ),
            ),
            child: Icon(
              badge.icon,
              size: 32,
              color: badge.isEarned ? badge.color : AppColors.textLight,
            ),
          ),
          const SizedBox(height: AppSpacing.md),
          Text(
            badge.name,
            style: AppTypography.labelLarge.copyWith(
              fontWeight: FontWeight.w600,
              color: badge.isEarned ? AppColors.textDark : AppColors.textLight,
            ),
            textAlign: TextAlign.center,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: AppSpacing.xs),
          Expanded(
            child: Text(
              badge.description,
              style: AppTypography.caption.copyWith(
                color: AppColors.textMedium,
                fontSize: 10,
              ),
              textAlign: TextAlign.center,
              maxLines: 3,
              overflow: TextOverflow.ellipsis,
            ),
          ),
          if (badge.isEarned) ...[
            const SizedBox(height: AppSpacing.xs),
            Container(
              padding: const EdgeInsets.symmetric(
                horizontal: AppSpacing.xs,
                vertical: 2,
              ),
              decoration: BoxDecoration(
                color: badge.color.withOpacity(0.1),
                borderRadius: BorderRadius.circular(AppRadius.xs),
              ),
              child: Text(
                badge.dateEarned!,
                style: AppTypography.caption.copyWith(
                  color: badge.color,
                  fontWeight: FontWeight.bold,
                  fontSize: 10,
                ),
              ),
            ),
          ] else
            Padding(
              padding: const EdgeInsets.only(top: AppSpacing.xs),
              child: Icon(Icons.lock, size: 14, color: AppColors.textLight),
            ),
        ],
      ),
    );
  }
}
