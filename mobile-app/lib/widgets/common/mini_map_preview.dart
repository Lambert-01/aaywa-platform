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
      children: [
        Text(title,
            style:
                AppTypography.overline.copyWith(color: AppColors.textMedium)),
        const SizedBox(height: AppSpacing.sm),
        AaywaCard(
          padding: EdgeInsets.zero,
          child: Column(
            children: [
              Container(
                height: height,
                decoration: const BoxDecoration(
                  borderRadius:
                      BorderRadius.vertical(top: Radius.circular(AppRadius.md)),
                ),
                child: ClipRRect(
                  borderRadius: const BorderRadius.vertical(
                      top: Radius.circular(AppRadius.md)),
                  child: Stack(
                    children: [
                      if (isLoading)
                        const Center(child: CircularProgressIndicator())
                      else if (polygons.isEmpty)
                        Container(
                          color: Colors.black.withValues(alpha: 0.05),
                          child: Center(
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(Icons.map_outlined,
                                    color: AppColors.textLight
                                        .withValues(alpha: 0.5),
                                    size: 40),
                                const SizedBox(height: AppSpacing.sm),
                                Text(
                                  'NO MAP DATA AVAILABLE',
                                  style: AppTypography.labelSmall.copyWith(
                                    color: AppColors.textMedium,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        )
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
                            PolygonLayer(
                              polygons: polygons,
                            ),
                          ],
                        ),
                    ],
                  ),
                ),
              ),
              if (subtitle != null || actionLabel != null)
                Padding(
                  padding: const EdgeInsets.all(AppSpacing.md),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      if (subtitle != null)
                        Expanded(
                          child: Text(
                            subtitle!,
                            style: AppTypography.bodySmall
                                .copyWith(color: AppColors.textMedium),
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      if (actionLabel != null)
                        AaywaButton(
                          label: actionLabel!,
                          size: ButtonSize.small,
                          onPressed: onActionPressed,
                        ),
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
