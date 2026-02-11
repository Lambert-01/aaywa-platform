import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:drift/drift.dart' as drift;
import '../../services/database_service.dart';
import '../../providers/auth_provider.dart';
import '../../theme/design_system.dart';
import '../../widgets/common/aaywa_button.dart';
import '../../widgets/common/aaywa_card.dart';
import '../../widgets/common/aaywa_input.dart';

class InputInvoiceEntryScreen extends StatefulWidget {
  const InputInvoiceEntryScreen({super.key});

  @override
  State<InputInvoiceEntryScreen> createState() =>
      _InputInvoiceEntryScreenState();
}

class _InputInvoiceEntryScreenState extends State<InputInvoiceEntryScreen> {
  final _formKey = GlobalKey<FormState>();
  bool _isSubmitting = false;

  final _supplierController = TextEditingController();
  final _amountController = TextEditingController();
  final _quantityController = TextEditingController(text: '1');
  final _notesController = TextEditingController();

  String _inputType = 'Fertilizer';
  DateTime _purchaseDate = DateTime.now();
  int _installments = 1;

  final List<String> _inputTypes = [
    'Fertilizer',
    'Seeds',
    'Pesticides',
    'Tools',
    'Other',
  ];

  @override
  void dispose() {
    _supplierController.dispose();
    _amountController.dispose();
    _quantityController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  Future<void> _submitInvoice() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isSubmitting = true);

