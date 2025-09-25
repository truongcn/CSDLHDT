using MongoDB.Driver;

namespace HospitalManagement.Services;

public class MongoService<T>
{
    private readonly IMongoCollection<T> _collection;

    public MongoService(IMongoDatabase database, string collectionName)
    {
        _collection = database.GetCollection<T>(collectionName);
    }

    public async Task<List<T>> GetAllAsync() =>
        await _collection.Find(_ => true).ToListAsync();

    public async Task<T?> GetByIdAsync(string id) =>
        await _collection.Find(Builders<T>.Filter.Eq("Id", id)).FirstOrDefaultAsync();

    public async Task CreateAsync(T item) =>
        await _collection.InsertOneAsync(item);

    public async Task UpdateAsync(string id, T item) =>
        await _collection.ReplaceOneAsync(Builders<T>.Filter.Eq("Id", id), item);

    public async Task DeleteAsync(string id) =>
        await _collection.DeleteOneAsync(Builders<T>.Filter.Eq("Id", id));
}
