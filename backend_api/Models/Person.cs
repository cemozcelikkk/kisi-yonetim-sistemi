using System.ComponentModel.DataAnnotations;

namespace PersonApi.Models;

// Veritabanındaki "Persons" tablosunun C# karşılığı.
// Aynı sınıf API'nin JSON gövdesi olarak da kullanılır (camelCase'e otomatik çevrilir).
public class Person
{
    // Birincil anahtar. SQLite tarafından otomatik artırılır.
    public int Id { get; set; }

    [Required(ErrorMessage = "Ad soyad zorunludur.")]
    [StringLength(100, MinimumLength = 2, ErrorMessage = "Ad soyad 2-100 karakter olmalıdır.")]
    public string FullName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Departman zorunludur.")]
    [StringLength(100, ErrorMessage = "Departman en fazla 100 karakter olabilir.")]
    public string Department { get; set; } = string.Empty;

    // Fotoğraf isteğe bağlıdır; boşsa mobil uygulama baş harfleri gösterir.
    [Url(ErrorMessage = "Fotoğraf adresi geçerli bir URL olmalıdır.")]
    [StringLength(500)]
    public string? PhotoUrl { get; set; }

    [Required(ErrorMessage = "Doğum yeri zorunludur.")]
    [StringLength(100, ErrorMessage = "Doğum yeri en fazla 100 karakter olabilir.")]
    public string BirthPlace { get; set; } = string.Empty;

    // DateOnly yalnızca tarih tutar; JSON'da "1994-04-12" biçiminde görünür.
    [Required(ErrorMessage = "Doğum tarihi zorunludur.")]
    public DateOnly? BirthDate { get; set; }

    [Required(ErrorMessage = "E-posta zorunludur.")]
    // [EmailAddress] tek başına çok gevşektir ("a@b" adresini bile kabul eder).
    // Bu ifade mobildeki validation.ts ile aynıdır: uzantı en az 2 harf, Türkçe karakter yok.
    [RegularExpression(@"^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$",
        ErrorMessage = "Geçerli bir e-posta adresi giriniz.")]
    [StringLength(150)]
    public string Email { get; set; } = string.Empty;

    // + ile başlayabilen, rakam, boşluk, parantez ve tire içeren 7-20 karakter.
    [Required(ErrorMessage = "Telefon zorunludur.")]
    [RegularExpression(@"^\+?[0-9\s()-]{7,20}$", ErrorMessage = "Geçerli bir telefon numarası giriniz.")]
    public string Phone { get; set; } = string.Empty;
}
