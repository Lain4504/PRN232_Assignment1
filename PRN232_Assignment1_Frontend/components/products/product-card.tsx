'use client';

import { Product } from '@/lib/api';
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
}

export function ProductCard({ product, onEdit, onDelete, showActions = true }: ProductCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-video bg-gray-100 flex items-center justify-center">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-gray-400">No Image</div>
        )}
      </div>
      <CardHeader>
        <CardTitle className="line-clamp-1">{product.name}</CardTitle>
        <CardDescription className="line-clamp-2">
          {product.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="text-lg font-semibold">
            ${product.price.toFixed(2)}
          </Badge>
          {showActions && (
            <div className="flex gap-2">
              <Link href={`/products/${product.id}`}>
                <Button size="sm" variant="outline">
                  <Eye className="h-4 w-4" />
                </Button>
              </Link>
              {onEdit && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onEdit(product)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )}
              {onDelete && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => onDelete(product.id)}
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
}
