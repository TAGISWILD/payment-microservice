import { products } from '../data/products';
import ProductCard from '../components/ProductCard';

export default function ProductsPage() {
  return (
    <div className="min-h-screen pt-24 pb-[450px] px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            <span className="text-[var(--color-primary)]">Dev</span>Store
          </h1>
          <p className="text-[var(--color-text-muted)] max-w-xl mx-auto">
            Premium gear for developers. Every purchase demonstrates our payment microservice in action.
            Watch the <span className="text-[var(--color-accent)]">Backend Activity Panel</span> below!
          </p>
        </div>

        {/* Info Banner */}
        <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl p-4 mb-8 flex items-center gap-4">
          <span className="text-3xl">💡</span>
          <div>
            <p className="font-medium">This is a demo store</p>
            <p className="text-sm text-[var(--color-text-muted)]">
              Products are fictional. Payments use Razorpay <strong>Test Mode</strong>. 
              No real money is charged.
            </p>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Backend Flow Info */}
        <div className="mt-12 bg-[var(--color-bg-panel)] border border-[var(--color-border)] rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span>🔄</span>
            Payment Flow Overview
          </h2>
          <div className="grid md:grid-cols-4 gap-4 text-sm">
            <div className="bg-[var(--color-bg-card)] p-4 rounded-lg">
              <div className="text-2xl mb-2">1️⃣</div>
              <div className="font-medium mb-1">Add to Cart</div>
              <div className="text-[var(--color-text-muted)] text-xs">
                Select products, client-side state
              </div>
            </div>
            <div className="bg-[var(--color-bg-card)] p-4 rounded-lg">
              <div className="text-2xl mb-2">2️⃣</div>
              <div className="font-medium mb-1">POST /init</div>
              <div className="text-[var(--color-text-muted)] text-xs">
                Backend creates order in DB + Razorpay
              </div>
            </div>
            <div className="bg-[var(--color-bg-card)] p-4 rounded-lg">
              <div className="text-2xl mb-2">3️⃣</div>
              <div className="font-medium mb-1">Razorpay Checkout</div>
              <div className="text-[var(--color-text-muted)] text-xs">
                User pays via Razorpay modal
              </div>
            </div>
            <div className="bg-[var(--color-bg-card)] p-4 rounded-lg">
              <div className="text-2xl mb-2">4️⃣</div>
              <div className="font-medium mb-1">POST /verify</div>
              <div className="text-[var(--color-text-muted)] text-xs">
                Backend verifies signature, marks paid
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


