const API_BASE = '/api/v1/payments';

export async function initiatePayment(orderData) {
  const response = await fetch(`${API_BASE}/init`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(orderData),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Payment initiation failed' }));
    throw { status: response.status, ...error };
  }

  return response.json();
}

export async function verifyPayment(verifyData) {
  const response = await fetch(`${API_BASE}/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(verifyData),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Payment verification failed' }));
    throw { status: response.status, ...error };
  }

  return response.json();
}

export async function getPaymentStatus(orderId) {
  const response = await fetch(`${API_BASE}/status/${orderId}`);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to get status' }));
    throw { status: response.status, ...error };
  }

  return response.json();
}

