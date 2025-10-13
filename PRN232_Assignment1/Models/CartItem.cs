using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;

namespace PRN232_Assignment1.Models;

public class CartItem : BaseModel
{
    [PrimaryKey("id")]
    public string Id { get; set; } = string.Empty;
    
    [Column("user_id")]
    public string UserId { get; set; } = string.Empty;
    
    [Column("product_id")]
    public string ProductId { get; set; } = string.Empty;
    
    [Column("quantity")]
    public int Quantity { get; set; }
    
    [Column("created_at")]
    public DateTime CreatedAt { get; set; }
    
    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; }
    
    // Navigation propertys
    public Product? Product { get; set; }
    
}