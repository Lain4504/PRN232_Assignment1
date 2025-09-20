using MongoDB.Driver;
using PRN232_Assignment1.Data;
using PRN232_Assignment1.IRepositories;
using PRN232_Assignment1.Models;

namespace PRN232_Assignment1.Repositories;

public class ProductRepository : IProductRepository
{
    private readonly ProductContext _context;
    
    public ProductRepository(ProductContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Product>> GetAllProductsAsync()
    {
        return await _context.Products.Find(_ => true).ToListAsync();
    }

    public async Task<Product?> GetProductByIdAsync(string id)
    {
        return await _context.Products.Find(p => p.Id == id).FirstOrDefaultAsync();
    }

    public async Task<Product> AddProductAsync(Product product)
    {
        await _context.Products.InsertOneAsync(product);
        return product;
    }

    public async Task<Product?> UpdateProductAsync(string id, Product product)
    {
        product.Id = id; // Ensure the ID is set correctly
        var result = await _context.Products.ReplaceOneAsync(p => p.Id == id, product);
        return result.IsAcknowledged && result.ModifiedCount > 0 ? product : null;
    }

    public async Task<bool> DeleteProductAsync(string id)
    {
        var result = await _context.Products.DeleteOneAsync(p => p.Id == id);
        return result.IsAcknowledged && result.DeletedCount > 0;
    }
}