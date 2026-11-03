import 'package:flutter/material.dart';

// Uygulamanın bütün renkleri tek yerden gelir.
// Bir rengi burada değiştirmek bütün ekranlara yansır.
class AppColors {
  static const silver = Color(0xFFDDE3E8); // Ice Silver — ana zemin
  static const silverLight = Color(0xFFEEF1F4); // Panel ve pencere zemini (Silver'ın açık tonu)
  static const aubergine = Color(0xFF3A0F34); // Deep Aubergine — metin ve ana butonlar
  static const marigold = Color(0xFFEAAA00); // Marigold — vurgu rengi, az ve bilinçli kullanılır
  static const muted = Color(0xFF5E4A5B); // İkincil metin (Aubergine'in açık tonu)
  static const hairline = Color(0x263A0F34); // İnce ayırıcı çizgiler (%15 saydam Aubergine)
  static const danger = Color(0xFFA3262A); // Silme aksiyonu
}

// Yazı stilleri. Fraunces (serif) başlıklarda, Inter (sans-serif) metinlerde.
class AppText {
  static const _serif = 'Fraunces';
  static const _sans = 'Inter';

  // Ekranın büyük başlığı: "Kişiler"
  static const hero = TextStyle(
    fontFamily: _serif,
    fontSize: 52,
    height: 1.0,
    fontWeight: FontWeight.w500,
    letterSpacing: -1.5,
    color: AppColors.aubergine,
  );

  // Detay ve form başlıkları: kişinin adı, "Yeni kişi"
  static const title = TextStyle(
    fontFamily: _serif,
    fontSize: 34,
    height: 1.1,
    fontWeight: FontWeight.w500,
    letterSpacing: -0.8,
    color: AppColors.aubergine,
  );

  // İtalik serif: departman ve bölüm başlıkları
  static const italic = TextStyle(
    fontFamily: _serif,
    fontStyle: FontStyle.italic,
    fontSize: 18,
    color: AppColors.aubergine,
  );

  // Büyük harfli, aralıklı küçük etiket: "REHBER", "DOĞUM YERİ"
  static const label = TextStyle(
    fontFamily: _sans,
    fontSize: 11,
    fontWeight: FontWeight.w600,
    letterSpacing: 1.8,
    color: AppColors.muted,
  );

  // Listedeki ad-soyad (kalın)
  static const name = TextStyle(
    fontFamily: _sans,
    fontSize: 17,
    fontWeight: FontWeight.w700,
    letterSpacing: -0.2,
    color: AppColors.aubergine,
  );

  // Bilgi satırlarındaki değer: "Adana", "12.04.1994"
  static const value = TextStyle(
    fontFamily: _sans,
    fontSize: 16,
    fontWeight: FontWeight.w500,
    color: AppColors.aubergine,
  );

  // İkincil metin: departman, açıklamalar
  static const secondary = TextStyle(fontFamily: _sans, fontSize: 14, height: 1.4, color: AppColors.muted);
}

// MaterialApp'e verilen tema. Hazır Material bileşenleri (buton, form alanı,
// diyalog...) renklerini ve yazı tiplerini buradan alır.
ThemeData buildAppTheme() {
  const scheme = ColorScheme(
    brightness: Brightness.light,
    primary: AppColors.aubergine,
    onPrimary: AppColors.silverLight,
    secondary: AppColors.marigold,
    onSecondary: AppColors.aubergine,
    error: AppColors.danger,
    onError: Colors.white,
    surface: AppColors.silver,
    onSurface: AppColors.aubergine,
  );

  final buttonShape = RoundedRectangleBorder(borderRadius: BorderRadius.circular(14));
  const buttonText = TextStyle(fontFamily: 'Inter', fontSize: 15, fontWeight: FontWeight.w600, letterSpacing: 0.2);

  return ThemeData(
    colorScheme: scheme,
    scaffoldBackgroundColor: AppColors.silver,
    fontFamily: 'Inter',
    appBarTheme: const AppBarTheme(
      backgroundColor: AppColors.silver,
      foregroundColor: AppColors.aubergine,
      elevation: 0,
      scrolledUnderElevation: 0, // Kaydırınca renk değiştirmesin
    ),
    dividerTheme: const DividerThemeData(color: AppColors.hairline, thickness: 1, space: 1),
    progressIndicatorTheme: const ProgressIndicatorThemeData(color: AppColors.aubergine),
    // Form alanları: kutu yerine sade alt çizgi, odaklanınca Marigold
    inputDecorationTheme: const InputDecorationTheme(
      labelStyle: TextStyle(fontSize: 15, color: AppColors.muted),
      floatingLabelStyle: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: AppColors.aubergine),
      helperStyle: TextStyle(fontSize: 12, color: AppColors.muted),
      errorStyle: TextStyle(fontSize: 12, color: AppColors.danger),
      contentPadding: EdgeInsets.symmetric(vertical: 12),
      enabledBorder: UnderlineInputBorder(borderSide: BorderSide(color: Color(0x663A0F34))),
      focusedBorder: UnderlineInputBorder(borderSide: BorderSide(color: AppColors.marigold, width: 2)),
      errorBorder: UnderlineInputBorder(borderSide: BorderSide(color: AppColors.danger)),
      focusedErrorBorder: UnderlineInputBorder(borderSide: BorderSide(color: AppColors.danger, width: 2)),
    ),
    filledButtonTheme: FilledButtonThemeData(
      style: FilledButton.styleFrom(
        backgroundColor: AppColors.aubergine,
        foregroundColor: AppColors.silverLight,
        minimumSize: const Size(64, 56),
        shape: buttonShape,
        textStyle: buttonText,
      ),
    ),
    outlinedButtonTheme: OutlinedButtonThemeData(
      style: OutlinedButton.styleFrom(
        foregroundColor: AppColors.aubergine,
        minimumSize: const Size(64, 56),
        side: const BorderSide(color: AppColors.aubergine),
        shape: buttonShape,
        textStyle: buttonText,
      ),
    ),
    textButtonTheme: TextButtonThemeData(
      style: TextButton.styleFrom(foregroundColor: AppColors.aubergine, textStyle: buttonText),
    ),
    floatingActionButtonTheme: FloatingActionButtonThemeData(
      backgroundColor: AppColors.aubergine,
      foregroundColor: AppColors.marigold,
      elevation: 3,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
    ),
    dialogTheme: DialogThemeData(
      backgroundColor: AppColors.silverLight,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
      titleTextStyle: AppText.title.copyWith(fontSize: 26),
      contentTextStyle: AppText.secondary.copyWith(fontSize: 15),
    ),
    snackBarTheme: SnackBarThemeData(
      backgroundColor: AppColors.aubergine,
      contentTextStyle: const TextStyle(fontFamily: 'Inter', fontSize: 14, color: AppColors.silverLight),
      behavior: SnackBarBehavior.floating,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
    ),
    datePickerTheme: DatePickerThemeData(
      backgroundColor: AppColors.silverLight,
      headerHeadlineStyle: AppText.title.copyWith(fontSize: 30),
    ),
  );
}
