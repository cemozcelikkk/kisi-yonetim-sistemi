// Backend adresi. Çalıştırırken değiştirilebilir:
//   flutter run --dart-define=API_URL=http://192.168.1.20:5080
// Varsayılan 10.0.2.2: Android emülatörünün bilgisayardaki localhost'a ulaştığı özel adres.
const String apiBaseUrl = String.fromEnvironment('API_URL', defaultValue: 'http://10.0.2.2:5080');
