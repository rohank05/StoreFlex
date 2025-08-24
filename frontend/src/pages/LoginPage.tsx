import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
  Divider,
  Container,
} from '@mui/material'
import { Visibility, VisibilityOff, Email, Lock, Business } from '@mui/icons-material'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { LoginRequest } from '@/types'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  tenantSlug: z.string().optional(),
})

type LoginFormData = z.infer<typeof loginSchema>

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  
  const from = location.state?.from?.pathname || '/dashboard'

  // Navigate to dashboard when user becomes authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true })
    }
  }, [isAuthenticated, navigate, from])

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      tenantSlug: '',
    },
  })

  const onSubmit = async (data: LoginFormData) => {
    try {
      setError(null)
      await login(data as LoginRequest)
      // Navigation will happen via useEffect when isAuthenticated becomes true
    } catch (error: any) {
      setError(error.response?.data?.error || 'Login failed')
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        bgcolor: 'grey.50',
        backgroundImage: 'radial-gradient(circle, rgba(25,118,210,0.05) 1px, transparent 1px)',
        backgroundSize: '20px 20px',
      }}
    >
      <Container maxWidth="sm">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card
            sx={{
              p: 4,
              borderRadius: 3,
              boxShadow: '0 8px 40px rgba(0,0,0,0.12)',
            }}
          >
            <CardContent>
              {/* Header */}
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 700,
                    color: 'primary.main',
                    mb: 1,
                  }}
                >
                  StoreFlex
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 500, mb: 1 }}>
                  Welcome Back
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Sign in to your inventory management dashboard
                </Typography>
              </Box>

              {/* Error Alert */}
              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}

              {/* Login Form */}
              <form onSubmit={handleSubmit(onSubmit)}>
                <Box sx={{ mb: 3 }}>
                  <Controller
                    name="email"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Email Address"
                        type="email"
                        error={!!errors.email}
                        helperText={errors.email?.message}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Email color="action" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                  />
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Controller
                    name="password"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Password"
                        type={showPassword ? 'text' : 'password'}
                        error={!!errors.password}
                        helperText={errors.password?.message}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Lock color="action" />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => setShowPassword(!showPassword)}
                                edge="end"
                              >
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                  />
                </Box>

                <Box sx={{ mb: 4 }}>
                  <Controller
                    name="tenantSlug"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Organization (Optional)"
                        error={!!errors.tenantSlug}
                        helperText={errors.tenantSlug?.message || 'Leave empty if you only belong to one organization'}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Business color="action" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                  />
                </Box>

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={isSubmitting}
                  sx={{
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    mb: 3,
                  }}
                >
                  {isSubmitting ? 'Signing In...' : 'Sign In'}
                </Button>
              </form>

              <Divider sx={{ my: 3 }} />

              {/* Sign Up Link */}
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Don't have an account?{' '}
                  <Link
                    to="/register"
                    style={{
                      color: 'inherit',
                      textDecoration: 'none',
                      fontWeight: 600,
                    }}
                  >
                    <span style={{ color: '#1976d2' }}>Sign Up</span>
                  </Link>
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </motion.div>
      </Container>
    </Box>
  )
}

export default LoginPage