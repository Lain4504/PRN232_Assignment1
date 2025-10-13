'use client';

import { useState } from 'react';
import { Product } from '@/lib/api';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, Edit, Trash2, ShoppingCart, Plus, Minus } from 'lucide-react';
import Link from 'next/link';
import { DeleteProductDialog } from './delete-product-dialog';
import { AddToCartButton } from '@/components/cart/AddToCartButton';
import { useAuth } from '@/contexts/AuthContext';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { CartAPI } from '@/lib/api';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
  onEdit?: (product: Product) => void;
  onDelete?: (id: string) => void;
  showActions?: boolean;
  clickable?: boolean;
}

export function ProductCard({ product, onEdit, onDelete, showActions = true, clickable = true }: ProductCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [openQty, setOpenQty] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const { user } = useAuth();


  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async (productId: string) => {
    if (onDelete) {
      await onDelete(productId);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      toast.error('Please sign in to add items to cart');
      return;
    }
    try {
      setAdding(true);
      const response = await CartAPI.addToCart({ productId: product.id, quantity });
      if (response.success) {
        toast.success('Added to cart');
        setOpenQty(false);
      } else {
        toast.error(response.message || 'Failed to add to cart');
      }
    } catch (e) {
      toast.error('Failed to add to cart');
    } finally {
      setAdding(false);
    }
  };

  const formatVND = (value: number) => {
    try {
      // Use Vietnamese locale, then normalize to add trailing 'đ'
      const formatted = new Intl.NumberFormat('vi-VN').format(value);
      return `${formatted}đ`;
    } catch {
      return `${value.toLocaleString()}đ`;
    }
  };

  const cardContent = (
    <Card className="group overflow-hidden border-0 bg-transparent hover:shadow-md transition-all duration-300">
      {/* Product Image */}
      <div className="relative aspect-[2/3] bg-muted overflow-hidden rounded-lg">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            width={300}
            height={300}
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground/50">
            <div className="text-center">
              <div className="text-2xl sm:text-4xl mb-1 sm:mb-2">🧥</div>
              <p className="text-xs sm:text-sm">No image</p>
            </div>
          </div>
        )}
        {/* Top-right: Add to cart quick action */}
        <div className="absolute top-2 right-2 flex items-center gap-2">
          <AlertDialog open={openQty} onOpenChange={(o) => { setOpenQty(o); if (!o) setQuantity(1); }}>
            <AlertDialogTrigger asChild>
              <Button size="sm" variant="secondary" className="h-8 w-8 p-0 rounded-full shadow-md" onClick={(e) => e.stopPropagation()}>
                <ShoppingCart className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Thêm vào giỏ</AlertDialogTitle>
              </AlertDialogHeader>
              <div className="flex items-center justify-center gap-3 py-2">
                <Button variant="outline" size="icon" onClick={() => setQuantity((q) => Math.max(1, q - 1))} disabled={adding}>
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="min-w-10 text-center font-medium">{quantity}</span>
                <Button variant="outline" size="icon" onClick={() => setQuantity((q) => Math.min(99, q + 1))} disabled={adding}>
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

        {/* Top-right quick actions (admin) */}
        {showActions && (
          <div className="absolute top-2 right-2 sm:top-3 sm:right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="flex flex-col gap-1 sm:gap-2">
              <Link href={`/products/${product.id}`} onClick={(e) => e.stopPropagation()}>
                <Button size="sm" variant="secondary" className="h-6 w-6 sm:h-8 sm:w-8 p-0 shadow-lg">
                  <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </Link>
              {user && onEdit && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(product);
                  }}
                  className="h-6 w-6 sm:h-8 sm:w-8 p-0 shadow-lg"
                >
                  <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              )}
              {user && onDelete && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleDeleteClick}
                  className="h-6 w-6 sm:h-8 sm:w-8 p-0 shadow-lg"
                >
                  <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Product Info: title (link only on title) + price below with bottom divider */}
      <CardContent className="p-2 sm:p-3 lg:p-4">
        <div className="space-y-1.5 border-b pb-2">
          <Link href={`/products/${product.id}`} className="block group/title" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-medium leading-snug group-hover/title:text-primary transition-colors">
              <span className="block line-clamp-2 text-sm sm:text-base lg:text-lg">
                {product.name}
              </span>
            </h3>
          </Link>
          <span className="block text-base sm:text-lg lg:text-xl font-semibold text-primary">
            {formatVND(product.price)}
          </span>
        </div>
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
