'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Product, ProductAPI } from '@/lib/api';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { ProductForm } from '@/components/products/product-form';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const productId = params.id as string;

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

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
      const response = await ProductAPI.deleteProduct(productId);
      if (response.success) {
        router.push('/');
      } else {
        setError(response.message || 'Failed to delete product');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete product');
    }
  };

  const handleFormSubmit = async () => {
    setShowForm(false);
    // Refresh the product data
    const response = await ProductAPI.getProductById(productId);
    if (response.success) {
      setProduct(response.data);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-8">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-8 w-48" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Skeleton className="h-96 w-full" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-10 w-24" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto py-8">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-destructive mb-4">Error</h1>
          <p className="text-muted-foreground mb-4">{error || 'Product not found'}</p>
          <Button onClick={() => router.push('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="space-y-4">
            <Button variant="outline" onClick={() => router.back()} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Quay lại
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">{product.name}</h1>
              <p className="text-gray-600 mt-1">Chi tiết sản phẩm</p>
            </div>
          </div>

          {/* Product Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Product Image */}
            <div className="space-y-4">
              <Card className="overflow-hidden shadow-lg">
                <CardContent className="p-0">
                  <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    {product.image ? (
                      <Image
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        width={400}
                        height={400}
                        unoptimized
                      />
                    ) : (
                      <div className="text-center text-gray-400">
                        <div className="text-6xl mb-4">📚</div>
                        <p className="text-lg">Không có hình ảnh</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Product Information */}
            <div className="space-y-6">
              <Card className="shadow-lg">
                <CardHeader className="pb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <CardTitle className="text-2xl lg:text-3xl text-gray-900">{product.name}</CardTitle>
                      <CardDescription className="text-gray-600 mt-1">Thông tin chi tiết</CardDescription>
                    </div>
                    <Badge variant="secondary" className="text-xl font-bold px-6 py-3">
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(product.price)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-gray-900">Mô tả sản phẩm</h3>
                    <p className="text-gray-700 leading-relaxed text-base">{product.description}</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-gray-900">Mã sản phẩm</h3>
                    <p className="text-sm text-gray-500 font-mono bg-gray-100 px-4 py-3 rounded-none border">
                      {product.id}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
                    <Button
                      variant="outline"
                      onClick={() => setShowForm(true)}
                      className="flex items-center justify-center gap-2 hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                      Chỉnh sửa
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleDelete}
                      className="flex items-center justify-center gap-2 hover:bg-destructive/90 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                      Xóa sản phẩm
                    </Button>
                  </div>
                </CardContent>
              </Card>

            </div>
          </div>
        </div>
      </div>

      {/* Product Form Modal */}
      {showForm && (
        <ProductForm
          product={product}
          onClose={() => setShowForm(false)}
          onSubmit={handleFormSubmit}
        />
      )}
    </div>
  );
}
