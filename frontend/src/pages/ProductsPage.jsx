import { products } from '../data/products';
import ProductCard from '../components/ProductCard';

export default function ProductsPage() {
  return (
    <div className="min-h-screen pt-4 md:pt-24 pb-24 md:pb-[450px] px-3 md:px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header - Mobile Optimized */}
        <div className="text-center mb-6 md:mb-12">
          <h1 className="text-2xl md:text-4xl font-bold mb-2 md:mb-4">
            <span className="text-[var(--color-primary)]">Dev</span>Store
          </h1>
          <p className="text-xs md:text-base text-[var(--color-text-muted)] max-w-xl mx-auto mb-3 md:mb-4 px-2">
            Premium gear for developers. Every purchase demonstrates our payment microservice in action.
            <span className="hidden md:inline"> Watch the <span className="text-[var(--color-accent)]">Backend Activity Panel</span> below!</span>
          </p>
          <div className="bg-[var(--color-bg-panel)] border border-[var(--color-border)] rounded-lg px-3 py-1.5 md:px-4 md:py-2 inline-block">
            <p className="text-[10px] md:text-sm text-[var(--color-text-muted)]">
              This end is designed to test <span className="text-[var(--color-primary)] font-semibold">Nexus</span>, a payment microservice by <span className="text-[var(--color-accent)]">ethiccode technologies</span>
            </p>
          </div>
        </div>

        {/* Info Banner - Mobile Compact */}
        <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl p-3 md:p-4 mb-6 md:mb-8 flex items-start gap-3">
          <span className="text-2xl md:text-3xl flex-shrink-0">💡</span>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm md:text-base mb-1">This is a demo store</p>
            <p className="text-xs md:text-sm text-[var(--color-text-muted)]">
              Products are fictional. Payments use Razorpay <strong>Test Mode</strong>. 
              No real money is charged.
            </p>
          </div>
        </div>

        {/* Products Grid - Single Column on Mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Backend Flow Info - Mobile Simplified */}
        <div className="mt-8 md:mt-12 bg-[var(--color-bg-panel)] border border-[var(--color-border)] rounded-xl p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-bold mb-3 md:mb-4 flex items-center gap-2">
            <span>🔄</span>
            <span className="text-sm md:text-xl">Nexus Payment Flow</span>
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 text-xs md:text-sm">
            <div className="bg-[var(--color-bg-card)] p-3 md:p-4 rounded-lg border border-[var(--color-border)]">
              <div className="text-xl md:text-2xl mb-1 md:mb-2">1️⃣</div>
              <div className="font-medium mb-1 text-xs md:text-sm">Add to Cart</div>
              <div className="text-[var(--color-text-muted)] text-[10px] md:text-xs">
                Select products
              </div>
            </div>
            <div className="bg-[var(--color-bg-card)] p-3 md:p-4 rounded-lg border border-[var(--color-border)]">
              <div className="text-xl md:text-2xl mb-1 md:mb-2">2️⃣</div>
              <div className="font-medium mb-1 text-xs md:text-sm">POST /init</div>
              <div className="text-[var(--color-text-muted)] text-[10px] md:text-xs">
                Nexus creates order
              </div>
            </div>
            <div className="bg-[var(--color-bg-card)] p-3 md:p-4 rounded-lg border border-[var(--color-border)]">
              <div className="text-xl md:text-2xl mb-1 md:mb-2">3️⃣</div>
              <div className="font-medium mb-1 text-xs md:text-sm">Razorpay</div>
              <div className="text-[var(--color-text-muted)] text-[10px] md:text-xs">
                User pays
              </div>
            </div>
            <div className="bg-[var(--color-bg-card)] p-3 md:p-4 rounded-lg border border-[var(--color-border)]">
              <div className="text-xl md:text-2xl mb-1 md:mb-2">4️⃣</div>
              <div className="font-medium mb-1 text-xs md:text-sm">POST /verify</div>
              <div className="text-[var(--color-text-muted)] text-[10px] md:text-xs">
                Nexus verifies
              </div>
            </div>
          </div>
        </div>

        {/* Nexus Info Footer - Mobile Compact */}
        <div className="mt-8 md:mt-12 bg-gradient-to-r from-[var(--color-primary)]/10 to-[var(--color-accent)]/10 border border-[var(--color-border)] rounded-xl p-4 md:p-6">
          <div className="text-center">
            <h3 className="text-base md:text-lg font-bold mb-2 flex items-center justify-center gap-2">
              <span>⚡</span>
              Powered by Nexus
            </h3>
            <p className="text-xs md:text-sm text-[var(--color-text-muted)] mb-3">
              A production-ready payment microservice built with Spring Boot, React, and Razorpay
            </p>
            <div className="flex flex-wrap justify-center gap-2 md:gap-4 text-[10px] md:text-xs text-[var(--color-text-muted)]">
              <div className="flex items-center gap-1">
                <span>🔒</span>
                <span>Secure</span>
              </div>
              <div className="flex items-center gap-1">
                <span>📊</span>
                <span>Real-time</span>
              </div>
              <div className="flex items-center gap-1">
                <span>🔄</span>
                <span>Idempotent</span>
              </div>
              <div className="flex items-center gap-1">
                <span>💾</span>
                <span>PostgreSQL</span>
              </div>
            </div>
            <p className="text-[10px] md:text-xs text-[var(--color-text-muted)] mt-3 md:mt-4">
              Developed by <span className="text-[var(--color-accent)] font-semibold">ethiccode technologies</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
