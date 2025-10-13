'use client';

import { CartItem as CartItemType, CartAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { formatCurrencyVND } from '@/lib/utils';

interface CartSummaryProps {
  items: CartItemType[];
  onClear: () => void;
}

export function CartSummary({ items, onClear }: CartSummaryProps) {
  const [clearing, setClearing] = useState(false);
  const router = useRouter();

  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
  const shipping = subtotal > 0 ? 0 : 0; // Shipping fee omitted or 0 in VND context
  const total = subtotal + shipping;

  const handleClearCart = async () => {
    setClearing(true);
    try {
      const response = await CartAPI.clearCart();
      
      if (response.success) {
        toast.success('Cart cleared');
        onClear();
      } else {
        toast.error(response.message || 'Failed to clear cart');
      }
    } catch (error) {
      toast.error('Failed to clear cart');
      console.error('Clear cart error:', error);
    } finally {
      setClearing(false);
    }
  };

  const handleCheckout = () => {
    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    router.push('/checkout');
  };

  if (items.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cart Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Your cart is empty</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cart Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Subtotal ({items.length} items)</span>
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

        <div className="space-y-2">
          <Button onClick={handleCheckout} className="w-full">
            Proceed to Checkout
          </Button>
          <Button 
            variant="outline" 
            onClick={handleClearCart}
            disabled={clearing}
            className="w-full"
          >
            {clearing ? 'Clearing...' : 'Clear Cart'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
