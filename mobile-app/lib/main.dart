import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'services/database_service.dart';
import 'services/background_sync_service.dart';
import 'providers/auth_provider.dart';
import 'providers/dashboard_provider.dart';
import 'providers/sync_provider.dart';
import 'providers/staff_kpi_provider.dart';
import 'providers/resource_provider.dart';
import 'providers/agricultural_provider.dart';
import 'providers/admin_provider.dart';
import 'screens/auth/login_screen.dart';
import 'screens/auth/register_screen.dart';
import 'screens/home/home_screen.dart';
import 'theme/app_theme.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Initialize database
  final databaseService = DatabaseService();

  // Initialize Background Sync
  // Wrapped in try-catch to prevent app crash if workmanager fails (e.g. on Windows)
  try {
    // Check platform possibly, but workmanager claims support.
    // However, on Windows workmanager might no-op or throw.
    // Given user is on Windows dev machine but deploying for mobile (Android/iOS).
    // I'll add the import and call.
    await BackgroundSyncService.initialize();
  } catch (e) {
    debugPrint('Background Sync Init Failed (Expected on Windows Desktop): $e');
  }

  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => DashboardProvider()),
        ChangeNotifierProvider(create: (_) => SyncProvider(databaseService)),
        ChangeNotifierProvider(create: (_) => StaffKPIProvider()),
        ChangeNotifierProvider(create: (_) => ResourceProvider()),
        ChangeNotifierProvider(create: (_) => AgriculturalProvider()),
        ChangeNotifierProvider(create: (_) => AdminProvider()),
        Provider(create: (_) => databaseService),
      ],
      child: const AAYWAApp(),
    ),
  );
}

class AAYWAApp extends StatelessWidget {
  const AAYWAApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'AAYWA Mobile',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme, // Use new professional theme
      home: Consumer<AuthProvider>(
        builder: (context, auth, _) {
          if (auth.isAuthenticated) {
            return const HomeScreen();
          }
          return const LoginScreen();
        },
      ),
      routes: {
        '/register': (context) => const RegisterScreen(),
      },
    );
  }
}
