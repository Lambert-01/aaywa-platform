import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../config/env.dart';

class ApiService {
  static String get baseUrl => Environment.apiBaseUrl;

  Future<Map<String, String>> _getHeaders() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('token');
    return {
      'Content-Type': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }

  // Authentication
  Future<dynamic> login(String email, String password) async {
    try {
      final url = '$baseUrl/auth/login';
      debugPrint('[API] Login URL: $url'); // Debug
      debugPrint('[API] Login email: $email'); // Debug

      final response = await http.post(
        Uri.parse(url),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'email': email, 'password': password}),
      );

      debugPrint('[API] Response status: ${response.statusCode}'); // Debug
      debugPrint('[API] Response body: ${response.body}'); // Debug

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        final error = jsonDecode(response.body);
        throw Exception(error['message'] ?? 'Login failed');
      }
    } catch (e) {
      debugPrint('[API] Network error: $e'); // Debug
      throw Exception('Network error: $e');
    }
  }

  // Generic GET method
  Future<dynamic> get(String endpoint) async {
    try {
      final url = '$baseUrl$endpoint';
      debugPrint('[API] GET $url');

      // Get token from SharedPreferences for authenticated requests
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('token');

      final headers = {'Content-Type': 'application/json'};
      if (token != null) {
        headers['Authorization'] = 'Bearer $token';
      }

      final response = await http.get(
        Uri.parse(url),
        headers: headers,
      );

      debugPrint('[API] Response status: ${response.statusCode}');

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        final error = jsonDecode(response.body);
        throw Exception(error['message'] ?? 'Request failed');
      }
    } catch (e) {
      debugPrint('[API] GET error: $e');
      throw Exception('Network error: $e');
    }
  }

  // Generic POST method
  Future<dynamic> post(String endpoint, Map<String, dynamic> data) async {
    try {
      final url = '$baseUrl$endpoint';
      debugPrint('[API] POST $url');
      debugPrint('[API] POST data: $data');

      // Get token from SharedPreferences for authenticated requests
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('token');

      final headers = {'Content-Type': 'application/json'};
      if (token != null) {
        headers['Authorization'] = 'Bearer $token';
      }

      final response = await http.post(
        Uri.parse(url),
        headers: headers,
        body: jsonEncode(data),
      );

      debugPrint('[API] Response status: ${response.statusCode}');
      debugPrint('[API] Response body: ${response.body}');

      if (response.statusCode == 200 || response.statusCode == 201) {
        return jsonDecode(response.body);
      } else {
        final error = jsonDecode(response.body);
        throw Exception(error['message'] ?? 'Request failed');
      }
    } catch (e) {
      debugPrint('[API] POST error: $e');
      throw Exception('Network error: $e');
    }
  }

  // Farmers
  Future<List<dynamic>> getFarmers() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/farmers'),
        headers: await _getHeaders(),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return data['farmers'] ?? [];
      } else {
        throw Exception('Failed to load farmers');
      }
    } catch (e) {
      throw Exception('Network error: $e');
    }
  }

  Future<dynamic> createFarmer(Map<String, dynamic> farmerData) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/farmers'),
        headers: await _getHeaders(),
        body: jsonEncode(farmerData),
      );

      if (response.statusCode == 201) {
        return jsonDecode(response.body);
      } else {
        throw Exception('Failed to create farmer');
      }
    } catch (e) {
      throw Exception('Network error: $e');
    }
  }

  // Sales
  Future<List<dynamic>> getSales() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/sales'),
        headers: await _getHeaders(),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return data['sales'] ?? [];
      } else {
        throw Exception('Failed to load sales');
      }
    } catch (e) {
      throw Exception('Network error: $e');
    }
  }

  Future<dynamic> submitSale(Map<String, dynamic> saleData) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/sales'),
        headers: await _getHeaders(),
        body: jsonEncode(saleData),
      );

      if (response.statusCode == 201) {
        return jsonDecode(response.body);
      } else {
        throw Exception('Failed to submit sale');
      }
    } catch (e) {
      throw Exception('Network error: $e');
    }
  }

  // VSLA
  Future<dynamic> getVSLAData(int? groupId) async {
    try {
      final url = groupId != null
          ? '$baseUrl/vsla/groups/$groupId'
          : '$baseUrl/vsla/groups';

      final response = await http.get(
        Uri.parse(url),
        headers: await _getHeaders(),
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        throw Exception('Failed to load VSLA data');
      }
    } catch (e) {
      throw Exception('Network error: $e');
    }
  }

  Future<dynamic> recordVSLATransaction(
      Map<String, dynamic> transactionData) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/vsla/transactions'),
        headers: await _getHeaders(),
        body: jsonEncode(transactionData),
      );

      if (response.statusCode == 201) {
        return jsonDecode(response.body);
      } else {
        throw Exception('Failed to record transaction');
      }
    } catch (e) {
      throw Exception('Network error: $e');
    }
  }

  // Training
  Future<List<dynamic>> getTrainings() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/trainings'),
        headers: await _getHeaders(),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return data['trainings'] ?? [];
      } else {
        throw Exception('Failed to load trainings');
      }
    } catch (e) {
      throw Exception('Network error: $e');
    }
  }

  Future<dynamic> submitAttendance(int trainingId, List<int> farmerIds) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/trainings/$trainingId/attendance'),
        headers: await _getHeaders(),
        body: jsonEncode({'farmer_ids': farmerIds}),
      );

      if (response.statusCode == 201) {
        return jsonDecode(response.body);
      } else {
        throw Exception('Failed to submit attendance');
      }
    } catch (e) {
      throw Exception('Network error: $e');
    }
  }
}
