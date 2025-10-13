'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CartAPI, AddToCartRequest } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { ShoppingCart, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface AddToCartButtonProps {
  productId: string;
  productName: string;
  variant?: 'default' | 'icon' | 'small';
  className?: string;
}

export function AddToCartButton({ 
  productId, 
  productName, 
  variant = 'default',
  className = ''
}: AddToCartButtonProps) {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  const handleAddToCart = async () => {
    if (!user) {
      toast.error('Please sign in to add items to cart');
      router.push('/auth/login');
      return;
    }

    setLoading(true);
    try {
      const request: AddToCartRequest = {
        productId,
        quantity: 1
      };

      const response = await CartAPI.addToCart(request);
      
      if (response.success) {
        toast.success(`${productName} added to cart!`);
      } else {
        toast.error(response.message || 'Failed to add item to cart');
      }
    } catch (error) {
      toast.error('Failed to add item to cart');
      console.error('Add to cart error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (variant === 'icon') {
    return (
      <Button
        size="sm"
        onClick={handleAddToCart}
        disabled={loading}
        className={`h-8 w-8 p-0 ${className}`}
      >
        <Plus className="h-4 w-4" />
      </Button>
    );
  }

  if (variant === 'small') {
    return (
      <Button
        size="sm"
        onClick={handleAddToCart}
        disabled={loading}
        className={className}
      >
        <ShoppingCart className="h-4 w-4 mr-2" />
        {loading ? 'Adding...' : 'Add to Cart'}
      </Button>
    );
  }

  return (
    <Button
      onClick={handleAddToCart}
      disabled={loading}
      className={`w-full ${className}`}
    >
      <ShoppingCart className="h-4 w-4 mr-2" />
      {loading ? 'Adding...' : 'Add to Cart'}
    </Button>
  );
}
