using PRN232_Assignment1.Models;

namespace PRN232_Assignment1.IServices
{
    public interface IVNPayService
    {
        string CreatePaymentUrl(PaymentInformation payment, HttpContext context);
        PaymentResponse ProcessPaymentCallback(IQueryCollection collections);
    }

    public class PaymentInformation
    {
        public decimal Amount { get; set; }
        public string OrderType { get; set; } = string.Empty;
        public string OrderDescription { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string OrderId { get; set; } = string.Empty;
    }

    public class PaymentResponse
    {
        public string OrderDescription { get; set; } = string.Empty;
        public string TransactionId { get; set; } = string.Empty;
        public string OrderId { get; set; } = string.Empty;
        public string PaymentMethod { get; set; } = string.Empty;
        public string PaymentId { get; set; } = string.Empty;
        public bool Success { get; set; }
        public string Token { get; set; } = string.Empty;
        public string VnPayResponseCode { get; set; } = string.Empty;
    }
}
