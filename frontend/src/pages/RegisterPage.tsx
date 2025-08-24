import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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
  Grid,
} from '@mui/material'
import { Visibility, VisibilityOff, Email, Lock, Person, Business } from '@mui/icons-material'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { RegisterRequest } from '@/types'

const registerSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  organizationName: z.string().min(1, 'Organization name is required'),
  organizationSlug: z.string()
    .min(3, 'Organization slug must be at least 3 characters')
    .regex(/^[a-z0-9-]+$/, 'Organization slug must contain only lowercase letters, numbers, and hyphens'),
})

type RegisterFormData = z.infer<typeof registerSchema>

const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const { register: registerUser } = useAuth()
  const navigate = useNavigate()

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      organizationName: '',
      organizationSlug: '',
    },
  })

  const organizationName = watch('organizationName')

  // Auto-generate slug from organization name
  const handleOrganizationNameChange = (name: string) => {
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
    setValue('organizationSlug', slug)
  }

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setError(null)
      await registerUser(data as RegisterRequest)
      navigate('/dashboard')
    } catch (error: any) {
      setError(error.response?.data?.error || 'Registration failed')
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
        py: 4,
      }}
    >
      <Container maxWidth="md">
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
                  Create Your Account
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Set up your organization's inventory management system
                </Typography>
              </Box>

              {/* Error Alert */}
              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}

              {/* Registration Form */}
              <form onSubmit={handleSubmit(onSubmit)}>
                <Grid container spacing={3}>
                  {/* Personal Information */}
                  <Grid item xs={12}>
                    <Typography variant="h6" sx={{ mb: 2, color: 'text.primary' }}>
                      Personal Information
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="firstName"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="First Name"
                          error={!!errors.firstName}
                          helperText={errors.firstName?.message}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Person color="action" />
                              </InputAdornment>
                            ),
                          }}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="lastName"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Last Name"
                          error={!!errors.lastName}
                          helperText={errors.lastName?.message}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Person color="action" />
                              </InputAdornment>
                            ),
                          }}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12}>
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
                  </Grid>

                  <Grid item xs={12}>
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
                  </Grid>

                  {/* Organization Information */}
                  <Grid item xs={12}>
                    <Typography variant="h6" sx={{ mb: 2, mt: 2, color: 'text.primary' }}>
                      Organization Information
                    </Typography>
                  </Grid>

                  <Grid item xs={12}>
                    <Controller
                      name="organizationName"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Organization Name"
                          error={!!errors.organizationName}
                          helperText={errors.organizationName?.message}
                          onChange={(e) => {
                            field.onChange(e)
                            handleOrganizationNameChange(e.target.value)
                          }}
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
                  </Grid>

                  <Grid item xs={12}>
                    <Controller
                      name="organizationSlug"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Organization Slug"
                          error={!!errors.organizationSlug}
                          helperText={errors.organizationSlug?.message || 'This will be used in your organization URL'}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Typography variant="body2" color="text.secondary">
                                  storeflex.com/
                                </Typography>
                              </InputAdornment>
                            ),
                          }}
                        />
                      )}
                    />
                  </Grid>
                </Grid>

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
                    mt: 4,
                    mb: 3,
                  }}
                >
                  {isSubmitting ? 'Creating Account...' : 'Create Account'}
                </Button>
              </form>

              <Divider sx={{ my: 3 }} />

              {/* Sign In Link */}
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Already have an account?{' '}
                  <Link
                    to="/login"
                    style={{
                      color: 'inherit',
                      textDecoration: 'none',
                      fontWeight: 600,
                    }}
                  >
                    <span style={{ color: '#1976d2' }}>Sign In</span>
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

export default RegisterPage