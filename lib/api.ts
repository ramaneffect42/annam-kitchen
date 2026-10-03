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

export type PlanId = 'workweek' | 'macro-fit' | 'essential';

export type PlanProfile = {
  age: number;
  sex: 'female' | 'male' | 'unspecified';
  height_cm: number;
  weight_kg: number;
  goal: 'weight-loss' | 'muscle' | 'wellness';
  activity: 'sedentary' | 'moderate' | 'very-active';
  workouts_per_week: number;
  diet: 'vegetarian' | 'non-vegetarian' | 'eggetarian' | 'vegan';
  occupation: 'student' | 'professional' | 'retired' | 'other';
  budget: 'under-150' | '150-300' | '300-500' | '500-plus';
  meals_per_day: number;
  restrictions: Array<'dairy' | 'gluten' | 'nuts' | 'soy' | 'low-sodium'>;
};

export type PlanPrediction = {
  prediction_id: number;
  plan: PlanId;
  confidence: number;
  probabilities: Record<PlanId, number>;
  reasons: Array<{ feature: string; text: string; impact: number }>;
  model: { version: string; trained_at: string; real_samples: number };
};

export const api = {
  // Waitlist API
  joinWaitlist: (payload: WaitlistPayload) =>
    apiRequest<ApiResponse<WaitlistEntry>>('/api/waitlist', {
      method: 'POST',
      body: payload,
    }),

  // Plan finder (ML recommendation)
  predictPlan: (profile: PlanProfile) =>
    apiRequest<ApiResponse<PlanPrediction>>('/api/plan-finder/predict', {
      method: 'POST',
      body: profile,
    }),

  recordPlanChoice: (predictionId: number, plan: PlanId) =>
    apiRequest<ApiResponse>(`/api/plan-finder/predictions/${predictionId}/choice`, {
      method: 'POST',
      body: { plan },
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
