import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../services/api_service.dart';
import '../../theme/design_system.dart';
import '../../widgets/common/aaywa_button.dart';
import '../../widgets/common/aaywa_card.dart';
import '../../widgets/kpi_metric_card.dart';

class FarmerProfileScreen extends StatefulWidget {
  const FarmerProfileScreen({super.key});

  @override
  State<FarmerProfileScreen> createState() => _FarmerProfileScreenState();
}

class _FarmerProfileScreenState extends State<FarmerProfileScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  bool _isLoading = true;
  Map<String, dynamic> _profileData = {};
  List<Map<String, dynamic>> _inputInvoices = [];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    _loadProfileData();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _loadProfileData() async {
    setState(() => _isLoading = true);

    try {
      final apiService = ApiService();
      final auth = Provider.of<AuthProvider>(context, listen: false);
      // Use farmer_id if available, otherwise fall back to id but check role
      final farmerId = auth.user?['farmer_id'] ?? auth.user?['id'];

      // If no valid farmer context (e.g. admin without farmer profile), show empty or mock
      if (farmerId == null) {
        setState(() {
          _isLoading = false;
          // Set dummy data for preview/admin
          _profileData = {
            'name': auth.user?['name'],
            'role': auth.user?['role'],
            'vsla_balance': 0,
            'input_debt': 0,
            'total_sales': 0,
          };
        });
        return;
      }

      final response = await apiService.get('/farmers/$farmerId/profile');

      setState(() {
        _profileData = response;
        _inputInvoices = List<Map<String, dynamic>>.from(
          response['input_invoices'] ?? [],
        );
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);

    return Scaffold(
      backgroundColor: AppColors.backgroundGray,
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : CustomScrollView(
              slivers: [
                // Profile Header
                SliverAppBar(
                  expandedHeight: 240,
                  pinned: true,
                  backgroundColor: AppColors.primaryGreen,
                  flexibleSpace: FlexibleSpaceBar(
                    background: Container(
                      decoration: const BoxDecoration(
                        gradient: LinearGradient(
                          begin: Alignment.topCenter,
                          end: Alignment.bottomCenter,
                          colors: [
                            AppColors.primaryGreen,
                            AppColors.secondaryGreen,
                          ],
                        ),
                      ),
                      child: SafeArea(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const SizedBox(height: AppSpacing.xxl),
                            // Avatar
                            CircleAvatar(
                              radius: 50,
                              backgroundColor: Colors.white,
                              child: Text(
                                (auth.user?['name'] ?? 'F')[0].toUpperCase(),
                                style: AppTypography.h1.copyWith(
                                  color: AppColors.primaryGreen,
                                ),
                              ),
                            ),
                            const SizedBox(height: AppSpacing.md),
                            // Name
                            Text(
                              auth.user?['name'] ?? 'Farmer',
                              style: AppTypography.h3.copyWith(
                                color: Colors.white,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const SizedBox(height: AppSpacing.xs),
                            // Cohort & Phone
                            Text(
                              'Cohort ${auth.user?['cohort'] ?? 'N/A'} • ${auth.user?['phone'] ?? ''}',
                              style: AppTypography.bodyMedium.copyWith(
                                color: Colors.white.withOpacity(0.9),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ),

                // Tab Bar
                SliverPersistentHeader(
                  pinned: true,
                  delegate: _SliverTabBarDelegate(
                    TabBar(
                      controller: _tabController,
                      labelColor: AppColors.primaryGreen,
                      unselectedLabelColor: AppColors.textMedium,
                      indicatorColor: AppColors.primaryGreen,
                      tabs: const [
                        Tab(text: 'Overview'),
                        Tab(text: 'Input Debt'),
                        Tab(text: 'Farm Info'),
                      ],
                    ),
                  ),
                ),

                // Tab Views
                SliverFillRemaining(
                  child: TabBarView(
                    controller: _tabController,
                    children: [
                      _buildOverviewTab(),
                      _buildInputDebtTab(),
                      _buildFarmInfoTab(),
                    ],
                  ),
                ),
              ],
            ),
    );
  }

  Widget _buildOverviewTab() {
    return ListView(
      padding: const EdgeInsets.all(AppSpacing.md),
      children: [
        // Financial Summary
        Text(
          'FINANCIAL SUMMARY',
          style: AppTypography.overline.copyWith(
            color: AppColors.textMedium,
          ),
        ),
        const SizedBox(height: AppSpacing.sm),

        GridView.count(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          crossAxisCount: 2,
          mainAxisSpacing: AppSpacing.md,
          crossAxisSpacing: AppSpacing.md,
          childAspectRatio: 1.2,
          children: [
            CompactKPICard(
              label: 'VSLA Balance',
              value:
                  '${(_profileData['vsla_balance'] ?? 68500).toStringAsFixed(0)} RWF',
              icon: Icons.account_balance_wallet,
              color: AppColors.primaryGreen,
            ),
            CompactKPICard(
              label: 'Input Debt',
              value:
                  '${(_profileData['input_debt'] ?? 20000).toStringAsFixed(0)} RWF',
              icon: Icons.receipt_long,
              color: AppColors.warning,
            ),
            CompactKPICard(
              label: 'Total Sales',
              value:
                  '${(_profileData['total_sales'] ?? 145000).toStringAsFixed(0)} RWF',
              icon: Icons.trending_up,
              color: AppColors.success,
            ),
            CompactKPICard(
              label: 'Trust Score',
              value: '${_profileData['trust_score'] ?? 82}/100',
              icon: Icons.stars,
              color: AppColors.indigo,
            ),
          ],
        ),

        const SizedBox(height: AppSpacing.xl),

        // Recent Activity
        Text(
          'RECENT ACTIVITY',
          style: AppTypography.overline.copyWith(
            color: AppColors.textMedium,
          ),
        ),
        const SizedBox(height: AppSpacing.sm),

        AaywaCard(
          child: Column(
            children: [
              _buildActivityItem(
                'Last Payment',
                '5,000 RWF to Input Supplier',
                '3 days ago',
                Icons.payment,
                AppColors.success,
              ),
              const Divider(),
              _buildActivityItem(
                'Last Sale',
                '40,000 RWF Avocado',
                '1 week ago',
                Icons.shopping_bag,
                AppColors.primaryGreen,
              ),
              const Divider(),
              _buildActivityItem(
                'Last Contribution',
                '2,500 RWF to VSLA',
                '2 weeks ago',
                Icons.account_balance_wallet,
                AppColors.blue,
              ),
            ],
          ),
        ),

        const SizedBox(height: AppSpacing.xxl),
      ],
    );
  }

  Widget _buildInputDebtTab() {
    final totalDebt = _inputInvoices.fold<double>(
      0,
      (sum, invoice) => sum + (invoice['remaining_balance'] ?? 0),
    );

    return ListView(
      padding: const EdgeInsets.all(AppSpacing.md),
      children: [
        // Total Debt Card
        AaywaCard(
          hasAccentTop: true,
          accentColor: AppColors.warning,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'TOTAL OUTSTANDING DEBT',
                style: AppTypography.overline.copyWith(
                  color: AppColors.textMedium,
                ),
              ),
              const SizedBox(height: AppSpacing.sm),
              Text(
                '${totalDebt.toStringAsFixed(0)} RWF',
                style: AppTypography.h1.copyWith(
                  color: AppColors.warning,
                ),
              ),
              const SizedBox(height: AppSpacing.md),
              Row(
                children: [
                  Icon(
                    Icons.info_outline,
                    size: 16,
                    color: AppColors.textMedium,
                  ),
                  const SizedBox(width: AppSpacing.xs),
                  Expanded(
                    child: Text(
                      'Automatically deducted from sales revenue',
                      style: AppTypography.bodySmall.copyWith(
                        color: AppColors.textMedium,
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),

        const SizedBox(height: AppSpacing.xl),

        // Invoice List
        Text(
          'INPUT INVOICES',
          style: AppTypography.overline.copyWith(
            color: AppColors.textMedium,
          ),
        ),
        const SizedBox(height: AppSpacing.sm),

        if (_inputInvoices.isEmpty)
          Center(
            child: Padding(
              padding: const EdgeInsets.all(AppSpacing.xxl),
              child: Column(
                children: [
                  Icon(
                    Icons.receipt_long_outlined,
                    size: 64,
                    color: AppColors.textLight.withOpacity(0.5),
                  ),
                  const SizedBox(height: AppSpacing.md),
                  Text(
                    'No input invoices',
                    style: AppTypography.bodyMedium.copyWith(
                      color: AppColors.textMedium,
                    ),
                  ),
                ],
              ),
            ),
          )
        else
          ...List.generate(_inputInvoices.length, (index) {
            final invoice = _inputInvoices[index];
            return _buildInvoiceCard(invoice);
          }),

        const SizedBox(height: AppSpacing.md),

        // Add Invoice Button
        AaywaButton(
          label: 'Record New Input Purchase',
          icon: Icons.add_circle_outline,
          type: ButtonType.secondary,
          onPressed: () {
            // TODO: Navigate to input invoice entry
          },
          fullWidth: true,
        ),

        const SizedBox(height: AppSpacing.xxl),
      ],
    );
  }

  Widget _buildFarmInfoTab() {
    return ListView(
      padding: const EdgeInsets.all(AppSpacing.md),
      children: [
        AaywaCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'FARM DETAILS',
                style: AppTypography.overline.copyWith(
                  color: AppColors.textMedium,
                ),
              ),
              const SizedBox(height: AppSpacing.md),
              _buildInfoRow(
                  'Farm Size', '${_profileData['farm_size'] ?? 2.5} hectares'),
              const Divider(),
              _buildInfoRow(
                  'Primary Crop', _profileData['primary_crop'] ?? 'Avocado'),
              const Divider(),
              _buildInfoRow('Secondary Crops',
                  _profileData['secondary_crops'] ?? 'Maize, Beans'),
              const Divider(),
              _buildInfoRow(
                  'Location', _profileData['location'] ?? 'Rulindo District'),
              const Divider(),
              _buildInfoRow('Years Farming',
                  '${_profileData['years_farming'] ?? 8} years'),
            ],
          ),
        ),
        const SizedBox(height: AppSpacing.lg),
        AaywaCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'TRAINING COMPLETED',
                style: AppTypography.overline.copyWith(
                  color: AppColors.textMedium,
                ),
              ),
              const SizedBox(height: AppSpacing.md),
              _buildTrainingItem('Avocado Pruning Techniques', 'Completed'),
              _buildTrainingItem('Organic Fertilizer Production', 'Completed'),
              _buildTrainingItem('Pest Management', 'In Progress'),
              const SizedBox(height: AppSpacing.sm),
              AaywaButton(
                label: 'View All Trainings',
                type: ButtonType.text,
                onPressed: () {},
              ),
            ],
          ),
        ),
        const SizedBox(height: AppSpacing.xxl),
      ],
    );
  }

  Widget _buildActivityItem(
    String title,
    String subtitle,
    String time,
    IconData icon,
    Color color,
  ) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: AppSpacing.sm),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(AppSpacing.sm),
            decoration: BoxDecoration(
              color: color.withOpacity(0.1),
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
                  title,
                  style: AppTypography.bodyMedium.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: AppSpacing.xs),
                Text(
                  subtitle,
                  style: AppTypography.bodySmall.copyWith(
                    color: AppColors.textMedium,
                  ),
                ),
              ],
            ),
          ),
          Text(
            time,
            style: AppTypography.caption.copyWith(
              color: AppColors.textLight,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInvoiceCard(Map<String, dynamic> invoice) {
    final supplier = invoice['supplier'] ?? 'Input Supplier';
    final amount = invoice['total_amount'] ?? 0.0;
    final remaining = invoice['remaining_balance'] ?? 0.0;
    final date = invoice['date'] ?? 'Recently';
    final paid = amount - remaining;
    final progress = amount > 0 ? paid / amount : 0.0;

    return AaywaCard(
      padding: const EdgeInsets.all(AppSpacing.md),
      elevated: true,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      supplier,
                      style: AppTypography.labelLarge.copyWith(
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
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: AppSpacing.sm,
                  vertical: AppSpacing.xs,
                ),
                decoration: BoxDecoration(
                  color: remaining > 0
                      ? AppColors.warning.withOpacity(0.1)
                      : AppColors.success.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(AppRadius.full),
                ),
                child: Text(
                  remaining > 0 ? 'Pending' : 'Paid',
                  style: AppTypography.labelSmall.copyWith(
                    color:
                        remaining > 0 ? AppColors.warning : AppColors.success,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.md),
          // Amounts
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Total',
                    style: AppTypography.caption.copyWith(
                      color: AppColors.textMedium,
                    ),
                  ),
                  Text(
                    '${amount.toStringAsFixed(0)} RWF',
                    style: AppTypography.labelLarge,
                  ),
                ],
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Paid',
                    style: AppTypography.caption.copyWith(
                      color: AppColors.textMedium,
                    ),
                  ),
                  Text(
                    '${paid.toStringAsFixed(0)} RWF',
                    style: AppTypography.labelLarge.copyWith(
                      color: AppColors.success,
                    ),
                  ),
                ],
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Remaining',
                    style: AppTypography.caption.copyWith(
                      color: AppColors.textMedium,
                    ),
                  ),
                  Text(
                    '${remaining.toStringAsFixed(0)} RWF',
                    style: AppTypography.labelLarge.copyWith(
                      color: AppColors.warning,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.sm),
          // Progress bar
          ClipRRect(
            borderRadius: BorderRadius.circular(AppRadius.full),
            child: LinearProgressIndicator(
              value: progress,
              minHeight: 6,
              backgroundColor: AppColors.divider,
              valueColor: AlwaysStoppedAnimation<Color>(AppColors.success),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: AppSpacing.sm),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: AppTypography.bodyMedium.copyWith(
              color: AppColors.textMedium,
            ),
          ),
          Text(
            value,
            style: AppTypography.bodyMedium.copyWith(
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTrainingItem(String title, String status) {
    final isCompleted = status == 'Completed';
    return Padding(
      padding: const EdgeInsets.only(bottom: AppSpacing.sm),
      child: Row(
        children: [
          Icon(
            isCompleted ? Icons.check_circle : Icons.schedule,
            size: 20,
            color: isCompleted ? AppColors.success : AppColors.warning,
          ),
          const SizedBox(width: AppSpacing.sm),
          Expanded(
            child: Text(
              title,
              style: AppTypography.bodyMedium,
            ),
          ),
          Text(
            status,
            style: AppTypography.labelSmall.copyWith(
              color: isCompleted ? AppColors.success : AppColors.warning,
            ),
          ),
        ],
      ),
    );
  }
}

// Custom SliverTabBarDelegate
class _SliverTabBarDelegate extends SliverPersistentHeaderDelegate {
  final TabBar _tabBar;

  _SliverTabBarDelegate(this._tabBar);

  @override
  double get minExtent => _tabBar.preferredSize.height;

  @override
  double get maxExtent => _tabBar.preferredSize.height;

  @override
  Widget build(
    BuildContext context,
    double shrinkOffset,
    bool overlapsContent,
  ) {
    return Container(
      color: AppColors.surfaceWhite,
      child: _tabBar,
    );
  }

  @override
  bool shouldRebuild(_SliverTabBarDelegate oldDelegate) => false;
}
