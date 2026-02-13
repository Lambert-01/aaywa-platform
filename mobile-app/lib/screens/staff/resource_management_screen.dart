import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../theme/design_system.dart';
import '../../widgets/common/aaywa_card.dart';
import '../../providers/resource_provider.dart';
import '../../models/resource_models.dart';

class ResourceManagementScreen extends StatefulWidget {
  const ResourceManagementScreen({super.key});

  @override
  State<ResourceManagementScreen> createState() =>
      _ResourceManagementScreenState();
}

class _ResourceManagementScreenState extends State<ResourceManagementScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);

    // Load data
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<ResourceProvider>().refresh();
    });
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.backgroundGray,
      appBar: AppBar(
        title: const Text('Resource Management'),
        backgroundColor: AppColors.surfaceWhite,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => context.read<ResourceProvider>().refresh(),
          ),
        ],
        bottom: TabBar(
          controller: _tabController,
          labelColor: AppColors.primaryGreen,
          unselectedLabelColor: AppColors.textMedium,
          indicatorColor: AppColors.primaryGreen,
          tabs: const [
            Tab(text: 'Overview'),
            Tab(text: 'Inventory'),
            Tab(text: 'History'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: const [
          _OverviewTab(),
          _InventoryTab(),
          _HistoryTab(),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _showDistributionDialog(context),
        backgroundColor: AppColors.primaryGreen,
        icon: const Icon(Icons.add),
        label: const Text('Distribute'),
      ),
    );
  }

  void _showDistributionDialog(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => const _DistributionWorkflow(),
    );
  }
}

// Overview Tab
class _OverviewTab extends StatelessWidget {
  const _OverviewTab();

  @override
  Widget build(BuildContext context) {
    return Consumer<ResourceProvider>(
      builder: (context, provider, child) {
        if (provider.isLoading) {
          return const Center(child: CircularProgressIndicator());
        }

        final summary = provider.summary;
        if (summary == null) {
          return const Center(child: Text('No data available'));
        }

        return RefreshIndicator(
          onRefresh: () => provider.refresh(),
          child: ListView(
            padding: const EdgeInsets.all(AppSpacing.lg),
            children: [
              // Summary Cards
              Row(
                children: [
                  Expanded(
                    child: _SummaryCard(
                      title: 'Total Items',
                      value: summary.totalItems.toString(),
                      icon: Icons.inventory_2,
                      color: const Color(0xFF6366F1),
                    ),
                  ),
                  const SizedBox(width: AppSpacing.md),
                  Expanded(
                    child: _SummaryCard(
                      title: 'Distributed Today',
                      value: summary.distributionsToday.toString(),
                      icon: Icons.local_shipping,
                      color: const Color(0xFF10B981),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: AppSpacing.md),

              // Alerts
              if (summary.lowStockItems > 0)
                _AlertCard(
                  title: 'Low Stock Alert',
                  message: '${summary.lowStockItems} items need restocking',
                  icon: Icons.warning,
                  color: const Color(0xFFF59E0B),
                  onTap: () {
                    // Switch to inventory tab filtered by low stock
                  },
                ),

              if (summary.outOfStockItems > 0)
                Padding(
                  padding: const EdgeInsets.only(top: AppSpacing.md),
                  child: _AlertCard(
                    title: 'Out of Stock',
                    message:
                        '${summary.outOfStockItems} items are out of stock',
                    icon: Icons.error,
                    color: const Color(0xFFEF4444),
                    onTap: () {
                      // Switch to inventory tab filtered by out of stock
                    },
                  ),
                ),

              const SizedBox(height: AppSpacing.xl),

              // Recent Distributions
              Text(
                'RECENT DISTRIBUTIONS',
                style: AppTypography.overline.copyWith(
                  color: AppColors.textMedium,
                ),
              ),
              const SizedBox(height: AppSpacing.sm),

              ...provider.todaysAllocations.take(5).map(
                    (allocation) => Padding(
                      padding: const EdgeInsets.only(bottom: AppSpacing.sm),
                      child: _AllocationCard(allocation: allocation),
                    ),
                  ),
            ],
          ),
        );
      },
    );
  }
}

// Inventory Tab
class _InventoryTab extends StatelessWidget {
  const _InventoryTab();

  @override
  Widget build(BuildContext context) {
    return Consumer<ResourceProvider>(
      builder: (context, provider, child) {
        if (provider.isLoading) {
          return const Center(child: CircularProgressIndicator());
        }

        final inventory = provider.inventory;

        return RefreshIndicator(
          onRefresh: () => provider.refresh(),
          child: ListView.separated(
            padding: const EdgeInsets.all(AppSpacing.lg),
            itemCount: inventory.length,
            separatorBuilder: (_, __) => const SizedBox(height: AppSpacing.md),
            itemBuilder: (context, index) {
              final item = inventory[index];
              return _InventoryItemCard(item: item);
            },
          ),
        );
      },
    );
  }
}

// History Tab
class _HistoryTab extends StatelessWidget {
  const _HistoryTab();

  @override
  Widget build(BuildContext context) {
    return Consumer<ResourceProvider>(
      builder: (context, provider, child) {
        final allocations = provider.allocations;

        if (allocations.isEmpty) {
          return const Center(
            child: Text('No distribution history yet'),
          );
        }

        return RefreshIndicator(
          onRefresh: () => provider.loadAllocations(),
          child: ListView.separated(
            padding: const EdgeInsets.all(AppSpacing.lg),
            itemCount: allocations.length,
            separatorBuilder: (_, __) => const SizedBox(height: AppSpacing.sm),
            itemBuilder: (context, index) {
              final allocation = allocations[index];
              return _AllocationCard(allocation: allocation);
            },
          ),
        );
      },
    );
  }
}

// Summary Card Widget
class _SummaryCard extends StatelessWidget {
  final String title;
  final String value;
  final IconData icon;
  final Color color;

  const _SummaryCard({
    required this.title,
    required this.value,
    required this.icon,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return AaywaCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: color, size: 32),
          const SizedBox(height: AppSpacing.sm),
          Text(
            value,
            style: AppTypography.h2.copyWith(
              fontWeight: FontWeight.bold,
              color: color,
            ),
          ),
          Text(
            title,
            style: AppTypography.caption.copyWith(
              color: AppColors.textMedium,
            ),
          ),
        ],
      ),
    );
  }
}

