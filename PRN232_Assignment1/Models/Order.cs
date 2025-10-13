using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;

namespace PRN232_Assignment1.Models;

[Table("orders")]
public class Order : BaseModel
{
    [PrimaryKey("id")]
    public string Id { get; set; } = string.Empty;
    [Column("user_id")]
    public string UserId { get; set; } = string.Empty;
    [Column("total_amount")]
    public decimal TotalAmount { get; set; }
    [Column("status")]
    public OrderStatusEnum Status { get; set; }
    [Column("payment_method")]
    public string? PaymentMethod { get; set; }
    [Column("payment_id")]
    public string? PaymentId { get; set; }
    [Column("created_at")]
    public DateTime CreatedAt { get; set; }
    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; }
    public List<OrderItem> OrderItems { get; set; } = new();
    
}

public enum OrderStatusEnum
{
    Pending,
    Paid,
    Cancelled,
}