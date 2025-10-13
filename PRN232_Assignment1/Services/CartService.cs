using PRN232_Assignment1.DTO.Request;
using PRN232_Assignment1.DTO.Response;
using PRN232_Assignment1.IRepositories;
using PRN232_Assignment1.IServices;
using PRN232_Assignment1.Models;

namespace PRN232_Assignment1.Services;

public class CartService : ICartService
{
    private readonly ICartRepository _cartRepository;
    private readonly IProductRepository _productRepository;

    public CartService(ICartRepository cartRepository, IProductRepository productRepository)
    {
        _cartRepository = cartRepository;
        _productRepository = productRepository;
    }
    public async Task<IEnumerable<CartItemResponseDto>> GetCartItemsByUserIdAsync(string userId)
    {
        var cartItems = await _cartRepository.GetCartItemsByUserIdAsync(userId);
        var cartItemDtos = new List<CartItemResponseDto>();

        foreach (var cartItem in cartItems)
        {
            var product = await _productRepository.GetProductByIdAsync(cartItem.ProductId);
            if (product != null)
            {
                cartItemDtos.Add(new CartItemResponseDto
                {
                    Id = cartItem.Id,
                    UserId = cartItem.UserId,
                    ProductId = cartItem.ProductId,
                    ProductName = product.Name,
                    ProductDescription = product.Description,
                    ProductPrice = (decimal)product.Price,
                    ProductImage = product.Image ?? "",
                    Quantity = cartItem.Quantity,
                    CreatedAt = cartItem.CreatedAt,
                    UpdatedAt = cartItem.UpdatedAt
                });
            }
        }
        return cartItemDtos;
    }

        public async Task<CartItemResponseDto> AddToCartAsync(string userId, AddToCartRequestDto request)
    {
        // Check if product exists
        var product = await _productRepository.GetProductByIdAsync(request.ProductId);
        if (product == null)
        {
            throw new ArgumentException("Product not found");
        }

        // Check if item already exists in cart
        var existingCartItem = await _cartRepository.GetCartItemByUserAndProductAsync(userId, request.ProductId);
        
        if (existingCartItem != null)
        {
            // Update quantity
            existingCartItem.Quantity += request.Quantity;
            var updatedCartItem = await _cartRepository.UpdateCartItemAsync(existingCartItem);
            
            return new CartItemResponseDto
            {
                Id = updatedCartItem.Id,
                UserId = updatedCartItem.UserId,
                ProductId = updatedCartItem.ProductId,
                ProductName = product.Name,
                ProductDescription = product.Description,
                ProductPrice = (decimal)product.Price,
                ProductImage = product.Image ?? "",
                Quantity = updatedCartItem.Quantity,
                CreatedAt = updatedCartItem.CreatedAt,
                UpdatedAt = updatedCartItem.UpdatedAt
            };
        }
        else
        {
            // Add new item
            var newCartItem = new CartItem
            {
                UserId = userId,
                ProductId = request.ProductId,
                Quantity = request.Quantity
            };

            var addedCartItem = await _cartRepository.AddToCartAsync(newCartItem);
            
            return new CartItemResponseDto
            {
                Id = addedCartItem.Id,
                UserId = addedCartItem.UserId,
                ProductId = addedCartItem.ProductId,
                ProductName = product.Name,
                ProductDescription = product.Description,
                ProductPrice = (decimal)product.Price,
                ProductImage = product.Image ?? "",
                Quantity = addedCartItem.Quantity,
                CreatedAt = addedCartItem.CreatedAt,
                UpdatedAt = addedCartItem.UpdatedAt
            };
        }
    }

    public async Task<CartItemResponseDto> UpdateCartItemAsync(string userId, string productId, UpdateCartItemRequestDto request)
    {
        var cartItem = await _cartRepository.GetCartItemByUserAndProductAsync(userId, productId);
        if (cartItem == null)
        {
            throw new ArgumentException("Cart item not found");
        }
        cartItem.Quantity = request.Quantity;
        var updatedCartItem = await _cartRepository.UpdateCartItemAsync(cartItem);
        var product = await _productRepository.GetProductByIdAsync(productId);
        if (product == null)
        {
            throw new ArgumentException("Product not found");
        }

        return new CartItemResponseDto
        {
            Id = updatedCartItem.Id,
            UserId = updatedCartItem.UserId,
            ProductId = updatedCartItem.ProductId,
            ProductName = product.Name,
            ProductDescription = product.Description,
            ProductPrice = (decimal)product.Price,
            ProductImage = product.Image ?? "",
            Quantity = updatedCartItem.Quantity,
            CreatedAt = updatedCartItem.CreatedAt,
            UpdatedAt = updatedCartItem.UpdatedAt
        };
    }

    public async Task<bool> RemoveFromCartAsync(string userId, string productId)
    {
        return await _cartRepository.RemoveFromCartAsync(userId, productId);
    }

    public async Task<bool> ClearCartAsync(string userId)
    {
        return await _cartRepository.ClearCartAsync(userId);
    }
}