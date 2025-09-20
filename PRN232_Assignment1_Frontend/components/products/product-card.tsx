'use client';

import { Product } from '@/lib/api';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';

interface ProductCardProps {
  product: Product;
  onEdit?: (product: Product) => void;
  onDelete?: (id: string) => void;
  showActions?: boolean;
  clickable?: boolean;
}

export function ProductCard({ product, onEdit, onDelete, showActions = true, clickable = true }: ProductCardProps) {
  const cardContent = (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-200 hover:scale-[1.02] cursor-pointer group">
      <div className="aspect-video bg-gray-100 flex items-center justify-center overflow-hidden">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            width={320}
            height={180}
            unoptimized
          />
        ) : (
          <div className="text-gray-400">No Image</div>
        )}
      </div>
      <CardHeader className="pb-3">
        <CardTitle className="line-clamp-1 text-lg group-hover:text-primary transition-colors">
          {product.name}
        </CardTitle>
        <CardDescription className="line-clamp-2 text-sm">
          {product.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="text-lg font-semibold bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
            {new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
            }).format(product.price)}
          </Badge>
          {showActions && (
            <div className="flex gap-2">
              <Link href={`/products/${product.id}`} onClick={(e) => e.stopPropagation()}>
                <Button size="sm" variant="outline" className="hover:bg-primary hover:text-primary-foreground transition-colors">
                  <Eye className="h-4 w-4" />
                </Button>
              </Link>
              {onEdit && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(product);
                  }}
                  className="hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )}
              {onDelete && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(product.id);
                  }}
                  className="hover:bg-destructive/90 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (clickable && !showActions) {
    return (
      <Link href={`/products/${product.id}`} className="block">
        {cardContent}
      </Link>
    );
  }

  return cardContent;
}
