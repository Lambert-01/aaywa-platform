import 'package:flutter/material.dart';
import '../models/agricultural_verification_models.dart';
import '../services/cache_service.dart';
import '../utils/error_handler.dart';

/// Provider for agricultural verification (crop assessment & quality inspection)
class AgriculturalProvider extends ChangeNotifier {
  List<CropAssessment> _assessments = [];
  List<QualityInspection> _inspections = [];
  bool _isLoading = false;
  String? _error;

  final CacheService _cache = CacheService();

  List<CropAssessment> get assessments => _assessments;
  List<QualityInspection> get inspections => _inspections;
  bool get isLoading => _isLoading;
  String? get error => _error;

  // Get urgent assessments
  List<CropAssessment> get urgentAssessments =>
      _assessments.where((a) => a.requiresUrgentAction).toList();

  // Get assessments by health status
  List<CropAssessment> get criticalCrops =>
      _assessments.where((a) => a.overallHealthScore < 40).toList();

  // Get recent assessments
  List<CropAssessment> get recentAssessments {
    final sorted = List<CropAssessment>.from(_assessments)
      ..sort((a, b) => b.assessmentDate.compareTo(a.assessmentDate));
    return sorted.take(10).toList();
  }

  /// Load crop assessments
  Future<void> loadAssessments({bool forceRefresh = false}) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      if (!forceRefresh) {
        final cached = await _cache.get<List<CropAssessment>>(
          'ag_assessments',
          ttl: CacheTTL.mediumLived,
        );
        if (cached != null) {
          _assessments = cached;
          _isLoading = false;
          notifyListeners();
          return;
        }
      }

      await ErrorHandler.handleApiCall(() async {
        // TODO: Replace with actual database query
        await Future.delayed(const Duration(milliseconds: 800));

        // Mock data
        _assessments = [
          CropAssessment(
            id: 'assess1',
            farmerId: 'farmer1',
            farmerName: 'Jean Claude Mugabo',
            plotId: 'plot1',
            cropType: 'Avocado',
            assessmentDate: DateTime.now().subtract(const Duration(hours: 2)),
            assessedBy: 'current-user-id',
            leafColorScore: 4,
            pestDamageLevel: 3,
            diseasePresence: 4,
            growthStage: GrowthStage.fruiting,
            gpsLatitude: -1.5,
            gpsLongitude: 29.6,
            photoUrls: ['photo1.jpg', 'photo2.jpg'],
            notes:
                'Trees looking healthy overall. Some minor pest activity noticed on lower branches.',
            recommendations: [
              'Apply organic pesticide to affected areas',
              'Monitor closely over next 2 weeks',
              'Ensure adequate watering during dry season',
            ],
            requiresUrgentAction: false,
            syncStatus: 'synced',
          ),
          CropAssessment(
            id: 'assess2',
            farmerId: 'farmer2',
            farmerName: 'Rose Muhumuza',
            cropType: 'Coffee',
            assessmentDate: DateTime.now().subtract(const Duration(days: 1)),
            assessedBy: 'current-user-id',
            leafColorScore: 2,
            pestDamageLevel: 2,
            diseasePresence: 1,
            growthStage: GrowthStage.vegetative,
            gpsLatitude: -1.52,
            gpsLongitude: 29.58,
            notes: 'Coffee leaf rust detected. Immediate treatment required.',
            recommendations: [
              'Apply fungicide immediately',
              'Remove infected leaves',
              'Improve air circulation between plants',
              'Schedule follow-up visit in 1 week',
            ],
            requiresUrgentAction: true,
            syncStatus: 'pending',
          ),
        ];

        _cache.set('ag_assessments', _assessments);
      });
    } catch (e) {
      _error = ErrorHandler.getUserMessage(e);
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Load quality inspections
  Future<void> loadInspections({bool forceRefresh = false}) async {
    try {
      if (!forceRefresh) {
        final cached = await _cache.get<List<QualityInspection>>(
          'ag_inspections',
          ttl: CacheTTL.mediumLived,
        );
        if (cached != null) {
          _inspections = cached;
          notifyListeners();
          return;
        }
      }

      await ErrorHandler.handleApiCall(() async {
        // TODO: Replace with actual database query
        await Future.delayed(const Duration(milliseconds: 500));

        // Mock data
        _inspections = [
          QualityInspection(
            id: 'inspect1',
            inspectionType: 'harvest',
            farmerId: 'farmer1',
            farmerName: 'Jean Claude Mugabo',
            inspectorId: 'current-user-id',
            inspectionDate: DateTime.now().subtract(const Duration(hours: 3)),
            checklistItems: [
              ChecklistItem(
                id: 'item1',
                description: 'Produce size meets minimum requirements',
                status: 'pass',
              ),
              ChecklistItem(
                id: 'item2',
                description: 'Color/ripeness appropriate for harvest',
                status: 'pass',
              ),
              ChecklistItem(
                id: 'item3',
                description: 'No visible blemishes or damage',
                status: 'fail',
                notes: 'Some fruits show minor bruising',
              ),
              ChecklistItem(
                id: 'item4',
                description: 'Proper handling during harvest',
                status: 'pass',
              ),
            ],
            overallScore: 75.0,
            grade: 'B',
            gpsLatitude: -1.5,
            gpsLongitude: 29.6,
            actionItems: [
              'Train on gentle harvesting techniques',
              'Provide soft collection containers',
            ],
            syncStatus: 'synced',
          ),
        ];

        _cache.set('ag_inspections', _inspections);
      });
      notifyListeners();
    } catch (e) {
      _error = ErrorHandler.getUserMessage(e);
      notifyListeners();
    }
  }

  /// Save crop assessment
  Future<void> saveAssessment(CropAssessment assessment) async {
    try {
      // TODO: Save to local database with sync queue
      _assessments.insert(0, assessment);
      _cache.set('ag_assessments', _assessments); // Update cache
      notifyListeners();
    } catch (e) {
      throw Exception('Failed to save assessment: $e');
    }
  }

  /// Save quality inspection
  Future<void> saveInspection(QualityInspection inspection) async {
    try {
      // TODO: Save to local database with sync queue
      _inspections.insert(0, inspection);
      _cache.set('ag_inspections', _inspections); // Update cache
      notifyListeners();
    } catch (e) {
      throw Exception('Failed to save inspection: $e');
    }
  }

  /// Refresh all data
  Future<void> refresh() async {
    await Future.wait([
      loadAssessments(forceRefresh: true),
      loadInspections(forceRefresh: true),
    ]);
  }
}
