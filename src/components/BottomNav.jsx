import React from 'react';
import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import { HomeFilled, CreditCard, PeopleAltOutlined } from '@mui/icons-material';
import MoneyOffIcon from '@mui/icons-material/MoneyOff';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { useNavigate, useLocation } from 'react-router-dom';
import { useThemeContext } from '../context/ThemeContext';
import { useTheme } from '@mui/material/styles';

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme()
  const { mode } = useThemeContext()

  const handleChange = (event, newValue) => {
    navigate(newValue);
  };

  const navItems = [
    { label: 'Inicio', icon: <HomeFilled />, path: '/home' },
    // { label: 'Clientes', icon: <PeopleAltOutlined />, path: '/clientes' },
    { label: 'Créditos', icon: <CreditCard />, path: '/creditos' },
    { label: 'Gastos', icon: <MoneyOffIcon />, path: '/gastos' },
    { label: 'Caja', icon: <AccountBalanceWalletIcon />, path: '/caja' },
  ];

  return (
    <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1201, borderTop:`1px solid ${ theme.palette.border }`}}>
      <BottomNavigation value={location.pathname} onChange={handleChange} showLabels sx={{backgroundColor: theme.palette.background.default}}>
        {navItems.map((item) => (
          <BottomNavigationAction
            key={item.path}
            label={item.label}
            icon={item.icon}
            value={item.path}
            sx={{
              color: mode === 'dark' ? '#b0bec5' : '#555', // color normal
              gap: 0.5,
              '&.Mui-selected': {
                color: '#1e88e5', // 💙 color cuando está seleccionado
              },
            }}
          />
        ))}
      </BottomNavigation>
    </Paper>
  );
};

export default BottomNav;
