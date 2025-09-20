import { ProductGrid } from '@/components/products/product-grid';

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <ProductGrid showActions={false} />
    </div>
  );
}