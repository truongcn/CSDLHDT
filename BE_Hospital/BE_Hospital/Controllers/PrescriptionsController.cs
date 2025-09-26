using Microsoft.AspNetCore.Mvc;
using HospitalManagement.Models;
using HospitalManagement.Services;

namespace HospitalManagement.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PrescriptionsController : ControllerBase
{
    private readonly MongoService<Prescription> _svc;
    public PrescriptionsController(MongoService<Prescription> svc) => _svc = svc;

    [HttpGet] public async Task<List<Prescription>> Get() => await _svc.GetAllAsync();
    [HttpGet("{id}")]
    public async Task<ActionResult<Prescription>> Get(string id)
    {
        var p = await _svc.GetByIdAsync(id);
        if (p == null) return NotFound();
        return p;
    }
    [HttpPost]
    public async Task<IActionResult> Create(Prescription pres)
    {
        await _svc.CreateAsync(pres);
        return CreatedAtAction(nameof(Get), new { id = pres.Id }, pres);
    }
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(string id, Prescription pres)
    {
        var existing = await _svc.GetByIdAsync(id);
        if (existing == null) return NotFound();
        pres.Id = id;
        await _svc.UpdateAsync(id, pres);
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
