# Kod Açıklaması — Kişi Yönetim Sistemi

Bu doküman canlı kod savunmasına hazırlık içindir: mimariyi, her önemli dosyanın görevini, veri akışını ve hocanın sorabileceği soruları açıklar.

---

## 1. Mimari

Proje **istemci–sunucu (client–server)** mimarisindedir. İki bağımsız uygulama HTTP üzerinden JSON alışverişi yapar.

```
[Ekran (Flutter widget'ı)]
      │  kullanıcı bir şey yapar (ekran açılır, butona basar)
      ▼
[person_service.dart]  ── http paketiyle istek ──▶  [PersonsController.cs]
                                                          │ EF Core (async)
                                                          ▼
                                                   [AppDbContext] ──▶ persons.db (SQLite)
      ▲                                                   │
      └──────────────── JSON cevap ◀──────────────────────┘
[Person.fromJson → FutureBuilder ekranı yeniden çizer]
```

**Katmanlar ve sorumluluklar**

| Katman | Dosya(lar) | Sorumluluk |
| --- | --- | --- |
| Model (backend) | `Models/Person.cs` | Verinin şekli ve doğrulama kuralları |
| Veri erişimi | `Data/AppDbContext.cs` | Veritabanı tablosu + örnek veriler |
| API | `Controllers/PersonsController.cs` | HTTP isteğini karşılar, doğru durum kodunu döner |
| Başlangıç | `Program.cs` | Servisleri kaydeder, veritabanını oluşturur, Swagger'ı açar |
| Model (mobil) | `lib/models/person.dart` | `Person` sınıfı, JSON ↔ nesne dönüşümü |
| Mobil servis | `lib/services/person_service.dart` | Tüm HTTP çağrıları tek yerde |
| Mobil ekranlar | `lib/screens/*.dart` | Kullanıcı arayüzü + ekran durumu (state) |
| Mobil widget'lar | `lib/widgets/*.dart` | Tekrar kullanılan görsel parçalar |
| Tasarım | `lib/theme/app_theme.dart` | Renkler, yazı stilleri, Material teması |

Bilinçli olarak **basit** tutuldu: Provider/Bloc/Riverpod yok, repository katmanı yok, DTO yok. Her dosyanın tek bir görevi var.

---

## 2. Önemli dosyalar

### Backend (`backend_api/`)

**`Program.cs`** — Uygulamanın giriş noktası.
- `AddDbContext<AppDbContext>(o => o.UseSqlite(...))`: Entity Framework Core'u SQLite ile kaydeder (Dependency Injection).
- `AddControllers()`: Controller sınıflarını etkinleştirir.
- `AddProblemDetails()` + `UseExceptionHandler()`: Beklenmeyen hatalarda uygulama çökmez, `500` ve standart JSON döner.
- `AddSwaggerGen()` + `UseSwagger()` + `UseSwaggerUI()`: `/swagger` adresinde test arayüzü.
- `AddCors(...)` + `UseCors()`: Tarayıcıdan (ör. Flutter web) gelen isteklere izin verir. Telefon uygulamaları CORS'a tabi değildir.
- `EnsureCreatedAsync()`: Veritabanı dosyası yoksa tabloyla birlikte oluşturur ve `HasData` ile verilen örnek kişileri ekler.

**`Models/Person.cs`** — Kişi sınıfı. Hem veritabanı tablosu hem JSON gövdesi olarak kullanılır.
- `[Required]`, `[StringLength]`, `[Url]`, `[RegularExpression]`: Data Annotation doğrulama kuralları. `[ApiController]` bunları otomatik çalıştırır, kural bozulursa `400` döner.
- `DateOnly? BirthDate`: Sadece tarih (saat yok). JSON'da `"1994-04-12"` olarak görünür. Nullable yapıldı ki gövdede hiç gönderilmezse `[Required]` hatası versin (yoksa sessizce `0001-01-01` olurdu).

**`Data/AppDbContext.cs`** — `DbContext`'ten türer. `DbSet<Person> Persons` → `Persons` tablosu. `OnModelCreating` içinde `HasData(...)` ile 10 örnek kişi.

**`Controllers/PersonsController.cs`** — 5 endpoint. Ayrıntısı aşağıda.

**`appsettings.json`** — `ConnectionStrings:Default = "Data Source=persons.db"`.

