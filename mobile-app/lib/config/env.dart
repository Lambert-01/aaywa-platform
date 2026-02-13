class Environment {
  // Detect platform and return appropriate base URL
  static String get apiBaseUrl {
    // For web, use localhost directly
    // For Android emulator, use 10.0.2.2
    // For production, this should be set via environment variables
    const bool isWeb = identical(0, 0.0);

    if (isWeb) {
      return const String.fromEnvironment(
        'API_URL',
        defaultValue: 'http://localhost:5000/api',
      );
    } else {
      // Use your computer's local IP address for physical devices
      // Android emulator can also use this, or 10.0.2.2
      return const String.fromEnvironment(
        'API_URL',
        defaultValue: 'http://192.168.1.88:5000/api',
      );
    }
  }
}
