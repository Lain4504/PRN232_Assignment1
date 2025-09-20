import { ProductGrid } from '@/components/products/product-grid';

export default function ProductsPage() {
  return (
    <div className="container mx-auto py-8">
      <ProductGrid showActions={true} />
    </div>
  );
}
