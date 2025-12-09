import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { totalItems } = useCart();
  const location = useLocation();

  return (
    <>
      {/* Mobile Navbar - Bottom Fixed */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[var(--color-bg-panel)] border-t border-[var(--color-border)] safe-area-inset-bottom">
        <div className="flex items-center justify-around h-16 px-2">
          <Link
            to="/"
            className={`flex flex-col items-center justify-center gap-1 flex-1 h-full ${
              location.pathname === '/' ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'
            }`}
          >
            <span className="text-xl">🏠</span>
            <span className="text-[10px] font-medium">Home</span>
          </Link>
          
          <Link
            to="/cart"
            className={`flex flex-col items-center justify-center gap-1 flex-1 h-full relative ${
              location.pathname === '/cart' ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'
            }`}
          >
            <span className="text-xl">🛒</span>
            {totalItems > 0 && (
              <span className="absolute top-1 right-1/4 bg-[var(--color-primary)] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {totalItems}
              </span>
            )}
            <span className="text-[10px] font-medium">Cart</span>
          </Link>

          <div className="flex flex-col items-center justify-center gap-1 flex-1 h-full text-[var(--color-text-muted)]">
            <span className="text-xl">⚡</span>
            <span className="text-[10px] font-medium">Nexus</span>
          </div>
        </div>
      </nav>

      {/* Desktop Navbar - Top Fixed */}
      <nav className="hidden md:flex fixed top-0 left-0 right-0 z-50 bg-[var(--color-bg-panel)]/90 backdrop-blur-md border-b border-[var(--color-border)]">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between w-full">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="text-2xl">🛒</span>
            <span className="font-bold text-lg">DevStore</span>
            <span className="text-xs bg-[var(--color-primary)] px-2 py-0.5 rounded-full">
              Nexus Demo
            </span>
          </Link>

          {/* Nav Links */}
          <div className="flex items-center gap-6">
            <Link 
              to="/" 
              className={`transition-colors text-sm ${
                location.pathname === '/' 
                  ? 'text-white' 
                  : 'text-[var(--color-text-muted)] hover:text-white'
              }`}
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
    </>
  );
}
