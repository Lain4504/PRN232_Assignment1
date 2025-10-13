using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using PRN232_Assignment1.DTO;
using PRN232_Assignment1.IServices;
using System.Security.Claims;

namespace PRN232_Assignment1.Controllers;

[ApiController]
[Route("api/orders")]
[Authorize]
public class OrderController : ControllerBase
{
    private readonly IOrderService _orderService;

    public OrderController(IOrderService orderService)
    {
        _orderService = orderService;
    }

    [HttpGet]
    public async Task<IActionResult> GetOrders()
    {
        try
        {
            var userId = GetCurrentUserId();
            var orders = await _orderService.GetOrdersByUserIdAsync(userId);
            var response = GenericResponse<IEnumerable<DTO.Response.OrderResponseDto>>.CreateSuccess(orders, "Orders retrieved successfully");
            return Ok(response);
        }
        catch (Exception ex)
        {
            var errorResponse = GenericResponse<IEnumerable<DTO.Response.OrderResponseDto>>.CreateError($"Error retrieving orders: {ex.Message}");
            return StatusCode(500, errorResponse);
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetOrderById(string id)
    {
        try
        {
            var order = await _orderService.GetOrderByIdAsync(id);
            if (order == null)
            {
                var notFoundResponse = GenericResponse<DTO.Response.OrderResponseDto>.CreateError("Order not found", System.Net.HttpStatusCode.NotFound, "ORDER_NOT_FOUND");
                return NotFound(notFoundResponse);
            }

            var response = GenericResponse<DTO.Response.OrderResponseDto>.CreateSuccess(order, "Order retrieved successfully");
            return Ok(response);
        }
        catch (Exception ex)
        {
            var errorResponse = GenericResponse<DTO.Response.OrderResponseDto>.CreateError($"Error retrieving order: {ex.Message}");
            return StatusCode(500, errorResponse);
        }
    }

    [HttpPost]
    public async Task<IActionResult> CreateOrder([FromBody] DTO.Request.CreateOrderRequestDto request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                var validationErrors = new Dictionary<string, List<string>>();
                foreach (var key in ModelState.Keys)
                {
                    var errors = ModelState[key]?.Errors.Select(e => e.ErrorMessage).ToList() ?? new List<string>();
                    if (errors.Any())
                    {
                        validationErrors[key] = errors;
                    }
                }
                
                var validationResponse = GenericResponse<DTO.Response.OrderResponseDto>.CreateValidationError(validationErrors);
                return BadRequest(validationResponse);
            }

            var userId = GetCurrentUserId();
            var order = await _orderService.CreateOrderAsync(userId, request);
            var response = GenericResponse<DTO.Response.OrderResponseDto>.CreateSuccess(order, "Order created successfully");
            return CreatedAtAction(nameof(GetOrderById), new { id = order.Id }, response);
        }
        catch (InvalidOperationException ex)
        {
            var errorResponse = GenericResponse<DTO.Response.OrderResponseDto>.CreateError(ex.Message, System.Net.HttpStatusCode.BadRequest);
            return BadRequest(errorResponse);
        }
        catch (ArgumentException ex)
        {
            var errorResponse = GenericResponse<DTO.Response.OrderResponseDto>.CreateError(ex.Message, System.Net.HttpStatusCode.BadRequest);
            return BadRequest(errorResponse);
        }
        catch (Exception ex)
        {
            var errorResponse = GenericResponse<DTO.Response.OrderResponseDto>.CreateError($"Error creating order: {ex.Message}");
            return StatusCode(500, errorResponse);
        }
    }

    [HttpPut("{id}/status")]
    public async Task<IActionResult> UpdateOrderStatus(string id, [FromBody] UpdateOrderStatusRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                var validationErrors = new Dictionary<string, List<string>>();
                foreach (var key in ModelState.Keys)
                {
                    var errors = ModelState[key]?.Errors.Select(e => e.ErrorMessage).ToList() ?? new List<string>();
                    if (errors.Any())
                    {
                        validationErrors[key] = errors;
                    }
                }
                
                var validationResponse = GenericResponse<DTO.Response.OrderResponseDto>.CreateValidationError(validationErrors);
                return BadRequest(validationResponse);
            }

            var order = await _orderService.UpdateOrderStatusAsync(id, request.Status, request.PaymentId);
            var response = GenericResponse<DTO.Response.OrderResponseDto>.CreateSuccess(order, "Order status updated successfully");
            return Ok(response);
        }
        catch (ArgumentException ex)
        {
            var errorResponse = GenericResponse<DTO.Response.OrderResponseDto>.CreateError(ex.Message, System.Net.HttpStatusCode.BadRequest);
            return BadRequest(errorResponse);
        }
        catch (Exception ex)
        {
            var errorResponse = GenericResponse<DTO.Response.OrderResponseDto>.CreateError($"Error updating order status: {ex.Message}");
            return StatusCode(500, errorResponse);
        }
    }

    private string GetCurrentUserId()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
        {
            throw new UnauthorizedAccessException("User ID not found in token");
        }
        return userId;
    }
}

public class UpdateOrderStatusRequest
{
    public string Status { get; set; } = string.Empty;
    public string? PaymentId { get; set; }
}
