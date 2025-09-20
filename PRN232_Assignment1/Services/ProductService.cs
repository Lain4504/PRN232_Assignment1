

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
    
    public IEnumerable<ProductResponseDto> GetAllProducts()
    {
        throw new NotImplementedException();
    }

    public ProductResponseDto GetProductById(int id)
    {
        throw new NotImplementedException();
    }

    public void AddProduct(ProductRequestDto productDto)
    {
        throw new NotImplementedException();
    }

    public void UpdateProduct(int id, ProductRequestDto productDto)
    {
        throw new NotImplementedException();
    }

    public void DeleteProduct(int id)
    {
        throw new NotImplementedException();
    }
}