import 'package:flutter/material.dart';
import '../../services/api_service.dart';
import '../../theme/design_system.dart';
import '../../widgets/common/aaywa_card.dart';

class SalesHistoryScreen extends StatefulWidget {
  const SalesHistoryScreen({super.key});

  @override
  State<SalesHistoryScreen> createState() => _SalesHistoryScreenState();
}

class _SalesHistoryScreenState extends State<SalesHistoryScreen> {
  bool _isLoading = true;
  List<Map<String, dynamic>> _sales = [];

  @override
  void initState() {
    super.initState();
    _loadSalesHistory();
  }

  Future<void> _loadSalesHistory() async {
    setState(() => _isLoading = true);

    try {
      final apiService = ApiService();
      final response = await apiService.get('/sales/my-sales');

      if (mounted) {
        setState(() {
          _sales = (response as List).map((item) {
            // Parse date nicely
            final date = DateTime.parse(
                item['created_at'] ?? DateTime.now().toIso8601String());
            final dateStr = '${date.day}/${date.month}/${date.year}';

            return {
              'id': item['id'].toString(),
              'date': dateStr,
              'crop': item['crop_type'] ?? 'Unknown',
              'weight': (item['quantity'] ?? 0).toDouble(),
              'price_per_kg': (item['unit_price'] ?? 0).toDouble(),
              'total': (item['gross_revenue'] ?? 0).toDouble(),
              'farmer_share': (item['farmer_share'] ?? 0).toDouble(),
            };
          }).toList();
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoading = false;
          // Keep empty list on error or maybe show snackbar
        });
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error loading sales: $e')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.backgroundGray,
      appBar: AppBar(
        title: const Text('Sales History'),
        backgroundColor: AppColors.surfaceWhite,
        elevation: 0,
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _sales.isEmpty
              ? Center(
                  child: Text(
                    'No sales recorded yet',
                    style: AppTypography.bodyLarge
                        .copyWith(color: AppColors.textMedium),
                  ),
                )
              : ListView.builder(
                  padding: const EdgeInsets.all(AppSpacing.md),
                  itemCount: _sales.length,
                  itemBuilder: (context, index) {
                    final sale = _sales[index];
                    return _buildSaleCard(sale);
                  },
                ),
    );
  }

  Widget _buildSaleCard(Map<String, dynamic> sale) {
    return GestureDetector(
      onTap: () => _showReceiptDialog(sale),
      child: AaywaCard(
        padding: const EdgeInsets.all(AppSpacing.md),
        child: Column(
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(AppSpacing.sm),
                      decoration: BoxDecoration(
                        color: AppColors.primaryGreen.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(AppRadius.sm),
                      ),
                      child: Icon(Icons.shopping_bag,
                          color: AppColors.primaryGreen, size: 20),
                    ),
                    const SizedBox(width: AppSpacing.md),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          sale['crop'],
                          style: AppTypography.labelLarge
                              .copyWith(fontWeight: FontWeight.w600),
                        ),
                        Text(
                          sale['date'],
                          style: AppTypography.caption
                              .copyWith(color: AppColors.textMedium),
                        ),
                      ],
                    ),
                  ],
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text(
                      '${(sale['total'] as double).toStringAsFixed(0)} RWF',
                      style: AppTypography.labelLarge
                          .copyWith(fontWeight: FontWeight.bold),
                    ),
                    Text(
                      'Share: ${(sale['farmer_share'] as double).toStringAsFixed(0)}',
                      style: AppTypography.caption
                          .copyWith(color: AppColors.success),
                    ),
                  ],
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  void _showReceiptDialog(Map<String, dynamic> sale) {
    showDialog(
      context: context,
      builder: (context) => Dialog(
        shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(AppRadius.md)),
        child: Padding(
          padding: const EdgeInsets.all(AppSpacing.lg),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Icon(Icons.check_circle, color: AppColors.success, size: 48),
              const SizedBox(height: AppSpacing.md),
              Text('Transaction Receipt', style: AppTypography.h3),
              const SizedBox(height: AppSpacing.xs),
              Text('ID: ${sale['id']}', style: AppTypography.caption),
              const Divider(height: 32),
              _buildReceiptRow('Crop', sale['crop']),
              _buildReceiptRow('Weight', '${sale['weight']} kg'),
              _buildReceiptRow('Price/kg', '${sale['price_per_kg']} RWF'),
              const Divider(),
              _buildReceiptRow('Gross Total', '${sale['total']} RWF',
                  isBold: true),
              const Divider(),
              _buildReceiptRow(
                  'Farmer Share (VSLA)', '${sale['farmer_share']} RWF',
                  color: AppColors.success),
              _buildReceiptRow('Deductions', '-20%', color: AppColors.error),
              const SizedBox(height: AppSpacing.xl),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  OutlinedButton.icon(
                    onPressed: () {}, // TODO: Share functionality
                    icon: const Icon(Icons.share, size: 18),
                    label: const Text('Share'),
                  ),
                  const SizedBox(width: AppSpacing.md),
                  ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primaryGreen,
                      foregroundColor: Colors.white,
                    ),
                    onPressed: () => Navigator.pop(context),
                    child: const Text('Close'),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildReceiptRow(String label, String value,
      {bool isBold = false, Color? color}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label,
              style: AppTypography.bodyMedium
                  .copyWith(color: AppColors.textMedium)),
          Text(value,
              style: AppTypography.bodyMedium.copyWith(
                  fontWeight: isBold ? FontWeight.bold : FontWeight.normal,
                  color: color ?? AppColors.textDark)),
        ],
      ),
    );
  }
}
