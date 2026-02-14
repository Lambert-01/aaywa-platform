// ignore_for_file: prefer_const_constructors, unused_import, unused_local_variable

import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:geolocator/geolocator.dart';
import 'package:provider/provider.dart';
import 'package:drift/drift.dart' as drift;
import 'package:aaywa_mobile/models/sync_status.dart'; // Added import
import '../../services/database_service.dart';
import '../../providers/auth_provider.dart';
import '../../theme/design_system.dart';
import '../../widgets/common/aaywa_card.dart';
import '../../widgets/common/aaywa_button.dart';

class IssueReportingScreen extends StatefulWidget {
  const IssueReportingScreen({super.key});

  @override
  State<IssueReportingScreen> createState() => _IssueReportingScreenState();
}

class _IssueReportingScreenState extends State<IssueReportingScreen> {
  final _formKey = GlobalKey<FormState>();
  final _picker = ImagePicker();

  String? _selectedCategory;
  String? _selectedUrgency;
  final _descriptionController = TextEditingController();

  File? _imageFile;
  Position? _currentPosition;
  bool _isLocating = false;
  bool _isSubmitting = false;

  final List<String> _categories = [
    'Pest/Disease Outbreak',
    'Input Quality Problem',
    'Training Material Missing',
    'VSLA Payment Delay',
    'Warehouse Access Issue',
    'Weather Damage',
    'Land Dispute',
    'Other'
  ];

  final List<String> _urgencies = ['Low', 'Medium', 'High', 'Critical'];

  @override
  void dispose() {
    _descriptionController.dispose();
    super.dispose();
  }

  Future<void> _pickImage() async {
    final XFile? photo = await _picker.pickImage(
      source: ImageSource.camera,
      imageQuality: 50, // Compress for easier sync
    );

    if (photo != null) {
      setState(() {
        _imageFile = File(photo.path);
      });
    }
  }

