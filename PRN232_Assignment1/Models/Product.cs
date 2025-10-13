using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;

namespace PRN232_Assignment1.Models;

[Table("products")]
public class Product : BaseModel
{
    [PrimaryKey("id")]
    public string Id { get; set; } = string.Empty;
    [Column("name")]
    public string Name { get; set; } = string.Empty;
    [Column("description")]
    public string Description { get; set; } = string.Empty;
    [Column("price")]
    public float Price { get; set; }
    [Column("image")]
    public string Image { get; set; } = string.Empty;
}