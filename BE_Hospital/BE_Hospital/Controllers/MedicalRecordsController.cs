using Microsoft.AspNetCore.Mvc;
using HospitalManagement.Models;
using HospitalManagement.Services;

namespace HospitalManagement.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MedicalRecordsController : ControllerBase
{
    private readonly MongoService<MedicalRecord> _svc;
    public MedicalRecordsController(MongoService<MedicalRecord> svc) => _svc = svc;

    [HttpGet] public async Task<List<MedicalRecord>> Get() => await _svc.GetAllAsync();
    [HttpGet("{id}")]
    public async Task<ActionResult<MedicalRecord>> Get(string id)
    {
        var r = await _svc.GetByIdAsync(id);
        if (r == null) return NotFound();
        return r;
    }
    [HttpPost]
    public async Task<IActionResult> Create(MedicalRecord rec)
    {
        await _svc.CreateAsync(rec);
        return CreatedAtAction(nameof(Get), new { id = rec.Id }, rec);
    }
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(string id, MedicalRecord rec)
    {
        var existing = await _svc.GetByIdAsync(id);
        if (existing == null) return NotFound();
        rec.Id = id;
        await _svc.UpdateAsync(id, rec);
        return NoContent();
    }
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        var existing = await _svc.GetByIdAsync(id);
        if (existing == null) return NotFound();
        await _svc.DeleteAsync(id);
        return NoContent();
    }
}
