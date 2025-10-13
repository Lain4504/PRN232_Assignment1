using PRN232_Assignment1.DTO.Request;
using PRN232_Assignment1.DTO.Response;

namespace PRN232_Assignment1.IServices;

public interface IOrderService
{
    Task<IEnumerable<OrderResponseDto>> GetOrdersByUserIdAsync(string userId);
    Task<OrderResponseDto?> GetOrderByIdAsync(string orderId);
    Task<OrderResponseDto> CreateOrderAsync(string userId, CreateOrderRequestDto request);
    Task<OrderResponseDto> UpdateOrderStatusAsync(string orderId, string status, string? paymentId = null);
}