import { useState } from 'react'
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material'
import { Add, Search, FilterList, Receipt } from '@mui/icons-material'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import { motion } from 'framer-motion'

// Orders module not yet implemented - API endpoints coming soon
const orders: any[] = [
  {
    id: '1',
    orderNumber: 'PO-2024-001',
    supplier: 'Tech Solutions Inc',
    date: '2024-01-15',
    status: 'pending',
    total: 2500.00,
    items: 12,
  },
  {
    id: '2',
    orderNumber: 'PO-2024-002',
    supplier: 'Global Electronics',
    date: '2024-01-14',
    status: 'received',
    total: 1800.00,
    items: 8,
  },
  {
    id: '3',
    orderNumber: 'PO-2024-003',
    supplier: 'Office Supplies Co',
    date: '2024-01-13',
    status: 'shipped',
    total: 950.00,
    items: 15,
  },
]

const OrdersPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning'
      case 'shipped': return 'info'
      case 'received': return 'success'
      case 'cancelled': return 'error'
      default: return 'default'
    }
  }

  const columns: GridColDef[] = [
    { field: 'orderNumber', headerName: 'Order Number', width: 150 },
    { field: 'supplier', headerName: 'Supplier', flex: 1, minWidth: 200 },
    { field: 'date', headerName: 'Date', width: 120 },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={getStatusColor(params.value) as any}
          size="small"
          sx={{ textTransform: 'capitalize' }}
        />
      ),
    },
    {
      field: 'total',
      headerName: 'Total',
      width: 100,
      renderCell: (params) => `$${params.value.toFixed(2)}`,
    },
    { field: 'items', headerName: 'Items', width: 80 },
  ]

  return (
    <Box sx={{ p: 3 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            Purchase Orders
          </Typography>
          <Button variant="contained" startIcon={<Add />} size="large">
            Create Order
          </Button>
        </Box>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <TextField
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
                sx={{ minWidth: 300 }}
              />
              <FormControl sx={{ minWidth: 150 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Status"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="">All Status</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="shipped">Shipped</MenuItem>
                  <MenuItem value="received">Received</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </CardContent>
        </Card>

        <Card>
          <CardContent sx={{ p: 0 }}>
            <DataGrid
              rows={orders}
              columns={columns}
              initialState={{
                pagination: { paginationModel: { page: 0, pageSize: 10 } },
              }}
              pageSizeOptions={[10, 25, 50]}
              checkboxSelection
              sx={{ border: 0 }}
            />
          </CardContent>
        </Card>
      </motion.div>
    </Box>
  )
}

export default OrdersPage