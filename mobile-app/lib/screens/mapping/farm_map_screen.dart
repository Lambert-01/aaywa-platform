import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
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
  final Completer<GoogleMapController> _controller = Completer();
  final List<LatLng> _polygonPoints = [];
  final Set<Polygon> _polygons = {};
  final Set<Marker> _markers = {};

  static const CameraPosition _kRwanda = CameraPosition(
    target: LatLng(-1.9441, 30.0619),
    zoom: 14.4746,
  );

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
    super.dispose();
  }

  Future<void> _loadExistingBoundary() async {
    final db = Provider.of<DatabaseService>(context, listen: false);
    final coords = await db.getPlotBoundariesByFarmer(widget.farmerId!);

    if (coords.isNotEmpty) {
      setState(() {
        _polygonPoints.addAll(coords
            .map((c) =>
                LatLng(c.read<double>('latitude'), c.read<double>('longitude')))
            .toList());
        _refreshMap();
      });

      // Zoom to first point
      _updateCamera(_polygonPoints.first);
    }
  }

  void _refreshMap() {
    _markers.clear();
    _polygons.clear();

    for (int i = 0; i < _polygonPoints.length; i++) {
      _markers.add(Marker(
        markerId: MarkerId('point_$i'),
        position: _polygonPoints[i],
        icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueGreen),
      ));
    }

    if (_polygonPoints.length >= 3) {
      _polygons.add(Polygon(
        polygonId: const PolygonId('farm_boundary'),
        points: _polygonPoints,
        strokeColor: AppColors.primaryGreen,
        strokeWidth: 2,
        fillColor: AppColors.primaryGreen.withValues(alpha: 0.3),
      ));
    }
  }

  void _onMapTap(LatLng point) {
    if (!_isDigitizing) return;

    setState(() {
      _polygonPoints.add(point);
      _refreshMap();
    });
  }

  void _undoPoint() {
    if (_polygonPoints.isNotEmpty) {
      setState(() {
        _polygonPoints.removeLast();
        _refreshMap();
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
        return;
      }

      permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) return;
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
              .listen((Position position) {
        final point = LatLng(position.latitude, position.longitude);
        setState(() {
          _polygonPoints.add(point);
          _refreshMap();
        });
        _updateCamera(point);
      });
    }
  }

  Future<void> _updateCamera(LatLng point) async {
    final GoogleMapController controller = await _controller.future;
    controller.animateCamera(CameraUpdate.newLatLng(point));
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
      final pointsData = _polygonPoints
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
          GoogleMap(
            mapType: MapType.hybrid,
            initialCameraPosition: _kRwanda,
            polygons: _polygons,
            markers: _markers,
            onMapCreated: (controller) => _controller.complete(controller),
            onTap: _onMapTap,
            myLocationEnabled: true,
            myLocationButtonEnabled: true,
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
        ],
      ),
      bottomNavigationBar: BottomAppBar(
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
          children: [
            TextButton.icon(
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
              label: Text(_isDigitizing ? 'Digitizing' : 'Manual Point'),
              style: TextButton.styleFrom(
                foregroundColor: _isDigitizing ? Colors.green : Colors.grey,
              ),
            ),
            const VerticalDivider(width: 1),
            TextButton.icon(
              onPressed: _toggleRecording,
              icon: Icon(_isRecording ? Icons.gps_fixed : Icons.gps_not_fixed),
              label: Text(_isRecording ? 'Recording' : 'Walk Boundary'),
              style: TextButton.styleFrom(
                foregroundColor: _isRecording ? Colors.red : Colors.grey,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
