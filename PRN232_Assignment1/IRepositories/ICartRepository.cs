using PRN232_Assignment1.Models;

namespace PRN232_Assignment1.IRepositories;

public interface ICartRepository
{
    Task<IEnumerable<CartItem>> GetCartItemsByUserIdAsync(string userId);
    Task<CartItem?> GetCartItemByUserAndProductAsync(string userId, string productId);
    Task<CartItem> AddToCartAsync(CartItem cartItem);
    Task<CartItem> UpdateCartItemAsync(CartItem cartItem);
    Task<bool> RemoveFromCartAsync(string userId, string productId);
    Task<bool> ClearCartAsync(string userId);
}
