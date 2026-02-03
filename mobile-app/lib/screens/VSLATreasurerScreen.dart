import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/database_service.dart';

class VSLATreasurerScreen extends StatefulWidget {
  const VSLATreasurerScreen({Key? key}) : super(key: key);

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
    _fetchVSLAData();
  }

  Future<void> _fetchVSLAData() async {
    try {
      final dbService = Provider.of<DatabaseService>(context, listen: false);
      // TODO: Implement actual database query
      
      // Mock data
      setState(() {
        _vslaData = {
          'group_name': 'VSLA Group Gahanga',
          'total_savings': 240000.0,
          'total_loans': 150000.0,
          'maintenance_fund': 50000.0,
          'member_count': 20,
        };
        _recentTransactions = [
          {
            'id': 1,
            'member': 'Alice Nyirahabimana',
            'type': 'savings',
            'amount': 10000.0,
            'date': DateTime.now().subtract(const Duration(days: 1)),
          },
          {
            'id': 2,
            'member': 'Grace Mukankusi',
            'type': 'loan',
            'amount': 50000.0,
            'date': DateTime.now().subtract(const Duration(days: 2)),
          }
        ];
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error loading VSLA data: $e')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('VSLA Treasury'),
        backgroundColor: Colors.blue[700],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _fetchVSLAData,
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Group Name Card
                    Card(
                      elevation: 0,
                      color: Colors.blue[50],
                      child: Padding(
                        padding: const EdgeInsets.all(16),
                        child: Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color: Colors.blue[100],
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Icon(Icons.group, color: Colors.blue[700], size: 32),
                            ),
                            const SizedBox(width: 16),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    _vslaData['group_name'] ?? '',
                                    style: const TextStyle(
                                      fontSize: 18,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                  Text(
                                    '${_vslaData['member_count']} Members',
                                    style: TextStyle(color: Colors.grey[700]),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 24),
                    
                    // Financial Summary
                    const Text(
                      'Financial Summary',
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 12),
                    
                    Row(
                      children: [
                        Expanded(
                          child: _buildSummaryCard(
                            'Total Savings',
                            _vslaData['total_savings'] ?? 0,
                            Colors.green,
                            Icons.savings,
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: _buildSummaryCard(
                            'Loans Out',
                            _vslaData['total_loans'] ?? 0,
                            Colors.orange,
                            Icons.money,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    _buildSummaryCard(
                      'Maintenance Fund',
                      _vslaData['maintenance_fund'] ?? 0,
                      Colors.blue,
                      Icons.account_balance,
                      fullWidth: true,
                    ),
                    
                    const SizedBox(height: 24),
                    
                    // Recent Transactions
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          'Recent Transactions',
                          style: TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        TextButton(
                          onPressed: () {
                            // TODO: Navigate to full transaction history
                          },
                          child: const Text('View All'),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    
                    ..._recentTransactions.map((txn) => _buildTransactionCard(txn)).toList(),
                  ],
                ),
              ),
            ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {
          // TODO: Navigate to add transaction screen
        },
        backgroundColor: Colors.blue[700],
        label: const Text('New Transaction'),
        icon: const Icon(Icons.add),
      ),
    );
  }

  Widget _buildSummaryCard(
    String label,
    double amount,
    MaterialColor color,
    IconData icon, {
    bool fullWidth = false,
  }) {
    return Card(
      elevation: 2,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(icon, color: color[700], size: 20),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    label,
                    style: TextStyle(
                      fontSize: 14,
                      color: Colors.grey[700],
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              '${amount.toStringAsFixed(0)} RWF',
              style: TextStyle(
                fontSize: fullWidth ? 24 : 18,
                fontWeight: FontWeight.bold,
                color: color[700],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTransactionCard(Map<String, dynamic> txn) {
    final isLoan = txn['type'] == 'loan';
    final color = isLoan ? Colors.orange : Colors.green;
    
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: ListTile(
        leading: Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: color[50],
            borderRadius: BorderRadius.circular(8),
          ),
          child: Icon(
            isLoan ? Icons.arrow_upward : Icons.arrow_downward,
            color: color[700],
          ),
        ),
        title: Text(
          txn['member'],
          style: const TextStyle(fontWeight: FontWeight.w600),
        ),
        subtitle: Text(
          _formatDate(txn['date']),
          style: TextStyle(color: Colors.grey[600], fontSize: 12),
        ),
        trailing: Text(
          '${txn['amount'].toStringAsFixed(0)} RWF',
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.bold,
            color: color[700],
          ),
        ),
      ),
    );
  }

  String _formatDate(DateTime date) {
    final now = DateTime.now();
    final difference = now.difference(date).inDays;
    
    if (difference == 0) return 'Today';
    if (difference == 1) return 'Yesterday';
    return '${date.day}/${date.month}/${date.year}';
  }
}
