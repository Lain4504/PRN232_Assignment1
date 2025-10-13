# VNPay Payment Integration

This document describes the VNPay payment integration implemented in the application.

## Overview

The application now supports VNPay payment gateway integration, allowing users to pay for orders using various Vietnamese payment methods including:
- Domestic ATM cards
- International Credit/Debit cards
- E-wallets (Momo, ZaloPay, ViettelPay)
- Internet Banking

## Backend Implementation

### Files Added/Modified

1. **Models/VNPayConfig.cs** - Configuration model for VNPay settings
2. **IServices/IVNPayService.cs** - Interface and DTOs for VNPay service
3. **Services/VNPayService.cs** - Main VNPay service implementation
4. **Controllers/PaymentController.cs** - Payment API endpoints
5. **Services/OrderService.cs** - Updated to support "pending_payment" status
6. **Program.cs** - VNPay service registration and configuration
7. **.env** - Environment variables for VNPay configuration

### API Endpoints

- `POST /api/payment/create-payment-url` - Generate VNPay payment URL
- `GET /api/payment/vnpay-callback` - Handle VNPay return callback

## Frontend Implementation

### Files Added/Modified

1. **lib/api.ts** - Added VNPay API types and PaymentAPI class
2. **app/checkout/page.tsx** - Updated to use VNPay payment flow
3. **app/payment/callback/page.tsx** - New page to handle payment results

## Configuration

### Environment Variables

Add the following variables to your `.env` file:

```env
# VNPay Configuration
VNPAY_TMN_CODE=your_vnpay_tmn_code_here
VNPAY_HASH_SECRET=your_vnpay_hash_secret_here
VNPAY_PAYMENT_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNPAY_RETURN_URL=http://localhost:3000/payment/callback
```

### VNPay Account Setup

1. Register for a VNPay merchant account at https://vnpayment.vn/
2. Get your TMN Code and Hash Secret from VNPay dashboard
3. Configure the return URL in VNPay merchant settings
4. For testing, use VNPay sandbox environment

## Payment Flow

1. **Order Creation**: User creates order with "pending_payment" status
2. **Payment URL Generation**: System generates VNPay payment URL
3. **VNPay Redirect**: User is redirected to VNPay payment page
4. **Payment Processing**: User completes payment on VNPay
5. **Callback Processing**: VNPay redirects back with payment result
6. **Order Status Update**: Order status is updated based on payment result

## Order Statuses

- `pending_payment` - Order created, waiting for payment
- `paid` - Payment successful
- `failed` - Payment failed

## Testing

For testing purposes, you can use VNPay's sandbox environment with test cards and credentials provided in their documentation.

## Security Notes

- Hash secret should be kept secure and not exposed in client-side code
- All payment processing is handled server-side
- VNPay callback verification ensures payment authenticity
- Order status updates are atomic and secure

## Troubleshooting

1. **Payment URL not generated**: Check VNPay configuration and credentials
2. **Callback not working**: Verify return URL configuration in VNPay
3. **Order status not updating**: Check callback processing and order service
4. **CORS issues**: Ensure proper CORS configuration for frontend-backend communication
