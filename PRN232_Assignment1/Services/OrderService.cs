using PRN232_Assignment1.DTO.Request;
using PRN232_Assignment1.DTO.Response;
using PRN232_Assignment1.IRepositories;
using PRN232_Assignment1.IServices;
using PRN232_Assignment1.Models;

namespace PRN232_Assignment1.Services;

public class OrderService : IOrderService
{
    private readonly IOrderRepository _orderRepository;
    private readonly ICartRepository _cartRepository;
    private readonly IProductRepository _productRepository;
    
    public OrderService(IOrderRepository orderRepository, ICartRepository cartRepository, IProductRepository productRepository)
    {
        _orderRepository = orderRepository;
        _cartRepository = cartRepository;
        _productRepository = productRepository;
    }
    public async Task<IEnumerable<OrderResponseDto>> GetOrdersByUserIdAsync(string userId)
    {
        var orders = await _orderRepository.GetOrdersByUserIdAsync(userId);
        var orderDtos = new List<OrderResponseDto>();
        
        foreach (var order in orders)
        {
            orderDtos.Add(await MapOrderToDto(order));
        }
        return orderDtos;
    }

    public async Task<OrderResponseDto?> GetOrderByIdAsync(string orderId)
    {
        var oder = await _orderRepository.GetOrderByIdAsync(orderId);
        if (oder == null) return null;
        return await MapOrderToDto(oder);
    }

    public async Task<OrderResponseDto> CreateOrderAsync(string userId, CreateOrderRequestDto request)
    {
        // Get cart items
        var cartItems = await _cartRepository.GetCartItemsByUserIdAsync(userId);
        if (!cartItems.Any())
        {
            throw new Exception("Cart is empty");
        }

        var order = new Order
        {
            UserId = userId,
            PaymentMethod = request.PaymentMethod,
            Status = OrderStatusEnum.Pending
        };
        
    }

    public Task<OrderResponseDto> UpdateOrderStatusAsync(string orderId, string status, string? paymentId = null)
    {
        throw new NotImplementedException();
    }
    
    private Task<OrderResponseDto> MapOrderToDto(Order order)
    {
        var orderDto = new OrderResponseDto
        {
            Id = order.Id,
            UserId = order.UserId,
            TotalAmount = order.TotalAmount,
            Status = order.Status.ToString(),
            PaymentMethod = order.PaymentMethod,
            PaymentId = order.PaymentId,
            CreatedAt = order.CreatedAt,
            UpdatedAt = order.UpdatedAt
        };

        // Map order items
        foreach (var orderItem in order.OrderItems)
        {
            orderDto.OrderItems.Add(new OrderItemResponseDto
            {
                Id = orderItem.Id,
                ProductId = orderItem.ProductId,
                ProductName = orderItem.ProductName,
                ProductPrice = orderItem.ProductPrice,
                Quantity = orderItem.Quantity,
                CreatedAt = orderItem.CreatedAt
            });
        }

        return Task.FromResult(orderDto);
    }
}