'use client';

import { useState, useEffect } from 'react';
import { CartAPI, OrderAPI, PaymentAPI, CartItem, CreateOrderRequest, CreatePaymentUrlRequest } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CreditCard, ShoppingCart, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { formatCurrencyVND } from '@/lib/utils';

export default function CheckoutPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [error, setError] = useState<string | null>(null);


  const fetchCartItems = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await CartAPI.getCartItems();
      
      if (response.success) {
        setCartItems(response.data);
      } else {
        setError(response.message || 'Failed to fetch cart items');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCartItems();
  }, []);

  const subtotal = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
  const shipping = subtotal > 0 ? 0 : 0;
  const total = subtotal + shipping;

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setPlacingOrder(true);
    try {
      // First create order with pending_payment status
      const orderRequest: CreateOrderRequest = {
        paymentMethod: 'vnpay'
      };

      const orderResponse = await OrderAPI.createOrder(orderRequest);
      
      if (!orderResponse.success) {
        toast.error(orderResponse.message || 'Failed to create order');
        return;
      }

      // Get VNPay payment URL
      const paymentRequest: CreatePaymentUrlRequest = {
        orderId: orderResponse.data.id
      };

      const paymentResponse = await PaymentAPI.createPaymentUrl(paymentRequest);
      
      if (paymentResponse.success) {
        // Redirect to VNPay
        window.location.href = paymentResponse.data.paymentUrl;
      } else {
        toast.error(paymentResponse.message || 'Failed to create payment URL');
      }
    } catch (error) {
      toast.error('Failed to process payment');
      console.error('Payment error:', error);
    } finally {
      setPlacingOrder(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="space-y-4 sm:space-y-6">
          <div className="flex items-center space-x-4">
            <Link href="/cart">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Cart
              </Button>
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold">Checkout</h1>
          </div>
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="space-y-4 sm:space-y-6">
          <div className="flex items-center space-x-4">
            <Link href="/cart">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Cart
              </Button>
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold">Checkout</h1>
          </div>
          <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-md">
            {error}
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="space-y-4 sm:space-y-6">
          <div className="flex items-center space-x-4">
            <Link href="/cart">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Cart
              </Button>
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold">Checkout</h1>
          </div>
          <div className="text-center py-12">
            <ShoppingCart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h2 className="text-xl font-medium mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6">Add some items to your cart before checking out.</p>
            <Link href="/products">
              <Button>Browse Products</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
      <div className="space-y-4 sm:space-y-6">
        <div className="flex items-center space-x-4">
          <Link href="/cart">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Cart
            </Button>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Payment Information */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Payment Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                        <CreditCard className="h-5 w-5 text-white" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-blue-900">VNPay</h3>
                      <p className="text-sm text-blue-700">
                        Thanh toán an toàn qua VNPay. Bạn sẽ được chuyển hướng đến trang thanh toán của VNPay.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="text-sm text-gray-600">
                  <p className="mb-2">VNPay hỗ trợ các phương thức thanh toán:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Thẻ ATM nội địa</li>
                    <li>Thẻ Credit/Debit quốc tế</li>
                    <li>Ví điện tử (Momo, ZaloPay, ViettelPay)</li>
                    <li>Internet Banking</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{item.productName}</h4>
                        <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                      <span className="font-medium">{formatCurrencyVND(item.totalPrice)}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>{formatCurrencyVND(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? 'Miễn phí' : formatCurrencyVND(shipping)}</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between font-medium">
                      <span>Total</span>
                      <span className="text-primary">{formatCurrencyVND(total)}</span>
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={handlePlaceOrder}
                  disabled={placingOrder}
                  className="w-full"
                >
                  {placingOrder ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing Payment...
                    </>
                  ) : (
                    'Proceed to VNPay Payment'
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
