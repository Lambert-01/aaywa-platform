import 'package:flutter/material.dart';
import '../../theme/design_system.dart';
import '../../widgets/common/aaywa_card.dart';
import '../../services/qr_scanner_service.dart';
import '../../models/training_analytics.dart';

class TrainingDeliveryScreen extends StatefulWidget {
  const TrainingDeliveryScreen({super.key});

  @override
  State<TrainingDeliveryScreen> createState() => _TrainingDeliveryScreenState();
}

class _TrainingDeliveryScreenState extends State<TrainingDeliveryScreen> {
  final bool _isLoading = false;
  int _currentSlide = 0;

  //Mock training content - replace with actual API
  final _TrainingModule _currentModule = _TrainingModule(
    id: '1',
    title: 'Avocado Pruning Techniques',
    topic: 'Agronomic Practices',
    duration: '45 min',
    slides: [
      _TrainingSlide(
        title: 'Introduction to Pruning',
        content:
            'Pruning is essential for maintaining healthy avocado trees and maximizing yield. Today we\'ll learn proper techniques.',
        imageUrl: null,
        keyPoints: [
          'Increased air circulation',
          'Better sunlight penetration',
          'Improved fruit quality',
          'Disease prevention',
        ],
      ),
      _TrainingSlide(
        title: 'When to Prune',
        content:
            'The best time to prune avocado trees is after harvest but before flowering.',
        imageUrl: null,
        keyPoints: [
          'Post-harvest period (June-August)',
          'Avoid rainy season',
          'Before new flowering',
          'Regular maintenance pruning',
        ],
      ),
      _TrainingSlide(
        title: 'Pruning Tools',
        content:
            'Using the right tools ensures clean cuts and prevents disease.',
        imageUrl: null,
        keyPoints: [
          'Hand pruners for small branches',
          'Loppers for medium branches',
          'Pruning saw for large branches',
          'Sterilize tools between trees',
        ],
      ),
    ],
  );

  final List<_Attendee> _attendees = [
    _Attendee(id: '1', name: 'Jean Claude Mugabo', isPresent: false),
    _Attendee(id: '2', name: 'Rose Muhumuza', isPresent: false),
    _Attendee(id: '3', name: 'Patrick Nkusi', isPresent: false),
  ];

  void _toggleAttendance(int index) {
    setState(() {
      _attendees[index].isPresent = !_attendees[index].isPresent;
    });
  }

