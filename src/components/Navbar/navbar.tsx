import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
  Badge,
  Tooltip,
  Chip,
  Stack
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  Dashboard as DashboardIcon,
  DarkMode,
  LightMode
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { logout } from '../../redux/slice/userSlice';
import { useNotifications } from '../../hooks/notificationsHooks';

interface NavbarProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ darkMode, toggleDarkMode }) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notifAnchorEl, setNotifAnchorEl] = useState<null | HTMLElement>(null);
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user.currentUser);
  
  const { notifications, unreadCount, markAsRead } = useNotifications(user?.id?.toString());

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleNotifMenu = (event: React.MouseEvent<HTMLElement>) => {
    setNotifAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotifClose = () => {
    setNotifAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    dispatch(logout());
    navigate('/');
  };

  const handleNotificationClick = async (id: string) => {
    await markAsRead(id);
  };

  const getRoleColor = () => {
    switch (user?.role) {
      case 'admin': return 'error';
      case 'technicien': return 'primary';
      default: return 'default';
    }
  };

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        zIndex: 1201,
        background: darkMode 
          ? '#1e1e1e' 
          : 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        {/* Logo */}
        <Typography 
          onClick={() => navigate('/Home')} 
          variant="h6" 
          sx={{ 
            cursor: 'pointer',
            fontWeight: 700,
            letterSpacing: 1,
            color: 'white',
            '&:hover': { opacity: 0.9 }
          }}
        >
          GMAO Pro
        </Typography>

        {/* Section droite */}
        <Stack direction="row" spacing={2} alignItems="center">
          {/* Mode sombre */}
          <Tooltip title={darkMode ? 'Mode clair' : 'Mode sombre'}>
            <IconButton 
              onClick={toggleDarkMode} 
              sx={{ 
                color: 'white',
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
              }}
            >
              {darkMode ? <LightMode /> : <DarkMode />}
            </IconButton>
          </Tooltip>

          {/* Notifications */}
          <Tooltip title="Notifications">
            <IconButton 
              onClick={handleNotifMenu} 
              sx={{ 
                color: 'white',
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
              }}
            >
              <Badge badgeContent={unreadCount} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* Profil utilisateur */}
          <Tooltip title="Profil">
            <Box 
              onClick={handleMenu}
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1.5,
                cursor: 'pointer',
                px: 1.5,
                py: 0.5,
                borderRadius: 3,
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
              }}
            >
              <Avatar 
                sx={{ 
                  width: 40, 
                  height: 40,
                  bgcolor: 'success.main',
                  border: '2px solid white',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                }}
              >
                {user?.username?.charAt(0)?.toUpperCase() || 'U'}
              </Avatar>
              <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                <Typography variant="body2" sx={{ color: 'white', fontWeight: 600, lineHeight: 1.2 }}>
                  {user?.username || 'Utilisateur'}
                </Typography>
                <Chip 
                  label={user?.role || 'user'} 
                  size="small" 
                  color={getRoleColor()}
                  sx={{ 
                    height: 18, 
                    fontSize: '0.7rem',
                    '& .MuiChip-label': { px: 1, py: 0 }
                  }}
                />
              </Box>
            </Box>
          </Tooltip>

          {/* Menu Notifications */}
          <Menu
            anchorEl={notifAnchorEl}
            open={Boolean(notifAnchorEl)}
            onClose={handleNotifClose}
            PaperProps={{ 
              sx: { 
                width: 340, 
                maxHeight: 450,
                borderRadius: 2,
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                mt: 1
              } 
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <Box sx={{ p: 2, borderBottom: '1px solid #eee' }}>
              <Typography variant="subtitle1" fontWeight={600}>
                Notifications
                {unreadCount > 0 && (
                  <Chip label={`${unreadCount} non lues`} size="small" color="error" sx={{ ml: 1 }} />
                )}
              </Typography>
            </Box>
            {notifications.length === 0 ? (
              <MenuItem sx={{ justifyContent: 'center', py: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  Aucune notification
                </Typography>
              </MenuItem>
            ) : (
              notifications.slice(0, 10).map((notif: any) => (
                <MenuItem 
                  key={notif._id} 
                  onClick={() => handleNotificationClick(notif._id)}
                  sx={{ 
                    flexDirection: 'column', 
                    alignItems: 'flex-start',
                    borderLeft: notif.read ? 'none' : '3px solid #1976d2',
                    backgroundColor: notif.read ? 'inherit' : 'rgba(25,118,210,0.05)',
                    py: 1.5
                  }}
                >
                  <Typography variant="body2" fontWeight={notif.read ? 'normal' : 'bold'}>
                    {notif.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                    {notif.message}
                  </Typography>
                  <Typography variant="caption" color="text.disabled" sx={{ mt: 0.5 }}>
                    {new Date(notif.createdAt).toLocaleString()}
                  </Typography>
                </MenuItem>
              ))
            )}
          </Menu>

          {/* Menu Profil */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            PaperProps={{ 
              sx: { 
                width: 250,
                borderRadius: 2,
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                mt: 1
              }
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <Box sx={{ px: 2, py: 2, textAlign: 'center' }}>
              <Avatar 
                sx={{ 
                  width: 60, 
                  height: 60, 
                  mx: 'auto', 
                  mb: 1,
                  bgcolor: 'success.main'
                }}
              >
                {user?.username?.charAt(0)?.toUpperCase() || 'U'}
              </Avatar>
              <Typography variant="subtitle1" fontWeight={600}>
                {user?.username}
              </Typography>
              <Chip 
                label={user?.role || 'user'} 
                size="small" 
                color={getRoleColor()}
                sx={{ mt: 0.5 }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                {user?.email}
              </Typography>
            </Box>
            <Divider />
            <MenuItem onClick={() => navigate('/Profile')} sx={{ py: 1 }}>
              <ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon>
              Mon profil
            </MenuItem>
            <MenuItem onClick={() => navigate('/Home')} sx={{ py: 1 }}>
              <ListItemIcon><DashboardIcon fontSize="small" /></ListItemIcon>
              Tableau de bord
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout} sx={{ py: 1, color: 'error.main' }}>
              <ListItemIcon><LogoutIcon fontSize="small" color="error" /></ListItemIcon>
              Déconnexion
            </MenuItem>
          </Menu>
        </Stack>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;