import 'package:geolocator/geolocator.dart';
import 'package:latlong2/latlong.dart';
import 'dart:async';

/// Service for high-precision GPS operations
class PrecisionGPSService {
  static const double _accuracyThreshold = 10.0; // meters
  static const int _sampleCount = 5;

  /// Check if location services are enabled and permissions granted
  Future<bool> checkPermissions() async {
    bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      return false;
    }

    LocationPermission permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        return false;
      }
    }

    if (permission == LocationPermission.deniedForever) {
      return false;
    }

    return true;
  }

  /// Get high-accuracy location with retry logic
  Future<Position?> getHighAccuracyLocation({
    Duration timeout = const Duration(seconds: 15),
  }) async {
    try {
      final position = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.best,
        timeLimit: timeout,
      );

      // Check if accuracy is acceptable
      if (position.accuracy <= _accuracyThreshold) {
        return position;
      }

      // If accuracy is poor, try again
      await Future.delayed(const Duration(seconds: 2));
      return await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.best,
        timeLimit: timeout,
      );
    } catch (e) {
      return null;
    }
  }

  /// Get averaged high-precision location by sampling multiple times
  Future<Position?> getAveragedLocation({
    int samples = _sampleCount,
    Duration delayBetweenSamples = const Duration(milliseconds: 500),
  }) async {
    final positions = <Position>[];

    for (int i = 0; i < samples; i++) {
      final pos = await getHighAccuracyLocation();
      if (pos != null) {
        positions.add(pos);
      }

      if (i < samples - 1) {
        await Future.delayed(delayBetweenSamples);
      }
    }

    if (positions.isEmpty) return null;

    // Calculate average position
    final avgLat = positions.map((p) => p.latitude).reduce((a, b) => a + b) /
        positions.length;
    final avgLon = positions.map((p) => p.longitude).reduce((a, b) => a + b) /
        positions.length;
    final avgAcc = positions.map((p) => p.accuracy).reduce((a, b) => a + b) /
        positions.length;

    return Position(
      latitude: avgLat,
      longitude: avgLon,
      timestamp: DateTime.now(),
      accuracy: avgAcc,
      altitude: positions.first.altitude,
      altitudeAccuracy: positions.first.altitudeAccuracy,
      heading: positions.first.heading,
      headingAccuracy: positions.first.headingAccuracy,
      speed: positions.first.speed,
      speedAccuracy: positions.first.speedAccuracy,
    );
  }

  /// Stream high-accuracy position updates for live tracking
  Stream<Position> trackMovement() {
    return Geolocator.getPositionStream(
      locationSettings: const LocationSettings(
        accuracy: LocationAccuracy.best,
        distanceFilter: 2, // Update every 2 meters
      ),
    );
  }

  /// Calculate area of polygon using Shoelace formula
  /// Returns area in square meters
  double calculatePolygonArea(List<LatLng> points) {
    if (points.length < 3) return 0.0;

    double area = 0.0;
    final int n = points.length;

    for (int i = 0; i < n; i++) {
      final j = (i + 1) % n;
      area += points[i].longitude * points[j].latitude;
      area -= points[j].longitude * points[i].latitude;
    }

    area = area.abs() / 2.0;

    // Convert from degrees to square meters (approximate)
    // At equator: 1 degree ≈ 111,320 meters
    // This is a rough approximation; for precise calculations, use more complex formulas
    const double metersPerDegree = 111320.0;
    area *= metersPerDegree * metersPerDegree;

    return area;
  }

  /// Calculate area in hectares
  double calculateAreaInHectares(List<LatLng> points) {
    final areaM2 = calculatePolygonArea(points);
    return areaM2 / 10000.0; // 1 hectare = 10,000 m²
  }

  /// Calculate area in acres
  double calculateAreaInAcres(List<LatLng> points) {
    final areaM2 = calculatePolygonArea(points);
    return areaM2 / 4046.86; // 1 acre ≈ 4,046.86 m²
  }

  /// Calculate perimeter of polygon in meters
  double calculatePerimeter(List<LatLng> points) {
    if (points.length < 2) return 0.0;

    double perimeter = 0.0;
    const Distance distance = Distance();

    for (int i = 0; i < points.length; i++) {
      final j = (i + 1) % points.length;
      perimeter += distance.as(
        LengthUnit.Meter,
        points[i],
        points[j],
      );
    }

    return perimeter;
  }

  /// Calculate distance between two points in meters
  double calculateDistance(LatLng point1, LatLng point2) {
    const Distance distance = Distance();
    return distance.as(LengthUnit.Meter, point1, point2);
  }

  /// Get center point of polygon
  LatLng getCenterPoint(List<LatLng> points) {
    if (points.isEmpty) return const LatLng(0, 0);

    double latitude = 0.0;
    double longitude = 0.0;

    for (final point in points) {
      latitude += point.latitude;
      longitude += point.longitude;
    }

    return LatLng(
      latitude / points.length,
      longitude / points.length,
    );
  }

  /// Check if a point is inside a polygon
  bool isPointInPolygon(LatLng point, List<LatLng> polygon) {
    if (polygon.length < 3) return false;

    bool inside = false;
    final int n = polygon.length;

    for (int i = 0, j = n - 1; i < n; j = i++) {
      final xi = polygon[i].latitude;
      final yi = polygon[i].longitude;
      final xj = polygon[j].latitude;
      final yj = polygon[j].longitude;

      final intersect = ((yi > point.longitude) != (yj > point.longitude)) &&
          (point.latitude <
              (xj - xi) * (point.longitude - yi) / (yj - yi) + xi);

      if (intersect) inside = !inside;
    }

    return inside;
  }

  /// Format accuracy for display
  String formatAccuracy(double? accuracy) {
    if (accuracy == null) return 'Unknown';
    if (accuracy < 5) return 'Excellent (±${accuracy.toStringAsFixed(1)}m)';
    if (accuracy < 10) return 'Good (±${accuracy.toStringAsFixed(1)}m)';
    if (accuracy < 20) return 'Fair (±${accuracy.toStringAsFixed(1)}m)';
    return 'Poor (±${accuracy.toStringAsFixed(1)}m)';
  }

  /// Format area for display
  String formatArea(double hectares) {
    if (hectares < 0.01) {
      return '${(hectares * 10000).toStringAsFixed(0)} m²';
    } else if (hectares < 1) {
      return '${(hectares * 10000).toStringAsFixed(0)} m² (${hectares.toStringAsFixed(3)} ha)';
    } else {
      return '${hectares.toStringAsFixed(2)} ha';
    }
  }

  /// Check if plot area qualifies for programs (minimum area requirement)
  bool meetsMinimumAreaRequirement(double hectares,
      {double minHectares = 0.25}) {
    return hectares >= minHectares;
  }
}
