import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material'
import { TrendingUp, Inventory, ShoppingCart, AttachMoney } from '@mui/icons-material'
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
  Cell,
  AreaChart,
  Area
} from 'recharts'
import { motion } from 'framer-motion'
import { useState } from 'react'

const salesData = [
  { month: 'Jan', sales: 15000, orders: 120, profit: 4500 },
  { month: 'Feb', sales: 18000, orders: 140, profit: 5400 },
  { month: 'Mar', sales: 22000, orders: 180, profit: 6600 },
  { month: 'Apr', sales: 19000, orders: 160, profit: 5700 },
  { month: 'May', sales: 25000, orders: 200, profit: 7500 },
  { month: 'Jun', sales: 28000, orders: 220, profit: 8400 },
]

const categoryPerformance = [
  { name: 'Electronics', value: 40, sales: 45000, color: '#1976d2' },
  { name: 'Accessories', value: 30, sales: 32000, color: '#9c27b0' },
  { name: 'Office Supplies', value: 20, sales: 28000, color: '#2e7d32' },
  { name: 'Others', value: 10, sales: 15000, color: '#ed6c02' },
]

const topProducts = [
  { name: 'Wireless Headphones', sales: 1200, revenue: 48000 },
  { name: 'Laptop Stand', sales: 900, revenue: 35000 },
  { name: 'USB Cable', sales: 800, revenue: 12000 },
  { name: 'Mouse Pad', sales: 600, revenue: 8000 },
]

const AnalyticsPage = () => {
  const [timeRange, setTimeRange] = useState('6m')

  return (
    <Box sx={{ p: 3 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            Analytics & Reports
          </Typography>
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              label="Time Range"
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <MenuItem value="1m">1 Month</MenuItem>
              <MenuItem value="3m">3 Months</MenuItem>
              <MenuItem value="6m">6 Months</MenuItem>
              <MenuItem value="1y">1 Year</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Grid container spacing={3}>
          {/* Sales Trend */}
          <Grid item xs={12} lg={8}>
            <Card sx={{ height: 400 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Sales & Orders Trend
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="sales"
                      stackId="1"
                      stroke="#1976d2"
                      fill="#1976d2"
                      fillOpacity={0.3}
                      name="Sales ($)"
                    />
                    <Area
                      type="monotone"
                      dataKey="profit"
                      stackId="2"
                      stroke="#2e7d32"
                      fill="#2e7d32"
                      fillOpacity={0.3}
                      name="Profit ($)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Category Performance */}
          <Grid item xs={12} lg={4}>
            <Card sx={{ height: 400 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Category Performance
                </Typography>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={categoryPerformance}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {categoryPerformance.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <Box sx={{ mt: 2 }}>
                  {categoryPerformance.map((category) => (
                    <Box key={category.name} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            bgcolor: category.color,
                            borderRadius: '50%',
                            mr: 1,
                          }}
                        />
                        <Typography variant="body2">{category.name}</Typography>
                      </Box>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        ${category.sales.toLocaleString()}
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
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Top Products by Revenue
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={topProducts} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={100} />
                    <Tooltip />
                    <Bar dataKey="revenue" fill="#1976d2" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Monthly Orders */}
          <Grid item xs={12} lg={6}>
            <Card sx={{ height: 400 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Monthly Orders
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
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
        </Grid>
      </motion.div>
    </Box>
  )
}

export default AnalyticsPage