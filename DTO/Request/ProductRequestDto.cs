using System.ComponentModel.DataAnnotations;

namespace PRN232_Assignment1.DTO.Request;

public class ProductRequestDto
{
    [Required(ErrorMessage = "Product name is required")]
    [StringLength(100, MinimumLength = 2, ErrorMessage = "Product name must be between 2 and 100 characters")]
    public string Name { get; set; } = string.Empty;

    [Required(ErrorMessage = "Product description is required")]
    [StringLength(500, MinimumLength = 10, ErrorMessage = "Product description must be between 10 and 500 characters")]
    public string Description { get; set; } = string.Empty;

    [Required(ErrorMessage = "Product price is required")]
    [Range(0.01, double.MaxValue, ErrorMessage = "Product price must be greater than 0")]
    public decimal Price { get; set; }

    [Required(ErrorMessage = "Product image URL is required")]
    [Url(ErrorMessage = "Product image must be a valid URL")]
    [StringLength(500, ErrorMessage = "Image URL cannot exceed 500 characters")]
    public string Image { get; set; } = string.Empty;
}