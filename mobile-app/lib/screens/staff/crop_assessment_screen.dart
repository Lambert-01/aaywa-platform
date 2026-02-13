import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../theme/design_system.dart';
import '../../widgets/common/aaywa_card.dart';
import '../../providers/agricultural_provider.dart';
import '../../models/agricultural_verification_models.dart';

class CropAssessmentScreen extends StatefulWidget {
  const CropAssessmentScreen({super.key});

  @override
  State<CropAssessmentScreen> createState() => _CropAssessmentScreenState();
}

class _CropAssessmentScreenState extends State<CropAssessmentScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<AgriculturalProvider>().loadAssessments();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.backgroundGray,
      appBar: AppBar(
        title: const Text('Crop Assessments'),
        backgroundColor: AppColors.surfaceWhite,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () =>
                context.read<AgriculturalProvider>().loadAssessments(),
          ),
        ],
      ),
      body: Consumer<AgriculturalProvider>(
        builder: (context, provider, child) {
          if (provider.isLoading) {
            return const Center(child: CircularProgressIndicator());
          }

          final assessments = provider.assessments;
          final urgent = provider.urgentAssessments;

          return RefreshIndicator(
            onRefresh: () => provider.loadAssessments(),
            child: ListView(
              padding: const EdgeInsets.all(AppSpacing.lg),
              children: [
                // Urgent Alerts
                if (urgent.isNotEmpty) ...[
                  Container(
                    padding: const EdgeInsets.all(AppSpacing.md),
                    decoration: BoxDecoration(
                      color: const Color(0xFFEF4444).withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(AppRadius.md),
                      border: Border.all(color: const Color(0xFFEF4444)),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.warning,
                            color: Color(0xFFEF4444), size: 24),
                        const SizedBox(width: AppSpacing.md),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text(
                                'URGENT ACTION REQUIRED',
                                style: TextStyle(
                                  fontWeight: FontWeight.bold,
                                  color: Color(0xFFEF4444),
                                ),
                              ),
                              Text(
                                '${urgent.length} crop${urgent.length > 1 ? 's' : ''} need immediate attention',
                                style: AppTypography.bodySmall.copyWith(
                                  color: AppColors.textMedium,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: AppSpacing.lg),
                ],

                // Assessments List
                Text(
                  'RECENT ASSESSMENTS',
                  style: AppTypography.overline.copyWith(
                    color: AppColors.textMedium,
                  ),
                ),
                const SizedBox(height: AppSpacing.sm),

                if (assessments.isEmpty)
                  Center(
                    child: Padding(
                      padding: const EdgeInsets.all(AppSpacing.xl),
                      child: Text(
                        'No assessments yet',
                        style: AppTypography.bodyMedium.copyWith(
                          color: AppColors.textMedium,
                        ),
                      ),
                    ),
                  )
                else
                  ...assessments.map((assessment) => Padding(
                        padding: const EdgeInsets.only(bottom: AppSpacing.md),
                        child: _AssessmentCard(assessment: assessment),
                      )),
              ],
            ),
          );
        },
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _showNewAssessmentDialog(context),
        backgroundColor: AppColors.primaryGreen,
        icon: const Icon(Icons.add),
        label: const Text('New Assessment'),
      ),
    );
  }

  void _showNewAssessmentDialog(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => const _NewAssessmentForm(),
    );
  }
}

// Assessment Card Widget
class _AssessmentCard extends StatelessWidget {
  final CropAssessment assessment;

  const _AssessmentCard({required this.assessment});

