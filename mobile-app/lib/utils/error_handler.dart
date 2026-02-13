import 'dart:async';
import 'dart:io';
import 'package:flutter/foundation.dart';

/// User-friendly exception with localized messages
class UserFriendlyException implements Exception {
  final String message;
  final Exception? originalException;

  UserFriendlyException(this.message, {this.originalException});

  @override
  String toString() => message;
}

/// Centralized error handler for the application
class ErrorHandler {
  /// Handle API calls with automatic retry and user-friendly error messages
  static Future<T> handleApiCall<T>(
    Future<T> Function() call, {
    int maxRetries = 3,
    Duration retryDelay = const Duration(seconds: 2),
    bool showUserMessage = true,
  }) async {
    int attempts = 0;

    while (attempts < maxRetries) {
      try {
        return await call();
      } on SocketException catch (e) {
        if (attempts >= maxRetries - 1) {
          throw UserFriendlyException(
            'No internet connection. Please check your network and try again.',
            originalException: e,
          );
        }
      } on TimeoutException catch (e) {
        if (attempts >= maxRetries - 1) {
          throw UserFriendlyException(
            'Request timed out. Please try again.',
            originalException: e,
          );
        }
      } on HttpException catch (e) {
        throw UserFriendlyException(
          'Network error occurred. Please try again.',
          originalException: e,
        );
      } catch (e) {
        if (attempts >= maxRetries - 1) {
          debugPrint('API Error: $e');
          throw UserFriendlyException(
            'Something went wrong. Please try again later.',
            originalException: e is Exception ? e : null,
          );
        }
      }

      attempts++;
      if (attempts < maxRetries) {
        // Exponential backoff
        await Future.delayed(retryDelay * attempts);
      }
    }

    throw UserFriendlyException('Maximum retry attempts exceeded');
  }

  /// Get user-friendly error message from exception
  static String getUserMessage(dynamic error) {
    if (error is UserFriendlyException) {
      return error.message;
    } else if (error is SocketException) {
      return 'No internet connection. Please check your network.';
    } else if (error is TimeoutException) {
      return 'Request timed out. Please try again.';
    } else if (error is HttpException) {
      return 'Network error occurred. Please check your connection.';
    } else if (error is FormatException) {
      return 'Invalid data format received. Please contact support.';
    } else {
      return 'An unexpected error occurred. Please try again.';
    }
  }

  /// Log error for debugging
  static void logError(String context, dynamic error,
      [StackTrace? stackTrace]) {
    debugPrint('[$context] Error: $error');
    if (stackTrace != null) {
      debugPrint('Stack trace: $stackTrace');
    }
  }

  /// Handle sync errors specifically
  static Future<T?> handleSyncOperation<T>(
    Future<T> Function() operation,
    String operationName,
  ) async {
    try {
      return await operation();
    } on SocketException {
      debugPrint(
          'Sync [$operationName]: No internet connection - will retry later');
      return null;
    } on TimeoutException {
      debugPrint('Sync [$operationName]: Timeout - will retry later');
      return null;
    } catch (e, stackTrace) {
      logError('Sync [$operationName]', e, stackTrace);
      return null;
    }
  }
}

/// Retry helper with exponential backoff
class RetryHelper {
  static Future<T> withExponentialBackoff<T>(
    Future<T> Function() operation, {
    int maxAttempts = 3,
    Duration initialDelay = const Duration(seconds: 1),
    double backoffMultiplier = 2.0,
  }) async {
    int attempt = 0;
    Duration delay = initialDelay;

    while (true) {
      try {
        return await operation();
      } catch (e) {
        attempt++;
        if (attempt >= maxAttempts) {
          rethrow;
        }

        debugPrint(
            'Retry attempt $attempt/$maxAttempts after ${delay.inSeconds}s');
        await Future.delayed(delay);
        delay = Duration(
            milliseconds: (delay.inMilliseconds * backoffMultiplier).round());
      }
    }
  }
}

/// Network connectivity helper
class ConnectivityHelper {
  /// Check if device has internet connectivity
  static Future<bool> hasConnectivity() async {
    try {
      final result = await InternetAddress.lookup('google.com');
      return result.isNotEmpty && result[0].rawAddress.isNotEmpty;
    } on SocketException catch (_) {
      return false;
    }
  }

  /// Wait for connectivity before executing operation
  static Future<T?> waitForConnectivity<T>(
    Future<T> Function() operation, {
    Duration timeout = const Duration(seconds: 30),
    Duration checkInterval = const Duration(seconds: 2),
  }) async {
    final startTime = DateTime.now();

    while (DateTime.now().difference(startTime) < timeout) {
      if (await hasConnectivity()) {
        return await operation();
      }
      await Future.delayed(checkInterval);
    }

    throw TimeoutException('Connectivity timeout');
  }
}
