import 'package:flutter/material.dart';
import '../../services/api_service.dart';
import '../../theme/design_system.dart';
import '../../widgets/common/aaywa_button.dart';
import '../../widgets/common/aaywa_input.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  final _fullNameController = TextEditingController();
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();
  final _messageController = TextEditingController();

  String _selectedRole = 'farmer';
  bool _isLoading = false;
  String? _errorMessage;
  bool _success = false;

  @override
  void dispose() {
    _fullNameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _messageController.dispose();
    super.dispose();
  }

  Future<void> _handleRegister() async {
    if (!_formKey.currentState!.validate()) return;

    // 1. Clear focus globally to prevent pointer interaction conflicts on Web
    FocusManager.instance.primaryFocus?.unfocus();

    // 2. Wait for a frame and a small delay to ensure browser focus state is settled
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      await Future.delayed(const Duration(milliseconds: 100));
      if (!mounted) return;

      setState(() {
        _isLoading = true;
        _errorMessage = null;
      });

      try {
        final apiService = ApiService();
        await apiService.post('/users/register', {
          'full_name': _fullNameController.text.trim(),
          'email': _emailController.text.trim(),
          'phone': _phoneController.text.trim(),
          'requested_role': _selectedRole,
          'message': _messageController.text.trim(),
        });

        if (mounted) {
          setState(() {
            _isLoading = false;
            _success = true;
          });
        }
      } catch (e) {
        if (mounted) {
          setState(() {
            _isLoading = false;
            _errorMessage = e.toString().contains('409')
                ? 'This email is already registered or pending.'
                : 'Failed to submit request. Please try again.';
          });
        }
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    if (_success) {
      return _buildSuccessView();
    }

    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [AppColors.primaryGreen, AppColors.secondaryGreen],
          ),
        ),
        child: SafeArea(
          child: Center(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(AppSpacing.xl),
              child: AbsorbPointer(
                absorbing: _isLoading,
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    _buildHeader(),
                    const SizedBox(height: AppSpacing.xl),
                    _buildRegistrationForm(),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Column(
      children: [
        Container(
          padding: const EdgeInsets.all(AppSpacing.lg),
          decoration: BoxDecoration(
            color: Colors.white.withValues(alpha: 0.2),
            shape: BoxShape.circle,
            border: Border.all(
                color: Colors.white.withValues(alpha: 0.4), width: 2),
          ),
          child: const Icon(
            Icons.person_add_outlined,
            size: 48,
            color: Colors.white,
          ),
        ),
        const SizedBox(height: AppSpacing.lg),
        Text(
          'Join AAYWA',
          style: AppTypography.h1.copyWith(color: Colors.white),
        ),
        const SizedBox(height: AppSpacing.xs),
        Text(
          'Request access to the platform',
          style: AppTypography.bodyMedium
              .copyWith(color: Colors.white.withValues(alpha: 0.8)),
        ),
      ],
    );
  }

  Widget _buildRegistrationForm() {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.xl),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(AppRadius.xl),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.1),
            blurRadius: 20,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            if (_errorMessage != null) _buildErrorBanner(),
            AaywaInput(
              label: 'Full Name',
              hint: 'Enter your full name',
              controller: _fullNameController,
              validator: (v) =>
                  v?.isEmpty ?? true ? 'Full name is required' : null,
              prefixIcon: Icons.person_outline,
            ),
            const SizedBox(height: AppSpacing.md),
            AaywaInput(
              label: 'Email Address',
              hint: 'email@example.com',
              controller: _emailController,
              keyboardType: TextInputType.emailAddress,
              validator: (v) =>
                  v?.contains('@') ?? false ? null : 'Invalid email address',
              prefixIcon: Icons.email_outlined,
            ),
            const SizedBox(height: AppSpacing.md),
            AaywaInput(
              label: 'Phone Number',
              hint: '+250...',
              controller: _phoneController,
              keyboardType: TextInputType.phone,
              prefixIcon: Icons.phone_outlined,
            ),
            const SizedBox(height: AppSpacing.md),
            AaywaDropdown<String>(
              label: 'I am registering as:',
              value: _selectedRole,
              items: const [
                DropdownMenuItem(value: 'farmer', child: Text('Farmer')),
                DropdownMenuItem(
                    value: 'agronomist', child: Text('Agronomist')),
              ],
              onChanged: (val) {
                if (val != null) setState(() => _selectedRole = val);
              },
            ),
            const SizedBox(height: AppSpacing.md),
            AaywaInput(
              label: 'Message',
              hint: 'Why are you requesting access?',
              controller: _messageController,
              maxLines: 3,
            ),
            const SizedBox(height: AppSpacing.xl),
            AaywaButton(
              label: 'Submit Request',
              onPressed: _handleRegister,
              isLoading: _isLoading,
              fullWidth: true,
            ),
            const SizedBox(height: AppSpacing.lg),
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: Text(
                'Back to Login',
                style: AppTypography.labelLarge
                    .copyWith(color: AppColors.primaryGreen),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildErrorBanner() {
    return Container(
      margin: const EdgeInsets.only(bottom: AppSpacing.lg),
      padding: const EdgeInsets.all(AppSpacing.md),
      decoration: BoxDecoration(
        color: AppColors.error.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(AppRadius.md),
        border: Border.all(color: AppColors.error.withValues(alpha: 0.3)),
      ),
      child: Row(
        children: [
          const Icon(Icons.error_outline, color: AppColors.error),
          const SizedBox(width: AppSpacing.md),
          Expanded(
            child: Text(
              _errorMessage!,
              style: AppTypography.bodySmall.copyWith(color: AppColors.error),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSuccessView() {
    return Scaffold(
      body: Container(
        width: double.infinity,
        padding: const EdgeInsets.all(AppSpacing.xxl),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(
              Icons.check_circle_outline,
              size: 100,
              color: AppColors.primaryGreen,
            ),
            const SizedBox(height: AppSpacing.xl),
            const Text(
              'Request Submitted!',
              style: AppTypography.h2,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: AppSpacing.md),
            const Text(
              'Your registration request has been sent for approval. You will be notified once a Project Manager reviews it.',
              textAlign: TextAlign.center,
              style: AppTypography.bodyMedium,
            ),
            const SizedBox(height: AppSpacing.xxl),
            AaywaButton(
              label: 'Back to Login',
              onPressed: () => Navigator.pop(context),
            ),
          ],
        ),
      ),
    );
  }
}
