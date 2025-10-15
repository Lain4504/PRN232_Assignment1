'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ProductAPI, Product } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { formatCurrencyVND } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { CartAPI } from '@/lib/api';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { ShoppingCart, Plus, Minus } from 'lucide-react';

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.id as string;
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const [openQty, setOpenQty] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await ProductAPI.getProductById(productId);
        
        if (response.success) {
          setProduct(response.data);
        } else {
          setError(response.message || 'Product not found');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const handleAddToCart = async () => {
    if (!product) return;
    if (!user) {
      toast.error('Vui lòng đăng nhập để thêm vào giỏ hàng');
      return;
    }
    try {
      setAdding(true);
      const response = await CartAPI.addToCart({ productId: product.id, quantity });
      if (response.success) {
        toast.success('Đã thêm vào giỏ hàng');
        setOpenQty(false);
        setQuantity(1);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('cart:updated'));
        }
      } else {
        toast.error(response.message || 'Không thể thêm vào giỏ hàng');
      }
    } catch {
      toast.error('Không thể thêm vào giỏ hàng');
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
      <div className="space-y-4 sm:space-y-6">
          <div className="flex items-center space-x-4">
            <Link href="/products">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Products
              </Button>
            </Link>
          </div>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Loading product...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="space-y-4 sm:space-y-6">
          <div className="flex items-center space-x-4">
            <Link href="/products">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Products
              </Button>
            </Link>
          </div>
          <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-md">
            {error || 'Product not found'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
      <div className="space-y-4 sm:space-y-6">
        <div className="flex items-center space-x-4">
          <Link href="/products">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Products
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Image */}
          <div className="space-y-4">
            <Card>
              <CardContent className="p-0">
                <div className="relative aspect-square bg-muted overflow-hidden rounded-lg">
                  {product.image ? (
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <div className="text-center">
                        <div className="text-6xl mb-4">📚</div>
                        <p className="text-lg">No image available</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
              <p className="text-lg text-muted-foreground">{product.description}</p>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-3xl font-bold text-primary">
                {formatCurrencyVND(product.price)}
              </span>
            </div>

            <div className="space-y-4">
              <AlertDialog open={openQty} onOpenChange={(o) => { setOpenQty(o); if (!o) setQuantity(1); }}>
                <AlertDialogTrigger asChild>
                  <Button className="w-full">
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Thêm vào giỏ hàng
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Chọn số lượng</AlertDialogTitle>
                  </AlertDialogHeader>
                  <div className="flex items-center justify-center gap-3 py-2">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))} 
                      disabled={adding}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="min-w-[60px] text-center font-medium text-lg">{quantity}</span>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={() => setQuantity((q) => Math.min(99, q + 1))} 
                      disabled={adding}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={adding}>Hủy</AlertDialogCancel>
                    <AlertDialogAction onClick={handleAddToCart} disabled={adding}>
                      {adding ? 'Đang thêm...' : 'Thêm vào giỏ'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-medium mb-4">Product Details</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex justify-between">
                  <span>Product ID:</span>
                  <span className="font-mono">{product.id}</span>
                </div>
                <div className="flex justify-between">
                  <span>Price:</span>
                  <span>{formatCurrencyVND(product.price)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}