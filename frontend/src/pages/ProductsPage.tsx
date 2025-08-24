import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  Chip,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material'
import {
  Add,
  Search,
  FilterList,
  MoreVert,
  Edit,
  Delete,
  Visibility,
} from '@mui/icons-material'
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid'
import { motion } from 'framer-motion'
import { productsApi } from '@/services/api'
import { useAuth } from '@/hooks/useAuth'
import { formatCurrency, useOrganizationCurrency } from '@/utils/currency'


const ProductsPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  
  const { organization } = useAuth()
  const organizationCurrency = useOrganizationCurrency()
  
  // Fetch products from API
  const { data: productsResponse, isLoading, error } = useQuery({
    queryKey: ['products', organization?.id],
    queryFn: productsApi.getProducts,
    enabled: !!organization?.id,
  })
  
  // Use API data
  const products = productsResponse?.data?.products || []

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success'
      case 'low_stock':
        return 'warning'
      case 'out_of_stock':
        return 'error'
      default:
        return 'default'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'In Stock'
      case 'low_stock':
        return 'Low Stock'
      case 'out_of_stock':
        return 'Out of Stock'
      default:
        return status
    }
  }

  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Product Name',
      flex: 2,
      minWidth: 250,
    },
    {
      field: 'sku',
      headerName: 'SKU',
      width: 120,
      fontFamily: 'monospace',
    },
    {
      field: 'category',
      headerName: 'Category',
      width: 130,
    },
    {
      field: 'price',
      headerName: 'Price',
      width: 100,
      renderCell: (params) => formatCurrency(params.value, organizationCurrency),
    },
    {
      field: 'stock',
      headerName: 'Stock',
      width: 80,
      renderCell: (params) => (
        <Typography
          variant="body2"
          color={params.value === 0 ? 'error' : params.value < 20 ? 'warning.main' : 'text.primary'}
          sx={{ fontWeight: 500 }}
        >
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={getStatusLabel(params.value)}
          color={getStatusColor(params.value) as any}
          size="small"
          variant="outlined"
        />
      ),
    },
    {
      field: 'lastUpdated',
      headerName: 'Last Updated',
      width: 120,
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 120,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<Visibility />}
          label="View"
          onClick={() => console.log('View', params.id)}
        />,
        <GridActionsCellItem
          icon={<Edit />}
          label="Edit"
          onClick={() => console.log('Edit', params.id)}
        />,
        <GridActionsCellItem
          icon={<Delete />}
          label="Delete"
          onClick={() => console.log('Delete', params.id)}
        />,
      ],
    },
  ]

  return (
    <Box sx={{ p: 3 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            Products
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            size="large"
            sx={{ px: 3 }}
          >
            Add Product
          </Button>
        </Box>

        {/* Filters and Search */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <TextField
                placeholder="Search products..."
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
              <Button
                variant="outlined"
                startIcon={<FilterList />}
                onClick={(e) => setAnchorEl(e.currentTarget)}
              >
                Filters
              </Button>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
              >
                <MenuItem onClick={() => setAnchorEl(null)}>All Products</MenuItem>
                <MenuItem onClick={() => setAnchorEl(null)}>In Stock</MenuItem>
                <MenuItem onClick={() => setAnchorEl(null)}>Low Stock</MenuItem>
                <MenuItem onClick={() => setAnchorEl(null)}>Out of Stock</MenuItem>
              </Menu>
            </Box>
          </CardContent>
        </Card>

        {/* Products Table */}
        <Card>
          <CardContent sx={{ p: 0 }}>
            <DataGrid
              rows={products}
              columns={columns}
              loading={isLoading}
              initialState={{
                pagination: {
                  paginationModel: { page: 0, pageSize: 10 },
                },
              }}
              pageSizeOptions={[10, 25, 50]}
              checkboxSelection
              disableRowSelectionOnClick
              sx={{
                border: 0,
                '& .MuiDataGrid-cell': {
                  borderColor: 'divider',
                },
                '& .MuiDataGrid-columnHeaders': {
                  bgcolor: 'grey.50',
                  borderBottom: '2px solid',
                  borderColor: 'divider',
                },
              }}
            />
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
          <Card sx={{ flex: 1 }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary" sx={{ fontWeight: 600 }}>
                {products.length}
              </Typography>
              <Typography color="text.secondary">
                Total Products
              </Typography>
            </CardContent>
          </Card>
          <Card sx={{ flex: 1 }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main" sx={{ fontWeight: 600 }}>
                {products.filter(p => p.status === 'active').length}
              </Typography>
              <Typography color="text.secondary">
                In Stock
              </Typography>
            </CardContent>
          </Card>
          <Card sx={{ flex: 1 }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="warning.main" sx={{ fontWeight: 600 }}>
                {products.filter(p => p.status === 'low_stock').length}
              </Typography>
              <Typography color="text.secondary">
                Low Stock
              </Typography>
            </CardContent>
          </Card>
          <Card sx={{ flex: 1 }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="error.main" sx={{ fontWeight: 600 }}>
                {products.filter(p => p.status === 'out_of_stock').length}
              </Typography>
              <Typography color="text.secondary">
                Out of Stock
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </motion.div>
    </Box>
  )
}

export default ProductsPage