  void _scanQRCode() {
    showDialog(
      context: context,
      builder: (context) => Dialog(
        backgroundColor: Colors.transparent,
        insetPadding: const EdgeInsets.all(20),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(20),
          child: SizedBox(
            height: 500,
            child: Stack(
              children: [
                QRScannerView(
                  message: 'Scan farmer QR code to mark attendance',
                  onScan: (code) {
                    Navigator.pop(context);
                    _handleQRScan(code);
                  },
                ),
                Positioned(
                  top: 10,
                  right: 10,
                  child: IconButton(
                    icon: const Icon(Icons.close, color: Colors.white),
                    onPressed: () => Navigator.pop(context),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  void _handleQRScan(String qrCode) {
    try {
      final farmerData = FarmerQRData.fromQRCode(qrCode);

      // Find attendee by ID
      final attendeeIndex = _attendees.indexWhere(
        (a) => a.id == farmerData.farmerId,
      );

      if (attendeeIndex != -1) {
        setState(() {
          _attendees[attendeeIndex].isPresent = true;
        });

        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('✓ ${farmerData.farmerName} marked present'),
            backgroundColor: Colors.green,
            duration: const Duration(seconds: 2),
          ),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
                'Farmer "${farmerData.farmerName}" not in this training session'),
            backgroundColor: Colors.orange,
            duration: const Duration(seconds: 3),
          ),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Invalid QR code format'),
          backgroundColor: Colors.red,
          duration: Duration(seconds: 2),
        ),
      );
    }
  }

  void _nextSlide() {
    if (_currentSlide < _currentModule.slides.length - 1) {
      setState(() => _currentSlide++);
    }
  }

  void _previousSlide() {
    if (_currentSlide > 0) {
      setState(() => _currentSlide--);
    }
  }

  void _completeTraining() {
    final presentCount = _attendees.where((a) => a.isPresent).length;
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Complete Training?'),
        content: Text(
            '$presentCount of ${_attendees.length} farmers attended.\n\nThis will sync training data when online.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              // Save training record
              Navigator.pop(context); // Close dialog
              Navigator.pop(context); // Return to work plan
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Training saved successfully')),
              );
            },
            child: const Text('Complete'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.backgroundGray,
      appBar: AppBar(
        title: const Text('Training Delivery'),
        backgroundColor: AppColors.surfaceWhite,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.check_circle_outline),
            onPressed: _completeTraining,
            tooltip: 'Complete Training',
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : ListView(
              padding: const EdgeInsets.all(AppSpacing.md),
              children: [
                // Training Header
                AaywaCard(
                  hasAccentTop: true,
                  accentColor: AppColors.primaryGreen,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        _currentModule.topic.toUpperCase(),
                        style: AppTypography.overline.copyWith(
                          color: AppColors.textMedium,
                        ),
                      ),
                      const SizedBox(height: AppSpacing.xs),
                      Text(
                        _currentModule.title,
                        style: AppTypography.h4.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: AppSpacing.sm),
                      Row(
                        children: [
                          const Icon(
                            Icons.access_time,
                            size: 16,
                            color: AppColors.textMedium,
                          ),
                          const SizedBox(width: 4),
                          Text(
                            _currentModule.duration,
                            style: AppTypography.bodySmall.copyWith(
                              color: AppColors.textMedium,
                            ),
                          ),
                          const SizedBox(width: AppSpacing.md),
                          const Icon(
                            Icons.slideshow,
                            size: 16,
                            color: AppColors.textMedium,
                          ),
                          const SizedBox(width: 4),
                          Text(
                            '${_currentModule.slides.length} slides',
                            style: AppTypography.bodySmall.copyWith(
                              color: AppColors.textMedium,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: AppSpacing.lg),

                // Slide Content
                AaywaCard(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Slide Progress
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            'Slide ${_currentSlide + 1} of ${_currentModule.slides.length}',
                            style: AppTypography.caption.copyWith(
                              color: AppColors.textMedium,
                            ),
                          ),
                          Text(
                            '${(((_currentSlide + 1) / _currentModule.slides.length) * 100).toInt()}%',
                            style: AppTypography.caption.copyWith(
                              color: AppColors.primaryGreen,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: AppSpacing.xs),
                      ClipRRect(
                        borderRadius: BorderRadius.circular(AppRadius.full),
                        child: LinearProgressIndicator(
                          value: (_currentSlide + 1) /
                              _currentModule.slides.length,
                          minHeight: 4,
                          backgroundColor: AppColors.divider,
                          valueColor: const AlwaysStoppedAnimation<Color>(
                              AppColors.primaryGreen),
                        ),
                      ),

                      const SizedBox(height: AppSpacing.lg),

                      // Slide Title
                      Text(
                        _currentModule.slides[_currentSlide].title,
                        style: AppTypography.h4.copyWith(
                          fontWeight: FontWeight.bold,
                          color: AppColors.primaryGreen,
                        ),
                      ),

                      const SizedBox(height: AppSpacing.md),

                      // Slide Content
                      Text(
                        _currentModule.slides[_currentSlide].content,
                        style: AppTypography.bodyLarge,
                      ),

                      const SizedBox(height: AppSpacing.lg),

                      // Key Points
                      Text(
                        'KEY POINTS',
                        style: AppTypography.overline.copyWith(
                          color: AppColors.textMedium,
                        ),
                      ),
                      const SizedBox(height: AppSpacing.sm),

                      ..._currentModule.slides[_currentSlide].keyPoints
                          .map((point) => Padding(
                                padding: const EdgeInsets.only(
                                    bottom: AppSpacing.sm),
                                child: Row(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Container(
                                      margin: const EdgeInsets.only(top: 6),
                                      width: 8,
                                      height: 8,
                                      decoration: const BoxDecoration(
                                        color: AppColors.primaryGreen,
                                        shape: BoxShape.circle,
                                      ),
                                    ),
                                    const SizedBox(width: AppSpacing.sm),
                                    Expanded(
                                      child: Text(
                                        point,
                                        style: AppTypography.bodyLarge,
                                      ),
                                    ),
                                  ],
                                ),
                              )),

                      const SizedBox(height: AppSpacing.lg),

                      // Navigation Buttons
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          TextButton.icon(
                            onPressed:
                                _currentSlide > 0 ? _previousSlide : null,
                            icon: const Icon(Icons.arrow_back),
                            label: const Text('Previous'),
                          ),
                          TextButton.icon(
                            onPressed:
                                _currentSlide < _currentModule.slides.length - 1
                                    ? _nextSlide
                                    : null,
                            icon: const Icon(Icons.arrow_forward),
                            label: const Text('Next'),
                            iconAlignment: IconAlignment.end,
                          ),
                        ],
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: AppSpacing.xl),

                // Attendance Section
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'ATTENDANCE (${_attendees.where((a) => a.isPresent).length}/${_attendees.length})',
                      style: AppTypography.overline.copyWith(
                        color: AppColors.textMedium,
                      ),
                    ),
                    ElevatedButton.icon(
                      onPressed: _scanQRCode,
                      icon: const Icon(Icons.qr_code_scanner, size: 18),
                      label: const Text('Scan QR'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primaryGreen,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(
                          horizontal: 12,
                          vertical: 8,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: AppSpacing.sm),

                AaywaCard(
                  padding: EdgeInsets.zero,
                  child: ListView.separated(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    itemCount: _attendees.length,
                    separatorBuilder: (_, __) => const Divider(height: 1),
                    itemBuilder: (context, index) {
                      final attendee = _attendees[index];
                      return ListTile(
                        leading: CircleAvatar(
                          backgroundColor: attendee.isPresent
                              ? AppColors.success.withValues(alpha: 0.1)
                              : AppColors.textLight.withValues(alpha: 0.1),
                          child: Icon(
                            Icons.person,
                            color: attendee.isPresent
                                ? AppColors.success
                                : AppColors.textLight,
                          ),
                        ),
                        title: Text(
                          attendee.name,
                          style: TextStyle(
                            color: attendee.isPresent
                                ? AppColors.textDark
                                : AppColors.textMedium,
                          ),
                        ),
                        trailing: Checkbox(
                          value: attendee.isPresent,
                          onChanged: (_) => _toggleAttendance(index),
                          activeColor: AppColors.success,
                        ),
                      );
                    },
                  ),
                ),

                const SizedBox(height: AppSpacing.xxl),
              ],
            ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _completeTraining,
        backgroundColor: AppColors.primaryGreen,
        icon: const Icon(Icons.check),
        label: const Text('Complete Training'),
      ),
    );
  }
}

class _TrainingModule {
  final String id;
  final String title;
  final String topic;
  final String duration;
  final List<_TrainingSlide> slides;

  _TrainingModule({
    required this.id,
    required this.title,
    required this.topic,
    required this.duration,
    required this.slides,
  });
}

class _TrainingSlide {
  final String title;
  final String content;
  final String? imageUrl;
  final List<String> keyPoints;

  _TrainingSlide({
    required this.title,
    required this.content,
    this.imageUrl,
    required this.keyPoints,
  });
}

class _Attendee {
  final String id;
  final String name;
  bool isPresent;

  _Attendee({
    required this.id,
    required this.name,
    required this.isPresent,
  });
}
