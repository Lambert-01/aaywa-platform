import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart' as ll;
import 'package:geolocator/geolocator.dart';
import 'package:provider/provider.dart';
import 'dart:async';
import 'dart:math' as math;
import '../../services/database_service.dart';

import '../../theme/design_system.dart';

class FarmMapScreen extends StatefulWidget {
  final String? farmerId;
  final String? farmerName;
  final bool viewOnly;
  final ll.LatLng? initialCenter;
  final List<ll.LatLng>? initialPolygon;

  const FarmMapScreen({
    super.key,
    this.farmerId,
    this.farmerName,
    this.viewOnly = false,
    this.initialCenter,
    this.initialPolygon,
  });

  @override
  State<FarmMapScreen> createState() => _FarmMapScreenState();
}

class _FarmMapScreenState extends State<FarmMapScreen> {
  final MapController _mapController = MapController();
  final List<ll.LatLng> _polygonPoints = [];
  ll.LatLng _currentCenter = const ll.LatLng(-1.9441, 30.0619);

  bool _isRecording = false;
  bool _isDigitizing = false;
  StreamSubscription<Position>? _positionStream;

  // GPS Accuracy tracking
  double? _currentAccuracy;

  // Area calculation
  double _calculatedAreaHa = 0.0;

  // Resource qualification
  static const double _minAreaForPrograms = 0.25; // hectares

  @override
  void initState() {
    super.initState();
    
    debugPrint('[MAP] Initializing - viewOnly: ${widget.viewOnly}');
    debugPrint('[MAP] initialCenter: ${widget.initialCenter}');
    debugPrint('[MAP] initialPolygon length: ${widget.initialPolygon?.length ?? 0}');
    
    // Set initial center if provided
    if (widget.initialCenter != null) {
      _currentCenter = widget.initialCenter!;
      debugPrint('[MAP] Set center to: ${_currentCenter.latitude}, ${_currentCenter.longitude}');
    }
    
    // Set initial polygon if provided
    if (widget.initialPolygon != null && widget.initialPolygon!.isNotEmpty) {
      _polygonPoints.addAll(widget.initialPolygon!);
      _calculateArea();
      debugPrint('[MAP] Loaded ${_polygonPoints.length} polygon points');
    } else if (widget.farmerId != null && !widget.viewOnly) {
      _loadExistingBoundary();
    }
  }

  @override
  void dispose() {
    _positionStream?.cancel();
    _mapController.dispose();
    super.dispose();
  }

  Future<void> _loadExistingBoundary() async {
    final db = Provider.of<DatabaseService>(context, listen: false);
    final coords = await db.getPlotBoundariesByFarmer(widget.farmerId!);

    if (coords.isNotEmpty) {
      setState(() {
        _polygonPoints.addAll(coords
            .map((c) => ll.LatLng(
                c.read<double>('latitude'), c.read<double>('longitude')))
            .toList());
        _calculateArea();
      });

      // Zoom to first point
      Future.delayed(const Duration(milliseconds: 500), () {
        if (mounted && _polygonPoints.isNotEmpty) {
          _mapController.move(_polygonPoints.first, 16);
        }
      });
    }
  }

  /// Calculate area in hectares using Shoelace formula
  void _calculateArea() {
    if (_polygonPoints.length < 3) {
      setState(() => _calculatedAreaHa = 0.0);
      return;
    }

    double area = 0.0;
    for (int i = 0; i < _polygonPoints.length; i++) {
      int j = (i + 1) % _polygonPoints.length;

      // Convert lat/lng to meters (approximate)
      double x1 = _polygonPoints[i].longitude *
          111320 *
          math.cos(_polygonPoints[i].latitude * math.pi / 180);
      double y1 = _polygonPoints[i].latitude * 110540;
      double x2 = _polygonPoints[j].longitude *
          111320 *
          math.cos(_polygonPoints[j].latitude * math.pi / 180);
      double y2 = _polygonPoints[j].latitude * 110540;

      area += (x1 * y2) - (x2 * y1);
    }

    area = area.abs() / 2.0; // m²
    setState(() => _calculatedAreaHa = area / 10000); // Convert to hectares
  }

  void _onMapTap(TapPosition tapPosition, ll.LatLng point) {
    if (!_isDigitizing || widget.viewOnly) return;

    setState(() {
      _polygonPoints.add(point);
      _calculateArea();
    });
  }

  void _undoPoint() {
    if (_polygonPoints.isNotEmpty) {
      setState(() {
        _polygonPoints.removeLast();
        _calculateArea();
      });
    }
  }

