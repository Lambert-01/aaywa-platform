import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import '../../theme/design_system.dart';
import 'aaywa_card.dart';
import 'aaywa_button.dart';

class MiniMapPreview extends StatelessWidget {
  final List<Polygon> polygons;
  final LatLng center;
  final String title;
  final String? subtitle;
  final String? actionLabel;
  final VoidCallback? onActionPressed;
  final double height;
  final bool isLoading;

  const MiniMapPreview({
    super.key,
    required this.polygons,
    required this.center,
    this.title = 'REGION MAP OVERVIEW',
    this.subtitle,
    this.actionLabel,
    this.onActionPressed,
    this.height = 200,
    this.isLoading = false,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        if (title.isNotEmpty) ...[
          Text(title,
              style:
                  AppTypography.overline.copyWith(color: AppColors.textMedium)),
          const SizedBox(height: AppSpacing.sm),
        ],
        AaywaCard(
          padding: EdgeInsets.zero,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              SizedBox(
                height: height,
                child: ClipRRect(
                  borderRadius: const BorderRadius.vertical(
                      top: Radius.circular(AppRadius.md)),
                  child: Stack(
                    children: [
                      if (isLoading)
                        const Center(child: CircularProgressIndicator())
                      else
                        FlutterMap(
                          options: MapOptions(
                            initialCenter: center,
                            initialZoom: 14,
                            interactionOptions: const InteractionOptions(
                              flags: InteractiveFlag.none,
                            ),
                          ),
                          children: [
                            TileLayer(
                              urlTemplate:
                                  'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                              userAgentPackageName: 'com.example.aaywa_mobile',
                            ),
                            if (polygons.isNotEmpty)
                              PolygonLayer(
                                polygons: polygons,
                              ),
                            // Show marker at center if no polygons
                            if (polygons.isEmpty)
                              MarkerLayer(
                                markers: [
                                  Marker(
                                    point: center,
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
                    ],
                  ),
                ),
              ),
              if ((subtitle != null && subtitle!.isNotEmpty) ||
                  actionLabel != null)
                Padding(
                  padding: const EdgeInsets.all(AppSpacing.md),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      if (subtitle != null && subtitle!.isNotEmpty)
                        Expanded(
                          child: Text(
                            subtitle!,
                            style: AppTypography.bodySmall
                                .copyWith(color: AppColors.textMedium),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      if (actionLabel != null) ...[
                        const SizedBox(width: AppSpacing.sm),
                        AaywaButton(
                          label: actionLabel!,
                          size: ButtonSize.small,
                          onPressed: onActionPressed,
                        ),
                      ],
                    ],
                  ),
                ),
            ],
          ),
        ),
      ],
    );
  }
}
