import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../data/products';

function CartItem({ item }) {
  const { updateQuantity, removeItem } = useCart();

  return (
    <>
      {/* Mobile Layout */}
      <div className="md:hidden bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl p-3">
        <div className="flex gap-3">
          {/* Image */}
          <div className="w-20 h-20 rounded-lg overflow-hidden bg-[var(--color-bg-panel)] flex-shrink-0">
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm mb-1 line-clamp-1">{item.name}</h3>
            <p className="text-[var(--color-accent)] font-medium text-sm mb-2">
              {formatPrice(item.price)}
            </p>

            {/* Quantity Controls */}
            <div className="flex items-center gap-2 mb-2">
              <button
                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                className="w-8 h-8 rounded-lg bg-[var(--color-bg-panel)] active:bg-[var(--color-border)] flex items-center justify-center transition-colors text-sm"
              >
                -
              </button>
              <span className="w-8 text-center font-medium text-sm">{item.quantity}</span>
              <button
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                className="w-8 h-8 rounded-lg bg-[var(--color-bg-panel)] active:bg-[var(--color-border)] flex items-center justify-center transition-colors text-sm"
              >
                +
              </button>
            </div>

            {/* Subtotal & Remove */}
            <div className="flex items-center justify-between">
              <p className="font-bold text-sm">{formatPrice(item.price * item.quantity)}</p>
              <button
                onClick={() => removeItem(item.id)}
                className="text-xs text-red-400 active:text-red-300 transition-colors px-2 py-1"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:flex items-center gap-4 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl p-4">
        {/* Image */}
        <div className="w-20 h-20 rounded-lg overflow-hidden bg-[var(--color-bg-panel)] flex-shrink-0">
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold truncate">{item.name}</h3>
          <p className="text-[var(--color-accent)] font-medium">
            {formatPrice(item.price)}
          </p>
        </div>

        {/* Quantity Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => updateQuantity(item.id, item.quantity - 1)}
            className="w-8 h-8 rounded-lg bg-[var(--color-bg-panel)] hover:bg-[var(--color-border)] flex items-center justify-center transition-colors"
          >
            -
          </button>
          <span className="w-8 text-center font-medium">{item.quantity}</span>
          <button
            onClick={() => updateQuantity(item.id, item.quantity + 1)}
            className="w-8 h-8 rounded-lg bg-[var(--color-bg-panel)] hover:bg-[var(--color-border)] flex items-center justify-center transition-colors"
          >
            +
          </button>
        </div>

        {/* Subtotal */}
        <div className="text-right min-w-[100px]">
          <p className="font-bold">{formatPrice(item.price * item.quantity)}</p>
          <button
            onClick={() => removeItem(item.id)}
            className="text-xs text-red-400 hover:text-red-300 transition-colors"
          >
            Remove
          </button>
        </div>
      </div>
    </>
  );
}

export default function CartPage() {
  const { items, totalAmount, totalItems } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-4 md:pt-24 pb-24 md:pb-[450px] px-3 md:px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="text-6xl md:text-8xl mb-4 md:mb-6">🛒</div>
          <h1 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4">Your cart is empty</h1>
          <p className="text-sm md:text-base text-[var(--color-text-muted)] mb-6 md:mb-8">
            Add some awesome developer gear to get started!
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white px-6 py-3 rounded-lg transition-colors text-sm md:text-base"
          >
            <span>←</span>
            <span>Browse Products</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-4 md:pt-24 pb-24 md:pb-[450px] px-3 md:px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold">Shopping Cart</h1>
          <span className="text-xs md:text-base text-[var(--color-text-muted)]">
            {totalItems} {totalItems === 1 ? 'item' : 'items'}
          </span>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-3 md:space-y-4">
            {items.map((item) => (
              <CartItem key={item.id} item={item} />
            ))}
          </div>

          {/* Order Summary - Mobile Sticky Bottom */}
          <div className="lg:col-span-1">
            <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl p-4 md:p-6 sticky bottom-24 md:top-24">
              <h2 className="text-lg md:text-xl font-bold mb-4">Order Summary</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm md:text-base text-[var(--color-text-muted)]">
                  <span>Subtotal</span>
                  <span>{formatPrice(totalAmount)}</span>
                </div>
                <div className="flex justify-between text-sm md:text-base text-[var(--color-text-muted)]">
                  <span>Shipping</span>
                  <span className="text-[var(--color-accent)]">Free</span>
                </div>
                <div className="border-t border-[var(--color-border)] pt-3 flex justify-between font-bold text-base md:text-lg">
                  <span>Total</span>
                  <span className="text-[var(--color-accent)]">{formatPrice(totalAmount)}</span>
                </div>
              </div>

              <Link
                to="/checkout"
                className="w-full flex items-center justify-center gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white py-3 md:py-3 rounded-lg transition-colors font-medium text-sm md:text-base"
              >
                <span>Proceed to Checkout</span>
                <span>→</span>
              </Link>

              <Link
                to="/"
                className="w-full flex items-center justify-center gap-2 text-[var(--color-text-muted)] hover:text-white py-3 transition-colors text-xs md:text-sm mt-2"
              >
                <span>←</span>
                <span>Continue Shopping</span>
              </Link>

              {/* What happens next - Mobile Hidden */}
              <div className="hidden md:block mt-6 pt-6 border-t border-[var(--color-border)]">
                <p className="text-xs text-[var(--color-text-muted)] mb-2">
                  🖥️ What happens on checkout:
                </p>
                <ul className="text-xs text-[var(--color-text-muted)] space-y-1">
                  <li>• POST request to <code className="text-[var(--color-primary)]">/api/v1/payments/init</code></li>
                  <li>• Backend creates order in PostgreSQL</li>
                  <li>• Backend calls Razorpay API</li>
                  <li>• Returns gatewayOrderId for checkout</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
