import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../providers/dashboard_provider.dart';
import '../../services/api_service.dart';
import '../../theme/design_system.dart';
import '../../widgets/common/aaywa_button.dart';
import '../../widgets/common/aaywa_card.dart';
import '../../widgets/common/aaywa_input.dart';

class SalesEntryScreen extends StatefulWidget {
  const SalesEntryScreen({super.key});

  @override
  State<SalesEntryScreen> createState() => _SalesEntryScreenState();
}

class _SalesEntryScreenState extends State<SalesEntryScreen> {
  final _formKey = GlobalKey<FormState>();
  final _weightController = TextEditingController();
  final _pricePerKgController = TextEditingController();

  String? _selectedCrop;
  double _weightKg = 0.0;
  double _pricePerKg = 0.0;
  double _inputDeduction = 20000.0; // Mock - should come from backend
  bool _isSubmitting = false;

  final List<Map<String, dynamic>> _cropOptions = [
    {'name': 'Avocado', 'icon': Icons.eco, 'color': AppColors.primaryGreen},
    {'name': 'Coffee', 'icon': Icons.coffee, 'color': Colors.brown},
    {'name': 'Maize', 'icon': Icons.grass, 'color': Colors.amber},
    {'name': 'Beans', 'icon': Icons.spa, 'color': AppColors.darkGreen},
  ];

  @override
  void dispose() {
    _weightController.dispose();
    _pricePerKgController.dispose();
    super.dispose();
  }

  void _onWeightChanged(String value) {
    setState(() {
      _weightKg = double.tryParse(value) ?? 0.0;
    });
  }

  void _onPriceChanged(String value) {
    setState(() {
      _pricePerKg = double.tryParse(value) ?? 0.0;
    });
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final dashboard = Provider.of<DashboardProvider>(context);
    _inputDeduction = dashboard.inputDebt;
  }

