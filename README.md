# Kişi Yönetim Sistemi

Mobil Programlama dersi vize projesi. **Flutter (Dart)** ile yazılmış bir mobil uygulama, **ASP.NET Core Web API** ile yazılmış bir REST servisine HTTP/JSON üzerinden bağlanır ve kişiler üzerinde **listeleme, detay görüntüleme, ekleme, güncelleme ve silme (CRUD)** işlemleri yapar. Veriler SQLite veritabanında kalıcı olarak saklanır.

```
┌──────────────────────┐   HTTP + JSON (http)    ┌──────────────────────────┐   EF Core   ┌──────────────┐
│  mobile_app          │ ──────────────────────▶ │  backend_api             │ ──────────▶ │  persons.db  │
│  Flutter (Dart)      │ ◀────────────────────── │  ASP.NET Core Web API    │ ◀────────── │  (SQLite)    │
└──────────────────────┘                         └──────────────────────────┘             └──────────────┘
```

## Kullanılan teknolojiler

| Katman | Teknoloji |
| --- | --- |
| Mobil | Flutter 3.47, Dart 3.13, Material 3 |
| HTTP istemcisi | `http` paketi |
| E-posta / telefon açma | `url_launcher` paketi |
| Yazı tipleri | Fraunces (başlık), Inter (gövde) — uygulamaya gömülü, OFL lisanslı |
| Backend | ASP.NET Core Web API (.NET 10, C#) |
| Veritabanı | SQLite + Entity Framework Core 10 |
| API dokümantasyonu | Swagger / OpenAPI (Swashbuckle) |

## Klasör yapısı

```
mobiluygulama/
├── README.md
├── CODE_EXPLANATION.md          ← Kod açıklamaları ve savunma soruları
├── .gitignore
├── backend_api/                 ← ASP.NET Core Web API
│   ├── Controllers/
│   │   └── PersonsController.cs ← 5 REST endpoint
│   ├── Data/
│   │   └── AppDbContext.cs      ← EF Core bağlamı + örnek veriler
│   ├── Models/
│   │   └── Person.cs            ← Kişi modeli + doğrulama kuralları
│   ├── Properties/launchSettings.json ← Port ayarı (5080)
│   ├── appsettings.json         ← SQLite bağlantı cümlesi
│   ├── PersonApi.csproj
│   └── Program.cs               ← Uygulama başlangıcı, servis kayıtları
└── mobile_app/                  ← Flutter uygulaması
    ├── pubspec.yaml             ← Paketler ve yazı tipleri
    ├── android/                 ← Android ayarları (AndroidManifest.xml: internet izni)
    ├── assets/fonts/            ← Fraunces ve Inter yazı tipleri
    └── lib/
        ├── main.dart            ← Giriş noktası, tema, Türkçe dil
        ├── config.dart          ← API adresi
        ├── models/person.dart   ← Person modeli (fromJson / toJson)
        ├── services/person_service.dart ← Tüm API çağrıları
        ├── screens/
        │   ├── person_list_screen.dart   ← EKRAN 1: Kişi listesi
        │   ├── person_detail_screen.dart ← EKRAN 2: Kişi detayı
        │   └── person_form_screen.dart   ← EKRAN 3: Ekleme / düzenleme formu
        ├── theme/app_theme.dart ← Renkler, yazı stilleri, tema
        ├── widgets/             ← Tekrar kullanılan arayüz parçaları
        └── utils/               ← Tarih biçimleme, doğrulama
```

---

## 1. Backend kurulumu

### Gereksinimler
- [.NET 10 SDK](https://dotnet.microsoft.com/download) — kontrol: `dotnet --list-sdks`

Windows'ta tek komutla kurulum:
```powershell
winget install Microsoft.DotNet.SDK.10
```

### Çalıştırma
```bash
cd backend_api
dotnet restore        # NuGet paketlerini indirir
dotnet build          # Derler
dotnet run            # API'yi http://0.0.0.0:5080 adresinde başlatır
```

Çalıştığını doğrulamak için tarayıcıda açın:
- Swagger arayüzü: **http://localhost:5080/swagger**
- Kişi listesi (JSON): http://localhost:5080/api/persons

> API `0.0.0.0` üzerinde dinler; yani hem bilgisayarın kendisinden (`localhost`) hem de aynı ağdaki telefondan erişilebilir. Port `Properties/launchSettings.json` içindeki `applicationUrl` alanından değiştirilebilir.

### SQLite yapılandırması
- Bağlantı cümlesi `backend_api/appsettings.json` dosyasındadır:
  ```json
  "ConnectionStrings": { "Default": "Data Source=persons.db" }
  ```
- API ilk çalıştığında `Program.cs` içindeki `EnsureCreatedAsync()` çağrısı `backend_api/persons.db` dosyasını oluşturur ve `AppDbContext.cs` içindeki **10 örnek kişiyi** ekler.
- Veritabanı dosyası `.gitignore`'dadır; her bilgisayarda otomatik oluşur.
- **Veritabanını sıfırlamak için:** API'yi durdurun, `persons.db*` dosyalarını silin, tekrar `dotnet run` yapın.

---

## 2. REST endpoint tablosu

Taban adres: `http://localhost:5080`

| Metot | Uç nokta | Açıklama | Başarılı | Hata durumları |
| --- | --- | --- | --- | --- |
| GET | `/api/persons` | Tüm kişileri dizi olarak listeler (ada göre sıralı) | `200 OK` | — |
| GET | `/api/persons/{id}` | ID'si verilen kişinin tüm bilgilerini döner | `200 OK` | `404 Not Found` |
| POST | `/api/persons` | Yeni kişi oluşturur (gövde: JSON) | `201 Created` + `Location` başlığı | `400 Bad Request` (doğrulama) |
| PUT | `/api/persons/{id}` | Kişinin bilgilerini günceller | `200 OK` (güncel kişi) | `400`, `404` |
| DELETE | `/api/persons/{id}` | Kaydı veritabanından kalıcı olarak siler | `204 No Content` | `404 Not Found` |

Örnek JSON (POST / PUT gövdesi):
```json
{
  "fullName": "Ahmet Yılmaz",
  "department": "Yazılım Geliştirme",
  "photoUrl": "https://randomuser.me/api/portraits/men/32.jpg",
  "birthPlace": "Adana",
  "birthDate": "1994-04-12",
  "email": "ahmet.yilmaz@sirket.com",
  "phone": "+905550123456"
}
```

Doğrulama kuralları: `fullName` (2–100 karakter), `department`, `birthPlace`, `birthDate` (gelecekte olamaz), `email` (geçerli e-posta), `phone` (`+` ve 7–20 rakam/boşluk/tire) zorunludur. `photoUrl` isteğe bağlıdır, girilirse geçerli URL olmalıdır.

Doğrulama hatası örneği (`400`):
```json
{
  "title": "One or more validation errors occurred.",
  "status": 400,
  "errors": { "Email": ["Geçerli bir e-posta adresi giriniz."] }
}
```

### curl ile hızlı test
```bash
curl http://localhost:5080/api/persons
curl http://localhost:5080/api/persons/1
curl -X POST http://localhost:5080/api/persons -H "Content-Type: application/json" \
  -d '{"fullName":"Deneme Kisi","department":"QA","birthPlace":"Izmir","birthDate":"1990-01-01","email":"d@sirket.com","phone":"+905001112233"}'
curl -X PUT http://localhost:5080/api/persons/11 -H "Content-Type: application/json" \
  -d '{"fullName":"Deneme Kisi","department":"Ar-Ge","birthPlace":"Izmir","birthDate":"1990-01-01","email":"d@sirket.com","phone":"+905001112233"}'
curl -X DELETE http://localhost:5080/api/persons/11
```
(En kolayı: Swagger arayüzünde her endpoint için **Try it out → Execute**.)

---

## 3. Mobil uygulama kurulumu

### Gereksinimler
- [Flutter SDK](https://docs.flutter.dev/install) (stable, 3.47+) — `flutter` komutu PATH'te olmalı
- Android Studio: Android SDK, **Android SDK Command-line Tools** ve **NDK 28.2.13676358** (SDK Manager → SDK Tools)
- Windows'ta **Geliştirici Modu** açık olmalı (Ayarlar → Sistem → Geliştiriciler için). Flutter eklentileri bunu gerektirir.

Kontrol:
```bash
flutter doctor        # "Flutter" ve "Android toolchain" satırları ✓ olmalı
```

### Kurulum ve çalıştırma
```bash
cd mobile_app
flutter pub get       # Paketleri indirir
flutter run           # Bağlı emülatörde / telefonda çalıştırır
```
Uygulama çalışırken terminalde:
- `r` → **hot reload** (kod değişikliği anında yansır, ekran durumu korunur)
- `R` → **hot restart** (uygulama baştan başlar)
- `q` → çıkış

Diğer komutlar:
```bash
flutter analyze       # Statik kod analizi
flutter devices       # Bağlı cihazları listeler
```

### API adresinin yapılandırılması
Adres `lib/config.dart` dosyasında belirlenir. Varsayılan **`http://10.0.2.2:5080`**'dir: Android emülatörü bilgisayarın `localhost`'una bu özel adresle ulaşır.

Farklı bir adres için `--dart-define` kullanılır (kod değiştirmeye gerek yok):
```bash
flutter run --dart-define=API_URL=http://192.168.1.20:5080
```

| Ortam | Komut |
| --- | --- |
| Android emülatörü | `flutter run` |
| Fiziksel telefon (aynı Wi-Fi) | `flutter run --dart-define=API_URL=http://<bilgisayar-IP>:5080` |
| Tailscale ile | `flutter run --dart-define=API_URL=http://<tailscale-IP>:5080` |

### Android emülatör bağlantısı
1. Backend'i başlatın: `cd backend_api && dotnet run`
2. Android Studio → Device Manager → bir emülatör başlatın.
3. `cd mobile_app && flutter run`

### Fiziksel telefon bağlantısı
1. Telefonda **Geliştirici seçenekleri → USB hata ayıklama**'yı açın, USB ile bağlayın. `flutter devices` telefonu göstermeli.
2. Telefon ve bilgisayar **aynı Wi-Fi ağında** olmalıdır. Bilgisayarın IP'si: `ipconfig` → "IPv4 Address".
3. Windows Güvenlik Duvarı 5080 portunu engelleyebilir. Yönetici PowerShell'de:
   ```powershell
   netsh advfirewall firewall add rule name="PersonApi 5080" dir=in action=allow protocol=TCP localport=5080
   ```
4. Telefonun tarayıcısında `http://<bilgisayar-IP>:5080/api/persons` açılıyorsa bağlantı hazırdır.
5. `flutter run --dart-define=API_URL=http://<bilgisayar-IP>:5080`

> Kampüs/okul ağları cihazlar arası trafiği engelleyebilir. Bu durumda bilgisayarı telefonun mobil erişim noktasına (hotspot) bağlayın ve IP'yi yeniden kontrol edin.

---

## 4. APK

### APK oluşturma
```bash
cd mobile_app
flutter build apk --release --dart-define=API_URL=http://<backend-adresi>:5080
```
Çıktı: `mobile_app/build/app/outputs/flutter-apk/app-release.apk`

Telefona kurmak için: dosyayı telefona kopyalayıp açın (Android "bilinmeyen kaynaklardan yükleme" izni isteyebilir) veya USB ile bağlıyken `flutter install`.

> API adresi derleme anında APK'ye gömülür. Ağ/IP değişirse APK yeniden derlenmelidir.

### Hazır APK hakkında
Geliştiricinin APK'si backend'e **`http://100.64.164.79:5080`** adresinden bağlanır. Bu adres geliştiricinin bilgisayarının [Tailscale](https://tailscale.com) adresidir ve ağ değişse de aynı kalır. APK'nin çalışması için:
1. Bilgisayarda backend çalışmalı: `cd backend_api && dotnet run`
2. Bilgisayarda ve telefonda Tailscale açık olmalı, aynı hesapla giriş yapılmış olmalı.

Başka bir bilgisayarda/ağda kullanmak için APK'yi yukarıdaki komutla o bilgisayarın adresiyle yeniden derleyin.

---

## 5. Sunum günü kontrol listesi
1. `cd backend_api && dotnet run` → http://localhost:5080/swagger açılıyor mu?
2. Emülatör açık mı? `flutter devices` listede gösteriyor mu?
3. `cd mobile_app && flutter run` → uygulama liste ekranını gösteriyor mu?
4. Ekle → Detay → Düzenle → Sil akışını bir kez deneyin.
5. Bir satırı değiştirip `r` ile hot reload'un çalıştığını görün.

---

## 6. Sorun giderme

| Belirti | Çözüm |
| --- | --- |
| Uygulamada "Bağlantı kurulamadı" | Backend çalışıyor mu? Hata mesajındaki adres doğru mu? Telefonda `--dart-define=API_URL=...` verildi mi? |
| Emülatör bağlanamıyor | Adres `10.0.2.2` olmalı; `localhost` emülatörün kendisidir. |
| Telefon bağlanamıyor | Aynı Wi-Fi, güvenlik duvarı kuralı, telefonun tarayıcısından `/api/persons` testi |
| `flutter` bulunamadı | Flutter `bin` klasörünü PATH'e ekleyin, terminali yeniden açın. |
| Derlemede "NDK did not install" | Android Studio → SDK Manager → SDK Tools → Show Package Details → NDK 28.2.13676358 |
| Derlemede "symlink support" hatası | Windows Geliştirici Modu'nu açın. |
| `dotnet` bulunamadı | .NET 10 SDK kurun, terminali yeniden açın. |
| Port 5080 kullanımda | `launchSettings.json` içinde portu değiştirin, mobilde de adresi güncelleyin. |

---

> Projenin ilk sürümü React Native (Expo) ile yazılmıştı; o sürüm `react-native` dalında duruyor.
