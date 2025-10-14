using System;
using System.Text;
using System.Web;
using System.Net;
using System.Security.Cryptography;
using Microsoft.Extensions.Options;
using PRN232_Assignment1.Models;
using System.Globalization;
using PRN232_Assignment1.IServices;

namespace PRN232_Assignment1.Services
{
    public class VNPayService : IVNPayService
    {
        private readonly VNPayConfig _config;

        public VNPayService(IOptions<VNPayConfig> options)
        {
            _config = options.Value;
        }

        public string CreatePaymentUrl(PaymentInformation payment, HttpContext context)
        {
            var timeZoneById = TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time");
            var timeNow = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, timeZoneById);
            var tick = DateTime.Now.Ticks.ToString();
            var pay = new VNPayLibrary();

            pay.AddRequestData("vnp_Version", _config.Version);
            pay.AddRequestData("vnp_Command", "pay");
            pay.AddRequestData("vnp_TmnCode", _config.TmnCode);
            pay.AddRequestData("vnp_Amount", ((int)payment.Amount * 100).ToString());
            pay.AddRequestData("vnp_CreateDate", timeNow.ToString("yyyyMMddHHmmss"));
            pay.AddRequestData("vnp_CurrCode", "VND");
            pay.AddRequestData("vnp_IpAddr", pay.GetIpAddress(context));
            pay.AddRequestData("vnp_Locale", _config.Locale);
            pay.AddRequestData("vnp_OrderInfo", $"{payment.OrderDescription} {payment.OrderId}");
            pay.AddRequestData("vnp_OrderType", payment.OrderType);
            pay.AddRequestData("vnp_ReturnUrl", _config.ReturnUrl);
            pay.AddRequestData("vnp_TxnRef", tick);

            var paymentUrl = pay.CreateRequestUrl(_config.PaymentUrl, _config.HashSecret);

            return paymentUrl;
        }

        public PaymentResponse ProcessPaymentCallback(IQueryCollection collections)
        {
            var pay = new VNPayLibrary();
            var response = pay.GetFullResponseData(collections, _config.HashSecret);

            return response;
        }
    }

    public class VNPayLibrary
    {
        private SortedList<string, string> _requestData = new SortedList<string, string>(new VnPayCompare());
        private SortedList<string, string> _responseData = new SortedList<string, string>(new VnPayCompare());

        public void AddRequestData(string key, string value)
        {
            if (!string.IsNullOrEmpty(value))
            {
                _requestData.Add(key, value);
            }
        }

        public void AddResponseData(string key, string value)
        {
            if (!string.IsNullOrEmpty(value))
            {
                _responseData.Add(key, value);
            }
        }

        public string CreateRequestUrl(string baseUrl, string vnp_HashSecret)
        {
            StringBuilder data = new StringBuilder();
            foreach (KeyValuePair<string, string> kv in _requestData)
            {
                if (!String.IsNullOrEmpty(kv.Value))
                {
                    data.Append(WebUtility.UrlEncode(kv.Key) + "=" + WebUtility.UrlEncode(kv.Value) + "&");
                }
            }
            string queryString = data.ToString();

            baseUrl += "?" + queryString;
            String signData = queryString;
            if (signData.Length > 0)
            {
                signData = signData.Remove(data.Length - 1, 1);
            }
            string vnp_SecureHash = ComputeHmacSha512(vnp_HashSecret, signData);
            baseUrl += "vnp_SecureHash=" + vnp_SecureHash;

            return baseUrl;
        }

        public PaymentResponse GetFullResponseData(IQueryCollection collection, string vnp_HashSecret)
        {
            var vnpayData = new SortedList<string, string>(new VnPayCompare());
            foreach (var (key, value) in collection)
            {
                if (!string.IsNullOrEmpty(key) && key.StartsWith("vnp_"))
                {
                    vnpayData.Add(key, value.ToString());
                }
            }

            var signData = string.Join("&", vnpayData
                .Where(kv => !kv.Key.Equals("vnp_SecureHash"))
                .Select(kv => $"{WebUtility.UrlEncode(kv.Key)}={WebUtility.UrlEncode(kv.Value)}"));

            var vnp_SecureHash = collection["vnp_SecureHash"].ToString();
            var checkSignature = ComputeHmacSha512(vnp_HashSecret, signData);

            // Extract OrderId from vnp_OrderInfo
            // Format: "Thanh toan don hang #<OrderId> <OrderId>"
            var orderInfo = collection["vnp_OrderInfo"].ToString();
            var orderId = ExtractOrderIdFromOrderInfo(orderInfo);

            var response = new PaymentResponse
            {
                OrderDescription = collection["vnp_OrderInfo"],
                TransactionId = collection["vnp_TransactionNo"],
                OrderId = orderId,
                PaymentMethod = collection["vnp_CardType"],
                PaymentId = collection["vnp_TransactionNo"],
                Success = collection["vnp_ResponseCode"].Equals("00"),
                Token = vnp_SecureHash,
                VnPayResponseCode = collection["vnp_ResponseCode"]
            };

            return response;
        }

        private string ExtractOrderIdFromOrderInfo(string orderInfo)
        {
            // OrderInfo format: "Thanh toan don hang #<OrderId> <OrderId>"
            // We need to extract the UUID (OrderId) from this string
            
            // Try to find a UUID pattern in the string
            var parts = orderInfo.Split(' ', StringSplitOptions.RemoveEmptyEntries);
            
            // Look for a UUID in the parts (format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)
            foreach (var part in parts)
            {
                var cleanPart = part.Trim('#');
                if (System.Guid.TryParse(cleanPart, out _))
                {
                    return cleanPart;
                }
            }
            
            // If no UUID found, return empty string
            return string.Empty;
        }

        public string GetIpAddress(HttpContext context)
        {
            string ipAddress;
            try
            {
                ipAddress = context.Connection.RemoteIpAddress.ToString();

                if (string.IsNullOrEmpty(ipAddress))
                {
                    ipAddress = "127.0.0.1";
                }
            }
            catch (Exception)
            {
                ipAddress = "127.0.0.1";
            }

            return ipAddress;
        }

        private string ComputeHmacSha512(string key, string data)
        {
            var keyBytes = Encoding.UTF8.GetBytes(key);
            var dataBytes = Encoding.UTF8.GetBytes(data);

            using (var hmac = new HMACSHA512(keyBytes))
            {
                var hash = hmac.ComputeHash(dataBytes);
                return BitConverter.ToString(hash).Replace("-", "").ToLower();
            }
        }
    }

    public class VnPayCompare : IComparer<string>
    {
        public int Compare(string x, string y)
        {
            if (x == y) return 0;
            if (x == null) return -1;
            if (y == null) return 1;
            var vnpCompare = CompareInfo.GetCompareInfo("en-US");
            return vnpCompare.Compare(x, y, CompareOptions.Ordinal);
        }
    }
}
