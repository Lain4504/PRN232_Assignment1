using PRN232_Assignment1.DTO.Request;
using PRN232_Assignment1.DTO.Response;

namespace PRN232_Assignment1.IServices;

public interface ICartService
{
    Task<IEnumerable<CartItemResponseDto>> GetCartItemsByUserIdAsync(string userId);
    Task<CartItemResponseDto> AddToCartAsync(string userId, AddToCartRequestDto request);
    Task<CartItemResponseDto> UpdateCartItemAsync(string userId, string productId, UpdateCartItemRequestDto request);
    Task<bool> RemoveFromCartAsync(string userId, string productId);
    Task<bool> ClearCartAsync(string userId);
}
