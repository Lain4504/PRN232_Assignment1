using System.ComponentModel.DataAnnotations;
using Supabase.Postgrest.Models;

namespace PRN232_Assignment1.Models;

public class CartItem : BaseModel
{
    [Key]
    public string Id { get; set; } = string.Empty;
    
    [Required]
    public string UserId { get; set; } = string.Empty;
    
    [Required]
    public string ProductId { get; set; } = string.Empty;
    
    [Required]
    [Range(1, int.MaxValue, ErrorMessage = "Quantity must be at least 1")]
    public int Quantity { get; set; } = 1;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation property
    public Product? Product { get; set; }
}
