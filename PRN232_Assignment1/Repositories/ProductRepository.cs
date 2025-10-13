using PRN232_Assignment1.DTO.Request;
using PRN232_Assignment1.IRepositories;
using PRN232_Assignment1.Models;
using Supabase;
using Supabase.Postgrest;
using Supabase.Postgrest.Models;
using Supabase.Postgrest.Responses;
using static Supabase.Postgrest.Constants;

namespace PRN232_Assignment1.Repositories;

public class ProductRepository : IProductRepository
{
    private readonly Supabase.Client _supabase;
    
    public ProductRepository(Supabase.Client supabase)
    {
        _supabase = supabase;
    }

    public async Task<IEnumerable<Product>> GetAllProductsAsync()
    {
        var result = await _supabase.From<Product>().Get();
        return result.Models;
    }

    public async Task<(IEnumerable<Product> Products, int TotalCount)> GetProductsPaginatedAsync(int page, int pageSize)
    {
        var from = (page - 1) * pageSize;
        var to = from + pageSize - 1;
        
        var result = await _supabase
            .From<Product>()
            .Range(from, to)
            .Get();
            
        var countResult = await _supabase
            .From<Product>()
            .Select("*")
            .Count(CountType.Exact);
        
        return (result.Models, countResult);
    }

    public async Task<(IEnumerable<Product> Products, int TotalCount)> SearchProductsAsync(
        string? searchTerm,
        float? minPrice,
        float? maxPrice,
        SortOrder sortOrder,
        int page,
        int pageSize)
    {
        var from = (page - 1) * pageSize;
        var to = from + pageSize - 1;
        
        // Build query step by step
        var query = _supabase.From<Product>();
        
        // Apply search term filter
        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            query = (Supabase.Interfaces.ISupabaseTable<Product, Supabase.Realtime.RealtimeChannel>)query.Filter("name", Operator.ILike, $"%{searchTerm}%");
        }
        
        // Apply price filters
        if (minPrice.HasValue)
        {
            query = (Supabase.Interfaces.ISupabaseTable<Product, Supabase.Realtime.RealtimeChannel>)query.Filter("price", Operator.GreaterThanOrEqual, minPrice.Value);
        }
        
        if (maxPrice.HasValue)
        {
            query = (Supabase.Interfaces.ISupabaseTable<Product, Supabase.Realtime.RealtimeChannel>)query.Filter("price", Operator.LessThanOrEqual, maxPrice.Value);
        }
        
        // Apply sorting
        var orderColumn = (minPrice.HasValue || maxPrice.HasValue) ? "price" : "name";
        var ascending = sortOrder == SortOrder.Ascending;
        
        var result = await query
            .Order(orderColumn, ascending ? Ordering.Ascending : Ordering.Descending)
            .Range(from, to)
            .Get();
            
        // Get count with a separate query
        var countQuery = _supabase.From<Product>();
        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            countQuery = (Supabase.Interfaces.ISupabaseTable<Product, Supabase.Realtime.RealtimeChannel>)countQuery.Filter("name", Operator.ILike, $"%{searchTerm}%");
        }
        if (minPrice.HasValue)
        {
            countQuery = (Supabase.Interfaces.ISupabaseTable<Product, Supabase.Realtime.RealtimeChannel>)countQuery.Filter("price", Operator.GreaterThanOrEqual, minPrice.Value);
        }
        if (maxPrice.HasValue)
        {
            countQuery = (Supabase.Interfaces.ISupabaseTable<Product, Supabase.Realtime.RealtimeChannel>)countQuery.Filter("price", Operator.LessThanOrEqual, maxPrice.Value);
        }
        
        var countResult = await countQuery
            .Select("*")
            .Count(CountType.Exact);
        
        return (result.Models, countResult);
    }

    public async Task<Product?> GetProductByIdAsync(string id)
    {
        var result = await _supabase
            .From<Product>()
            .Filter("id", Operator.Equals, id)
            .Single();
        return result;
    }

    public async Task<Product> AddProductAsync(Product product)
    {
        // Clear ID to let database auto-generate UUID
        product.Id = string.Empty;
        
        var result = await _supabase
            .From<Product>()
            .Insert(product);
        return result.Models.First();
    }

    public async Task<(Product? Product, bool WasModified)> UpdateProductAsync(string id, Product product)
    {
        product.Id = id; // Ensure the ID is set correctly
        
        try
        {
            var result = await _supabase
                .From<Product>()
                .Filter("id", Operator.Equals, id)
                .Update(product);
            
            if (result.Models.Any())
            {
                return (result.Models.First(), true);
            }
            return (null, false);
        }
        catch
        {
            return (null, false); // Update failed
        }
    }

    public async Task<bool> DeleteProductAsync(string id)
    {
        try
        {
            await _supabase
                .From<Product>()
                .Filter("id", Operator.Equals, id)
                .Delete();
            return true;
        }
        catch
        {
            return false;
        }
    }

    public async Task<Product?> FindByIdAsync(string id)
    {
        var result = await _supabase
            .From<Product>()
            .Filter("id", Operator.Equals, id)
            .Single();
        return result;
    }
}