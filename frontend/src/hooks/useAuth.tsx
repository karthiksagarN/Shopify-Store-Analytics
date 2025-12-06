import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Disable demo mode for production
const DEMO_MODE = false;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      if (DEMO_MODE) {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 800));

        // Demo validation
        if (password.length < 4) {
          throw new Error('Invalid credentials');
        }

        const demoUser = { id: '1', email };
        localStorage.setItem('user', JSON.stringify(demoUser));
        localStorage.setItem('auth_token', 'demo_token_' + Date.now());
        setUser(demoUser);
      } else {
        // Real API call would go here
        const { authApi } = await import('@/lib/api');
        const response = await authApi.login(email, password);
        localStorage.setItem('auth_token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        setUser(response.user);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      if (DEMO_MODE) {
        await new Promise((resolve) => setTimeout(resolve, 800));

        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters');
        }

        // In demo mode, just redirect to login
        return;
      } else {
        const { authApi } = await import('@/lib/api');
        await authApi.register(email, password);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('auth_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
