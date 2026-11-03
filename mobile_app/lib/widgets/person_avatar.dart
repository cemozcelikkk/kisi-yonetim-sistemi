import 'package:flutter/material.dart';

import '../theme/app_theme.dart';
import '../utils/format.dart';

// Dairesel profil fotoğrafı. Fotoğraf adresi yoksa baş harfleri gösterir.
class PersonAvatar extends StatelessWidget {
  final String? photoUrl;
  final String name;
  final double radius;

  const PersonAvatar({super.key, required this.photoUrl, required this.name, required this.radius});

  @override
  Widget build(BuildContext context) {
    final url = photoUrl;
    final hasPhoto = url != null && url.isNotEmpty;

    return CircleAvatar(
      radius: radius,
      backgroundColor: AppColors.silverLight,
      // NetworkImage: fotoğrafı internetten indirir
      backgroundImage: hasPhoto ? NetworkImage(url) : null,
      // Fotoğraf yüklenemezse uygulama çökmesin; düz daire kalır
      onBackgroundImageError: hasPhoto ? (_, _) {} : null,
      child: hasPhoto
          ? null
          : Text(
              getInitials(name),
              style: TextStyle(fontFamily: 'Fraunces', fontSize: radius * 0.75, color: AppColors.aubergine),
            ),
    );
  }
}
