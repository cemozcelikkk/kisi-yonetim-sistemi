using Microsoft.EntityFrameworkCore;
using PersonApi.Models;

namespace PersonApi.Data;

// Entity Framework Core'un veritabanı ile konuştuğu sınıf.
// Her DbSet bir tabloyu temsil eder.
public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Person> Persons => Set<Person>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Model sınıfında nullable olsa da veritabanında doğum tarihi zorunlu.
        modelBuilder.Entity<Person>().Property(p => p.BirthDate).IsRequired();

        // Veritabanı ilk oluşturulduğunda eklenecek örnek kayıtlar.
        modelBuilder.Entity<Person>().HasData(
            new Person { Id = 1, FullName = "Ahmet Yılmaz", Department = "Yazılım Geliştirme", PhotoUrl = "https://randomuser.me/api/portraits/men/32.jpg", BirthPlace = "Adana", BirthDate = new DateOnly(1994, 4, 12), Email = "ahmet.yilmaz@sirket.com", Phone = "+905550123456" },
            new Person { Id = 2, FullName = "Ayşe Kaya", Department = "İnsan Kaynakları", PhotoUrl = "https://randomuser.me/api/portraits/women/44.jpg", BirthPlace = "İzmir", BirthDate = new DateOnly(1991, 9, 3), Email = "ayse.kaya@sirket.com", Phone = "+905551112233" },
            new Person { Id = 3, FullName = "Mehmet Demir", Department = "Bilgi Teknolojileri", PhotoUrl = "https://randomuser.me/api/portraits/men/45.jpg", BirthPlace = "Ankara", BirthDate = new DateOnly(1988, 1, 27), Email = "mehmet.demir@sirket.com", Phone = "+905552223344" },
            new Person { Id = 4, FullName = "Zeynep Arslan", Department = "Ürün Tasarımı", PhotoUrl = "https://randomuser.me/api/portraits/women/65.jpg", BirthPlace = "Eskişehir", BirthDate = new DateOnly(1996, 6, 18), Email = "zeynep.arslan@sirket.com", Phone = "+905553334455" },
            new Person { Id = 5, FullName = "Can Öztürk", Department = "Finans", PhotoUrl = "https://randomuser.me/api/portraits/men/22.jpg", BirthPlace = "Bursa", BirthDate = new DateOnly(1985, 11, 2), Email = "can.ozturk@sirket.com", Phone = "+905554445566" },
            new Person { Id = 6, FullName = "Elif Şahin", Department = "Pazarlama", PhotoUrl = "https://randomuser.me/api/portraits/women/12.jpg", BirthPlace = "Trabzon", BirthDate = new DateOnly(1993, 3, 9), Email = "elif.sahin@sirket.com", Phone = "+905555556677" },
            new Person { Id = 7, FullName = "Burak Çelik", Department = "Satış", PhotoUrl = "https://randomuser.me/api/portraits/men/71.jpg", BirthPlace = "Konya", BirthDate = new DateOnly(1990, 7, 21), Email = "burak.celik@sirket.com", Phone = "+905556667788" },
            new Person { Id = 8, FullName = "Selin Aydın", Department = "Hukuk", PhotoUrl = "https://randomuser.me/api/portraits/women/29.jpg", BirthPlace = "Antalya", BirthDate = new DateOnly(1987, 12, 5), Email = "selin.aydin@sirket.com", Phone = "+905557778899" },
            new Person { Id = 9, FullName = "Emre Koç", Department = "Müşteri Deneyimi", PhotoUrl = "https://randomuser.me/api/portraits/men/86.jpg", BirthPlace = "Samsun", BirthDate = new DateOnly(1998, 2, 14), Email = "emre.koc@sirket.com", Phone = "+905558889900" },
            new Person { Id = 10, FullName = "Deniz Yıldız", Department = "Veri Analitiği", PhotoUrl = "https://randomuser.me/api/portraits/women/52.jpg", BirthPlace = "İstanbul", BirthDate = new DateOnly(1995, 10, 30), Email = "deniz.yildiz@sirket.com", Phone = "+905559990011" }
        );
    }
}
