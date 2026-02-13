import 'package:flutter/material.dart';
import '../../services/api_service.dart';
import '../../theme/design_system.dart';
import '../../widgets/common/aaywa_button.dart';

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
  List<Map<String, dynamic>> _materials = [];
  int _badgesEarned = 0;
  int _totalAttendance = 0;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    _loadTrainingData();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _loadTrainingData() async {
    if (!mounted) return;
    setState(() => _isLoading = true);

    try {
      final apiService = ApiService();
      final response = await apiService.get('/training/schedule');
      final materialsRes = await apiService.get('/training/materials');

      if (mounted) {
        setState(() {
          _upcomingTrainings = List<Map<String, dynamic>>.from(
            response['upcoming'] ?? [],
          );
          _completedTrainings = List<Map<String, dynamic>>.from(
            response['completed'] ?? [],
          );
          _materials = List<Map<String, dynamic>>.from(
            materialsRes ?? [],
          );
          _badgesEarned = response['badges_earned'] ?? 0;
          _totalAttendance = response['total_attendance'] ?? 0;
          _isLoading = false;
        });
      }
    } catch (e) {
      debugPrint('[TRAINING] Error loading data: $e');
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.backgroundGray,
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : CustomScrollView(
              slivers: [
                _buildSliverAppBar(),
                SliverToBoxAdapter(
                  child: Column(
                    children: [
                      _buildStatsRow(),
                      _buildTabSelector(),
                    ],
                  ),
                ),
                SliverPadding(
                  padding: const EdgeInsets.all(AppSpacing.md),
                  sliver: _tabController.index == 0
                      ? _buildUpcomingSliverList()
                      : _tabController.index == 1
                          ? _buildCompletedSliverList()
                          : _buildMaterialsSliverList(),
                ),
              ],
            ),
    );
  }

  Widget _buildSliverAppBar() {
    return SliverAppBar(
      expandedHeight: 180.0,
      floating: false,
      pinned: true,
      elevation: 0,
      backgroundColor: AppColors.primaryGreen,
      flexibleSpace: FlexibleSpaceBar(
        title: Text(
          'Training & Growth',
          style: AppTypography.h4.copyWith(
            color: Colors.white,
            fontWeight: FontWeight.bold,
          ),
        ),
        background: Stack(
          fit: StackFit.expand,
          children: [
            Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [
                    AppColors.primaryGreen,
                    AppColors.primaryGreen.withBlue(150),
                  ],
                ),
              ),
            ),
            Positioned(
              right: -50,
              top: -20,
              child: Icon(
                Icons.school,
                size: 200,
                color: Colors.white.withValues(alpha: 0.1),
              ),
            ),
            _buildGlassHeaderContent(),
          ],
        ),
      ),
      actions: [
        IconButton(
          icon: const Icon(Icons.qr_code_scanner, color: Colors.white),
          onPressed: () {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Attendance Scanner coming soon')),
            );
          },
        ),
      ],
    );
  }

  Widget _buildGlassHeaderContent() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SizedBox(height: 40),
          Container(
            padding: const EdgeInsets.symmetric(
              horizontal: AppSpacing.sm,
              vertical: AppSpacing.xs,
            ),
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.2),
              borderRadius: BorderRadius.circular(AppRadius.full),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.stars, color: AppColors.warning, size: 16),
                const SizedBox(width: 4),
                Text(
                  'ACADEMY PROGRAM',
                  style: AppTypography.overline.copyWith(color: Colors.white),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatsRow() {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.md),
      child: Row(
        children: [
          _buildStatItem('CERTIFICATES', '$_badgesEarned', Icons.verified,
              AppColors.success),
          const SizedBox(width: AppSpacing.sm),
          _buildStatItem('SESSIONS', '$_totalAttendance', Icons.calendar_today,
              AppColors.blue),
          const SizedBox(width: AppSpacing.sm),
          _buildStatItem(
              'STREAK', '12d', Icons.local_fire_department, Colors.orange),
        ],
      ),
    );
  }

  Widget _buildStatItem(
      String label, String value, IconData icon, Color color) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: AppSpacing.md),
        decoration: BoxDecoration(
          color: AppColors.surfaceWhite,
          borderRadius: BorderRadius.circular(AppRadius.lg),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.05),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Column(
          children: [
            Icon(icon, color: color, size: 20),
            const SizedBox(height: 4),
            Text(value,
                style: AppTypography.h3.copyWith(fontWeight: FontWeight.bold)),
            Text(label,
                style: AppTypography.overline
                    .copyWith(color: AppColors.textLight)),
          ],
        ),
      ),
    );
  }

  Widget _buildTabSelector() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
      child: Container(
        padding: const EdgeInsets.all(4),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(AppRadius.full),
        ),
        child: TabBar(
          controller: _tabController,
          onTap: (index) => setState(() {}),
          indicator: BoxDecoration(
            color: AppColors.primaryGreen,
            borderRadius: BorderRadius.circular(AppRadius.full),
          ),
          labelColor: Colors.white,
          unselectedLabelColor: AppColors.textMedium,
          indicatorSize: TabBarIndicatorSize.tab,
          dividerColor: Colors.transparent,
          tabs: const [
            Tab(text: 'UPCOMING'),
            Tab(text: 'HISTORY'),
            Tab(text: 'MATERIALS'),
          ],
        ),
      ),
    );
  }

  Widget _buildUpcomingSliverList() {
    if (_upcomingTrainings.isEmpty) {
      return SliverToBoxAdapter(
          child: _buildEmptyState('No upcoming sessions', Icons.event_busy));
    }
    return SliverList(
      delegate: SliverChildBuilderDelegate(
        (context, index) =>
            _buildSessionCard(_upcomingTrainings[index], isUpcoming: true),
        childCount: _upcomingTrainings.length,
      ),
    );
  }

  Widget _buildCompletedSliverList() {
    if (_completedTrainings.isEmpty) {
      return SliverToBoxAdapter(
          child: _buildEmptyState('No completed sessions', Icons.history));
    }
    return SliverList(
      delegate: SliverChildBuilderDelegate(
        (context, index) =>
            _buildSessionCard(_completedTrainings[index], isUpcoming: false),
        childCount: _completedTrainings.length,
      ),
    );
  }

  Widget _buildMaterialsSliverList() {
    if (_materials.isEmpty) {
      return SliverToBoxAdapter(
          child: _buildEmptyState('No resources available', Icons.folder_open));
    }
    return SliverList(
      delegate: SliverChildBuilderDelegate(
        (context, index) => _buildMaterialCard(_materials[index]),
        childCount: _materials.length,
      ),
    );
  }

  Widget _buildMaterialCard(Map<String, dynamic> material) {
    final title = material['title'] ?? 'Learning Resource';
    final category = material['category'] ?? 'General';
    final description =
        material['description'] ?? 'Educational content for farmers.';
    final type = material['file_type'] ?? 'PDF';

    return Container(
      margin: const EdgeInsets.only(bottom: AppSpacing.md),
      padding: const EdgeInsets.all(AppSpacing.md),
      decoration: BoxDecoration(
        color: AppColors.surfaceWhite,
        borderRadius: BorderRadius.circular(AppRadius.xl),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.04),
            blurRadius: 15,
            offset: const Offset(0, 5),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: AppColors.primaryGreen.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(AppRadius.md),
                ),
                child: Icon(
                  type.toString().toUpperCase() == 'VIDEO'
                      ? Icons.play_circle_outline
                      : Icons.description_outlined,
                  color: AppColors.primaryGreen,
                ),
              ),
              const SizedBox(width: AppSpacing.md),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(title,
                        style: AppTypography.labelLarge
                            .copyWith(fontWeight: FontWeight.bold)),
                    Text(category,
                        style: AppTypography.caption
                            .copyWith(color: AppColors.textMedium)),
                  ],
                ),
              ),
              IconButton(
                icon: const Icon(Icons.download_for_offline_outlined,
                    color: AppColors.primaryGreen),
                onPressed: () {},
              )
            ],
          ),
          const SizedBox(height: AppSpacing.sm),
          Text(
            description,
            style:
                AppTypography.bodySmall.copyWith(color: AppColors.textMedium),
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }

  Widget _buildSessionCard(Map<String, dynamic> training,
      {required bool isUpcoming}) {
    final title = training['title'] ?? 'Training Session';
    final date = training['date'] ?? 'TBD';
    final time = training['time'] ?? '09:00 AM';
    final location = training['location'] ?? 'Community Center';
    final trainer = training['trainer'] ?? 'Lead Facilitator';

    return Container(
      margin: const EdgeInsets.only(bottom: AppSpacing.md),
      decoration: BoxDecoration(
        color: AppColors.surfaceWhite,
        borderRadius: BorderRadius.circular(AppRadius.xl),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.04),
            blurRadius: 15,
            offset: const Offset(0, 5),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(AppRadius.xl),
        child: Column(
          children: [
            Container(
              height: 4,
              width: double.infinity,
              color: isUpcoming ? AppColors.blue : AppColors.success,
            ),
            Padding(
              padding: const EdgeInsets.all(AppSpacing.md),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color:
                              (isUpcoming ? AppColors.blue : AppColors.success)
                                  .withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(AppRadius.full),
                        ),
                        child: Text(
                          isUpcoming ? 'SCHEDULED' : 'COMPLETED',
                          style: AppTypography.overline.copyWith(
                            color:
                                isUpcoming ? AppColors.blue : AppColors.success,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                      Text(date,
                          style: AppTypography.labelLarge
                              .copyWith(color: AppColors.textMedium)),
                    ],
                  ),
                  const SizedBox(height: AppSpacing.sm),
                  Text(title,
                      style: AppTypography.h4
                          .copyWith(fontWeight: FontWeight.bold)),
                  const SizedBox(height: AppSpacing.xs),
                  Row(
                    children: [
                      const Icon(Icons.person_outline,
                          size: 16, color: AppColors.textLight),
                      const SizedBox(width: 4),
                      Text('By $trainer',
                          style: AppTypography.bodySmall
                              .copyWith(color: AppColors.textMedium)),
                      const Spacer(),
                      const Icon(Icons.access_time,
                          size: 16, color: AppColors.textLight),
                      const SizedBox(width: 4),
                      Text(time,
                          style: AppTypography.bodySmall
                              .copyWith(color: AppColors.textMedium)),
                    ],
                  ),
                  const SizedBox(height: AppSpacing.md),
                  Row(
                    children: [
                      const Icon(Icons.location_on_outlined,
                          size: 16, color: AppColors.primaryGreen),
                      const SizedBox(width: 4),
                      Text(location, style: AppTypography.bodySmall),
                    ],
                  ),
                  const SizedBox(height: AppSpacing.md),
                  if (isUpcoming)
                    Row(
                      children: [
                        Expanded(
                          child: AaywaButton(
                            label: 'Details',
                            type: ButtonType.secondary,
                            size: ButtonSize.small,
                            onPressed: () {},
                          ),
                        ),
                        const SizedBox(width: AppSpacing.sm),
                        Expanded(
                          child: AaywaButton(
                            label: 'Set Alert',
                            size: ButtonSize.small,
                            onPressed: () {
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(content: Text('Reminder set!')),
                              );
                            },
                          ),
                        ),
                      ],
                    )
                  else
                    Row(
                      children: [
                        const Icon(Icons.check_circle,
                            color: AppColors.success, size: 20),
                        const SizedBox(width: 8),
                        Text('Attendance Verified',
                            style: AppTypography.labelLarge
                                .copyWith(color: AppColors.success)),
                        const Spacer(),
                        TextButton(
                          onPressed: () {},
                          child: const Text('View Quiz Results'),
                        ),
                      ],
                    ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyState(String message, IconData icon) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 60),
        child: Column(
          children: [
            Icon(icon,
                size: 64, color: AppColors.textLight.withValues(alpha: 0.3)),
            const SizedBox(height: 16),
            Text(message,
                style: AppTypography.bodyLarge
                    .copyWith(color: AppColors.textLight)),
          ],
        ),
      ),
    );
  }
}
