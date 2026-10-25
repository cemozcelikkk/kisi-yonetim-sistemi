# Kod Açıklaması — Kişi Yönetim Sistemi

Bu doküman canlı kod savunmasına hazırlık içindir: mimariyi, her önemli dosyanın görevini, veri akışını ve hocanın sorabileceği soruları açıklar.

---

## 1. Mimari

Proje **istemci–sunucu (client–server)** mimarisindedir. İki bağımsız uygulama HTTP üzerinden JSON alışverişi yapar.

```
[Ekran (React bileşeni)]
      │  kullanıcı bir şey yapar (açılır, butona basar)
      ▼
[personService.ts]  ── axios ile HTTP isteği ──▶  [PersonsController.cs]
                                                         │ EF Core (async)
                                                         ▼
                                                  [AppDbContext] ──▶ persons.db (SQLite)
      ▲                                                  │
      └──────────────── JSON cevap ◀─────────────────────┘
[setState → ekran yeniden çizilir]
```

**Katmanlar ve sorumluluklar**

| Katman | Dosya(lar) | Sorumluluk |
| --- | --- | --- |
| Model | `Models/Person.cs` | Verinin şekli ve doğrulama kuralları |
| Veri erişimi | `Data/AppDbContext.cs` | Veritabanı tablosu + örnek veriler |
| API | `Controllers/PersonsController.cs` | HTTP isteğini karşılar, doğru durum kodunu döner |
| Başlangıç | `Program.cs` | Servisleri kaydeder, veritabanını oluşturur, Swagger'ı açar |
| Mobil servis | `src/services/personService.ts` | Tüm HTTP çağrıları tek yerde |
| Mobil ekranlar | `src/app/*.tsx` | Kullanıcı arayüzü + ekran durumu (state) |
| Mobil bileşenler | `src/components/*.tsx` | Tekrar kullanılan görsel parçalar |
| Tasarım | `src/constants/theme.ts` | Renk, boşluk, yazı tipi token'ları |

Bilinçli olarak **basit** tutuldu: Redux yok, repository/service katmanı yok, DTO yok. Her dosyanın tek bir görevi var.

---

## 2. Önemli dosyalar

### Backend (`backend_api/`)

**`Program.cs`** — Uygulamanın giriş noktası.
- `AddDbContext<AppDbContext>(o => o.UseSqlite(...))`: EF Core'u SQLite ile kaydeder (Dependency Injection).
- `AddControllers()`: Controller sınıflarını etkinleştirir.
- `AddProblemDetails()` + `UseExceptionHandler()`: Beklenmeyen hatalarda uygulama çökmez, `500` ve standart JSON döner.
- `AddSwaggerGen()` + `UseSwagger()` + `UseSwaggerUI()`: `/swagger` adresinde test arayüzü.
- `AddCors(...)` + `UseCors()`: Tarayıcıdan (Expo web) gelen isteklere izin verir. Telefon uygulamaları CORS'a tabi değildir.
- `EnsureCreatedAsync()`: Veritabanı dosyası yoksa tabloyla birlikte oluşturur ve `HasData` ile verilen örnek kişileri ekler.

**`Models/Person.cs`** — Kişi sınıfı. Hem veritabanı tablosu hem JSON gövdesi olarak kullanılır.
- `[Required]`, `[StringLength]`, `[EmailAddress]`, `[Url]`, `[RegularExpression]`: Data Annotation doğrulama kuralları. `[ApiController]` bunları otomatik çalıştırır, kural bozulursa `400` döner.
- `DateOnly? BirthDate`: Sadece tarih (saat yok). JSON'da `"1994-04-12"` olarak görünür. Nullable yapıldı ki gövdede hiç gönderilmezse `[Required]` hatası versin (yoksa sessizce `0001-01-01` olurdu).

**`Data/AppDbContext.cs`** — `DbContext`'ten türer. `DbSet<Person> Persons` → `Persons` tablosu. `OnModelCreating` içinde `HasData(...)` ile 10 örnek kişi.

**`Controllers/PersonsController.cs`** — 5 endpoint. Ayrıntısı aşağıda.

**`appsettings.json`** — `ConnectionStrings:Default = "Data Source=persons.db"`.

**`Properties/launchSettings.json`** — `applicationUrl: http://0.0.0.0:5080`. `0.0.0.0` = tüm ağ arayüzlerinde dinle (telefon erişebilsin diye).

