import 'package:flutter/material.dart';
import '../models/resource_models.dart';

/// Provider for managing resource inventory and allocations
class ResourceProvider extends ChangeNotifier {
  List<ResourceInventoryItem> _inventory = [];
  List<ResourceAllocation> _allocations = [];
  ResourceSummary? _summary;
  bool _isLoading = false;
  String? _error;

  List<ResourceInventoryItem> get inventory => _inventory;
  List<ResourceAllocation> get allocations => _allocations;
  ResourceSummary? get summary => _summary;
  bool get isLoading => _isLoading;
  String? get error => _error;

  // Get low stock items
  List<ResourceInventoryItem> get lowStockItems =>
      _inventory.where((item) => item.isLowStock).toList();

  // Get out of stock items
  List<ResourceInventoryItem> get outOfStockItems =>
      _inventory.where((item) => item.isOutOfStock).toList();

  // Get today's allocations
  List<ResourceAllocation> get todaysAllocations {
    final today = DateTime.now();
    return _allocations.where((alloc) {
      return alloc.allocationDate.year == today.year &&
          alloc.allocationDate.month == today.month &&
          alloc.allocationDate.day == today.day;
    }).toList();
  }

  // Get pending sync allocations
  List<ResourceAllocation> get pendingSyncAllocations =>
      _allocations.where((alloc) => alloc.hasPendingSync).toList();

  /// Load inventory from database/API
  Future<void> loadInventory() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      // TODO: Replace with actual database query
      await Future.delayed(const Duration(seconds: 1));

      // Mock data for now
      _inventory = [
        ResourceInventoryItem(
          id: 'res1',
          resourceType: 'training_material',
          resourceName: 'Avocado Pruning Manual',
          currentQuantity: 45,
          unit: 'pieces',
          minimumThreshold: 20,
          location: 'Musanze Office',
          lastRestocked: DateTime.now().subtract(const Duration(days: 15)),
        ),
        ResourceInventoryItem(
          id: 'res2',
          resourceType: 'training_material',
          resourceName: 'Organic Fertilizer Guide',
          currentQuantity: 12,
          unit: 'pieces',
          minimumThreshold: 15,
          location: 'Musanze Office',
          lastRestocked: DateTime.now().subtract(const Duration(days: 30)),
        ),
        ResourceInventoryItem(
          id: 'res3',
          resourceType: 'input_supply',
          resourceName: 'Compost Starter Mix',
          currentQuantity: 8,
          unit: 'bags',
          minimumThreshold: 10,
          location: 'Warehouse A',
          lastRestocked: DateTime.now().subtract(const Duration(days: 7)),
        ),
        ResourceInventoryItem(
          id: 'res4',
          resourceType: 'input_supply',
          resourceName: 'Organic Pesticide (Neem)',
          currentQuantity: 25,
          unit: 'liters',
          minimumThreshold: 10,
          location: 'Warehouse A',
          lastRestocked: DateTime.now().subtract(const Duration(days: 5)),
        ),
        ResourceInventoryItem(
          id: 'res5',
          resourceType: 'equipment',
          resourceName: 'Collection Bags',
          currentQuantity: 0,
          unit: 'pieces',
          minimumThreshold: 50,
          location: 'Musanze Office',
          lastRestocked: DateTime.now().subtract(const Duration(days: 60)),
        ),
        ResourceInventoryItem(
          id: 'res6',
          resourceType: 'equipment',
          resourceName: 'Pruning Shears',
          currentQuantity: 15,
          unit: 'pieces',
          minimumThreshold: 10,
          location: 'Equipment Storage',
          lastRestocked: DateTime.now().subtract(const Duration(days: 90)),
        ),
      ];

      _updateSummary();
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _error = 'Failed to load inventory: $e';
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Load allocation history
  Future<void> loadAllocations() async {
    try {
      // TODO: Replace with actual database query
      await Future.delayed(const Duration(milliseconds: 500));

      // Mock data
      _allocations = [
        ResourceAllocation(
          id: 'alloc1',
          resourceId: 'res1',
          resourceName: 'Avocado Pruning Manual',
          allocatedBy: 'current-user-id',
          allocatedToId: 'farmer1',
          allocatedToName: 'Jean Claude Mugabo',
          quantity: 2,
          unit: 'pieces',
          allocationDate: DateTime.now(),
          gpsLatitude: -1.5,
          gpsLongitude: 29.6,
          syncStatus: 'synced',
        ),
        ResourceAllocation(
          id: 'alloc2',
          resourceId: 'res3',
          resourceName: 'Compost Starter Mix',
          allocatedBy: 'current-user-id',
          allocatedToId: 'farmer2',
          allocatedToName: 'Rose Muhumuza',
          quantity: 1,
          unit: 'bags',
          allocationDate: DateTime.now().subtract(const Duration(hours: 2)),
          gpsLatitude: -1.52,
          gpsLongitude: 29.58,
          syncStatus: 'pending',
        ),
      ];

      _updateSummary();
      notifyListeners();
    } catch (e) {
      _error = 'Failed to load allocations: $e';
      notifyListeners();
    }
  }

  /// Record a new resource allocation
  Future<void> allocateResource(ResourceAllocation allocation) async {
    try {
      // TODO: Save to local database with sync queue
      _allocations.insert(0, allocation);

      // Update inventory quantity
      final itemIndex =
          _inventory.indexWhere((item) => item.id == allocation.resourceId);
      if (itemIndex != -1) {
        final updatedItem = _inventory[itemIndex].copyWith(
          currentQuantity:
              _inventory[itemIndex].currentQuantity - allocation.quantity,
        );
        _inventory[itemIndex] = updatedItem;
      }

      _updateSummary();
      notifyListeners();
    } catch (e) {
      throw Exception('Failed to allocate resource: $e');
    }
  }

  /// Request supply restocking
  Future<void> requestRestock(
      String resourceId, int quantity, String notes) async {
    try {
      // TODO: Save restock request to database and queue for sync
      await Future.delayed(const Duration(milliseconds: 500));

      // Mock success
      notifyListeners();
    } catch (e) {
      throw Exception('Failed to request restock: $e');
    }
  }

  /// Update summary statistics
  void _updateSummary() {
    _summary = ResourceSummary(
      totalItems: _inventory.length,
      lowStockItems: lowStockItems.length,
      outOfStockItems: outOfStockItems.length,
      distributionsToday: todaysAllocations.length,
      pendingSyncCount: pendingSyncAllocations.length,
    );
  }

  /// Refresh all data
  Future<void> refresh() async {
    await Future.wait([
      loadInventory(),
      loadAllocations(),
    ]);
  }
}
