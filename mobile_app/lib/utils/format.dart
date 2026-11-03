// Tek haneli sayının başına 0 ekler: 4 → "04"
String _twoDigits(int value) => value.toString().padLeft(2, '0');

// API'nin beklediği biçim: 1994-04-12
String formatIsoDate(DateTime date) {
  return '${date.year}-${_twoDigits(date.month)}-${_twoDigits(date.day)}';
}

// Ekranda gösterilen biçim: 12.04.1994
String formatDisplayDate(DateTime date) {
  return '${_twoDigits(date.day)}.${_twoDigits(date.month)}.${date.year}';
}

// Türkçe büyük harf: Dart'ın toUpperCase'i "i"yi "I" yapar, bu yüzden önce "i" → "İ" çevrilir.
// "Doğum yeri" → "DOĞUM YERİ"
String toUpperTr(String text) => text.replaceAll('i', 'İ').toUpperCase();

// "Ahmet Yılmaz" → "AY". Fotoğraf yoksa avatarda gösterilir.
String getInitials(String fullName) {
  final parts = fullName.trim().split(RegExp(r'\s+')).where((p) => p.isNotEmpty);
  return parts.take(2).map((p) => p[0].toUpperCase()).join();
}
