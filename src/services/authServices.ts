const API_URL = 'https://train-booking-backend-gray.vercel.app/api/auth';

export interface User {
  id: number;
  name: string;
  email: string;
}

export interface AuthResponse {
  user?: User;
  token?: string;
  error?: string;
}

export const signup = async (
  name: string,
  email: string,
  password: string
): Promise<AuthResponse> => {
  try {
    const res = await fetch(`${API_URL}/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Signup failed');
    }

    return res.json();
  } catch (err: any) {
    return { error: err.message };
  }
};

export const login = async (
  email: string,
  password: string
): Promise<AuthResponse> => {
  try {
    const res = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Login failed');
    }

    return res.json();
  } catch (err: any) {
    return { error: err.message };
  }
};

export const logout = (): { success: boolean } => {
  // Remove token from all client-side storage
  localStorage.removeItem('token');
  sessionStorage.removeItem('token');
  
  // Clear cookies if used (optional)  
  return { success: true };
};

export const getUserDetails = async (token: string): Promise<User | { error: string }> => {
  try {
    const res = await fetch(`${API_URL}/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Failed to fetch user details');
    }

    return res.json();
  } catch (err: any) {
    return { error: err.message };
  }
};
