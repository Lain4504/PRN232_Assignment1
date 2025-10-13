using System.ComponentModel.DataAnnotations;
using Supabase.Postgrest.Models;

namespace PRN232_Assignment1.Models;

public class Order : BaseModel
{
    [Key]
    public string Id { get; set; } = string.Empty;
    
    [Required]
    public string UserId { get; set; } = string.Empty;
    
    [Required]
    [Range(0.01, double.MaxValue, ErrorMessage = "Total amount must be greater than 0")]
    public decimal TotalAmount { get; set; }
    
    [Required]
    public string Status { get; set; } = "pending"; // pending, paid, cancelled, shipped, delivered
    
    public string? PaymentMethod { get; set; }
    
    public string? PaymentId { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation property
    public List<OrderItem> OrderItems { get; set; } = new();
}
