# Kişi Yönetim Sistemi

Mobil Programlama dersi vize projesi. React Native (Expo) ile yazılmış bir mobil uygulama, ASP.NET Core Web API ile yazılmış bir REST servisine HTTP/JSON üzerinden bağlanır ve kişiler üzerinde **listeleme, detay görüntüleme, ekleme, güncelleme ve silme (CRUD)** işlemleri yapar. Veriler SQLite veritabanında kalıcı olarak saklanır.

```
┌──────────────────────┐   HTTP + JSON (axios)   ┌──────────────────────────┐   EF Core   ┌──────────────┐
│  mobile_app          │ ──────────────────────▶ │  backend_api             │ ──────────▶ │  persons.db  │
│  React Native + Expo │ ◀────────────────────── │  ASP.NET Core Web API    │ ◀────────── │  (SQLite)    │
└──────────────────────┘                         └──────────────────────────┘             └──────────────┘
```

## Kullanılan teknolojiler

| Katman | Teknoloji |
| --- | --- |
| Mobil | React Native 0.88, Expo SDK 58, TypeScript |
| Navigasyon | Expo Router (dosya tabanlı yönlendirme) |
| HTTP istemcisi | Axios |
| Yazı tipleri | Fraunces (başlık), Inter (gövde) — `@expo-google-fonts` |
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
└── mobile_app/                  ← React Native + Expo uygulaması
    ├── app.json                 ← Expo yapılandırması
    ├── eas.json                 ← APK derleme profili
    ├── .env.example             ← API adresi örneği
    └── src/
        ├── app/                 ← Ekranlar (Expo Router)
        │   ├── _layout.tsx      ← Stack navigasyon + font yükleme
        │   ├── index.tsx        ← EKRAN 1: Kişi listesi
        │   ├── person/[id].tsx  ← EKRAN 2: Kişi detayı
        │   └── form.tsx         ← EKRAN 3: Ekleme / düzenleme formu
        ├── components/          ← Tekrar kullanılan arayüz parçaları
        ├── constants/
        │   ├── config.ts        ← API adresi
        │   └── theme.ts         ← Tasarım token'ları (renk, boşluk, yazı)
        ├── services/
        │   └── personService.ts ← Tüm API çağrıları (axios)
        ├── types/person.ts      ← Person TypeScript tipi
        └── utils/               ← Tarih biçimleme, doğrulama, bildirim
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

> API `0.0.0.0` üzerinde dinler; yani hem bilgisayarın kendisinden (`localhost`) hem de aynı Wi-Fi ağındaki telefondan erişilebilir. Port `Properties/launchSettings.json` içindeki `applicationUrl` alanından değiştirilebilir.

### SQLite yapılandırması
- Bağlantı cümlesi `backend_api/appsettings.json` dosyasındadır:
  ```json
  "ConnectionStrings": { "Default": "Data Source=persons.db" }
  ```
