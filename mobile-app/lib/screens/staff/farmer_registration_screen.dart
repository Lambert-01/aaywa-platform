import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:geolocator/geolocator.dart';
import 'package:qr_flutter/qr_flutter.dart';
import 'dart:io';
import '../../theme/design_system.dart';
import '../../widgets/common/aaywa_card.dart';
import '../../services/qr_scanner_service.dart';

class FarmerRegistrationScreen extends StatefulWidget {
  const FarmerRegistrationScreen({super.key});

  @override
  State<FarmerRegistrationScreen> createState() =>
      _FarmerRegistrationScreenState();
}

class _FarmerRegistrationScreenState extends State<FarmerRegistrationScreen> {
  final _formKey = GlobalKey<FormState>();
  final _imagePicker = ImagePicker();

  // Form Controllers
  final _nameController = TextEditingController();
  final _phoneController = TextEditingController();
  final _idNumberController = TextEditingController();

  // Form State
  File? _photoFile;
  Position? _captureLocation;
  String _selectedGender = 'male';
  String _selectedHouseholdType = 'normal';
  DateTime? _dateOfBirth;
  bool _isLoading = false;
  bool _isDuplicateCheckRunning = false;
  final List<String> _duplicateWarnings = [];

  @override
  void dispose() {
    _nameController.dispose();
    _phoneController.dispose();
    _idNumberController.dispose();
    super.dispose();
  }

