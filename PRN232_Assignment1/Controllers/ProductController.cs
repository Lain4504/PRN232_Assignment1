using Microsoft.AspNetCore.Mvc;
using PRN232_Assignment1.IServices;

namespace PRN232_Assignment1.Controllers;

[ApiController]
[Route("api/products")]
public class ProductController : ControllerBase
{
    private readonly IProductService _productService;
    public ProductController(IProductService productService)
    {
        _productService = productService;
    }
   
}