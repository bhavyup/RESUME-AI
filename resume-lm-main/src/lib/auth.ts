import { api, tokenManager, ApiError } from "./api";

// Type definitions matching your Spring Boot DTOs
export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  fullName: string;
}

export interface LoginResponse {
  jwtToken: string;
  expiresInSeconds: number;
}

export interface UserResponse {
  id: number;
  username: string;
  email: string;
  fullName: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserInfoResponse {
  id: number;
  username: string;
  email: string;
  fullName: string;
  personalInfo: unknown | null;
}

// Auth service
export const authService = {
  /**
   * Register a new user with email/password
   */
  async register(data: RegisterRequest): Promise<UserResponse> {
    try {
      const response = await api.post<UserResponse>("/api/auth/register", data);
      return response;
    } catch (error) {
      if (error instanceof ApiError) {
        console.error("Registration error:", error); // Debug log

        // Handle specific error cases
        if (error.status === 409) {
          throw new Error("Username or email already exists");
        }

        if (error.status === 400) {
          // Extract validation errors if present
          if (error.data?.message) {
            throw new Error(error.data.message);
          }
          if (error.data?.errors) {
            // Validation errors array
            const errorMessages = Object.values(error.data.errors).join(", ");
            throw new Error(`Validation failed: ${errorMessages}`);
          }
          throw new Error(
            "Invalid registration data. Please check all fields."
          );
        }

        throw new Error(error.message || "Registration failed");
      }
      console.error("Unexpected registration error:", error);
      throw new Error("Registration failed");
    }
  },

  /**
   * Login with email/password
   */
  async login(data: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await api.post<LoginResponse>("/api/auth/login", data);

      // Store access token
      tokenManager.setAccessToken(response.jwtToken, response.expiresInSeconds);
      

      // Dispatch auth change event
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("auth-state-changed"));
      }

      return response;
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 401) {
          throw new Error("Invalid credentials");
        }
        throw new Error(error.message || "Login failed");
      }
      throw new Error("Login failed");
    }
  },

  /**
   * Logout current user
   */
  async logout(): Promise<void> {
    try {
      // Clear tokens FIRST (synchronously)
      tokenManager.clearTokens();

      // Then try to call backend (don't wait for it)
      api.post("/api/auth/logout").catch((error) => {
        console.error("Logout API call failed:", error);
      });

      // Immediate redirect - don't wait for anything
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
    } catch (error) {
      console.error("Logout error:", error);
      // Even if error, still redirect
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
    }
  },

  /**
   * Get current user info
   */
  async getCurrentUser(): Promise<UserInfoResponse | null> {
    try {
      if (!tokenManager.isAuthenticated()) {
        return null;
      }
      return await api.get<UserInfoResponse>("/api/users/me");
    } catch (error) {
      console.error("Failed to get current user:", error);
      return null;
    }
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return tokenManager.isAuthenticated();
  },

  /**
   * Verify email with token
   */
  async verifyEmail(token: string): Promise<void> {
    try {
      await api.post(`/api/auth/verify-email?token=${token}`);
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.message || "Email verification failed");
      }
      throw new Error("Email verification failed");
    }
  },

  /**
   * Get OAuth authorization URL
   */
  getOAuthUrl(provider: "github" | "google"): string {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
    return `${apiUrl}/oauth2/authorize/${provider}`;
  },

  /**
   * Handle OAuth callback (extract token from URL and store it)
   */
  handleOAuthCallback(token: string, expiresIn: number): void {
    tokenManager.setAccessToken(token, expiresIn);
  },
};
