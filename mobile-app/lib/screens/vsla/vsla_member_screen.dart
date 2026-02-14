import 'package:flutter/material.dart';
import '../../services/vsla_service.dart';
import '../../theme/design_system.dart';
import '../../widgets/common/aaywa_card.dart';
import '../../widgets/common/aaywa_button.dart';

class VSLAMemberScreen extends StatefulWidget {
  const VSLAMemberScreen({super.key});

  @override
  State<VSLAMemberScreen> createState() => _VSLAMemberScreenState();
}

class _VSLAMemberScreenState extends State<VSLAMemberScreen> {
  final VSLAService _vslaService = VSLAService();
  bool _isLoading = true;
  Map<String, dynamic>? _vslaData;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    try {
      final data = await _vslaService.getMemberSummary();
      if (mounted) {
        setState(() {
          _vslaData = data;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _error = e.toString();
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.backgroundGray,
      appBar: AppBar(
        title: const Text('My VSLA Group'),
        backgroundColor: AppColors.surfaceWhite,
        elevation: 0,
      ),
      body: _buildBody(),
    );
  }

  Widget _buildBody() {
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (_error != null) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.error_outline, color: AppColors.error, size: 48),
            const SizedBox(height: AppSpacing.md),
            Text('Error: $_error'),
            TextButton(onPressed: _loadData, child: const Text('Retry')),
          ],
        ),
      );
    }

    if (_vslaData == null || _vslaData!['in_group'] == false) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.group_off, color: AppColors.textMedium, size: 64),
            const SizedBox(height: AppSpacing.md),
            const Text(
              'You are not in a VSLA group yet.',
              style: AppTypography.h4,
            ),
            const SizedBox(height: AppSpacing.sm),
            const Text('Contact your Champion to join one.'),
          ],
        ),
      );
    }

    final balance = (_vslaData!['balance'] ?? 0).toDouble();
    final groupName = _vslaData!['vsla_name'] ?? 'Unknown Group';
    final transactions = _vslaData!['recent_transactions'] as List?;

    return RefreshIndicator(
      onRefresh: _loadData,
      child: ListView(
        padding: const EdgeInsets.all(AppSpacing.md),
        children: [
          // Header Card
          AaywaCard(
            hasAccentTop: true,
            accentColor: AppColors.primaryGreen,
            child: Column(
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(AppSpacing.sm),
                      decoration: const BoxDecoration(
                        color: AppColors.primaryGreen,
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.groups, color: Colors.white),
                    ),
                    const SizedBox(width: AppSpacing.md),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          groupName,
                          style: AppTypography.h4
                              .copyWith(color: AppColors.textDark),
                        ),
                        const Text(
                          'Member in Good Standing',
                          style:
                              TextStyle(color: AppColors.success, fontSize: 12),
                        ),
                      ],
                    ),
                  ],
                ),
                const Divider(height: 24),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'YOUR SAVINGS',
                          style: AppTypography.overline
                              .copyWith(color: AppColors.textMedium),
                        ),
                        Text(
                          '${balance.toStringAsFixed(0)} RWF',
                          style: AppTypography.h2
                              .copyWith(color: AppColors.primaryGreen),
                        ),
                      ],
                    ),
                    AaywaButton(
                      label: 'Save',
                      icon: Icons.savings,
                      size: ButtonSize.small,
                      onPressed: () {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                              content:
                                  Text('Please attend a meeting to save.')),
                        );
                      },
                    ),
                  ],
                ),
              ],
            ),
          ),

          const SizedBox(height: AppSpacing.lg),

          // Loan Status (Future Feature)
          const AaywaCard(
            child: ListTile(
              leading:
                  Icon(Icons.monetization_on, color: AppColors.secondaryOrange),
              title: Text('Loan Eligibility'),
              subtitle: Text('You are eligible for up to 50,000 RWF'),
              trailing: Icon(Icons.arrow_forward_ios, size: 16),
            ),
          ),

          const SizedBox(height: AppSpacing.lg),

          Text(
            'RECENT TRANSACTIONS',
            style: AppTypography.overline.copyWith(color: AppColors.textMedium),
          ),
          const SizedBox(height: AppSpacing.sm),

          if (transactions == null || transactions.isEmpty)
            const Center(
              child: Padding(
                padding: EdgeInsets.all(8.0),
                child: Text('No recent transactions'),
              ),
            )
          else
            ...transactions.map((txn) => _buildTransactionItem(txn)),
        ],
      ),
    );
  }

  Widget _buildTransactionItem(Map<String, dynamic> txn) {
    final isCredit =
        txn['type'] == 'savings_deposit' || txn['type'] == 'profit_share';
    final amount = (txn['amount'] ?? 0).toDouble();
    final dateStr = txn['date'] != null
        ? txn['date'].toString().split('T')[0]
        : 'Unknown Date';

    return Container(
      margin: const EdgeInsets.only(bottom: AppSpacing.sm),
      decoration: BoxDecoration(
        color: AppColors.surfaceWhite,
        borderRadius: BorderRadius.circular(AppRadius.sm),
        boxShadow: [AppShadows.card],
      ),
      child: ListTile(
        leading: Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: (isCredit ? AppColors.success : AppColors.error)
                .withValues(alpha: 0.1),
            shape: BoxShape.circle,
          ),
          child: Icon(
            isCredit ? Icons.arrow_downward : Icons.arrow_upward,
            color: isCredit ? AppColors.success : AppColors.error,
            size: 16,
          ),
        ),
        title: Text(
          txn['description'] ?? txn['type'] ?? 'Transaction',
          style: AppTypography.bodyMedium.copyWith(fontWeight: FontWeight.w600),
        ),
        subtitle: Text(dateStr, style: AppTypography.caption),
        trailing: Text(
          '${isCredit ? '+' : '-'}${amount.toStringAsFixed(0)} RWF',
          style: TextStyle(
            color: isCredit ? AppColors.success : AppColors.error,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
    );
  }
}
