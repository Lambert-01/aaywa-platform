import 'package:flutter/material.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import 'package:provider/provider.dart';
import 'package:drift/drift.dart' as drift;
import '../../models/sync_status.dart';
import '../../services/database_service.dart';

class AttendanceScreen extends StatefulWidget {
  final int trainingId; // Pass the active training session ID
  const AttendanceScreen({super.key, required this.trainingId});

  @override
  State<AttendanceScreen> createState() => _AttendanceScreenState();
}

class _AttendanceScreenState extends State<AttendanceScreen> {
  final MobileScannerController _cameraController = MobileScannerController();
  bool _isProcessing = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Scan Farmer ID'),
        backgroundColor: Colors.green[700],
        actions: [
          IconButton(
            icon: ValueListenableBuilder(
              valueListenable: _cameraController.torchState,
              builder: (context, state, child) {
                switch (state) {
                  case TorchState.off:
                    return const Icon(Icons.flash_off, color: Colors.grey);
                  case TorchState.on:
                    return const Icon(Icons.flash_on, color: Colors.yellow);
                }
              },
            ),
            onPressed: () => _cameraController.toggleTorch(),
          ),
          IconButton(
            icon: ValueListenableBuilder(
              valueListenable: _cameraController.cameraFacingState,
              builder: (context, state, child) {
                switch (state) {
                  case CameraFacing.front:
                    return const Icon(Icons.camera_front);
                  case CameraFacing.back:
                    return const Icon(Icons.camera_rear);
                }
              },
            ),
            onPressed: () => _cameraController.switchCamera(),
          ),
        ],
      ),
      body: MobileScanner(
        controller: _cameraController,
        onDetect: (capture) {
          final List<Barcode> barcodes = capture.barcodes;
          for (final barcode in barcodes) {
            if (!_isProcessing && barcode.rawValue != null) {
              _processBarcode(barcode.rawValue!);
            }
          }
        },
      ),
    );
  }

  Future<void> _processBarcode(String code) async {
    setState(() => _isProcessing = true);

    try {
      // Expecting QR code format: "FARMER:<ID>"
      if (!code.startsWith('FARMER:')) {
        _showError('Invalid QR Code Format');
        return;
      }

      final farmerRemoteId = code.split(':')[1];
      final db = Provider.of<DatabaseService>(context, listen: false);

      // Find farmer in local DB
      final farmer = await (db.select(db.farmers)
            ..where((tbl) => tbl.remoteId.equals(farmerRemoteId)))
          .getSingleOrNull();

      if (farmer == null) {
        _showError('Farmer not found in local database. Sync required?');
        return;
      }

      // Record Attendance
      await db.insertAttendance(AttendanceCompanion(
        trainingIds: drift.Value(
            widget.trainingId.toString()), // Schema uses trainingIds (text)
        farmerId: drift.Value(farmer.remoteId ?? farmer.id.toString()),
        timestamp: drift.Value(DateTime.now()),
        syncStatus: const drift.Value(SyncStatus.pending),
      ));

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
                'Attendance recorded for ${farmer.firstName} ${farmer.lastName}'),
            backgroundColor: Colors.green,
            duration: const Duration(seconds: 2),
          ),
        );
        // Pause briefly to avoid double scanning
        await Future.delayed(const Duration(seconds: 2));
      }
    } catch (e) {
      _showError('Error processing scan: $e');
    } finally {
      if (mounted) {
        setState(() => _isProcessing = false);
      }
    }
  }

  void _showError(String message) {
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(message), backgroundColor: Colors.red),
      );
    }
  }

  @override
  void dispose() {
    _cameraController.dispose();
    super.dispose();
  }
}