  void _toggleRecording() async {
    if (_isRecording) {
      _positionStream?.cancel();
      setState(() => _isRecording = false);
    } else {
      bool serviceEnabled;
      LocationPermission permission;

      serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Location services are disabled')),
          );
        }
        return;
      }

      permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) {
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Location permission denied')),
            );
          }
          return;
        }
      }

      if (permission == LocationPermission.deniedForever) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
                content: Text('Location permissions are permanently denied.')),
          );
        }
        return;
      }

      setState(() {
        _isRecording = true;
        _isDigitizing = false;
      });

      const locationSettings = LocationSettings(
        accuracy: LocationAccuracy.high,
        distanceFilter: 3,
      );

      _positionStream =
          Geolocator.getPositionStream(locationSettings: locationSettings)
              .listen(
        (Position position) {
          final point = ll.LatLng(position.latitude, position.longitude);
          setState(() {
            _polygonPoints.add(point);
            _currentAccuracy = position.accuracy;
            _calculateArea();
          });
          _mapController.move(point, _mapController.camera.zoom);
        },
        onError: (e) {
          if (mounted) {
            setState(() => _isRecording = false);
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(content: Text('Location error: $e')),
            );
          }
        },
      );
    }
  }

  Future<void> _saveFarm() async {
    if (_polygonPoints.length < 3) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please record at least 3 points')),
      );
      return;
    }

    if (widget.farmerId != null) {
      final db = Provider.of<DatabaseService>(context, listen: false);
      final List<Map<String, double>> pointsData = _polygonPoints
          .map((p) => {
                'lat': p.latitude,
                'lng': p.longitude,
              })
          .toList();

      await db.savePlotBoundary(widget.farmerId!, pointsData);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Farm boundary saved locally')),
        );
        Navigator.pop(context, true);
      }
    } else {
      // In standalone mode, just return the points
      Navigator.pop(context, _polygonPoints);
    }
  }

  Color _getAccuracyColor() {
    if (_currentAccuracy == null) {
      return Colors.grey;
    }
    if (_currentAccuracy! <= 5) {
      return AppColors.success;
    }
    if (_currentAccuracy! <= 10) {
      return AppColors.warning;
    }
    return AppColors.error;
  }

  String _getAccuracyLabel() {
    if (_currentAccuracy! <= 5) {
      return 'Excellent (±${_currentAccuracy!.toStringAsFixed(1)}m)';
    }
    if (_currentAccuracy! <= 10) {
      return 'Good (±${_currentAccuracy!.toStringAsFixed(1)}m)';
    }
    if (_currentAccuracy! <= 20) {
      return 'Fair (±${_currentAccuracy!.toStringAsFixed(1)}m)';
    }
    return 'Poor (±${_currentAccuracy!.toStringAsFixed(1)}m)';
  }

  bool _meetsResourceQualification() {
    return _calculatedAreaHa >= _minAreaForPrograms;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.farmerName != null
            ? 'Map: ${widget.farmerName}'
            : 'Farm Boundary'),
        actions: [
          if (_polygonPoints.isNotEmpty && !widget.viewOnly)
            IconButton(
              icon: const Icon(Icons.undo),
              onPressed: _undoPoint,
              tooltip: 'Remove last point',
            ),
          if (_polygonPoints.length >= 3 && !widget.viewOnly)
            IconButton(
              icon: const Icon(Icons.check),
              onPressed: _saveFarm,
              tooltip: 'Save Boundary',
            )
        ],
      ),
      body: Stack(
        children: [
          FlutterMap(
            mapController: _mapController,
            options: MapOptions(
              initialCenter: _currentCenter,
              initialZoom: 14.5,
              onTap: _onMapTap,
              interactionOptions: InteractionOptions(
                flags: widget.viewOnly 
                  ? InteractiveFlag.drag 
                  : InteractiveFlag.all,
              ),
            ),
            children: [
              TileLayer(
                urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                userAgentPackageName: 'com.example.aaywa_mobile',
              ),
              if (_polygonPoints.length >= 3)
                PolygonLayer(
                  polygons: [
                    Polygon(
                      points: _polygonPoints,
                      color: AppColors.primaryGreen.withValues(alpha: 0.3),
                      borderColor: AppColors.primaryGreen,
                      borderStrokeWidth: 2,
                      isFilled: true,
                    ),
                  ],
                ),
              MarkerLayer(
                markers: [
                  ..._polygonPoints.asMap().entries.map((entry) {
                    return Marker(
                      point: entry.value,
                      width: 12,
                      height: 12,
                      child: Container(
                        decoration: const BoxDecoration(
                          color: AppColors.primaryGreen,
                          shape: BoxShape.circle,
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black26,
                              blurRadius: 4,
                              spreadRadius: 1,
                            )
                          ],
                        ),
                      ),
                    );
                  }),
                  // Show center marker in view-only mode if no polygon
                  if (widget.viewOnly && _polygonPoints.isEmpty)
                    Marker(
                      point: _currentCenter,
                      width: 40,
                      height: 40,
                      child: const Icon(
                        Icons.location_on,
                        color: AppColors.error,
                        size: 40,
                      ),
                    ),
                ],
              ),
            ],
          ),

          // GPS Accuracy Indicator
          if (_isRecording && _currentAccuracy != null)
            Positioned(
              top: 16,
              left: 16,
              child: Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                decoration: BoxDecoration(
                  color: _getAccuracyColor(),
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: const [
                    BoxShadow(
                      color: Colors.black26,
                      blurRadius: 4,
                      offset: Offset(0, 2),
                    )
                  ],
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.gps_fixed, color: Colors.white, size: 16),
                    const SizedBox(width: 6),
                    Text(
                      _getAccuracyLabel(),
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ),
            ),

          // Area and Qualification Display
          if (_polygonPoints.length >= 3)
            Positioned(
              top: _isRecording && _currentAccuracy != null ? 60 : 16,
              right: 16,
              child: Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(8),
                  boxShadow: const [
                    BoxShadow(
                      color: Colors.black26,
                      blurRadius: 4,
                      offset: Offset(0, 2),
                    )
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.landscape,
                            size: 16, color: AppColors.textMedium),
                        const SizedBox(width: 6),
                        Text(
                          '${_calculatedAreaHa.toStringAsFixed(2)} ha',
                          style: AppTypography.h4.copyWith(
                            fontWeight: FontWeight.bold,
                            color: AppColors.textDark,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: _meetsResourceQualification()
                            ? AppColors.success.withValues(alpha: 0.1)
                            : AppColors.warning.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            _meetsResourceQualification()
                                ? Icons.check_circle
                                : Icons.info,
                            size: 12,
                            color: _meetsResourceQualification()
                                ? AppColors.success
                                : AppColors.warning,
                          ),
                          const SizedBox(width: 4),
                          Text(
                            _meetsResourceQualification()
                                ? 'Qualifies'
                                : 'Below min',
                            style: TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.w600,
                              color: _meetsResourceQualification()
                                  ? AppColors.success
                                  : AppColors.warning,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),

          // Instruction Overlay
          if (_polygonPoints.length < 3 && !widget.viewOnly)
            Positioned(
              bottom: 100,
              left: 16,
              right: 16,
              child: Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.black54,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  _isRecording
                      ? 'Walk along the boundary...'
                      : _isDigitizing
                          ? 'Tap map to add boundary points'
                          : 'Select a mode to start mapping',
                  style: const TextStyle(color: Colors.white, fontSize: 13),
                  textAlign: TextAlign.center,
                ),
              ),
            ),

          // My Location Button (hide in view-only mode)
          if (!widget.viewOnly)
            Positioned(
              bottom: 100,
              right: 16,
              child: FloatingActionButton(
                mini: true,
                backgroundColor: Colors.white,
                onPressed: () async {
                  final pos = await Geolocator.getCurrentPosition();
                  _mapController.move(ll.LatLng(pos.latitude, pos.longitude), 16);
                },
                child:
                    const Icon(Icons.my_location, color: AppColors.primaryGreen),
              ),
            ),
        ],
      ),
      bottomNavigationBar: widget.viewOnly ? null : BottomAppBar(
        child: Row(
          children: [
            Expanded(
              child: TextButton.icon(
                onPressed: () {
                  setState(() {
                    _isDigitizing = !_isDigitizing;
                    if (_isDigitizing) {
                      _isRecording = false;
                      _positionStream?.cancel();
                    }
                  });
                },
                icon: Icon(_isDigitizing ? Icons.edit : Icons.edit_outlined),
                label: FittedBox(
                  fit: BoxFit.scaleDown,
                  child: Text(_isDigitizing ? 'Digitizing' : 'Manual'),
                ),
                style: TextButton.styleFrom(
                  foregroundColor: _isDigitizing ? Colors.green : Colors.grey,
                ),
              ),
            ),
            const VerticalDivider(width: 1),
            Expanded(
              child: TextButton.icon(
                onPressed: _toggleRecording,
                icon:
                    Icon(_isRecording ? Icons.gps_fixed : Icons.gps_not_fixed),
                label: FittedBox(
                  fit: BoxFit.scaleDown,
                  child: Text(_isRecording ? 'Recording' : 'Walk'),
                ),
                style: TextButton.styleFrom(
                  foregroundColor: _isRecording ? Colors.red : Colors.grey,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