**`Properties/launchSettings.json`** — `applicationUrl: http://0.0.0.0:5080`. `0.0.0.0` = tüm ağ arayüzlerinde dinle (telefon erişebilsin diye).

### Mobil (`mobile_app/lib/`)

| Dosya | Görevi |
| --- | --- |
| `main.dart` | `main()` → `runApp`, `MaterialApp`, tema ve Türkçe dil ayarı, ilk ekran |
| `config.dart` | `apiBaseUrl` (`--dart-define=API_URL=...` ile değiştirilebilir, varsayılan `10.0.2.2:5080`) |
| `models/person.dart` | `Person` sınıfı, `fromJson` (JSON → nesne) ve `toJson` (nesne → JSON) |
| `services/person_service.dart` | `getPersons`, `getPerson`, `createPerson`, `updatePerson`, `deletePerson` + hata mesajı üretimi (`ApiException`) |
| `screens/person_list_screen.dart` | EKRAN 1: liste (GET all), başlık, FAB, aşağı çekip yenileme |
| `screens/person_detail_screen.dart` | EKRAN 2: detay (GET by id), e-posta/telefon aksiyonları, Düzenle, Sil (DELETE) + onay diyaloğu |
| `screens/person_form_screen.dart` | EKRAN 3: ekleme (POST) ve düzenleme (PUT) için ortak form |
| `theme/app_theme.dart` | `AppColors` (renkler), `AppText` (yazı stilleri), `buildAppTheme()` |
| `widgets/person_row.dart` | Listede bir satır: fotoğraf + kalın ad + departman |
| `widgets/person_avatar.dart` | Dairesel fotoğraf (`CircleAvatar` + `NetworkImage`); yoksa baş harfler |
| `widgets/info_row.dart` | Detayda etiket + değer satırı (tıklanabilir olabilir) |
| `widgets/overline.dart` | Başlık üstündeki küçük etiket ("REHBER") |
| `widgets/error_view.dart` | Hata mesajı + "Tekrar dene" |
| `utils/validators.dart` | Form doğrulama (backend kurallarının aynısı) |
| `utils/format.dart` | Tarih biçimleme (`1994-04-12` ↔ `12.04.1994`), baş harfler, Türkçe büyük harf |

**Diğer önemli dosyalar**
- `pubspec.yaml`: Paketler (`http`, `url_launcher`, `flutter_localizations`) ve uygulamaya gömülü yazı tipleri (Fraunces, Inter).
- `android/app/src/main/AndroidManifest.xml`: `INTERNET` izni ve `usesCleartextTraffic="true"` (http backend için), uygulama adı.
- `assets/fonts/`: Yazı tipi dosyaları ve açık lisansları (OFL).

**Ekranlar arası geçiş (navigasyon):**
- Liste → Detay: `Navigator.push(context, MaterialPageRoute(builder: (_) => PersonDetailScreen(personId: person.id)))`
- Liste → Yeni kişi: `Navigator.push(... PersonFormScreen())`
- Detay → Düzenle: `Navigator.push(... PersonFormScreen(person: person))`
- Geri dönüş: `Navigator.pop(context)`

---

## 3. GET, POST, PUT, DELETE mantığı

### GET `/api/persons` — liste
- **Backend:** `GetAll()` → `_db.Persons.AsNoTracking().OrderBy(p => p.FullName).ToListAsync()` → `200 OK` + JSON dizi.
  `AsNoTracking`: sadece okuduğumuz için EF'in değişiklik takibine gerek yok, daha hızlı.
- **Mobil:** `PersonListScreen.initState` → `_personsFuture = PersonService.getPersons()` → `FutureBuilder` sonucu bekler → `ListView.builder` satırları çizer.

### GET `/api/persons/{id}` — detay
- **Backend:** `GetById(int id)` → `FindAsync(id)`; `null` ise `404 NotFound`, değilse `200 OK`.
  `{id:int}` route kısıtı: `/api/persons/abc` gibi istekler controller'a hiç ulaşmaz (404).
- **Mobil:** Liste, `PersonDetailScreen(personId: person.id)` ile id'yi constructor'dan geçirir → `PersonService.getPerson(widget.personId)`.

