import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart' as ll;
import 'package:geolocator/geolocator.dart';
import 'package:provider/provider.dart';
import 'dart:async';
import '../../services/database_service.dart';
import '../../theme/design_system.dart';

class FarmMapScreen extends StatefulWidget {
  final String? farmerId;
  final String? farmerName;

  const FarmMapScreen({
    super.key,
    this.farmerId,
    this.farmerName,
  });

  @override
  State<FarmMapScreen> createState() => _FarmMapScreenState();
}

class _FarmMapScreenState extends State<FarmMapScreen> {
  final MapController _mapController = MapController();
  final List<ll.LatLng> _polygonPoints = [];
  final ll.LatLng _currentCenter = const ll.LatLng(-1.9441, 30.0619);

  bool _isRecording = false;
  bool _isDigitizing = false;
  StreamSubscription<Position>? _positionStream;

  @override
  void initState() {
    super.initState();
    if (widget.farmerId != null) {
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
      });

      // Zoom to first point
      Future.delayed(const Duration(milliseconds: 500), () {
        if (mounted && _polygonPoints.isNotEmpty) {
          _mapController.move(_polygonPoints.first, 16);
        }
      });
    }
  }

  void _onMapTap(TapPosition tapPosition, ll.LatLng point) {
    if (!_isDigitizing) return;

    setState(() {
      _polygonPoints.add(point);
    });
  }

  void _undoPoint() {
    if (_polygonPoints.isNotEmpty) {
      setState(() {
        _polygonPoints.removeLast();
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.farmerName != null
            ? 'Map: ${widget.farmerName}'
            : 'Farm Boundary'),
        actions: [
          if (_polygonPoints.isNotEmpty)
            IconButton(
              icon: const Icon(Icons.undo),
              onPressed: _undoPoint,
              tooltip: 'Remove last point',
            ),
          if (_polygonPoints.length >= 3)
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
                markers: _polygonPoints.asMap().entries.map((entry) {
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
                }).toList(),
              ),
            ],
          ),

          // Instruction Overlay
          Positioned(
            top: 16,
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
                    ? 'Recording GPS path...'
                    : _isDigitizing
                        ? 'Tap map to add boundary points'
                        : 'Select a mode to start mapping',
                style: const TextStyle(color: Colors.white, fontSize: 13),
                textAlign: TextAlign.center,
              ),
            ),
          ),

          // My Location Button
          Positioned(
            bottom: 30,
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
      bottomNavigationBar: BottomAppBar(
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
