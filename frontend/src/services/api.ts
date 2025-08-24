import axios, { AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { 
  AuthResponse, 
  LoginRequest, 
  RegisterRequest,
  ApiResponse,
  User,
  Organization
} from '@/types'

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Token management
const TOKEN_STORAGE_KEY = 'storeflex_access_token'
const REFRESH_TOKEN_STORAGE_KEY = 'storeflex_refresh_token'
const TENANT_STORAGE_KEY = 'storeflex_tenant'

export const tokenManager = {
  getAccessToken: () => localStorage.getItem(TOKEN_STORAGE_KEY),
  setAccessToken: (token: string) => localStorage.setItem(TOKEN_STORAGE_KEY, token),
  getRefreshToken: () => localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY),
  setRefreshToken: (token: string) => localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, token),
  getTenant: () => {
    const tenant = localStorage.getItem(TENANT_STORAGE_KEY)
    return tenant ? JSON.parse(tenant) : null
  },
  setTenant: (tenant: Organization) => localStorage.setItem(TENANT_STORAGE_KEY, JSON.stringify(tenant)),
  clearTokens: () => {
    localStorage.removeItem(TOKEN_STORAGE_KEY)
    localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY)
    localStorage.removeItem(TENANT_STORAGE_KEY)
  },
}

// Request interceptor
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenManager.getAccessToken()
    const tenant = tokenManager.getTenant()
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    if (tenant) {
      config.headers['X-Tenant-ID'] = tenant.id
      config.headers['X-Tenant-Slug'] = tenant.slug
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const originalRequest = error.config
    
    // If error is 401 and we haven't already tried to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      
      const refreshToken = tokenManager.getRefreshToken()
      if (refreshToken) {
        try {
          const response = await axios.post(
            `${api.defaults.baseURL}/api/auth/refresh`,
            { refreshToken }
          )
          
          const { accessToken, refreshToken: newRefreshToken } = response.data.data.tokens
          
          tokenManager.setAccessToken(accessToken)
          tokenManager.setRefreshToken(newRefreshToken)
          
          // Retry original request
          originalRequest.headers.Authorization = `Bearer ${accessToken}`
          return api(originalRequest)
        } catch (refreshError) {
          // Refresh failed, clear tokens and redirect to login
          tokenManager.clearTokens()
          window.location.href = '/login'
          return Promise.reject(refreshError)
        }
      } else {
        // No refresh token, redirect to login
        tokenManager.clearTokens()
        window.location.href = '/login'
      }
    }
    
    return Promise.reject(error)
  }
)

// Auth API
export const authApi = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/api/auth/login', data)
    return response.data
  },
  
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/api/auth/register', data)
    return response.data
  },
  
  logout: async (): Promise<void> => {
    await api.post('/api/auth/logout')
    tokenManager.clearTokens()
  },
  
  getCurrentUser: async (): Promise<ApiResponse<{ user: User }>> => {
    const response = await api.get<ApiResponse<{ user: User }>>('/api/auth/me')
    return response.data
  },
  
  refreshToken: async (): Promise<AuthResponse> => {
    const refreshToken = tokenManager.getRefreshToken()
    if (!refreshToken) {
      throw new Error('No refresh token available')
    }
    
    const response = await api.post<AuthResponse>('/api/auth/refresh', {
      refreshToken
    })
    return response.data
  },
}

// Tenant API
export const tenantApi = {
  getTenantBySlug: async (slug: string): Promise<ApiResponse<{ tenant: Organization }>> => {
    const response = await api.get<ApiResponse<{ tenant: Organization }>>(`/api/tenants/${slug}`)
    return response.data
  },
  
  getCurrentTenant: async (): Promise<ApiResponse<{ tenant: Organization }>> => {
    const response = await api.get<ApiResponse<{ tenant: Organization }>>('/api/tenants')
    return response.data
  },
}

// Products API
export const productsApi = {
  getProducts: async (params?: Record<string, any>) => {
    const response = await api.get('/api/products', { params })
    return response.data
  },
  
  createProduct: async (data: any) => {
    const response = await api.post('/api/products', data)
    return response.data
  },
  
  updateProduct: async (id: string, data: any) => {
    const response = await api.put(`/api/products/${id}`, data)
    return response.data
  },
  
  deleteProduct: async (id: string) => {
    const response = await api.delete(`/api/products/${id}`)
    return response.data
  },
}

// Inventory API
export const inventoryApi = {
  getInventory: async (params?: Record<string, any>) => {
    const response = await api.get('/api/inventory', { params })
    return response.data
  },
  
  updateInventory: async (data: any) => {
    const response = await api.post('/api/inventory/movement', data)
    return response.data
  },
}

// Orders API
export const ordersApi = {
  getOrders: async (params?: Record<string, any>) => {
    const response = await api.get('/api/orders', { params })
    return response.data
  },
  
  createOrder: async (data: any) => {
    const response = await api.post('/api/orders', data)
    return response.data
  },
}

// Dashboard API
export const dashboardApi = {
  getStats: async () => {
    const response = await api.get('/api/dashboard/stats')
    return response.data
  },
  
  getTrends: async () => {
    const response = await api.get('/api/dashboard/trends')
    return response.data
  },
}

export default api