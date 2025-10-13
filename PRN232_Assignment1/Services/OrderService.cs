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
        var order = await _orderRepository.GetOrderByIdAsync(orderId);
        if (order == null)
        {
            return null;
        }

        return await MapOrderToDto(order);
    }

    public async Task<OrderResponseDto> CreateOrderAsync(string userId, CreateOrderRequestDto request)
    {
        // Get cart items
        var cartItems = await _cartRepository.GetCartItemsByUserIdAsync(userId);
        if (!cartItems.Any())
        {
            throw new InvalidOperationException("Cart is empty");
        }

        // Create order
        var order = new Order
        {
            UserId = userId,
            PaymentMethod = request.PaymentMethod,
            Status = "pending"
        };

        // Calculate total and create order items
        decimal totalAmount = 0;
        var orderItems = new List<OrderItem>();

        foreach (var cartItem in cartItems)
        {
            var product = await _productRepository.GetProductByIdAsync(cartItem.ProductId);
            if (product == null)
            {
                throw new ArgumentException($"Product {cartItem.ProductId} not found");
            }

            var itemTotal = (decimal)product.Price * cartItem.Quantity;
            totalAmount += itemTotal;

            orderItems.Add(new OrderItem
            {
                OrderId = order.Id,
                ProductId = product.Id,
                ProductName = product.Name,
                ProductPrice = (decimal)product.Price,
                Quantity = cartItem.Quantity
            });
        }

        order.TotalAmount = totalAmount;
        order.OrderItems = orderItems;

        // Save order
        var createdOrder = await _orderRepository.CreateOrderAsync(order);

        // Clear cart
        await _cartRepository.ClearCartAsync(userId);

        return await MapOrderToDto(createdOrder);
    }

    public async Task<OrderResponseDto> UpdateOrderStatusAsync(string orderId, string status, string? paymentId = null)
    {
        var order = await _orderRepository.GetOrderByIdAsync(orderId);
        if (order == null)
        {
            throw new ArgumentException("Order not found");
        }

        order.Status = status;
        if (!string.IsNullOrEmpty(paymentId))
        {
            order.PaymentId = paymentId;
        }

        var updatedOrder = await _orderRepository.UpdateOrderAsync(order);
        return await MapOrderToDto(updatedOrder);
    }

    private Task<OrderResponseDto> MapOrderToDto(Order order)
    {
        var orderDto = new OrderResponseDto
        {
            Id = order.Id,
            UserId = order.UserId,
            TotalAmount = order.TotalAmount,
            Status = order.Status,
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
