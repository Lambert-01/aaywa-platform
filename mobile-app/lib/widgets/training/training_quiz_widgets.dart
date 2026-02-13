import 'package:flutter/material.dart';
import '../../theme/design_system.dart';
import '../../models/training_analytics.dart';

/// Widget displaying pre/post quiz UI
class TrainingQuizView extends StatefulWidget {
  final List<QuizQuestion> questions;
  final Function(List<QuizResponse>) onComplete;
  final String title;
  final String? subtitle;

  const TrainingQuizView({
    super.key,
    required this.questions,
    required this.onComplete,
    required this.title,
    this.subtitle,
  });

  @override
  State<TrainingQuizView> createState() => _TrainingQuizViewState();
}

class _TrainingQuizViewState extends State<TrainingQuizView> {
  int _currentQuestionIndex = 0;
  final Map<String, int> _selectedAnswers = {};

  void _selectAnswer(int answerIndex) {
    setState(() {
      _selectedAnswers[widget.questions[_currentQuestionIndex].id] =
          answerIndex;
    });
  }

  void _nextQuestion() {
    if (_currentQuestionIndex < widget.questions.length - 1) {
      setState(() => _currentQuestionIndex++);
    } else {
      _completeQuiz();
    }
  }

  void _previousQuestion() {
    if (_currentQuestionIndex > 0) {
      setState(() => _currentQuestionIndex--);
    }
  }

  void _completeQuiz() {
    final responses = widget.questions.map((question) {
      final selectedIndex = _selectedAnswers[question.id] ?? -1;
      return QuizResponse(
        questionId: question.id,
        selectedAnswerIndex: selectedIndex,
        isCorrect: selectedIndex == question.correctAnswerIndex,
        answeredAt: DateTime.now(),
      );
    }).toList();

    widget.onComplete(responses);
  }

