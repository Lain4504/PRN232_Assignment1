namespace PRN232_Assignment1.DTO.Response;

public class CartItemResponseDto
{
    public string Id { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public string ProductId { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty;
    public string ProductDescription { get; set; } = string.Empty;
    public decimal ProductPrice { get; set; }
    public string ProductImage { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal TotalPrice => ProductPrice * Quantity;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
