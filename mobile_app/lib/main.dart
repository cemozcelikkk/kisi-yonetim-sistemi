import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';

import 'screens/person_list_screen.dart';
import 'theme/app_theme.dart';

void main() {
  runApp(const KisiYonetimApp());
}

class KisiYonetimApp extends StatelessWidget {
  const KisiYonetimApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Kişi Yönetimi',
      debugShowCheckedModeBanner: false,
      theme: buildAppTheme(), // Renkler ve yazı tipleri: theme/app_theme.dart
      // Tarih seçici ve hazır butonlar Türkçe görünsün diye
      locale: const Locale('tr'),
      supportedLocales: const [Locale('tr')],
      localizationsDelegates: GlobalMaterialLocalizations.delegates,
      home: const PersonListScreen(), // EKRAN 1 açılışta gösterilir
    );
  }
}
