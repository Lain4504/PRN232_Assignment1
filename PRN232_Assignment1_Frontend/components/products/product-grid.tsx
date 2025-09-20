'use client';

import { useState, useEffect } from 'react';
import { Product, ProductAPI, PaginatedResponse } from '@/lib/api';
import { ProductCard } from './product-card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus } from 'lucide-react';
import { ProductForm } from './product-form';

interface ProductGridProps {
  showActions?: boolean;
  onEdit?: (product: Product) => void;
  onDelete?: (id: string) => void;
}

export function ProductGrid({ showActions = false, onEdit, onDelete }: ProductGridProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const fetchProducts = async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      const response = await ProductAPI.getProducts(page, 12);
      
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

  if (loading && products.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Products</h1>
          {showActions && (
            <Skeleton className="h-10 w-32" />
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-8 w-20" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Products</h1>
        {showActions && (
          <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Product
          </Button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {products.length === 0 && !loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">No products found</p>
          {showActions && (
            <Button onClick={() => setShowForm(true)} className="mt-4">
              Add your first product
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                showActions={showActions}
                onEdit={onEdit || handleEdit}
                onDelete={onDelete || handleDelete}
              />
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
    </div>
  );
}
