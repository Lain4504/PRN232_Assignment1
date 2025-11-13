using System.ComponentModel.DataAnnotations;

namespace PRN232_Assignment1.DTO.Request;

public class PostFormModel
{
    [Required(ErrorMessage = "Post name is required")]
    [StringLength(100, MinimumLength = 2, ErrorMessage = "Post name must be between 2 and 100 characters")]
    public string Name { get; set; } = string.Empty;

    [Required(ErrorMessage = "Post description is required")]
    [StringLength(500, MinimumLength = 10, ErrorMessage = "Post description must be between 10 and 500 characters")]
    public string Description { get; set; } = string.Empty;

    public string? ImageUrl { get; set; }
    
    public IFormFile? ImageFile { get; set; }

    // Method to convert to PostRequestDto
    public PostRequestDto ToPostRequestDto()
    {
        return new PostRequestDto
        {
            Name = this.Name,
            Description = this.Description,
            ImageUrl = this.ImageUrl
        };
    }
}

