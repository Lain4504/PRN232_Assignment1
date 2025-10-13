using PRN232_Assignment1.Models;

namespace PRN232_Assignment1.IRepositories;

public interface IOrderRepository
{
    Task<IEnumerable<Order>> GetOrdersByUserIdAsync(string userId);
    Task<Order?> GetOrderByIdAsync(string orderId);
    Task<Order> CreateOrderAsync(Order order);
    Task<Order> UpdateOrderAsync(Order order);
    Task<bool> DeleteOrderAsync(string orderId);
}
