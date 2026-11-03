import 'package:flutter/material.dart';

import '../theme/app_theme.dart';
import '../utils/format.dart';

// Detay ekranındaki bilgi satırı: üstte küçük etiket, altında değer.
// onTap verilirse satır tıklanabilir olur ve sağda Marigold bir aksiyon ikonu çıkar.
class InfoRow extends StatelessWidget {
  final String label;
  final String value;
  final IconData? actionIcon;
  final VoidCallback? onTap;
  final bool showDivider;

  const InfoRow({
    super.key,
    required this.label,
    required this.value,
    this.actionIcon,
    this.onTap,
    this.showDivider = true,
  });

  @override
  Widget build(BuildContext context) {
    final icon = actionIcon;

    return InkWell(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 18),
        decoration: BoxDecoration(
          border: showDivider ? const Border(bottom: BorderSide(color: AppColors.hairline)) : null,
        ),
        child: Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(toUpperTr(label), style: AppText.label),
                  const SizedBox(height: 6),
                  Text(value, style: AppText.value),
                ],
              ),
            ),
            if (icon != null)
              Container(
                width: 40,
                height: 40,
                decoration: const BoxDecoration(color: AppColors.marigold, shape: BoxShape.circle),
                child: Icon(icon, size: 18, color: AppColors.aubergine),
              ),
          ],
        ),
      ),
    );
  }
}
