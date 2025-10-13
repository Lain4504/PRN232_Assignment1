using PRN232_Assignment1.IRepositories;
using PRN232_Assignment1.Models;
using Supabase;
using Supabase.Postgrest;

namespace PRN232_Assignment1.Repositories;

public class OrderRepository : IOrderRepository
{
    private readonly Supabase.Client _supabaseClient;

    public OrderRepository(Supabase.Client supabaseClient)
    {
        _supabaseClient = supabaseClient;
    }

    public async Task<IEnumerable<Order>> GetOrdersByUserIdAsync(string userId)
    {
        var response = await _supabaseClient
            .From<Order>()
            .Where(x => x.UserId == userId)
            .Order(x => x.CreatedAt, Constants.Ordering.Descending)
            .Get();

        return response.Models;
    }

    public async Task<Order?> GetOrderByIdAsync(string orderId)
    {
        var response = await _supabaseClient
            .From<Order>()
            .Where(x => x.Id == orderId)
            .Single();

        return response;
    }

    public async Task<Order> CreateOrderAsync(Order order)
    {
        order.CreatedAt = DateTime.UtcNow;
        order.UpdatedAt = DateTime.UtcNow;

        var response = await _supabaseClient
            .From<Order>()
            .Insert(order);

        return response.Model;
    }

    public async Task<Order> UpdateOrderAsync(Order order)
    {
        order.UpdatedAt = DateTime.UtcNow;

        var response = await _supabaseClient
            .From<Order>()
            .Update(order);

        return response.Model;
    }

    public async Task<bool> DeleteOrderAsync(string orderId)
    {
        await _supabaseClient
            .From<Order>()
            .Where(x => x.Id == orderId)
            .Delete();

        return true;
    }
}
