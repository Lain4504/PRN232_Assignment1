using Microsoft.AspNetCore.Mvc;
using PRN232_Assignment1.DTO;
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

    [HttpGet]
    public async Task<IActionResult> GetAllProducts()
    {
        try
        {
            var products = await _productService.GetAllProductsAsync();
            var response = GenericResponse<IEnumerable<DTO.Response.ProductResponseDto>>.CreateSuccess(products, "Products retrieved successfully");
            return Ok(response);
        }
        catch (Exception ex)
        {
            var errorResponse = GenericResponse<IEnumerable<DTO.Response.ProductResponseDto>>.CreateError($"Error retrieving products: {ex.Message}");
            return StatusCode(500, errorResponse);
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetProductById(string id)
    {
        try
        {
            var product = await _productService.GetProductByIdAsync(id);
            if (product == null)
            {
                var notFoundResponse = GenericResponse<DTO.Response.ProductResponseDto>.CreateError("Product not found", System.Net.HttpStatusCode.NotFound, "PRODUCT_NOT_FOUND");
                return NotFound(notFoundResponse);
            }
            var response = GenericResponse<DTO.Response.ProductResponseDto>.CreateSuccess(product, "Product retrieved successfully");
            return Ok(response);
        }
        catch (Exception ex)
        {
            var errorResponse = GenericResponse<DTO.Response.ProductResponseDto>.CreateError($"Error retrieving product: {ex.Message}");
            return StatusCode(500, errorResponse);
        }
    }

    [HttpPost]
    public async Task<IActionResult> AddProduct([FromBody] DTO.Request.ProductRequestDto productDto)
    {
        try
        {
            var createdProduct = await _productService.AddProductAsync(productDto);
            var response =
                GenericResponse<DTO.Response.ProductResponseDto>.CreateSuccess(createdProduct,
                    "Product created successfully");
            return CreatedAtAction(nameof(GetProductById), new { id = createdProduct.Id }, response);
        }
        catch (Exception ex)
        {
            var errorResponse =
                GenericResponse<DTO.Response.ProductResponseDto>.CreateError($"Error creating product: {ex.Message}");
            return StatusCode(500, errorResponse);
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateProduct(string id, [FromBody] DTO.Request.ProductRequestDto productDto)
    {
        try
        {
            var updatedProduct = await _productService.UpdateProductAsync(id, productDto);
            if (updatedProduct == null)
            {
                var notFoundResponse = GenericResponse<DTO.Response.ProductResponseDto>.CreateError("Product not found", System.Net.HttpStatusCode.NotFound, "PRODUCT_NOT_FOUND");
                return NotFound(notFoundResponse);
            }
            var response = GenericResponse<DTO.Response.ProductResponseDto>.CreateSuccess(updatedProduct, "Product updated successfully");
            return Ok(response);
        }
        catch (Exception ex)
        {
            var errorResponse = GenericResponse<DTO.Response.ProductResponseDto>.CreateError($"Error updating product: {ex.Message}");
            return StatusCode(500, errorResponse);
        }
    }
    
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteProduct(string id)
    {
        try
        {
            var deleted = await _productService.DeleteProductAsync(id);
            if (!deleted)
            {
                var notFoundResponse = GenericResponse<object>.CreateError("Product not found",
                    System.Net.HttpStatusCode.NotFound, "PRODUCT_NOT_FOUND");
                return NotFound(notFoundResponse);
            }
            var response = GenericResponse<object>.CreateSuccess(null, "Product deleted successfully");
            return Ok(response);
        } catch (Exception ex)
        {
            var errorResponse = GenericResponse<object>.CreateError($"Error deleting product: {ex.Message}");
            return StatusCode(500, errorResponse);
        }
    }
}