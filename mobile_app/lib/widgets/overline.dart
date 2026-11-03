import 'package:flutter/material.dart';

import '../theme/app_theme.dart';
import '../utils/format.dart';

// Başlıkların üstündeki küçük etiket: solda kısa Marigold çizgi, yanında "REHBER".
class Overline extends StatelessWidget {
  final String text;

  const Overline(this.text, {super.key});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(width: 20, height: 2, color: AppColors.marigold),
        const SizedBox(width: 10),
        Text(toUpperTr(text), style: AppText.label),
      ],
    );
  }
}