- API ilk çalıştığında `Program.cs` içindeki `EnsureCreatedAsync()` çağrısı `backend_api/persons.db` dosyasını oluşturur ve `AppDbContext.cs` içindeki **10 örnek kişiyi** ekler.
- Veritabanı dosyası `.gitignore`'dadır; her bilgisayarda otomatik oluşur.
- **Veritabanını sıfırlamak için:** API'yi durdurun, `persons.db*` dosyalarını silin, tekrar `dotnet run` yapın.
- Veritabanını görsel incelemek için: [DB Browser for SQLite](https://sqlitebrowser.org/) veya VS Code "SQLite Viewer" eklentisi.

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
- Node.js 20+ (`node -v`)
- Telefon için **Expo Go** uygulaması (Play Store / App Store) **veya** Android Studio emülatörü

### Kurulum ve çalıştırma
```bash
cd mobile_app
npm install           # Bağımlılıkları kurar
npx expo start        # Geliştirme sunucusunu başlatır (QR kod çıkar)
```
Terminalde:
- `a` → Android emülatöründe açar
- QR kodu Expo Go ile okutun → fiziksel telefonda açar
- `w` → tarayıcıda açar (hızlı deneme için)

Diğer komutlar:
```bash
npm run typecheck     # TypeScript kontrolü (tsc --noEmit)
npm run lint          # ESLint
npx expo-doctor       # Expo yapılandırma kontrolü
```

### API adresinin yapılandırılması
Adres `src/constants/config.ts` dosyasında belirlenir:

| Ortam | Kullanılan adres | Yapılacak işlem |
| --- | --- | --- |
| Android emülatörü | `http://10.0.2.2:5080` | Hiçbir şey (varsayılan) |
| iOS simülatörü / web | `http://localhost:5080` | Hiçbir şey (varsayılan) |
| Fiziksel telefon | `http://<bilgisayar-IP>:5080` | `.env` dosyası oluşturun (aşağıda) |

### Android emülatör bağlantısı
Android emülatörü kendi içinde ayrı bir sanal makinedir; emülatörün içindeki `localhost` emülatörün kendisidir. Bilgisayarınızın `localhost`'una ulaşmak için özel adres **`10.0.2.2`** kullanılır. Uygulama Android'de bu adresi otomatik kullanır.

1. Backend'i başlatın: `cd backend_api && dotnet run`
2. Android Studio → Device Manager → bir emülatör başlatın.
3. Emülatörün tarayıcısında `http://10.0.2.2:5080/api/persons` açarak bağlantıyı test edin.
4. `cd mobile_app && npx expo start` → `a` tuşu.

### Fiziksel telefon bağlantısı
1. Telefon ve bilgisayar **aynı Wi-Fi ağında** olmalıdır.
2. Bilgisayarın yerel IP adresini bulun: Windows'ta `ipconfig` → "IPv4 Address" (ör. `192.168.1.20`). macOS: `ipconfig getifaddr en0`.
3. `mobile_app/.env` dosyası oluşturun (`.env.example`'ı kopyalayın):
   ```
   EXPO_PUBLIC_API_URL=http://192.168.1.20:5080
   ```
4. Windows Güvenlik Duvarı 5080 portunu engelleyebilir. Yönetici PowerShell'de:
   ```powershell
   netsh advfirewall firewall add rule name="PersonApi 5080" dir=in action=allow protocol=TCP localport=5080
   ```
5. Telefonun tarayıcısında `http://192.168.1.20:5080/api/persons` açılıyorsa bağlantı hazırdır.
6. Önbelleği temizleyerek başlatın: `npx expo start -c` → QR kodu Expo Go ile okutun.

> `.env` değiştiğinde Expo sunucusunu `-c` ile yeniden başlatmak gerekir; `EXPO_PUBLIC_` değişkenleri derleme anında koda gömülür.
> Kampüs/okul ağları cihazlar arası trafiği engelleyebilir. Bu durumda telefonun mobil erişim noktasına (hotspot) bilgisayarı bağlayın ve IP'yi yeniden kontrol edin.

---

## 4. APK oluşturma

Android 9+ varsayılan olarak şifresiz `http://` trafiğini engeller. Yerel backend'e bağlanabilmek için `app.json` içinde `expo-build-properties` eklentisiyle `usesCleartextTraffic: true` ayarlanmıştır.

### Yöntem A — EAS Build (bulutta, Android Studio gerekmez) — önerilen
1. `mobile_app/eas.json` içindeki `EXPO_PUBLIC_API_URL` değerini sunum günü kullanılacak bilgisayarın IP'si ile güncelleyin.
2. Ücretsiz bir Expo hesabı açın (https://expo.dev) ve komutları çalıştırın:
   ```bash
   cd mobile_app
   npx eas-cli@latest login
   npx eas-cli@latest build -p android --profile preview
   ```
3. Derleme bitince verilen bağlantıdan `.apk` dosyasını indirip telefona kurun.

### Yöntem B — Yerel derleme (Android Studio + JDK 17 gerekir)
```bash
cd mobile_app
npx expo prebuild -p android     # android/ klasörünü oluşturur
cd android
./gradlew assembleRelease        # Windows: gradlew.bat assembleRelease
```
APK: `mobile_app/android/app/build/outputs/apk/release/app-release.apk`

> IP adresi APK'nin içine gömüldüğü için ağ değişirse APK yeniden derlenmelidir. Sunum günü en güvenlisi Expo Go ile `npx expo start` kullanmak ve APK'yi yedek olarak bulundurmaktır.

---

## 5. Sunum günü kontrol listesi
1. `cd backend_api && dotnet run` → http://localhost:5080/swagger açılıyor mu?
2. Telefon/emülatör tarayıcısından `/api/persons` açılıyor mu?
3. `cd mobile_app && npx expo start -c` → uygulama liste ekranını gösteriyor mu?
4. Ekle → Detay → Düzenle → Sil akışını bir kez deneyin.

---

## 6. GitHub'a yükleme
```bash
cd mobiluygulama                     # proje kök klasörü
git init
git add .
git commit -m "Kişi Yönetim Sistemi: ASP.NET Core API + React Native mobil uygulama"
git branch -M main
# GitHub'da boş ve açık (public) bir repo oluşturun, ardından:
git remote add origin https://github.com/<kullanici-adi>/kisi-yonetim-sistemi.git
git push -u origin main
```
`.gitignore` sayesinde `node_modules`, `bin`, `obj`, `persons.db` ve `.env` yüklenmez. Repo kökünde `mobile_app/` ve `backend_api/` iki ayrı klasör olarak görünür.

---

## 7. Sorun giderme

| Belirti | Çözüm |
| --- | --- |
| Uygulamada "Bağlantı kurulamadı" | Backend çalışıyor mu? Hata mesajındaki adres doğru mu? Telefonda `.env` IP'si güncel mi? |
| Emülatör bağlanamıyor | `10.0.2.2` kullanıldığından emin olun; `.env` dosyasında `localhost` yazmayın. |
| Telefon bağlanamıyor | Aynı Wi-Fi, güvenlik duvarı kuralı, `npx expo start -c` |
| `dotnet` bulunamadı | .NET 10 SDK kurun, terminali yeniden açın. |
| Port 5080 kullanımda | `launchSettings.json` içinde portu değiştirin, mobilde de adresi güncelleyin. |
