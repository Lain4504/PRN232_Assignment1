using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using PRN232_Assignment1.DTO;
using PRN232_Assignment1.IServices;
using System.Security.Claims;

namespace PRN232_Assignment1.Controllers;

[ApiController]
[Route("api/cart")]
[Authorize]
public class CartController : ControllerBase
{
    private readonly ICartService _cartService;

    public CartController(ICartService cartService)
    {
        _cartService = cartService;
    }

    [HttpGet]
    public async Task<IActionResult> GetCartItems()
    {
        try
        {
            var userId = GetCurrentUserId();
            var cartItems = await _cartService.GetCartItemsByUserIdAsync(userId);
            var response = GenericResponse<IEnumerable<DTO.Response.CartItemResponseDto>>.CreateSuccess(cartItems, "Cart items retrieved successfully");
            return Ok(response);
        }
        catch (Exception ex)
        {
            var errorResponse = GenericResponse<IEnumerable<DTO.Response.CartItemResponseDto>>.CreateError($"Error retrieving cart items: {ex.Message}");
            return StatusCode(500, errorResponse);
        }
    }

    [HttpPost]
    public async Task<IActionResult> AddToCart([FromBody] DTO.Request.AddToCartRequestDto request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                var validationErrors = new Dictionary<string, List<string>>();
                foreach (var key in ModelState.Keys)
                {
                    var errors = ModelState[key]?.Errors.Select(e => e.ErrorMessage).ToList() ?? new List<string>();
                    if (errors.Any())
                    {
                        validationErrors[key] = errors;
                    }
                }
                
                var validationResponse = GenericResponse<DTO.Response.CartItemResponseDto>.CreateValidationError(validationErrors);
                return BadRequest(validationResponse);
            }

            var userId = GetCurrentUserId();
            var cartItem = await _cartService.AddToCartAsync(userId, request);
            var response = GenericResponse<DTO.Response.CartItemResponseDto>.CreateSuccess(cartItem, "Item added to cart successfully");
            return Ok(response);
        }
        catch (ArgumentException ex)
        {
            var errorResponse = GenericResponse<DTO.Response.CartItemResponseDto>.CreateError(ex.Message, System.Net.HttpStatusCode.BadRequest);
            return BadRequest(errorResponse);
        }
        catch (Exception ex)
        {
            var errorResponse = GenericResponse<DTO.Response.CartItemResponseDto>.CreateError($"Error adding item to cart: {ex.Message}");
            return StatusCode(500, errorResponse);
        }
    }

    [HttpPut("{productId}")]
    public async Task<IActionResult> UpdateCartItem(string productId, [FromBody] DTO.Request.UpdateCartItemRequestDto request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                var validationErrors = new Dictionary<string, List<string>>();
                foreach (var key in ModelState.Keys)
                {
                    var errors = ModelState[key]?.Errors.Select(e => e.ErrorMessage).ToList() ?? new List<string>();
                    if (errors.Any())
                    {
                        validationErrors[key] = errors;
                    }
                }
                
                var validationResponse = GenericResponse<DTO.Response.CartItemResponseDto>.CreateValidationError(validationErrors);
                return BadRequest(validationResponse);
            }

            var userId = GetCurrentUserId();
            var cartItem = await _cartService.UpdateCartItemAsync(userId, productId, request);
            var response = GenericResponse<DTO.Response.CartItemResponseDto>.CreateSuccess(cartItem, "Cart item updated successfully");
            return Ok(response);
        }
        catch (ArgumentException ex)
        {
            var errorResponse = GenericResponse<DTO.Response.CartItemResponseDto>.CreateError(ex.Message, System.Net.HttpStatusCode.BadRequest);
            return BadRequest(errorResponse);
        }
        catch (Exception ex)
        {
            var errorResponse = GenericResponse<DTO.Response.CartItemResponseDto>.CreateError($"Error updating cart item: {ex.Message}");
            return StatusCode(500, errorResponse);
        }
    }

    [HttpDelete("{productId}")]
    public async Task<IActionResult> RemoveFromCart(string productId)
    {
        try
        {
            var userId = GetCurrentUserId();
            var success = await _cartService.RemoveFromCartAsync(userId, productId);
            if (!success)
            {
                var errorResponse = GenericResponse<object>.CreateError("Failed to remove item from cart", System.Net.HttpStatusCode.BadRequest);
                return BadRequest(errorResponse);
            }
            
            var response = GenericResponse<object>.CreateSuccess(null!, "Item removed from cart successfully");
            return Ok(response);
        }
        catch (Exception ex)
        {
            var errorResponse = GenericResponse<object>.CreateError($"Error removing item from cart: {ex.Message}");
            return StatusCode(500, errorResponse);
        }
    }

    [HttpDelete("clear")]
    public async Task<IActionResult> ClearCart()
    {
        try
        {
            var userId = GetCurrentUserId();
            var success = await _cartService.ClearCartAsync(userId);
            if (!success)
            {
                var errorResponse = GenericResponse<object>.CreateError("Failed to clear cart", System.Net.HttpStatusCode.BadRequest);
                return BadRequest(errorResponse);
            }
            
            var response = GenericResponse<object>.CreateSuccess(null!, "Cart cleared successfully");
            return Ok(response);
        }
        catch (Exception ex)
        {
            var errorResponse = GenericResponse<object>.CreateError($"Error clearing cart: {ex.Message}");
            return StatusCode(500, errorResponse);
        }
    }

    private string GetCurrentUserId()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
        {
            throw new UnauthorizedAccessException("User ID not found in token");
        }
        return userId;
    }
}
