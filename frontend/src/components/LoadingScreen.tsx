import { Box, CircularProgress, Typography } from '@mui/material'
import { motion } from 'framer-motion'

const LoadingScreen = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        bgcolor: 'background.default',
      }}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={60} sx={{ mb: 3 }} />
          <Typography variant="h6" color="text.secondary">
            Loading StoreFlex...
          </Typography>
        </Box>
      </motion.div>
    </Box>
  )
}

export default LoadingScreen