  Future<void> _capturePhoto() async {
    try {
      final XFile? photo = await _imagePicker.pickImage(
        source: ImageSource.camera,
        preferredCameraDevice: CameraDevice.front,
        maxWidth: 800,
        maxHeight: 800,
        imageQuality: 85,
      );

      if (photo != null) {
        // Capture GPS location at time of photo
        try {
          final position = await Geolocator.getCurrentPosition();
          setState(() {
            _photoFile = File(photo.path);
            _captureLocation = position;
          });
        } catch (e) {
          // Photo captured but GPS failed - still allow
          setState(() {
            _photoFile = File(photo.path);
          });
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                  content: Text('Photo saved, but GPS location unavailable')),
            );
          }
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error capturing photo: $e')),
        );
      }
    }
  }

  Future<void> _checkForDuplicates() async {
    if (_phoneController.text.isEmpty) return;

    setState(() {
      _isDuplicateCheckRunning = true;
      _duplicateWarnings.clear();
    });

    // Simulate API call for duplicate detection
    await Future.delayed(const Duration(seconds: 1));

    // Mock duplicate detection - replace with actual API
    final phone = _phoneController.text;
    if (phone == '+250788123456' || phone == '0788123456') {
      setState(() {
        _duplicateWarnings
            .add('Phone number already registered to: Jean Claude Mugabo');
      });
    }

    setState(() => _isDuplicateCheckRunning = false);
  }

  Future<void> _selectDateOfBirth() async {
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: DateTime.now().subtract(const Duration(days: 365 * 25)),
      firstDate: DateTime.now().subtract(const Duration(days: 365 * 100)),
      lastDate: DateTime.now().subtract(const Duration(days: 365 * 18)),
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: const ColorScheme.light(
              primary: AppColors.primaryGreen,
            ),
          ),
          child: child!,
        );
      },
    );

    if (picked != null) {
      setState(() => _dateOfBirth = picked);
    }
  }

  Future<void> _saveFarmer() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    if (_photoFile == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please capture farmer photo')),
      );
      return;
    }

    if (_duplicateWarnings.isNotEmpty) {
      final confirm = await showDialog<bool>(
        context: context,
        builder: (context) => AlertDialog(
          title: const Text('Duplicate Detected'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Possible duplicate farmer:'),
              const SizedBox(height: 8),
              ..._duplicateWarnings.map((w) => Padding(
                    padding: const EdgeInsets.only(bottom: 4),
                    child: Text('• $w',
                        style: const TextStyle(color: AppColors.error)),
                  )),
              const SizedBox(height: 12),
              const Text('Do you want to proceed anyway?'),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context, false),
              child: const Text('Cancel'),
            ),
            ElevatedButton(
              onPressed: () => Navigator.pop(context, true),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.warning,
              ),
              child: const Text('Proceed'),
            ),
          ],
        ),
      );

      if (confirm != true) return;
    }

    setState(() => _isLoading = true);

    // Simulate save - replace with actual database save
    await Future.delayed(const Duration(seconds: 2));

    // Generate unique farmer ID (replace with actual ID from database)
    final farmerId = 'F${DateTime.now().millisecondsSinceEpoch}';
    final farmerName = _nameController.text;

    if (mounted) {
      setState(() => _isLoading = false);

      // Show QR code after successful registration
      await _showFarmerQRCode(farmerId, farmerName);

      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Farmer registered successfully (offline)'),
          backgroundColor: AppColors.success,
        ),
      );
      Navigator.pop(context, true);
    }
  }

  Future<void> _showFarmerQRCode(String farmerId, String farmerName) async {
    final qrData = FarmerQRData(
      farmerId: farmerId,
      farmerName: farmerName,
    );

    await showDialog(
      context: context,
      builder: (context) => Dialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
        ),
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(
                Icons.check_circle,
                color: AppColors.success,
                size: 48,
              ),
              const SizedBox(height: 16),
              const Text(
                'Registration Complete!',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                farmerName,
                style: const TextStyle(
                  fontSize: 16,
                  color: AppColors.textMedium,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 24),
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.divider),
                ),
                child: QrImageView(
                  data: qrData.toQRCode(),
                  version: QrVersions.auto,
                  size: 200,
                  backgroundColor: Colors.white,
                ),
              ),
              const SizedBox(height: 16),
              const Text(
                'Use this QR code for attendance',
                style: TextStyle(
                  fontSize: 14,
                  color: AppColors.textMedium,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: () => Navigator.pop(context),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primaryGreen,
                  padding: const EdgeInsets.symmetric(
                    horizontal: 32,
                    vertical: 12,
                  ),
                ),
                child: const Text('Done'),
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.backgroundGray,
      appBar: AppBar(
        title: const Text('Register New Farmer'),
        backgroundColor: AppColors.surfaceWhite,
        elevation: 0,
      ),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(AppSpacing.md),
          children: [
            // Photo Capture Section
            AaywaCard(
              child: Column(
                children: [
                  Text(
                    'FARMER PHOTO',
                    style: AppTypography.overline.copyWith(
                      color: AppColors.textMedium,
                    ),
                  ),
                  const SizedBox(height: AppSpacing.md),
                  GestureDetector(
                    onTap: _capturePhoto,
                    child: Container(
                      width: 150,
                      height: 150,
                      decoration: BoxDecoration(
                        color: AppColors.backgroundGray,
                        borderRadius: BorderRadius.circular(AppRadius.md),
                        border: Border.all(
                          color: _photoFile == null
                              ? AppColors.divider
                              : AppColors.primaryGreen,
                          width: 2,
                        ),
                      ),
                      child: _photoFile == null
                          ? const Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(
                                  Icons.camera_alt,
                                  size: 48,
                                  color: AppColors.textLight,
                                ),
                                SizedBox(height: 8),
                                Text(
                                  'Tap to capture',
                                  style: TextStyle(color: AppColors.textMedium),
                                ),
                              ],
                            )
                          : ClipRRect(
                              borderRadius:
                                  BorderRadius.circular(AppRadius.md - 2),
                              child: Image.file(
                                _photoFile!,
                                fit: BoxFit.cover,
                              ),
                            ),
                    ),
                  ),
                  if (_captureLocation != null)
                    Padding(
                      padding: const EdgeInsets.only(top: AppSpacing.sm),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(
                            Icons.location_on,
                            size: 14,
                            color: AppColors.success,
                          ),
                          const SizedBox(width: 4),
                          Text(
                            'GPS: ${_captureLocation!.latitude.toStringAsFixed(6)}, ${_captureLocation!.longitude.toStringAsFixed(6)}',
                            style: AppTypography.caption.copyWith(
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

            // Personal Information
            AaywaCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'PERSONAL INFORMATION',
                    style: AppTypography.overline.copyWith(
                      color: AppColors.textMedium,
                    ),
                  ),
                  const SizedBox(height: AppSpacing.md),

                  // Full Name
                  TextFormField(
                    controller: _nameController,
                    decoration: const InputDecoration(
                      labelText: 'Full Name',
                      hintText: 'Enter full name',
                      prefixIcon: Icon(Icons.person),
                    ),
                    validator: (value) {
                      if (value == null || value.trim().isEmpty) {
                        return 'Name is required';
                      }
                      return null;
                    },
                  ),

                  const SizedBox(height: AppSpacing.md),

                  // Phone Number
                  TextFormField(
                    controller: _phoneController,
                    decoration: InputDecoration(
                      labelText: 'Phone Number',
                      hintText: '+250788123456',
                      prefixIcon: const Icon(Icons.phone),
                      suffixIcon: _isDuplicateCheckRunning
                          ? const Padding(
                              padding: EdgeInsets.all(12),
                              child: SizedBox(
                                width: 20,
                                height: 20,
                                child:
                                    CircularProgressIndicator(strokeWidth: 2),
                              ),
                            )
                          : null,
                    ),
                    keyboardType: TextInputType.phone,
                    onChanged: (_) {
                      _checkForDuplicates();
                    },
                    validator: (value) {
                      if (value == null || value.trim().isEmpty) {
                        return 'Phone number is required';
                      }
                      return null;
                    },
                  ),

                  if (_duplicateWarnings.isNotEmpty)
                    Padding(
                      padding: const EdgeInsets.only(top: AppSpacing.sm),
                      child: Container(
                        padding: const EdgeInsets.all(AppSpacing.sm),
                        decoration: BoxDecoration(
                          color: AppColors.error.withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(AppRadius.sm),
                          border: Border.all(color: AppColors.error),
                        ),
                        child: Row(
                          children: [
                            const Icon(Icons.warning,
                                color: AppColors.error, size: 20),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                _duplicateWarnings.first,
                                style: const TextStyle(
                                  color: AppColors.error,
                                  fontSize: 12,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),

                  const SizedBox(height: AppSpacing.md),

                  // National ID
                  TextFormField(
                    controller: _idNumberController,
                    decoration: const InputDecoration(
                      labelText: 'National ID Number',
                      hintText: 'Optional',
                      prefixIcon: Icon(Icons.badge),
                    ),
                  ),

                  const SizedBox(height: AppSpacing.md),

                  // Date of Birth
                  InkWell(
                    onTap: _selectDateOfBirth,
                    child: InputDecorator(
                      decoration: const InputDecoration(
                        labelText: 'Date of Birth',
                        prefixIcon: Icon(Icons.calendar_today),
                      ),
                      child: Text(
                        _dateOfBirth != null
                            ? '${_dateOfBirth!.day}/${_dateOfBirth!.month}/${_dateOfBirth!.year}'
                            : 'Select date',
                        style: TextStyle(
                          color: _dateOfBirth != null
                              ? AppColors.textDark
                              : AppColors.textMedium,
                        ),
                      ),
                    ),
                  ),

                  const SizedBox(height: AppSpacing.md),

                  // Gender
                  const Text(
                    'Gender',
                    style: AppTypography.labelMedium,
                  ),
                  const SizedBox(height: AppSpacing.xs),
                  Row(
                    children: [
                      Expanded(
                        child: RadioListTile<String>(
                          title: const Text('Male'),
                          value: 'male',
                          groupValue: _selectedGender,
                          onChanged: (value) {
                            setState(() => _selectedGender = value!);
                          },
                          contentPadding: EdgeInsets.zero,
                        ),
                      ),
                      Expanded(
                        child: RadioListTile<String>(
                          title: const Text('Female'),
                          value: 'female',
                          groupValue: _selectedGender,
                          onChanged: (value) {
                            setState(() => _selectedGender = value!);
                          },
                          contentPadding: EdgeInsets.zero,
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: AppSpacing.md),

                  // Household Type
                  DropdownButtonFormField<String>(
                    value: _selectedHouseholdType,
                    decoration: const InputDecoration(
                      labelText: 'Household Type',
                      prefixIcon: Icon(Icons.home),
                    ),
                    items: const [
                      DropdownMenuItem(value: 'normal', child: Text('Normal')),
                      DropdownMenuItem(
                          value: 'vulnerable', child: Text('Vulnerable')),
                      DropdownMenuItem(
                          value: 'child_headed', child: Text('Child-Headed')),
                      DropdownMenuItem(
                          value: 'widow', child: Text('Widow/Widower')),
                    ],
                    onChanged: (value) {
                      setState(() => _selectedHouseholdType = value!);
                    },
                  ),
                ],
              ),
            ),

            const SizedBox(height: AppSpacing.xxl),

            // Save Button
            ElevatedButton(
              onPressed: _isLoading ? null : _saveFarmer,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primaryGreen,
                padding: const EdgeInsets.symmetric(vertical: 16),
                minimumSize: const Size.fromHeight(50),
              ),
              child: _isLoading
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                      ),
                    )
                  : const Text(
                      'REGISTER FARMER',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
            ),

            const SizedBox(height: AppSpacing.md),
          ],
        ),
      ),
    );
  }
}
