'use client';

import { useState } from 'react';
import { Product } from '@/lib/api';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { DeleteProductDialog } from './delete-product-dialog';

interface ProductCardProps {
  product: Product;
  onEdit?: (product: Product) => void;
  onDelete?: (id: string) => void;
  showActions?: boolean;
  clickable?: boolean;
}

export function ProductCard({ product, onEdit, onDelete, showActions = true, clickable = true }: ProductCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async (productId: string) => {
    if (onDelete) {
      await onDelete(productId);
    }
  };

  const cardContent = (
    <Card className="group overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white">
      {/* Product Image */}
      <div className="relative aspect-[3/4] bg-gray-50 overflow-hidden">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            width={300}
            height={300}
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <div className="text-center">
              <div className="text-4xl mb-2">📚</div>
              <p className="text-sm">Không có hình ảnh</p>
            </div>
          </div>
        )}
        
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300" />
        
        {/* Quick actions overlay */}
        {showActions && (
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="flex flex-col gap-2">
              <Link href={`/products/${product.id}`} onClick={(e) => e.stopPropagation()}>
                <Button size="sm" variant="secondary" className="h-8 w-8 p-0 shadow-lg">
                  <Eye className="h-4 w-4" />
                </Button>
              </Link>
              {onEdit && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(product);
                  }}
                  className="h-8 w-8 p-0 shadow-lg"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )}
              {onDelete && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleDeleteClick}
                  className="h-8 w-8 p-0 shadow-lg"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Product Info */}
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Product Name */}
          <h3 className="font-medium text-gray-900 group-hover:text-primary transition-colors leading-tight h-12 overflow-hidden">
            <span className="block line-clamp-2">
              {product.name}
            </span>
          </h3>
          
          {/* Price */}
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold text-primary">
              {new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(product.price)}
            </span>
          </div>
          
          {/* View Details Button */}
          <Button 
            className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-2.5 transition-all duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <Eye className="h-4 w-4 mr-2" />
            Xem chi tiết
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  if (clickable && !showActions) {
    return (
      <>
        <Link href={`/products/${product.id}`} className="block">
          {cardContent}
        </Link>
        <DeleteProductDialog
          product={product}
          isOpen={showDeleteDialog}
          onClose={() => setShowDeleteDialog(false)}
          onConfirm={handleDeleteConfirm}
        />
      </>
    );
  }

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
