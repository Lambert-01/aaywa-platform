/// Models for crop health assessment and quality inspection

// Growth stages for different crops
enum GrowthStage {
  seedling,
  vegetative,
  flowering,
  fruiting,
  mature,
  harvest;

  String get displayName {
    switch (this) {
      case GrowthStage.seedling:
        return 'Seedling';
      case GrowthStage.vegetative:
        return 'Vegetative';
      case GrowthStage.flowering:
        return 'Flowering';
      case GrowthStage.fruiting:
        return 'Fruiting';
      case GrowthStage.mature:
        return 'Mature';
      case GrowthStage.harvest:
        return 'Harvest Ready';
    }
  }
}

/// Model for crop health assessment
class CropAssessment {
  final String id;
  final String farmerId;
  final String farmerName;
  final String? plotId;
  final String cropType;
  final DateTime assessmentDate;
  final String assessedBy;

  // Health Indicators (1-5 scale)
  final int leafColorScore; // 1=Poor, 5=Excellent
  final int pestDamageLevel; // 1=Severe, 5=None
  final int diseasePresence; // 1=Severe, 5=None
  final GrowthStage growthStage;

  // Location and documentation
  final double? gpsLatitude;
  final double? gpsLongitude;
  final List<String> photoUrls;
  final String? notes;

  // Recommendations
  final List<String> recommendations;
  final bool requiresUrgentAction;
  final String syncStatus;

  CropAssessment({
    required this.id,
    required this.farmerId,
    required this.farmerName,
    this.plotId,
    required this.cropType,
    required this.assessmentDate,
    required this.assessedBy,
    required this.leafColorScore,
    required this.pestDamageLevel,
    required this.diseasePresence,
    required this.growthStage,
    this.gpsLatitude,
    this.gpsLongitude,
    this.photoUrls = const [],
    this.notes,
    this.recommendations = const [],
    this.requiresUrgentAction = false,
    this.syncStatus = 'pending',
  });

  // Calculate overall health score (0-100)
  double get overallHealthScore {
    final avgScore = (leafColorScore + pestDamageLevel + diseasePresence) / 3;
    return (avgScore / 5 * 100).clamp(0, 100);
  }

  // Health status based on score
  String get healthStatus {
    final score = overallHealthScore;
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    if (score >= 20) return 'Poor';
    return 'Critical';
  }

  bool get hasLocation => gpsLatitude != null && gpsLongitude != null;
  bool get hasPhotos => photoUrls.isNotEmpty;
  bool get isSynced => syncStatus == 'synced';

  factory CropAssessment.fromJson(Map<String, dynamic> json) {
    return CropAssessment(
      id: json['id'] as String,
      farmerId: json['farmerId'] as String,
      farmerName: json['farmerName'] as String,
      plotId: json['plotId'] as String?,
      cropType: json['cropType'] as String,
      assessmentDate: DateTime.parse(json['assessmentDate'] as String),
      assessedBy: json['assessedBy'] as String,
      leafColorScore: json['leafColorScore'] as int,
      pestDamageLevel: json['pestDamageLevel'] as int,
      diseasePresence: json['diseasePresence'] as int,
      growthStage: GrowthStage.values.byName(json['growthStage'] as String),
      gpsLatitude: json['gpsLatitude'] as double?,
      gpsLongitude: json['gpsLongitude'] as double?,
      photoUrls: List<String>.from(json['photoUrls'] as List? ?? []),
      notes: json['notes'] as String?,
      recommendations:
          List<String>.from(json['recommendations'] as List? ?? []),
      requiresUrgentAction: json['requiresUrgentAction'] as bool? ?? false,
      syncStatus: json['syncStatus'] as String? ?? 'pending',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'farmerId': farmerId,
      'farmerName': farmerName,
      'plotId': plotId,
      'cropType': cropType,
      'assessmentDate': assessmentDate.toIso8601String(),
      'assessedBy': assessedBy,
      'leafColorScore': leafColorScore,
      'pestDamageLevel': pestDamageLevel,
      'diseasePresence': diseasePresence,
      'growthStage': growthStage.name,
      'gpsLatitude': gpsLatitude,
      'gpsLongitude': gpsLongitude,
      'photoUrls': photoUrls,
      'notes': notes,
      'recommendations': recommendations,
      'requiresUrgentAction': requiresUrgentAction,
      'syncStatus': syncStatus,
    };
  }

