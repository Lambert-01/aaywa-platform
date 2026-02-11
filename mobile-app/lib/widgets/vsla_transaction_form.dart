import 'package:flutter/material.dart';

class VSLATransactionForm extends StatefulWidget {
  const VSLATransactionForm({super.key});

  @override
  State<VSLATransactionForm> createState() => _VSLATransactionFormState();
}

class _VSLATransactionFormState extends State<VSLATransactionForm> {
  final _amountController = TextEditingController();
  String _transactionType = 'deposit';

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'New Transaction',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            DropdownButtonFormField<String>(
              value: _transactionType,
              items: const [
                DropdownMenuItem(value: 'deposit', child: Text('Deposit')),
                DropdownMenuItem(
                    value: 'withdrawal', child: Text('Withdrawal')),
              ],
              onChanged: (value) {
                setState(() => _transactionType = value!);
              },
              decoration: const InputDecoration(
                labelText: 'Transaction Type',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _amountController,
              decoration: const InputDecoration(
                labelText: 'Amount',
                border: OutlineInputBorder(),
                prefixText: '\$',
              ),
              keyboardType: TextInputType.number,
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: _submitTransaction,
              child: const Text('Submit Transaction'),
            ),
          ],
        ),
      ),
    );
  }

  void _submitTransaction() {
    // Implement transaction submission logic
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Transaction submitted')),
    );
  }

  @override
  void dispose() {
    _amountController.dispose();
    super.dispose();
  }
}
