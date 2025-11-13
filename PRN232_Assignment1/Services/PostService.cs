using PRN232_Assignment1.DTO.Request;
using PRN232_Assignment1.DTO.Response;
using PRN232_Assignment1.IRepositories;
using PRN232_Assignment1.IServices;
using Microsoft.AspNetCore.Http;
using SocialNetwork.Core.Modules.Images.Interfaces;

namespace PRN232_Assignment1.Services;

public class PostService : IPostService
{
    private readonly IPostRepository _postRepository;
    private readonly ICloudflareService? _cloudflareService;
    
    public PostService(IPostRepository postRepository, ICloudflareService? cloudflareService = null)
    {
        _postRepository = postRepository;
        _cloudflareService = cloudflareService;
    }
    
    public async Task<IEnumerable<PostResponseDto>> GetAllPostsAsync()
    {
        var posts = await _postRepository.GetAllPostsAsync();
        var postDtos = posts.Select(p => new PostResponseDto
        {
            Id = p.Id,
            Name = p.Name,
            Description = p.Description,
            Image = p.Image
        }).ToList();
        
        return postDtos;
    }

    public async Task<PaginatedResponseDto<PostResponseDto>> GetPostsPaginatedAsync(int page, int pageSize)
    {
        var (posts, totalCount) = await _postRepository.GetPostsPaginatedAsync(page, pageSize);
        var postDtos = posts.Select(p => new PostResponseDto
        {
            Id = p.Id,
            Name = p.Name,
            Description = p.Description,
            Image = p.Image
        }).ToList();
        
        return new PaginatedResponseDto<PostResponseDto>(postDtos, page, pageSize, totalCount);
    }

    public async Task<PaginatedResponseDto<PostResponseDto>> SearchPostsAsync(PostSearchRequestDto searchRequest)
    {
        var (posts, totalCount) = await _postRepository.SearchPostsAsync(
            searchRequest.SearchTerm,
            searchRequest.SortOrder,
            searchRequest.Page,
            searchRequest.PageSize);

        var postDtos = posts.Select(p => new PostResponseDto
        {
            Id = p.Id,
            Name = p.Name,
            Description = p.Description,
            Image = p.Image
        }).ToList();
        
        return new PaginatedResponseDto<PostResponseDto>(postDtos, searchRequest.Page, searchRequest.PageSize, totalCount);
    }

    public async Task<PostResponseDto?> GetPostByIdAsync(string id)
    {
        var post = await _postRepository.GetPostByIdAsync(id);
        if (post == null)
        {
            return null;
        }
        
        var postDto = new PostResponseDto
        {
            Id = post.Id,
            Name = post.Name,
            Description = post.Description,
            Image = post.Image
        };
        
        return postDto;
    }

    public async Task<PostResponseDto> AddPostAsync(PostRequestDto postDto, IFormFile? imageFile = null)
    {
        string imageUrl = string.Empty;
        
        // Handle image: use URL if provided, otherwise upload file if provided
        if (!string.IsNullOrWhiteSpace(postDto.ImageUrl))
        {
            imageUrl = postDto.ImageUrl;
        }
        else if (imageFile != null && _cloudflareService != null)
        {
            imageUrl = await _cloudflareService.UploadImage(imageFile);
        }
        
        var post = new Models.Post
        {
            Name = postDto.Name,
            Description = postDto.Description,
            Image = imageUrl
        };
        
        var createdPost = await _postRepository.AddPostAsync(post);
        var responseDto = new PostResponseDto
        {
            Id = createdPost.Id,
            Name = createdPost.Name,
            Description = createdPost.Description,
            Image = createdPost.Image
        };
        
        return responseDto;
    }

    public async Task<(PostResponseDto? Post, bool WasModified)> UpdatePostAsync(string id, PostRequestDto postDto, IFormFile? imageFile = null)
    {
        var existingPost = await _postRepository.FindByIdAsync(id);
        if (existingPost == null)
        {
            return (null, false); // Post not found
        }
        
        existingPost.Name = postDto.Name;
        existingPost.Description = postDto.Description;
        
        // Handle image: use URL if provided, otherwise upload file if provided, otherwise keep existing
        if (!string.IsNullOrWhiteSpace(postDto.ImageUrl))
        {
            existingPost.Image = postDto.ImageUrl;
        }
        else if (imageFile != null && _cloudflareService != null)
        {
            existingPost.Image = await _cloudflareService.UploadImage(imageFile);
        }
        // If no new image is provided, keep existing image unchanged
        
        var (updatedPost, wasModified) = await _postRepository.UpdatePostAsync(id, existingPost);
        if (updatedPost == null)
        {
            return (null, false); // Update failed
        }
        
        var responseDto = new PostResponseDto
        {
            Id = updatedPost.Id,
            Name = updatedPost.Name,
            Description = updatedPost.Description,
            Image = updatedPost.Image
        };
        
        return (responseDto, wasModified);
    }

    public async Task<bool> DeletePostAsync(string id)
    {
        var existingPost = await _postRepository.FindByIdAsync(id);
        if (existingPost == null)
        {
            return false;
        }
        
        var result = await _postRepository.DeletePostAsync(id);
        return result;
    }
}

