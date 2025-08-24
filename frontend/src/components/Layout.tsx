import { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import {
  AppBar,
  Toolbar,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  IconButton,
  Typography,
  Box,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  useTheme,
  useMediaQuery,
  Badge,
} from '@mui/material'
import {
  Menu as MenuIcon,
  Dashboard,
  Inventory,
  ShoppingCart,
  Analytics,
  Settings,
  AccountCircle,
  Logout,
  Notifications,
  Warehouse,
} from '@mui/icons-material'
import { useAuth } from '@/hooks/useAuth'
import { motion } from 'framer-motion'

const DRAWER_WIDTH = 280

const navigationItems = [
  { text: 'Dashboard', path: '/dashboard', icon: <Dashboard /> },
  { text: 'Products', path: '/products', icon: <Inventory /> },
  { text: 'Inventory', path: '/inventory', icon: <Warehouse /> },
  { text: 'Orders', path: '/orders', icon: <ShoppingCart /> },
  { text: 'Analytics', path: '/analytics', icon: <Analytics /> },
  { text: 'Settings', path: '/settings', icon: <Settings /> },
]

const Layout = () => {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [notificationAnchorEl, setNotificationAnchorEl] = useState<null | HTMLElement>(null)
  
  const { user, organization, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleProfileMenuClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = async () => {
    await logout()
    handleProfileMenuClose()
    navigate('/login')
  }

  const handleNotificationClick = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationAnchorEl(event.currentTarget)
  }

  const handleNotificationClose = () => {
    setNotificationAnchorEl(null)
  }

  const drawer = (
    <Box>
      {/* Logo and Organization */}
      <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h5" sx={{ fontWeight: 600, color: 'primary.main', mb: 1 }}>
          StoreFlex
        </Typography>
        <Typography variant="body2" color="text.secondary" noWrap>
          {organization?.name}
        </Typography>
      </Box>

      {/* Navigation */}
      <List sx={{ pt: 2 }}>
        {navigationItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ px: 1 }}>
            <ListItemButton
              onClick={() => {
                navigate(item.path)
                if (isMobile) setMobileOpen(false)
              }}
              selected={location.pathname === item.path}
              sx={{
                borderRadius: 2,
                mx: 1,
                '&.Mui-selected': {
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  '&:hover': {
                    bgcolor: 'primary.dark',
                  },
                  '& .MuiListItemIcon-root': {
                    color: 'inherit',
                  },
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 40,
                  color: location.pathname === item.path ? 'inherit' : 'text.secondary',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text}
                primaryTypographyProps={{
                  fontSize: 14,
                  fontWeight: location.pathname === item.path ? 600 : 400,
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  )

  return (
    <Box sx={{ display: 'flex' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          bgcolor: 'background.paper',
          color: 'text.primary',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
        elevation={0}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          {/* Page Title */}
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {navigationItems.find(item => item.path === location.pathname)?.text || 'StoreFlex'}
          </Typography>

          {/* Toolbar Actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton color="inherit" onClick={handleNotificationClick}>
              <Badge badgeContent={3} color="error">
                <Notifications />
              </Badge>
            </IconButton>

            <IconButton
              size="large"
              edge="end"
              onClick={handleProfileMenuOpen}
              color="inherit"
            >
              <Avatar 
                sx={{ width: 32, height: 32 }}
                src={user?.avatarUrl}
              >
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </Avatar>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="subtitle2">
            {user?.firstName} {user?.lastName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {user?.email}
          </Typography>
        </Box>
        <Divider />
        <MenuItem onClick={handleProfileMenuClose}>
          <AccountCircle sx={{ mr: 2 }} />
          Profile
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <Logout sx={{ mr: 2 }} />
          Logout
        </MenuItem>
      </Menu>

      {/* Notifications Menu */}
      <Menu
        anchorEl={notificationAnchorEl}
        open={Boolean(notificationAnchorEl)}
        onClose={handleNotificationClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{ sx: { width: 320, maxHeight: 400 } }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="h6">Notifications</Typography>
        </Box>
        <Divider />
        <MenuItem onClick={handleNotificationClose}>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              Low Stock Alert
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Wireless Mouse has only 5 units left
            </Typography>
          </Box>
        </MenuItem>
        <MenuItem onClick={handleNotificationClose}>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              New Order Received
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Order #12345 for $299.99
            </Typography>
          </Box>
        </MenuItem>
        <MenuItem onClick={handleNotificationClose}>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              Product Update
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Bluetooth Headphones price updated
            </Typography>
          </Box>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleNotificationClose} sx={{ justifyContent: 'center' }}>
          <Typography variant="body2" color="primary">
            View All Notifications
          </Typography>
        </MenuItem>
      </Menu>

      {/* Navigation Drawer */}
      <Box
        component="nav"
        sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant={isMobile ? 'temporary' : 'permanent'}
          open={isMobile ? mobileOpen : true}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile
          }}
          sx={{
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
              borderRight: '1px solid',
              borderColor: 'divider',
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          mt: 8, // Height of AppBar
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Outlet />
        </motion.div>
      </Box>
    </Box>
  )
}

export default Layout