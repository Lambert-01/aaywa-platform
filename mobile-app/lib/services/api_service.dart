import 'package:flutter/foundation.dart';
import 'api/api_client.dart';

class ApiService {
  final _client = ApiClient().client;

  // Authentication
  Future<dynamic> login(String email, String password) async {
    try {
      final response = await _client.post(
        '/auth/login-mobile',
        data: {'email': email, 'password': password},
      );
      return response.data;
    } catch (e) {
      debugPrint('[API] Login error: $e');
      rethrow;
    }
  }

  // Generic methods forwarding to Dio client
  Future<dynamic> get(String endpoint) async {
    try {
      final response = await _client.get(endpoint);
      return response.data;
    } catch (e) {
      debugPrint('[API] GET error: $e');
      rethrow;
    }
  }

  Future<dynamic> post(String endpoint, Map<String, dynamic> data) async {
    try {
      final response = await _client.post(endpoint, data: data);
      return response.data;
    } catch (e) {
      debugPrint('[API] POST error: $e');
      rethrow;
    }
  }

  Future<dynamic> put(String endpoint, Map<String, dynamic> data) async {
    try {
      final response = await _client.put(endpoint, data: data);
      return response.data;
    } catch (e) {
      debugPrint('[API] PUT error: $e');
      rethrow;
    }
  }

  // Farmers
  Future<List<dynamic>> getFarmers() async {
    final response = await _client.get('/farmers');
    return response.data['farmers'] ?? [];
  }

  Future<dynamic> createFarmer(Map<String, dynamic> farmerData) async {
    final response = await _client.post('/farmers', data: farmerData);
    return response.data;
  }

  // Sales
  Future<List<dynamic>> getSales() async {
    final response = await _client.get('/sales');
    return response.data['sales'] ?? [];
  }

  Future<dynamic> submitSale(Map<String, dynamic> saleData) async {
    final response = await _client.post('/sales', data: saleData);
    return response.data;
  }

  // VSLA
  Future<dynamic> getVSLAData(int? groupId) async {
    final url = groupId != null ? '/vsla/groups/$groupId' : '/vsla/groups';
    final response = await _client.get(url);
    return response.data;
  }

  Future<dynamic> recordVSLATransaction(
      Map<String, dynamic> transactionData) async {
    final response =
        await _client.post('/vsla/transactions', data: transactionData);
    return response.data;
  }

  // Training
  Future<List<dynamic>> getTrainings() async {
    final response = await _client.get('/trainings');
    return response.data['trainings'] ?? [];
  }

  Future<dynamic> submitAttendance(int trainingId, List<int> farmerIds) async {
    final response = await _client.post(
      '/trainings/$trainingId/attendance',
      data: {'farmer_ids': farmerIds},
    );
    return response.data;
  }
}
