import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useBackendActivity } from '../context/BackendActivityContext';
import { formatPrice } from '../data/products';
import { initiatePayment, verifyPayment } from '../api/paymentApi';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, totalAmount, clearCart } = useCart();
  const { logApiCall, addActivity } = useBackendActivity();

  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    contact: '',
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCustomerInfo((prev) => ({ ...prev, [name]: value }));
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleCheckout = async () => {
    if (!customerInfo.name || !customerInfo.email || !customerInfo.contact) {
      alert('Please fill in all fields');
      return;
    }

    setIsProcessing(true);

    try {
      // Step 1: Load Razorpay script
      setCurrentStep('loading-razorpay');
      addActivity({
        type: 'info',
        method: 'SCRIPT',
        endpoint: 'checkout.razorpay.com/v1/checkout.js',
        status: 'pending',
      });

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Failed to load Razorpay script');
      }

      // Step 2: Call backend to initiate payment
      setCurrentStep('init-payment');
      
      const orderDescription = items.map(i => `${i.name} x${i.quantity}`).join(', ');
      const requestBody = {
        amount: totalAmount,
        currency: 'INR',
        externalReferenceId: `STORE-${Date.now()}`,
        description: orderDescription.substring(0, 200),
        customer: customerInfo,
      };

      const initResponse = await logApiCall(
        'POST',
        '/api/v1/payments/init',
        requestBody,
        () => initiatePayment(requestBody)
      );

      // Step 3: Open Razorpay checkout
      setCurrentStep('razorpay-checkout');
      addActivity({
        type: 'info',
        method: 'UI',
        endpoint: 'Razorpay Checkout Modal',
        status: 'pending',
        requestBody: {
          key: initResponse.gatewayKeyId,
          order_id: initResponse.gatewayOrderId,
          amount: initResponse.amount,
        },
      });

      const paymentResult = await new Promise((resolve, reject) => {
        const options = {
          key: initResponse.gatewayKeyId,
          amount: initResponse.amount,
          currency: initResponse.currency,
          name: 'DevStore',
          description: orderDescription.substring(0, 50),
          order_id: initResponse.gatewayOrderId,
          handler: function (response) {
            resolve({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
          },
          prefill: {
            name: customerInfo.name,
            email: customerInfo.email,
            contact: customerInfo.contact,
          },
          theme: {
            color: '#6366f1',
          },
          modal: {
            ondismiss: function () {
              reject(new Error('Payment cancelled by user'));
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      });

      // Step 4: Verify payment with backend
      setCurrentStep('verify-payment');

      const verifyBody = {
        orderId: initResponse.orderId,
        ...paymentResult,
      };

      const verifyResponse = await logApiCall(
        'POST',
        '/api/v1/payments/verify',
        verifyBody,
        () => verifyPayment(verifyBody)
      );

      // Success!
      clearCart();
      navigate(`/payment-status/${initResponse.orderId}?status=success`);

    } catch (error) {
      console.error('Checkout error:', error);
      
      if (error.message === 'Payment cancelled by user') {
        addActivity({
          type: 'info',
          method: 'UI',
          endpoint: 'Razorpay Checkout Modal',
          status: 'error',
          error: 'User cancelled payment',
        });
      }
      
      setIsProcessing(false);
      setCurrentStep(null);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-24 pb-[450px] px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="text-8xl mb-6">🛒</div>
          <h1 className="text-3xl font-bold mb-4">No items to checkout</h1>
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white px-6 py-3 rounded-lg transition-colors"
          >
            <span>←</span>
            <span>Browse Products</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-[450px] px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Customer Form */}
          <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl p-6">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <span>👤</span>
              Customer Information
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[var(--color-text-muted)] mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={customerInfo.name}
                  onChange={handleInputChange}
                  placeholder="John Doe"
                  className="w-full bg-[var(--color-bg-panel)] border border-[var(--color-border)] rounded-lg px-4 py-3 focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                  disabled={isProcessing}
                />
              </div>

              <div>
                <label className="block text-sm text-[var(--color-text-muted)] mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={customerInfo.email}
                  onChange={handleInputChange}
                  placeholder="john@example.com"
                  className="w-full bg-[var(--color-bg-panel)] border border-[var(--color-border)] rounded-lg px-4 py-3 focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                  disabled={isProcessing}
                />
              </div>

              <div>
                <label className="block text-sm text-[var(--color-text-muted)] mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="contact"
                  value={customerInfo.contact}
                  onChange={handleInputChange}
                  placeholder="9876543210"
                  className="w-full bg-[var(--color-bg-panel)] border border-[var(--color-border)] rounded-lg px-4 py-3 focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                  disabled={isProcessing}
                />
              </div>
            </div>

            {/* Test Card Info */}
            <div className="mt-6 p-4 bg-[var(--color-bg-panel)] rounded-lg border border-[var(--color-border)]">
              <p className="text-sm font-medium mb-2 flex items-center gap-2">
                <span>🧪</span>
                Test Mode - Use these credentials:
              </p>
              <div className="text-xs text-[var(--color-text-muted)] space-y-1 font-mono">
                <p>Card: <span className="text-[var(--color-accent)]">4111 1111 1111 1111</span></p>
                <p>Expiry: <span className="text-[var(--color-accent)]">Any future date</span></p>
                <p>CVV: <span className="text-[var(--color-accent)]">Any 3 digits</span></p>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl p-6">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <span>📦</span>
                Order Summary
              </h2>

              <div className="space-y-3 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-[var(--color-text-muted)]">
                      {item.name} × {item.quantity}
                    </span>
                    <span>{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
                <div className="border-t border-[var(--color-border)] pt-3 flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-[var(--color-accent)]">{formatPrice(totalAmount)}</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={isProcessing}
                className="w-full flex items-center justify-center gap-2 bg-[var(--color-accent)] hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded-lg transition-colors font-bold text-lg"
              >
                {isProcessing ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <span>💳</span>
                    <span>Pay {formatPrice(totalAmount)}</span>
                  </>
                )}
              </button>
            </div>

            {/* Current Step Indicator */}
            {currentStep && (
              <div className="mt-4 bg-[var(--color-bg-panel)] border border-[var(--color-border)] rounded-xl p-4">
                <p className="text-sm font-medium mb-3">Processing Steps:</p>
                <div className="space-y-2 text-sm">
                  <StepIndicator
                    step="loading-razorpay"
                    currentStep={currentStep}
                    label="Loading Razorpay SDK"
                  />
                  <StepIndicator
                    step="init-payment"
                    currentStep={currentStep}
                    label="Creating order (POST /init)"
                  />
                  <StepIndicator
                    step="razorpay-checkout"
                    currentStep={currentStep}
                    label="Razorpay Checkout"
                  />
                  <StepIndicator
                    step="verify-payment"
                    currentStep={currentStep}
                    label="Verifying payment (POST /verify)"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StepIndicator({ step, currentStep, label }) {
  const steps = ['loading-razorpay', 'init-payment', 'razorpay-checkout', 'verify-payment'];
  const currentIndex = steps.indexOf(currentStep);
  const stepIndex = steps.indexOf(step);

  let status = 'pending';
  if (stepIndex < currentIndex) status = 'completed';
  else if (stepIndex === currentIndex) status = 'active';

  const icons = {
    pending: '○',
    active: '◉',
    completed: '✓',
  };

  const colors = {
    pending: 'text-[var(--color-text-muted)]',
    active: 'text-[var(--color-primary)]',
    completed: 'text-[var(--color-accent)]',
  };

  return (
    <div className={`flex items-center gap-2 ${colors[status]}`}>
      <span>{icons[status]}</span>
      <span className={status === 'active' ? 'font-medium' : ''}>{label}</span>
      {status === 'active' && <span className="animate-pulse">...</span>}
    </div>
  );
}