### POST `/api/persons` — ekleme
- **Backend:** `Create(Person person)`
  1. `[ApiController]` gövdeyi `Person`'a çevirir ve doğrular → hatalıysa otomatik `400`.
  2. Doğum tarihi gelecekte mi? → `ValidationProblem` (`400`).
  3. `person.Id = 0` → id'yi istemci belirleyemez, SQLite otomatik artırır.
  4. `Add` + `SaveChangesAsync` → INSERT.
  5. `CreatedAtAction(...)` → `201 Created`, `Location: /api/persons/11` başlığı ve oluşan kişi (id dahil).
- **Mobil:** `PersonFormScreen._save` → `_formKey.currentState!.validate()` → `Person(...)` nesnesi → `PersonService.createPerson(person)` → `Navigator.pop` → liste kendini yeniler.

### PUT `/api/persons/{id}` — güncelleme
- **Backend:** `Update(int id, Person input)`
  1. Gövdedeki id URL'deki id'den farklıysa `400`.
  2. `FindAsync(id)` → yoksa `404`.
  3. Alanlar tek tek kopyalanır, `SaveChangesAsync` → EF değişen alanlar için UPDATE üretir.
  4. `200 OK` + güncel kişi.
- **Mobil:** Form `person` parametresiyle açıldıysa (`_isEdit`) → `PersonService.updatePerson(person)` → `Navigator.pop` → detay ekranı `_reload()` ile güncel veriyi çeker.

### DELETE `/api/persons/{id}` — silme
- **Backend:** `FindAsync` → yoksa `404`; varsa `Remove` + `SaveChangesAsync` → `204 No Content` (gövde yok).
- **Mobil:** Detayda **Sil** → `showDialog` ile `AlertDialog` → **Sil** onayı (`true` döner) → `PersonService.deletePerson(id)` → `Navigator.pop` → liste `_reload()` ile yenilenir.

### Durum kodları özeti
| Kod | Anlamı | Nerede |
| --- | --- | --- |
| 200 OK | Başarılı, gövde var | GET, PUT |
| 201 Created | Yeni kaynak oluştu | POST |
| 204 No Content | Başarılı, gövde yok | DELETE |
| 400 Bad Request | Gönderilen veri hatalı | POST, PUT |
| 404 Not Found | Kayıt yok | GET/PUT/DELETE by id |
| 500 Internal Server Error | Sunucuda beklenmeyen hata | `UseExceptionHandler` |

---

## 4. Asenkron programlama: `Future`, `async`/`await`

