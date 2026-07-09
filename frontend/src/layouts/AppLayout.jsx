import { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import ApartmentRoundedIcon from '@mui/icons-material/ApartmentRounded';
import WorkspacePremiumRoundedIcon from '@mui/icons-material/WorkspacePremiumRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import CraneIcon from '../components/icons/CraneIcon';
import { useAuth } from '../hooks/useAuth';
import logoBlanco from '../assets/branding/logo-tecport-blanco.webp';

const DRAWER_WIDTH = 248;

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: <DashboardRoundedIcon /> },
  { to: '/operadores', label: 'Operadores', icon: <GroupsRoundedIcon /> },
  { to: '/empresas', label: 'Empresas', icon: <ApartmentRoundedIcon /> },
  { to: '/equipos', label: 'Equipos', icon: <CraneIcon /> },
  { to: '/certificaciones', label: 'Certificaciones', icon: <WorkspacePremiumRoundedIcon /> },
];

function AppLayout() {
  const { adminProfile, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(() => (typeof window === 'undefined' ? true : window.innerWidth >= 900));
  const [confirmLogoutOpen, setConfirmLogoutOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState(null);

  const confirmarLogout = () => {
    setConfirmLogoutOpen(false);
    logout();
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {sidebarOpen && (
        <Drawer
          variant="permanent"
          sx={{
            width: DRAWER_WIDTH,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
              bgcolor: 'primary.main',
              color: 'white',
              border: 'none',
            },
          }}
        >
          <Toolbar sx={{ px: 2, py: 2.5, position: 'relative', display: 'flex', justifyContent: 'center' }}>
            <Box component="img" src={logoBlanco} alt="TECPORT" sx={{ height: 42, width: 'auto' }} />
            <IconButton
              onClick={() => setSidebarOpen(false)}
              size="small"
              sx={{ position: 'absolute', right: 8, top: 8, color: 'rgba(255,255,255,0.7)' }}
            >
              <CloseRoundedIcon fontSize="small" />
            </IconButton>
          </Toolbar>
          <List sx={{ px: 1.5 }}>
            {NAV_ITEMS.map((item) => {
              const active = location.pathname.startsWith(item.to);
              return (
                <ListItemButton
                  key={item.to}
                  component={NavLink}
                  to={item.to}
                  onClick={() => {
                    if (window.innerWidth < 900) setSidebarOpen(false);
                  }}
                  sx={{
                    borderRadius: 1,
                    mb: 0.5,
                    color: 'rgba(255,255,255,0.75)',
                    transition: 'background-color 0.15s ease, color 0.15s ease',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.08)', color: 'white' },
                    ...(active && {
                      bgcolor: 'rgba(255,255,255,0.14)',
                      color: 'white',
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.18)' },
                    }),
                  }}
                >
                  <ListItemIcon sx={{ color: 'inherit', minWidth: 36 }}>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: active ? 700 : 500, fontSize: '0.9rem' }} />
                </ListItemButton>
              );
            })}
          </List>
        </Drawer>
      )}

      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <AppBar
          position="sticky"
          color="inherit"
          elevation={0}
          sx={{ borderBottom: '1px solid', borderColor: 'divider' }}
        >
          <Toolbar sx={{ justifyContent: 'space-between', gap: 1 }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
              {!sidebarOpen && (
                <IconButton onClick={() => setSidebarOpen(true)} size="small">
                  <MenuRoundedIcon />
                </IconButton>
              )}
              <Typography variant="body2" color="text.secondary" noWrap sx={{ display: { xs: 'none', sm: 'block' } }}>
                Panel administrativo
              </Typography>
            </Stack>

            <IconButton onClick={(e) => setMenuAnchor(e.currentTarget)} size="small" sx={{ flexShrink: 0 }}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '0.85rem' }}>
                {adminProfile?.nombre?.charAt(0) ?? '?'}
              </Avatar>
            </IconButton>
            <Menu
              anchorEl={menuAnchor}
              open={Boolean(menuAnchor)}
              onClose={() => setMenuAnchor(null)}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              <Box sx={{ px: 2, py: 1, minWidth: 180 }}>
                <Typography variant="body2" fontWeight={700} color="primary.main" noWrap>
                  {adminProfile?.nombre}
                </Typography>
              </Box>
              <Divider />
              <MenuItem
                onClick={() => {
                  setMenuAnchor(null);
                  setConfirmLogoutOpen(true);
                }}
              >
                <ListItemIcon>
                  <LogoutRoundedIcon fontSize="small" />
                </ListItemIcon>
                Cerrar sesión
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>

        <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, md: 4 } }}>
          <Outlet />
        </Box>
      </Box>

      <Dialog open={confirmLogoutOpen} onClose={() => setConfirmLogoutOpen(false)} maxWidth="xs" fullWidth>
        <IconButton
          onClick={() => setConfirmLogoutOpen(false)}
          size="small"
          sx={{ position: 'absolute', right: 8, top: 8, color: 'text.secondary' }}
        >
          <CloseRoundedIcon fontSize="small" />
        </IconButton>
        <DialogContent sx={{ pt: 5, pb: 2, textAlign: 'center' }}>
          <Typography variant="subtitle1" fontWeight={600}>
            ¿Estás seguro de que deseas cerrar sesión?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1.5, justifyContent: 'center' }}>
          <Button variant="outlined" color="inherit" onClick={() => setConfirmLogoutOpen(false)}>
            Cancelar
          </Button>
          <Button variant="contained" color="primary" onClick={confirmarLogout}>
            Sí, cerrar sesión
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default AppLayout;