### Mobil (`mobile_app/src/`)

| Dosya | Görevi |
| --- | --- |
| `app/_layout.tsx` | Kök Stack navigasyon, yazı tiplerini yükler, başlık stilleri |
| `app/index.tsx` | Kişi listesi (GET all), FAB, yükleniyor/hata/boş durumları |
| `app/person/[id].tsx` | Detay (GET by id), e-posta/telefon aksiyonları, Düzenle/Sil (DELETE) |
| `app/form.tsx` | Ekleme (POST) ve düzenleme (PUT) için ortak form |
| `services/personService.ts` | axios örneği + `getPersons`, `getPerson`, `createPerson`, `updatePerson`, `deletePerson`, `getErrorMessage` |
| `types/person.ts` | `Person` arayüzü ve `PersonInput` (= id'siz Person) |
| `constants/config.ts` | `API_BASE_URL` (env değişkeni veya platforma göre varsayılan) |
| `constants/theme.ts` | Renkler, boşluklar, köşe yarıçapları, yazı stilleri |
| `components/PersonRow.tsx` | Listede bir satır (fotoğraf + ad + departman) |
| `components/Avatar.tsx` | Dairesel fotoğraf; yoksa baş harfler |
| `components/InfoRow.tsx` | Detayda etiket + değer satırı (tıklanabilir olabilir) |
| `components/Button.tsx` | primary / secondary / danger buton |
| `components/FormField.tsx` | Etiketli TextInput, odak ve hata görünümü |
| `components/ConfirmDialog.tsx` | Silme onay penceresi (Modal) |
| `components/StateView.tsx` | Yükleniyor / hata / boş durum görünümü |
| `utils/validation.ts` | Form doğrulama (backend kurallarının aynısı) |
| `utils/format.ts` | Tarih (`12 Nisan 1994`), telefon biçimleme, baş harfler |
| `utils/notify.ts` | Bilgi mesajı (Alert; web'de window.alert) |

**Expo Router dosya tabanlıdır:** `src/app` içindeki dosya yolu = ekranın URL'si.
- `index.tsx` → `/`
- `person/[id].tsx` → `/person/5` (köşeli parantez = dinamik parametre)
- `form.tsx` → `/form` (ekleme) veya `/form?id=5` (düzenleme)

---

## 3. GET, POST, PUT, DELETE mantığı

### GET `/api/persons` — liste
- **Backend:** `GetAll()` → `_db.Persons.AsNoTracking().OrderBy(p => p.FullName).ToListAsync()` → `200 OK` + JSON dizi.
  `AsNoTracking`: sadece okuduğumuz için EF'in değişiklik takibine gerek yok, daha hızlı.
- **Mobil:** `index.tsx` → `useFocusEffect` içinde `loadPersons()` → `getPersons()` → `setPersons(data)` → `FlatList` yeniden çizilir.

### GET `/api/persons/{id}` — detay
- **Backend:** `GetById(int id)` → `FindAsync(id)`; `null` ise `404 NotFound`, değilse `200 OK`.
  `{id:int}` route kısıtı: `/api/persons/abc` gibi istekler controller'a hiç ulaşmaz (404).
- **Mobil:** `person/[id].tsx` → `useLocalSearchParams()` ile URL'den id alınır → `getPerson(personId)`.

### POST `/api/persons` — ekleme
- **Backend:** `Create(Person person)`
  1. `[ApiController]` gövdeyi `Person`'a çevirir ve doğrular → hatalıysa otomatik `400`.
  2. Doğum tarihi gelecekte mi? → `ValidationProblem` (`400`).
  3. `person.Id = 0` → id'yi istemci belirleyemez, SQLite otomatik artırır.
  4. `Add` + `SaveChangesAsync` → INSERT.
  5. `CreatedAtAction(...)` → `201 Created`, `Location: /api/persons/11` başlığı ve oluşan kişi (id dahil).
- **Mobil:** `form.tsx` → `validatePerson` → `createPerson(payload)` → dönen `created.id` ile `router.replace('/person/' + id)` → yeni kişinin detayı açılır.

### PUT `/api/persons/{id}` — güncelleme
- **Backend:** `Update(int id, Person input)`
  1. Gövdedeki id URL'deki id'den farklıysa `400`.
  2. `FindAsync(id)` → yoksa `404`.
  3. Alanlar tek tek kopyalanır, `SaveChangesAsync` → EF değişen alanlar için UPDATE üretir.
  4. `200 OK` + güncel kişi.
- **Mobil:** `form.tsx` (`id` parametresi varsa) → `updatePerson(id, payload)` → `router.back()` → detay ekranı odaklanınca kendini yeniden yükler.

### DELETE `/api/persons/{id}` — silme
- **Backend:** `FindAsync` → yoksa `404`; varsa `Remove` + `SaveChangesAsync` → `204 No Content` (gövde yok).
- **Mobil:** Detayda **Sil** → `ConfirmDialog` açılır → **Sil** onayı → `deletePerson(id)` → `router.back()` → liste odaklanınca yenilenir.

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

## 4. async/await

Ağ ve veritabanı işlemleri **zaman alır**. Senkron yazılsaydı:
- Mobilde arayüz (JS thread) donar, kullanıcı hiçbir şeye dokunamazdı.
- Sunucuda istek başına bir thread boşta beklerdi, aynı anda az istek karşılanırdı.

**C# tarafı**
```csharp
public async Task<ActionResult<Person>> GetById(int id)
{
    var person = await _db.Persons.FindAsync(id);   // DB cevabı beklenirken thread serbest kalır
    ...
}
```
- `async` metot `Task<T>` döner. `await`, işlem bitene kadar metodu "duraklatır" ama thread'i bloklamaz; thread başka isteklere hizmet eder.
- EF Core'un `ToListAsync`, `FindAsync`, `SaveChangesAsync` metotları asenkron veritabanı erişimidir.

**TypeScript tarafı**
```ts
const loadPersons = useCallback(async () => {
  try {
    setError(null);
    const data = await getPersons();   // Promise çözülene kadar bekle
    setPersons(data);
  } catch (err) {
    setError(getErrorMessage(err));    // ağ hatası / 4xx / 5xx
  } finally {
    setLoading(false);                 // her durumda yükleniyor biter
  }
}, []);
```
- `axios.get` bir **Promise** döner. `await` ile sonucu bekleriz; hata olursa `catch` bloğuna düşer.
- `finally` başarılı da olsa hatalı da olsa çalışır → spinner her durumda kapanır.
- Axios, `2xx` dışındaki durum kodlarında (400, 404, 500) Promise'i **reject** eder; bu yüzden hata yönetimi tek `catch` ile yapılır.

---

## 5. JSON veri akışı (örnek: yeni kişi ekleme)

1. Kullanıcı formu doldurur. Değerler `values` state'inde string olarak tutulur.
2. `handleSubmit` → `validatePerson(values)` → hata yoksa `payload` nesnesi (`PersonInput`) oluşturulur. Boş fotoğraf → `null`.
3. `createPerson(payload)` → `api.post('/api/persons', payload)`. Axios nesneyi **JSON.stringify** ile metne çevirir, `Content-Type: application/json` başlığıyla gönderir.
4. ASP.NET Core **System.Text.Json** ile gövdeyi okuyup `Person` nesnesine çevirir (model binding). JSON'daki `fullName` → C#'taki `FullName` (camelCase ↔ PascalCase otomatik).
5. Doğrulama → `SaveChangesAsync` → SQLite `INSERT`.
6. Controller `Person` nesnesini döner → System.Text.Json yeniden camelCase JSON'a çevirir → `201` cevabı.
7. Axios JSON'u **parse** eder → `response.data` artık `Person` tipinde bir JS nesnesi.
8. `router.replace('/person/' + created.id)` → detay ekranı.

Tarih özel durumu: C# `DateOnly` ↔ JSON `"1994-04-12"` ↔ TS `string`. Ekranda `formatDate` ile `12 Nisan 1994` gösterilir.

---

## 6. React Native state yönetimi

Redux veya Context **kullanılmadı**; her ekran kendi verisini `useState` ile yönetir ve API'yi "tek doğru kaynak" kabul eder.

| Hook | Nerede | Ne için |
| --- | --- | --- |
| `useState` | Tüm ekranlar | `persons`, `person`, `loading`, `error`, `values`, `errors`, `submitting`, `confirmVisible` |
| `useFocusEffect` | Liste ve detay | Ekran **her odaklandığında** veriyi yeniden çeker |
| `useCallback` | `loadPersons`, `loadPerson` | Fonksiyonun her render'da yeniden oluşmasını engeller; `useFocusEffect` gereksiz tetiklenmez |
| `useEffect` | Form | Düzenleme modunda kişi verisini bir kez yükler |
| `useLocalSearchParams` | Detay, form | URL'deki `id` parametresini okur |
| `useSafeAreaInsets` | Liste, detay, form | Çentik/gezinme çubuğu boşlukları |

**Liste neden kendiliğinden güncelleniyor?** Ekleme/düzenleme/silme sonrası `router.back()` veya `router.replace()` ile önceki ekrana dönülür. O ekran yeniden **odaklandığı** için `useFocusEffect` çalışır ve API'den güncel veriyi çeker. Global state gerekmez.

**Kontrollü bileşen (controlled input):** `TextInput`'un değeri `value={values.email}` ile state'ten gelir; her tuşta `onChangeText` → `handleChange` → `setValues` çağrılır. Böylece state ve ekran her zaman aynıdır.

**Ekran durumları:** `loading` → spinner, `error` → hata mesajı + "Tekrar dene", veri boş → "Henüz kimse yok". Hepsi `StateView` bileşeniyle gösterilir.

---

## 7. Tasarım sistemi

`src/constants/theme.ts` tek kaynak. Ekranlarda sabit renk/sayı yazılmaz, `colors.aubergine`, `spacing.xl` gibi token'lar kullanılır.

| Token | Renk | Kullanım |
| --- | --- | --- |
| `bone` | `#F3EEE7` Soft Bone | Ana arka plan |
| `porcelain` | `#E8E0D6` Warm Porcelain | Detaydaki fotoğraf alanı, basılı satır, avatar zemini |
| `surface` | `#FBF8F4` | Form alanlarının zemini |
| `aubergine` | `#2B1830` Deep Aubergine | Başlıklar, ad-soyad, birincil butonlar, FAB |
| `plum` | `#5A465A` Smoky Plum | İkincil metinler, etiketler |
| `saffron` | `#D98A1E` Burnt Marigold / Saffron | Küçük vurgular: FAB `+`, başlık çizgileri, zorunlu alan yıldızı, link alt çizgisi |
| `ash` | `#CFC8C2` Soft Ash | Kenarlıklar ve ayırıcı çizgiler |
| `ink` | `#1A1618` Charcoal Ink | Form girdileri ve bilgi değerleri (yüksek kontrast) |
| `danger` | `#9E3B36` | Hata mesajları, silme aksiyonu |

- **Tipografi:** Fraunces (serif) başlıklarda; `typography.note` ile Fraunces italik "not" satırları (liste altındaki kişi sayısı, detaydaki departman, bölüm başlıkları). Gövde Inter. Bold yalnızca ad-soyad ve butonlarda.
- **Yerleşim:** Satırlar kart değil, ince `ash` çizgiyle ayrılır. Detayda porselen bir görsel alan ve ona taşan büyük fotoğraf var (fotoğrafın etrafındaki `bone` renkli halka iki yüzeyi ayırır).
- **Gölge:** Tek bir token (`shadow.soft`), yalnızca FAB ve onay penceresinde. Köşe yarıçapı 8–14px.

---

## 8. Hocanın sorabileceği teknik sorular ve cevapları

**1. REST nedir, projede nasıl uyguladın?**
Kaynak odaklı bir API stilidir. Kaynak `persons`, adresi `/api/persons`. İşlem türünü HTTP metodu belirler (GET oku, POST oluştur, PUT güncelle, DELETE sil). Durumsuzdur; her istek kendi başına anlamlıdır.

**2. PUT ile PATCH farkı nedir?**
PUT kaynağın tamamını gönderip değiştirir; PATCH sadece değişen alanları gönderir. Formda tüm alanları düzenlediğimiz için PUT kullandım.

**3. POST neden 201, DELETE neden 204 dönüyor?**
201 "yeni kaynak oluşturuldu" demektir; `CreatedAtAction` ayrıca `Location` başlığına yeni kaydın adresini koyar. 204 "başarılı ama gönderilecek içerik yok" demektir; silinen kaydı geri döndürmeye gerek yok.

**4. `[ApiController]` attribute'u ne yapar?**
Gövdeyi otomatik olarak parametreye bağlar (`[FromBody]` yazmaya gerek kalmaz) ve ModelState geçersizse action çalışmadan otomatik `400 ValidationProblem` döner.

**5. Dependency Injection nedir? `AppDbContext` controller'a nasıl geliyor?**
`Program.cs`'te `AddDbContext` ile servis kaydedilir. ASP.NET Core her istekte controller'ı oluştururken constructor'daki `AppDbContext` parametresini görür ve kayıtlı örneği verir. Biz `new` yazmayız. DbContext varsayılan olarak "scoped"tur: her HTTP isteğine bir tane.

**6. Entity Framework Core nedir, neden kullandın?**
ORM'dir: C# nesnelerini veritabanı tablolarına eşler. SQL yazmadan `_db.Persons.Add(p)` ve `SaveChangesAsync()` ile INSERT yapılır. Veritabanı değiştirmek (SQLite → SQL Server) sadece `UseSqlite` satırını değiştirmeyi gerektirir.

**7. `SaveChangesAsync` çağırmazsan ne olur?**
`Add`, `Remove` veya alan değişiklikleri sadece bellekte (change tracker) kalır; veritabanına yazılmaz.

**8. `EnsureCreated` ile Migration farkı nedir?**
`EnsureCreated` veritabanı yoksa modele göre bir kerede oluşturur; şema sonradan değişirse güncellemez. Migration ise şema değişikliklerini sürüm sürüm uygular. Tek tablolu ve şeması sabit bir vize projesi için `EnsureCreated` daha basit. Model değişirse `persons.db` silinip yeniden oluşturulur.

**9. Örnek veriler nasıl ekleniyor?**
`AppDbContext.OnModelCreating` içinde `HasData(...)` ile. `EnsureCreated` tabloyu oluştururken bu kayıtları da ekler. Seed verilerinde Id'ler elle verilir.

**10. Veri doğrulaması nerede yapılıyor? Neden iki yerde?**
Mobilde `utils/validation.ts` (kullanıcıya anında geri bildirim, gereksiz istek yok) ve backend'de Data Annotations (asıl güvenlik; Swagger veya curl ile gelen istekler mobil doğrulamayı atlayabilir). Sunucu doğrulaması zorunlu, istemci doğrulaması kullanıcı deneyimi içindir.

**11. Android emülatöründe neden `localhost` değil `10.0.2.2`?**
Emülatör ayrı bir sanal cihazdır; içindeki `localhost` emülatörün kendisini gösterir. `10.0.2.2`, emülatörden ana bilgisayarın loopback adresine yönlendirilen özel adrestir. Fiziksel telefonda ise bilgisayarın Wi-Fi IP'si kullanılır.

**12. Backend neden `0.0.0.0`'da dinliyor?**
`localhost`'ta dinleyen bir sunucuya sadece aynı bilgisayardan erişilir. `0.0.0.0` tüm ağ arayüzlerinde dinler; telefon aynı ağdan IP ile erişebilir.

**13. `usesCleartextTraffic` neden gerekli?**
Android 9'dan itibaren `http://` (şifresiz) trafik varsayılan olarak engellenir. Yerel backend HTTPS değil, bu yüzden APK'de izin verilmesi gerekir. Expo Go geliştirme modunda buna zaten izin verir.

**14. axios neden, `fetch` yerine?**
`baseURL` ve `timeout` ile tek bir örnek oluşturulabilir, JSON'u otomatik çevirir, 4xx/5xx durumlarında otomatik hata fırlatır (`fetch` fırlatmaz, `response.ok` kontrol etmek gerekir), `isAxiosError` ile hata türünü ayırmak kolaydır.

**15. API çağrılarını neden ayrı bir dosyada topladın?**
Tek sorumluluk ve tekrar kullanım: adres veya başlık değişirse tek yer değişir. Ekranlar HTTP ayrıntısını bilmez, sadece `getPersons()` çağırır.

**16. `useEffect` ile `useFocusEffect` farkı?**
`useEffect` bileşen ilk eklendiğinde (ve bağımlılıklar değişince) çalışır. Stack navigasyonda alttaki ekran bellekte kalır, geri dönüldüğünde `useEffect` tekrar çalışmaz. `useFocusEffect` ise ekran her görünür olduğunda çalışır; listeyi güncel tutmak için onu kullandım.

**17. `useCallback` neden kullanıldı?**
`useFocusEffect` verilen fonksiyon değişirse yeniden çalışır. `useCallback` olmadan her render'da yeni fonksiyon oluşur ve gereksiz yeniden yüklemeler olabilir. Bağımlılık dizisi (`[personId]`) değişmedikçe aynı fonksiyon kullanılır.

**18. `FlatList` neden `ScrollView` + `map` yerine?**
`FlatList` sadece ekranda görünen satırları çizer (virtualization); uzun listelerde bellek ve performans avantajı sağlar. Ayrıca `ListHeaderComponent`, `ListEmptyComponent`, `ItemSeparatorComponent` ve aşağı çekip yenileme (`onRefresh`) hazır gelir.

**19. `keyExtractor` ne işe yarar?**
React'in her satırı benzersiz bir anahtarla tanımasını sağlar; liste değiştiğinde sadece değişen satırları günceller. Kişinin `id`'sini string olarak kullandım.

**20. E-postaya basınca e-posta uygulaması nasıl açılıyor?**
`Linking.openURL('mailto:adres')` ve `Linking.openURL('tel:numara')`. İşletim sistemi bu URL şemalarını işleyen uygulamayı (Android'de intent) açar. Açılamazsa `catch` ile kullanıcıya mesaj gösterilir.

**21. Silme onayında neden `Alert.alert` değil de `Modal`?**
`Alert.alert` Android'de buton rengini değiştirmeye izin vermez ve web'de çalışmaz. `ConfirmDialog` bileşeni `Modal` ile yapıldı; butonların rengi ve yazısı tasarım token'larıyla kontrol edilir.

**22. TypeScript'in projeye katkısı nedir?**
`Person` arayüzü sayesinde `person.fullName` yazarken yanlış alan adı derleme anında yakalanır, axios çağrılarında `api.get<Person[]>` ile dönen verinin tipi bilinir. `PersonInput = Omit<Person, 'id'>` ile POST gövdesinde id olmaması tip seviyesinde garanti edilir.

**23. Sunucuya ulaşılamazsa ne oluyor?**
Axios hatasında `error.response` yoksa (sunucu kapalı, yanlış IP, 10 sn timeout) `getErrorMessage` "Sunucuya ulaşılamadı..." mesajını ve denenen adresi döner. Liste ekranı bunu "Bağlantı kurulamadı" başlığı ve "Tekrar dene" butonuyla gösterir.

**24. Aynı form hem ekleme hem düzenleme için nasıl çalışıyor?**
`form.tsx` URL'de `id` parametresi var mı diye bakar (`isEdit`). Varsa önce `getPerson` ile alanları doldurur ve kaydederken `updatePerson` (PUT) çağırır; yoksa boş form açar ve `createPerson` (POST) çağırır.

**25. `EXPO_PUBLIC_API_URL` nasıl çalışır?**
Expo, `EXPO_PUBLIC_` ile başlayan ortam değişkenlerini derleme sırasında koda gömer; `process.env.EXPO_PUBLIC_API_URL` ile okunur. Bu yüzden gizli bilgi (parola, anahtar) için kullanılmamalıdır; biz sadece sunucu adresini koyuyoruz.

**26. CORS nedir, mobilde neden önemli değil?**
Tarayıcıların, bir sitenin başka bir alan adına istek atmasını kısıtlayan güvenlik kuralıdır. Native mobil uygulamalar tarayıcı olmadığı için CORS uygulanmaz; sadece Expo web önizlemesi için açtım.

**27. Rastgele bir e-posta yazınca neden kabul ediliyor? Adresin gerçek olduğunu nasıl anlarsın?**
Doğrulama yalnızca **biçimi** kontrol eder: `ad@alan.uzanti`, uzantı en az 2 harf, Türkçe karakter yok. Aynı düzenli ifade (regex) hem `validation.ts`'de hem `Person.cs`'teki `[RegularExpression]`'da var. Hazır `[EmailAddress]` attribute'u kullanılmadı çünkü `a@b` gibi noktasız adresleri bile kabul ediyor. Adresin gerçekten var olduğunu hiçbir regex bilemez; bunun tek yolu o adrese doğrulama bağlantısı içeren bir e-posta göndermektir. Bu projenin kapsamı dışında.

---

## 9. Canlı kod değişikliği örnekleri

Her örnekte hangi dosyada neyin değişeceği yazılıdır. Değişiklik sonrası Expo otomatik yenilenir (Fast Refresh). Backend değişikliklerinden sonra `dotnet run` yeniden başlatılmalıdır.

### 1) Listede departman yerine telefon numarasını göster
`src/components/PersonRow.tsx`
```tsx
<Text style={styles.department} numberOfLines={1}>
  {person.phone}            {/* önce: {person.department} */}
</Text>
```
İsterseniz biçimli göstermek için: `import { formatPhone } from '../utils/format';` ve `{formatPhone(person.phone)}`.

### 2) Silme onayındaki butonun rengini değiştir
`src/components/ConfirmDialog.tsx` → `styles.confirmButton`
```ts
confirmButton: {
  backgroundColor: colors.aubergine,   // önce: colors.danger
},
```
Ya da tamamen yeni bir renk: `backgroundColor: '#1F6F50'`.

### 3) FAB'ın rengini / simgesini değiştir
`src/app/index.tsx`
```tsx
<Feather name="user-plus" size={26} color={colors.white} />   // önce: "plus", colors.saffron
```
Zemin: `styles.fab.backgroundColor: colors.saffron`.

### 4) Liste başlığını değiştir ("Kişiler" → "Rehber")
`src/app/index.tsx` → `<Text style={styles.title}>Rehber</Text>`

### 5) Listeyi ada göre değil departmana göre sırala
`backend_api/Controllers/PersonsController.cs` → `GetAll()`
```csharp
.OrderBy(p => p.Department).ThenBy(p => p.FullName)
```
Alternatif (sadece mobilde): `index.tsx` içinde `setPersons([...data].sort((a, b) => a.department.localeCompare(b.department, 'tr')));`

### 6) Profil fotoğraflarını büyüt / küçült
`src/components/PersonRow.tsx` → `<Avatar ... size={64} />` (önce 52). Ayırıcı çizgi hizası için `index.tsx` → `styles.separator.marginLeft` içindeki `52`'yi de `64` yapın.

### 7) Detayda yeni bir bilgi satırı göster (ör. kişinin yaşı)
`src/app/person/[id].tsx` → "Doğum tarihi" satırının altına:
```tsx
<InfoRow
  label="Yaş"
  value={String(new Date().getFullYear() - Number(person.birthDate.slice(0, 4)))}
/>
```

### 8) Telefonu zorunlu olmaktan çıkar
- Mobil: `src/utils/validation.ts` → `if (values.phone.trim() && !PHONE_REGEX.test(values.phone.trim()))`
- Backend: `Models/Person.cs` → `Phone` üzerindeki `[Required]` satırını silin. (Form etiketi için `form.tsx` içinde telefon alanındaki `required`'ı kaldırın.)

### 9) Yeni kişi eklendikten sonra detay yerine listeye dön
`src/app/form.tsx` → `handleSubmit` içinde
```tsx
router.back();   // önce: router.replace(`/person/${created.id}`);
```

### 10) Ana vurgu rengini değiştir (tüm uygulamada)
`src/constants/theme.ts`
```ts
saffron: '#2F8FE5',   // önce: '#D98A1E'
```
Token sistemi sayesinde FAB simgesi, başlık çizgileri ve yıldızlar birlikte değişir.

### Bonus örnekler
- **Silme onay metnini değiştir:** `person/[id].tsx` → `ConfirmDialog`'un `title` / `message` prop'ları.
- **"Düzenle" butonunu sola al:** `person/[id].tsx` → `actionBar` içindeki iki `View`'in sırasını değiştirin.
- **API zaman aşımını 5 saniye yap:** `personService.ts` → `timeout: 5000`.
- **Yeni bir örnek kişi ekle:** `AppDbContext.cs` → `HasData` içine `Id = 11` ile yeni satır; ardından `persons.db` dosyalarını silip API'yi yeniden başlatın.
- **Yeni bir alan ekle (ör. `City`):** `Person.cs`'e özellik → `persons.db` sil → `types/person.ts`'e alan → `validation.ts`'deki `PersonFormValues` otomatik genişler → `form.tsx`'te `EMPTY_FORM`, `setValues`, `payload` ve yeni `FormField` → `[id].tsx`'te yeni `InfoRow`.
