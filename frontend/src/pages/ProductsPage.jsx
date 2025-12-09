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
          <p className="text-[var(--color-text-muted)] max-w-xl mx-auto mb-4">
            Premium gear for developers. Every purchase demonstrates our payment microservice in action.
            Watch the <span className="text-[var(--color-accent)]">Backend Activity Panel</span> below!
          </p>
          <div className="bg-[var(--color-bg-panel)] border border-[var(--color-border)] rounded-lg px-4 py-2 inline-block">
            <p className="text-sm text-[var(--color-text-muted)]">
              This end is designed to test <span className="text-[var(--color-primary)] font-semibold">Nexus</span>, a payment microservice by <span className="text-[var(--color-accent)]">ethiccode technologies</span>
            </p>
          </div>
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
            Nexus Payment Flow Overview
          </h2>
          <div className="grid md:grid-cols-4 gap-4 text-sm">
            <div className="bg-[var(--color-bg-card)] p-4 rounded-lg border border-[var(--color-border)]">
              <div className="text-2xl mb-2">1️⃣</div>
              <div className="font-medium mb-1">Add to Cart</div>
              <div className="text-[var(--color-text-muted)] text-xs">
                Select products, client-side state management
              </div>
            </div>
            <div className="bg-[var(--color-bg-card)] p-4 rounded-lg border border-[var(--color-border)]">
              <div className="text-2xl mb-2">2️⃣</div>
              <div className="font-medium mb-1">POST /api/v1/payments/init</div>
              <div className="text-[var(--color-text-muted)] text-xs">
                Nexus creates order in PostgreSQL, generates UUID, calls Razorpay API, stores gateway_order_id
              </div>
            </div>
            <div className="bg-[var(--color-bg-card)] p-4 rounded-lg border border-[var(--color-border)]">
              <div className="text-2xl mb-2">3️⃣</div>
              <div className="font-medium mb-1">Razorpay Checkout</div>
              <div className="text-[var(--color-text-muted)] text-xs">
                User completes payment via Razorpay secure payment modal
              </div>
            </div>
            <div className="bg-[var(--color-bg-card)] p-4 rounded-lg border border-[var(--color-border)]">
              <div className="text-2xl mb-2">4️⃣</div>
              <div className="font-medium mb-1">POST /api/v1/payments/verify</div>
              <div className="text-[var(--color-text-muted)] text-xs">
                Nexus verifies HMAC-SHA256 signature, updates order status to COMPLETED, persists payment record
              </div>
            </div>
          </div>
        </div>

        {/* Nexus Info Footer */}
        <div className="mt-12 bg-gradient-to-r from-[var(--color-primary)]/10 to-[var(--color-accent)]/10 border border-[var(--color-border)] rounded-xl p-6">
          <div className="text-center">
            <h3 className="text-lg font-bold mb-2 flex items-center justify-center gap-2">
              <span>⚡</span>
              Powered by Nexus
            </h3>
            <p className="text-sm text-[var(--color-text-muted)] mb-3">
              A production-ready payment microservice built with Spring Boot, React, and Razorpay integration
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-xs text-[var(--color-text-muted)]">
              <div className="flex items-center gap-1">
                <span>🔒</span>
                <span>Secure Payment Processing</span>
              </div>
              <div className="flex items-center gap-1">
                <span>📊</span>
                <span>Real-time Activity Tracking</span>
              </div>
              <div className="flex items-center gap-1">
                <span>🔄</span>
                <span>Idempotent Operations</span>
              </div>
              <div className="flex items-center gap-1">
                <span>💾</span>
                <span>PostgreSQL Database</span>
              </div>
            </div>
            <p className="text-xs text-[var(--color-text-muted)] mt-4">
              Developed by <span className="text-[var(--color-accent)] font-semibold">ethiccode technologies</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


