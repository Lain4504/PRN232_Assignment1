import { ProductGrid } from '@/components/products/product-grid';

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Cửa hàng</h1>
          <p className="text-gray-600">Khám phá các sản phẩm tuyệt vời</p>
        </div>
        <ProductGrid showActions={false} showSearch={true} />
      </div>
    </div>
  );
}