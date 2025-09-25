using HospitalManagement.Models;
using MongoDB.Driver;
using System.Security.Cryptography;
using System.Text;

namespace HospitalManagement.Services;

public class UserService
{
    private readonly IMongoCollection<User> _users;

    public UserService(IMongoDatabase database)
    {
        _users = database.GetCollection<User>("users");
    }

    public async Task<User?> GetByUsernameAsync(string username) =>
        await _users.Find(u => u.Username == username).FirstOrDefaultAsync();

    public async Task CreateUserAsync(User user)
    {
        user.PasswordHash = HashPassword(user.PasswordHash); // băm mật khẩu
        await _users.InsertOneAsync(user);
    }

    public bool VerifyPassword(string password, string passwordHash) =>
        HashPassword(password) == passwordHash;

    private string HashPassword(string password)
    {
        using var sha = SHA256.Create();
        var bytes = sha.ComputeHash(Encoding.UTF8.GetBytes(password));
        return Convert.ToBase64String(bytes);
    }
}