    try {
      final db = Provider.of<DatabaseService>(context, listen: false);
      final auth = Provider.of<AuthProvider>(context, listen: false);
      final amount = double.parse(_amountController.text);
      final qty = double.tryParse(_quantityController.text) ?? 1.0;

      final farmerId = auth.user?['farmer_id']?.toString() ?? 'unknown';

      final invoice = InputInvoicesCompanion(
        farmerId: drift.Value(farmerId),
        supplier: drift.Value(_supplierController.text),
        inputType: drift.Value(_inputType),
        quantity: drift.Value(qty),
        unitPrice: drift.Value(amount / qty),
        totalCost: drift.Value(amount),
        installments: drift.Value(_installments),
        paymentStatus: const drift.Value('pending'),
        purchaseDate: drift.Value(_purchaseDate),
        notes: drift.Value(
            _notesController.text.isNotEmpty ? _notesController.text : null),
      );

      await db.insertInputInvoice(invoice);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content:
                Text('Invoice saved offline: ${amount.toStringAsFixed(0)} RWF'),
            backgroundColor: AppColors.success,
          ),
        );
        Navigator.of(context).pop();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error saving invoice: $e'),
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

  double _calculateMonthlyPayment() {
    final amount = double.tryParse(_amountController.text) ?? 0.0;
    if (_installments == 0) return 0.0;
    return amount / _installments;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.backgroundGray,
      appBar: AppBar(
        title: const Text('Record Input Purchase'),
        backgroundColor: AppColors.surfaceWhite,
        elevation: 0,
      ),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(AppSpacing.md),
          children: [
            // Info Card
            AaywaCard(
              hasAccentTop: true,
              accentColor: AppColors.info,
              child: Row(
                children: [
                  const Icon(Icons.info_outline, color: AppColors.info),
                  const SizedBox(width: AppSpacing.md),
                  Expanded(
                    child: Text(
                      'Record inputs purchased on credit. Payments will be deducted from sales automatically.',
                      style: AppTypography.bodySmall.copyWith(
                        color: AppColors.textMedium,
                      ),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: AppSpacing.xl),

            // Supplier
            AaywaInput(
              controller: _supplierController,
              label: 'Supplier Name',
              hint: 'e.g., Rwanda Agriculture Inputs Ltd',
              prefixIcon: Icons.store,
              validator: (value) {
                if (value == null || value.isEmpty) {
                  return 'Please enter supplier name';
                }
                return null;
              },
            ),

            const SizedBox(height: AppSpacing.md),

            // Input Type & Quantity
            Row(
              children: [
                Expanded(
                  flex: 2,
                  child: AaywaDropdown(
                    value: _inputType,
                    label: 'Input Type',
                    items: _inputTypes
                        .map((type) => DropdownMenuItem(
                              value: type,
                              child: Text(type),
                            ))
                        .toList(),
                    onChanged: (value) {
                      if (value != null) {
                        setState(() => _inputType = value);
                      }
                    },
                    prefixIcon: Icons.category,
                  ),
                ),
                const SizedBox(width: AppSpacing.md),
                Expanded(
                  child: AaywaInput(
                    controller: _quantityController,
                    label: 'Qty',
                    hint: '1',
                    keyboardType: TextInputType.number,
                    validator: (value) {
                      if (value == null || value.isEmpty) return 'Ex: 1';
                      if (double.tryParse(value) == null) return 'Error';
                      return null;
                    },
                  ),
                ),
              ],
            ),

            const SizedBox(height: AppSpacing.md),

            // Amount
            AaywaInput(
              controller: _amountController,
              label: 'Total Amount (RWF)',
              hint: '0',
              keyboardType: TextInputType.number,
              prefixIcon: Icons.attach_money,
              validator: (value) {
                if (value == null || value.isEmpty) {
                  return 'Please enter amount';
                }
                if (double.tryParse(value) == null) {
                  return 'Please enter a valid number';
                }
                return null;
              },
              onChanged: (value) => setState(() {}),
            ),

            const SizedBox(height: AppSpacing.md),

            // Purchase Date
            AaywaCard(
              child: ListTile(
                leading: const Icon(Icons.calendar_today,
                    color: AppColors.primaryGreen),
                title: const Text('Purchase Date'),
                subtitle: Text(
                  '${_purchaseDate.day}/${_purchaseDate.month}/${_purchaseDate.year}',
                ),
                trailing: const Icon(Icons.chevron_right),
                onTap: () async {
                  final date = await showDatePicker(
                    context: context,
                    initialDate: _purchaseDate,
                    firstDate:
                        DateTime.now().subtract(const Duration(days: 365)),
                    lastDate: DateTime.now(),
                  );
                  if (date != null) {
                    setState(() => _purchaseDate = date);
                  }
                },
              ),
            ),

            const SizedBox(height: AppSpacing.lg),

            // Payment Plan
            Text(
              'PAYMENT PLAN',
              style: AppTypography.overline.copyWith(
                color: AppColors.textMedium,
              ),
            ),
            const SizedBox(height: AppSpacing.sm),

            AaywaCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Number of Installments',
                    style: AppTypography.labelMedium.copyWith(
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(height: AppSpacing.md),
                  Wrap(
                    spacing: AppSpacing.sm,
                    children: [1, 2, 3, 4, 6].map((count) {
                      final isSelected = _installments == count;
                      return ChoiceChip(
                        label: Text('$count month${count > 1 ? "s" : ""}'),
                        selected: isSelected,
                        onSelected: (selected) {
                          setState(() => _installments = count);
                        },
                        selectedColor: AppColors.primaryGreen,
                        backgroundColor:
                            AppColors.accentGreen.withValues(alpha: 0.1),
                        labelStyle: TextStyle(
                          color: isSelected ? Colors.white : AppColors.textDark,
                          fontWeight:
                              isSelected ? FontWeight.w600 : FontWeight.w500,
                        ),
                      );
                    }).toList(),
                  ),
                  const SizedBox(height: AppSpacing.md),
                  const Divider(),
                  const SizedBox(height: AppSpacing.md),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Monthly Payment',
                        style: AppTypography.labelMedium.copyWith(
                          color: AppColors.textMedium,
                        ),
                      ),
                      Text(
                        '${_calculateMonthlyPayment().toStringAsFixed(0)} RWF',
                        style: AppTypography.h4.copyWith(
                          color: AppColors.primaryGreen,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            const SizedBox(height: AppSpacing.md),

            // Notes
            AaywaInput(
              controller: _notesController,
              label: 'Notes (Optional)',
              hint: 'Additional details...',
              maxLines: 3,
            ),

            const SizedBox(height: AppSpacing.xl),

            // Submit
            AaywaButton(
              label: 'Record Purchase',
              icon: Icons.check_circle,
              onPressed: _submitInvoice,
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
}