  CropAssessment copyWith({
    String? id,
    String? farmerId,
    String? farmerName,
    String? plotId,
    String? cropType,
    DateTime? assessmentDate,
    String? assessedBy,
    int? leafColorScore,
    int? pestDamageLevel,
    int? diseasePresence,
    GrowthStage? growthStage,
    double? gpsLatitude,
    double? gpsLongitude,
    List<String>? photoUrls,
    String? notes,
    List<String>? recommendations,
    bool? requiresUrgentAction,
    String? syncStatus,
  }) {
    return CropAssessment(
      id: id ?? this.id,
      farmerId: farmerId ?? this.farmerId,
      farmerName: farmerName ?? this.farmerName,
      plotId: plotId ?? this.plotId,
      cropType: cropType ?? this.cropType,
      assessmentDate: assessmentDate ?? this.assessmentDate,
      assessedBy: assessedBy ?? this.assessedBy,
      leafColorScore: leafColorScore ?? this.leafColorScore,
      pestDamageLevel: pestDamageLevel ?? this.pestDamageLevel,
      diseasePresence: diseasePresence ?? this.diseasePresence,
      growthStage: growthStage ?? this.growthStage,
      gpsLatitude: gpsLatitude ?? this.gpsLatitude,
      gpsLongitude: gpsLongitude ?? this.gpsLongitude,
      photoUrls: photoUrls ?? this.photoUrls,
      notes: notes ?? this.notes,
      recommendations: recommendations ?? this.recommendations,
      requiresUrgentAction: requiresUrgentAction ?? this.requiresUrgentAction,
      syncStatus: syncStatus ?? this.syncStatus,
    );
  }
}

/// Quality inspection checklist item
class ChecklistItem {
  final String id;
  final String description;
  final String? status; // 'pass', 'fail', 'na'
  final String? notes;

  ChecklistItem({
    required this.id,
    required this.description,
    this.status,
    this.notes,
  });

  bool get isPassed => status == 'pass';
  bool get isFailed => status == 'fail';
  bool get isNotApplicable => status == 'na';
  bool get isAnswered => status != null;

  factory ChecklistItem.fromJson(Map<String, dynamic> json) {
    return ChecklistItem(
      id: json['id'] as String,
      description: json['description'] as String,
      status: json['status'] as String?,
      notes: json['notes'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'description': description,
      'status': status,
      'notes': notes,
    };
  }

  ChecklistItem copyWith({
    String? id,
    String? description,
    String? status,
    String? notes,
  }) {
    return ChecklistItem(
      id: id ?? this.id,
      description: description ?? this.description,
      status: status ?? this.status,
      notes: notes ?? this.notes,
    );
  }
}

/// Model for quality inspection
class QualityInspection {
  final String id;
  final String
      inspectionType; // 'harvest', 'input_application', 'training_compliance'
  final String farmerId;
  final String farmerName;
  final String inspectorId;
  final DateTime inspectionDate;

  // Checklist
  final List<ChecklistItem> checklistItems;

  // Overall results
  final double? overallScore; // 0-100
  final String? grade; // 'A', 'B', 'C', 'D', 'F'

  // Documentation
  final double? gpsLatitude;
  final double? gpsLongitude;
  final List<String> photoUrls;
  final String? notes;
  final List<String> actionItems;

  final String syncStatus;

  QualityInspection({
    required this.id,
    required this.inspectionType,
    required this.farmerId,
    required this.farmerName,
    required this.inspectorId,
    required this.inspectionDate,
    required this.checklistItems,
    this.overallScore,
    this.grade,
    this.gpsLatitude,
    this.gpsLongitude,
    this.photoUrls = const [],
    this.notes,
    this.actionItems = const [],
    this.syncStatus = 'pending',
  });

