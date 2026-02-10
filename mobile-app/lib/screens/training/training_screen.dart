import 'package:flutter/material.dart';
import '../../services/api_service.dart';
import '../../theme/design_system.dart';
import '../../widgets/common/aaywa_button.dart';
import '../../widgets/common/aaywa_card.dart';

class TrainingScreen extends StatefulWidget {
  const TrainingScreen({super.key});

  @override
  State<TrainingScreen> createState() => _TrainingScreenState();
}

class _TrainingScreenState extends State<TrainingScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  bool _isLoading = true;
  List<Map<String, dynamic>> _upcomingTrainings = [];
  List<Map<String, dynamic>> _completedTrainings = [];
  int _badgesEarned = 0;
  int _totalAttendance = 0;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _loadTrainingData();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _loadTrainingData() async {
    setState(() => _isLoading = true);

    try {
      final apiService = ApiService();
      final response = await apiService.get('/training/schedule');

      setState(() {
        _upcomingTrainings = List<Map<String, dynamic>>.from(
          response['upcoming'] ?? [],
        );
        _completedTrainings = List<Map<String, dynamic>>.from(
          response['completed'] ?? [],
        );
        _badgesEarned = response['badges_earned'] ?? 0;
        _totalAttendance = response['total_attendance'] ?? 0;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.backgroundGray,
      appBar: AppBar(
        title: const Text('Training'),
        backgroundColor: AppColors.surfaceWhite,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.qr_code_scanner),
            onPressed: () {
              // TODO: Navigate to QR scanner
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('QR Scanner - Coming soon')),
              );
            },
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : Column(
              children: [
                // Stats Header
                _buildStatsHeader(),

                // Tab Bar
                Container(
                  color: AppColors.surfaceWhite,
                  child: TabBar(
                    controller: _tabController,
                    labelColor: AppColors.primaryGreen,
                    unselectedLabelColor: AppColors.textMedium,
                    indicatorColor: AppColors.primaryGreen,
                    tabs: const [
                      Tab(text: 'Upcoming'),
                      Tab(text: 'Completed'),
                    ],
                  ),
                ),

                // Tab Views
                Expanded(
                  child: TabBarView(
                    controller: _tabController,
                    children: [
                      _buildUpcomingTab(),
                      _buildCompletedTab(),
                    ],
                  ),
                ),
              ],
            ),
    );
  }

  Widget _buildStatsHeader() {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.md),
      color: AppColors.surfaceWhite,
      child: Row(
        children: [
          Expanded(
            child: _buildStatCard(
              'Badges Earned',
              '$_badgesEarned',
              Icons.emoji_events,
              AppColors.warning,
            ),
          ),
          const SizedBox(width: AppSpacing.md),
          Expanded(
            child: _buildStatCard(
              'Total Attendance',
              '$_totalAttendance',
              Icons.check_circle,
              AppColors.success,
            ),
          ),
          const SizedBox(width: AppSpacing.md),
          Expanded(
            child: _buildStatCard(
              'This Month',
              '${_upcomingTrainings.length}',
              Icons.calendar_today,
              AppColors.blue,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatCard(
      String label, String value, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.md),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(AppRadius.md),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Column(
        children: [
          Icon(icon, color: color, size: 24),
          const SizedBox(height: AppSpacing.xs),
          Text(
            value,
            style: AppTypography.h3.copyWith(
              color: color,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: AppSpacing.xs),
          Text(
            label,
            style: AppTypography.caption.copyWith(
              color: AppColors.textMedium,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Widget _buildUpcomingTab() {
    if (_upcomingTrainings.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(AppSpacing.xxl),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                Icons.event_available,
                size: 64,
                color: AppColors.textLight.withOpacity(0.5),
              ),
              const SizedBox(height: AppSpacing.md),
              Text(
                'No upcoming trainings',
                style: AppTypography.h4.copyWith(
                  color: AppColors.textMedium,
                ),
              ),
              const SizedBox(height: AppSpacing.sm),
              Text(
                'New trainings will appear here',
                style: AppTypography.bodySmall.copyWith(
                  color: AppColors.textLight,
                ),
              ),
            ],
          ),
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(AppSpacing.md),
      itemCount: _upcomingTrainings.length,
      itemBuilder: (context, index) {
        final training = _upcomingTrainings[index];
        return _buildTrainingCard(training, isUpcoming: true);
      },
    );
  }

  Widget _buildCompletedTab() {
    if (_completedTrainings.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(AppSpacing.xxl),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                Icons.school_outlined,
                size: 64,
                color: AppColors.textLight.withOpacity(0.5),
              ),
              const SizedBox(height: AppSpacing.md),
              Text(
                'No completed trainings yet',
                style: AppTypography.h4.copyWith(
                  color: AppColors.textMedium,
                ),
              ),
            ],
          ),
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(AppSpacing.md),
      itemCount: _completedTrainings.length,
      itemBuilder: (context, index) {
        final training = _completedTrainings[index];
        return _buildTrainingCard(training, isUpcoming: false);
      },
    );
  }

  Widget _buildTrainingCard(Map<String, dynamic> training,
      {required bool isUpcoming}) {
    final title = training['title'] ?? 'Training Session';
    final date = training['date'] ?? 'TBD';
    final time = training['time'] ?? '';
    final location = training['location'] ?? '';
    final trainer = training['trainer'] ?? '';
    final badge = training['badge'];
    final attended = training['attended'] ?? false;

    return AaywaCard(
      padding: const EdgeInsets.all(AppSpacing.md),
      elevated: true,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                padding: const EdgeInsets.all(AppSpacing.sm),
                decoration: BoxDecoration(
                  color: isUpcoming
                      ? AppColors.blue.withOpacity(0.1)
                      : AppColors.success.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(AppRadius.sm),
                ),
                child: Icon(
                  isUpcoming ? Icons.event : Icons.check_circle,
                  color: isUpcoming ? AppColors.blue : AppColors.success,
                  size: 24,
                ),
              ),
              const SizedBox(width: AppSpacing.md),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: AppTypography.labelLarge.copyWith(
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: AppSpacing.xs),
                    Row(
                      children: [
                        Icon(
                          Icons.calendar_today,
                          size: 14,
                          color: AppColors.textMedium,
                        ),
                        const SizedBox(width: AppSpacing.xs),
                        Text(
                          date,
                          style: AppTypography.bodySmall.copyWith(
                            color: AppColors.textMedium,
                          ),
                        ),
                        if (time.isNotEmpty) ...[
                          const SizedBox(width: AppSpacing.sm),
                          Icon(
                            Icons.access_time,
                            size: 14,
                            color: AppColors.textMedium,
                          ),
                          const SizedBox(width: AppSpacing.xs),
                          Text(
                            time,
                            style: AppTypography.bodySmall.copyWith(
                              color: AppColors.textMedium,
                            ),
                          ),
                        ],
                      ],
                    ),
                  ],
                ),
              ),
              if (!isUpcoming && badge != null)
                Container(
                  padding: const EdgeInsets.all(AppSpacing.xs),
                  decoration: BoxDecoration(
                    color: AppColors.warning.withOpacity(0.1),
                    shape: BoxShape.circle,
                  ),
                  child: Icon(
                    Icons.emoji_events,
                    color: AppColors.warning,
                    size: 20,
                  ),
                ),
            ],
          ),
          const SizedBox(height: AppSpacing.sm),
          const Divider(),
          const SizedBox(height: AppSpacing.sm),
          if (location.isNotEmpty)
            Row(
              children: [
                Icon(Icons.location_on, size: 16, color: AppColors.textMedium),
                const SizedBox(width: AppSpacing.xs),
                Text(
                  location,
                  style: AppTypography.bodySmall.copyWith(
                    color: AppColors.textMedium,
                  ),
                ),
              ],
            ),
          if (trainer.isNotEmpty)
            Padding(
              padding: const EdgeInsets.only(top: AppSpacing.xs),
              child: Row(
                children: [
                  Icon(Icons.person, size: 16, color: AppColors.textMedium),
                  const SizedBox(width: AppSpacing.xs),
                  Text(
                    'Trainer: $trainer',
                    style: AppTypography.bodySmall.copyWith(
                      color: AppColors.textMedium,
                    ),
                  ),
                ],
              ),
            ),
          if (isUpcoming) ...[
            const SizedBox(height: AppSpacing.md),
            AaywaButton(
              label: 'Set Reminder',
              icon: Icons.notifications_outlined,
              type: ButtonType.secondary,
              size: ButtonSize.small,
              onPressed: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text('Reminder set for $title'),
                    backgroundColor: AppColors.success,
                  ),
                );
              },
            ),
          ],
          if (!isUpcoming && attended) ...[
            const SizedBox(height: AppSpacing.sm),
            Container(
              padding: const EdgeInsets.symmetric(
                horizontal: AppSpacing.sm,
                vertical: AppSpacing.xs,
              ),
              decoration: BoxDecoration(
                color: AppColors.success.withOpacity(0.1),
                borderRadius: BorderRadius.circular(AppRadius.full),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(
                    Icons.check_circle,
                    size: 14,
                    color: AppColors.success,
                  ),
                  const SizedBox(width: AppSpacing.xs),
                  Text(
                    'Attended',
                    style: AppTypography.labelSmall.copyWith(
                      color: AppColors.success,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }
}
