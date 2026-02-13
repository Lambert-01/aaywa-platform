import 'package:flutter/material.dart';
import 'package:qr_code_scanner/qr_code_scanner.dart';

/// Service for handling QR code scanning functionality
class QRScannerService {
  QRViewController? _controller;
  bool _isScanning = false;

  bool get isScanning => _isScanning;

  /// Initialize QR scanner with callback
  void initializeScanner(
    QRViewController controller,
    Function(String code) onScan,
  ) {
    _controller = controller;
    _isScanning = true;

    _controller?.scannedDataStream.listen((scanData) {
      if (scanData.code != null && _isScanning) {
        _isScanning = false; // Prevent multiple scans
        _controller?.pauseCamera();
        onScan(scanData.code!);
      }
    });
  }

  /// Resume scanning
  void resumeScanning() {
    _isScanning = true;
    _controller?.resumeCamera();
  }

  /// Pause scanning
  void pauseScanning() {
    _isScanning = false;
    _controller?.pauseCamera();
  }

  /// Dispose scanner
  void dispose() {
    _controller?.dispose();
    _controller = null;
    _isScanning = false;
  }

  /// Toggle flash light
  Future<void> toggleFlash() async {
    await _controller?.toggleFlash();
  }

  /// Flip camera
  Future<void> flipCamera() async {
    await _controller?.flipCamera();
  }
}

/// Widget for QR code scanning
class QRScannerView extends StatefulWidget {
  final Function(String code) onScan;
  final String? message;

  const QRScannerView({
    super.key,
    required this.onScan,
    this.message,
  });

  @override
  State<QRScannerView> createState() => _QRScannerViewState();
}

class _QRScannerViewState extends State<QRScannerView> {
  final GlobalKey qrKey = GlobalKey(debugLabel: 'QR');
  final QRScannerService _scannerService = QRScannerService();

  @override
  void dispose() {
    _scannerService.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        QRView(
          key: qrKey,
          onQRViewCreated: (controller) {
            _scannerService.initializeScanner(controller, widget.onScan);
          },
          overlay: QrScannerOverlayShape(
            borderColor: Colors.green,
            borderRadius: 10,
            borderLength: 30,
            borderWidth: 10,
            cutOutSize: 300,
          ),
        ),

        // Message overlay
        if (widget.message != null)
          Positioned(
            top: 50,
            left: 0,
            right: 0,
            child: Container(
              margin: const EdgeInsets.symmetric(horizontal: 20),
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.black.withValues(alpha: 0.7),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Text(
                widget.message!,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 16,
                  fontWeight: FontWeight.w500,
                ),
                textAlign: TextAlign.center,
              ),
            ),
          ),

        // Control buttons
        Positioned(
          bottom: 30,
          left: 0,
          right: 0,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              _buildControlButton(
                icon: Icons.flash_on,
                label: 'Flash',
                onPressed: () => _scannerService.toggleFlash(),
              ),
              const SizedBox(width: 20),
              _buildControlButton(
                icon: Icons.flip_camera_ios,
                label: 'Flip',
                onPressed: () => _scannerService.flipCamera(),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildControlButton({
    required IconData icon,
    required String label,
    required VoidCallback onPressed,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.black.withValues(alpha: 0.7),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onPressed,
          borderRadius: BorderRadius.circular(12),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(icon, color: Colors.white, size: 24),
                const SizedBox(height: 4),
                Text(
                  label,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 12,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

/// Model for parsed farmer QR code data
class FarmerQRData {
  final String farmerId;
  final String farmerName;

  FarmerQRData({
    required this.farmerId,
    required this.farmerName,
  });

  /// Parse QR code string (format: "FARMER:id:name")
  factory FarmerQRData.fromQRCode(String qrCode) {
    final parts = qrCode.split(':');
    if (parts.length != 3 || parts[0] != 'FARMER') {
      throw const FormatException('Invalid farmer QR code format');
    }
    return FarmerQRData(
      farmerId: parts[1],
      farmerName: parts[2],
    );
  }

  /// Generate QR code string
  String toQRCode() {
    return 'FARMER:$farmerId:$farmerName';
  }
}
