using Microsoft.AspNetCore.Mvc;
using HospitalManagement.Models;
using HospitalManagement.Services;

namespace HospitalManagement.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TestsController : ControllerBase
{
    private readonly MongoService<TestResult> _svc;
    public TestsController(MongoService<TestResult> svc) => _svc = svc;

    [HttpGet] public async Task<List<TestResult>> Get() => await _svc.GetAllAsync();
    [HttpGet("{id}")]
    public async Task<ActionResult<TestResult>> Get(string id)
    {
        var t = await _svc.GetByIdAsync(id);
        if (t == null) return NotFound();
        return t;
    }
    [HttpPost]
    public async Task<IActionResult> Create(TestResult tr)
    {
        await _svc.CreateAsync(tr);
        return CreatedAtAction(nameof(Get), new { id = tr.Id }, tr);
    }
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(string id, TestResult tr)
    {
        var existing = await _svc.GetByIdAsync(id);
        if (existing == null) return NotFound();
        tr.Id = id;
        await _svc.UpdateAsync(id, tr);
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
