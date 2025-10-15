'use client';

import { useState } from 'react';
import { Product } from '@/lib/api';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Plus, Minus } from 'lucide-react';
import Link from 'next/link';
import { DeleteProductDialog } from './delete-product-dialog';
import { useAuth } from '@/contexts/AuthContext';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { CartAPI } from '@/lib/api';
import { toast } from 'sonner';
import { formatCurrencyVND } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  onEdit?: (product: Product) => void;
  onDelete?: (id: string) => void;
  showActions?: boolean;
  clickable?: boolean;
}

export function ProductCard({ product, onDelete }: ProductCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [openQty, setOpenQty] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const { user } = useAuth();

  // Delete is driven by the external dialog actions; no inline icon here

  const handleDeleteConfirm = async (productId: string) => {
    if (onDelete) {
      await onDelete(productId);
    }
  };

  const handleAddToCart = async () => {
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

  

  const cardContent = (
    <Card className="group overflow-hidden border-0 bg-transparent transition-all duration-300 cursor-pointer rounded-none border-none shadow-none">
      {/* Product Image */}
      <div className="relative aspect-[2/3] bg-[#f5f5f0] overflow-hidden rounded-sm">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            width={400}
            height={600}
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground/50">
            <div className="text-center">
              <div className="text-4xl mb-2">🧥</div>
              <p className="text-sm">No image</p>
            </div>
          </div>
        )}

        {/* Top-right: Add to cart button */}
        <div className="absolute top-2 right-2">
          <AlertDialog open={openQty} onOpenChange={(o) => { setOpenQty(o); if (!o) setQuantity(1); }}>
            <AlertDialogTrigger asChild>
              <button
                className="bg-white h-8 w-8 rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors"
              >
                <ShoppingCart className="h-4 w-4 text-gray-600" />
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent onClick={(e) => e.stopPropagation()}>
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
      </div>

      {/* Product Info */}
      <CardContent className="p-2 sm:p-3">
        <Link href={`/products/${product.id}`} className="block" onClick={(e) => e.stopPropagation()}>
          <h3 className="font-normal text-[13px] sm:text-base leading-relaxed line-clamp-2 mb-1 text-gray-800 hover:text-gray-600 transition-colors">
            {product.name}
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-sm sm:text-base font-semibold text-gray-900">
              {formatCurrencyVND(product.price)}
            </span>
          </div>
        </Link>
      </CardContent>
    </Card>
  );

  return (
    <>
      {cardContent}
      <DeleteProductDialog
        product={product}
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
}
