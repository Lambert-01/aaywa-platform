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
      // Android emulator or physical device
      return const String.fromEnvironment(
        'API_URL',
        defaultValue: 'http://10.0.2.2:5000/api',
      );
    }
  }
}
