using Microsoft.AspNetCore.Mvc;
using PRN232_Assignment1.DTO;
using PRN232_Assignment1.IServices;

namespace PRN232_Assignment1.Controllers;

[ApiController]
[Route("api/posts")]
public class PostController : ControllerBase
{
    private readonly IPostService _postService;
    
    public PostController(IPostService postService)
    {
        _postService = postService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllPosts([FromQuery] DTO.Request.PaginationRequestDto paginationRequest)
    {
        try
        {
            var posts = await _postService.GetPostsPaginatedAsync(paginationRequest.Page, paginationRequest.PageSize);
            var response = GenericResponse<DTO.Response.PaginatedResponseDto<DTO.Response.PostResponseDto>>.CreateSuccess(posts, "Posts retrieved successfully");
            return Ok(response);
        }
        catch (Exception ex)
        {
            var errorResponse = GenericResponse<DTO.Response.PaginatedResponseDto<DTO.Response.PostResponseDto>>.CreateError($"Error retrieving posts: {ex.Message}");
            return StatusCode(500, errorResponse);
        }
    }

    [HttpGet("search")]
    public async Task<IActionResult> SearchPosts([FromQuery] DTO.Request.PostSearchRequestDto searchRequest)
    {
        try
        {
            // Check if model state is valid
            if (!ModelState.IsValid)
            {
                var validationErrors = new Dictionary<string, List<string>>();
                foreach (var key in ModelState.Keys)
                {
                    var errors = ModelState[key]?.Errors.Select(e => e.ErrorMessage).ToList() ?? new List<string>();
                    if (errors.Any())
                    {
                        validationErrors[key] = errors;
                    }
                }
                
                var validationResponse = GenericResponse<DTO.Response.PaginatedResponseDto<DTO.Response.PostResponseDto>>.CreateValidationError(validationErrors);
                return BadRequest(validationResponse);
            }

            var posts = await _postService.SearchPostsAsync(searchRequest);
            var response = GenericResponse<DTO.Response.PaginatedResponseDto<DTO.Response.PostResponseDto>>.CreateSuccess(posts, "Posts searched successfully");
            return Ok(response);
        }
        catch (Exception ex)
        {
            var errorResponse = GenericResponse<DTO.Response.PaginatedResponseDto<DTO.Response.PostResponseDto>>.CreateError($"Error searching posts: {ex.Message}");
            return StatusCode(500, errorResponse);
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetPostById(string id)
    {
        try
        {
            var post = await _postService.GetPostByIdAsync(id);
            if (post == null)
            {
                var notFoundResponse = GenericResponse<DTO.Response.PostResponseDto>.CreateError("Post not found", System.Net.HttpStatusCode.NotFound, "POST_NOT_FOUND");
                return NotFound(notFoundResponse);
            }
            var response = GenericResponse<DTO.Response.PostResponseDto>.CreateSuccess(post, "Post retrieved successfully");
            return Ok(response);
        }
        catch (Exception ex)
        {
            var errorResponse = GenericResponse<DTO.Response.PostResponseDto>.CreateError($"Error retrieving post: {ex.Message}");
            return StatusCode(500, errorResponse);
        }
    }

    [HttpPost]
    public async Task<IActionResult> AddPost([FromForm] DTO.Request.PostFormModel formModel)
    {
        try
        {
            // Check if model state is valid
            if (!ModelState.IsValid)
            {
                var validationErrors = new Dictionary<string, List<string>>();
                foreach (var key in ModelState.Keys)
                {
                    var errors = ModelState[key]?.Errors.Select(e => e.ErrorMessage).ToList() ?? new List<string>();
                    if (errors.Any())
                    {
                        validationErrors[key] = errors;
                    }
                }
                
                var validationResponse = GenericResponse<DTO.Response.PostResponseDto>.CreateValidationError(validationErrors);
                return BadRequest(validationResponse);
            }

            var postDto = formModel.ToPostRequestDto();
            var createdPost = await _postService.AddPostAsync(postDto, formModel.ImageFile);
            var response =
                GenericResponse<DTO.Response.PostResponseDto>.CreateSuccess(createdPost,
                    "Post created successfully");
            return CreatedAtAction(nameof(GetPostById), new { id = createdPost.Id }, response);
        }
        catch (Exception ex)
        {
            var errorResponse =
                GenericResponse<DTO.Response.PostResponseDto>.CreateError($"Error creating post: {ex.Message}");
            return StatusCode(500, errorResponse);
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdatePost(string id, [FromForm] DTO.Request.PostFormModel formModel)
    {
        try
        {
            // Check if model state is valid
            if (!ModelState.IsValid)
            {
                var validationErrors = new Dictionary<string, List<string>>();
                foreach (var key in ModelState.Keys)
                {
                    var errors = ModelState[key]?.Errors.Select(e => e.ErrorMessage).ToList() ?? new List<string>();
                    if (errors.Any())
                    {
                        validationErrors[key] = errors;
                    }
                }
                
                var validationResponse = GenericResponse<DTO.Response.PostResponseDto>.CreateValidationError(validationErrors);
                return BadRequest(validationResponse);
            }

            var postDto = formModel.ToPostRequestDto();
            var (updatedPost, wasModified) = await _postService.UpdatePostAsync(id, postDto, formModel.ImageFile);
            if (updatedPost == null)
            {
                var notFoundResponse = GenericResponse<DTO.Response.PostResponseDto>.CreateError("Post not found", System.Net.HttpStatusCode.NotFound, "POST_NOT_FOUND");
                return NotFound(notFoundResponse);
            }
            
            var message = wasModified ? "Post updated successfully" : "Post found but no changes were made";
            var response = GenericResponse<DTO.Response.PostResponseDto>.CreateSuccess(updatedPost, message);
            return Ok(response);
        }
        catch (Exception ex)
        {
            var errorResponse = GenericResponse<DTO.Response.PostResponseDto>.CreateError($"Error updating post: {ex.Message}");
            return StatusCode(500, errorResponse);
        }
    }
    
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeletePost(string id)
    {
        try
        {
            var deleted = await _postService.DeletePostAsync(id);
            if (!deleted)
            {
                var notFoundResponse = GenericResponse<object>.CreateError("Post not found",
                    System.Net.HttpStatusCode.NotFound, "POST_NOT_FOUND");
                return NotFound(notFoundResponse);
            }
            var response = GenericResponse<object>.CreateSuccess(null, "Post deleted successfully");
            return Ok(response);
        } catch (Exception ex)
        {
            var errorResponse = GenericResponse<object>.CreateError($"Error deleting post: {ex.Message}");
            return StatusCode(500, errorResponse);
        }
    }
}

