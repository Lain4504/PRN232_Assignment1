
using PRN232_Assignment1.DTO.Request;
using PRN232_Assignment1.DTO.Response;
using PRN232_Assignment1.IRepositories;
using PRN232_Assignment1.IServices;
using Microsoft.AspNetCore.Http;
using SocialNetwork.Core.Modules.Images.Interfaces;

namespace PRN232_Assignment1.Services;

public class ProductService : IProductService
{
    private readonly IProductRepository _productRepository;
    private readonly ICloudflareService _cloudflareService;
    
    public ProductService(IProductRepository productRepository, ICloudflareService cloudflareService)
    {
        _productRepository = productRepository;
        _cloudflareService = cloudflareService;
    }
    
    public async Task<IEnumerable<ProductResponseDto>> GetAllProductsAsync()
    {
        var products = await _productRepository.GetAllProductsAsync();
        var productDtos = products.Select(p => new ProductResponseDto
        {
            Id = p.Id,
            Name = p.Name,
            Description = p.Description,
            Price = p.Price,
            Image = p.Image
        }).ToList();
        
        return productDtos;
    }

    public async Task<PaginatedResponseDto<ProductResponseDto>> GetProductsPaginatedAsync(int page, int pageSize)
    {
        var (products, totalCount) = await _productRepository.GetProductsPaginatedAsync(page, pageSize);
        var productDtos = products.Select(p => new ProductResponseDto
        {
            Id = p.Id,
            Name = p.Name,
            Description = p.Description,
            Price = p.Price,
            Image = p.Image
        }).ToList();
        
        return new PaginatedResponseDto<ProductResponseDto>(productDtos, page, pageSize, totalCount);
    }

    public async Task<PaginatedResponseDto<ProductResponseDto>> SearchProductsAsync(ProductSearchRequestDto searchRequest)
    {
        var (products, totalCount) = await _productRepository.SearchProductsAsync(
            searchRequest.SearchTerm,
            searchRequest.MinPrice,
            searchRequest.MaxPrice,
            searchRequest.SortOrder,
            searchRequest.Page,
            searchRequest.PageSize);

        var productDtos = products.Select(p => new ProductResponseDto
        {
            Id = p.Id,
            Name = p.Name,
            Description = p.Description,
            Price = p.Price,
            Image = p.Image
        }).ToList();
        
        return new PaginatedResponseDto<ProductResponseDto>(productDtos, searchRequest.Page, searchRequest.PageSize, totalCount);
    }

    public async Task<ProductResponseDto?> GetProductByIdAsync(string id)
    {
        var product = await _productRepository.GetProductByIdAsync(id);
        if (product == null)
        {
            return null;
        }
        
        var productDto = new ProductResponseDto
        {
            Id = product.Id,
            Name = product.Name,
            Description = product.Description,
            Price = product.Price,
            Image = product.Image
        };
        
        return productDto;
    }

    public async Task<ProductResponseDto> AddProductAsync(ProductRequestDto productDto, IFormFile? imageFile = null)
    {
        string imageUrl = string.Empty;
        
        // Upload image if provided
        if (imageFile != null)
        {
            imageUrl = await _cloudflareService.UploadImage(imageFile);
        }
        
        var product = new Models.Product
        {
            Name = productDto.Name,
            Description = productDto.Description,
            Price = productDto.Price,
            Image = imageUrl
        };
        
        var createdProduct = await _productRepository.AddProductAsync(product);
        var responseDto = new ProductResponseDto
        {
            Id = createdProduct.Id,
            Name = createdProduct.Name,
            Description = createdProduct.Description,
            Price = createdProduct.Price,
            Image = createdProduct.Image
        };
        
        return responseDto;
    }

    public async Task<(ProductResponseDto? Product, bool WasModified)> UpdateProductAsync(string id, ProductRequestDto productDto, IFormFile? imageFile = null)
    {
        var existingProduct = await _productRepository.FindByIdAsync(id);
        if (existingProduct == null)
        {
            return (null, false); // Product not found
        }
        
        existingProduct.Name = productDto.Name;
        existingProduct.Description = productDto.Description;
        existingProduct.Price = productDto.Price;
        
        // Only update image if new image file is provided
        if (imageFile != null)
        {
            existingProduct.Image = await _cloudflareService.UploadImage(imageFile);
        }
        // If no new file is provided, keep existing image unchanged
        
        var (updatedProduct, wasModified) = await _productRepository.UpdateProductAsync(id, existingProduct);
        if (updatedProduct == null)
        {
            return (null, false); // Update failed
        }
        
        var responseDto = new ProductResponseDto
        {
            Id = updatedProduct.Id,
            Name = updatedProduct.Name,
            Description = updatedProduct.Description,
            Price = updatedProduct.Price,
            Image = updatedProduct.Image
        };
        
        return (responseDto, wasModified);
    }

    public async Task<bool> DeleteProductAsync(string id)
    {
        var existingProduct = await _productRepository.FindByIdAsync(id);
        if (existingProduct == null)
        {
            return false;
        }
        
        var result = await _productRepository.DeleteProductAsync(id);
        return result;
    }
}