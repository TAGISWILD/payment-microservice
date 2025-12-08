import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { BackendActivityProvider } from './context/BackendActivityContext';

import Navbar from './components/Navbar';
import BackendActivityPanel from './components/BackendActivityPanel';

import ProductsPage from './pages/ProductsPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import PaymentStatusPage from './pages/PaymentStatusPage';

export default function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <BackendActivityProvider>
          <div className="min-h-screen">
            <Navbar />
            
            <Routes>
              <Route path="/" element={<ProductsPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/payment-status/:orderId" element={<PaymentStatusPage />} />
            </Routes>

            <BackendActivityPanel />
          </div>
        </BackendActivityProvider>
      </CartProvider>
    </BrowserRouter>
  );
}
