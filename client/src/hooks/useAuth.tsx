import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { useRouter } from 'next/router';
import { api } from '@/lib/api';
import jwtDecode from 'jwt-decode';

interface User {
  id: string;
  email: string;
  name?: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string) => Promise<string>;
  verifyToken: (token: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Check if user is authenticated on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        // Validate token expiration
        const decoded = jwtDecode<{ exp: number }>(token);
        const isExpired = decoded.exp * 1000 < Date.now();
        
        if (isExpired) {
          logout();
        } else {
          // Get user data
          api.auth.me()
            .then(response => {
              if (response.success) {
                setUser(response.user);
              }
            })
            .catch(() => {
              logout();
            })
            .finally(() => {
              setIsLoading(false);
            });
        }
      } catch (e) {
        logout();
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, []);

  // Login with email (passwordless)
  const login = async (email: string) => {
    const response = await api.auth.login(email);
    return response.token; // Return magic link token
  };

  // Verify magic link token
  const verifyToken = async (token: string) => {
    const response = await api.auth.verifyToken(token);
    if (response.success && response.token) {
      localStorage.setItem('token', response.token);
      setUser(response.user);
      router.push('/');
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    router.push('/');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        verifyToken,
        logout,
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