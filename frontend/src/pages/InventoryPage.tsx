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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material'
import {
  Add,
  Search,
  FilterList,
  TrendingUp,
  TrendingDown,
  SwapHoriz,
} from '@mui/icons-material'
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid'
import { motion } from 'framer-motion'

// Inventory module not yet implemented - API endpoints coming soon
const inventory: any[] = [
  {
    id: '1',
    productName: 'Wireless Bluetooth Headphones',
    sku: 'WBH-001',
    warehouse: 'Main Warehouse',
    currentStock: 45,
    reservedStock: 5,
    availableStock: 40,
    lastMovement: '2024-01-15',
    movementType: 'IN',
  },
  {
    id: '2',
    productName: 'USB-C Charging Cable',
    sku: 'USB-C-002',
    warehouse: 'Main Warehouse',
    currentStock: 12,
    reservedStock: 2,
    availableStock: 10,
    lastMovement: '2024-01-14',
    movementType: 'OUT',
  },
  {
    id: '3',
    productName: 'Laptop Stand Adjustable',
    sku: 'LS-003',
    warehouse: 'Secondary Warehouse',
    currentStock: 0,
    reservedStock: 0,
    availableStock: 0,
    lastMovement: '2024-01-13',
    movementType: 'OUT',
  },
  {
    id: '4',
    productName: 'Wireless Mouse',
    sku: 'WM-004',
    warehouse: 'Main Warehouse',
    currentStock: 78,
    reservedStock: 8,
    availableStock: 70,
    lastMovement: '2024-01-12',
    movementType: 'IN',
  },
]

const InventoryPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [warehouseFilter, setWarehouseFilter] = useState('')
  const [adjustmentDialog, setAdjustmentDialog] = useState(false)
  const [selectedItem, setSelectedItem] = useState<any>(null)

  const getMovementIcon = (type: string) => {
    switch (type) {
      case 'IN':
        return <TrendingUp color="success" />
      case 'OUT':
        return <TrendingDown color="error" />
      case 'TRANSFER':
        return <SwapHoriz color="info" />
      default:
        return <TrendingUp />
    }
  }

  const getStockStatus = (available: number, current: number) => {
    const ratio = available / current
    if (current === 0) return { color: 'error', label: 'Out of Stock' }
    if (ratio < 0.2) return { color: 'error', label: 'Critical' }
    if (ratio < 0.5) return { color: 'warning', label: 'Low Stock' }
    return { color: 'success', label: 'Good Stock' }
  }

  const columns: GridColDef[] = [
    {
      field: 'productName',
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
      field: 'warehouse',
      headerName: 'Warehouse',
      width: 150,
    },
    {
      field: 'currentStock',
      headerName: 'Current',
      width: 100,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'reservedStock',
      headerName: 'Reserved',
      width: 100,
      renderCell: (params) => (
        <Typography variant="body2" color="warning.main">
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'availableStock',
      headerName: 'Available',
      width: 100,
      renderCell: (params) => {
        const status = getStockStatus(params.value, params.row.currentStock)
        return (
          <Typography 
            variant="body2" 
            color={`${status.color}.main`}
            sx={{ fontWeight: 500 }}
          >
            {params.value}
          </Typography>
        )
      },
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => {
        const status = getStockStatus(params.row.availableStock, params.row.currentStock)
        return (
          <Chip
            label={status.label}
            color={status.color as any}
            size="small"
            variant="outlined"
          />
        )
      },
    },
    {
      field: 'lastMovement',
      headerName: 'Last Movement',
      width: 150,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {getMovementIcon(params.row.movementType)}
          <Typography variant="body2">
            {params.value}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 120,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<Add />}
          label="Adjust Stock"
          onClick={() => {
            setSelectedItem(params.row)
            setAdjustmentDialog(true)
          }}
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
            Inventory Management
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            size="large"
            sx={{ px: 3 }}
          >
            Stock Adjustment
          </Button>
        </Box>

        {/* Summary Cards */}
        <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
          <Card sx={{ flex: 1 }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary" sx={{ fontWeight: 600 }}>
                {inventory.reduce((sum, item) => sum + item.currentStock, 0)}
              </Typography>
              <Typography color="text.secondary">
                Total Stock Units
              </Typography>
            </CardContent>
          </Card>
          <Card sx={{ flex: 1 }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main" sx={{ fontWeight: 600 }}>
                {inventory.reduce((sum, item) => sum + item.availableStock, 0)}
              </Typography>
              <Typography color="text.secondary">
                Available Stock
              </Typography>
            </CardContent>
          </Card>
          <Card sx={{ flex: 1 }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="warning.main" sx={{ fontWeight: 600 }}>
                {inventory.reduce((sum, item) => sum + item.reservedStock, 0)}
              </Typography>
              <Typography color="text.secondary">
                Reserved Stock
              </Typography>
            </CardContent>
          </Card>
          <Card sx={{ flex: 1 }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="error.main" sx={{ fontWeight: 600 }}>
                {inventory.filter(item => item.availableStock === 0).length}
              </Typography>
              <Typography color="text.secondary">
                Out of Stock Items
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Filters and Search */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
              <TextField
                placeholder="Search inventory..."
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
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>Warehouse</InputLabel>
                <Select
                  value={warehouseFilter}
                  label="Warehouse"
                  onChange={(e) => setWarehouseFilter(e.target.value)}
                >
                  <MenuItem value="">All Warehouses</MenuItem>
                  <MenuItem value="Main Warehouse">Main Warehouse</MenuItem>
                  <MenuItem value="Secondary Warehouse">Secondary Warehouse</MenuItem>
                </Select>
              </FormControl>
              <Button
                variant="outlined"
                startIcon={<FilterList />}
              >
                More Filters
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Inventory Table */}
        <Card>
          <CardContent sx={{ p: 0 }}>
            <DataGrid
              rows={inventory}
              columns={columns}
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

        {/* Stock Adjustment Dialog */}
        <Dialog open={adjustmentDialog} onClose={() => setAdjustmentDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            Stock Adjustment - {selectedItem?.productName}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                label="Current Stock"
                value={selectedItem?.currentStock || 0}
                disabled
                fullWidth
              />
              <TextField
                label="Adjustment Quantity"
                type="number"
                placeholder="Enter positive or negative number"
                fullWidth
                helperText="Positive numbers increase stock, negative numbers decrease stock"
              />
              <TextField
                label="Reason"
                multiline
                rows={3}
                placeholder="Enter reason for adjustment..."
                fullWidth
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAdjustmentDialog(false)}>
              Cancel
            </Button>
            <Button 
              variant="contained" 
              onClick={() => {
                setAdjustmentDialog(false)
                setSelectedItem(null)
              }}
            >
              Apply Adjustment
            </Button>
          </DialogActions>
        </Dialog>
      </motion.div>
    </Box>
  )
}

export default InventoryPage