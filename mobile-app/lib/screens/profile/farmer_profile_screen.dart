import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart' as ll;
import 'dart:convert';
import '../../providers/auth_provider.dart';
import '../../services/api_service.dart';
import '../../services/database_service.dart';
import '../../theme/design_system.dart';
import '../../config/env.dart';
import 'package:aaywa_mobile/screens/mapping/farm_map_screen.dart';
import '../../widgets/common/mini_map_preview.dart';

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
  List<Polygon> _polygons = [];
  ll.LatLng _mapCenter = const ll.LatLng(-1.9441, 30.0619); // Rwanda center

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    _loadProfileData();
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    // Reload profile data when screen becomes visible again
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

      dynamic response;
      // Define idToFetch in outer scope so it can be used for boundary loading
      String? idToFetch;

      if (auth.userRole == UserRole.farmer ||
          auth.userRole == UserRole.champion) {
        // Use the dedicated /me endpoint for farmers/champions which is authorized
        response = await apiService.get('/farmers/me');
        // For farmers, the ID is in the response or we use the auth user's farmer_id
        idToFetch =
            response['id']?.toString() ?? auth.user?['farmer_id']?.toString();
      } else {
        // Determine the correct ID to fetch for others (or fallbacks)
        idToFetch =
            auth.user?['farmer_id']?.toString() ?? auth.user?['id']?.toString();

        if (idToFetch == null) {
          setState(() => _isLoading = false);
          return;
        }

        // Fetch comprehensive profile from backend
        response = await apiService.get('/farmers/$idToFetch/profile');
      }

      setState(() {
        _profileData = response;
        _inputInvoices = List<Map<String, dynamic>>.from(
          response['input_invoices'] ?? [],
        );
        
        // Parse location coordinates from API
        final coords = response['location_coordinates'];
        bool hasLocation = false;
        
        debugPrint('[PROFILE] Raw location_coordinates: $coords');
        
        if (coords != null) {
          try {
            // Handle both string and map formats
            Map<String, dynamic> coordsMap;
            if (coords is String) {
              debugPrint('[PROFILE] Parsing string coordinates');
              coordsMap = json.decode(coords);
            } else if (coords is Map) {
              debugPrint('[PROFILE] Using map coordinates');
              coordsMap = Map<String, dynamic>.from(coords);
            } else {
              debugPrint('[PROFILE] Unknown coordinate format: ${coords.runtimeType}');
              coordsMap = {};
            }
            
            debugPrint('[PROFILE] Parsed coordsMap: $coordsMap');
            
            if (coordsMap['lat'] != null && coordsMap['lng'] != null) {
              final lat = double.tryParse(coordsMap['lat'].toString());
              final lng = double.tryParse(coordsMap['lng'].toString());
              
              if (lat != null && lng != null) {
                _mapCenter = ll.LatLng(lat, lng);
                hasLocation = true;
                debugPrint('[PROFILE] ✓ Location set: $lat, $lng');
              } else {
                debugPrint('[PROFILE] ✗ Failed to parse lat/lng to double');
              }
            } else {
              debugPrint('[PROFILE] ✗ Missing lat or lng in coordsMap');
            }
          } catch (e) {
            debugPrint('[PROFILE] ✗ Error parsing coordinates: $e');
          }
        } else {
          debugPrint('[PROFILE] ✗ No location_coordinates in response');
        }
        
        debugPrint('[PROFILE] Final map center: ${_mapCenter.latitude}, ${_mapCenter.longitude}');
        _isLoading = false;
      });

      // Load local boundary from Drift in a separate try-catch to be robust
      try {
        if (!mounted) return;
        final db = Provider.of<DatabaseService>(context, listen: false);
        final localBoundary =
            await db.getPlotBoundariesByFarmer(idToFetch.toString());

        if (localBoundary.isNotEmpty) {
          final points = localBoundary
              .map((p) => ll.LatLng(
                  p.read<double>('latitude'), p.read<double>('longitude')))
              .toList();
          setState(() {
            _polygons = [
              Polygon(
                points: points,
                color: AppColors.primaryGreen.withValues(alpha: 0.15),
                borderColor: AppColors.primaryGreen,
                borderStrokeWidth: 3,
                isFilled: true,
              )
            ];
            // Calculate center for map if points exist
            double sumLat = 0;
            double sumLng = 0;
            for (var p in points) {
              sumLat += p.latitude;
              sumLng += p.longitude;
            }
            _mapCenter =
                ll.LatLng(sumLat / points.length, sumLng / points.length);
          });
        }
      } catch (dbError) {
        // Log DB/WASM error but don't crash the profile
        debugPrint(
            '[PROFILE] Database error (expected if WASM missing): $dbError');
      }
    } catch (e) {
      debugPrint('[PROFILE] Global loading error: $e');
      if (mounted) {
        setState(() => _isLoading = false);
      }
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
              physics: const BouncingScrollPhysics(),
              slivers: [
                // Premium Profile Header with Glassmorphism feel
                SliverAppBar(
                  expandedHeight: 300,
                  pinned: true,
                  stretch: true,
                  backgroundColor: AppColors.primaryGreen,
                  flexibleSpace: FlexibleSpaceBar(
                    stretchModes: const [
                      StretchMode.zoomBackground,
                      StretchMode.blurBackground
                    ],
                    background: Stack(
                      fit: StackFit.expand,
                      children: [
                        // Background Gradient with richer colors
                        Container(
                          decoration: const BoxDecoration(
                            gradient: LinearGradient(
                              begin: Alignment.topLeft,
                              end: Alignment.bottomRight,
                              colors: [
                                Color(0xFF1B5E20), // Darker Green
                                AppColors.primaryGreen,
                                Color(0xFF43A047), // Lighter Green
                              ],
                            ),
                          ),
                        ),
                        // Soft Glow Effect
                        Positioned(
                          top: -50,
                          right: -50,
                          child: Container(
                            width: 200,
                            height: 200,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              color: Colors.white.withValues(alpha: 0.1),
                            ),
                          ),
                        ),
                        // Profile Content
                        SafeArea(
                          child: Center(
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                const SizedBox(height: AppSpacing.md),
                                // Hero Avatar with Glow and Border
                                _buildProfilePhoto(),
                                const SizedBox(height: AppSpacing.lg),
                                // Name & Verified Badge
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    Text(
                                      auth.user?['full_name'] ??
                                          auth.user?['name'] ??
                                          'Farmer',
                                      style: AppTypography.h2.copyWith(
                                        color: Colors.white,
                                        letterSpacing: -0.5,
                                      ),
                                    ),
                                    const SizedBox(width: AppSpacing.xs),
                                    const Icon(Icons.verified,
                                        color: AppColors.accentGreen, size: 24),
                                  ],
                                ),
                                const SizedBox(height: AppSpacing.xs),
                                // Role & Location Tag
                                Container(
                                  padding: const EdgeInsets.symmetric(
                                      horizontal: 12, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: Colors.black.withValues(alpha: 0.2),
                                    borderRadius: BorderRadius.circular(20),
                                  ),
                                  child: Text(
                                    '${auth.user?['role']?.toString().toUpperCase() ?? 'FARMER'} • ${_profileData['location_name'] ?? 'Kigali, Rwanda'}',
                                    style: AppTypography.overline.copyWith(
                                      color:
                                          Colors.white.withValues(alpha: 0.9),
                                      fontWeight: FontWeight.w700,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),

                // Premium Tab Bar with custom look
                SliverPersistentHeader(
                  pinned: true,
                  delegate: _SliverTabBarDelegate(
                    TabBar(
                      controller: _tabController,
                      labelColor: AppColors.primaryGreen,
                      unselectedLabelColor: AppColors.textMedium,
                      indicatorColor: AppColors.primaryGreen,
                      indicatorWeight: 4,
                      indicatorSize: TabBarIndicatorSize.label,
                      labelStyle: AppTypography.labelLarge
                          .copyWith(fontWeight: FontWeight.bold),
                      unselectedLabelStyle: AppTypography.labelMedium,
                      tabs: const [
                        Tab(text: 'Overview'),
                        Tab(text: 'Finances'),
                        Tab(text: 'Farm Map'),
                      ],
                    ),
                  ),
                ),

                // Content Tabs
                SliverFillRemaining(
                  child: TabBarView(
                    controller: _tabController,
                    children: [
                      _buildOverviewTab(),
                      _buildFinancesTab(), // Renamed for clarity
                      _buildFarmMapTab(), // Renamed for clarity
                    ],
                  ),
                ),
              ],
            ),
    );
  }

  // --- REFINED HEADER WIDGETS ---

  Widget _buildProfilePhoto() {
    final photoUrl = _profileData['photo_url'] ?? _profileData['profile_url'];
    
    // Build full URL if it's a relative path
    String? fullPhotoUrl;
    if (photoUrl != null && photoUrl.toString().isNotEmpty) {
      final photoStr = photoUrl.toString();
      if (photoStr.startsWith('http://') || photoStr.startsWith('https://')) {
        fullPhotoUrl = photoStr;
      } else {
        // Remove /api from base URL and ensure proper path
        final baseUrl = Environment.apiBaseUrl.replaceAll('/api', '');
        // Remove leading slash from photoUrl if present
        final cleanPath = photoStr.startsWith('/') ? photoStr.substring(1) : photoStr;
        fullPhotoUrl = '$baseUrl/$cleanPath';
      }
      debugPrint('[PROFILE] Photo URL: $fullPhotoUrl');
    }

    return Hero(
      tag: 'profile_avatar',
      child: Container(
        padding: const EdgeInsets.all(4),
        decoration: BoxDecoration(
          color: Colors.white.withValues(alpha: 0.2),
          shape: BoxShape.circle,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.2),
              blurRadius: 20,
              spreadRadius: 5,
            )
          ],
        ),
        child: CircleAvatar(
          radius: 55,
          backgroundColor: Colors.white,
          child: CircleAvatar(
            radius: 52,
            backgroundImage: fullPhotoUrl != null
                ? NetworkImage(fullPhotoUrl)
                : null,
            backgroundColor: AppColors.accentGreen,
            onBackgroundImageError: fullPhotoUrl != null
                ? (exception, stackTrace) {
                    debugPrint('[PROFILE] Image load error: $exception');
                  }
                : null,
            child: fullPhotoUrl == null
                ? Text(
                    (_profileData['full_name'] ?? 'U')[0].toUpperCase(),
                    style: AppTypography.h1.copyWith(
                      color: AppColors.primaryGreen,
                      fontSize: 44,
                      fontWeight: FontWeight.bold,
                    ),
                  )
                : null,
          ),
        ),
      ),
    );
  }

  Widget _buildOverviewTab() {
    return ListView(
      physics: const BouncingScrollPhysics(),
      padding: const EdgeInsets.all(AppSpacing.md),
      children: [
        // Trust Score & Performance Cards
        Row(
          children: [
            Expanded(
              child: Container(
                padding: const EdgeInsets.all(AppSpacing.md),
                decoration: BoxDecoration(
                  color: AppColors.surfaceWhite,
                  borderRadius: BorderRadius.circular(AppRadius.lg),
                  boxShadow: const [AppShadows.sm],
                ),
                child: Column(
                  children: [
                    const Icon(Icons.stars, color: Colors.orange, size: 32),
                    const SizedBox(height: 8),
                    Text('${(_profileData['trust_score'] ?? 0)}',
                        style: AppTypography.h2
                            .copyWith(color: AppColors.textDark)),
                    const Text('Trust Score', style: AppTypography.caption),
                  ],
                ),
              ),
            ),
            const SizedBox(width: AppSpacing.md),
            Expanded(
              child: Container(
                padding: const EdgeInsets.all(AppSpacing.md),
                decoration: BoxDecoration(
                  color: AppColors.surfaceWhite,
                  borderRadius: BorderRadius.circular(AppRadius.lg),
                  boxShadow: const [AppShadows.sm],
                ),
                child: Column(
                  children: [
                    const Icon(Icons.workspace_premium,
                        color: AppColors.blue, size: 32),
                    const SizedBox(height: 8),
                    Text('${_profileData['completed_trainings']?.length ?? 0}',
                        style: AppTypography.h2
                            .copyWith(color: AppColors.textDark)),
                    const Text('Courses Done', style: AppTypography.caption),
                  ],
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: AppSpacing.lg),

        // Farmer Details Card (PARITY WITH WEB)
        _buildSectionTitle('FARMER DETAILS'),
        const SizedBox(height: AppSpacing.sm),
        Container(
          padding: const EdgeInsets.all(AppSpacing.md),
          decoration: BoxDecoration(
            color: AppColors.surfaceWhite,
            borderRadius: BorderRadius.circular(AppRadius.lg),
            boxShadow: const [AppShadows.sm],
          ),
          child: Column(
            children: [
              _buildModernInfoRow(
                  'Cohort',
                  _profileData['cohort_name'] ?? 'Unassigned',
                  Icons.group_work),
              _buildModernInfoRow(
                  'Household',
                  (_profileData['household_type'] ?? 'Not Set')
                      .toString()
                      .replaceAll('_', ' ')
                      .toUpperCase(),
                  Icons.home),
              _buildModernInfoRow(
                  'Crops', _profileData['crops'] ?? 'Not Set', Icons.eco),
              _buildModernInfoRow('Phone',
                  _profileData['phone'] ?? 'Update Phone', Icons.phone),
            ],
          ),
        ),

        const SizedBox(height: AppSpacing.lg),

        // Quick Actions with modern icons
        _buildSectionTitle('QUICK ACTIONS'),
        const SizedBox(height: AppSpacing.sm),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            _buildActionCircle('Add Sale', Icons.eco, AppColors.primaryGreen),
            _buildActionCircle(
                'Payment', Icons.account_balance, AppColors.indigo),
            _buildActionCircle('Weather', Icons.cloudy_snowing, AppColors.blue),
            _buildActionCircle('Support', Icons.headset_mic, AppColors.orange),
          ],
        ),

        const SizedBox(height: AppSpacing.lg),

        // Recent Activity Feed
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            _buildSectionTitle('RECENT ACTIVITY'),
            Text('See All',
                style: AppTypography.labelSmall
                    .copyWith(color: AppColors.primaryGreen)),
          ],
        ),
        const SizedBox(height: AppSpacing.sm),
        Container(
          decoration: BoxDecoration(
            color: AppColors.surfaceWhite,
            borderRadius: BorderRadius.circular(AppRadius.lg),
            boxShadow: const [AppShadows.sm],
          ),
          child: Column(
            children: _profileData['recent_activities'] == null ||
                    (_profileData['recent_activities'] as List).isEmpty
                ? [
                    const Padding(
                      padding: EdgeInsets.all(32),
                      child: Text('No recent activity recorded.',
                          style: AppTypography.bodySmall),
                    )
                  ]
                : (_profileData['recent_activities'] as List)
                    .take(3)
                    .map((activity) {
                    return _buildActivityTile(activity);
                  }).toList(),
          ),
        ),
        const SizedBox(height: 24),
      ],
    );
  }

  Widget _buildSectionTitle(String title) {
    return Text(title,
        style: AppTypography.overline.copyWith(
          color: AppColors.textMedium,
          fontWeight: FontWeight.bold,
          letterSpacing: 1.2,
        ));
  }

  Widget _buildFinancesTab() {
    return _buildInputDebtTab();
  }

  // _buildFarmMapTab is implemented below at line 669

  Widget _buildActionCircle(String label, IconData icon, Color color) {
    return Column(
      children: [
        Container(
          width: 60,
          height: 60,
          decoration: BoxDecoration(
            color: color.withValues(alpha: 0.1),
            shape: BoxShape.circle,
          ),
          child: Icon(icon, color: color, size: 28),
        ),
        const SizedBox(height: 8),
        Text(label, style: AppTypography.labelSmall),
      ],
    );
  }

  Widget _buildActivityTile(Map<String, dynamic> activity) {
    final type = activity['type']?.toString().toLowerCase() ?? 'info';
    IconData icon = Icons.info_outline;
    Color color = AppColors.textMedium;

    if (type == 'sale') {
      icon = Icons.shopping_cart_checkout;
      color = AppColors.success;
    } else if (type == 'invoice') {
      icon = Icons.receipt_long;
      color = AppColors.warning;
    } else if (type == 'training') {
      icon = Icons.school;
      color = AppColors.blue;
    }

    return ListTile(
      leading: Container(
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.1),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Icon(icon, color: color, size: 20),
      ),
      title: Text(activity['description'] ?? 'Activity Update',
          style: AppTypography.labelMedium),
      subtitle: Text(
        activity['date'] != null ? _formatDate(activity['date']) : 'Just now',
        style: AppTypography.caption,
      ),
      trailing: activity['amount'] != null && activity['amount'] > 0
          ? Text('${activity['amount'].toStringAsFixed(0)} RWF',
              style: AppTypography.labelMedium
                  .copyWith(fontWeight: FontWeight.bold))
          : const Icon(Icons.chevron_right, size: 16),
    );
  }

  String _formatDate(dynamic dateStr) {
    try {
      final date = DateTime.parse(dateStr);
      return '${date.day}/${date.month}/${date.year}';
    } catch (e) {
      return 'Recent';
    }
  }

  Widget _buildInputDebtTab() {
    final totalDebt = _inputInvoices.fold<double>(
      0,
      (sum, invoice) => sum + (invoice['remaining_balance'] ?? 0),
    );

    return ListView(
      padding: const EdgeInsets.all(AppSpacing.md),
      children: [
        // Total Debt Card with Gradient
        Container(
          padding: const EdgeInsets.all(AppSpacing.xl),
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [Color(0xFFE57373), Color(0xFFC62828)],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            borderRadius: BorderRadius.circular(AppRadius.lg),
            boxShadow: const [AppShadows.md],
          ),
          child: Column(
            children: [
              Text('OUTSTANDING INPUT DEBT',
                  style:
                      AppTypography.overline.copyWith(color: Colors.white70)),
              const SizedBox(height: 8),
              Text(
                '${totalDebt.toStringAsFixed(0)} RWF',
                style: AppTypography.h1
                    .copyWith(color: Colors.white, fontSize: 36),
              ),
              const SizedBox(height: 16),
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.2),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: const Text('PAYMENT DUE: MARCH 15',
                    style: AppTypography.labelSmall),
              ),
            ],
          ),
        ),
        const SizedBox(height: AppSpacing.lg),

        // Financial Stats Grid
        GridView.count(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          crossAxisCount: 2,
          mainAxisSpacing: AppSpacing.md,
          crossAxisSpacing: AppSpacing.md,
          childAspectRatio: 2.5,
          children: [
            _buildSmallStatCard(
                'Total Sales',
                '${(_profileData['total_sales'] ?? 0).toStringAsFixed(0)} RWF',
                AppColors.success),
            _buildSmallStatCard(
                'VSLA Saved',
                '${(_profileData['vsla_balance'] ?? 0).toStringAsFixed(0)} RWF',
                AppColors.blue),
          ],
        ),
        const SizedBox(height: AppSpacing.lg),

        Text('INVOICE HISTORY',
            style:
                AppTypography.overline.copyWith(color: AppColors.textMedium)),
        const SizedBox(height: AppSpacing.sm),
        if (_inputInvoices.isEmpty)
          const Center(
              child: Padding(
                  padding: EdgeInsets.all(40),
                  child: Text('No active invoices recorded.')))
        else
          ..._inputInvoices.map((inv) => _buildModernInvoiceCard(inv)),
      ],
    );
  }

  Widget _buildSmallStatCard(String label, String value, Color color) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.surfaceWhite,
        borderRadius: BorderRadius.circular(AppRadius.md),
        boxShadow: const [AppShadows.sm],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(label, style: AppTypography.caption),
          Text(value,
              style: AppTypography.labelLarge
                  .copyWith(color: color, fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }

  Widget _buildModernInvoiceCard(Map<String, dynamic> invoice) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: AppColors.surfaceWhite,
        borderRadius: BorderRadius.circular(AppRadius.md),
        border: Border.all(color: AppColors.border),
      ),
      child: ListTile(
        title: Text(invoice['supplier'] ?? 'Input Hub',
            style: AppTypography.labelLarge),
        subtitle: Text(invoice['date'] ?? 'Invoice Date',
            style: AppTypography.caption),
        trailing: Text(
            '${(invoice['remaining_balance'] ?? 0).toStringAsFixed(0)} RWF',
            style: AppTypography.labelLarge
                .copyWith(color: AppColors.error, fontWeight: FontWeight.bold)),
      ),
    );
  }

  Widget _buildFarmMapTab() {
    return ListView(
      physics: const BouncingScrollPhysics(),
      padding: const EdgeInsets.all(AppSpacing.md),
      children: [
        // Farm Map with Glass Action Overlay
        Text('FARM GLOBAL LOCATION',
            style:
                AppTypography.overline.copyWith(color: AppColors.textMedium)),
        const SizedBox(height: AppSpacing.sm),
        Stack(
          children: [
            SizedBox(
              height: 250,
              child: ClipRRect(
                borderRadius: BorderRadius.circular(AppRadius.lg),
                child: MiniMapPreview(
                  polygons: _polygons,
                  center: _mapCenter,
                  title: '',
                  subtitle: '',
                ),
              ),
            ),
            Positioned(
              bottom: 16,
              left: 16,
              right: 16,
              child: Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                decoration: BoxDecoration(
                  color: Colors.black.withValues(alpha: 0.7),
                  borderRadius: BorderRadius.circular(AppRadius.md),
                  border: Border.all(color: Colors.white24),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                              _mapCenter.latitude != -1.9441 || _mapCenter.longitude != 30.0619
                                  ? 'LOCATION SET'
                                  : 'NO LOCATION',
                              style: TextStyle(
                                  color: _mapCenter.latitude != -1.9441 || _mapCenter.longitude != 30.0619
                                      ? AppColors.accentGreen
                                      : Colors.orange,
                                  fontSize: 10,
                                  fontWeight: FontWeight.bold)),
                          Text(
                              _mapCenter.latitude != -1.9441 || _mapCenter.longitude != 30.0619
                                  ? 'Lat: ${_mapCenter.latitude.toStringAsFixed(4)}, Lng: ${_mapCenter.longitude.toStringAsFixed(4)}'
                                  : 'Size: ${_profileData['plot_size_hectares'] ?? '0.0'} Hectares',
                              style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 13,
                                  fontWeight: FontWeight.w500)),
                        ],
                      ),
                    ),
                    ElevatedButton(
                      onPressed: () => _openMapScreen(),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primaryGreen,
                        foregroundColor: Colors.white,
                        elevation: 0,
                        shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(8)),
                      ),
                      child: Text(
                          _mapCenter.latitude != -1.9441 || _mapCenter.longitude != 30.0619
                              ? 'VIEW MAP'
                              : 'SET LOCATION'),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: AppSpacing.lg),

        // Agricultural Stats
        _buildSectionTitle('AGRICULTURAL DETAILS'),
        const SizedBox(height: AppSpacing.sm),
        Container(
          decoration: BoxDecoration(
            color: AppColors.surfaceWhite,
            borderRadius: BorderRadius.circular(AppRadius.lg),
            boxShadow: const [AppShadows.sm],
          ),
          child: Column(
            children: [
              _buildModernInfoRow('Soil Type',
                  _profileData['soil_type'] ?? 'Loamy Clay', Icons.layers),
              _buildModernInfoRow(
                  'Cropping System',
                  _profileData['cropping_system'] ?? 'Mono-cropping',
                  Icons.grid_view_rounded),
              _buildModernInfoRow('Terrain', 'Hillside Flat', Icons.landscape),
            ],
          ),
        ),
        const SizedBox(height: AppSpacing.xl),
      ],
    );
  }

  Widget _buildModernInfoRow(String label, String value, IconData icon) {
    return Padding(
      padding: const EdgeInsets.all(AppSpacing.md),
      child: Row(
        children: [
          Icon(icon, color: AppColors.primaryGreen, size: 20),
          const SizedBox(width: 16),
          Text(label,
              style: AppTypography.bodyMedium
                  .copyWith(color: AppColors.textMedium)),
          const Spacer(),
          Text(value,
              style: AppTypography.bodyMedium
                  .copyWith(fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }

  void _openMapScreen() async {
    final auth = Provider.of<AuthProvider>(context, listen: false);
    final farmerId = auth.user?['farmer_id'] ?? auth.user?['id'];
    
    // Check if location is set (not default Rwanda center)
    final hasLocation = _mapCenter.latitude != -1.9441 || _mapCenter.longitude != 30.0619;
    
    debugPrint('[PROFILE] Opening map - hasLocation: $hasLocation, center: ${_mapCenter.latitude}, ${_mapCenter.longitude}');
    debugPrint('[PROFILE] Polygons count: ${_polygons.length}');
    
    await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => FarmMapScreen(
          farmerId: farmerId?.toString(),
          farmerName: auth.user?['full_name'] ?? auth.user?['name'],
          viewOnly: hasLocation,
          initialCenter: hasLocation ? _mapCenter : null,
          initialPolygon: _polygons.isNotEmpty ? _polygons[0].points : null,
        ),
      ),
    );
    if (mounted) {
      _loadProfileData();
    }
  }
}

class _SliverTabBarDelegate extends SliverPersistentHeaderDelegate {
  final TabBar _tabBar;
  _SliverTabBarDelegate(this._tabBar);

  @override
  double get minExtent => _tabBar.preferredSize.height;
  @override
  double get maxExtent => _tabBar.preferredSize.height;

  @override
  Widget build(
      BuildContext context, double shrinkOffset, bool overlapsContent) {
    return Container(
      color: AppColors.surfaceWhite,
      child: _tabBar,
    );
  }

  @override
  bool shouldRebuild(_SliverTabBarDelegate oldDelegate) => false;
}
