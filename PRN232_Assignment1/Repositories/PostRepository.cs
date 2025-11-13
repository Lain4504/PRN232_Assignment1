using MongoDB.Driver;
using PRN232_Assignment1.Data;
using PRN232_Assignment1.DTO.Request;
using PRN232_Assignment1.IRepositories;
using PRN232_Assignment1.Models;

namespace PRN232_Assignment1.Repositories;

public class PostRepository : IPostRepository
{
    private readonly PostContext _context;
    
    public PostRepository(PostContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Post>> GetAllPostsAsync()
    {
        return await _context.Posts.Find(_ => true).ToListAsync();
    }

    public async Task<(IEnumerable<Post> Posts, int TotalCount)> GetPostsPaginatedAsync(int page, int pageSize)
    {
        var skip = (page - 1) * pageSize;
        
        var posts = await _context.Posts
            .Find(_ => true)
            .SortBy(p => p.Name)
            .Skip(skip)
            .Limit(pageSize)
            .ToListAsync();
            
        var totalCount = await _context.Posts.CountDocumentsAsync(_ => true);
        
        return (posts, (int)totalCount);
    }

    public async Task<(IEnumerable<Post> Posts, int TotalCount)> SearchPostsAsync(
        string? searchTerm,
        SortOrder sortOrder,
        int page,
        int pageSize)
    {
        var skip = (page - 1) * pageSize;
        
        // Build filter
        var filterBuilder = Builders<Post>.Filter;
        var filter = filterBuilder.Empty;
        
        // Add search term filter if provided
        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            filter = filterBuilder.Or(
                filterBuilder.Regex(p => p.Name, new MongoDB.Bson.BsonRegularExpression(searchTerm, "i"))
            );
        }

        // Build sort definition
        SortDefinition<Post> sortDefinition = sortOrder == SortOrder.Descending
            ? Builders<Post>.Sort.Descending(p => p.Name)
            : Builders<Post>.Sort.Ascending(p => p.Name);

        // Get total count
        var totalCount = await _context.Posts.CountDocumentsAsync(filter);

        // Get paginated results
        var posts = await _context.Posts
            .Find(filter)
            .Sort(sortDefinition)
            .Skip(skip)
            .Limit(pageSize)
            .ToListAsync();

        return (posts, (int)totalCount);
    }

    public async Task<Post?> GetPostByIdAsync(string id)
    {
        return await _context.Posts.Find(p => p.Id == id).FirstOrDefaultAsync();
    }

    public async Task<Post> AddPostAsync(Post post)
    {
        await _context.Posts.InsertOneAsync(post);
        return post;
    }

    public async Task<(Post? Post, bool WasModified)> UpdatePostAsync(string id, Post post)
    {
        post.Id = id; // Ensure the ID is set correctly
        
        // First check if post exists
        var existingPost = await _context.Posts.Find(p => p.Id == id).FirstOrDefaultAsync();
        if (existingPost == null)
        {
            return (null, false); // Post not found
        }
        
        var result = await _context.Posts.ReplaceOneAsync(p => p.Id == id, post);
        if (!result.IsAcknowledged)
        {
            return (null, false); // Update failed
        }
        
        // Return the updated post and whether it was actually modified
        return (post, result.ModifiedCount > 0);
    }

    public async Task<bool> DeletePostAsync(string id)
    {
        var result = await _context.Posts.DeleteOneAsync(p => p.Id == id);
        return result.IsAcknowledged && result.DeletedCount > 0;
    }

    public async Task<Post?> FindByIdAsync(string id)
    {
        return await _context.Posts.Find(p => p.Id == id).FirstOrDefaultAsync();
    }
}

