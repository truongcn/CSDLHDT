using Microsoft.AspNetCore.Mvc;
using HospitalManagement.Models;
using HospitalManagement.Services;

namespace HospitalManagement.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DoctorsController : ControllerBase
{
    private readonly MongoService<Doctor> _service;

    public DoctorsController(MongoService<Doctor> service) => _service = service;

    [HttpGet]
    public async Task<ActionResult<List<Doctor>>> Get() => await _service.GetAllAsync();

    [HttpGet("{id}")]
    public async Task<ActionResult<Doctor>> Get(string id)
    {
        var item = await _service.GetByIdAsync(id);
        return item is null ? NotFound() : item;
    }

    [HttpPost]
    public async Task<IActionResult> Create(Doctor doctor)
    {
        await _service.CreateAsync(doctor);
        return CreatedAtAction(nameof(Get), new { id = doctor.Id }, doctor);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(string id, Doctor doctor)
    {
        var existing = await _service.GetByIdAsync(id);
        if (existing is null) return NotFound();
        doctor.Id = id;
        await _service.UpdateAsync(id, doctor);
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
