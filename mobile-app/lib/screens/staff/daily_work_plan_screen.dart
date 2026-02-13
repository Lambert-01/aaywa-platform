import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../theme/design_system.dart';
import '../../widgets/common/aaywa_card.dart';
import '../../providers/staff_kpi_provider.dart';
import '../../widgets/staff/kpi_cards.dart';

class DailyWorkPlanScreen extends StatefulWidget {
  const DailyWorkPlanScreen({super.key});

  @override
  State<DailyWorkPlanScreen> createState() => _DailyWorkPlanScreenState();
}

class _DailyWorkPlanScreenState extends State<DailyWorkPlanScreen> {
  final bool _isLoading = false;

  // Mock data - replace with actual API calls
  final List<_WorkTask> _todaysTasks = [
    _WorkTask(
      id: '1',
      type: 'training',
      title: 'Avocado Pruning Training',
      location: 'Kimihurura, Gasabo',
      time: '09:00 AM',
      farmerCount: 15,
      isCompleted: false,
      priority: 'high',
    ),
    _WorkTask(
      id: '2',
      type: 'registration',
      title: 'Register New Farmers',
      location: 'Gahinga Village',
      time: '11:30 AM',
      farmerCount: 3,
      isCompleted: false,
      priority: 'medium',
    ),
    _WorkTask(
      id: '3',
      type: 'verification',
      title: 'Plot Boundary Verification',
      location: 'Kimihurura Cell',
      time: '02:00 PM',
      farmerCount: 5,
      isCompleted: false,
      priority: 'high',
    ),
  ];

