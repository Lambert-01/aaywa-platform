import 'package:flutter/material.dart';
import '../../widgets/vsla_transaction_form.dart';
import '../../widgets/vsla_balance_card.dart';
import '../../widgets/transaction_history_list.dart';

class VSLATreasurerScreen extends StatefulWidget {
  const VSLATreasurerScreen({super.key});

  @override
  State<VSLATreasurerScreen> createState() => _VSLATreasurerScreenState();
}

class _VSLATreasurerScreenState extends State<VSLATreasurerScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('VSLA Treasurer'),
        bottom: TabBar(
          controller: _tabController,
          tabs: const [
            Tab(text: 'Overview'),
            Tab(text: 'Transactions'),
            Tab(text: 'Reports'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildOverviewTab(),
          _buildTransactionsTab(),
          _buildReportsTab(),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => _showAddTransactionDialog(),
        child: const Icon(Icons.add),
      ),
    );
  }

  Widget _buildOverviewTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const VSLAalanceCard(),
          const SizedBox(height: 24),
          Text(
            'Quick Actions',
            style: Theme.of(context).textTheme.titleLarge,
          ),
          const SizedBox(height: 16),
          GridView.count(
            crossAxisCount: 2,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            mainAxisSpacing: 16,
            crossAxisSpacing: 16,
            children: [
              _buildActionCard(
                'Record Savings',
                Icons.savings,
                Colors.green,
                () => _showAddTransactionDialog(type: 'savings'),
              ),
              _buildActionCard(
                'Issue Loan',
                Icons.money,
                Colors.blue,
                () => _showAddTransactionDialog(type: 'loan'),
              ),
              _buildActionCard(
                'Record Repayment',
                Icons.payments,
                Colors.purple,
                () => _showAddTransactionDialog(type: 'loan_repayment'),
              ),
              _buildActionCard(
                'Maintenance Fund',
                Icons.build,
                Colors.orange,
                () => _showAddTransactionDialog(type: 'maintenance'),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildTransactionsTab() {
    return const Column(
      children: [
        Expanded(
          child: TransactionHistoryList(),
        ),
      ],
    );
  }

  Widget _buildReportsTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Financial Reports',
            style: Theme.of(context).textTheme.titleLarge,
          ),
          const SizedBox(height: 16),
          _buildReportCard(
            'Monthly Savings Report',
            'View savings trends and member contributions',
            Icons.bar_chart,
          ),
          const SizedBox(height: 16),
          _buildReportCard(
            'Loan Portfolio',
            'Active loans and repayment status',
            Icons.account_balance,
          ),
          const SizedBox(height: 16),
          _buildReportCard(
            'Cash Book',
            'Complete transaction ledger',
            Icons.book,
          ),
        ],
      ),
    );
  }

  Widget _buildActionCard(String title, IconData icon, Color color, VoidCallback onTap) {
    return Card(
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(8),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(icon, size: 32, color: color),
              const SizedBox(height: 8),
              Text(
                title,
                style: Theme.of(context).textTheme.bodyMedium,
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildReportCard(String title, String description, IconData icon) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            Icon(icon, size: 32, color: Theme.of(context).primaryColor),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: Theme.of(context).textTheme.titleMedium,
                  ),
                  const SizedBox(height: 4),
                  Text(
                    description,
                    style: Theme.of(context).textTheme.bodySmall,
                  ),
                ],
              ),
            ),
            IconButton(
              onPressed: () {
                // Generate and show report
              },
              icon: const Icon(Icons.download),
            ),
          ],
        ),
      ),
    );
  }

  void _showAddTransactionDialog({String? type}) {
    showDialog(
      context: context,
      builder: (context) => VSLATransactionForm(initialType: type),
    );
  }
}