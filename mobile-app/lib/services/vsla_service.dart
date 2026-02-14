import '../services/api_service.dart';

class VSLAService {
  final ApiService _apiService = ApiService();

  // Fetch VSLA summary for the logged-in member
  Future<Map<String, dynamic>> getMemberSummary() async {
    try {
      final response = await _apiService.get('/vsla/summary');
      return response as Map<String, dynamic>;
    } catch (e) {
      throw Exception('Failed to load VSLA summary: $e');
    }
  }

  // Record a meeting attendance (if officer)
  Future<void> recordAttendance(
      String vslaId, String farmerId, String status, String date) async {
    await _apiService.post('/vsla/$vslaId/attendance', {
      'farmer_id': farmerId,
      'status': status,
      'date': date,
    });
  }

  // Request a loan (Future feature)
  Future<void> requestLoan(String vslaId, double amount, String date) async {
    // innovative credit scoring check here
  }
}
