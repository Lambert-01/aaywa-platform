import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:geolocator/geolocator.dart';
import 'dart:async';

class FarmMapScreen extends StatefulWidget {
  const FarmMapScreen({super.key});

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
  StreamSubscription<Position>? _positionStream;

  @override
  void dispose() {
    _positionStream?.cancel();
    super.dispose();
  }

  void _toggleRecording() async {
    if (_isRecording) {
      // Stop recording
      _positionStream?.cancel();
      setState(() => _isRecording = false);
      _createPolygon();
    } else {
      // Start recording
      bool serviceEnabled;
      LocationPermission permission;

      serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        return Future.error('Location services are disabled.');
      }

      permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) {
          return Future.error('Location permissions are denied');
        }
      }

      setState(() {
        _isRecording = true;
        _polygonPoints.clear();
        _polygons.clear();
        _markers.clear();
      });

      const LocationSettings locationSettings = LocationSettings(
        accuracy: LocationAccuracy.high,
        distanceFilter: 5,
      );

      _positionStream =
          Geolocator.getPositionStream(locationSettings: locationSettings)
              .listen((Position position) {
        final point = LatLng(position.latitude, position.longitude);
        setState(() {
          _polygonPoints.add(point);
          _markers.add(Marker(
            markerId: MarkerId(point.toString()),
            position: point,
            icon: BitmapDescriptor.defaultMarkerWithHue(
                BitmapDescriptor.hueGreen),
          ));
        });

        _updateCamera(point);
      });
    }
  }

  Future<void> _updateCamera(LatLng point) async {
    final GoogleMapController controller = await _controller.future;
    controller.animateCamera(CameraUpdate.newLatLng(point));
  }

  void _createPolygon() {
    setState(() {
      _polygons.add(Polygon(
        polygonId: const PolygonId('farm_boundary'),
        points: List.from(_polygonPoints),
        strokeColor: Colors.green,
        strokeWidth: 2,
        fillColor: Colors.green.withValues(alpha: 0.3),
      ));
    });
  }

  void _saveFarm() {
    if (_polygonPoints.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('No boundary recorded')),
      );
      return;
    }
    debugPrint('Saving farm boundary: ${_polygonPoints.length} points');
    Navigator.pop(context, _polygonPoints);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Map Farm Boundary'),
        actions: [
          if (!_isRecording && _polygonPoints.isNotEmpty)
            IconButton(
              icon: const Icon(Icons.check),
              onPressed: _saveFarm,
            )
        ],
      ),
      body: GoogleMap(
        mapType: MapType.hybrid,
        initialCameraPosition: _kRwanda,
        polygons: _polygons,
        markers: _markers,
        onMapCreated: (GoogleMapController controller) {
          _controller.complete(controller);
        },
        myLocationEnabled: true,
        myLocationButtonEnabled: true,
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _toggleRecording,
        label: Text(_isRecording ? 'Stop Recording' : 'Start Recording'),
        icon: Icon(_isRecording ? Icons.stop : Icons.fiber_manual_record),
        backgroundColor: _isRecording ? Colors.red : Colors.green,
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.centerFloat,
    );
  }
}
