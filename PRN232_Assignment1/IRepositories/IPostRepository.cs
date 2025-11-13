using PRN232_Assignment1.DTO.Request;
using PRN232_Assignment1.Models;

namespace PRN232_Assignment1.IRepositories;

public interface IPostRepository
{
    Task<IEnumerable<Post>> GetAllPostsAsync();
    Task<(IEnumerable<Post> Posts, int TotalCount)> GetPostsPaginatedAsync(int page, int pageSize);
    Task<(IEnumerable<Post> Posts, int TotalCount)> SearchPostsAsync(
        string? searchTerm,
        SortOrder sortOrder,
        int page,
        int pageSize);
    Task<Post?> GetPostByIdAsync(string id);
    Task<Post> AddPostAsync(Post post);
    Task<(Post? Post, bool WasModified)> UpdatePostAsync(string id, Post post);
    Task<bool> DeletePostAsync(string id);
    Task<Post?> FindByIdAsync(string id);
}

