import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Divider,
  Avatar,
  IconButton,
} from '@mui/material'
import { Edit, Save, Cancel } from '@mui/icons-material'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'

const SettingsPage = () => {
  const { user, organization } = useAuth()
  const [editMode, setEditMode] = useState(false)

  return (
    <Box sx={{ p: 3 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
          Settings
        </Typography>

        <Grid container spacing={3}>
          {/* Profile Settings */}
          <Grid item xs={12} lg={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6">Profile Settings</Typography>
                  <IconButton onClick={() => setEditMode(!editMode)}>
                    {editMode ? <Cancel /> : <Edit />}
                  </IconButton>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Avatar sx={{ width: 80, height: 80, mr: 3, fontSize: '2rem' }}>
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </Avatar>
                  <Box>
                    <Typography variant="h6">
                      {user?.firstName} {user?.lastName}
                    </Typography>
                    <Typography color="text.secondary">
                      {user?.email}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    label="First Name"
                    defaultValue={user?.firstName}
                    disabled={!editMode}
                    fullWidth
                  />
                  <TextField
                    label="Last Name"
                    defaultValue={user?.lastName}
                    disabled={!editMode}
                    fullWidth
                  />
                  <TextField
                    label="Email"
                    defaultValue={user?.email}
                    disabled={!editMode}
                    fullWidth
                  />
                  {editMode && (
                    <Button variant="contained" startIcon={<Save />}>
                      Save Changes
                    </Button>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Organization Settings */}
          <Grid item xs={12} lg={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 3 }}>
                  Organization Settings
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    label="Organization Name"
                    defaultValue={organization?.name}
                    fullWidth
                  />
                  <TextField
                    label="Organization Slug"
                    defaultValue={organization?.slug}
                    fullWidth
                    helperText="Used in URLs and API calls"
                  />
                  <TextField
                    label="Subscription Plan"
                    defaultValue={organization?.subscriptionPlan}
                    disabled
                    fullWidth
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Notification Settings */}
          <Grid item xs={12} lg={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 3 }}>
                  Notification Settings
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <FormControlLabel
                    control={<Switch defaultChecked />}
                    label="Email notifications for low stock"
                  />
                  <FormControlLabel
                    control={<Switch defaultChecked />}
                    label="Email notifications for new orders"
                  />
                  <FormControlLabel
                    control={<Switch />}
                    label="SMS notifications"
                  />
                  <FormControlLabel
                    control={<Switch defaultChecked />}
                    label="Browser push notifications"
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* System Preferences */}
          <Grid item xs={12} lg={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 3 }}>
                  System Preferences
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <FormControlLabel
                    control={<Switch defaultChecked />}
                    label="Dark mode"
                  />
                  <FormControlLabel
                    control={<Switch defaultChecked />}
                    label="Auto-save changes"
                  />
                  <FormControlLabel
                    control={<Switch />}
                    label="Compact view"
                  />
                  <TextField
                    label="Items per page"
                    defaultValue="25"
                    type="number"
                    fullWidth
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Security Settings */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 3 }}>
                  Security Settings
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      Change Password
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <TextField
                        label="Current Password"
                        type="password"
                        sx={{ flex: 1 }}
                      />
                      <TextField
                        label="New Password"
                        type="password"
                        sx={{ flex: 1 }}
                      />
                      <TextField
                        label="Confirm Password"
                        type="password"
                        sx={{ flex: 1 }}
                      />
                    </Box>
                  </Box>

                  <Divider />

                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 2 }}>
                      Two-Factor Authentication
                    </Typography>
                    <FormControlLabel
                      control={<Switch />}
                      label="Enable two-factor authentication"
                    />
                  </Box>

                  <Button variant="contained" sx={{ alignSelf: 'flex-start' }}>
                    Update Security Settings
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </motion.div>
    </Box>
  )
}

export default SettingsPage