import 'package:flutter/material.dart';

class TransactionHistoryList extends StatelessWidget {
  const TransactionHistoryList({super.key});

  @override
  Widget build(BuildContext context) {
    // Replace with actual transaction data
    final transactions = [
      {'type': 'Deposit', 'amount': 100.0, 'date': '2023-10-01'},
      {'type': 'Withdrawal', 'amount': 50.0, 'date': '2023-10-02'},
    ];

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Transaction History',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            ListView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: transactions.length,
              itemBuilder: (context, index) {
                final transaction = transactions[index];
                return ListTile(
                  title: Text(transaction['type'] as String),
                  subtitle: Text(transaction['date'] as String),
                  trailing: Text(
                    '\$${transaction['amount']}',
                    style: TextStyle(
                      color: transaction['type'] == 'Deposit'
                          ? Colors.green
                          : Colors.red,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}
