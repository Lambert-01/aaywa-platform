import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../services/database_service.dart';
import '../../services/api_service.dart';
import '../../theme/design_system.dart';
import '../../widgets/common/aaywa_card.dart';
import '../../widgets/common/aaywa_button.dart';

class SyncStatusScreen extends StatefulWidget {
  const SyncStatusScreen({super.key});

  @override
  State<SyncStatusScreen> createState() => _SyncStatusScreenState();
}

class _SyncStatusScreenState extends State<SyncStatusScreen> {
  bool _isLoading = true;
  bool _isSyncing = false;
  Map<String, dynamic> _syncStatus = {};

  @override
  void initState() {
    super.initState();
    _loadSyncStatus();
  }

  Future<void> _loadSyncStatus() async {
    setState(() => _isLoading = true);

    try {
      final dbService = Provider.of<DatabaseService>(context, listen: false);

      // Get pending items count
      final pendingSales = await dbService.getUnsyncedSales();
      final pendingTransactions = await dbService.getUnsyncedVSLATransactions();
      final lastSyncDate = await dbService.getLastSyncTimestamp();

      if (mounted) {
        setState(() {
          _syncStatus = {
            'pending_sales': pendingSales.length,
            'pending_transactions': pendingTransactions.length,
            'last_sync': lastSyncDate,
            'sync_enabled': true,
          };
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _syncNow() async {
    setState(() => _isSyncing = true);

    try {
      final dbService = Provider.of<DatabaseService>(context, listen: false);
      final apiService = ApiService();

      // Sync pending sales
      final pendingSales = await dbService.getUnsyncedSales();
      int syncedSalesCount = 0;
      for (var sale in pendingSales) {
        try {
          // Convert Drift row to Map for API
          final saleMap = {
            'farmer_id': sale.farmerId,
            'crop_type': sale.cropType,
            'quantity_kg': sale.quantityKg,
            'price_per_kg': sale.pricePerKg,
            'total_amount': sale.totalAmount,
            'date': sale.date,
          };
          await apiService.post('/sales', saleMap);
          await dbService.markSalesAsSynced([sale.id]);
          syncedSalesCount++;
        } catch (e) {
          if (kDebugMode) {
            debugPrint('[SYNC] Failed to sync sale: $e');
          }
        }
      }

      // Sync pending transactions
      final pendingTransactions = await dbService.getUnsyncedVSLATransactions();
      int syncedTransactionsCount = 0;
      for (var transaction in pendingTransactions) {
        try {
          // Convert row to map
          final txMap = {
            'farmer_id': transaction.farmerId,
            'amount': transaction.amount,
            'transaction_type': transaction.type,
            'transaction_date': transaction.date,
          };
          await apiService.post('/vsla/transactions', txMap);
          await dbService.markVSLATransactionsAsSynced([transaction.id]);
          syncedTransactionsCount++;
        } catch (e) {
          if (kDebugMode) {
            debugPrint('[SYNC] Failed to sync transaction: $e');
          }
        }
      }

      await dbService.updateLastSyncTimestamp();

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
                'Synced ${syncedSalesCount + syncedTransactionsCount} items'),
            backgroundColor: AppColors.success,
          ),
        );
        await _loadSyncStatus();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Sync failed: $e'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isSyncing = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.backgroundGray,
      appBar: AppBar(
        title: const Text('Sync Status'),
        backgroundColor: AppColors.surfaceWhite,
        elevation: 0,
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _loadSyncStatus,
              child: ListView(
                padding: const EdgeInsets.all(AppSpacing.md),
                children: [
                  // Sync Summary
                  _buildSyncSummary(),

                  const SizedBox(height: AppSpacing.xl),

                  // Pending Items
                  Text(
                    'PENDING ITEMS',
                    style: AppTypography.overline.copyWith(
                      color: AppColors.textMedium,
                    ),
                  ),
                  const SizedBox(height: AppSpacing.sm),

                  _buildPendingItem(
                    'Sales',
                    _syncStatus['pending_sales'] ?? 0,
                    Icons.shopping_bag,
                    AppColors.primaryGreen,
                  ),

                  const SizedBox(height: AppSpacing.sm),

                  _buildPendingItem(
                    'VSLA Transactions',
                    _syncStatus['pending_transactions'] ?? 0,
                    Icons.account_balance_wallet,
                    AppColors.blue,
                  ),

                  const SizedBox(height: AppSpacing.xl),

                  // Sync Button
                  AaywaButton(
                    label: 'Sync Now',
                    icon: Icons.sync,
                    onPressed: _syncNow,
                    isLoading: _isSyncing,
                    fullWidth: true,
                    size: ButtonSize.large,
                  ),

                  const SizedBox(height: AppSpacing.sm),

                  // Last Sync Info
                  Center(
                    child: Text(
                      'Last synced: ${_formatLastSync(_syncStatus['last_sync'])}',
                      style: AppTypography.bodySmall.copyWith(
                        color: AppColors.textMedium,
                      ),
                    ),
                  ),

                  const SizedBox(height: AppSpacing.xxl),

                  // Settings
                  AaywaCard(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'SYNC SETTINGS',
                          style: AppTypography.overline.copyWith(
                            color: AppColors.textMedium,
                          ),
                        ),
                        const SizedBox(height: AppSpacing.md),
                        SwitchListTile(
                          title: const Text('Auto Sync'),
                          subtitle:
                              const Text('Automatically sync when online'),
                          value: _syncStatus['sync_enabled'] ?? true,
                          onChanged: (value) {
                            setState(() {
                              _syncStatus['sync_enabled'] = value;
                            });
                          },
                          activeColor: AppColors.primaryGreen,
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
    );
  }

  Widget _buildSyncSummary() {
    final totalPending = (_syncStatus['pending_sales'] ?? 0) +
        (_syncStatus['pending_transactions'] ?? 0);

    return AaywaCard(
      hasAccentTop: true,
      accentColor: totalPending > 0 ? AppColors.warning : AppColors.success,
      child: Column(
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(AppSpacing.md),
                decoration: BoxDecoration(
                  color:
                      (totalPending > 0 ? AppColors.warning : AppColors.success)
                          .withValues(alpha: 0.1),
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  totalPending > 0 ? Icons.cloud_upload : Icons.cloud_done,
                  color:
                      totalPending > 0 ? AppColors.warning : AppColors.success,
                  size: 32,
                ),
              ),
              const SizedBox(width: AppSpacing.md),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      totalPending > 0 ? 'Pending Sync' : 'All Synced',
                      style: AppTypography.h4.copyWith(
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: AppSpacing.xs),
                    Text(
                      totalPending > 0
                          ? '$totalPending items waiting to sync'
                          : 'Everything is up to date',
                      style: AppTypography.bodySmall.copyWith(
                        color: AppColors.textMedium,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildPendingItem(
      String label, int count, IconData icon, Color color) {
    return AaywaCard(
      padding: const EdgeInsets.all(AppSpacing.md),
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
            child: Text(
              label,
              style: AppTypography.bodyMedium.copyWith(
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(
              horizontal: AppSpacing.sm,
              vertical: AppSpacing.xs,
            ),
            decoration: BoxDecoration(
              color: count > 0
                  ? AppColors.warning.withValues(alpha: 0.1)
                  : AppColors.success.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(AppRadius.full),
            ),
            child: Text(
              '$count',
              style: AppTypography.labelMedium.copyWith(
                color: count > 0 ? AppColors.warning : AppColors.success,
                fontWeight: FontWeight.w700,
              ),
            ),
          ),
        ],
      ),
    );
  }

  String _formatLastSync(DateTime? lastSync) {
    if (lastSync == null) return 'Never';

    final now = DateTime.now();
    final difference = now.difference(lastSync);

    if (difference.inMinutes < 1) {
      return 'Just now';
    } else if (difference.inMinutes < 60) {
      return '${difference.inMinutes} minutes ago';
    } else if (difference.inHours < 24) {
      return '${difference.inHours} hours ago';
    } else {
      return '${difference.inDays} days ago';
    }
  }
}
