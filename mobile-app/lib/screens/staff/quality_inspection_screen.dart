import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../theme/design_system.dart';
import '../../widgets/common/aaywa_card.dart';
import '../../providers/agricultural_provider.dart';
import '../../models/agricultural_verification_models.dart';

class QualityInspectionScreen extends StatefulWidget {
  const QualityInspectionScreen({super.key});

  @override
  State<QualityInspectionScreen> createState() =>
      _QualityInspectionScreenState();
}

class _QualityInspectionScreenState extends State<QualityInspectionScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<AgriculturalProvider>().loadInspections();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.backgroundGray,
      appBar: AppBar(
        title: const Text('Quality Inspections'),
        backgroundColor: AppColors.surfaceWhite,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () =>
                context.read<AgriculturalProvider>().loadInspections(),
          ),
        ],
      ),
      body: Consumer<AgriculturalProvider>(
        builder: (context, provider, child) {
          if (provider.isLoading) {
            return const Center(child: CircularProgressIndicator());
          }

          final inspections = provider.inspections;

          return RefreshIndicator(
            onRefresh: () => provider.loadInspections(),
            child: ListView(
              padding: const EdgeInsets.all(AppSpacing.lg),
              children: [
                Text(
                  'INSPECTION HISTORY',
                  style: AppTypography.overline.copyWith(
                    color: AppColors.textMedium,
                  ),
                ),
                const SizedBox(height: AppSpacing.sm),
                if (inspections.isEmpty)
                  Center(
                    child: Padding(
                      padding: const EdgeInsets.all(AppSpacing.xl),
                      child: Text(
                        'No inspections yet',
                        style: AppTypography.bodyMedium.copyWith(
                          color: AppColors.textMedium,
                        ),
                      ),
                    ),
                  )
                else
                  ...inspections.map((inspection) => Padding(
                        padding: const EdgeInsets.only(bottom: AppSpacing.md),
                        child: _InspectionCard(inspection: inspection),
                      )),
              ],
            ),
          );
        },
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _showInspectionTypeDialog(context),
        backgroundColor: AppColors.primaryGreen,
        icon: const Icon(Icons.add),
        label: const Text('New Inspection'),
      ),
    );
  }

  void _showInspectionTypeDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Select Inspection Type'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            _InspectionTypeOption(
              icon: Icons.agriculture,
              title: 'Harvest Quality',
              description: 'Inspect produce quality and grading',
              onTap: () {
                Navigator.pop(context);
                // TODO: Navigate to harvest inspection form
              },
            ),
            const SizedBox(height: AppSpacing.md),
            _InspectionTypeOption(
              icon: Icons.science,
              title: 'Input Application',
              description: 'Verify proper fertilizer/pesticide use',
              onTap: () {
                Navigator.pop(context);
                // TODO: Navigate to input inspection form
              },
            ),
            const SizedBox(height: AppSpacing.md),
            _InspectionTypeOption(
              icon: Icons.check_circle,
              title: 'Training Compliance',
              description: 'Check if practices are being followed',
              onTap: () {
                Navigator.pop(context);
                // TODO: Navigate to compliance inspection form
              },
            ),
          ],
        ),
      ),
    );
  }
}

// Inspection Card Widget
class _InspectionCard extends StatelessWidget {
  final QualityInspection inspection;

