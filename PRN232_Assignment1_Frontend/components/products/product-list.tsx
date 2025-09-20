'use client';

import { useState, useEffect } from 'react';
import { Product, ProductAPI, PaginatedResponse } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import { ProductForm } from './product-form';
import { ProductDetail } from './product-detail';

export function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);

  const fetchProducts = async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      const response = await ProductAPI.getProducts(page, 10);
      
      if (response.success) {
        const paginatedData = response.data as PaginatedResponse<Product>;
        setProducts(paginatedData.data);
        setTotalPages(paginatedData.totalPages);
        setCurrentPage(paginatedData.currentPage);
      } else {
        setError(response.message || 'Failed to fetch products');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
      const response = await ProductAPI.deleteProduct(id);
      if (response.success) {
        await fetchProducts(currentPage);
      } else {
        setError(response.message || 'Failed to delete product');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete product');
    }
  };

  const handleFormSubmit = async () => {
    setShowForm(false);
    setEditingProduct(null);
    await fetchProducts(currentPage);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleView = async (id: string) => {
    try {
      const response = await ProductAPI.getProductById(id);
      if (response.success) {
        setViewingProduct(response.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch product details');
    }
  };

  if (loading && products.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Products</h1>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full mb-4" />
                <Skeleton className="h-8 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Products</h1>
        <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Product
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {products.length === 0 && !loading ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground text-lg">No products found</p>
            <Button onClick={() => setShowForm(true)} className="mt-4">
              Add your first product
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Card key={product.id} className="overflow-hidden">
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
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleView(product.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(product)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(product.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2">
              <Button
                variant="outline"
                disabled={currentPage === 1}
                onClick={() => fetchProducts(currentPage - 1)}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                disabled={currentPage === totalPages}
                onClick={() => fetchProducts(currentPage + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}

      {/* Product Form Modal */}
      {showForm && (
        <ProductForm
          product={editingProduct}
          onClose={() => {
            setShowForm(false);
            setEditingProduct(null);
          }}
          onSubmit={handleFormSubmit}
        />
      )}

      {/* Product Detail Modal */}
      {viewingProduct && (
        <ProductDetail
          product={viewingProduct}
          onClose={() => setViewingProduct(null)}
        />
      )}
    </div>
  );
}
