/// Models for resource management system
class ResourceInventoryItem {
  final String id;
  final String resourceType; // 'training_material', 'input_supply', 'equipment'
  final String resourceName;
  final int currentQuantity;
  final String unit; // 'pieces', 'kg', 'liters', 'bags'
  final int minimumThreshold;
  final String? location;
  final DateTime? lastRestocked;

  ResourceInventoryItem({
    required this.id,
    required this.resourceType,
    required this.resourceName,
    required this.currentQuantity,
    required this.unit,
    required this.minimumThreshold,
    this.location,
    this.lastRestocked,
  });

  bool get isLowStock => currentQuantity <= minimumThreshold;

  bool get isOutOfStock => currentQuantity == 0;

  factory ResourceInventoryItem.fromJson(Map<String, dynamic> json) {
    return ResourceInventoryItem(
      id: json['id'] as String,
      resourceType: json['resourceType'] as String,
      resourceName: json['resourceName'] as String,
      currentQuantity: json['currentQuantity'] as int,
      unit: json['unit'] as String,
      minimumThreshold: json['minimumThreshold'] as int,
      location: json['location'] as String?,
      lastRestocked: json['lastRestocked'] != null
          ? DateTime.parse(json['lastRestocked'] as String)
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'resourceType': resourceType,
      'resourceName': resourceName,
      'currentQuantity': currentQuantity,
      'unit': unit,
      'minimumThreshold': minimumThreshold,
      'location': location,
      'lastRestocked': lastRestocked?.toIso8601String(),
    };
  }

  ResourceInventoryItem copyWith({
    String? id,
    String? resourceType,
    String? resourceName,
    int? currentQuantity,
    String? unit,
    int? minimumThreshold,
    String? location,
    DateTime? lastRestocked,
  }) {
    return ResourceInventoryItem(
      id: id ?? this.id,
      resourceType: resourceType ?? this.resourceType,
      resourceName: resourceName ?? this.resourceName,
      currentQuantity: currentQuantity ?? this.currentQuantity,
      unit: unit ?? this.unit,
      minimumThreshold: minimumThreshold ?? this.minimumThreshold,
      location: location ?? this.location,
      lastRestocked: lastRestocked ?? this.lastRestocked,
    );
  }
}

/// Model for resource allocation/distribution
class ResourceAllocation {
  final String id;
  final String resourceId;
  final String resourceName;
  final String allocatedBy;
  final String allocatedToId; // farmer or cohort ID
  final String allocatedToName;
  final int quantity;
  final String unit;
  final DateTime allocationDate;
  final double? gpsLatitude;
  final double? gpsLongitude;
  final String? photoUrl;
  final String? signatureData; // Base64 encoded signature
  final String? notes;
  final String syncStatus; // 'pending', 'synced', 'failed'

  ResourceAllocation({
    required this.id,
    required this.resourceId,
    required this.resourceName,
    required this.allocatedBy,
    required this.allocatedToId,
    required this.allocatedToName,
    required this.quantity,
    required this.unit,
    required this.allocationDate,
    this.gpsLatitude,
    this.gpsLongitude,
    this.photoUrl,
    this.signatureData,
    this.notes,
    this.syncStatus = 'pending',
  });

  bool get isSynced => syncStatus == 'synced';

  bool get hasPendingSync => syncStatus == 'pending';

  bool get hasLocation => gpsLatitude != null && gpsLongitude != null;

  factory ResourceAllocation.fromJson(Map<String, dynamic> json) {
    return ResourceAllocation(
      id: json['id'] as String,
      resourceId: json['resourceId'] as String,
      resourceName: json['resourceName'] as String,
      allocatedBy: json['allocatedBy'] as String,
      allocatedToId: json['allocatedToId'] as String,
      allocatedToName: json['allocatedToName'] as String,
      quantity: json['quantity'] as int,
      unit: json['unit'] as String,
      allocationDate: DateTime.parse(json['allocationDate'] as String),
      gpsLatitude: json['gpsLatitude'] as double?,
      gpsLongitude: json['gpsLongitude'] as double?,
      photoUrl: json['photoUrl'] as String?,
      signatureData: json['signatureData'] as String?,
      notes: json['notes'] as String?,
      syncStatus: json['syncStatus'] as String? ?? 'pending',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'resourceId': resourceId,
      'resourceName': resourceName,
      'allocatedBy': allocatedBy,
      'allocatedToId': allocatedToId,
      'allocatedToName': allocatedToName,
      'quantity': quantity,
      'unit': unit,
      'allocationDate': allocationDate.toIso8601String(),
      'gpsLatitude': gpsLatitude,
      'gpsLongitude': gpsLongitude,
      'photoUrl': photoUrl,
      'signatureData': signatureData,
      'notes': notes,
      'syncStatus': syncStatus,
    };
  }

  ResourceAllocation copyWith({
    String? id,
    String? resourceId,
    String? resourceName,
    String? allocatedBy,
    String? allocatedToId,
    String? allocatedToName,
    int? quantity,
    String? unit,
    DateTime? allocationDate,
    double? gpsLatitude,
    double? gpsLongitude,
    String? photoUrl,
    String? signatureData,
    String? notes,
    String? syncStatus,
  }) {
    return ResourceAllocation(
      id: id ?? this.id,
      resourceId: resourceId ?? this.resourceId,
      resourceName: resourceName ?? this.resourceName,
      allocatedBy: allocatedBy ?? this.allocatedBy,
      allocatedToId: allocatedToId ?? this.allocatedToId,
      allocatedToName: allocatedToName ?? this.allocatedToName,
      quantity: quantity ?? this.quantity,
      unit: unit ?? this.unit,
      allocationDate: allocationDate ?? this.allocationDate,
      gpsLatitude: gpsLatitude ?? this.gpsLatitude,
      gpsLongitude: gpsLongitude ?? this.gpsLongitude,
      photoUrl: photoUrl ?? this.photoUrl,
      signatureData: signatureData ?? this.signatureData,
      notes: notes ?? this.notes,
      syncStatus: syncStatus ?? this.syncStatus,
    );
  }
}

/// Summary statistics for resource management
class ResourceSummary {
  final int totalItems;
  final int lowStockItems;
  final int outOfStockItems;
  final int distributionsToday;
  final int pendingSyncCount;

  ResourceSummary({
    required this.totalItems,
    required this.lowStockItems,
    required this.outOfStockItems,
    required this.distributionsToday,
    required this.pendingSyncCount,
  });

  factory ResourceSummary.fromJson(Map<String, dynamic> json) {
    return ResourceSummary(
      totalItems: json['totalItems'] as int,
      lowStockItems: json['lowStockItems'] as int,
      outOfStockItems: json['outOfStockItems'] as int,
      distributionsToday: json['distributionsToday'] as int,
      pendingSyncCount: json['pendingSyncCount'] as int,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'totalItems': totalItems,
      'lowStockItems': lowStockItems,
      'outOfStockItems': outOfStockItems,
      'distributionsToday': distributionsToday,
      'pendingSyncCount': pendingSyncCount,
    };
  }
}
