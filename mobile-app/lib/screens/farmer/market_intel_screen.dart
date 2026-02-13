import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../services/trust_score_service.dart';
import '../../providers/auth_provider.dart';

class MarketIntelScreen extends StatefulWidget {
  const MarketIntelScreen({super.key});

  @override
  State<MarketIntelScreen> createState() => _MarketIntelScreenState();
}

class _MarketIntelScreenState extends State<MarketIntelScreen>
    with SingleTickerProviderStateMixin {
  final TrustScoreService _trustScoreService = TrustScoreService();
  MarketIntelData? _marketData;
  bool _isLoading = true;
  late AnimationController _animationController;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 800),
    );
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() => _isLoading = true);
    try {
      final authProvider = AuthProvider();
      await authProvider.checkAuthStatus();
      final token = authProvider.token;

      if (token != null) {
        final data = await _trustScoreService.fetchMarketIntel(token);
        setState(() {
          _marketData = data;
          _isLoading = false;
        });
        _animationController.forward();
      }
    } catch (e) {
      setState(() => _isLoading = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error loading market data: $e')),
        );
      }
    }
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              Color(0xFF059669), // Emerald
              Color(0xFF047857),
              Color(0xFF065F46),
            ],
          ),
        ),
        child: SafeArea(
          child: Column(
            children: [
              _buildHeader(),
              Expanded(
                child: _isLoading ? _buildLoadingState() : _buildContent(),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Padding(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              IconButton(
                icon: const Icon(Icons.arrow_back, color: Colors.white),
                onPressed: () => Navigator.pop(context),
              ),
              const Spacer(),
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.2),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.update_rounded,
                        color: Colors.white, size: 16),
                    const SizedBox(width: 8),
                    Text(
                      'UPDATED ${DateFormat('MMM dd').format(DateTime.now())}',
                      style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.w600,
                        fontSize: 11,
                        letterSpacing: 0.5,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),
          const Text(
            'Market\nIntelligence',
            style: TextStyle(
              fontSize: 40,
              fontWeight: FontWeight.bold,
              color: Colors.white,
              height: 1.1,
              letterSpacing: -1,
            ),
          ),
          const SizedBox(height: 12),
          if (_marketData != null)
            Row(
              children: [
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.2),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.eco_rounded,
                          color: Colors.white, size: 16),
                      const SizedBox(width: 6),
                      Text(
                        _marketData!.cropType.toUpperCase(),
                        style: const TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.w700,
                          fontSize: 13,
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

  Widget _buildLoadingState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(20),
            ),
            child: const CircularProgressIndicator(
              valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
              strokeWidth: 3,
            ),
          ),
          const SizedBox(height: 20),
          Text(
            'Loading market prices...',
            style: TextStyle(
              color: Colors.white.withValues(alpha: 0.9),
              fontSize: 16,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildContent() {
    if (_marketData == null || _marketData!.currentPrices.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.trending_up_rounded,
                color: Colors.white.withValues(alpha: 0.5), size: 64),
            const SizedBox(height: 16),
            Text(
              'No market data available',
              style: TextStyle(
                  color: Colors.white.withValues(alpha: 0.7), fontSize: 16),
            ),
          ],
        ),
      );
    }

    // Group prices by market location
    final pricesByMarket = <String, List<MarketPrice>>{};
    for (var price in _marketData!.currentPrices) {
      final market = price.marketLocation ?? 'Unknown Market';
      pricesByMarket.putIfAbsent(market, () => []).add(price);
    }

    return SingleChildScrollView(
      physics: const BouncingScrollPhysics(),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildInsightsCard(),
            const SizedBox(height: 24),
            ...pricesByMarket.entries.map((entry) {
              return _buildMarketSection(entry.key, entry.value);
            }),
            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }

  Widget _buildInsightsCard() {
    final prices = _marketData!.currentPrices;
    final hasRising = prices.any((p) => p.trend == 'rising');
    final hasHighDemand = prices
        .any((p) => p.demandLevel == 'high' || p.demandLevel == 'very_high');

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.1),
            blurRadius: 20,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xFF059669), Color(0xFF047857)],
                  ),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(Icons.lightbulb_outline_rounded,
                    color: Colors.white, size: 22),
              ),
              const SizedBox(width: 12),
              const Text(
                'Market Insights',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF065F46),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          if (hasRising)
            _buildInsightRow(
              Icons.trending_up_rounded,
              'Prices are rising',
              'Good time to sell',
              const Color(0xFF10B981),
            ),
          if (hasHighDemand)
            _buildInsightRow(
              Icons.local_fire_department_rounded,
              'High demand detected',
              'Premium prices available',
              const Color(0xFFF59E0B),
            ),
          if (!hasRising && !hasHighDemand)
            _buildInsightRow(
              Icons.info_outline_rounded,
              'Market stable',
              'Standard pricing in effect',
              const Color(0xFF3B82F6),
            ),
        ],
      ),
    );
  }

  Widget _buildInsightRow(
      IconData icon, String title, String subtitle, Color color) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon, color: color, size: 20),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w600,
                    color: Colors.grey[900],
                  ),
                ),
                Text(
                  subtitle,
                  style: TextStyle(
                    fontSize: 13,
                    color: Colors.grey[600],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMarketSection(String marketName, List<MarketPrice> prices) {
    // Sort by quality grade (premium first)
    prices.sort((a, b) {
      final gradeOrder = {
        'premium': 0,
        'grade_a': 1,
        'grade_b': 2,
        'standard': 3
      };
      return (gradeOrder[a.qualityGrade] ?? 999)
          .compareTo(gradeOrder[b.qualityGrade] ?? 999);
    });

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.only(left: 4, bottom: 12),
          child: Row(
            children: [
              const Icon(Icons.location_on_rounded,
                  color: Colors.white, size: 20),
              const SizedBox(width: 8),
              Text(
                marketName,
                style: const TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
            ],
          ),
        ),
        ...prices.map((price) => _buildPriceCard(price)),
        const SizedBox(height: 20),
      ],
    );
  }

  Widget _buildPriceCard(MarketPrice price) {
    final formatter = NumberFormat.currency(symbol: 'RWF ', decimalDigits: 0);
    final gradeColors = {
      'premium': const Color(0xFFFBBF24),
      'grade_a': const Color(0xFF3B82F6),
      'grade_b': const Color(0xFF8B5CF6),
      'standard': const Color(0xFF6B7280),
    };
    final color = gradeColors[price.qualityGrade] ?? Colors.grey;

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: color.withValues(alpha: 0.2), width: 2),
        boxShadow: [
          BoxShadow(
            color: color.withValues(alpha: 0.1),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            width: 50,
            height: 50,
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [color, color.withValues(alpha: 0.7)],
              ),
              borderRadius: BorderRadius.circular(12),
            ),
            child:
                const Icon(Icons.star_rounded, color: Colors.white, size: 24),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  price.qualityGrade.toUpperCase().replaceAll('_', ' '),
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: color,
                    letterSpacing: 0.5,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  formatter.format(price.pricePerKg),
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    color: Colors.grey[900],
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  'per kilogram',
                  style: TextStyle(
                    fontSize: 12,
                    color: Colors.grey[600],
                  ),
                ),
              ],
            ),
          ),
          if (price.trend != null) _buildTrendBadge(price.trend!),
        ],
      ),
    );
  }

  Widget _buildTrendBadge(String trend) {
    final config = {
      'rising': {
        'icon': Icons.trending_up_rounded,
        'color': const Color(0xFF10B981),
        'label': 'Rising',
      },
      'falling': {
        'icon': Icons.trending_down_rounded,
        'color': const Color(0xFFEF4444),
        'label': 'Falling',
      },
      'stable': {
        'icon': Icons.trending_flat_rounded,
        'color': const Color(0xFF6B7280),
        'label': 'Stable',
      },
    };

    final conf = config[trend] ?? config['stable']!;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: (conf['color'] as Color).withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(conf['icon'] as IconData,
              color: conf['color'] as Color, size: 16),
          const SizedBox(width: 4),
          Text(
            conf['label'] as String,
            style: TextStyle(
              color: conf['color'] as Color,
              fontSize: 12,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }
}
