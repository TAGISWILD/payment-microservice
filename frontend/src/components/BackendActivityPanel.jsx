import { useState } from 'react';
import { useBackendActivity } from '../context/BackendActivityContext';

const methodColors = {
  GET: 'text-green-400',
  POST: 'text-blue-400',
  PUT: 'text-yellow-400',
  DELETE: 'text-red-400',
};

const statusIcons = {
  pending: '⏳',
  success: '✅',
  error: '❌',
};

function ActivityItem({ activity }) {
  const isExpanded = activity.status !== 'pending';
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);

  return (
    <div className="animate-slide-in border-l-2 border-[var(--color-border)] pl-3 md:pl-4 py-2 md:py-3 hover:bg-[var(--color-bg-card)]/50 transition-colors">
      {/* Header - Mobile Optimized */}
      <div className="flex items-center gap-2 text-xs md:text-sm">
        <span className="text-base md:text-lg">{statusIcons[activity.status]}</span>
        <span className={`font-bold ${methodColors[activity.method] || 'text-gray-400'}`}>
          {activity.method}
        </span>
        <span className="text-[var(--color-text-muted)] font-mono text-[10px] md:text-xs truncate flex-1">
          {activity.endpoint}
        </span>
        {activity.duration && (
          <span className="text-[10px] md:text-xs text-[var(--color-text-muted)] whitespace-nowrap">
            {activity.duration}ms
          </span>
        )}
        {/* Mobile Expand Button */}
        <button
          onClick={() => setIsMobileExpanded(!isMobileExpanded)}
          className="md:hidden text-[var(--color-text-muted)] text-xs"
        >
          {isMobileExpanded ? '▼' : '▶'}
        </button>
      </div>

      {/* Backend Details - Mobile Collapsible */}
      {(isMobileExpanded || isExpanded) && (
        <>
          {/* Backend Details */}
          {isExpanded && (
            <div className="mt-2 text-[10px] md:text-xs text-[var(--color-text-muted)] space-y-1">
              {activity.endpoint === '/api/v1/payments/init' && (
                <div className="bg-blue-500/10 border border-blue-500/20 rounded p-2">
                  <div className="font-semibold text-blue-300 mb-1">🔧 Backend Process:</div>
                  <ul className="list-disc list-inside space-y-0.5 text-[9px] md:text-[10px]">
                    <li>Validating payment request parameters</li>
                    <li>Creating order record in PostgreSQL database</li>
                    <li>Generating unique public_id (UUID) for order</li>
                    <li>Calling Razorpay API to create payment order</li>
                    <li>Storing gateway_order_id from Razorpay</li>
                    <li>Returning order details with Razorpay key_id</li>
                  </ul>
                </div>
              )}
              {activity.endpoint === '/api/v1/payments/verify' && (
                <div className="bg-green-500/10 border border-green-500/20 rounded p-2">
                  <div className="font-semibold text-green-300 mb-1">🔒 Verification Process:</div>
                  <ul className="list-disc list-inside space-y-0.5 text-[9px] md:text-[10px]">
                    <li>Looking up order by public_id in database</li>
                    <li>Validating Razorpay order_id matches stored value</li>
                    <li>Computing HMAC-SHA256 signature from payload</li>
                    <li>Comparing generated signature with received signature</li>
                    <li>Updating order status to COMPLETED if valid</li>
                    <li>Persisting payment record in database</li>
                  </ul>
                </div>
              )}
              {activity.endpoint === '/api/v1/payments/status' && (
                <div className="bg-purple-500/10 border border-purple-500/20 rounded p-2">
                  <div className="font-semibold text-purple-300 mb-1">📊 Status Check:</div>
                  <ul className="list-disc list-inside space-y-0.5 text-[9px] md:text-[10px]">
                    <li>Querying database for order by public_id</li>
                    <li>Retrieving current payment status</li>
                    <li>Fetching associated payment records</li>
                    <li>Returning comprehensive order information</li>
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Request Body */}
          {activity.requestBody && (
            <div className="mt-2">
              <div className="text-[10px] md:text-xs text-[var(--color-text-muted)] mb-1 flex items-center gap-2">
                <span>→ Request:</span>
                <span className="text-[9px] bg-[var(--color-bg-panel)] px-1.5 py-0.5 rounded">
                  {Object.keys(activity.requestBody).length} fields
                </span>
              </div>
              <pre className="font-mono text-[9px] md:text-xs bg-[var(--color-bg-panel)] p-2 rounded overflow-x-auto text-green-300">
                {JSON.stringify(activity.requestBody, null, 2)}
              </pre>
            </div>
          )}

          {/* Response Body */}
          {isExpanded && activity.responseBody && (
            <div className="mt-2">
              <div className="flex items-center gap-2 text-[10px] md:text-xs text-[var(--color-text-muted)] mb-1">
                <span>← Response:</span>
                {activity.statusCode && (
                  <span className={`px-1.5 py-0.5 rounded text-[9px] ${
                    activity.status === 'success' 
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                      : 'bg-red-500/20 text-red-400 border border-red-500/30'
                  }`}>
                    HTTP {activity.statusCode}
                  </span>
                )}
              </div>
              <pre className={`font-mono text-[9px] md:text-xs bg-[var(--color-bg-panel)] p-2 rounded overflow-x-auto ${
                activity.status === 'success' ? 'text-blue-300' : 'text-red-300'
              }`}>
                {JSON.stringify(activity.responseBody, null, 2)}
              </pre>
            </div>
          )}

          {/* Error */}
          {activity.error && (
            <div className="mt-2 text-[10px] md:text-xs text-red-400">
              Error: {activity.error}
            </div>
          )}

          {/* Timestamp */}
          <div className="mt-2 text-[9px] md:text-xs text-[var(--color-text-muted)]">
            {new Date(activity.timestamp).toLocaleTimeString()}
          </div>
        </>
      )}
    </div>
  );
}

export default function BackendActivityPanel() {
  const { activities, isExpanded, setIsExpanded, clearActivities } = useBackendActivity();

  return (
    <>
      {/* Mobile - Floating Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="md:hidden fixed bottom-20 right-4 z-40 bg-[var(--color-primary)] text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-xl active:scale-95 transition-transform"
      >
        {isExpanded ? '✕' : '🖥️'}
        {activities.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
            {activities.length}
          </span>
        )}
      </button>

      {/* Mobile - Full Screen Panel */}
      {isExpanded && (
        <div className="md:hidden fixed inset-0 z-50 bg-[var(--color-bg-dark)] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-4 h-14 bg-[var(--color-bg-panel)] border-b border-[var(--color-border)]">
            <div className="flex items-center gap-2">
              <span className="text-lg">🖥️</span>
              <span className="font-semibold text-sm">Nexus Backend</span>
              {activities.length > 0 && (
                <span className="bg-[var(--color-primary)] text-white text-xs px-2 py-0.5 rounded-full">
                  {activities.length}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {activities.length > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    clearActivities();
                  }}
                  className="text-xs text-[var(--color-text-muted)] px-3 py-1"
                >
                  Clear
                </button>
              )}
              <button
                onClick={() => setIsExpanded(false)}
                className="text-xl text-[var(--color-text-muted)]"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Activity List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2 pb-20">
            {activities.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-[var(--color-text-muted)]">
                <span className="text-4xl mb-2">📡</span>
                <p className="text-sm font-semibold mb-1">Nexus Payment Microservice</p>
                <p className="text-xs mb-2">No backend activity yet</p>
                <p className="text-xs text-center px-4">
                  API calls to <span className="text-[var(--color-primary)]">/api/v1/payments/*</span> will appear here
                </p>
              </div>
            ) : (
              [...activities].reverse().map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))
            )}
          </div>
        </div>
      )}

      {/* Desktop - Side Panel */}
      <div className={`hidden md:block fixed bottom-0 right-0 w-[500px] bg-[var(--color-bg-card)] border-t md:border-l border-[var(--color-border)] transition-all duration-300 ${
        isExpanded ? 'h-[400px]' : 'h-12'
      }`}>
        {/* Header */}
        <div 
          className="flex items-center justify-between px-4 h-12 bg-[var(--color-bg-panel)] border-b border-[var(--color-border)] cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">🖥️</span>
            <span className="font-semibold text-sm">Nexus Backend Activity</span>
            {activities.length > 0 && (
              <span className="bg-[var(--color-primary)] text-white text-xs px-2 py-0.5 rounded-full">
                {activities.length}
              </span>
            )}
            {activities.some(a => a.status === 'pending') && (
              <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse-green" title="Processing..."></span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isExpanded && activities.length > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  clearActivities();
                }}
                className="text-xs text-[var(--color-text-muted)] hover:text-white transition-colors"
              >
                Clear
              </button>
            )}
            <span className="text-[var(--color-text-muted)]">
              {isExpanded ? '▼' : '▲'}
            </span>
          </div>
        </div>

        {/* Activity List */}
        {isExpanded && (
          <div className="h-[calc(100%-48px)] overflow-y-auto p-4 space-y-2">
            {activities.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-[var(--color-text-muted)]">
                <span className="text-4xl mb-2">📡</span>
                <p className="text-sm font-semibold mb-1">Nexus Payment Microservice</p>
                <p className="text-xs mb-2">No backend activity yet</p>
                <p className="text-xs text-center px-4">
                  API calls to <span className="text-[var(--color-primary)]">/api/v1/payments/*</span> will appear here with detailed backend processing information
                </p>
              </div>
            ) : (
              [...activities].reverse().map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))
            )}
          </div>
        )}
      </div>
    </>
  );
}
