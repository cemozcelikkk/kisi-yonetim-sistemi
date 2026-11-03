import 'dart:convert';

import 'package:http/http.dart' as http;

import '../config.dart';
import '../models/person.dart';

// Ekranlarda kullanıcıya gösterilecek Türkçe hata mesajını taşır.
class ApiException implements Exception {
  final String message;

  ApiException(this.message);

  @override
  String toString() => message;
}

// Tüm REST istekleri bu sınıftan geçer. Ekranlar http paketini doğrudan kullanmaz.
class PersonService {
  static const _timeout = Duration(seconds: 10); // 10 saniyede cevap gelmezse vazgeç
  static const _headers = {'Content-Type': 'application/json'};

  static Uri _url([int? id]) {
    return Uri.parse(id == null ? '$apiBaseUrl/api/persons' : '$apiBaseUrl/api/persons/$id');
  }

  // GET /api/persons → tüm kişiler
  static Future<List<Person>> getPersons() async {
    final response = await _send(() => http.get(_url()));
    final List<dynamic> data = _decode(response);
    return data.map((item) => Person.fromJson(item as Map<String, dynamic>)).toList();
  }

  // GET /api/persons/{id} → tek kişi
  static Future<Person> getPerson(int id) async {
    final response = await _send(() => http.get(_url(id)));
    return Person.fromJson(_decode(response) as Map<String, dynamic>);
  }

  // POST /api/persons → yeni kişi oluşturur, sunucu 201 ile kişiyi (id dahil) döner
  static Future<Person> createPerson(Person person) async {
    final response = await _send(() => http.post(_url(), headers: _headers, body: jsonEncode(person.toJson())));
    return Person.fromJson(_decode(response) as Map<String, dynamic>);
  }

  // PUT /api/persons/{id} → kişiyi günceller
  static Future<Person> updatePerson(Person person) async {
    final response = await _send(() => http.put(_url(person.id), headers: _headers, body: jsonEncode(person.toJson())));
    return Person.fromJson(_decode(response) as Map<String, dynamic>);
  }

  // DELETE /api/persons/{id} → kişiyi siler (sunucu 204 döner, gövde yok)
  static Future<void> deletePerson(int id) async {
    await _send(() => http.delete(_url(id)));
  }

  // İsteği gönderir; ağ hatasını ve 2xx dışı cevapları ApiException'a çevirir.
  static Future<http.Response> _send(Future<http.Response> Function() request) async {
    final http.Response response;
    try {
      response = await request().timeout(_timeout);
    } on Exception {
      // Sunucudan hiç cevap gelmedi: backend kapalı, adres yanlış veya zaman aşımı
      throw ApiException(
        "Sunucuya ulaşılamadı. Backend'in çalıştığından ve adresin doğru olduğundan emin olun.\n($apiBaseUrl)",
      );
    }

    if (response.statusCode >= 200 && response.statusCode < 300) {
      return response;
    }
    throw ApiException(_errorMessage(response));
  }

  // Türkçe karakterler bozulmasın diye gövde UTF-8 olarak çözülür.
  static dynamic _decode(http.Response response) {
    return jsonDecode(utf8.decode(response.bodyBytes));
  }

  static String _errorMessage(http.Response response) {
    try {
      final data = _decode(response);
      if (data is Map<String, dynamic>) {
        // ASP.NET doğrulama hataları: { "errors": { "Email": ["..."], "Phone": ["..."] } }
        final errors = data['errors'];
        if (errors is Map<String, dynamic>) {
          return errors.values.expand((messages) => messages as List).join('\n');
        }
        // Controller'ın döndüğü { "message": "..." } biçimi
        final message = data['message'];
        if (message is String) {
          return message;
        }
      }
    } on FormatException {
      // Gövde JSON değilse aşağıdaki genel mesaja düşer
    }

    if (response.statusCode == 404) {
      return 'Kayıt bulunamadı.';
    }
    return 'Sunucu hatası (${response.statusCode}).';
  }
}
