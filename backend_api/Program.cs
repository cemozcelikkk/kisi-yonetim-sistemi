using Microsoft.EntityFrameworkCore;
using PersonApi.Data;

var builder = WebApplication.CreateBuilder(args);

// SQLite bağlantı cümlesi appsettings.json içindeki "ConnectionStrings:Default" alanından okunur.
var connectionString = builder.Configuration.GetConnectionString("Default")
    ?? "Data Source=persons.db";

// Servis kayıtları (Dependency Injection)
builder.Services.AddDbContext<AppDbContext>(options => options.UseSqlite(connectionString));
builder.Services.AddControllers();
builder.Services.AddProblemDetails(); // Hataları standart JSON (RFC 7807) olarak döndürür.
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Flutter web gibi tarayıcıda çalışan istemcilerin API'ye erişebilmesi için CORS.
// (Android/iOS uygulamaları CORS kuralına tabi değildir.)
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy => policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod());
});

var app = builder.Build();

// Uygulama açılırken veritabanı dosyası yoksa oluşturulur ve örnek kişiler eklenir.
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await db.Database.EnsureCreatedAsync();
}

// Beklenmeyen hatalar 500 durum koduyla JSON olarak döner; uygulama çökmez.
app.UseExceptionHandler();
app.UseStatusCodePages();

// Swagger arayüzü: http://localhost:5080/swagger
app.UseSwagger();
app.UseSwaggerUI();

app.UseCors();
app.MapControllers();

// Kök adrese gelen isteği Swagger'a yönlendir.
app.MapGet("/", () => Results.Redirect("/swagger")).ExcludeFromDescription();

app.Run();
