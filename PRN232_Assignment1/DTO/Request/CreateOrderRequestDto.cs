using System.ComponentModel.DataAnnotations;

namespace PRN232_Assignment1.DTO.Request;

public class CreateOrderRequestDto
{
    [Required(ErrorMessage = "Payment method is required")]
    public string PaymentMethod { get; set; } = string.Empty;
}
