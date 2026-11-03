import '../utils/format.dart';

// API'den gelen kişi JSON'unun Dart karşılığı.
// Alan adları backend'deki JSON ile birebir aynıdır (camelCase).
class Person {
  final int id;
  final String fullName;
  final String department;
  final String? photoUrl; // İsteğe bağlı: null olabilir
  final String birthPlace;
  final DateTime birthDate;
  final String email;
  final String phone;

  const Person({
    this.id = 0, // Yeni kişide 0 gönderilir, id'yi veritabanı verir
    required this.fullName,
    required this.department,
    this.photoUrl,
    required this.birthPlace,
    required this.birthDate,
    required this.email,
    required this.phone,
  });

  // JSON (Map) → Person nesnesi. GET cevaplarında kullanılır.
  factory Person.fromJson(Map<String, dynamic> json) {
    return Person(
      id: json['id'] as int,
      fullName: json['fullName'] as String,
      department: json['department'] as String,
      photoUrl: json['photoUrl'] as String?,
      birthPlace: json['birthPlace'] as String,
      birthDate: DateTime.parse(json['birthDate'] as String), // "1994-04-12"
      email: json['email'] as String,
      phone: json['phone'] as String,
    );
  }

  // Person nesnesi → JSON (Map). POST ve PUT gövdesinde kullanılır.
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'fullName': fullName,
      'department': department,
      'photoUrl': photoUrl,
      'birthPlace': birthPlace,
      'birthDate': formatIsoDate(birthDate), // Backend "YYYY-MM-DD" bekler
      'email': email,
      'phone': phone,
    };
  }
}
