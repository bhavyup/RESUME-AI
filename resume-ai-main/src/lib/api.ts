// Base API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// Token storage keys
const ACCESS_TOKEN_KEY = "access_token";
const TOKEN_EXPIRY_KEY = "token_expiry";

// API error class
export class ApiError extends Error {
  constructor(message: string, public status: number, public data?: unknown) {
    super(message);
    this.name = "ApiError";
  }
}

// Token management with event notifications
export const tokenManager = {
  getAccessToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  setAccessToken(token: string, expiresInSeconds: number): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
    const expiryTime = Date.now() + expiresInSeconds * 1000;
    localStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());

    // Dispatch custom event to notify all listeners
    this.notifyAuthChange();
  },

  clearTokens(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(TOKEN_EXPIRY_KEY);

    // Dispatch custom event to notify all listeners
    this.notifyAuthChange();
  },

  isTokenExpired(): boolean {
    if (typeof window === "undefined") return true;
    const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
    if (!expiry) return true;
    return Date.now() > parseInt(expiry);
  },

  isAuthenticated(): boolean {
    return !!this.getAccessToken() && !this.isTokenExpired();
  },

  /**
   * Notify all listeners that auth state changed
   */
  notifyAuthChange(): void {
    if (typeof window === "undefined") return;
    window.dispatchEvent(new CustomEvent("auth-state-changed"));
  },
};

// Base fetch wrapper
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  // Add authorization header if token exists
  const token = tokenManager.getAccessToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token && !tokenManager.isTokenExpired()) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: "include", // Important for cookies (refresh token)
    });

    // Handle 401 Unauthorized - token expired
    if (response.status === 401) {
      // Try to refresh token
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        // Retry original request with new token
        headers["Authorization"] = `Bearer ${tokenManager.getAccessToken()}`;
        const retryResponse = await fetch(url, {
          ...options,
          headers,
          credentials: "include",
        });

        if (!retryResponse.ok) {
          throw new ApiError(
            "Request failed after token refresh",
            retryResponse.status,
            await retryResponse.json().catch(() => null)
          );
        }

        return retryResponse.json();
      } else {
        // Refresh failed, redirect to login
        tokenManager.clearTokens();
        if (typeof window !== "undefined") {
          window.location.href = "/";
        }
        throw new ApiError("Authentication expired", 401);
      }
    }

    // Handle other errors
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new ApiError(
        errorData?.message || `HTTP ${response.status}`,
        response.status,
        errorData
      );
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return null as T;
    }

    return response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error instanceof Error ? error.message : "Network error",
      0
    );
  }
}

// Refresh access token using refresh token cookie
async function refreshAccessToken(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: "POST",
      credentials: "include", // Send refresh token cookie
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    tokenManager.setAccessToken(data.jwtToken, data.expiresInSeconds);
    return true;
  } catch {
    return false;
  }
}

// API methods
export const api = {
  // GET request
  get: <T>(endpoint: string, options?: RequestInit): Promise<T> =>
    apiFetch<T>(endpoint, { ...options, method: "GET" }),

  // POST request
  post: <T>(
    endpoint: string,
    data?: unknown,
    options?: RequestInit
  ): Promise<T> =>
    apiFetch<T>(endpoint, {
      ...options,
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    }),

  // PUT request
  put: <T>(
    endpoint: string,
    data?: unknown,
    options?: RequestInit
  ): Promise<T> =>
    apiFetch<T>(endpoint, {
      ...options,
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    }),

  // DELETE request
  delete: <T>(endpoint: string, options?: RequestInit): Promise<T> =>
    apiFetch<T>(endpoint, { ...options, method: "DELETE" }),

  // PATCH request
  patch: <T>(
    endpoint: string,
    data?: unknown,
    options?: RequestInit
  ): Promise<T> =>
    apiFetch<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    }),
};

// Dashboard-specific endpoints
export const dashboardApi = {
  /**
   * Get all dashboard data (profile + resumes)
   */
  async getDashboardData(): Promise<DashboardData> {
    return api.get<DashboardData>("/api/dashboard");
  },

  /**
   * Get personal info
   */
  async getPersonalInfo(): Promise<PersonalInfo | null> {
    try {
      return await api.get<PersonalInfo>("/api/info");
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        return null;
      }
      throw error;
    }
  },

  /**
   * Get resume summaries
   */
  async getResumes(): Promise<ResumeSummary[]> {
    return api.get<ResumeSummary[]>("/api/resumes");
  },
};

// Subscription-specific endpoints
export const subscriptionApi = {
  /**
   * Get subscription status (flat structure matching Supabase)
   */
  async getSubscriptionStatus(): Promise<SubscriptionStatusFlat> {
    return api.get<SubscriptionStatusFlat>("/api/subscription/status/flat");
  },

  /**
   * Create Stripe checkout session
   */
  async createCheckoutSession(data: {
    planType: string;
  }): Promise<{ sessionId: string; url: string }> {
    return api.post("/api/subscription/checkout", data);
  },

  /**
   * Create Stripe portal session
   */
  async createPortalSession(): Promise<{ url: string }> {
    return api.post("/api/subscription/portal");
  },

  /**
   * Cancel subscription
   */
  async cancelSubscription(): Promise<void> {
    return api.post("/api/subscription/cancel");
  },
};

// Type definition for flat subscription status
export interface SubscriptionStatusFlat {
  subscription_plan: string | null; // "free" or "pro"
  subscription_status: string | null; // "active", "canceled", etc.
  current_period_end: string | null; // ISO 8601
  trial_end: string | null; // ISO 8601
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  base_resumes_count: number;
  tailored_resumes_count: number;
  can_create_base: boolean;
  can_create_tailored: boolean;
  max_base_resumes: number | null; // null = unlimited
  max_tailored_resumes: number | null; // null = unlimited
}

// Type definitions
export interface DashboardData {
  profile: PersonalInfo | null;
  resumes: ResumeSummary[];
}

export interface PersonalInfo {
  fullName: string | null;
  professionalTitle: string | null;
  resumeHeadline: string | null;
  professionalSummary: string | null;
  email: string;
  phoneNumber: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  zip: string | null;
  preferredContactMethod: string | null;
  linkedinUrl: string | null;
  githubUrl: string | null;
  websiteUrl: string | null;
  twitterUrl: string | null;
  instagramUrl: string | null;
  telegramUrl: string | null;
  facebookUrl: string | null;
  whatsappUrl: string | null;
  targetRoles: string[];
  workPreference: string | null;
  photoUrl: string | null;
  languages: Language[];
  links: CustomLink[];
}

export interface Language {
  id: number;
  language: string;
  proficiencyLevel: string;
}

export interface CustomLink {
  id: number;
  title: string;
  url: string;
}

export interface ResumeSummary {
  id: number;
  title: string;
  updatedAt: string;
}