  // Calculate pass rate
  double get passRate {
    final answered = checklistItems
        .where((item) => item.isAnswered && !item.isNotApplicable);
    if (answered.isEmpty) return 0;
    final passed = answered.where((item) => item.isPassed).length;
    return (passed / answered.length * 100).clamp(0, 100);
  }

  // Count statistics
  int get totalItems => checklistItems.length;
  int get passedItems => checklistItems.where((item) => item.isPassed).length;
  int get failedItems => checklistItems.where((item) => item.isFailed).length;
  int get naItems =>
      checklistItems.where((item) => item.isNotApplicable).length;

  bool get hasLocation => gpsLatitude != null && gpsLongitude != null;
  bool get hasPhotos => photoUrls.isNotEmpty;
  bool get isSynced => syncStatus == 'synced';

  factory QualityInspection.fromJson(Map<String, dynamic> json) {
    return QualityInspection(
      id: json['id'] as String,
      inspectionType: json['inspectionType'] as String,
      farmerId: json['farmerId'] as String,
      farmerName: json['farmerName'] as String,
      inspectorId: json['inspectorId'] as String,
      inspectionDate: DateTime.parse(json['inspectionDate'] as String),
      checklistItems: (json['checklistItems'] as List?)
              ?.map((item) =>
                  ChecklistItem.fromJson(item as Map<String, dynamic>))
              .toList() ??
          [],
      overallScore: json['overallScore'] as double?,
      grade: json['grade'] as String?,
      gpsLatitude: json['gpsLatitude'] as double?,
      gpsLongitude: json['gpsLongitude'] as double?,
      photoUrls: List<String>.from(json['photoUrls'] as List? ?? []),
      notes: json['notes'] as String?,
      actionItems: List<String>.from(json['actionItems'] as List? ?? []),
      syncStatus: json['syncStatus'] as String? ?? 'pending',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'inspectionType': inspectionType,
      'farmerId': farmerId,
      'farmerName': farmerName,
      'inspectorId': inspectorId,
      'inspectionDate': inspectionDate.toIso8601String(),
      'checklistItems': checklistItems.map((item) => item.toJson()).toList(),
      'overallScore': overallScore,
      'grade': grade,
      'gpsLatitude': gpsLatitude,
      'gpsLongitude': gpsLongitude,
      'photoUrls': photoUrls,
      'notes': notes,
      'actionItems': actionItems,
      'syncStatus': syncStatus,
    };
  }

  QualityInspection copyWith({
    String? id,
    String? inspectionType,
    String? farmerId,
    String? farmerName,
    String? inspectorId,
    DateTime? inspectionDate,
    List<ChecklistItem>? checklistItems,
    double? overallScore,
    String? grade,
    double? gpsLatitude,
    double? gpsLongitude,
    List<String>? photoUrls,
    String? notes,
    List<String>? actionItems,
    String? syncStatus,
  }) {
    return QualityInspection(
      id: id ?? this.id,
      inspectionType: inspectionType ?? this.inspectionType,
      farmerId: farmerId ?? this.farmerId,
      farmerName: farmerName ?? this.farmerName,
      inspectorId: inspectorId ?? this.inspectorId,
      inspectionDate: inspectionDate ?? this.inspectionDate,
      checklistItems: checklistItems ?? this.checklistItems,
      overallScore: overallScore ?? this.overallScore,
      grade: grade ?? this.grade,
      gpsLatitude: gpsLatitude ?? this.gpsLatitude,
      gpsLongitude: gpsLongitude ?? this.gpsLongitude,
      photoUrls: photoUrls ?? this.photoUrls,
      notes: notes ?? this.notes,
      actionItems: actionItems ?? this.actionItems,
      syncStatus: syncStatus ?? this.syncStatus,
    );
  }
}
