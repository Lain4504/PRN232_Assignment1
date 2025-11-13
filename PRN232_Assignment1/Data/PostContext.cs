using MongoDB.Driver;
using PRN232_Assignment1.Models;

namespace PRN232_Assignment1.Data;

public class PostContext
{
    private readonly IMongoDatabase _database;

    public PostContext(IMongoClient mongoClient, string databaseName)
    {
        _database = mongoClient.GetDatabase(databaseName);
    }

    public IMongoCollection<Post> Posts => _database.GetCollection<Post>("Posts");
}

