'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { PaymentAPI, PaymentCallbackResponse } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function PaymentCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [paymentResult, setPaymentResult] = useState<PaymentCallbackResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processPaymentCallback = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get query parameters from VNPay
        const queryParams = new URLSearchParams(searchParams.toString());
        
        if (queryParams.size === 0) {
          setError('No payment information received');
          return;
        }

        // Process the callback
        const response = await PaymentAPI.processCallback(queryParams);
        
        if (response.success) {
          setPaymentResult(response.data);
          
          if (response.data.success) {
            toast.success('Payment successful!');
          } else {
            toast.error('Payment failed');
          }
        } else {
          setError(response.message || 'Failed to process payment');
          toast.error('Failed to process payment');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred';
        setError(errorMessage);
        toast.error('Payment processing error');
      } finally {
        setLoading(false);
      }
    };

    processPaymentCallback();
  }, [searchParams]);

  const handleViewOrder = () => {
    if (paymentResult?.orderId) {
      router.push(`/orders/${paymentResult.orderId}`);
    }
  };

  const handleRetryPayment = () => {
    router.push('/checkout');
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <h2 className="text-xl font-semibold mb-2">Processing Payment</h2>
            <p className="text-muted-foreground text-center">
              Please wait while we process your payment...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
              <CardTitle>Payment Error</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-center py-8">
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2 text-red-900">Payment Processing Failed</h2>
            <p className="text-muted-foreground mb-6">{error}</p>
            <div className="space-y-3">
              <Button onClick={handleRetryPayment} className="w-full sm:w-auto">
                Try Again
              </Button>
              <Link href="/">
                <Button variant="outline" className="w-full sm:w-auto">
                  Back to Home
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!paymentResult) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardContent className="text-center py-8">
            <h2 className="text-xl font-semibold mb-2">No Payment Information</h2>
            <p className="text-muted-foreground mb-6">
              No payment information was received. Please try again.
            </p>
            <Button onClick={handleRetryPayment}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <CardTitle>
              Payment {paymentResult.success ? 'Successful' : 'Failed'}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            {paymentResult.success ? (
              <>
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-semibold mb-2 text-green-900">
                  Payment Successful!
                </h2>
                <p className="text-muted-foreground mb-6">
                  Thank you for your purchase. Your order has been confirmed.
                </p>
              </>
            ) : (
              <>
                <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                <h2 className="text-2xl font-semibold mb-2 text-red-900">
                  Payment Failed
                </h2>
                <p className="text-muted-foreground mb-6">
                  {paymentResult.message || 'Your payment could not be processed. Please try again.'}
                </p>
              </>
            )}

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-medium mb-3">Payment Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Order ID:</span>
                  <span className="font-mono">{paymentResult.orderId}</span>
                </div>
                {paymentResult.transactionId && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Transaction ID:</span>
                    <span className="font-mono">{paymentResult.transactionId}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span className={`font-medium ${paymentResult.success ? 'text-green-600' : 'text-red-600'}`}>
                    {paymentResult.success ? 'Success' : 'Failed'}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {paymentResult.success ? (
                <>
                  <Button onClick={handleViewOrder} className="w-full sm:w-auto">
                    View Order Details
                  </Button>
                  <Link href="/">
                    <Button variant="outline" className="w-full sm:w-auto">
                      Continue Shopping
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Button onClick={handleRetryPayment} className="w-full sm:w-auto">
                    Try Payment Again
                  </Button>
                  <Link href="/">
                    <Button variant="outline" className="w-full sm:w-auto">
                      Back to Home
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
