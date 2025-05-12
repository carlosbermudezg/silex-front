import React from 'react';
import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import PaidIcon from '@mui/icons-material/Paid';
import MoneyOffIcon from '@mui/icons-material/MoneyOff';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { useNavigate, useLocation } from 'react-router-dom';

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleChange = (event, newValue) => {
    navigate(newValue);
  };

  const navItems = [
    { label: 'Inicio', icon: <HomeIcon />, path: '/home' },
    { label: 'Créditos', icon: <PaidIcon />, path: '/creditos' },
    { label: 'Gastos', icon: <MoneyOffIcon />, path: '/gastos' },
    { label: 'Caja', icon: <AccountBalanceWalletIcon />, path: '/caja' },
  ];

  return (
    <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1201 }} elevation={3}>
      <BottomNavigation value={location.pathname} onChange={handleChange} showLabels>
        {navItems.map((item) => (
          <BottomNavigationAction
            key={item.path}
            label={item.label}
            icon={item.icon}
            value={item.path}
          />
        ))}
      </BottomNavigation>
    </Paper>
  );
};

export default BottomNav;
