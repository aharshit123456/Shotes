import { create, type StateCreator } from 'zustand';

export type User = {
  id: string;
  email: string;
  full_name: string;
  username: string;
  role: 'teacher' | 'student';
};

type AuthState = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, full_name: string, username: string, role: 'teacher' | 'student') => Promise<void>;
  logout: () => void;
};

const creator: StateCreator<AuthState> = (set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  
  login: async (email: string, password: string) => {
    const { API_HTTP_BASE } = await import('../services/api');
    const response = await fetch(`${API_HTTP_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Login failed');
    }
    
    const data = await response.json();
    // Store in localStorage for persistence
    localStorage.setItem('auth_token', data.access_token);
    localStorage.setItem('auth_user', JSON.stringify(data.user));
    
    set({
      user: data.user,
      token: data.access_token,
      isAuthenticated: true,
    });
  },
  
  register: async (email: string, password: string, full_name: string, username: string, role: 'teacher' | 'student') => {
    const { API_HTTP_BASE } = await import('../services/api');
    const response = await fetch(`${API_HTTP_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, full_name, username, role }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Registration failed');
    }
    
    const data = await response.json();
    localStorage.setItem('auth_token', data.access_token);
    localStorage.setItem('auth_user', JSON.stringify(data.user));
    
    set({
      user: data.user,
      token: data.access_token,
      isAuthenticated: true,
    });
  },
  
  logout: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    set({
      user: null,
      token: null,
      isAuthenticated: false,
    });
  },
  
  // Initialize from localStorage
  init: () => {
    const token = localStorage.getItem('auth_token');
    const userStr = localStorage.getItem('auth_user');
    if (token && userStr) {
      set({
        user: JSON.parse(userStr),
        token,
        isAuthenticated: true,
      });
    }
  },
});

export const useAuthStore = create<AuthState>(creator);


