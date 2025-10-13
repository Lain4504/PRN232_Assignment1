using PRN232_Assignment1.IRepositories;
using PRN232_Assignment1.Models;

namespace PRN232_Assignment1.Repositories;

public class CartRepository : ICartRepository
{
    public Task<IEnumerable<CartItem>> GetCartItemsByUserIdAsync(string userId)
    {
        throw new NotImplementedException();
    }

    public Task<CartItem?> GetCartItemByUserAndProductAsync(string userId, string productId)
    {
        throw new NotImplementedException();
    }

    public Task<CartItem> AddToCartAsync(CartItem cartItem)
    {
        throw new NotImplementedException();
    }

    public Task<CartItem> UpdateCartItemAsync(CartItem cartItem)
    {
        throw new NotImplementedException();
    }

    public Task<bool> RemoveFromCartAsync(string userId, string productId)
    {
        throw new NotImplementedException();
    }

    public Task<bool> ClearCartAsync(string userId)
    {
        throw new NotImplementedException();
    }
}