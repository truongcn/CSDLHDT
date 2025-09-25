using Microsoft.AspNetCore.Mvc;
using HospitalManagement.Models;
using HospitalManagement.Services;

namespace HospitalManagement.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly UserService _userService;

    public AuthController(UserService userService)
    {
        _userService = userService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] User user)
    {
        var existing = await _userService.GetByUsernameAsync(user.Username);
        if (existing != null)
            return BadRequest("Username already exists");

        await _userService.CreateUserAsync(user);
        return Ok("User registered successfully");
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] User login)
    {
        var user = await _userService.GetByUsernameAsync(login.Username);
        if (user == null) return Unauthorized("User not found");

        if (!_userService.VerifyPassword(login.PasswordHash, user.PasswordHash))
            return Unauthorized("Invalid password");

        return Ok(new { message = "Login successful", user = user.Username, role = user.Role });
    }
}
