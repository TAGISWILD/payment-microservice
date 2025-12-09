import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { totalItems } = useCart();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[var(--color-bg-panel)]/90 backdrop-blur-md border-b border-[var(--color-border)]">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <span className="text-2xl">🛒</span>
          <span className="font-bold text-lg">DevStore</span>
          <span className="text-xs bg-[var(--color-primary)] px-2 py-0.5 rounded-full">
            Demo
          </span>
        </Link>

        {/* Nav Links */}
        <div className="flex items-center gap-6">
          <Link 
            to="/" 
            className="text-[var(--color-text-muted)] hover:text-white transition-colors text-sm"
          >
            Products
          </Link>
          
          {/* Cart */}
          <Link 
            to="/cart" 
            className="flex items-center gap-2 bg-[var(--color-bg-card)] hover:bg-[var(--color-border)] px-4 py-2 rounded-lg transition-colors"
          >
            <span>🛒</span>
            <span className="text-sm">Cart</span>
            {totalItems > 0 && (
              <span className="bg-[var(--color-primary)] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  );
}


