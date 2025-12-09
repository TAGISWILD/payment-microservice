import { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { useBackendActivity } from '../context/BackendActivityContext';
import { getPaymentStatus } from '../api/paymentApi';
import { formatPrice } from '../data/products';

export default function PaymentStatusPage() {
  const { orderId } = useParams();
  const [searchParams] = useSearchParams();
  const urlStatus = searchParams.get('status');

  const { logApiCall } = useBackendActivity();
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const data = await logApiCall(
          'GET',
          `/api/v1/payments/status/${orderId}`,
          null,
          () => getPaymentStatus(orderId)
        );
        setOrderData(data);
      } catch (err) {
        setError(err.message || 'Failed to fetch order status');
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, [orderId, logApiCall]);

  if (loading) {
    return (
      <div className="min-h-screen pt-4 md:pt-24 pb-24 md:pb-[450px] px-3 md:px-4 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl md:text-6xl animate-spin mb-4">⏳</div>
          <p className="text-sm md:text-base text-[var(--color-text-muted)]">Loading order status...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-4 md:pt-24 pb-24 md:pb-[450px] px-3 md:px-4">
        <div className="max-w-lg mx-auto text-center">
          <div className="text-6xl md:text-8xl mb-4 md:mb-6">❌</div>
          <h1 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4 text-red-400">Error</h1>
          <p className="text-sm md:text-base text-[var(--color-text-muted)] mb-6 md:mb-8">{error}</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white px-6 py-3 rounded-lg transition-colors text-sm md:text-base"
          >
            <span>←</span>
            <span>Back to Store</span>
          </Link>
        </div>
      </div>
    );
  }

  const isSuccess = orderData?.status === 'COMPLETED' || urlStatus === 'success';

  return (
    <div className="min-h-screen pt-4 md:pt-24 pb-24 md:pb-[450px] px-3 md:px-4">
      <div className="max-w-2xl mx-auto">
        {/* Status Card */}
        <div className={`text-center p-6 md:p-8 rounded-xl md:rounded-2xl border ${
          isSuccess 
            ? 'bg-emerald-500/10 border-emerald-500/30' 
            : 'bg-yellow-500/10 border-yellow-500/30'
        }`}>
          <div className="text-6xl md:text-8xl mb-4 md:mb-6">
            {isSuccess ? '✅' : '⏳'}
          </div>
          <h1 className={`text-2xl md:text-3xl font-bold mb-2 ${
            isSuccess ? 'text-emerald-400' : 'text-yellow-400'
          }`}>
            {isSuccess ? 'Payment Successful!' : 'Payment Pending'}
          </h1>
          <p className="text-sm md:text-base text-[var(--color-text-muted)]">
            {isSuccess 
              ? 'Thank you for your purchase. Your order has been confirmed.'
              : 'Your payment is being processed.'}
          </p>
        </div>

        {/* Order Details */}
        <div className="mt-6 md:mt-8 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-bold mb-4 md:mb-6 flex items-center gap-2">
            <span>📋</span>
            <span className="text-sm md:text-xl">Order Details</span>
          </h2>

          <div className="space-y-3 md:space-y-4">
            <div className="flex justify-between py-2 border-b border-[var(--color-border)]">
              <span className="text-xs md:text-sm text-[var(--color-text-muted)]">Order ID</span>
              <span className="font-mono text-xs md:text-sm break-all ml-2">{orderId}</span>
            </div>

            {orderData && (
              <>
                <div className="flex justify-between py-2 border-b border-[var(--color-border)]">
                  <span className="text-xs md:text-sm text-[var(--color-text-muted)]">Status</span>
                  <span className={`font-medium text-xs md:text-sm ${
                    orderData.status === 'COMPLETED' ? 'text-emerald-400' :
                    orderData.status === 'FAILED' ? 'text-red-400' :
                    'text-yellow-400'
                  }`}>
                    {orderData.status}
                  </span>
                </div>

                <div className="flex justify-between py-2 border-b border-[var(--color-border)]">
                  <span className="text-xs md:text-sm text-[var(--color-text-muted)]">Amount</span>
                  <span className="font-bold text-sm md:text-base text-[var(--color-accent)]">
                    {formatPrice(orderData.amount)}
                  </span>
                </div>

                <div className="flex justify-between py-2 border-b border-[var(--color-border)]">
                  <span className="text-xs md:text-sm text-[var(--color-text-muted)]">Currency</span>
                  <span className="text-xs md:text-sm">{orderData.currency}</span>
                </div>

                {orderData.description && (
                  <div className="flex flex-col md:flex-row md:justify-between py-2 gap-1">
                    <span className="text-xs md:text-sm text-[var(--color-text-muted)]">Description</span>
                    <span className="text-right text-xs md:text-sm break-words">
                      {orderData.description}
                    </span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Backend Info */}
        <div className="mt-6 md:mt-8 bg-[var(--color-bg-panel)] border border-[var(--color-border)] rounded-xl p-4 md:p-6">
          <h2 className="text-base md:text-lg font-bold mb-3 md:mb-4 flex items-center gap-2">
            <span>🖥️</span>
            <span className="text-sm md:text-lg">What happened on the backend?</span>
          </h2>

          <div className="space-y-2 md:space-y-3 text-xs md:text-sm">
            <div className="flex items-start gap-3">
              <span className="text-emerald-400">✓</span>
              <div>
                <p className="font-medium">Order Created</p>
                <p className="text-[var(--color-text-muted)] text-xs">
                  POST /api/v1/payments/init → Created order in PostgreSQL
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-emerald-400">✓</span>
              <div>
                <p className="font-medium">Razorpay Order Created</p>
                <p className="text-[var(--color-text-muted)] text-xs">
                  Backend called Razorpay API to create order_XXXX
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-emerald-400">✓</span>
              <div>
                <p className="font-medium">Payment Verified</p>
                <p className="text-[var(--color-text-muted)] text-xs">
                  POST /api/v1/payments/verify → HMAC-SHA256 signature verified
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-emerald-400">✓</span>
              <div>
                <p className="font-medium">Status Updated</p>
                <p className="text-[var(--color-text-muted)] text-xs">
                  Order status changed to COMPLETED in database
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 md:mt-8 flex flex-col sm:flex-row gap-3 md:gap-4">
          <Link
            to="/"
            className="flex-1 flex items-center justify-center gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white py-3 rounded-lg transition-colors text-sm md:text-base active:scale-[0.98]"
          >
            <span>🛒</span>
            <span>Continue Shopping</span>
          </Link>
        </div>

        {/* Technical Note - Hidden on Mobile */}
        <div className="hidden md:block mt-8 text-center text-xs text-[var(--color-text-muted)]">
          <p>Check the Backend Activity Panel below for detailed API logs 👇</p>
        </div>
      </div>
    </div>
  );
}


