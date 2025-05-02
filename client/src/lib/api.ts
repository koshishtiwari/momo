// API base URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Basic fetch with error handling
const fetchAPI = async <T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> => {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  // Handle non-2xx responses
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || `API error: ${response.status}`);
  }

  return response.json();
};

// Get token from local storage
const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
};

// Authenticated fetch
const fetchWithAuth = <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  const token = getToken();
  if (!token) {
    throw new Error('Authentication required');
  }

  return fetchAPI<T>(endpoint, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  });
};

// API client
export const api = {
  // Auth endpoints
  auth: {
    login: (email: string) => 
      fetchAPI<{ success: boolean; token: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email }),
      }),
    
    verifyToken: (token: string) => 
      fetchAPI<{ success: boolean; token: string; user: any }>('/auth/verify-token', {
        method: 'POST',
        body: JSON.stringify({ token }),
      }),
    
    me: () => 
      fetchWithAuth<{ success: boolean; user: any }>('/auth/me'),
  },
  
  // Product endpoints
  products: {
    getAll: (params: Record<string, string> = {}) => {
      const queryParams = new URLSearchParams(params).toString();
      return fetchAPI<{ success: boolean; data: any[] }>(`/products?${queryParams}`);
    },
    
    getById: (id: string) => 
      fetchAPI<{ success: boolean; data: any }>(`/products/${id}`),
    
    search: (query: string, params: Record<string, string> = {}) => {
      const queryParams = new URLSearchParams({
        query,
        ...params
      }).toString();
      return fetchAPI<{ success: boolean; data: any[] }>(`/products/search?${queryParams}`);
    },
  },
  
  // Cart endpoints (to be implemented with htmx)
  cart: {
    get: () => 
      fetchWithAuth<{ success: boolean; data: any }>('/cart'),
    
    addItem: (productId: string, quantity: number) => 
      fetchWithAuth<{ success: boolean; data: any }>('/cart/items', {
        method: 'POST',
        body: JSON.stringify({ productId, quantity }),
      }),
    
    updateItem: (itemId: string, quantity: number) => 
      fetchWithAuth<{ success: boolean; data: any }>(`/cart/items/${itemId}`, {
        method: 'PUT',
        body: JSON.stringify({ quantity }),
      }),
    
    removeItem: (itemId: string) => 
      fetchWithAuth<{ success: boolean }>(`/cart/items/${itemId}`, {
        method: 'DELETE',
      }),
  },
};