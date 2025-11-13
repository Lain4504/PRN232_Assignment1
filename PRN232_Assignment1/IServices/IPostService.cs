using PRN232_Assignment1.DTO.Request;
using PRN232_Assignment1.DTO.Response;
using Microsoft.AspNetCore.Http;

namespace PRN232_Assignment1.IServices;

public interface IPostService
{
    Task<IEnumerable<PostResponseDto>> GetAllPostsAsync();
    Task<PaginatedResponseDto<PostResponseDto>> GetPostsPaginatedAsync(int page, int pageSize);
    Task<PaginatedResponseDto<PostResponseDto>> SearchPostsAsync(PostSearchRequestDto searchRequest);
    Task<PostResponseDto?> GetPostByIdAsync(string id);
    Task<PostResponseDto> AddPostAsync(PostRequestDto postDto, IFormFile? imageFile = null);
    Task<(PostResponseDto? Post, bool WasModified)> UpdatePostAsync(string id, PostRequestDto postDto, IFormFile? imageFile = null);
    Task<bool> DeletePostAsync(string id);
}