  @override
  Widget build(BuildContext context) {
    final question = widget.questions[_currentQuestionIndex];
    final selectedAnswer = _selectedAnswers[question.id];
    final progress = (_currentQuestionIndex + 1) / widget.questions.length;

    return Container(
      color: AppColors.backgroundGray,
      child: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(AppSpacing.lg),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header
              Text(
                widget.title,
                style: AppTypography.h3.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
              if (widget.subtitle != null) ...[
                const SizedBox(height: AppSpacing.xs),
                Text(
                  widget.subtitle!,
                  style: AppTypography.bodySmall.copyWith(
                    color: AppColors.textMedium,
                  ),
                ),
              ],
              const SizedBox(height: AppSpacing.lg),

              // Progress Bar
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Question ${_currentQuestionIndex + 1} of ${widget.questions.length}',
                    style: AppTypography.bodySmall.copyWith(
                      color: AppColors.textMedium,
                    ),
                  ),
                  const SizedBox(height: AppSpacing.xs),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(AppRadius.full),
                    child: LinearProgressIndicator(
                      value: progress,
                      minHeight: 8,
                      backgroundColor: AppColors.divider,
                      valueColor: const AlwaysStoppedAnimation<Color>(
                        AppColors.primaryGreen,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: AppSpacing.xl),

              // Question
              Expanded(
                child: SingleChildScrollView(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        padding: const EdgeInsets.all(AppSpacing.lg),
                        decoration: BoxDecoration(
                          color: AppColors.surfaceWhite,
                          borderRadius: BorderRadius.circular(AppRadius.lg),
                          border: Border.all(color: AppColors.divider),
                        ),
                        child: Text(
                          question.question,
                          style: AppTypography.h4.copyWith(
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                      const SizedBox(height: AppSpacing.lg),

                      // Answer Options
                      ...List.generate(question.options.length, (index) {
                        final isSelected = selectedAnswer == index;
                        return Padding(
                          padding: const EdgeInsets.only(bottom: AppSpacing.md),
                          child: _AnswerOption(
                            option: question.options[index],
                            optionLabel:
                                String.fromCharCode(65 + index), // A, B, C, D
                            isSelected: isSelected,
                            onTap: () => _selectAnswer(index),
                          ),
                        );
                      }),
                    ],
                  ),
                ),
              ),

              // Navigation Buttons
              const SizedBox(height: AppSpacing.lg),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  if (_currentQuestionIndex > 0)
                    TextButton.icon(
                      onPressed: _previousQuestion,
                      icon: const Icon(Icons.arrow_back),
                      label: const Text('Previous'),
                    )
                  else
                    const SizedBox.shrink(),
                  ElevatedButton(
                    onPressed: selectedAnswer != null ? _nextQuestion : null,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primaryGreen,
                      padding: const EdgeInsets.symmetric(
                        horizontal: 24,
                        vertical: 12,
                      ),
                    ),
                    child: Text(
                      _currentQuestionIndex < widget.questions.length - 1
                          ? 'Next'
                          : 'Complete Quiz',
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _AnswerOption extends StatelessWidget {
  final String option;
  final String optionLabel;
  final bool isSelected;
  final VoidCallback onTap;

  const _AnswerOption({
    required this.option,
    required this.optionLabel,
    required this.isSelected,
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
            color: isSelected
                ? AppColors.primaryGreen.withValues(alpha: 0.1)
                : AppColors.surfaceWhite,
            borderRadius: BorderRadius.circular(AppRadius.md),
            border: Border.all(
              color: isSelected ? AppColors.primaryGreen : AppColors.divider,
              width: isSelected ? 2 : 1,
            ),
          ),
          child: Row(
            children: [
              Container(
                width: 32,
                height: 32,
                decoration: BoxDecoration(
                  color: isSelected
                      ? AppColors.primaryGreen
                      : AppColors.backgroundGray,
                  shape: BoxShape.circle,
                  border: Border.all(
                    color:
                        isSelected ? AppColors.primaryGreen : AppColors.divider,
                  ),
                ),
                child: Center(
                  child: Text(
                    optionLabel,
                    style: TextStyle(
                      color: isSelected ? Colors.white : AppColors.textDark,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ),
              const SizedBox(width: AppSpacing.md),
              Expanded(
                child: Text(
                  option,
                  style: AppTypography.bodyMedium.copyWith(
                    color: AppColors.textDark,
                  ),
                ),
              ),
              if (isSelected)
                const Icon(
                  Icons.check_circle,
                  color: AppColors.primaryGreen,
                  size: 24,
                ),
            ],
          ),
        ),
      ),
    );
  }
}

/// Widget displaying training effectiveness report
class TrainingEffectivenessReport extends StatelessWidget {
  final TrainingAnalytics analytics;

  const TrainingEffectivenessReport({
    super.key,
    required this.analytics,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.lg),
      decoration: BoxDecoration(
        color: AppColors.surfaceWhite,
        borderRadius: BorderRadius.circular(AppRadius.lg),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(
                Icons.assessment,
                color: AppColors.primaryGreen,
                size: 28,
              ),
              const SizedBox(width: AppSpacing.sm),
              Text(
                'Training Effectiveness',
                style: AppTypography.h4.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.lg),

          // Overall Score
          _ScoreCard(
            title: 'Overall Effectiveness',
            score: analytics.effectivenessScore,
            color: _getScoreColor(analytics.effectivenessScore),
            icon: Icons.star,
          ),
          const SizedBox(height: AppSpacing.md),

          // Knowledge Gain
          _MetricRow(
            label: 'Knowledge Gain',
            value: '${analytics.knowledgeGain.toStringAsFixed(1)}%',
            icon: Icons.trending_up,
            color: const Color(0xFF10B981),
          ),
          const Divider(height: AppSpacing.lg),

          // Quiz Scores
          Row(
            children: [
              Expanded(
                child: _MetricCard(
                  label: 'Pre-Quiz',
                  value: '${analytics.preQuizScore.toStringAsFixed(0)}%',
                  icon: Icons.quiz_outlined,
                  color: const Color(0xFF6366F1),
                ),
              ),
              const SizedBox(width: AppSpacing.md),
              Expanded(
                child: _MetricCard(
                  label: 'Post-Quiz',
                  value: '${analytics.postQuizScore.toStringAsFixed(0)}%',
                  icon: Icons.quiz,
                  color: const Color(0xFF10B981),
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.md),

          // Engagement
          Row(
            children: [
              Expanded(
                child: _MetricCard(
                  label: 'Engagement',
                  value: '${analytics.engagementScore.toStringAsFixed(0)}%',
                  icon: Icons.people,
                  color: const Color(0xFFF59E0B),
                ),
              ),
              const SizedBox(width: AppSpacing.md),
              Expanded(
                child: _MetricCard(
                  label: 'Completion',
                  value: '${analytics.completionRate.toStringAsFixed(0)}%',
                  icon: Icons.check_circle_outline,
                  color: const Color(0xFFEC4899),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Color _getScoreColor(double score) {
    if (score >= 80) return const Color(0xFF10B981);
    if (score >= 60) return const Color(0xFFF59E0B);
    return const Color(0xFFEF4444);
  }
}

class _ScoreCard extends StatelessWidget {
  final String title;
  final double score;
  final Color color;
  final IconData icon;

  const _ScoreCard({
    required this.title,
    required this.score,
    required this.color,
    required this.icon,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.lg),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(AppRadius.md),
      ),
      child: Row(
        children: [
          Icon(icon, color: color, size: 40),
          const SizedBox(width: AppSpacing.md),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: AppTypography.bodySmall.copyWith(
                    color: AppColors.textMedium,
                  ),
                ),
                Text(
                  '${score.toStringAsFixed(1)}%',
                  style: AppTypography.h2.copyWith(
                    fontWeight: FontWeight.bold,
                    color: color,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _MetricRow extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;
  final Color color;

  const _MetricRow({
    required this.label,
    required this.value,
    required this.icon,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Row(
          children: [
            Icon(icon, color: color, size: 20),
            const SizedBox(width: AppSpacing.sm),
            Text(
              label,
              style: AppTypography.bodyMedium.copyWith(
                color: AppColors.textDark,
              ),
            ),
          ],
        ),
        Text(
          value,
          style: AppTypography.h4.copyWith(
            fontWeight: FontWeight.bold,
            color: color,
          ),
        ),
      ],
    );
  }
}

class _MetricCard extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;
  final Color color;

  const _MetricCard({
    required this.label,
    required this.value,
    required this.icon,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.md),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(AppRadius.md),
      ),
      child: Column(
        children: [
          Icon(icon, color: color, size: 24),
          const SizedBox(height: AppSpacing.xs),
          Text(
            value,
            style: AppTypography.h4.copyWith(
              fontWeight: FontWeight.bold,
              color: color,
            ),
          ),
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
}