  Future<void> _getCurrentLocation() async {
    setState(() => _isLocating = true);
    try {
      bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        if (mounted) _showSnackBar('Location services are disabled.');
        return;
      }

      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) {
          if (mounted) _showSnackBar('Location permission denied.');
          return;
        }
      }

      if (permission == LocationPermission.deniedForever) {
        if (mounted)
          _showSnackBar('Location permissions are permanently denied.');
        return;
      }

      final position = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
      );

      setState(() => _currentPosition = position);
    } catch (e) {
      debugPrint('Error getting location: $e');
      if (mounted) _showSnackBar('Failed to get location.');
    } finally {
      if (mounted) setState(() => _isLocating = false);
    }
  }

  Future<void> _submitReport() async {
    if (!_formKey.currentState!.validate()) return;
    if (_selectedCategory == null || _selectedUrgency == null) {
      _showSnackBar('Please select category and urgency.');
      return;
    }

    setState(() => _isSubmitting = true);

    try {
      final auth = Provider.of<AuthProvider>(context, listen: false);
      final db = Provider.of<DatabaseService>(context, listen: false);
      final farmerId =
          auth.user?['id']?.toString() ?? 'unknown'; // Ensure string

      final issue = FarmerIssuesCompanion(
        farmerId: drift.Value(farmerId),
        categoryId: drift.Value(_selectedCategory!),
        urgency: drift.Value(_selectedUrgency!),
        description: drift.Value(_descriptionController.text),
        photoPath: drift.Value(_imageFile?.path),
        gpsLat: drift.Value(_currentPosition?.latitude),
        gpsLng: drift.Value(_currentPosition?.longitude),
        status: const drift.Value('Open'),
        syncStatus: const drift.Value(SyncStatus.pending), // Use enum
        dateReported: drift.Value(DateTime.now()),
      );

      // We need a helper method in DatabaseService to insert issue
      // For now, assume we'll add `insertFarmerIssue` to DatabaseService
      // or use general insert if possible (Drift generates `into(farmerIssues).insert(...)`).
      // Since `insertFarmerIssue` doesn't exist yet in the viewed file (Step 144),
      // I'll add that method to DatabaseService in the next tool call.
      // But for compilation I can use the generated code if I was in the same file.
      // Here I am in a different file. I need to rely on the method existing.
      // I will add the method to DatabaseService in a separate tool call.

      // Wait, I can't call a non-existent method.
      // I'll wrap this in a try-catch and assume I'll add the method.
      // Actually, I should add the method to DatabaseService FIRST.
      // But I can't undo this write_to_file easily.
      // I'll comment out the DB call for a second or use a TODO placeholder
      // and update DatabaseService immediately after.

      // Better: I'll use `db.into(db.farmerIssues).insert(issue)` if accessible?
      // `db` is `DatabaseService` which is `AppDatabase`. `farmerIssues` is a getter on it.
      // Yes, `db.farmerIssues` is accessible.

      await db.into(db.farmerIssues).insert(issue);

      if (mounted) {
        showDialog(
          context: context,
          builder: (ctx) => AlertDialog(
            title: const Text('Report Submitted'),
            content: const Text(
                'Your issue has been recorded locally. We will review it shortly.'),
            actions: [
              TextButton(
                onPressed: () {
                  Navigator.pop(ctx); // Close dialog
                  Navigator.pop(context); // Go back to Home
                },
                child: const Text('OK'),
              )
            ],
          ),
        );
      }
    } catch (e) {
      debugPrint('Error submitting report: $e');
      if (mounted) _showSnackBar('Failed to submit report: $e');
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  void _showSnackBar(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message)),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Report an Issue'),
        backgroundColor: AppColors.surfaceWhite,
        foregroundColor: AppColors.textDark,
        elevation: 0,
      ),
      backgroundColor: AppColors.backgroundGray,
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(AppSpacing.md),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // ─── 1. Category ──────────────────────────────────────
              AaywaCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Issue Category', style: AppTypography.labelMedium),
                    const SizedBox(height: AppSpacing.sm),
                    DropdownButtonFormField<String>(
                      value: _selectedCategory,
                      decoration: const InputDecoration(
                        border: OutlineInputBorder(),
                        contentPadding:
                            EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                      ),
                      items: _categories
                          .map(
                              (c) => DropdownMenuItem(value: c, child: Text(c)))
                          .toList(),
                      onChanged: (val) =>
                          setState(() => _selectedCategory = val),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: AppSpacing.md),

              // ─── 2. Urgency ───────────────────────────────────────
              AaywaCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Urgency Level', style: AppTypography.labelMedium),
                    const SizedBox(height: AppSpacing.sm),
                    DropdownButtonFormField<String>(
                      value: _selectedUrgency,
                      decoration: const InputDecoration(
                        border: OutlineInputBorder(),
                        contentPadding:
                            EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                      ),
                      items: _urgencies.map((u) {
                        Color? color;
                        if (u == 'Critical') color = AppColors.error;
                        if (u == 'High') color = AppColors.warning;
                        return DropdownMenuItem(
                            value: u,
                            child: Text(u,
                                style: TextStyle(
                                    color: color,
                                    fontWeight: color != null
                                        ? FontWeight.bold
                                        : FontWeight.normal)));
                      }).toList(),
                      onChanged: (val) =>
                          setState(() => _selectedUrgency = val),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: AppSpacing.md),

              // ─── 3. Description ───────────────────────────────────
              AaywaCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Description', style: AppTypography.labelMedium),
                    const SizedBox(height: AppSpacing.sm),
                    TextFormField(
                      controller: _descriptionController,
                      maxLines: 4,
                      decoration: const InputDecoration(
                        hintText: 'What happened? When? Where?',
                        border: OutlineInputBorder(),
                      ),
                      validator: (val) => val == null || val.isEmpty
                          ? 'Description is required'
                          : null,
                    ),
                  ],
                ),
              ),
              const SizedBox(height: AppSpacing.md),

              // ─── 4. Photo & Location ──────────────────────────────
              Row(
                children: [
                  Expanded(
                    child: AaywaCard(
                      child: InkWell(
                        onTap: _pickImage,
                        child: Column(
                          children: [
                            Icon(Icons.camera_alt,
                                color: _imageFile != null
                                    ? AppColors.success
                                    : AppColors.primaryGreen,
                                size: 32),
                            const SizedBox(height: AppSpacing.xs),
                            Text(
                              _imageFile != null ? 'Photo Added' : 'Add Photo',
                              style: AppTypography.caption,
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: AppSpacing.md),
                  Expanded(
                    child: AaywaCard(
                      child: InkWell(
                        onTap: _getCurrentLocation,
                        child: Column(
                          children: [
                            if (_isLocating)
                              const SizedBox(
                                  height: 32,
                                  width: 32,
                                  child: CircularProgressIndicator())
                            else
                              Icon(Icons.location_on,
                                  color: _currentPosition != null
                                      ? AppColors.success
                                      : AppColors.primaryGreen,
                                  size: 32),
                            const SizedBox(height: AppSpacing.xs),
                            Text(
                              _currentPosition != null
                                  ? 'Loc Captured'
                                  : 'Get Location',
                              style: AppTypography.caption,
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: AppSpacing.xl),

              // ─── Submit ───────────────────────────────────────────
              AaywaButton(
                label: 'Submit Report',
                isLoading: _isSubmitting,
                onPressed: _isSubmitting ? null : _submitReport,
                type: ButtonType.primary,
                fullWidth: true,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
