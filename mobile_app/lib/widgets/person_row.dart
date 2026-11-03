import 'package:flutter/material.dart';

import '../models/person.dart';
import '../theme/app_theme.dart';
import 'person_avatar.dart';

// Listedeki tek bir kişi satırı: solda fotoğraf, yanında kalın ad-soyad ve altında departman.
class PersonRow extends StatelessWidget {
  final Person person;
  final VoidCallback onTap;

  const PersonRow({super.key, required this.person, required this.onTap});

  @override
  Widget build(BuildContext context) {
    // InkWell: dokununca dalga efekti verir ve onTap'i çağırır
    return InkWell(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 18),
        decoration: const BoxDecoration(
          border: Border(bottom: BorderSide(color: AppColors.hairline)),
        ),
        child: Row(
          children: [
            PersonAvatar(photoUrl: person.photoUrl, name: person.fullName, radius: 26),
            const SizedBox(width: 18),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(person.fullName, style: AppText.name, maxLines: 1, overflow: TextOverflow.ellipsis),
                  const SizedBox(height: 3),
                  Text(person.department, style: AppText.secondary, maxLines: 1, overflow: TextOverflow.ellipsis),
                ],
              ),
            ),
            const Icon(Icons.arrow_forward, size: 18, color: AppColors.muted),
          ],
        ),
      ),
    );
  }
}
