import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'services/database_service.dart';
import 'providers/auth_provider.dart';
import 'providers/dashboard_provider.dart';
import 'providers/sync_provider.dart';
import 'screens/auth/login_screen.dart';
import 'screens/auth/register_screen.dart';
import 'screens/home/home_screen.dart';
import 'theme/app_theme.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Initialize database
  final databaseService = DatabaseService();

  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => DashboardProvider()),
        ChangeNotifierProvider(create: (_) => SyncProvider(databaseService)),
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
