using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using PRN232_Assignment1.DTO;
using PRN232_Assignment1.IServices;
using System.Security.Claims;

namespace PRN232_Assignment1.Controllers
{
    [ApiController]
    [Route("api/payment")]
    public class PaymentController : ControllerBase
    {
        private readonly IVNPayService _vnPayService;
        private readonly IOrderService _orderService;

        public PaymentController(IVNPayService vnPayService, IOrderService orderService)
        {
            _vnPayService = vnPayService;
            _orderService = orderService;
        }

        [HttpPost("create-payment-url")]
        [Authorize]
        public async Task<IActionResult> CreatePaymentUrl([FromBody] CreatePaymentUrlRequest request)
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
                    
                    var validationResponse = GenericResponse<string>.CreateValidationError(validationErrors);
                    return BadRequest(validationResponse);
                }

                var userId = GetCurrentUserId();
                
                // Verify order belongs to current user
                var order = await _orderService.GetOrderByIdAsync(request.OrderId);
                if (order == null || order.UserId != userId)
                {
                    var notFoundResponse = GenericResponse<string>.CreateError("Order not found", System.Net.HttpStatusCode.NotFound, "ORDER_NOT_FOUND");
                    return NotFound(notFoundResponse);
                }

                if (order.Status != "pending_payment")
                {
                    var errorResponse = GenericResponse<string>.CreateError("Order is not in pending payment status", System.Net.HttpStatusCode.BadRequest, "INVALID_ORDER_STATUS");
                    return BadRequest(errorResponse);
                }

                // Create payment information
                var paymentInfo = new PaymentInformation
                {
                    Amount = order.TotalAmount,
                    OrderType = "other",
                    OrderDescription = $"Thanh toan don hang #{order.Id}",
                    Name = userId,
                    OrderId = order.Id
                };

                // Generate payment URL
                var paymentUrl = _vnPayService.CreatePaymentUrl(paymentInfo, HttpContext);

                var response = GenericResponse<PaymentUrlResponse>.CreateSuccess(
                    new PaymentUrlResponse { PaymentUrl = paymentUrl },
                    "Payment URL created successfully"
                );

                return Ok(response);
            }
            catch (Exception ex)
            {
                var errorResponse = GenericResponse<string>.CreateError($"Error creating payment URL: {ex.Message}");
                return StatusCode(500, errorResponse);
            }
        }

        [HttpGet("vnpay-callback")]
        public async Task<IActionResult> VNPayCallback()
        {
            try
            {
                // Process VNPay callback
                var paymentResponse = _vnPayService.ProcessPaymentCallback(Request.Query);

                if (paymentResponse.Success)
                {
                    // Update order status to paid
                    await _orderService.UpdateOrderStatusAsync(
                        paymentResponse.OrderId, 
                        "paid", 
                        paymentResponse.PaymentId
                    );

                    var response = GenericResponse<PaymentCallbackResponse>.CreateSuccess(
                        new PaymentCallbackResponse
                        {
                            Success = true,
                            OrderId = paymentResponse.OrderId,
                            TransactionId = paymentResponse.TransactionId,
                            Message = "Payment successful"
                        },
                        "Payment processed successfully"
                    );

                    return Ok(response);
                }
                else
                {
                    // Update order status to failed
                    await _orderService.UpdateOrderStatusAsync(
                        paymentResponse.OrderId, 
                        "failed", 
                        paymentResponse.PaymentId
                    );

                    var response = GenericResponse<PaymentCallbackResponse>.CreateSuccess(
                        new PaymentCallbackResponse
                        {
                            Success = false,
                            OrderId = paymentResponse.OrderId,
                            TransactionId = paymentResponse.TransactionId,
                            Message = "Payment failed"
                        },
                        "Payment failed"
                    );

                    return Ok(response);
                }
            }
            catch (Exception ex)
            {
                var errorResponse = GenericResponse<string>.CreateError($"Error processing payment callback: {ex.Message}");
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

    public class CreatePaymentUrlRequest
    {
        public string OrderId { get; set; } = string.Empty;
    }

    public class PaymentUrlResponse
    {
        public string PaymentUrl { get; set; } = string.Empty;
    }

    public class PaymentCallbackResponse
    {
        public bool Success { get; set; }
        public string OrderId { get; set; } = string.Empty;
        public string TransactionId { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
    }
}