  @override
  Widget build(BuildContext context) {
    final completedTasks = _todaysTasks.where((t) => t.isCompleted).length;
    final totalTasks = _todaysTasks.length;
    final kpiProvider = context.watch<StaffKPIProvider>();

    return Scaffold(
      backgroundColor: AppColors.backgroundGray,
      appBar: AppBar(
        title: const Text('Daily Work Plan'),
        backgroundColor: AppColors.surfaceWhite,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () {
              // TODO: Replace with actual user ID from auth
              kpiProvider.refreshMetrics('current-staff-user-id');
            },
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: () =>
                  kpiProvider.refreshMetrics('current-staff-user-id'),
              child: ListView(
                padding: const EdgeInsets.all(AppSpacing.md),
                children: [
                  // KPI Performance Metrics
                  if (kpiProvider.todayMetrics != null)
                    TodayKPICard(metrics: kpiProvider.todayMetrics!),
                  const SizedBox(height: AppSpacing.md),

                  // Weekly Trends Chart
                  if (kpiProvider.weeklyMetrics.isNotEmpty)
                    WeeklyTrendsCard(weeklyMetrics: kpiProvider.weeklyMetrics),
                  const SizedBox(height: AppSpacing.md),

                  // Resource Tracking
                  if (kpiProvider.todayMetrics != null)
                    ResourceTrackingCard(
                      materialsDistributed:
                          kpiProvider.todayMetrics!.materialsDistributed,
                      inputsAllocated:
                          kpiProvider.todayMetrics!.inputsAllocated,
                      farmerVisits: kpiProvider.todayMetrics!.farmerVisits,
                    ),
                  const SizedBox(height: AppSpacing.md),

                  // Task Progress Summary Card
                  AaywaCard(
                    hasAccentTop: true,
                    accentColor: AppColors.primaryGreen,
                    child: Column(
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'TODAY\'S TASKS',
                                  style: AppTypography.overline.copyWith(
                                    color: AppColors.textMedium,
                                  ),
                                ),
                                const SizedBox(height: AppSpacing.xs),
                                Text(
                                  '$completedTasks of $totalTasks Completed',
                                  style: AppTypography.h4.copyWith(
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ],
                            ),
                            Container(
                              padding: const EdgeInsets.all(AppSpacing.md),
                              decoration: BoxDecoration(
                                color: AppColors.primaryGreen
                                    .withValues(alpha: 0.1),
                                shape: BoxShape.circle,
                              ),
                              child: const Icon(
                                Icons.assignment,
                                color: AppColors.primaryGreen,
                                size: 32,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: AppSpacing.md),
                        ClipRRect(
                          borderRadius: BorderRadius.circular(AppRadius.full),
                          child: LinearProgressIndicator(
                            value: totalTasks > 0
                                ? completedTasks / totalTasks
                                : 0.0,
                            minHeight: 8,
                            backgroundColor: AppColors.divider,
                            valueColor: const AlwaysStoppedAnimation<Color>(
                                AppColors.primaryGreen),
                          ),
                        ),
                        const SizedBox(height: AppSpacing.sm),
                        Text(
                          completedTasks == totalTasks && totalTasks > 0
                              ? 'All tasks completed! 🎉'
                              : 'Keep going! You\'re doing great.',
                          style: AppTypography.bodySmall.copyWith(
                            color: AppColors.textMedium,
                            fontStyle: FontStyle.italic,
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: AppSpacing.xl),

                  // Tasks Section
                  Text(
                    'TODAY\'S TASKS',
                    style: AppTypography.overline.copyWith(
                      color: AppColors.textMedium,
                    ),
                  ),
                  const SizedBox(height: AppSpacing.sm),

                  ListView.separated(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    itemCount: _todaysTasks.length,
                    separatorBuilder: (_, __) =>
                        const SizedBox(height: AppSpacing.md),
                    itemBuilder: (context, index) {
                      return _TaskCard(
                        task: _todaysTasks[index],
                        onToggleComplete: () {
                          setState(() {
                            _todaysTasks[index].isCompleted =
                                !_todaysTasks[index].isCompleted;
                          });
                        },
                        onTap: () {
                          // Navigate to task details
                        },
                      );
                    },
                  ),

                  const SizedBox(height: AppSpacing.xxl),
                ],
              ),
            ),
    );
  }
}

class _WorkTask {
  final String id;
  final String type; // training, registration, verification, vsla
  final String title;
  final String location;
  final String time;
  final int farmerCount;
  bool isCompleted;
  final String priority; // high, medium, low

  _WorkTask({
    required this.id,
    required this.type,
    required this.title,
    required this.location,
    required this.time,
    required this.farmerCount,
    required this.isCompleted,
    required this.priority,
  });
}

class _TaskCard extends StatelessWidget {
  final _WorkTask task;
  final VoidCallback onToggleComplete;
  final VoidCallback onTap;

  const _TaskCard({
    required this.task,
    required this.onToggleComplete,
    required this.onTap,
  });

  IconData _getTypeIcon() {
    switch (task.type) {
      case 'training':
        return Icons.school;
      case 'registration':
        return Icons.person_add;
      case 'verification':
        return Icons.verified;
      case 'vsla':
        return Icons.account_balance;
      default:
        return Icons.task;
    }
  }

  Color _getTypeColor() {
    switch (task.type) {
      case 'training':
        return AppColors.primaryGreen;
      case 'registration':
        return AppColors.blue;
      case 'verification':
        return AppColors.warning;
      case 'vsla':
        return AppColors.accentGreen;
      default:
        return AppColors.textMedium;
    }
  }

  Color _getPriorityColor() {
    switch (task.priority) {
      case 'high':
        return AppColors.error;
      case 'medium':
        return AppColors.warning;
      case 'low':
        return AppColors.success;
      default:
        return AppColors.textMedium;
    }
  }

  @override
  Widget build(BuildContext context) {
    return AaywaCard(
      padding: EdgeInsets.zero,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(AppRadius.md),
        child: Padding(
          padding: const EdgeInsets.all(AppSpacing.md),
          child: Row(
            children: [
              // Checkbox
              Checkbox(
                value: task.isCompleted,
                onChanged: (_) => onToggleComplete(),
                activeColor: AppColors.success,
              ),

              const SizedBox(width: AppSpacing.sm),

              // Task Icon
              Container(
                padding: const EdgeInsets.all(AppSpacing.sm),
                decoration: BoxDecoration(
                  color: _getTypeColor().withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(AppRadius.sm),
                ),
                child: Icon(
                  _getTypeIcon(),
                  color: _getTypeColor(),
                  size: 24,
                ),
              ),

              const SizedBox(width: AppSpacing.md),

              // Task Details
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            task.title,
                            style: AppTypography.labelLarge.copyWith(
                              fontWeight: FontWeight.w600,
                              decoration: task.isCompleted
                                  ? TextDecoration.lineThrough
                                  : null,
                              color: task.isCompleted
                                  ? AppColors.textLight
                                  : AppColors.textDark,
                            ),
                          ),
                        ),
                        if (task.priority == 'high')
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 6,
                              vertical: 2,
                            ),
                            decoration: BoxDecoration(
                              color: _getPriorityColor().withValues(alpha: 0.1),
                              borderRadius: BorderRadius.circular(AppRadius.xs),
                            ),
                            child: Text(
                              'HIGH',
                              style: AppTypography.caption.copyWith(
                                color: _getPriorityColor(),
                                fontWeight: FontWeight.bold,
                                fontSize: 10,
                              ),
                            ),
                          ),
                      ],
                    ),
                    const SizedBox(height: AppSpacing.xs),
                    Row(
                      children: [
                        const Icon(
                          Icons.location_on,
                          size: 14,
                          color: AppColors.textMedium,
                        ),
                        const SizedBox(width: 4),
                        Expanded(
                          child: Text(
                            task.location,
                            style: AppTypography.caption.copyWith(
                              color: AppColors.textMedium,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        const Icon(
                          Icons.access_time,
                          size: 14,
                          color: AppColors.textMedium,
                        ),
                        const SizedBox(width: 4),
                        Text(
                          task.time,
                          style: AppTypography.caption.copyWith(
                            color: AppColors.textMedium,
                          ),
                        ),
                        const SizedBox(width: AppSpacing.md),
                        const Icon(
                          Icons.people,
                          size: 14,
                          color: AppColors.textMedium,
                        ),
                        const SizedBox(width: 4),
                        Text(
                          '${task.farmerCount} farmers',
                          style: AppTypography.caption.copyWith(
                            color: AppColors.textMedium,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),

              const SizedBox(width: AppSpacing.sm),

              // Arrow
              const Icon(
                Icons.chevron_right,
                color: AppColors.textLight,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