Ağ ve veritabanı işlemleri **zaman alır**. Senkron yazılsaydı:
- Mobilde arayüz donar, kullanıcı hiçbir şeye dokunamazdı (Flutter arayüzü tek bir thread'de çizer).
- Sunucuda istek başına bir thread boşta beklerdi, aynı anda az istek karşılanırdı.

**C# tarafı**
```csharp
public async Task<ActionResult<Person>> GetById(int id)
{
    var person = await _db.Persons.FindAsync(id);   // DB cevabı beklenirken thread serbest kalır
    ...
}
```
- `async` metot `Task<T>` döner. `await`, işlem bitene kadar metodu "duraklatır" ama thread'i bloklamaz.

**Dart tarafı**
```dart
static Future<List<Person>> getPersons() async {
  final response = await _send(() => http.get(_url()));   // cevap gelene kadar bekle
  final List<dynamic> data = _decode(response);           // JSON metni → Dart listesi
  return data.map((item) => Person.fromJson(item as Map<String, dynamic>)).toList();
}
```
- `Future<T>`: "ileride bir T değeri gelecek" sözü. C#'taki `Task<T>`, JavaScript'teki `Promise` ile aynı fikir.
- `await` beklerken Dart'ın **event loop**'u boş kalmaz; animasyonlar ve dokunmalar çalışmaya devam eder.
- Hata olursa `await` satırı istisna (exception) fırlatır; `try`/`on ApiException catch (e)` ile yakalanır.

**`_send` ne yapıyor?** (`person_service.dart`)
1. İsteği `timeout(10 sn)` ile gönderir. Ağ hatası/zaman aşımı → `ApiException("Sunucuya ulaşılamadı...")`.
2. Durum kodu `200–299` ise cevabı döner.
3. Değilse gövdeyi okuyup Türkçe mesaj üretir: ASP.NET doğrulama hataları (`errors`), controller'ın `message` alanı veya `404`.

> `http` paketi, `fetch` gibi, 400/404/500 cevaplarında **kendiliğinden hata fırlatmaz**. Bu yüzden durum kodunu `_send` içinde kendimiz kontrol ediyoruz.

**`FutureBuilder`** (liste ve detay ekranı)
```dart
FutureBuilder<List<Person>>(
  future: _personsFuture,
  builder: (context, snapshot) {
    if (snapshot.hasData) return _buildList(snapshot.data!);                    // veri geldi
    if (snapshot.connectionState != ConnectionState.done) return ...spinner;   // bekleniyor
    return ErrorView(message: '${snapshot.error}', onRetry: _reload);          // hata
  },
)
```
- Future'ı dinler, durumu değiştikçe `builder`'ı yeniden çağırır. Yükleniyor / veri / hata durumları tek yerde.
- Future'ı **`initState` içinde** oluşturuyoruz. `build` içinde oluştursaydık her yeniden çizimde yeni bir istek atılırdı.

---

## 5. JSON veri akışı (örnek: yeni kişi ekleme)

1. Kullanıcı formu doldurur. Her alanın içeriği bir `TextEditingController`'da durur; doğum tarihi `showDatePicker` ile seçilip `_birthDate` (`DateTime`) değişkenine yazılır.
2. **Kaydet** → `_save()` → `_formKey.currentState!.validate()` her alanın `validator` fonksiyonunu çalıştırır. Hata varsa alanın altında kırmızı mesaj çıkar ve istek atılmaz.
3. Hata yoksa `Person(...)` nesnesi oluşturulur. Boş fotoğraf adresi → `null`.
4. `PersonService.createPerson(person)` → `jsonEncode(person.toJson())` nesneyi JSON metnine çevirir → `http.post(..., headers: {'Content-Type': 'application/json'}, body: ...)`.
5. ASP.NET Core gövdeyi okuyup `Person` nesnesine çevirir (model binding). JSON'daki `fullName` → C#'taki `FullName` (camelCase ↔ PascalCase otomatik).
6. Doğrulama → `SaveChangesAsync` → SQLite `INSERT`.
7. Controller `201` ile oluşan kişiyi JSON olarak döner.
8. Mobilde `utf8.decode(response.bodyBytes)` → `jsonDecode` → `Map` → `Person.fromJson` → `Person` nesnesi (artık `id`'si var).
9. `SnackBar` ile "… eklendi" mesajı, `Navigator.pop` ile listeye dönüş, liste `_reload()` ile güncel veriyi çeker.

**Tarih özel durumu:** C# `DateOnly` ↔ JSON `"1994-04-12"` ↔ Dart `DateTime`. Gelirken `DateTime.parse`, giderken `formatIsoDate`. Ekranda `formatDisplayDate` ile `12.04.1994` gösterilir.

**Türkçe karakter:** Gövde `utf8.decode(response.bodyBytes)` ile çözülür; böylece "Şule Çağlar" bozulmaz.

---

## 6. Flutter'da state (durum) yönetimi

Provider, Bloc veya Riverpod **kullanılmadı**; her ekran kendi verisini `StatefulWidget` + `setState` ile yönetir ve API'yi "tek doğru kaynak" kabul eder.

| Kavram | Nerede | Ne için |
| --- | --- | --- |
| `StatelessWidget` | `PersonRow`, `PersonAvatar`, `InfoRow`, `ErrorView`, `Overline` | Sadece aldığı parametreleri çizer, kendi durumu yok |
| `StatefulWidget` + `State` | Üç ekran | Değişen veri tutar (`_personsFuture`, `_deleting`, `_saving`, `_birthDate`) |
| `initState()` | Üç ekran | Ekran ilk açıldığında bir kez çalışır: ilk API isteği, formu doldurma |
| `setState(() { ... })` | `_reload`, `_deleting`, `_saving`, tarih seçimi | "Durum değişti, `build`'i yeniden çalıştır" der |
| `dispose()` | Form | `TextEditingController`'ları bellekten temizler |
| `mounted` | `await` sonrası her yer | Ekran kapandıysa `setState`/`context` kullanılmaz (hata önlenir) |
| `GlobalKey<FormState>` | Form | Tüm alanları tek seferde `validate()` etmek için |

**Liste neden kendiliğinden güncelleniyor?**
```dart
Future<void> _openDetail(Person person) async {
  await Navigator.push(context, MaterialPageRoute(builder: (_) => PersonDetailScreen(personId: person.id)));
  if (mounted) _reload();
}
```
`Navigator.push` bir `Future` döner ve açılan ekran kapanınca (`pop`) tamamlanır. `await` ile dönüşü bekleyip `_reload()` çağırıyoruz. Detayda düzenleme veya silme olduysa liste güncel veriyi çeker. Global state gerekmez.

**Ekran durumları:** veri yokken bekleniyor → `CircularProgressIndicator`, hata → `ErrorView` + "Tekrar dene", liste boş → bilgi metni.

---

## 7. Tasarım sistemi (Modern Editorial)

`lib/theme/app_theme.dart` tek kaynak. Ekranlarda renk kodu yazılmaz; `AppColors.aubergine`, `AppText.title` gibi isimler kullanılır.

| Sabit | Renk | Kullanım |
| --- | --- | --- |
| `silver` | `#DDE3E8` Ice Silver | Ana zemin |
| `silverLight` | `#EEF1F4` | Bilgi panelleri, diyalog ve tarih seçici zemini |
| `aubergine` | `#3A0F34` Deep Aubergine | Başlıklar, ad-soyad, ana butonlar, FAB |
| `marigold` | `#EAAA00` Marigold | Sadece vurgu: başlık üstü çizgi, FAB `+`, foto halkası, e-posta/telefon aksiyonları, odaklanan form alanı |
| `muted` | `#5E4A5B` | İkincil metinler ve etiketler |
| `hairline` | `%15 saydam Aubergine` | İnce ayırıcı çizgiler |
| `danger` | `#A3262A` | Silme aksiyonu |

- **Tipografi:** Fraunces (serif) büyük başlıklarda ve italik bölüm başlıklarında; Inter (sans-serif) metinlerde. Etiketler küçük, büyük harfli ve harf aralıklı (`AppText.label`).
- **Türkçe büyük harf:** Dart'ın `toUpperCase()`'i dilden bağımsızdır, "yeri" → "YERI" yapar. `toUpperTr()` önce `i` → `İ` çevirir: "DOĞUM YERİ".
- **Yazı tipleri uygulamaya gömülü** (`pubspec.yaml` → `fonts:`). İnternet olmasa da aynı görünür.
- **`buildAppTheme()`:** Material bileşenlerinin (buton, form alanı, diyalog, SnackBar, FAB, tarih seçici) görünümü burada bir kez ayarlanır; ekranlar ayrıca stil yazmaz.

---

## 8. Hocanın sorabileceği teknik sorular ve cevapları

**1. REST nedir, projede nasıl uyguladın?**
Kaynak odaklı bir API stilidir. Kaynak `persons`, adresi `/api/persons`. İşlem türünü HTTP metodu belirler (GET oku, POST oluştur, PUT güncelle, DELETE sil). Durumsuzdur; her istek kendi başına anlamlıdır.

**2. PUT ile PATCH farkı nedir?**
PUT kaynağın tamamını gönderip değiştirir; PATCH sadece değişen alanları gönderir. Formda tüm alanları düzenlediğimiz için PUT kullandım.

**3. POST neden 201, DELETE neden 204 dönüyor?**
201 "yeni kaynak oluşturuldu" demektir; `CreatedAtAction` ayrıca `Location` başlığına yeni kaydın adresini koyar. 204 "başarılı ama gönderilecek içerik yok" demektir.

**4. `[ApiController]` attribute'u ne yapar?**
Gövdeyi otomatik olarak parametreye bağlar ve ModelState geçersizse action çalışmadan otomatik `400 ValidationProblem` döner.

**5. Dependency Injection nedir? `AppDbContext` controller'a nasıl geliyor?**
`Program.cs`'te `AddDbContext` ile servis kaydedilir. ASP.NET Core controller'ı oluştururken constructor'daki `AppDbContext` parametresini görür ve kayıtlı örneği verir. DbContext "scoped"tur: her HTTP isteğine bir tane.

**6. Entity Framework Core nedir, neden kullandın?**
ORM'dir: C# nesnelerini veritabanı tablolarına eşler. SQL yazmadan `_db.Persons.Add(p)` ve `SaveChangesAsync()` ile INSERT yapılır.

**7. `SaveChangesAsync` çağırmazsan ne olur?**
`Add`, `Remove` veya alan değişiklikleri sadece bellekte kalır; veritabanına yazılmaz.

**8. `EnsureCreated` ile Migration farkı nedir?**
`EnsureCreated` veritabanı yoksa bir kerede oluşturur; şema sonradan değişirse güncellemez. Migration şema değişikliklerini sürüm sürüm uygular. Tek tablolu bir vize projesi için `EnsureCreated` daha basit.

**9. Veri doğrulaması nerede yapılıyor? Neden iki yerde?**
Mobilde `utils/validators.dart` (anında geri bildirim, gereksiz istek yok) ve backend'de Data Annotations (asıl güvenlik; Swagger veya curl ile gelen istekler mobil doğrulamayı atlar). Sunucu doğrulaması zorunlu, istemci doğrulaması kullanıcı deneyimi içindir.

**10. Android emülatöründe neden `localhost` değil `10.0.2.2`?**
Emülatör ayrı bir sanal cihazdır; içindeki `localhost` emülatörün kendisidir. `10.0.2.2`, emülatörden bilgisayarın loopback adresine yönlendirilen özel adrestir. Fiziksel telefonda bilgisayarın IP'si kullanılır (`--dart-define=API_URL=...`).

**11. `--dart-define` ve `String.fromEnvironment` nasıl çalışır?**
`flutter run --dart-define=API_URL=http://...` derleme sırasında bir sabit tanımlar. `config.dart`'taki `const String.fromEnvironment('API_URL', defaultValue: ...)` bu değeri okur; verilmezse varsayılanı kullanır. Derleme anında koda gömüldüğü için gizli bilgi (parola) koymak doğru olmaz.

**12. AndroidManifest'e neden `INTERNET` izni ve `usesCleartextTraffic` ekledin?**
`INTERNET` izni olmadan uygulama ağa çıkamaz (Flutter bunu sadece debug derlemesine kendisi ekler; release APK'de şart). `usesCleartextTraffic`: Android 9'dan beri şifresiz `http://` trafiği varsayılan olarak engellenir; yerel backend HTTPS olmadığı için izin verdik.

**13. `StatelessWidget` ile `StatefulWidget` farkı?**
Stateless sadece parametrelerine göre çizer, değişmez (`PersonRow`). Stateful'ın bir `State` nesnesi vardır; içindeki değişkenler değişince `setState` ile ekran yeniden çizilir (ekranlar).

**14. `setState` ne yapar? Çağırmazsan ne olur?**
Flutter'a "durum değişti, bu widget'ın `build` metodunu yeniden çalıştır" der. Değişkeni değiştirip `setState` çağırmazsan değişken değişir ama ekran güncellenmez.

**15. `FutureBuilder` neden kullandın? Future'ı neden `build` içinde oluşturmadın?**
Yükleniyor/veri/hata durumlarını tek yerde yönetir. `build` sık çalışır (her `setState`, klavye açılması...). Future orada oluşturulsaydı her seferinde yeni bir HTTP isteği atılırdı. Bu yüzden `initState`'te bir kez oluşturuluyor, yenilemek için `_reload()` yeni Future atıyor.

**16. `mounted` kontrolü neden var?**
`await` sırasında kullanıcı geri tuşuna basıp ekranı kapatmış olabilir. Kapanmış ekranda `setState` veya `context` kullanmak hata verir. `if (!mounted) return;` bunu önler.

**17. `fromJson` / `toJson` ne işe yarıyor? `factory` nedir?**
`fromJson` sunucudan gelen `Map`'i tip güvenli bir `Person` nesnesine çevirir; `toJson` tersini yapar. `factory` constructor her zaman yeni nesneyi doğrudan oluşturmak zorunda olmayan, mantık içerebilen bir constructor'dır; JSON'dan nesne üretmek için yaygın kullanılır.

**18. Dart'ta `?`, `!`, `??` ne demek? (Null safety)**
`String?` = null olabilir. `snapshot.data!` = "burada null olmadığından eminim". `widget.person?.id ?? 0` = person null ise `0` kullan. Derleyici null olabilecek bir değeri kontrolsüz kullanmana izin vermez.

**19. `final`, `const` ve `late` farkı?**
`final` bir kez atanır (çalışma anında). `const` derleme anında bilinen sabittir; `const` widget'lar yeniden oluşturulmaz (performans). `late` değişkenin daha sonra (ör. `initState`'te) atanacağını söyler: `late Future<List<Person>> _personsFuture;`.

**20. `ListView.builder` neden? `Column` + `map` olmaz mıydı?**
`ListView.builder` satırları ihtiyaç oldukça (ekrana girdikçe) oluşturur; uzun listelerde bellek ve performans avantajı sağlar. `Column` kaydırılamaz ve hepsini bir anda çizer.

**21. Ekranlar arasında veri nasıl taşınıyor?**
Constructor parametresiyle: `PersonDetailScreen(personId: person.id)`, `PersonFormScreen(person: person)`. `Navigator.push` yeni ekranı yığına (stack) ekler, `Navigator.pop` çıkarır.

**22. Aynı form hem ekleme hem düzenleme için nasıl çalışıyor?**
`PersonFormScreen`'in `person` parametresi var mı diye bakılır (`_isEdit`). Varsa `initState`'te alanlar doldurulur ve kaydederken `updatePerson` (PUT) çağrılır; yoksa boş form açılır ve `createPerson` (POST) çağrılır.

**23. `TextEditingController` neden var, neden `dispose` ediliyor?**
Metin kutusunun içeriğini okumak/yazmak için. Dinleyiciler ve kaynak tutar; ekran kapanınca `dispose()` ile serbest bırakılmazsa bellek sızıntısı olur.

**24. Form doğrulaması nasıl çalışıyor?**
Her `TextFormField`'ın `validator` fonksiyonu var; hata varsa mesaj (`String`), yoksa `null` döner. `_formKey.currentState!.validate()` hepsini çalıştırır, hepsi `null` ise `true` döner.

**25. E-postaya basınca e-posta uygulaması nasıl açılıyor?**
`url_launcher` paketinin `launchUrl(Uri(scheme: 'mailto', path: email))` fonksiyonu. Android'de bu bir **intent** başlatır; `mailto:` için e-posta, `tel:` için arama uygulaması açılır. Açılamazsa `SnackBar` ile mesaj gösterilir.

**26. Silme onayı nasıl çalışıyor?**
`showDialog<bool>` bir `AlertDialog` açar ve kullanıcı butona basana kadar bekler. "Vazgeç" `Navigator.pop(context, false)`, "Sil" `Navigator.pop(context, true)` döner. Sadece `true` gelirse DELETE isteği atılır.

**27. Neden `http` paketi? (`dio` yerine)**
Dart ekibinin resmi, sade paketi; bu projenin ihtiyacı için yeterli. Ortak işler (zaman aşımı, durum kodu kontrolü, hata mesajı) `_send` metodunda bir kez yazıldı.

**28. Hot reload ile hot restart farkı?**
Hot reload (`r`) değişen kodu çalışan uygulamaya enjekte eder, ekranın durumu korunur. Hot restart (`R`) uygulamayı baştan başlatır, durum sıfırlanır. `initState` veya `main` değişikliklerinde hot restart gerekir.

**29. Sunucuya ulaşılamazsa ne oluyor?**
`_send` içindeki `try` bloğu ağ hatasını veya 10 saniyelik zaman aşımını yakalar ve "Sunucuya ulaşılamadı..." mesajıyla birlikte denenen adresi içeren bir `ApiException` fırlatır. Liste ekranı bunu "Bağlantı kurulamadı" başlığı ve "Tekrar dene" butonuyla gösterir.

**30. Rastgele bir e-posta yazınca neden kabul ediliyor?**
Doğrulama yalnızca **biçimi** kontrol eder: `ad@alan.uzanti`, uzantı en az 2 harf, Türkçe karakter yok. Aynı düzenli ifade (regex) hem `validators.dart`'ta hem `Person.cs`'teki `[RegularExpression]`'da var. Adresin gerçekten var olduğunu hiçbir regex bilemez; bunun tek yolu doğrulama e-postası göndermektir.

**31. CORS nedir, mobilde neden önemli değil?**
Tarayıcıların, bir sitenin başka bir adrese istek atmasını kısıtlayan güvenlik kuralıdır. Mobil uygulamalar tarayıcı olmadığı için CORS uygulanmaz; sadece tarayıcıdan (Flutter web) denemek için açık.

---

## 9. Canlı kod değişikliği örnekleri

Uygulama `flutter run` ile çalışırken dosyayı kaydedin, terminalde **`r`** (hot reload) tuşuna basın. `initState` veya `main` gibi başlangıç kodu değiştiyse **`R`** (hot restart). Backend değişikliklerinden sonra `dotnet run` yeniden başlatılmalıdır.

### 1) Listede departman yerine telefon numarasını göster
`lib/widgets/person_row.dart`
```dart
Text(person.phone, style: AppText.secondary, maxLines: 1, overflow: TextOverflow.ellipsis),
// önce: Text(person.department, ...)
```

### 2) Silme onayındaki butonun rengini değiştir
`lib/screens/person_detail_screen.dart` → `_confirmDelete` içindeki `FilledButton`
```dart
style: FilledButton.styleFrom(backgroundColor: Colors.green, minimumSize: const Size(88, 48)),
// önce: backgroundColor: AppColors.danger
```
Tüm uygulamadaki silme rengini değiştirmek için: `lib/theme/app_theme.dart` → `AppColors.danger`.

### 3) FAB'ın rengini / simgesini değiştir
- Simge: `lib/screens/person_list_screen.dart` → `child: const Icon(Icons.person_add, size: 28)` (önce `Icons.add`).
- Renk: `lib/theme/app_theme.dart` → `floatingActionButtonTheme` içindeki `backgroundColor` / `foregroundColor`.

### 4) Liste başlığını değiştir ("Kişiler" → "Rehber")
`lib/screens/person_list_screen.dart` → `_Header` içinde `const Text('Rehber', style: AppText.hero)`.

### 5) Listeyi ada göre değil departmana göre sırala
`backend_api/Controllers/PersonsController.cs` → `GetAll()`
```csharp
.OrderBy(p => p.Department).ThenBy(p => p.FullName)
```
Alternatif (sadece mobilde): `person_service.dart` → `getPersons` içindeki `return` satırının yerine
```dart
final persons = data.map((item) => Person.fromJson(item as Map<String, dynamic>)).toList();
persons.sort((a, b) => a.department.compareTo(b.department));
return persons;
```

### 6) Profil fotoğraflarını büyüt / küçült
`lib/widgets/person_row.dart` → `PersonAvatar(..., radius: 32)` (önce 26). Detaydaki büyük fotoğraf: `person_detail_screen.dart` → `radius: 72`.

### 7) Detayda yeni bir bilgi satırı göster (ör. kişinin yaşı)
`lib/screens/person_detail_screen.dart` → "Kişisel bilgiler" bölümünde "Doğum tarihi" satırının altına:
```dart
InfoRow(label: 'Yaş', value: '${DateTime.now().year - person.birthDate.year}', showDivider: false),
```
(Üstteki "Doğum tarihi" satırında `showDivider: false`'u silin ki aralarında çizgi olsun.)

### 8) Telefonu zorunlu olmaktan çıkar
- Mobil: `lib/utils/validators.dart` → `validatePhone` başına `if (value == null || value.trim().isEmpty) return null;`
- Backend: `Models/Person.cs` → `Phone` üzerindeki `[Required]` satırını silin.

### 9) Yeni kişi eklendikten sonra listeye değil, yeni kişinin detayına git
`lib/screens/person_form_screen.dart` → `_save` içinde
```dart
final created = await PersonService.createPerson(person);
if (!mounted) return;
Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => PersonDetailScreen(personId: created.id)));
```
(Dosyanın başına `import 'person_detail_screen.dart';` ekleyin.)

### 10) Ana vurgu rengini değiştir (tüm uygulamada)
`lib/theme/app_theme.dart`
```dart
static const marigold = Color(0xFF2F8FE5); // önce: Color(0xFFEAAA00)
```
Başlık çizgileri, FAB simgesi, foto halkası ve aksiyon daireleri birlikte değişir.

### Bonus örnekler
- **Silme onay metnini değiştir:** `person_detail_screen.dart` → `AlertDialog`'un `title` / `content`'i.
- **"Düzenle" ve "Sil" butonlarının yerini değiştir:** `_buildActions` içindeki iki `Expanded`'ın sırasını değiştirin.
- **API zaman aşımını 5 saniye yap:** `person_service.dart` → `Duration(seconds: 5)`.
- **Yeni bir örnek kişi ekle:** `AppDbContext.cs` → `HasData` içine `Id = 11` ile yeni satır; ardından `persons.db` dosyalarını silip API'yi yeniden başlatın.
- **Yeni bir alan ekle (ör. `City`):** `Person.cs`'e özellik → `persons.db` sil → `person.dart`'ta alan + `fromJson`/`toJson` → formda yeni `TextEditingController` ve `TextFormField` → detayda yeni `InfoRow`.
