import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  LinearProgress,
  IconButton,
} from '@mui/material'
import {
  TrendingUp,
  TrendingDown,
  Inventory,
  ShoppingCart,
  Warning,
  AttachMoney,
  ArrowUpward,
  ArrowDownward,
  MoreVert,
} from '@mui/icons-material'
import { motion } from 'framer-motion'
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { dashboardApi } from '@/services/api'
import { useAuth } from '@/hooks/useAuth'
import { formatCurrency, useOrganizationCurrency } from '@/utils/currency'

const categoryData = [
  { name: 'Electronics', value: 40, color: '#1976d2' },
  { name: 'Accessories', value: 30, color: '#9c27b0' },
  { name: 'Components', value: 20, color: '#2e7d32' },
  { name: 'Others', value: 10, color: '#ed6c02' },
]

const DashboardPage = () => {
  const { organization } = useAuth()
  const organizationCurrency = useOrganizationCurrency()

  // Fetch dashboard stats
  const { data: dashboardStats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard', 'stats', organization?.id],
    queryFn: dashboardApi.getStats,
    enabled: !!organization?.id,
  })

  // Fetch trends data
  const { data: trendsData, isLoading: trendsLoading } = useQuery({
    queryKey: ['dashboard', 'trends', organization?.id],
    queryFn: dashboardApi.getTrends,
    enabled: !!organization?.id,
  })

  const stats = dashboardStats?.data?.stats ? [
    {
      title: 'Total Products',
      value: dashboardStats.data.stats.totalProducts.toString(),
      change: '+0%',
      trend: 'up',
      icon: <Inventory />,
      color: 'primary',
    },
    {
      title: 'Low Stock Items',
      value: dashboardStats.data.stats.lowStockItems.toString(),
      change: '0',
      trend: dashboardStats.data.stats.lowStockItems > 0 ? 'down' : 'up',
      icon: <Warning />,
      color: 'warning',
    },
    {
      title: 'Total Orders',
      value: dashboardStats.data.stats.totalOrders.toString(),
      change: '+0%',
      trend: 'up',
      icon: <ShoppingCart />,
      color: 'success',
    },
    {
      title: 'Inventory Value',
      value: formatCurrency(dashboardStats.data.stats.totalInventoryValue, organizationCurrency),
      change: '+0%',
      trend: 'up',
      icon: <AttachMoney />,
      color: 'info',
    },
  ] : []

  const inventoryData = trendsData?.data?.trends || []
  const topProducts = dashboardStats?.data?.topProducts || []
  const recentActivities = dashboardStats?.data?.recentActivity || []

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'stock':
        return <Inventory />
      case 'order':
        return <ShoppingCart />
      case 'warning':
        return <Warning />
      case 'product':
        return <Inventory />
      default:
        return <Inventory />
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'stock':
        return 'primary'
      case 'order':
        return 'success'
      case 'warning':
        return 'warning'
      case 'product':
        return 'info'
      default:
        return 'default'
    }
  }

  return (
    <Box sx={{ p: 3 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
          Dashboard Overview
        </Typography>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {stats.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={stat.title}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  sx={{
                    height: '100%',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      transition: 'transform 0.3s ease-in-out',
                    },
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar
                        sx={{
                          bgcolor: `${stat.color}.main`,
                          mr: 2,
                        }}
                      >
                        {stat.icon}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography color="text.secondary" variant="body2">
                          {stat.title}
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 600 }}>
                          {stat.value}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {stat.trend === 'up' ? (
                        <ArrowUpward color="success" sx={{ mr: 1, fontSize: 16 }} />
                      ) : (
                        <ArrowDownward color="error" sx={{ mr: 1, fontSize: 16 }} />
                      )}
                      <Typography
                        variant="body2"
                        color={stat.trend === 'up' ? 'success.main' : 'error.main'}
                        sx={{ fontWeight: 500 }}
                      >
                        {stat.change} this month
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={3}>
          {/* Inventory Trend Chart */}
          <Grid item xs={12} lg={8}>
            <Card sx={{ height: 400 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Inventory Value Trend
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={inventoryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#1976d2" 
                      strokeWidth={3}
                      name="Inventory Value ($)"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="orders" 
                      stroke="#9c27b0" 
                      strokeWidth={3}
                      name="Orders"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Category Distribution */}
          <Grid item xs={12} lg={4}>
            <Card sx={{ height: 400 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Category Distribution
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <Box sx={{ mt: 2 }}>
                  {categoryData.map((category) => (
                    <Box key={category.name} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          bgcolor: category.color,
                          borderRadius: '50%',
                          mr: 1,
                        }}
                      />
                      <Typography variant="body2" sx={{ flex: 1 }}>
                        {category.name}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {category.value}%
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Top Products */}
          <Grid item xs={12} lg={6}>
            <Card sx={{ height: 400 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6">
                    Top Products
                  </Typography>
                  <IconButton>
                    <MoreVert />
                  </IconButton>
                </Box>
                <List>
                  {topProducts.map((product, index) => (
                    <ListItem key={product.name} sx={{ px: 0 }}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          {index + 1}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={product.name}
                        secondary={`${product.sold} sold • $${product.revenue.toLocaleString()}`}
                      />
                      <Box sx={{ textAlign: 'right' }}>
                        {product.trend === 'up' ? (
                          <TrendingUp color="success" />
                        ) : (
                          <TrendingDown color="error" />
                        )}
                      </Box>
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Recent Activities */}
          <Grid item xs={12} lg={6}>
            <Card sx={{ height: 400 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Recent Activities
                </Typography>
                <List>
                  {recentActivities.map((activity) => (
                    <ListItem key={activity.id} sx={{ px: 0 }}>
                      <ListItemAvatar>
                        <Avatar 
                          sx={{ 
                            bgcolor: `${getActivityColor(activity.type)}.main`,
                            width: 32,
                            height: 32,
                          }}
                        >
                          {getActivityIcon(activity.type)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={activity.action}
                        secondary={`${activity.item} • ${activity.time}`}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </motion.div>
    </Box>
  )
}

export default DashboardPage