using PRN232_Assignment1.IRepositories;
using PRN232_Assignment1.Models;

namespace PRN232_Assignment1.Repositories;

public class OrderRepository : IOrderRepository
{
    public Task<IEnumerable<Order>> GetOrdersByUserIdAsync(string userId)
    {
        throw new NotImplementedException();
    }

    public Task<Order?> GetOrderByIdAsync(string orderId)
    {
        throw new NotImplementedException();
    }

    public Task<Order> CreateOrderAsync(Order order)
    {
        throw new NotImplementedException();
    }

    public Task<Order> UpdateOrderAsync(Order order)
    {
        throw new NotImplementedException();
    }

    public Task<bool> DeleteOrderAsync(string orderId)
    {
        throw new NotImplementedException();
    }
}