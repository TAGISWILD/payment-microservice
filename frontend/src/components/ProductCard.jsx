import { useCart } from '../context/CartContext';
import { formatPrice } from '../data/products';

export default function ProductCard({ product }) {
  const { addItem, items } = useCart();
  const cartItem = items.find((item) => item.id === product.id);

  return (
    <>
      {/* Mobile Layout - Horizontal Card */}
      <div className="md:hidden bg-[var(--color-bg-card)] rounded-xl overflow-hidden border border-[var(--color-border)] active:scale-[0.98] transition-transform">
        <div className="flex gap-3 p-3">
          {/* Image - Smaller on mobile */}
          <div className="w-24 h-24 rounded-lg overflow-hidden bg-[var(--color-bg-panel)] flex-shrink-0">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            <div className="relative -mt-6 ml-1 text-2xl">
              {product.emoji}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 flex flex-col justify-between">
            <div>
              <div className="text-[10px] text-[var(--color-text-muted)] mb-1 uppercase tracking-wide">
                {product.category}
              </div>
              <h3 className="font-semibold text-sm mb-1 line-clamp-1">
                {product.name}
              </h3>
              <p className="text-[var(--color-text-muted)] text-xs mb-2 line-clamp-2">
                {product.description}
              </p>
            </div>

            {/* Price & Button */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-base font-bold text-[var(--color-accent)]">
                {formatPrice(product.price)}
              </span>
              <button
                onClick={() => addItem(product)}
                className="flex items-center gap-1.5 bg-[var(--color-primary)] text-white px-3 py-2 rounded-lg text-xs font-medium active:bg-[var(--color-primary-dark)] min-h-[36px]"
              >
                {cartItem ? (
                  <>
                    <span>+</span>
                    <span>({cartItem.quantity})</span>
                  </>
                ) : (
                  <>
                    <span>🛒</span>
                    <span>Add</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Layout - Vertical Card */}
      <div className="hidden md:block group bg-[var(--color-bg-card)] rounded-xl overflow-hidden border border-[var(--color-border)] hover:border-[var(--color-primary)]/50 transition-all duration-300 hover:shadow-lg hover:shadow-[var(--color-primary)]/10">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-[var(--color-bg-panel)]">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-3 left-3 bg-[var(--color-bg-panel)]/80 backdrop-blur-sm px-2 py-1 rounded-lg text-xs">
            {product.category}
          </div>
          <div className="absolute top-3 right-3 text-3xl">
            {product.emoji}
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-lg mb-1 group-hover:text-[var(--color-primary)] transition-colors">
            {product.name}
          </h3>
          <p className="text-[var(--color-text-muted)] text-sm mb-3 line-clamp-2">
            {product.description}
          </p>

          {/* Price & Add to Cart */}
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold text-[var(--color-accent)]">
              {formatPrice(product.price)}
            </span>
            <button
              onClick={() => addItem(product)}
              className="flex items-center gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
            >
              {cartItem ? (
                <>
                  <span>+</span>
                  <span>Add More ({cartItem.quantity})</span>
                </>
              ) : (
                <>
                  <span>🛒</span>
                  <span>Add to Cart</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
