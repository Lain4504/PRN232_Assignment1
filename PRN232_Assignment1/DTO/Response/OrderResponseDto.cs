namespace PRN232_Assignment1.DTO.Response;

public class OrderResponseDto
{
    public string Id { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public decimal TotalAmount { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? PaymentMethod { get; set; }
    public string? PaymentId { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public List<OrderItemResponseDto> OrderItems { get; set; } = new();
}

public class OrderItemResponseDto
{
    public string Id { get; set; } = string.Empty;
    public string ProductId { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty;
    public decimal ProductPrice { get; set; }
    public int Quantity { get; set; }
    public decimal TotalPrice => ProductPrice * Quantity;
    public DateTime CreatedAt { get; set; }
}