  @override
  Widget build(BuildContext context) {
    return AaywaCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(AppSpacing.sm),
                decoration: BoxDecoration(
                  color: _getHealthColor().withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(AppRadius.sm),
                ),
                child: Icon(
                  Icons.grass,
                  color: _getHealthColor(),
                  size: 24,
                ),
              ),
              const SizedBox(width: AppSpacing.md),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      assessment.farmerName,
                      style: AppTypography.bodyMedium.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    Text(
                      assessment.cropType,
                      style: AppTypography.bodySmall.copyWith(
                        color: AppColors.textMedium,
                      ),
                    ),
                  ],
                ),
              ),
              if (assessment.requiresUrgentAction)
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: AppSpacing.sm,
                    vertical: 4,
                  ),
                  decoration: BoxDecoration(
                    color: const Color(0xFFEF4444),
                    borderRadius: BorderRadius.circular(AppRadius.full),
                  ),
                  child: const Text(
                    'URGENT',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
            ],
          ),
          const SizedBox(height: AppSpacing.md),

          // Health Score
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Health Score',
                      style: AppTypography.caption.copyWith(
                        color: AppColors.textMedium,
                      ),
                    ),
                    Text(
                      '${assessment.overallHealthScore.toStringAsFixed(0)}%',
                      style: AppTypography.h3.copyWith(
                        color: _getHealthColor(),
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    Text(
                      assessment.healthStatus,
                      style: AppTypography.caption.copyWith(
                        color: _getHealthColor(),
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _IndicatorRow(
                      label: 'Leaf Color',
                      score: assessment.leafColorScore,
                    ),
                    const SizedBox(height: 4),
                    _IndicatorRow(
                      label: 'Pest Damage',
                      score: assessment.pestDamageLevel,
                    ),
                    const SizedBox(height: 4),
                    _IndicatorRow(
                      label: 'Disease',
                      score: assessment.diseasePresence,
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.md),

          // Growth Stage
          Row(
            children: [
              const Icon(Icons.eco, size: 16, color: AppColors.textMedium),
              const SizedBox(width: 4),
              Text(
                'Growth: ${assessment.growthStage.displayName}',
                style: AppTypography.bodySmall.copyWith(
                  color: AppColors.textMedium,
                ),
              ),
              const Spacer(),
              if (assessment.hasPhotos)
                Row(
                  children: [
                    const Icon(Icons.photo_camera,
                        size: 16, color: Color(0xFF6366F1)),
                    const SizedBox(width: 4),
                    Text(
                      '${assessment.photoUrls.length}',
                      style: AppTypography.caption.copyWith(
                        color: AppColors.textMedium,
                      ),
                    ),
                  ],
                ),
            ],
          ),

          // Recommendations
          if (assessment.recommendations.isNotEmpty) ...[
            const SizedBox(height: AppSpacing.md),
            const Divider(height: 1),
            const SizedBox(height: AppSpacing.md),
            Text(
              'RECOMMENDATIONS',
              style: AppTypography.caption.copyWith(
                color: AppColors.textMedium,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: AppSpacing.xs),
            ...assessment.recommendations.take(3).map((rec) => Padding(
                  padding: const EdgeInsets.only(bottom: 4),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('• ',
                          style: TextStyle(color: AppColors.primaryGreen)),
                      Expanded(
                        child: Text(
                          rec,
                          style: AppTypography.bodySmall.copyWith(
                            color: AppColors.textDark,
                          ),
                        ),
                      ),
                    ],
                  ),
                )),
          ],

          // Footer
          const SizedBox(height: AppSpacing.sm),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                _formatDate(assessment.assessmentDate),
                style: AppTypography.caption.copyWith(
                  color: AppColors.textMedium,
                ),
              ),
              if (!assessment.isSynced)
                const Row(
                  children: [
                    Icon(Icons.sync, size: 14, color: Color(0xFFF59E0B)),
                    SizedBox(width: 4),
                    Text(
                      'Pending sync',
                      style: TextStyle(
                        fontSize: 11,
                        color: Color(0xFFF59E0B),
                      ),
                    ),
                  ],
                ),
            ],
          ),
        ],
      ),
    );
  }

  Color _getHealthColor() {
    final score = assessment.overallHealthScore;
    if (score >= 80) return const Color(0xFF10B981);
    if (score >= 60) return const Color(0xFFF59E0B);
    return const Color(0xFFEF4444);
  }

  String _formatDate(DateTime date) {
    final now = DateTime.now();
    final diff = now.difference(date);

    if (diff.inHours < 1) return '${diff.inMinutes}m ago';
    if (diff.inHours < 24) return '${diff.inHours}h ago';
    if (diff.inDays < 7) return '${diff.inDays}d ago';
    return '${date.day}/${date.month}/${date.year}';
  }
}

// Indicator Row Widget
class _IndicatorRow extends StatelessWidget {
  final String label;
  final int score;

  const _IndicatorRow({
    required this.label,
    required this.score,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: Text(
            label,
            style: AppTypography.caption.copyWith(
              color: AppColors.textMedium,
            ),
          ),
        ),
        ...List.generate(5, (index) {
          return Icon(
            index < score ? Icons.circle : Icons.circle_outlined,
            size: 10,
            color: index < score ? const Color(0xFF10B981) : AppColors.divider,
          );
        }),
      ],
    );
  }
}

// New Assessment Form (Placeholder)
class _NewAssessmentForm extends StatelessWidget {
  const _NewAssessmentForm();

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: AppColors.surfaceWhite,
        borderRadius: BorderRadius.vertical(top: Radius.circular(AppRadius.xl)),
      ),
      padding: const EdgeInsets.all(AppSpacing.xl),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            'New Crop Assessment',
            style: AppTypography.h3.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: AppSpacing.lg),
          const Text('Full assessment form coming soon!'),
          const SizedBox(height: AppSpacing.lg),
          ElevatedButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Close'),
          ),
        ],
      ),
    );
  }
}
