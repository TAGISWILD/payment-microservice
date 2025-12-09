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
      <div className="min-h-screen pt-24 pb-[450px] px-4 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl animate-spin mb-4">⏳</div>
          <p className="text-[var(--color-text-muted)]">Loading order status...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-24 pb-[450px] px-4">
        <div className="max-w-lg mx-auto text-center">
          <div className="text-8xl mb-6">❌</div>
          <h1 className="text-3xl font-bold mb-4 text-red-400">Error</h1>
          <p className="text-[var(--color-text-muted)] mb-8">{error}</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white px-6 py-3 rounded-lg transition-colors"
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
    <div className="min-h-screen pt-24 pb-[450px] px-4">
      <div className="max-w-2xl mx-auto">
        {/* Status Card */}
        <div className={`text-center p-8 rounded-2xl border ${
          isSuccess 
            ? 'bg-emerald-500/10 border-emerald-500/30' 
            : 'bg-yellow-500/10 border-yellow-500/30'
        }`}>
          <div className="text-8xl mb-6">
            {isSuccess ? '✅' : '⏳'}
          </div>
          <h1 className={`text-3xl font-bold mb-2 ${
            isSuccess ? 'text-emerald-400' : 'text-yellow-400'
          }`}>
            {isSuccess ? 'Payment Successful!' : 'Payment Pending'}
          </h1>
          <p className="text-[var(--color-text-muted)]">
            {isSuccess 
              ? 'Thank you for your purchase. Your order has been confirmed.'
              : 'Your payment is being processed.'}
          </p>
        </div>

        {/* Order Details */}
        <div className="mt-8 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl p-6">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <span>📋</span>
            Order Details
          </h2>

          <div className="space-y-4">
            <div className="flex justify-between py-2 border-b border-[var(--color-border)]">
              <span className="text-[var(--color-text-muted)]">Order ID</span>
              <span className="font-mono text-sm">{orderId}</span>
            </div>

            {orderData && (
              <>
                <div className="flex justify-between py-2 border-b border-[var(--color-border)]">
                  <span className="text-[var(--color-text-muted)]">Status</span>
                  <span className={`font-medium ${
                    orderData.status === 'COMPLETED' ? 'text-emerald-400' :
                    orderData.status === 'FAILED' ? 'text-red-400' :
                    'text-yellow-400'
                  }`}>
                    {orderData.status}
                  </span>
                </div>

                <div className="flex justify-between py-2 border-b border-[var(--color-border)]">
                  <span className="text-[var(--color-text-muted)]">Amount</span>
                  <span className="font-bold text-[var(--color-accent)]">
                    {formatPrice(orderData.amount)}
                  </span>
                </div>

                <div className="flex justify-between py-2 border-b border-[var(--color-border)]">
                  <span className="text-[var(--color-text-muted)]">Currency</span>
                  <span>{orderData.currency}</span>
                </div>

                {orderData.description && (
                  <div className="flex justify-between py-2">
                    <span className="text-[var(--color-text-muted)]">Description</span>
                    <span className="text-right max-w-[200px] text-sm">
                      {orderData.description}
                    </span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Backend Info */}
        <div className="mt-8 bg-[var(--color-bg-panel)] border border-[var(--color-border)] rounded-xl p-6">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <span>🖥️</span>
            What happened on the backend?
          </h2>

          <div className="space-y-3 text-sm">
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
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <Link
            to="/"
            className="flex-1 flex items-center justify-center gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white py-3 rounded-lg transition-colors"
          >
            <span>🛒</span>
            <span>Continue Shopping</span>
          </Link>
        </div>

        {/* Technical Note */}
        <div className="mt-8 text-center text-xs text-[var(--color-text-muted)]">
          <p>Check the Backend Activity Panel below for detailed API logs 👇</p>
        </div>
      </div>
    </div>
  );
}


