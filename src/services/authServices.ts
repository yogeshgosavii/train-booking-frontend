const API_URL = 'http://localhost:5000/api/auth';

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
