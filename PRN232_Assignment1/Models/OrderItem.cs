using System.ComponentModel.DataAnnotations;
using Supabase.Postgrest.Models;

namespace PRN232_Assignment1.Models;

public class OrderItem : BaseModel
{
    [Key]
    public string Id { get; set; } = string.Empty;
    
    [Required]
    public string OrderId { get; set; } = string.Empty;
    
    [Required]
    public string ProductId { get; set; } = string.Empty;
    
    [Required]
    public string ProductName { get; set; } = string.Empty;
    
    [Required]
    [Range(0.01, double.MaxValue, ErrorMessage = "Product price must be greater than 0")]
    public decimal ProductPrice { get; set; }
    
    [Required]
    [Range(1, int.MaxValue, ErrorMessage = "Quantity must be at least 1")]
    public int Quantity { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation properties
    public Order? Order { get; set; }
    public Product? Product { get; set; }
}
