using System.ComponentModel.DataAnnotations.Schema;
using Supabase.Postgrest.Models;

namespace PRN232_Assignment1.Models;

[Table("order_items")]
public class OrderItem : BaseModel
{
    [ForeignKey("id")]
    public string Id { get; set; } = string.Empty;
    
    [Column("order_id")]
    public string OrderId { get; set; } = string.Empty;
    
    [Column("product_id")]
    public string ProductId { get; set; } = string.Empty;
    
    [Column("product_name")]
    public string ProductName { get; set; } = string.Empty;
    
    [Column("product_price")]
    public decimal ProductPrice { get; set; }
    
    [Column("quantity")]
    public int Quantity { get; set; }
    
    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation properties
    public Order? Order { get; set; }
    public Product? Product { get; set; }
}
