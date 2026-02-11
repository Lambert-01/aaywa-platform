import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../services/api_service.dart';
import '../../theme/design_system.dart';
import '../../widgets/common/aaywa_button.dart';
import '../../widgets/common/aaywa_card.dart';
import '../../widgets/common/aaywa_input.dart';

class VSLAMeetingScreen extends StatefulWidget {
  const VSLAMeetingScreen({super.key});

  @override
  State<VSLAMeetingScreen> createState() => _VSLAMeetingScreenState();
}

class _VSLAMeetingScreenState extends State<VSLAMeetingScreen> {
  int _currentStep = 0;
  final PageController _pageController = PageController();
  bool _isLoading = true;
  List<Map<String, dynamic>> _members = [];

  final List<String> _steps = [
    'Attendance',
    'Savings Collection',
    'Loan Repayment',
    'New Loans',
    'Summary',
  ];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadMembers();
    });
  }

  Future<void> _loadMembers() async {
    setState(() => _isLoading = true);
    try {
      final auth = Provider.of<AuthProvider>(context, listen: false);
      final vslaId = auth.user?['vsla_id'];

      if (vslaId == null) {
        // If no VSLA Group, maybe show error or empty
        if (mounted) {
          setState(() {
            _isLoading = false;
          });
        }
        return;
      }

      final apiService = ApiService();
      final response = await apiService.get('/vsla/$vslaId/members');

      if (mounted) {
        setState(() {
          _members = (response as List)
              .map((m) => {
                    'id': m['id'],
                    'name': m['name'] ?? m['full_name'] ?? 'Member',
                    'present': false, // Default to false
                    'savings': 0,
                    'loan_payment': 0,
                    'user_id': m['user_id']
                  })
              .toList();
          _isLoading = false;
        });
      }
    } catch (e) {
      debugPrint('Error loading members: $e');
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  void _nextStep() {
    if (_currentStep < _steps.length - 1) {
      setState(() => _currentStep++);
      _pageController.nextPage(
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
      );
    } else {
      // Validate meeting
      Navigator.pop(context);
    }
  }

  void _prevStep() {
    if (_currentStep > 0) {
      setState(() => _currentStep--);
      _pageController.previousPage(
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.backgroundGray,
      appBar: AppBar(
        title: Text('Meeting: ${_steps[_currentStep]}'),
        centerTitle: true,
        backgroundColor: AppColors.surfaceWhite,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.close),
          onPressed: () => Navigator.pop(context),
        ),
        actions: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
            child: Center(
              child: Text(
                'Step ${_currentStep + 1}/${_steps.length}',
                style: AppTypography.labelLarge.copyWith(
                  color: AppColors.primaryGreen,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ),
        ],
      ),
      body: Column(
        children: [
          // Progress bar
          if (_isLoading)
            const LinearProgressIndicator(
              backgroundColor: AppColors.divider,
              valueColor: AlwaysStoppedAnimation<Color>(AppColors.primaryGreen),
            )
          else
            LinearProgressIndicator(
              value: (_currentStep + 1) / _steps.length,
              backgroundColor: AppColors.divider,
              valueColor:
                  const AlwaysStoppedAnimation<Color>(AppColors.primaryGreen),
            ),

          Expanded(
            child: PageView(
              controller: _pageController,
              physics: const NeverScrollableScrollPhysics(),
              children: [
                _buildAttendanceStep(),
                _buildSavingsStep(),
                _buildLoanRepaymentStep(),
                _buildNewLoansStep(),
                _buildSummaryStep(),
              ],
            ),
          ),
        ],
      ),
      bottomNavigationBar: Container(
        padding: const EdgeInsets.all(AppSpacing.md),
        decoration: const BoxDecoration(
          color: AppColors.surfaceWhite,
          boxShadow: [AppShadows.md],
        ),
        child: Row(
          children: [
            if (_currentStep > 0)
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.only(right: AppSpacing.sm),
                  child: AaywaButton(
                    label: 'Back',
                    type: ButtonType.secondary,
                    onPressed: _prevStep,
                  ),
                ),
              ),
            Expanded(
              flex: 2,
              child: AaywaButton(
                label: _currentStep == _steps.length - 1
                    ? 'Finish Meeting'
                    : 'Next Step',
                onPressed: _nextStep,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAttendanceStep() {
    return ListView.builder(
      padding: const EdgeInsets.all(AppSpacing.md),
      itemCount: _members.length,
      itemBuilder: (context, index) {
        final member = _members[index];
        return AaywaCard(
          padding: const EdgeInsets.symmetric(
            horizontal: AppSpacing.md,
            vertical: AppSpacing.sm,
          ),
          child: CheckboxListTile(
            title: Text(
              member['name'],
              style: AppTypography.bodyLarge.copyWith(
                fontWeight: FontWeight.w600,
              ),
            ),
            subtitle: Text(
              member['present'] ? 'Present' : 'Absent',
              style: AppTypography.bodySmall.copyWith(
                color: member['present'] ? AppColors.success : AppColors.error,
              ),
            ),
            value: member['present'],
            activeColor: AppColors.success,
            onChanged: (value) {
              setState(() {
                _members[index]['present'] = value;
              });
            },
          ),
        );
      },
    );
  }

  Widget _buildSavingsStep() {
    final presentMembers = _members.where((m) => m['present']).toList();

    return ListView(
      padding: const EdgeInsets.all(AppSpacing.md),
      children: [
        const Padding(
          padding: EdgeInsets.only(bottom: AppSpacing.md),
          child: Text(
            'Record savings for present members (Share value: 500 RWF)',
            style: AppTypography.bodyMedium,
          ),
        ),
        ...presentMembers.map((member) {
          int shares = (member['savings'] as int) ~/ 500;

          return AaywaCard(
            child: Row(
              children: [
                Expanded(
                  child: Text(
                    member['name'],
                    style: AppTypography.bodyLarge.copyWith(
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
                Row(
                  children: [
                    IconButton(
                      icon: const Icon(Icons.remove_circle_outline),
                      color: AppColors.error,
                      onPressed: () {
                        if (shares > 0) {
                          setState(() {
                            member['savings'] = (shares - 1) * 500;
                          });
                        }
                      },
                    ),
                    Text(
                      '$shares Shares',
                      style: AppTypography.labelLarge,
                    ),
                    IconButton(
                      icon: const Icon(Icons.add_circle_outline),
                      color: AppColors.success,
                      onPressed: () {
                        setState(() {
                          member['savings'] = (shares + 1) * 500;
                        });
                      },
                    ),
                  ],
                ),
              ],
            ),
          );
        }),
      ],
    );
  }

  Widget _buildLoanRepaymentStep() {
    final payingMembers = _members
        .where((m) => m['present'] && (m['loan_payment'] as int) > 0)
        .toList();

    return ListView(
      padding: const EdgeInsets.all(AppSpacing.md),
      children: [
        const Padding(
          padding: EdgeInsets.only(bottom: AppSpacing.md),
          child: Text(
            'Members scheduled for repayment today',
            style: AppTypography.bodyMedium,
          ),
        ),
        if (payingMembers.isEmpty)
          const Center(child: Text("No repayments scheduled")),
        ...payingMembers.map((member) {
          return AaywaCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  member['name'],
                  style: AppTypography.bodyLarge.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: AppSpacing.sm),
                AaywaInput(
                  label: 'Amount Collected (RWF)',
                  hint: '0',
                  initialValue: member['loan_payment'].toString(),
                  keyboardType: TextInputType.number,
                  prefixIcon: Icons.money,
                ),
              ],
            ),
          );
        }),
      ],
    );
  }

  Widget _buildNewLoansStep() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.xxl),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.request_quote,
                size: 64, color: AppColors.textLight),
            const SizedBox(height: AppSpacing.md),
            Text(
              'No new loan requests',
              style: AppTypography.h4.copyWith(color: AppColors.textMedium),
            ),
            const SizedBox(height: AppSpacing.lg),
            AaywaButton(
              label: 'Create Loan Request',
              icon: Icons.add,
              type: ButtonType.secondary,
              onPressed: () {
                // Show loan request dialog
                showDialog(
                  context: context,
                  builder: (context) => AlertDialog(
                    title: const Text('New Loan Request'),
                    content: const Text('Loan request form coming soon.'),
                    actions: [
                      TextButton(
                        onPressed: () => Navigator.pop(context),
                        child: const Text('Close'),
                      ),
                    ],
                  ),
                );
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSummaryStep() {
    int totalAttendance = _members.where((m) => m['present']).length;
    int totalSavings =
        _members.fold(0, (sum, m) => sum + (m['savings'] as int));
    int totalLoansRepaid =
        _members.fold(0, (sum, m) => sum + (m['loan_payment'] as int));

    return ListView(
      padding: const EdgeInsets.all(AppSpacing.md),
      children: [
        AaywaCard(
          hasAccentTop: true,
          accentColor: AppColors.primaryGreen,
          child: Column(
            children: [
              _buildSummaryRow('Attendance',
                  '$totalAttendance / ${_members.length} Present'),
              const Divider(),
              _buildSummaryRow('Total Savings Collected', '$totalSavings RWF'),
              const Divider(),
              _buildSummaryRow('Total Loan Repayment', '$totalLoansRepaid RWF'),
              const Divider(),
              _buildSummaryRow('New Loans Disbursed', '0 RWF'),
              const Divider(),
              _buildSummaryRow(
                  'Social Fund Collected', '${totalAttendance * 100} RWF'),
            ],
          ),
        ),
        const SizedBox(height: AppSpacing.xl),
        const AaywaCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'MEETING NOTES',
                style: AppTypography.overline,
              ),
              SizedBox(height: AppSpacing.sm),
              AaywaInput(
                label: 'Secretary Notes',
                hint: 'Record key decisions or issues...',
                maxLines: 4,
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildSummaryRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: AppSpacing.sm),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label,
              style: AppTypography.bodyMedium
                  .copyWith(color: AppColors.textMedium)),
          Text(value,
              style: AppTypography.bodyLarge
                  .copyWith(fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }
}
