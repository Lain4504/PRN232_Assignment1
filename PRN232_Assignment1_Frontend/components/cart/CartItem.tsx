'use client';

import { useState } from 'react';
import { CartItem as CartItemType, CartAPI, UpdateCartItemRequest } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Trash2, Plus, Minus } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';
import { formatCurrencyVND } from '@/lib/utils';

interface CartItemProps {
  item: CartItemType;
  onUpdate: () => void;
}

export function CartItem({ item, onUpdate }: CartItemProps) {
  const [loading, setLoading] = useState(false);

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity < 1) return;

    setLoading(true);
    try {
      const request: UpdateCartItemRequest = {
        quantity: newQuantity
      };

      const response = await CartAPI.updateCartItem(item.productId, request);
      
      if (response.success) {
        onUpdate();
      } else {
        toast.error(response.message || 'Failed to update quantity');
      }
    } catch (error) {
      toast.error('Failed to update quantity');
      console.error('Update cart item error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    setLoading(true);
    try {
      const response = await CartAPI.removeFromCart(item.productId);
      
      if (response.success) {
        toast.success('Item removed from cart');
        onUpdate();
      } else {
        toast.error(response.message || 'Failed to remove item');
      }
    } catch (error) {
      toast.error('Failed to remove item');
      console.error('Remove cart item error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3 sm:gap-4 flex-wrap sm:flex-nowrap">
          {/* Product Image */}
          <div className="relative w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0">
            {item.productImage ? (
              <Image
                src={item.productImage}
                alt={item.productName}
                fill
                className="object-cover rounded-md"
              />
            ) : (
              <div className="w-full h-full bg-muted rounded-md flex items-center justify-center">
                <span className="text-muted-foreground text-xs">No image</span>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm truncate">{item.productName}</h3>
            <p className="text-xs text-muted-foreground truncate">{item.productDescription}</p>
            <p className="text-sm font-medium">{formatCurrencyVND(item.productPrice)}</p>
          </div>

          {/* Quantity Controls */}
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleQuantityChange(item.quantity - 1)}
              disabled={loading || item.quantity <= 1}
              className="h-8 w-8 p-0"
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleQuantityChange(item.quantity + 1)}
              disabled={loading}
              className="h-8 w-8 p-0"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>

          {/* Total Price */}
          <div className="text-right">
            <p className="text-sm font-medium text-primary">{formatCurrencyVND(item.totalPrice)}</p>
          </div>

          {/* Remove Button */}
          <Button
            size="sm"
            variant="ghost"
            onClick={handleRemove}
            disabled={loading}
            className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
