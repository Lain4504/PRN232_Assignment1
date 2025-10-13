using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;

namespace PRN232_Assignment1.Models;

[Table("cart_items")]
public class CartItem : BaseModel
{
    [PrimaryKey("id")]
    public string Id { get; set; } = string.Empty;
    
    [Column("user_id")]
    public string UserId { get; set; } = string.Empty;
    
    [Column("product_id")]
    public string ProductId { get; set; } = string.Empty;
    
    [Column("quantity")]
    public int Quantity { get; set; } = 1;
    
    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation property
    public Product? Product { get; set; }
}
