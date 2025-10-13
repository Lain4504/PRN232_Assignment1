using System.ComponentModel.DataAnnotations;

namespace PRN232_Assignment1.DTO.Request;

public class ProductSearchRequestDto
{
    public string? SearchTerm { get; set; }
    
    [Range(0, float.MaxValue, ErrorMessage = "Min price must be greater than or equal to 0")]
    public float? MinPrice { get; set; }
    
    [Range(0, float.MaxValue, ErrorMessage = "Max price must be greater than or equal to 0")]
    public float? MaxPrice { get; set; }
    
    [Range(1, int.MaxValue, ErrorMessage = "Page number must be greater than 0")]
    public int Page { get; set; } = 1;

    [Range(1, 100, ErrorMessage = "Page size must be between 1 and 100")]
    public int PageSize { get; set; } = 10;
    
    public SortOrder SortOrder { get; set; } = SortOrder.Ascending;
}

public enum SortOrder
{
    Ascending,
    Descending
}
