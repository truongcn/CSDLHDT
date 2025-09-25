using Microsoft.AspNetCore.Mvc;
using HospitalManagement.Models;
using HospitalManagement.Services;

namespace HospitalManagement.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PatientsController : ControllerBase
{
    private readonly MongoService<Patient> _service;

    public PatientsController(MongoService<Patient> service) => _service = service;

    [HttpGet]
    public async Task<ActionResult<List<Patient>>> Get() => await _service.GetAllAsync();

    [HttpGet("{id}")]
    public async Task<ActionResult<Patient>> Get(string id)
    {
        var item = await _service.GetByIdAsync(id);
        return item is null ? NotFound() : item;
    }

    [HttpPost]
    public async Task<IActionResult> Create(Patient patient)
    {
        await _service.CreateAsync(patient);
        return CreatedAtAction(nameof(Get), new { id = patient.Id }, patient);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(string id, Patient patient)
    {
        var existing = await _service.GetByIdAsync(id);
        if (existing is null) return NotFound();
        patient.Id = id;
        await _service.UpdateAsync(id, patient);
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        var existing = await _service.GetByIdAsync(id);
        if (existing is null) return NotFound();
        await _service.DeleteAsync(id);
        return NoContent();
    }
}
