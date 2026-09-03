const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

/**
 * Utility for making API requests to the Annam Kitchen Express Backend add
 */
export async function apiRequest<T = any>(
  endpoint: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    body?: any;
    token?: string;
  } = {}
): Promise<T> {
  const { method = 'GET', body, token } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'API Request failed');
  }

  return data;
}

// Dedicated API service methods
export const api = {
  // Auth API
  sendOtp: (phone: string) =>
    apiRequest('/api/auth/send-otp', { method: 'POST', body: { phone } }),

  verifyOtp: (phone: string, code: string, name?: string) =>
    apiRequest('/api/auth/verify-otp', {
      method: 'POST',
      body: { phone, code, name },
    }),

  // Menu API
  getMenu: () => apiRequest('/api/menu', { method: 'GET' }),

  // Order API
  createOrder: (
    items: Array<{ menuItemId: string; quantity: number }>,
    addressSnapshot: { street: string; city: string; postalCode: string },
    token: string
  ) =>
    apiRequest('/api/orders', {
      method: 'POST',
      body: { items, addressSnapshot },
      token,
    }),

  getOrderById: (orderId: string, token: string) =>
    apiRequest(`/api/orders/${orderId}`, { method: 'GET', token }),

  // Payment API
  verifyPayment: (
    payload: {
      orderId: string;
      razorpayOrderId: string;
      razorpayPaymentId: string;
      razorpaySignature: string;
    },
    token: string
  ) =>
    apiRequest('/api/payments/verify', {
      method: 'POST',
      body: payload,
      token,
    }),
};
