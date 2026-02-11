import 'package:flutter/material.dart';
import '../../services/api_service.dart';
import '../../theme/design_system.dart';
import '../../widgets/common/aaywa_card.dart';
import '../../widgets/kpi_metric_card.dart';

class VSLATreasurerScreen extends StatefulWidget {
  const VSLATreasurerScreen({super.key});

  @override
  State<VSLATreasurerScreen> createState() => _VSLATreasurerScreenState();
}

class _VSLATreasurerScreenState extends State<VSLATreasurerScreen> {
  bool _isLoading = true;
  Map<String, dynamic> _vslaData = {};
  List<Map<String, dynamic>> _recentTransactions = [];

  @override
  void initState() {
    super.initState();
    _loadVSLAData();
  }

  Future<void> _loadVSLAData() async {
    setState(() => _isLoading = true);

    try {
      final apiService = ApiService();

      // Fetch VSLA summary data
      final response = await apiService.get('/vsla/summary');

      setState(() {
        _vslaData = response;
        _recentTransactions = List<Map<String, dynamic>>.from(
          response['recent_transactions'] ?? [],
        );
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error loading VSLA data: $e')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.backgroundGray,
      appBar: AppBar(
        title: const Text('My VSLA Passbook'),
        backgroundColor: AppColors.surfaceWhite,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loadVSLAData,
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _loadVSLAData,
              child: ListView(
                padding: const EdgeInsets.all(AppSpacing.md),
                children: [
                  // Current Balance Card
                  _buildBalanceCard(),

                  const SizedBox(height: AppSpacing.lg),

                  // Financial Summary Grid
                  _buildFinancialSummary(),

                  const SizedBox(height: AppSpacing.lg),

                  // Trust Score
                  _buildTrustScoreCard(),

                  const SizedBox(height: AppSpacing.lg),

                  // Savings Trend Chart
                  _buildSavingsTrendCard(),

                  const SizedBox(height: AppSpacing.lg),

                  // Recent Transactions
                  _buildRecentTransactions(),

                  const SizedBox(height: AppSpacing.xxl),
                ],
              ),
            ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {
          // Navigate to transaction entry
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Transaction entry coming soon')),
          );
        },
        backgroundColor: AppColors.primaryGreen,
        icon: const Icon(Icons.add),
        label: const Text('New Transaction'),
      ),
    );
  }

  Widget _buildBalanceCard() {
    final balance = _vslaData['current_balance'] ?? 0.0;
    final growth = _vslaData['monthly_growth'] ?? 0.0;

    return AaywaCard(
      hasAccentTop: true,
      accentColor: AppColors.primaryGreen,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'CURRENT BALANCE',
                style: AppTypography.overline.copyWith(
                  color: AppColors.textMedium,
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: AppSpacing.sm,
                  vertical: AppSpacing.xs,
                ),
                decoration: BoxDecoration(
                  color: AppColors.success.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(AppRadius.full),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.account_balance_wallet,
                        size: 14, color: AppColors.success),
                    const SizedBox(width: AppSpacing.xs),
                    Text(
                      '+${growth.toStringAsFixed(1)}%',
                      style: AppTypography.labelSmall.copyWith(
                        color: AppColors.success,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.sm),
          Text(
            '${balance.toStringAsFixed(0)} RWF',
            style: AppTypography.numberLarge.copyWith(
              color: AppColors.primaryGreen,
            ),
          ),
          const SizedBox(height: AppSpacing.xs),
          Text(
            'This month',
            style: AppTypography.bodySmall.copyWith(
              color: AppColors.textMedium,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFinancialSummary() {
    return GridView.count(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisCount: 2,
      mainAxisSpacing: AppSpacing.md,
      crossAxisSpacing: AppSpacing.md,
      childAspectRatio: 1.3,
      children: [
        CompactKPICard(
          label: 'Total Savings',
          value: '${(_vslaData['total_savings'] ?? 0).toStringAsFixed(0)} RWF',
          icon: Icons.savings,
          color: AppColors.primaryGreen,
        ),
        CompactKPICard(
          label: 'Active Loan',
          value: '${(_vslaData['active_loan'] ?? 0).toStringAsFixed(0)} RWF',
          icon: Icons.account_balance,
          color: AppColors.warning,
        ),
        CompactKPICard(
          label: 'Social Fund',
          value: '${(_vslaData['social_fund'] ?? 0).toStringAsFixed(0)} RWF',
          icon: Icons.favorite,
          color: AppColors.error,
        ),
        CompactKPICard(
          label: 'Next Payment',
          value: '${(_vslaData['next_payment'] ?? 0).toStringAsFixed(0)} RWF',
          icon: Icons.schedule,
          color: AppColors.info,
        ),
      ],
    );
  }

  Widget _buildTrustScoreCard() {
    final trustScore = _vslaData['trust_score'] ?? 82;
    final status = trustScore >= 80
        ? 'Excellent'
        : trustScore >= 60
            ? 'Good'
            : 'Fair';
    final statusColor = trustScore >= 80
        ? AppColors.success
        : trustScore >= 60
            ? AppColors.warning
            : AppColors.error;

    return AaywaCard(
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
                    'TRUST SCORE',
                    style: AppTypography.overline.copyWith(
                      color: AppColors.textMedium,
                    ),
                  ),
                  const SizedBox(height: AppSpacing.xs),
                  Row(
                    children: [
                      Text(
                        '$trustScore',
                        style: AppTypography.h1.copyWith(
                          color: AppColors.indigo,
                        ),
                      ),
                      Text(
                        '/100',
                        style: AppTypography.h4.copyWith(
                          color: AppColors.textLight,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: AppSpacing.md,
                  vertical: AppSpacing.sm,
                ),
                decoration: BoxDecoration(
                  color: statusColor.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(AppRadius.full),
                ),
                child: Text(
                  status,
                  style: AppTypography.labelMedium.copyWith(
                    color: statusColor,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.md),
          // Progress bar
          ClipRRect(
            borderRadius: BorderRadius.circular(AppRadius.full),
            child: LinearProgressIndicator(
              value: trustScore / 100,
              minHeight: 8,
              backgroundColor: AppColors.divider,
              valueColor: AlwaysStoppedAnimation<Color>(statusColor),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSavingsTrendCard() {
    return AaywaCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'SAVINGS TREND',
            style: AppTypography.overline.copyWith(
              color: AppColors.textMedium,
            ),
          ),
          const SizedBox(height: AppSpacing.md),

          // Simple bar chart visualization
          SizedBox(
            height: 120,
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.end,
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: List.generate(12, (index) {
                final heights = [
                  0.3,
                  0.4,
                  0.6,
                  0.7,
                  0.9,
                  0.8,
                  0.7,
                  0.5,
                  0.6,
                  0.8,
                  1.0,
                  0.9
                ];
                return Expanded(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 2),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.end,
                      children: [
                        Container(
                          height: 120 * heights[index],
                          decoration: BoxDecoration(
                            color: index == 11
                                ? AppColors.primaryGreen
                                : AppColors.accentGreen.withValues(alpha: 0.5),
                            borderRadius: const BorderRadius.vertical(
                              top: Radius.circular(4),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              }),
            ),
          ),
          const SizedBox(height: AppSpacing.sm),
          Text(
            'Last 12 weeks',
            style: AppTypography.caption.copyWith(
              color: AppColors.textLight,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Widget _buildRecentTransactions() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'RECENT TRANSACTIONS',
              style: AppTypography.overline.copyWith(
                color: AppColors.textMedium,
              ),
            ),
            TextButton(
              onPressed: () {
                // View all transactions
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                      content: Text('All transactions view coming soon')),
                );
              },
              child: const Text('View All'),
            ),
          ],
        ),
        const SizedBox(height: AppSpacing.sm),
        if (_recentTransactions.isEmpty)
          Center(
            child: Padding(
              padding: const EdgeInsets.all(AppSpacing.xl),
              child: Column(
                children: [
                  Icon(
                    Icons.receipt_long_outlined,
                    size: 48,
                    color: AppColors.textLight.withValues(alpha: 0.5),
                  ),
                  const SizedBox(height: AppSpacing.md),
                  Text(
                    'No transactions yet',
                    style: AppTypography.bodyMedium.copyWith(
                      color: AppColors.textMedium,
                    ),
                  ),
                ],
              ),
            ),
          )
        else
          ...List.generate(_recentTransactions.length.clamp(0, 5), (index) {
            final transaction = _recentTransactions[index];
            return _buildTransactionTile(transaction);
          }),
      ],
    );
  }

  Widget _buildTransactionTile(Map<String, dynamic> transaction) {
    final type = transaction['type'] ?? 'deposit';
    final amount = transaction['amount'] ?? 0.0;
    final date = transaction['date'] ?? 'Today';
    final description = transaction['description'] ?? 'Transaction';

    final isPositive = type == 'deposit' || type == 'savings';
    final icon = type == 'deposit'
        ? Icons.add_circle
        : type == 'loan'
            ? Icons.monetization_on
            : Icons.remove_circle;
    final color = isPositive ? AppColors.success : AppColors.warning;

    return AaywaCard(
      padding: const EdgeInsets.all(AppSpacing.md),
      elevated: false,
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(AppSpacing.sm),
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(AppRadius.sm),
            ),
            child: Icon(icon, color: color, size: 20),
          ),
          const SizedBox(width: AppSpacing.md),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  description,
                  style: AppTypography.bodyMedium.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: AppSpacing.xs),
                Text(
                  date,
                  style: AppTypography.bodySmall.copyWith(
                    color: AppColors.textMedium,
                  ),
                ),
              ],
            ),
          ),
          Text(
            '${isPositive ? '+' : '-'}${amount.toStringAsFixed(0)} RWF',
            style: AppTypography.labelLarge.copyWith(
              color: color,
              fontWeight: FontWeight.w700,
            ),
          ),
        ],
      ),
    );
  }
}
