using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PersonApi.Data;
using PersonApi.Models;

namespace PersonApi.Controllers;

// [ApiController]: gelen JSON gövdesini Person nesnesine bağlar ve
// veri doğrulama kuralları sağlanmazsa otomatik olarak 400 Bad Request döner.
[ApiController]
[Route("api/persons")]
[Produces("application/json")]
public class PersonsController : ControllerBase
{
    private readonly AppDbContext _db;

    // AppDbContext, Program.cs'te kaydedildiği için Dependency Injection ile gelir.
    public PersonsController(AppDbContext db)
    {
        _db = db;
    }

    // GET /api/persons → tüm kişileri dizi olarak döner.
    [HttpGet]
    [ProducesResponseType<List<Person>>(StatusCodes.Status200OK)]
    public async Task<ActionResult<List<Person>>> GetAll()
    {
        // AsNoTracking: sadece okuma yapacağımız için EF değişiklik takibi yapmaz.
        var persons = await _db.Persons
            .AsNoTracking()
            .OrderBy(p => p.FullName)
            .ToListAsync();

        return Ok(persons);
    }

    // GET /api/persons/5 → tek bir kişiyi döner, yoksa 404.
    [HttpGet("{id:int}")]
    [ProducesResponseType<Person>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<Person>> GetById(int id)
    {
        var person = await _db.Persons.FindAsync(id);
        if (person is null)
        {
            return NotFound(new { message = $"{id} numaralı kişi bulunamadı." });
        }

        return Ok(person);
    }

    // POST /api/persons → yeni kişi oluşturur, 201 Created döner.
    [HttpPost]
    [ProducesResponseType<Person>(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Person>> Create(Person person)
    {
        if (!IsBirthDateValid(person.BirthDate))
        {
            return ValidationProblem(ModelState);
        }

        // Id'yi istemci belirleyemez; veritabanı otomatik verir.
        person.Id = 0;
        person.PhotoUrl = NormalizePhotoUrl(person.PhotoUrl);

        _db.Persons.Add(person);
        await _db.SaveChangesAsync();

        // Location başlığına yeni kaydın adresini (/api/persons/{id}) ekler.
        return CreatedAtAction(nameof(GetById), new { id = person.Id }, person);
    }

    // PUT /api/persons/5 → mevcut kişiyi günceller, 200 OK ile güncel hâlini döner.
    [HttpPut("{id:int}")]
    [ProducesResponseType<Person>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<Person>> Update(int id, Person input)
    {
        // Gövdede farklı bir id gönderildiyse istek tutarsızdır.
        if (input.Id != 0 && input.Id != id)
        {
            return BadRequest(new { message = "URL'deki id ile gövdedeki id eşleşmiyor." });
        }

        if (!IsBirthDateValid(input.BirthDate))
        {
            return ValidationProblem(ModelState);
        }

        var person = await _db.Persons.FindAsync(id);
        if (person is null)
        {
            return NotFound(new { message = $"{id} numaralı kişi bulunamadı." });
        }

        person.FullName = input.FullName;
        person.Department = input.Department;
        person.PhotoUrl = NormalizePhotoUrl(input.PhotoUrl);
        person.BirthPlace = input.BirthPlace;
        person.BirthDate = input.BirthDate;
        person.Email = input.Email;
        person.Phone = input.Phone;

        await _db.SaveChangesAsync();
        return Ok(person);
    }

    // DELETE /api/persons/5 → kaydı kalıcı olarak siler, 204 No Content döner.
    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(int id)
    {
        var person = await _db.Persons.FindAsync(id);
        if (person is null)
        {
            return NotFound(new { message = $"{id} numaralı kişi bulunamadı." });
        }

        _db.Persons.Remove(person);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    // Doğum tarihi gelecekte olamaz. Hata varsa ModelState'e eklenir.
    private bool IsBirthDateValid(DateOnly? birthDate)
    {
        if (birthDate > DateOnly.FromDateTime(DateTime.Today))
        {
            ModelState.AddModelError(nameof(Person.BirthDate), "Doğum tarihi gelecekte olamaz.");
            return false;
        }

        return true;
    }

    // Boş metin gelirse veritabanına null yazılır.
    private static string? NormalizePhotoUrl(string? url)
    {
        return string.IsNullOrWhiteSpace(url) ? null : url.Trim();
    }
}