  const _InspectionCard({required this.inspection});

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
                  color: _getGradeColor().withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(AppRadius.sm),
                ),
                child: Icon(
                  _getInspectionIcon(),
                  color: _getGradeColor(),
                  size: 24,
                ),
              ),
              const SizedBox(width: AppSpacing.md),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      inspection.farmerName,
                      style: AppTypography.bodyMedium.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    Text(
                      _getInspectionTypeLabel(),
                      style: AppTypography.bodySmall.copyWith(
                        color: AppColors.textMedium,
                      ),
                    ),
                  ],
                ),
              ),
              // Grade Badge
              if (inspection.grade != null)
                Container(
                  width: 50,
                  height: 50,
                  decoration: BoxDecoration(
                    color: _getGradeColor(),
                    shape: BoxShape.circle,
                  ),
                  child: Center(
                    child: Text(
                      inspection.grade!,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ),
            ],
          ),
          const SizedBox(height: AppSpacing.md),

          // Score and Stats
          Row(
            children: [
              Expanded(
                child: _StatChip(
                  icon: Icons.percent,
                  label: 'Pass Rate',
                  value: '${inspection.passRate.toStringAsFixed(0)}%',
                  color: _getGradeColor(),
                ),
              ),
              const SizedBox(width: AppSpacing.sm),
              Expanded(
                child: _StatChip(
                  icon: Icons.check_circle,
                  label: 'Passed',
                  value: '${inspection.passedItems}/${inspection.totalItems}',
                  color: const Color(0xFF10B981),
                ),
              ),
              const SizedBox(width: AppSpacing.sm),
              Expanded(
                child: _StatChip(
                  icon: Icons.cancel,
                  label: 'Failed',
                  value: '${inspection.failedItems}',
                  color: const Color(0xFFEF4444),
                ),
              ),
            ],
          ),

          // Checklist Preview
          if (inspection.checklistItems.isNotEmpty) ...[
            const SizedBox(height: AppSpacing.md),
            const Divider(height: 1),
            const SizedBox(height: AppSpacing.md),
            Text(
              'CHECKLIST (${inspection.checklistItems.length} items)',
              style: AppTypography.caption.copyWith(
                color: AppColors.textMedium,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: AppSpacing.xs),
            ...inspection.checklistItems.take(3).map((item) => Padding(
                  padding: const EdgeInsets.only(bottom: 4),
                  child: Row(
                    children: [
                      Icon(
                        item.isPassed
                            ? Icons.check_circle
                            : item.isFailed
                                ? Icons.cancel
                                : Icons.help_outline,
                        size: 16,
                        color: item.isPassed
                            ? const Color(0xFF10B981)
                            : item.isFailed
                                ? const Color(0xFFEF4444)
                                : AppColors.textMedium,
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          item.description,
                          style: AppTypography.bodySmall.copyWith(
                            color: AppColors.textDark,
                          ),
                        ),
                      ),
                    ],
                  ),
                )),
            if (inspection.checklistItems.length > 3)
              Padding(
                padding: const EdgeInsets.only(top: 4),
                child: Text(
                  '+${inspection.checklistItems.length - 3} more items',
                  style: AppTypography.caption.copyWith(
                    color: AppColors.textMedium,
                    fontStyle: FontStyle.italic,
                  ),
                ),
              ),
          ],

          // Action Items
          if (inspection.actionItems.isNotEmpty) ...[
            const SizedBox(height: AppSpacing.md),
            const Divider(height: 1),
            const SizedBox(height: AppSpacing.md),
            Text(
              'ACTION ITEMS',
              style: AppTypography.caption.copyWith(
                color: AppColors.textMedium,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: AppSpacing.xs),
            ...inspection.actionItems.map((action) => Padding(
                  padding: const EdgeInsets.only(bottom: 4),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('• ',
                          style: TextStyle(color: Color(0xFFF59E0B))),
                      Expanded(
                        child: Text(
                          action,
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
                _formatDate(inspection.inspectionDate),
                style: AppTypography.caption.copyWith(
                  color: AppColors.textMedium,
                ),
              ),
              if (!inspection.isSynced)
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

  IconData _getInspectionIcon() {
    switch (inspection.inspectionType) {
      case 'harvest':
        return Icons.agriculture;
      case 'input_application':
        return Icons.science;
      case 'training_compliance':
        return Icons.check_circle;
      default:
        return Icons.assignment;
    }
  }

  String _getInspectionTypeLabel() {
    switch (inspection.inspectionType) {
      case 'harvest':
        return 'Harvest Quality Inspection';
      case 'input_application':
        return 'Input Application Verification';
      case 'training_compliance':
        return 'Training Compliance Check';
      default:
        return 'Quality Inspection';
    }
  }

  Color _getGradeColor() {
    if (inspection.grade == null) return AppColors.textMedium;
    switch (inspection.grade!) {
      case 'A':
        return const Color(0xFF10B981);
      case 'B':
        return const Color(0xFF3B82F6);
      case 'C':
        return const Color(0xFFF59E0B);
      case 'D':
      case 'F':
        return const Color(0xFFEF4444);
      default:
        return AppColors.textMedium;
    }
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

// Stat Chip Widget
class _StatChip extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  final Color color;

  const _StatChip({
    required this.icon,
    required this.label,
    required this.value,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.sm),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(AppRadius.sm),
      ),
      child: Column(
        children: [
          Icon(icon, size: 16, color: color),
          const SizedBox(height: 4),
          Text(
            value,
            style: AppTypography.bodySmall.copyWith(
              fontWeight: FontWeight.bold,
              color: color,
            ),
          ),
          Text(
            label,
            style: AppTypography.caption.copyWith(
              color: AppColors.textMedium,
              fontSize: 10,
            ),
          ),
        ],
      ),
    );
  }
}

// Inspection Type Option Widget
class _InspectionTypeOption extends StatelessWidget {
  final IconData icon;
  final String title;
  final String description;
  final VoidCallback onTap;

  const _InspectionTypeOption({
    required this.icon,
    required this.title,
    required this.description,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(AppRadius.md),
        child: Container(
          padding: const EdgeInsets.all(AppSpacing.md),
          decoration: BoxDecoration(
            border: Border.all(color: AppColors.divider),
            borderRadius: BorderRadius.circular(AppRadius.md),
          ),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(AppSpacing.sm),
                decoration: BoxDecoration(
                  color: AppColors.primaryGreen.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(AppRadius.sm),
                ),
                child: Icon(icon, color: AppColors.primaryGreen),
              ),
              const SizedBox(width: AppSpacing.md),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: AppTypography.bodyMedium.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    Text(
                      description,
                      style: AppTypography.caption.copyWith(
                        color: AppColors.textMedium,
                      ),
                    ),
                  ],
                ),
              ),
              const Icon(Icons.chevron_right, color: AppColors.textMedium),
            ],
          ),
        ),
      ),
    );
  }
}
