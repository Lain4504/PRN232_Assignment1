'use client';

import { Product } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Edit, Trash2 } from 'lucide-react';

interface ProductDetailProps {
  product: Product;
  onClose: () => void;
  onEdit?: (product: Product) => void;
  onDelete?: (id: string) => void;
}

export function ProductDetail({ product, onClose, onEdit, onDelete }: ProductDetailProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl">{product.name}</CardTitle>
            <CardDescription>Product Details</CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Product Image */}
          <div className="w-full h-64 bg-gray-100 rounded-lg overflow-hidden">
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <div className="text-4xl mb-2">📷</div>
                  <p>No Image Available</p>
                </div>
              </div>
            )}
          </div>

          {/* Product Information */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Price</h3>
              <Badge variant="secondary" className="text-xl font-bold px-4 py-2">
                ${product.price.toFixed(2)}
              </Badge>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p className="text-gray-700 leading-relaxed">{product.description}</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Product ID</h3>
              <p className="text-sm text-gray-500 font-mono bg-gray-100 px-3 py-2 rounded">
                {product.id}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          {(onEdit || onDelete) && (
            <div className="flex justify-end gap-3 pt-4 border-t">
              {onEdit && (
                <Button
                  variant="outline"
                  onClick={() => onEdit(product)}
                  className="flex items-center gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Edit Product
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="destructive"
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this product?')) {
                      onDelete(product.id);
                      onClose();
                    }
                  }}
                  className="flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Product
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
