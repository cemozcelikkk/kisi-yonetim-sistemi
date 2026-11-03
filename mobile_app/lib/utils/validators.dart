// Formdaki doğrulama kuralları. Backend'deki Person.cs kurallarının aynısıdır;
// kullanıcı hatayı sunucuya gitmeden, anında görür.
// Her fonksiyon hata varsa mesajı, yoksa null döner (TextFormField böyle bekler).

final _emailRegex = RegExp(r'^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$');
final _phoneRegex = RegExp(r'^\+?[0-9\s()-]{7,20}$');
final _urlRegex = RegExp(r'^https?://\S+$');

String? validateFullName(String? value) {
  final text = value?.trim() ?? '';
  if (text.length < 2 || text.length > 100) {
    return 'Ad soyad 2-100 karakter olmalıdır.';
  }
  return null;
}

String? validateRequired(String? value, String message) {
  if (value == null || value.trim().isEmpty) {
    return message;
  }
  return null;
}

String? validatePhotoUrl(String? value) {
  final text = value?.trim() ?? '';
  if (text.isNotEmpty && !_urlRegex.hasMatch(text)) {
    return 'Adres http:// veya https:// ile başlamalıdır.';
  }
  return null;
}

String? validateEmail(String? value) {
  if (!_emailRegex.hasMatch(value?.trim() ?? '')) {
    return 'Geçerli bir e-posta adresi giriniz.';
  }
  return null;
}

String? validatePhone(String? value) {
  if (!_phoneRegex.hasMatch(value?.trim() ?? '')) {
    return 'Geçerli bir telefon numarası giriniz.';
  }
  return null;
}
