using PRN232_Assignment1.DTO.Request;
using PRN232_Assignment1.DTO.Response;

namespace PRN232_Assignment1.IServices;

public interface IProductService
{
    Task<IEnumerable<ProductResponseDto>> GetAllProductsAsync();
    Task<ProductResponseDto?> GetProductByIdAsync(string id);
    Task<ProductResponseDto> AddProductAsync(ProductRequestDto productDto);
    Task<ProductResponseDto?> UpdateProductAsync(string id, ProductRequestDto productDto);
    Task<bool> DeleteProductAsync(string id);
}