using PRN232_Assignment1.DTO.Request;
using PRN232_Assignment1.DTO.Response;

namespace PRN232_Assignment1.IServices;

public interface IProductService
{
    IEnumerable<ProductResponseDto> GetAllProducts();
    ProductResponseDto GetProductById(int id);
    void AddProduct(ProductRequestDto productDto);
    void UpdateProduct(int id, ProductRequestDto productDto);
    void DeleteProduct(int id);
}