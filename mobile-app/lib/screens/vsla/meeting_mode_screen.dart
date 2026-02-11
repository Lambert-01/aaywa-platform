import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:drift/drift.dart' as drift; // Import drift for Value
import '../../providers/auth_provider.dart';
import '../../services/database_service.dart'; // Import DatabaseService
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
  List<Map<String, dynamic>> _members = []; // Local representation for UI

  final List<String> _steps = [
    'Attendance',
    'Savings Collection',
    'Loan Repayment',
    'New Loans',
    'Summary',
  ];

  final List<Map<String, dynamic>> _loanRequests = [];
  final TextEditingController _notesController = TextEditingController();

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
      final db = Provider.of<DatabaseService>(context, listen: false);

      // Use vsla_id from auth if available, or fetch all for dev?
      // Better to fetch by VSLA ID if we have it in user profile
      final vslaId = auth.user?['vsla_id']?.toString();

      List<Farmer> farmers;
      if (vslaId != null) {
        farmers = await db.getFarmersByVSLA(vslaId);
      } else {
        // Fallback: fetch all farmers if no VSLA ID (e.g. admin/dev mode)
        farmers = await db.getAllFarmers();
      }

      if (mounted) {
        setState(() {
          _members = farmers
              .map((f) => {
                    'id': f.id,
                    'remote_id': f.remoteId,
                    'name': '${f.firstName} ${f.lastName}',
                    'present': false, // Default to false
                    'savings': 0,
                    'loan_payment': 0,
                    'user_id': null // map if needed
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
    _notesController.dispose();
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
      _finishMeeting();
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

  Future<void> _finishMeeting() async {
    // Save meeting data to local DB
    setState(() => _isLoading = true);

    try {
      final db = Provider.of<DatabaseService>(context, listen: false);
      final auth =
          Provider.of<AuthProvider>(context, listen: false); // Moved up
      final vslaId = auth.user?['vsla_id']?.toString(); // Moved up
      final now = DateTime.now();

      // 1. Save Transaction Records (Savings & Loans)
      // Filter members with activity
      final activeMembers = _members
          .where((m) =>
              (m['savings'] as int) > 0 || (m['loan_payment'] as int) > 0)
          .toList();

      for (var member in activeMembers) {
        // Save Savings
        if ((member['savings'] as int) > 0) {
          await db.insertVSLATransaction(VSLATransactionsCompanion(
            farmerId:
                drift.Value(member['remote_id'] ?? member['id'].toString()),
            amount: drift.Value((member['savings'] as int).toDouble()),
            type: const drift.Value('SAVING'),
            transactionDate: drift.Value(now),
            notes: drift.Value(_notesController.text.isNotEmpty
                ? 'Meeting: ${_notesController.text}'
                : null),
          ));
        }

        // Save Loan Repayment
        if ((member['loan_payment'] as int) > 0) {
          await db.insertVSLATransaction(VSLATransactionsCompanion(
            farmerId:
                drift.Value(member['remote_id'] ?? member['id'].toString()),
            amount: drift.Value((member['loan_payment'] as int).toDouble()),
            type: const drift.Value('LOAN_REPAYMENT'),
            transactionDate: drift.Value(now),
            notes: drift.Value(_notesController.text.isNotEmpty
                ? 'Meeting: ${_notesController.text}'
                : null),
          ));
        }
      }

      // 2. Save Social Fund Contributions (Default 100 RWF per present member)
      final presentMembers = _members.where((m) => m['present']).toList();
      for (var member in presentMembers) {
        await db.insertVSLATransaction(VSLATransactionsCompanion(
          farmerId: drift.Value(member['remote_id'] ?? member['id'].toString()),
          amount: const drift.Value(100.0),
          type: const drift.Value('SOCIAL_FUND'),
          transactionDate: drift.Value(now),
        ));
      }

      // 3. Save New Loan Requests
      for (var request in _loanRequests) {
        await db.insertVSLATransaction(VSLATransactionsCompanion(
          farmerId: drift.Value(
              request['farmer_remote_id'] ?? request['farmer_id'].toString()),
          amount: drift.Value((request['amount'] as int).toDouble()),
          type: const drift.Value('LOAN_REQUEST'),
          transactionDate: drift.Value(now),
          notes: drift.Value(request['purpose']),
        ));
      }

      // 4. Save Attendance
      // final auth = Provider.of<AuthProvider>(context, listen: false); // Removed
      // final vslaId = auth.user?['vsla_id']?.toString(); // Removed

      for (var member in presentMembers) {
        await db.insertAttendance(AttendanceCompanion(
          farmerId: drift.Value(member['remote_id'] ?? member['id'].toString()),
          timestamp: drift.Value(now),
          type: const drift.Value('VSLA_MEETING'),
          relatedId: drift.Value(vslaId),
        ));
      }

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
                'Meeting saved! Recorded ${activeMembers.length} financial transactions and ${_loanRequests.length} loan requests.'),
            backgroundColor: AppColors.success,
          ),
        );
        Navigator.pop(context);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error saving meeting: $e'),
            backgroundColor: AppColors.error,
          ),
        );
        setState(() => _isLoading = false);
      }
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
    if (_members.isEmpty && !_isLoading) {
      return const Center(
        child: Text("No members found in this group."),
      );
    }
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
        if (presentMembers.isEmpty)
          const Center(
              child: Padding(
            padding: EdgeInsets.all(AppSpacing.lg),
            child: Text("No members marked as present."),
          )),
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
    final presentMembers = _members.where((m) => m['present']).toList();

    return ListView(
      padding: const EdgeInsets.all(AppSpacing.md),
      children: [
        const Padding(
          padding: EdgeInsets.only(bottom: AppSpacing.md),
          child: Text(
            'Record loan repayments from members',
            style: AppTypography.bodyMedium,
          ),
        ),
        if (presentMembers.isEmpty)
          const Center(child: Text("No present members")),
        ...presentMembers.map((member) {
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
                  initialValue: member['loan_payment'] > 0
                      ? member['loan_payment'].toString()
                      : '',
                  keyboardType: TextInputType.number,
                  prefixIcon: Icons.money,
                  onChanged: (value) {
                    int val = int.tryParse(value) ?? 0;
                    setState(() {
                      member['loan_payment'] = val;
                    });
                  },
                ),
              ],
            ),
          );
        }),
      ],
    );
  }

  Widget _buildNewLoansStep() {
    final presentMembers = _members.where((m) => m['present']).toList();

    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.all(AppSpacing.md),
          child: AaywaButton(
            label: 'Add Loan Request',
            icon: Icons.add,
            type: ButtonType.secondary,
            fullWidth: true,
            onPressed: () => _showLoanRequestDialog(presentMembers),
          ),
        ),
        Expanded(
          child: _loanRequests.isEmpty
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.request_quote,
                          size: 48, color: AppColors.textLight),
                      const SizedBox(height: AppSpacing.sm),
                      Text(
                        'No requests added yet',
                        style: AppTypography.bodyMedium
                            .copyWith(color: AppColors.textMedium),
                      ),
                    ],
                  ),
                )
              : ListView.builder(
                  padding:
                      const EdgeInsets.symmetric(horizontal: AppSpacing.md),
                  itemCount: _loanRequests.length,
                  itemBuilder: (context, index) {
                    final req = _loanRequests[index];
                    return AaywaCard(
                      child: ListTile(
                        title: Text(req['member_name']),
                        subtitle:
                            Text('${req['amount']} RWF • ${req['purpose']}'),
                        trailing: IconButton(
                          icon: const Icon(Icons.delete_outline,
                              color: AppColors.error),
                          onPressed: () {
                            setState(() => _loanRequests.removeAt(index));
                          },
                        ),
                      ),
                    );
                  },
                ),
        ),
      ],
    );
  }

  void _showLoanRequestDialog(List<Map<String, dynamic>> presentMembers) {
    if (presentMembers.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('No members present to request loans.')),
      );
      return;
    }

    String selectedMemberId = presentMembers.first['id'].toString();
    final amountController = TextEditingController();
    final purposeController = TextEditingController();

    showDialog(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          title: const Text('New Loan Request'),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                DropdownButtonFormField<String>(
                  value: selectedMemberId,
                  decoration: const InputDecoration(labelText: 'Member'),
                  items: presentMembers.map((m) {
                    return DropdownMenuItem(
                      value: m['id'].toString(),
                      child: Text(m['name']),
                    );
                  }).toList(),
                  onChanged: (val) =>
                      setDialogState(() => selectedMemberId = val!),
                ),
                const SizedBox(height: AppSpacing.md),
                AaywaInput(
                  controller: amountController,
                  label: 'Requested Amount (RWF)',
                  keyboardType: TextInputType.number,
                ),
                const SizedBox(height: AppSpacing.md),
                AaywaInput(
                  controller: purposeController,
                  label: 'Purpose',
                  hint: 'e.g., Seeds, Tools, Emergency',
                ),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel'),
            ),
            TextButton(
              onPressed: () {
                final member = presentMembers
                    .firstWhere((m) => m['id'].toString() == selectedMemberId);
                setState(() {
                  _loanRequests.add({
                    'farmer_id': member['id'],
                    'farmer_remote_id': member['remote_id'],
                    'member_name': member['name'],
                    'amount': int.tryParse(amountController.text) ?? 0,
                    'purpose': purposeController.text,
                  });
                });
                Navigator.pop(context);
              },
              child: const Text('Add'),
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
    int totalNewLoans =
        _loanRequests.fold(0, (sum, r) => sum + (r['amount'] as int));
    int totalSocialFund = totalAttendance * 100;

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
              _buildSummaryRow('New Loan Requests', '$totalNewLoans RWF'),
              const Divider(),
              _buildSummaryRow('Social Fund Collected', '$totalSocialFund RWF'),
            ],
          ),
        ),
        const SizedBox(height: AppSpacing.xl),
        AaywaCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'MEETING NOTES',
                style: AppTypography.overline,
              ),
              const SizedBox(height: AppSpacing.sm),
              AaywaInput(
                controller: _notesController,
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
              style: AppTypography.bodySmall
                  .copyWith(color: AppColors.textMedium)),
          Text(value,
              style: AppTypography.bodyLarge
                  .copyWith(fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }
}
