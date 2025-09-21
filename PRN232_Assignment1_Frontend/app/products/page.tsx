'use client';

import { useState, useEffect } from 'react';
import { Product, ProductAPI, PaginatedResponse, SearchParams } from '@/lib/api';
import { ProductTable } from '@/components/admin/product-table';
import { ProductSearch } from '@/components/products/product-search';
import { DeleteProductDialog } from '@/components/products/delete-product-dialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { ProductForm } from '@/components/products/product-form';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [searchParams, setSearchParams] = useState<SearchParams>({});
  const [isSearching, setIsSearching] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchProducts = async (page: number = 1, searchParams?: SearchParams) => {
    try {
      setLoading(true);
      setError(null);
      
      let response;
      if (searchParams && Object.keys(searchParams).length > 0) {
        // Use search API if search parameters are provided
        response = await ProductAPI.searchProducts({ ...searchParams, page, pageSize: 10 });
        setIsSearching(true);
      } else {
        // Use regular get products API
        response = await ProductAPI.getProducts(page, 10);
        setIsSearching(false);
      }
      
      if (response.success) {
        const paginatedData = response.data as PaginatedResponse<Product>;
        setProducts(paginatedData.data);
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
    const product = products.find(p => p.id === id);
    if (product) {
      setProductToDelete(product);
      setShowDeleteDialog(true);
    }
  };

  const handleDeleteConfirm = async (productId: string) => {
    try {
      const response = await ProductAPI.deleteProduct(productId);
      if (response.success) {
        await fetchProducts(currentPage, isSearching ? searchParams : undefined);
        setShowDeleteDialog(false);
        setProductToDelete(null);
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
    await fetchProducts(currentPage, isSearching ? searchParams : undefined);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleSearch = (params: SearchParams) => {
    setSearchParams(params);
    setCurrentPage(1);
    fetchProducts(1, params);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quản lý sản phẩm</h1>
            <p className="text-gray-600 mt-1">Quản lý danh sách sản phẩm trong hệ thống</p>
          </div>
          <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Thêm sản phẩm
          </Button>
        </div>

        {/* Search Component */}
        <ProductSearch onSearch={handleSearch} loading={loading} showAdvanced={true} />

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-none">
            {error}
          </div>
        )}

        <ProductTable 
          data={products} 
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

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

        {/* Delete Confirmation Dialog */}
        <DeleteProductDialog
          product={productToDelete}
          isOpen={showDeleteDialog}
          onClose={() => {
            setShowDeleteDialog(false);
            setProductToDelete(null);
          }}
          onConfirm={handleDeleteConfirm}
        />
      </div>
    </div>
  );
}
