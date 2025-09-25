using Microsoft.AspNetCore.Mvc;
using HospitalManagement.Models;
using HospitalManagement.Services;

namespace HospitalManagement.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AppointmentsController : ControllerBase
{
    private readonly MongoService<Appointment> _service;

    public AppointmentsController(MongoService<Appointment> service) => _service = service;

    [HttpGet]
    public async Task<ActionResult<List<Appointment>>> Get() => await _service.GetAllAsync();

    [HttpGet("{id}")]
    public async Task<ActionResult<Appointment>> Get(string id)
    {
        var item = await _service.GetByIdAsync(id);
        return item is null ? NotFound() : item;
    }

    [HttpPost]
    public async Task<IActionResult> Create(Appointment appointment)
    {
        await _service.CreateAsync(appointment);
        return CreatedAtAction(nameof(Get), new { id = appointment.Id }, appointment);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(string id, Appointment appointment)
    {
        var existing = await _service.GetByIdAsync(id);
        if (existing is null) return NotFound();
        appointment.Id = id;
        await _service.UpdateAsync(id, appointment);
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
