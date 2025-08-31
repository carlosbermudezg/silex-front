import React from 'react';
import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import PaidIcon from '@mui/icons-material/Paid';
import MoneyOffIcon from '@mui/icons-material/MoneyOff';
import { People } from '@mui/icons-material';
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
    { label: 'Clientes', icon: <People />, path: '/clientes' },
    { label: 'Créditos', icon: <PaidIcon />, path: '/creditos' },
    { label: 'Gastos', icon: <MoneyOffIcon />, path: '/gastos' },
    // { label: 'Caja', icon: <AccountBalanceWalletIcon />, path: '/caja' },
  ];

  return (
    <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1201, borderTop:'1px solid #1e88e5'}} elevation={3}>
      <BottomNavigation value={location.pathname} onChange={handleChange} showLabels sx={{backgroundColor:'#212121', floodColor:'red'}}>
        {navItems.map((item) => (
          <BottomNavigationAction
            key={item.path}
            label={item.label}
            icon={item.icon}
            value={item.path}
            sx={{color:'#bdbdbd'}}
          />
        ))}
      </BottomNavigation>
    </Paper>
  );
};

export default BottomNav;
