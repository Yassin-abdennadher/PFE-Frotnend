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
  Tooltip
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Logout as LogoutIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { logout } from '../../redux/slice/userSlice';
import { useNotifications } from '../../hooks/notificationsHooks';

const Navbar: React.FC = () => {
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
    // Optionnel: naviguer vers l'intervention concernée
  };

  return (
    <AppBar position="fixed" sx={{ zIndex: 1201 }}>
      <Toolbar>
        <Typography onClick={() => navigate('/Home')} variant="h6" sx={{ flexGrow: 1, cursor: 'pointer' }}>
          GMAO Pro
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Bouton Notifications */}
          <IconButton color="inherit" onClick={handleNotifMenu}>
            <Badge badgeContent={unreadCount} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>

          {/* Menu Notifications */}
          <Menu
            anchorEl={notifAnchorEl}
            open={Boolean(notifAnchorEl)}
            onClose={handleNotifClose}
            PaperProps={{ sx: { width: 320, maxHeight: 400 } }}
          >
            {notifications.length === 0 ? (
              <MenuItem>Aucune notification</MenuItem>
            ) : (
              notifications.slice(0, 10).map((notif : any) => (
                <MenuItem 
                  key={notif._id} 
                  onClick={() => handleNotificationClick(notif._id)}
                  sx={{ whiteSpace: 'normal', flexDirection: 'column', alignItems: 'flex-start' }}
                >
                  <Typography variant="body2" fontWeight={notif.read ? 'normal' : 'bold'}>
                    {notif.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {notif.message}
                  </Typography>
                  <Typography variant="caption" color="text.disabled">
                    {new Date(notif.createdAt).toLocaleDateString()}
                  </Typography>
                </MenuItem>
              ))
            )}
          </Menu>

          {/* Avatar utilisateur */}
          <IconButton onClick={handleMenu} color="inherit">
            <Avatar sx={{ width: 32, height: 32 }}>
              {user?.username?.charAt(0)?.toUpperCase() || 'U'}
            </Avatar>
          </IconButton>

          {/* Menu profil */}
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
            <Box sx={{ px: 2, py: 1 }}>
              <Typography variant="subtitle1">{user?.username}</Typography>
              <Typography variant="subtitle2">{user?.role?.toUpperCase()}</Typography>
              <Typography variant="caption" color="text.secondary">{user?.email}</Typography>
            </Box>
            <Divider />
            <MenuItem onClick={() => navigate('/Profile')}>
              <ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon>
              Profil
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <ListItemIcon><LogoutIcon fontSize="small" /></ListItemIcon>
              Déconnexion
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;