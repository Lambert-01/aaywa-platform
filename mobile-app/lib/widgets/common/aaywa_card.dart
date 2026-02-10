import 'package:flutter/material.dart';
import '../../theme/design_system.dart';

/// Professional Card Widget - Matches Web Dashboard Card Styles
class AaywaCard extends StatelessWidget {
  final Widget child;
  final EdgeInsets? padding;
  final VoidCallback? onTap;
  final Color? color;
  final bool hasAccentTop;
  final Color? accentColor;
  final bool elevated;

  const AaywaCard({
    super.key,
    required this.child,
    this.padding,
    this.onTap,
    this.color,
    this.hasAccentTop = false,
    this.accentColor,
    this.elevated = true,
  });

  @override
  Widget build(BuildContext context) {
    final card = Container(
      decoration: BoxDecoration(
        color: color ?? AppColors.cardBackground,
        borderRadius: BorderRadius.circular(AppRadius.md),
        border: Border.all(
          color: AppColors.border,
          width: 1,
        ),
        boxShadow: elevated
            ? [
                AppShadows.sm,
                const BoxShadow(
                  color: Color(0x0A000000),
                  blurRadius: 20,
                  spreadRadius: -4,
                  offset: Offset(0, 4),
                ),
              ]
            : null,
      ),
      child: Stack(
        children: [
          // Accent top line (matches web dashboard KPI cards)
          if (hasAccentTop)
            Positioned(
              top: 0,
              left: 0,
              right: 0,
              child: Container(
                height: 3,
                decoration: BoxDecoration(
                  color: accentColor ?? AppColors.primaryGreen,
                  borderRadius: const BorderRadius.only(
                    topLeft: Radius.circular(AppRadius.md),
                    topRight: Radius.circular(AppRadius.md),
                  ),
                ),
              ),
            ),

          // Content
          Padding(
            padding: padding ?? const EdgeInsets.all(AppSpacing.md),
            child: child,
          ),

          // Decorative blob (optional, matches web dashboard)
          if (hasAccentTop)
            Positioned(
              bottom: -16,
              right: -16,
              child: Container(
                width: 96,
                height: 96,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color:
                      (accentColor ?? AppColors.primaryGreen).withOpacity(0.05),
                ),
              ),
            ),
        ],
      ),
    );

    if (onTap != null) {
      return InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(AppRadius.md),
        child: card,
      );
    }

    return card;
  }
}

/// Simplified Card for Lists
class AaywaListCard extends StatelessWidget {
  final Widget child;
  final VoidCallback? onTap;
  final EdgeInsets? margin;

  const AaywaListCard({
    super.key,
    required this.child,
    this.onTap,
    this.margin,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: margin ??
          const EdgeInsets.symmetric(
            horizontal: AppSpacing.md,
            vertical: AppSpacing.xs,
          ),
      child: AaywaCard(
        padding: const EdgeInsets.all(AppSpacing.md),
        onTap: onTap,
        elevated: false,
        child: child,
      ),
    );
  }
}
