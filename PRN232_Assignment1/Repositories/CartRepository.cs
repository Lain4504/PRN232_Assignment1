using PRN232_Assignment1.IRepositories;
using PRN232_Assignment1.Models;
using Supabase;

namespace PRN232_Assignment1.Repositories;

public class CartRepository : ICartRepository
{
    private readonly Supabase.Client _supabaseClient;

    public CartRepository(Supabase.Client supabaseClient)
    {
        _supabaseClient = supabaseClient;
    }

    public async Task<IEnumerable<CartItem>> GetCartItemsByUserIdAsync(string userId)
    {
        var response = await _supabaseClient
            .From<CartItem>()
            .Where(x => x.UserId == userId)
            .Get();

        return response.Models;
    }

    public async Task<CartItem?> GetCartItemByUserAndProductAsync(string userId, string productId)
    {
        var response = await _supabaseClient
            .From<CartItem>()
            .Where(x => x.UserId == userId && x.ProductId == productId)
            .Single();

        return response;
    }

    public async Task<CartItem> AddToCartAsync(CartItem cartItem)
    {
        cartItem.CreatedAt = DateTime.UtcNow;
        cartItem.UpdatedAt = DateTime.UtcNow;

        var response = await _supabaseClient
            .From<CartItem>()
            .Insert(cartItem);

        return response.Model;
    }

    public async Task<CartItem> UpdateCartItemAsync(CartItem cartItem)
    {
        cartItem.UpdatedAt = DateTime.UtcNow;

        var response = await _supabaseClient
            .From<CartItem>()
            .Update(cartItem);

        return response.Model;
    }

    public async Task<bool> RemoveFromCartAsync(string userId, string productId)
    {
        await _supabaseClient
            .From<CartItem>()
            .Where(x => x.UserId == userId && x.ProductId == productId)
            .Delete();

        return true;
    }

    public async Task<bool> ClearCartAsync(string userId)
    {
        await _supabaseClient
            .From<CartItem>()
            .Where(x => x.UserId == userId)
            .Delete();

        return true;
    }
}
