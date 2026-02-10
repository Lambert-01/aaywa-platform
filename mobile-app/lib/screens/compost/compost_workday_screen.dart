import 'package:flutter/material.dart';
import '../../services/api_service.dart';
import '../../theme/design_system.dart';
import '../../widgets/common/aaywa_button.dart';
import '../../widgets/common/aaywa_card.dart';

class CompostWorkdayScreen extends StatefulWidget {
  const CompostWorkdayScreen({super.key});

  @override
  State<CompostWorkdayScreen> createState() => _CompostWorkdayScreenState();
}

class _CompostWorkdayScreenState extends State<CompostWorkdayScreen> {
  final _formKey = GlobalKey<FormState>();
  bool _isLoading = false;
  bool _isSubmitting = false;

  DateTime _selectedDate = DateTime.now();
  TimeOfDay _startTime = const TimeOfDay(hour: 8, minute: 0);
  TimeOfDay _endTime = const TimeOfDay(hour: 17, minute: 0);
  String _activity = 'Turning';
  int _qualityScore = 3;
  final _notesController = TextEditingController();

  Map<String, dynamic> _stipendData = {};

  final List<String> _activities = [
    'Turning',
    'Watering',
    'Temperature Check',
    'Harvesting',
    'Site Maintenance',
    'Quality Inspection',
  ];

  @override
  void initState() {
    super.initState();
    _loadStipendData();
  }

  @override
  void dispose() {
    _notesController.dispose();
    super.dispose();
  }

