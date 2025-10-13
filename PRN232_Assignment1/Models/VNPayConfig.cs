using System;

namespace PRN232_Assignment1.Models
{
    public class VNPayConfig
    {
        public static string ConfigName => "Vnpay";
        public string Version { get; set; } = "2.1.0";
        public string TmnCode { get; set; } = string.Empty;
        public string HashSecret { get; set; } = string.Empty;
        public string PaymentUrl { get; set; } = string.Empty;
        public string ReturnUrl { get; set; } = string.Empty;
        public string OrderInfo { get; set; } = string.Empty;
        public string OrderType { get; set; } = "other";
        public string Locale { get; set; } = "vn";
    }
}
