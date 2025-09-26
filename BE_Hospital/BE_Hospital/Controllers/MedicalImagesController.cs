using Microsoft.AspNetCore.Mvc;
using HospitalManagement.Models;
using HospitalManagement.Services;

namespace HospitalManagement.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MedicalImagesController : ControllerBase
{
    private readonly MongoService<MedicalImage> _svc;
    public MedicalImagesController(MongoService<MedicalImage> svc) => _svc = svc;

    [HttpGet] public async Task<List<MedicalImage>> Get() => await _svc.GetAllAsync();
    [HttpGet("{id}")]
    public async Task<ActionResult<MedicalImage>> Get(string id)
    {
        var i = await _svc.GetByIdAsync(id);
        if (i == null) return NotFound();
        return i;
    }
    [HttpPost]
    public async Task<IActionResult> Create(MedicalImage img)
    {
        await _svc.CreateAsync(img);
        return CreatedAtAction(nameof(Get), new { id = img.Id }, img);
    }
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(string id, MedicalImage img)
    {
        var existing = await _svc.GetByIdAsync(id);
        if (existing == null) return NotFound();
        img.Id = id;
        await _svc.UpdateAsync(id, img);
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