  Future<void> _loadStipendData() async {
    setState(() => _isLoading = true);

    try {
      final apiService = ApiService();
      final response = await apiService.get('/compost/stipend');

      setState(() {
        _stipendData = response;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _submitWorkday() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isSubmitting = true);

    try {
      final apiService = ApiService();
      final workHours = _calculateWorkHours();

      final data = {
        'date': _selectedDate.toIso8601String(),
        'start_time': '${_startTime.hour}:${_startTime.minute}',
        'end_time': '${_endTime.hour}:${_endTime.minute}',
        'work_hours': workHours,
        'activity': _activity,
        'quality_score': _qualityScore,
        'notes': _notesController.text,
      };

      await apiService.post('/compost/workday', data);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Workday logged: $workHours hours'),
            backgroundColor: AppColors.success,
          ),
        );
        Navigator.of(context).pop();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error: $e'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isSubmitting = false);
      }
    }
  }

  double _calculateWorkHours() {
    final start = _startTime.hour + _startTime.minute / 60;
    final end = _endTime.hour + _endTime.minute / 60;
    return end - start;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.backgroundGray,
      appBar: AppBar(
        title: const Text('Log Compost Workday'),
        backgroundColor: AppColors.surfaceWhite,
        elevation: 0,
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : Form(
              key: _formKey,
              child: ListView(
                padding: const EdgeInsets.all(AppSpacing.md),
                children: [
                  // Stipend Summary
                  _buildStipendSummary(),

                  const SizedBox(height: AppSpacing.xl),

                  // Date Selection
                  Text(
                    'WORKDAY DETAILS',
                    style: AppTypography.overline.copyWith(
                      color: AppColors.textMedium,
                    ),
                  ),
                  const SizedBox(height: AppSpacing.sm),

                  AaywaCard(
                    child: Column(
                      children: [
                        ListTile(
                          leading: Icon(Icons.calendar_today,
                              color: AppColors.primaryGreen),
                          title: const Text('Date'),
                          subtitle: Text(
                            '${_selectedDate.day}/${_selectedDate.month}/${_selectedDate.year}',
                          ),
                          trailing: const Icon(Icons.chevron_right),
                          onTap: () async {
                            final date = await showDatePicker(
                              context: context,
                              initialDate: _selectedDate,
                              firstDate: DateTime.now()
                                  .subtract(const Duration(days: 30)),
                              lastDate: DateTime.now(),
                            );
                            if (date != null) {
                              setState(() => _selectedDate = date);
                            }
                          },
                        ),
                        const Divider(),
                        ListTile(
                          leading:
                              Icon(Icons.access_time, color: AppColors.blue),
                          title: const Text('Start Time'),
                          subtitle: Text(_startTime.format(context)),
                          trailing: const Icon(Icons.chevron_right),
                          onTap: () async {
                            final time = await showTimePicker(
                              context: context,
                              initialTime: _startTime,
                            );
                            if (time != null) {
                              setState(() => _startTime = time);
                            }
                          },
                        ),
                        const Divider(),
                        ListTile(
                          leading: Icon(Icons.access_time_filled,
                              color: AppColors.blue),
                          title: const Text('End Time'),
                          subtitle: Text(_endTime.format(context)),
                          trailing: const Icon(Icons.chevron_right),
                          onTap: () async {
                            final time = await showTimePicker(
                              context: context,
                              initialTime: _endTime,
                            );
                            if (time != null) {
                              setState(() => _endTime = time);
                            }
                          },
                        ),
                        const Divider(),
                        Padding(
                          padding: const EdgeInsets.all(AppSpacing.md),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                'Total Hours',
                                style: AppTypography.labelLarge.copyWith(
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                              Text(
                                '${_calculateWorkHours().toStringAsFixed(1)} hrs',
                                style: AppTypography.h3.copyWith(
                                  color: AppColors.primaryGreen,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: AppSpacing.lg),

                  // Activity Selection
                  Text(
                    'ACTIVITY TYPE',
                    style: AppTypography.overline.copyWith(
                      color: AppColors.textMedium,
                    ),
                  ),
                  const SizedBox(height: AppSpacing.sm),

                  Wrap(
                    spacing: AppSpacing.sm,
                    runSpacing: AppSpacing.sm,
                    children: _activities.map((activity) {
                      final isSelected = _activity == activity;
                      return ChoiceChip(
                        label: Text(activity),
                        selected: isSelected,
                        onSelected: (selected) {
                          setState(() => _activity = activity);
                        },
                        selectedColor: AppColors.primaryGreen,
                        backgroundColor: AppColors.accentGreen.withOpacity(0.1),
                        labelStyle: TextStyle(
                          color: isSelected ? Colors.white : AppColors.textDark,
                          fontWeight:
                              isSelected ? FontWeight.w600 : FontWeight.w500,
                        ),
                      );
                    }).toList(),
                  ),

                  const SizedBox(height: AppSpacing.lg),

                  // Quality Score
                  AaywaCard(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'QUALITY ASSESSMENT',
                          style: AppTypography.overline.copyWith(
                            color: AppColors.textMedium,
                          ),
                        ),
                        const SizedBox(height: AppSpacing.md),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: List.generate(5, (index) {
                            final score = index + 1;
                            return GestureDetector(
                              onTap: () =>
                                  setState(() => _qualityScore = score),
                              child: Container(
                                padding: const EdgeInsets.all(AppSpacing.md),
                                decoration: BoxDecoration(
                                  color: _qualityScore == score
                                      ? AppColors.warning
                                      : AppColors.backgroundGray,
                                  shape: BoxShape.circle,
                                ),
                                child: Icon(
                                  Icons.star,
                                  color: _qualityScore == score
                                      ? Colors.white
                                      : AppColors.textLight,
                                  size: 28,
                                ),
                              ),
                            );
                          }),
                        ),
                        const SizedBox(height: AppSpacing.sm),
                        Center(
                          child: Text(
                            _getQualityLabel(_qualityScore),
                            style: AppTypography.labelMedium.copyWith(
                              color: AppColors.textMedium,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: AppSpacing.lg),

                  // Notes
                  Text(
                    'NOTES (OPTIONAL)',
                    style: AppTypography.overline.copyWith(
                      color: AppColors.textMedium,
                    ),
                  ),
                  const SizedBox(height: AppSpacing.sm),

                  TextFormField(
                    controller: _notesController,
                    decoration: InputDecoration(
                      hintText: 'Any observations or issues...',
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(AppRadius.sm),
                      ),
                      filled: true,
                      fillColor: AppColors.surfaceWhite,
                    ),
                    maxLines: 4,
                  ),

                  const SizedBox(height: AppSpacing.xl),

                  // Submit Button
                  AaywaButton(
                    label: 'Log Workday',
                    icon: Icons.check_circle,
                    onPressed: _submitWorkday,
                    isLoading: _isSubmitting,
                    fullWidth: true,
                    size: ButtonSize.large,
                  ),

                  const SizedBox(height: AppSpacing.xxl),
                ],
              ),
            ),
    );
  }

  Widget _buildStipendSummary() {
    final thisMonth = _stipendData['current_month'] ?? 0.0;
    final hoursLogged = _stipendData['hours_logged'] ?? 0.0;
    final ratePerHour = _stipendData['rate_per_hour'] ?? 1500.0;

    return AaywaCard(
      hasAccentTop: true,
      accentColor: AppColors.warning,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'THIS MONTH',
                    style: AppTypography.overline.copyWith(
                      color: AppColors.textMedium,
                    ),
                  ),
                  const SizedBox(height: AppSpacing.xs),
                  Text(
                    '${thisMonth.toStringAsFixed(0)} RWF',
                    style: AppTypography.h2.copyWith(
                      color: AppColors.warning,
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
                  Icons.account_balance_wallet,
                  color: AppColors.warning,
                  size: 32,
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.md),
          const Divider(),
          const SizedBox(height: AppSpacing.md),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Hours Logged',
                    style: AppTypography.bodySmall.copyWith(
                      color: AppColors.textMedium,
                    ),
                  ),
                  Text(
                    '${hoursLogged.toStringAsFixed(1)} hrs',
                    style: AppTypography.labelLarge.copyWith(
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                    'Rate/Hour',
                    style: AppTypography.bodySmall.copyWith(
                      color: AppColors.textMedium,
                    ),
                  ),
                  Text(
                    '${ratePerHour.toStringAsFixed(0)} RWF',
                    style: AppTypography.labelLarge.copyWith(
                      fontWeight: FontWeight.w600,
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

  String _getQualityLabel(int score) {
    switch (score) {
      case 1:
        return 'Poor';
      case 2:
        return 'Fair';
      case 3:
        return 'Good';
      case 4:
        return 'Very Good';
      case 5:
        return 'Excellent';
      default:
        return 'Good';
    }
  }
}