// Alert Card Widget
class _AlertCard extends StatelessWidget {
  final String title;
  final String message;
  final IconData icon;
  final Color color;
  final VoidCallback? onTap;

  const _AlertCard({
    required this.title,
    required this.message,
    required this.icon,
    required this.color,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(AppRadius.md),
        child: Container(
          padding: const EdgeInsets.all(AppSpacing.md),
          decoration: BoxDecoration(
            color: color.withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(AppRadius.md),
            border: Border.all(color: color),
          ),
          child: Row(
            children: [
              Icon(icon, color: color, size: 24),
              const SizedBox(width: AppSpacing.md),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: AppTypography.bodyMedium.copyWith(
                        fontWeight: FontWeight.bold,
                        color: color,
                      ),
                    ),
                    Text(
                      message,
                      style: AppTypography.bodySmall.copyWith(
                        color: AppColors.textMedium,
                      ),
                    ),
                  ],
                ),
              ),
              Icon(Icons.chevron_right, color: color),
            ],
          ),
        ),
      ),
    );
  }
}

// Inventory Item Card
class _InventoryItemCard extends StatelessWidget {
  final ResourceInventoryItem item;

  const _InventoryItemCard({required this.item});

  @override
  Widget build(BuildContext context) {
    return AaywaCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(AppSpacing.sm),
                decoration: BoxDecoration(
                  color:
                      _getTypeColor(item.resourceType).withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(AppRadius.sm),
                ),
                child: Icon(
                  _getTypeIcon(item.resourceType),
                  color: _getTypeColor(item.resourceType),
                  size: 24,
                ),
              ),
              const SizedBox(width: AppSpacing.md),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      item.resourceName,
                      style: AppTypography.bodyMedium.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    if (item.location != null)
                      Text(
                        item.location!,
                        style: AppTypography.caption.copyWith(
                          color: AppColors.textMedium,
                        ),
                      ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.md),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Current Stock',
                    style: AppTypography.caption.copyWith(
                      color: AppColors.textMedium,
                    ),
                  ),
                  Text(
                    '${item.currentQuantity} ${item.unit}',
                    style: AppTypography.h4.copyWith(
                      color: item.isOutOfStock
                          ? const Color(0xFFEF4444)
                          : item.isLowStock
                              ? const Color(0xFFF59E0B)
                              : const Color(0xFF10B981),
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
              if (item.isLowStock || item.isOutOfStock)
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: AppSpacing.sm,
                    vertical: 4,
                  ),
                  decoration: BoxDecoration(
                    color: item.isOutOfStock
                        ? const Color(0xFFEF4444)
                        : const Color(0xFFF59E0B),
                    borderRadius: BorderRadius.circular(AppRadius.full),
                  ),
                  child: Text(
                    item.isOutOfStock ? 'OUT OF STOCK' : 'LOW STOCK',
                    style: AppTypography.caption.copyWith(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
            ],
          ),
          const SizedBox(height: AppSpacing.sm),
          ClipRRect(
            borderRadius: BorderRadius.circular(AppRadius.full),
            child: LinearProgressIndicator(
              value: item.currentQuantity / (item.minimumThreshold * 3),
              minHeight: 4,
              backgroundColor: AppColors.divider,
              valueColor: AlwaysStoppedAnimation<Color>(
                item.isOutOfStock
                    ? const Color(0xFFEF4444)
                    : item.isLowStock
                        ? const Color(0xFFF59E0B)
                        : const Color(0xFF10B981),
              ),
            ),
          ),
        ],
      ),
    );
  }

  IconData _getTypeIcon(String type) {
    switch (type) {
      case 'training_material':
        return Icons.menu_book;
      case 'input_supply':
        return Icons.agriculture;
      case 'equipment':
        return Icons.hardware;
      default:
        return Icons.inventory_2;
    }
  }

  Color _getTypeColor(String type) {
    switch (type) {
      case 'training_material':
        return const Color(0xFF6366F1);
      case 'input_supply':
        return const Color(0xFF10B981);
      case 'equipment':
        return const Color(0xFFF59E0B);
      default:
        return AppColors.primaryGreen;
    }
  }
}

