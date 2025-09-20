'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Product, ProductAPI } from '@/lib/api';
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
      <div className="container mx-auto py-8">
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
      <div className="container mx-auto py-8">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
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
    <div className="container mx-auto py-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">{product.name}</h1>
        </div>

        {/* Product Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Image */}
          <Card>
            <CardContent className="p-0">
              <div className="aspect-square bg-gray-100 flex items-center justify-center">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center text-gray-400">
                    <div className="text-6xl mb-4">📷</div>
                    <p>No Image Available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Product Information */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl">{product.name}</CardTitle>
                  <Badge variant="secondary" className="text-xl font-bold px-4 py-2">
                    ${product.price.toFixed(2)}
                  </Badge>
                </div>
                <CardDescription>Product Details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => setShowForm(true)}
                    className="flex items-center gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    Edit Product
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDelete}
                    className="flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Product
                  </Button>
                </div>
              </CardContent>
            </Card>
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
