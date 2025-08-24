import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSnackbar } from 'notistack'
import { 
  authApi, 
  tokenManager,
  tenantApi
} from '@/services/api'
import { 
  User, 
  Organization, 
  LoginRequest, 
  RegisterRequest,
  AuthResponse 
} from '@/types'

interface AuthContextType {
  user: User | null
  organization: Organization | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (data: LoginRequest) => Promise<void>
  register: (data: RegisterRequest) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  
  const queryClient = useQueryClient()
  const { enqueueSnackbar } = useSnackbar()

  // Query to fetch current user
  const { 
    data: userData, 
    isLoading: isUserLoading,
    error: userError 
  } = useQuery({
    queryKey: ['auth', 'current-user'],
    queryFn: authApi.getCurrentUser,
    enabled: !!tokenManager.getAccessToken() && !user,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Query to fetch current tenant
  const { 
    data: tenantData, 
    isLoading: isTenantLoading 
  } = useQuery({
    queryKey: ['tenant', 'current'],
    queryFn: tenantApi.getCurrentTenant,
    enabled: !!user && !!tokenManager.getTenant(),
    retry: false,
  })

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (response: AuthResponse) => {
      const { user, organization, tokens } = response.data
      
      // Store tokens and tenant info
      tokenManager.setAccessToken(tokens.accessToken)
      tokenManager.setRefreshToken(tokens.refreshToken)
      tokenManager.setTenant(organization)
      
      // Update state
      setUser(user)
      setOrganization(organization)
      
      // Invalidate queries to refetch fresh data
      queryClient.invalidateQueries({ queryKey: ['auth'] })
      queryClient.invalidateQueries({ queryKey: ['tenant'] })
      
      enqueueSnackbar('Login successful!', { variant: 'success' })
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || 'Login failed'
      enqueueSnackbar(message, { variant: 'error' })
    },
  })

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: (response: AuthResponse) => {
      const { user, organization, tokens } = response.data
      
      // Store tokens and tenant info
      tokenManager.setAccessToken(tokens.accessToken)
      tokenManager.setRefreshToken(tokens.refreshToken)
      tokenManager.setTenant(organization)
      
      // Update state
      setUser(user)
      setOrganization(organization)
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['auth'] })
      queryClient.invalidateQueries({ queryKey: ['tenant'] })
      
      enqueueSnackbar('Registration successful!', { variant: 'success' })
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || 'Registration failed'
      enqueueSnackbar(message, { variant: 'error' })
    },
  })

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      // Clear all auth data
      tokenManager.clearTokens()
      setUser(null)
      setOrganization(null)
      
      // Clear all cached data
      queryClient.clear()
      
      enqueueSnackbar('Logged out successfully', { variant: 'info' })
    },
    onError: () => {
      // Even if logout fails on server, clear local data
      tokenManager.clearTokens()
      setUser(null)
      setOrganization(null)
      queryClient.clear()
    },
  })

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const accessToken = tokenManager.getAccessToken()
        const storedTenant = tokenManager.getTenant()
        
        if (accessToken && storedTenant) {
          setOrganization(storedTenant)
          // User will be loaded by the query
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        tokenManager.clearTokens()
      } finally {
        setIsInitialized(true)
      }
    }
    
    initializeAuth()
  }, [])

  // Update user when userData changes
  useEffect(() => {
    if (userData?.success && userData.data.user) {
      setUser(userData.data.user)
    } else if (userError) {
      // If user fetch fails, clear auth
      tokenManager.clearTokens()
      setUser(null)
      setOrganization(null)
    }
  }, [userData, userError])

  // Update organization when tenantData changes
  useEffect(() => {
    if (tenantData?.success && tenantData.data.tenant) {
      setOrganization(tenantData.data.tenant)
      tokenManager.setTenant(tenantData.data.tenant)
    }
  }, [tenantData])

  const login = async (data: LoginRequest) => {
    await loginMutation.mutateAsync(data)
  }

  const register = async (data: RegisterRequest) => {
    await registerMutation.mutateAsync(data)
  }

  const logout = async () => {
    await logoutMutation.mutateAsync()
  }

  const isLoading = 
    !isInitialized || 
    isUserLoading || 
    isTenantLoading ||
    loginMutation.isPending || 
    registerMutation.isPending || 
    logoutMutation.isPending

  const isAuthenticated = !!user && !!organization

  const value: AuthContextType = {
    user,
    organization,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}