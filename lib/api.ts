const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

/**
 * Client for the Annam Kitchen Flask backend.
 * The request/response contract is documented in docs/api.md.
 */

export type ApiResponse<T = undefined> = {
  status: 'success' | 'error';
  message: string;
  data?: T;
};

export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

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

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError("We couldn't reach our servers. Please check your connection and try again.", 0);
  }

  // The backend always answers with JSON, but proxies and crashes may not.
  const data = await response.json().catch(() => null);

  if (!response.ok || !data) {
    throw new ApiError(data?.message || 'Something went wrong. Please try again.', response.status);
  }

  return data;
}

export type WaitlistPayload = {
  full_name: string;
  email: string;
  plan_interest: string;
  source: string;
};

export type WaitlistEntry = {
  full_name: string;
  email: string;
  plan_interest: string;
  already_registered: boolean;
};

export const api = {
  // Waitlist API
  joinWaitlist: (payload: WaitlistPayload) =>
    apiRequest<ApiResponse<WaitlistEntry>>('/api/waitlist', {
      method: 'POST',
      body: payload,
    }),

  // Phone OTP auth — NOT implemented by the backend yet (see docs/api.md,
  // "Planned"). These calls currently fail with a 404 error message.
  sendOtp: (phone: string) =>
    apiRequest('/api/auth/send-otp', { method: 'POST', body: { phone } }),

  verifyOtp: (phone: string, code: string, name?: string) =>
    apiRequest('/api/auth/verify-otp', {
      method: 'POST',
      body: { phone, code, name },
    }),
};
