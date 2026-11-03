import 'package:flutter/material.dart';

import '../theme/app_theme.dart';

// Veri yüklenemediğinde ekranın ortasında gösterilen hata ve "Tekrar dene" butonu.
class ErrorView extends StatelessWidget {
  final String message;
  final VoidCallback onRetry;

  const ErrorView({super.key, required this.message, required this.onRetry});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text('Bağlantı kurulamadı', style: AppText.title.copyWith(fontSize: 26), textAlign: TextAlign.center),
            const SizedBox(height: 12),
            Text(message, style: AppText.secondary, textAlign: TextAlign.center),
            const SizedBox(height: 28),
            OutlinedButton(onPressed: onRetry, child: const Text('Tekrar dene')),
          ],
        ),
      ),
    );
  }
}