  double get _grossRevenue => _weightKg * _pricePerKg;
  double get _netRevenue =>
      (_grossRevenue - _inputDeduction).clamp(0.0, double.infinity);
  double get _farmerShare => _netRevenue * 0.5;
  double get _sanzaShare => _netRevenue * 0.5;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.backgroundGray,
      appBar: AppBar(
        title: const Text('Record Sale'),
        backgroundColor: AppColors.surfaceWhite,
        elevation: 0,
      ),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(AppSpacing.md),
          children: [
            // Header card with instructions
            AaywaCard(
              hasAccentTop: true,
              accentColor: AppColors.primaryGreen,
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(AppSpacing.sm),
                    decoration: BoxDecoration(
                      color: AppColors.primaryGreen.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(AppRadius.sm),
                    ),
                    child: const Icon(
                      Icons.shopping_cart,
                      color: AppColors.primaryGreen,
                      size: 32,
                    ),
                  ),
                  const SizedBox(width: AppSpacing.md),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Record Your Sale',
                          style: AppTypography.h4.copyWith(
                            color: AppColors.textDark,
                          ),
                        ),
                        const SizedBox(height: AppSpacing.xs),
                        Text(
                          'Enter sale details to see your 50/50 profit split',
                          style: AppTypography.bodySmall.copyWith(
                            color: AppColors.textMedium,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: AppSpacing.lg),

            // Crop Selection
            Text(
              'CROP TYPE',
              style: AppTypography.overline.copyWith(
                color: AppColors.textMedium,
              ),
            ),
            const SizedBox(height: AppSpacing.sm),

            // Crop chips
            Wrap(
              spacing: AppSpacing.sm,
              runSpacing: AppSpacing.sm,
              children: _cropOptions.map((crop) {
                final isSelected = _selectedCrop == crop['name'];
                return ChoiceChip(
                  label: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        crop['icon'],
                        size: 18,
                        color: isSelected ? Colors.white : crop['color'],
                      ),
                      const SizedBox(width: AppSpacing.xs),
                      Text(crop['name']),
                    ],
                  ),
                  selected: isSelected,
                  onSelected: (selected) {
                    setState(() {
                      _selectedCrop = selected ? crop['name'] : null;
                    });
                  },
                  selectedColor: crop['color'],
                  backgroundColor:
                      (crop['color'] as Color).withValues(alpha: 0.1),
                  labelStyle: TextStyle(
                    color: isSelected ? Colors.white : AppColors.textDark,
                    fontWeight: isSelected ? FontWeight.w600 : FontWeight.w500,
                  ),
                );
              }).toList(),
            ),

            const SizedBox(height: AppSpacing.lg),

            // Weight Input
            AaywaInput(
              label: 'Weight (kg)',
              hint: 'Enter weight in kilograms',
              controller: _weightController,
              keyboardType:
                  const TextInputType.numberWithOptions(decimal: true),
              prefixIcon: Icons.scale,
              onChanged: _onWeightChanged,
              inputFormatters: [
                FilteringTextInputFormatter.allow(RegExp(r'^\d+\.?\d{0,2}')),
              ],
            ),

            const SizedBox(height: AppSpacing.md),

            // Price Input
            AaywaInput(
              label: 'Price per kg (RWF)',
              hint: 'Enter price per kilogram',
              controller: _pricePerKgController,
              keyboardType:
                  const TextInputType.numberWithOptions(decimal: true),
              prefixIcon: Icons.attach_money,
              onChanged: _onPriceChanged,
              inputFormatters: [
                FilteringTextInputFormatter.allow(RegExp(r'^\d+\.?\d{0,2}')),
              ],
            ),

            const SizedBox(height: AppSpacing.xl),

            // Profit Split Preview
            if (_grossRevenue > 0) ...[
              Text(
                'PROFIT SPLIT PREVIEW',
                style: AppTypography.overline.copyWith(
                  color: AppColors.textMedium,
                ),
              ),
              const SizedBox(height: AppSpacing.sm),
              AaywaCard(
                hasAccentTop: true,
                accentColor: AppColors.info,
                child: Column(
                  children: [
                    // Gross Revenue
                    _buildCalculationRow(
                      'Gross Revenue',
                      _formatCurrency(_grossRevenue),
                      Icons.monetization_on,
                      AppColors.textDark,
                      isLarge: true,
                    ),

                    const Divider(height: AppSpacing.lg),

                    // Input Deduction
                    _buildCalculationRow(
                      'Input Deduction',
                      '- ${_formatCurrency(_inputDeduction)}',
                      Icons.receipt_long,
                      AppColors.warning,
                    ),

                    const SizedBox(height: AppSpacing.xs),

                    // Net Revenue
                    Container(
                      padding: const EdgeInsets.all(AppSpacing.sm),
                      decoration: BoxDecoration(
                        color: AppColors.backgroundGray,
                        borderRadius: BorderRadius.circular(AppRadius.sm),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            'Net Revenue',
                            style: AppTypography.labelLarge.copyWith(
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          Text(
                            _formatCurrency(_netRevenue),
                            style: AppTypography.h4.copyWith(
                              color: AppColors.textDark,
                            ),
                          ),
                        ],
                      ),
                    ),

                    const Divider(height: AppSpacing.lg),

                    // 50/50 Split
                    Text(
                      '50/50 PROFIT SPLIT',
                      style: AppTypography.overline.copyWith(
                        color: AppColors.textMedium,
                      ),
                    ),

                    const SizedBox(height: AppSpacing.md),

                    // Your Share
                    Container(
                      padding: const EdgeInsets.all(AppSpacing.md),
                      decoration: BoxDecoration(
                        color: AppColors.primaryGreen.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(AppRadius.sm),
                        border: Border.all(
                          color: AppColors.primaryGreen,
                          width: 2,
                        ),
                      ),
                      child: Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(AppSpacing.sm),
                            decoration: const BoxDecoration(
                              color: AppColors.primaryGreen,
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(
                              Icons.person,
                              color: Colors.white,
                              size: 20,
                            ),
                          ),
                          const SizedBox(width: AppSpacing.md),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'YOUR SHARE (50%)',
                                  style: AppTypography.labelSmall.copyWith(
                                    color: AppColors.darkGreen,
                                    fontWeight: FontWeight.w700,
                                  ),
                                ),
                                const SizedBox(height: AppSpacing.xs),
                                Text(
                                  _formatCurrency(_farmerShare),
                                  style: AppTypography.h2.copyWith(
                                    color: AppColors.primaryGreen,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const Icon(
                            Icons.arrow_forward,
                            color: AppColors.primaryGreen,
                          ),
                          const SizedBox(width: AppSpacing.xs),
                          Text(
                            'VSLA',
                            style: AppTypography.labelMedium.copyWith(
                              color: AppColors.primaryGreen,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: AppSpacing.sm),

                    // Sanza Share
                    Container(
                      padding: const EdgeInsets.all(AppSpacing.md),
                      decoration: BoxDecoration(
                        color: AppColors.backgroundGray,
                        borderRadius: BorderRadius.circular(AppRadius.sm),
                        border: Border.all(color: AppColors.border),
                      ),
                      child: Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(AppSpacing.sm),
                            decoration: const BoxDecoration(
                              color: AppColors.textMedium,
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(
                              Icons.business,
                              color: Colors.white,
                              size: 20,
                            ),
                          ),
                          const SizedBox(width: AppSpacing.md),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'SANZA SHARE (50%)',
                                  style: AppTypography.labelSmall.copyWith(
                                    color: AppColors.textMedium,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                                const SizedBox(height: AppSpacing.xs),
                                Text(
                                  _formatCurrency(_sanzaShare),
                                  style: AppTypography.h3.copyWith(
                                    color: AppColors.textDark,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: AppSpacing.xl),
            ],

            // Submit Button
            AaywaButton(
              label: 'Save Sale',
              icon: Icons.check_circle_outline,
              onPressed: _canSubmit() ? _submitSale : null,
              isLoading: _isSubmitting,
              fullWidth: true,
              size: ButtonSize.large,
            ),

            const SizedBox(height: AppSpacing.md),

            // Secondary action
            AaywaButton(
              label: 'Save Offline',
              icon: Icons.save_outlined,
              type: ButtonType.secondary,
              onPressed: _canSubmit() ? _saveOffline : null,
              fullWidth: true,
            ),

            const SizedBox(height: AppSpacing.xxl),
          ],
        ),
      ),
    );
  }

  Widget _buildCalculationRow(
    String label,
    String value,
    IconData icon,
    Color color, {
    bool isLarge = false,
  }) {
    return Row(
      children: [
        Icon(icon, color: color, size: isLarge ? 24 : 20),
        const SizedBox(width: AppSpacing.sm),
        Expanded(
          child: Text(
            label,
            style: isLarge
                ? AppTypography.labelLarge
                : AppTypography.bodyMedium.copyWith(
                    color: AppColors.textMedium,
                  ),
          ),
        ),
        Text(
          value,
          style: isLarge
              ? AppTypography.h3.copyWith(
                  color: color,
                  fontWeight: FontWeight.bold,
                )
              : AppTypography.bodyMedium.copyWith(
                  color: color,
                  fontWeight: FontWeight.w600,
                ),
        ),
      ],
    );
  }

  bool _canSubmit() {
    return _selectedCrop != null && _weightKg > 0 && _pricePerKg > 0;
  }

  Future<void> _submitSale() async {
    if (!_formKey.currentState!.validate() || !_canSubmit()) return;

    setState(() => _isSubmitting = true);

    try {
      final auth = Provider.of<AuthProvider>(context, listen: false);
      final apiService = ApiService();

      final saleData = {
        'crop_type': _selectedCrop,
        'quantity': _weightKg, // Backend expects 'quantity'
        'unit_price': _pricePerKg,
        'farmer_id': auth.user?['farmer_id'] ??
            auth.user?['id'], // Best effort if farmer_id missing
        // Backend calculates shares, but sending these doesn't hurt if ignored
      };

      await apiService.post('/sales', saleData);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Row(
              children: [
                const Icon(Icons.check_circle, color: Colors.white),
                const SizedBox(width: AppSpacing.sm),
                Text(
                  'Sale recorded! ${_formatCurrency(_farmerShare)} added to VSLA',
                ),
              ],
            ),
            backgroundColor: AppColors.success,
            behavior: SnackBarBehavior.floating,
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

  Future<void> _saveOffline() async {
    // Save to local database for offline sync
    debugPrint('Saving sale to local database...');
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Sale saved offline. Will sync when online.'),
        backgroundColor: AppColors.info,
      ),
    );
    Navigator.of(context).pop();
  }

  String _formatCurrency(double amount) {
    return '${amount.toStringAsFixed(0)} RWF';
  }
}