// Allocation Card
class _AllocationCard extends StatelessWidget {
  final ResourceAllocation allocation;

  const _AllocationCard({required this.allocation});

  @override
  Widget build(BuildContext context) {
    return AaywaCard(
      child: Row(
        children: [
          Container(
            width: 4,
            height: 60,
            decoration: BoxDecoration(
              color: allocation.isSynced
                  ? const Color(0xFF10B981)
                  : const Color(0xFFF59E0B),
              borderRadius: BorderRadius.circular(AppRadius.full),
            ),
          ),
          const SizedBox(width: AppSpacing.md),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  allocation.resourceName,
                  style: AppTypography.bodyMedium.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
                Text(
                  'To: ${allocation.allocatedToName}',
                  style: AppTypography.bodySmall.copyWith(
                    color: AppColors.textMedium,
                  ),
                ),
                Text(
                  '${allocation.quantity} ${allocation.unit} • ${_formatDate(allocation.allocationDate)}',
                  style: AppTypography.caption.copyWith(
                    color: AppColors.textMedium,
                  ),
                ),
              ],
            ),
          ),
          Column(
            children: [
              if (allocation.hasLocation)
                const Icon(Icons.location_on,
                    size: 16, color: Color(0xFF10B981)),
              if (allocation.photoUrl != null)
                const Icon(Icons.photo_camera,
                    size: 16, color: Color(0xFF6366F1)),
              if (!allocation.isSynced)
                const Icon(Icons.sync, size: 16, color: Color(0xFFF59E0B)),
            ],
          ),
        ],
      ),
    );
  }

  String _formatDate(DateTime date) {
    final now = DateTime.now();
    final diff = now.difference(date);

    if (diff.inHours < 1) return '${diff.inMinutes}m ago';
    if (diff.inHours < 24) return '${diff.inHours}h ago';
    if (diff.inDays < 7) return '${diff.inDays}d ago';
    return '${date.day}/${date.month}/${date.year}';
  }
}

// Distribution Workflow (Simplified for MVP)
class _DistributionWorkflow extends StatelessWidget {
  const _DistributionWorkflow();

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: AppColors.surfaceWhite,
        borderRadius: BorderRadius.vertical(top: Radius.circular(AppRadius.xl)),
      ),
      padding: const EdgeInsets.all(AppSpacing.xl),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            'Distribute Resource',
            style: AppTypography.h3.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: AppSpacing.lg),
          const Text('Full distribution workflow coming soon!'),
          const SizedBox(height: AppSpacing.lg),
          ElevatedButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Close'),
          ),
        ],
      ),
    );
  }
}
