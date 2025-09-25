using Microsoft.AspNetCore.Mvc;
using HospitalManagement.Models;
using HospitalManagement.Services;

namespace HospitalManagement.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RoomsController : ControllerBase
{
    private readonly MongoService<Room> _service;

    public RoomsController(MongoService<Room> service) => _service = service;

    [HttpGet]
    public async Task<ActionResult<List<Room>>> Get() => await _service.GetAllAsync();

    [HttpGet("{id}")]
    public async Task<ActionResult<Room>> Get(string id)
    {
        var item = await _service.GetByIdAsync(id);
        return item is null ? NotFound() : item;
    }

    [HttpPost]
    public async Task<IActionResult> Create(Room room)
    {
        await _service.CreateAsync(room);
        return CreatedAtAction(nameof(Get), new { id = room.Id }, room);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(string id, Room room)
    {
        var existing = await _service.GetByIdAsync(id);
        if (existing is null) return NotFound();
        room.Id = id;
        await _service.UpdateAsync(id, room);
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
