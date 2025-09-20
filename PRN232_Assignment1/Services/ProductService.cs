
using PRN232_Assignment1.DTO.Request;
using PRN232_Assignment1.DTO.Response;
using PRN232_Assignment1.IRepositories;
using PRN232_Assignment1.IServices;

namespace PRN232_Assignment1.Services;

public class ProductService : IProductService
{
    private readonly IProductRepository _productRepository;
    
    public ProductService(IProductRepository productRepository)
    {
        _productRepository = productRepository;
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

    public async Task<ProductResponseDto> AddProductAsync(ProductRequestDto productDto)
    {
        var product = new Models.Product
        {
            Name = productDto.Name,
            Description = productDto.Description,
            Price = productDto.Price,
            Image = productDto.Image
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

    public async Task<ProductResponseDto?> UpdateProductAsync(string id, ProductRequestDto productDto)
    {
        var existingProduct = await _productRepository.FindByIdAsync(id);
        if (existingProduct == null)
        {
            return null;
        }
        
        existingProduct.Name = productDto.Name;
        existingProduct.Description = productDto.Description;
        existingProduct.Price = productDto.Price;
        existingProduct.Image = productDto.Image;
        
        var updatedProduct = await _productRepository.UpdateProductAsync(id, existingProduct);
        if (updatedProduct == null)
        {
            return null;
        }
        
        var responseDto = new ProductResponseDto
        {
            Id = updatedProduct.Id,
            Name = updatedProduct.Name,
            Description = updatedProduct.Description,
            Price = updatedProduct.Price,
            Image = updatedProduct.Image
        };
        
        return responseDto;
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