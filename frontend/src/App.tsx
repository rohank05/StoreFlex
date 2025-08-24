import { Routes, Route, Navigate } from 'react-router-dom'
import { Box } from '@mui/material'

// Pages
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import ProductsPage from './pages/ProductsPage'
import InventoryPage from './pages/InventoryPage'
import OrdersPage from './pages/OrdersPage'
import AnalyticsPage from './pages/AnalyticsPage'
import SettingsPage from './pages/SettingsPage'

// Components
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import LoadingScreen from './components/LoadingScreen'

// Hooks
import { useAuth } from './hooks/useAuth'

function App() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return <LoadingScreen />
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Routes>
        {/* Public routes */}
        <Route 
          path="/login" 
          element={
            !user ? <LoginPage /> : <Navigate to="/dashboard" replace />
          } 
        />
        <Route 
          path="/register" 
          element={
            !user ? <RegisterPage /> : <Navigate to="/dashboard" replace />
          } 
        />

        {/* Protected routes */}
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="inventory" element={<InventoryPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* Catch all - redirect to dashboard if authenticated, login otherwise */}
        <Route 
          path="*" 
          element={
            <Navigate to={user ? "/dashboard" : "/login"} replace />
          } 
        />
      </Routes>
    </Box>
  )
}

export default App