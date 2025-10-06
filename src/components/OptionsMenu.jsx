import { useState } from "react"
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Brightness7, Brightness4, Logout } from "@mui/icons-material";
import {
    Button,
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
  } from '@mui/material';
import { useThemeContext } from "../context/ThemeContext";
import { useTheme } from "@mui/material/styles";

const ITEM_HEIGHT = 48;

export default function OptionsMenu() {
  const { mode, toggleTheme } = useThemeContext()
  const [openLogoutDialog, setOpenLogoutDialog] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const theme = useTheme();
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const options = [
    {
      title: mode === 'dark' ? 'Oscuro' : 'Claro',
      onclick: toggleTheme,
      icon: mode === 'dark' ? <Brightness4 color="info"></Brightness4> : <Brightness7 color="warning"></Brightness7>
    },
    {
      title:'Cerrar Sesión',
      onclick: ()=> setOpenLogoutDialog(true),
      icon: <Logout></Logout>
    }
  ];


  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <div>
      <IconButton
        aria-label="more"
        id="long-button"
        aria-controls={open ? 'long-menu' : undefined}
        aria-expanded={open ? 'true' : undefined}
        aria-haspopup="true"
        onClick={handleClick}
      >
        <MoreVertIcon />
      </IconButton>
      <Menu
        id="long-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        slotProps={{
          paper: {
            style: {
              maxHeight: ITEM_HEIGHT * 4.5,
              width: '20ch',
              backgroundColor: theme.palette.background.default
            },
          },
          list: {
            'aria-labelledby': 'long-button',
          },
        }}
      >
        {options.map((option, index) => (
          <MenuItem children={
            <Button  disabled startIcon={option.icon}>
                {option.title}
            </Button>
          } key={index} onClick={option.onclick} />
        ))}
      </Menu>
      {/* Diálogo de confirmación para salir */}
        <Dialog open={openLogoutDialog} onClose={() => setOpenLogoutDialog(false)}
          slotProps={{
            paper: {
              sx: {
                backgroundColor: theme.palette.background.default,
                color: 'white',   // opcional, para que el texto contraste
              },
            },
          }}
        >
            <DialogTitle color="textPrimary">¿Cerrar sesión?</DialogTitle>
                <DialogContent>
                    <Typography color="textPrimary">¿Estás seguro de que deseas cerrar sesión?</Typography>
                </DialogContent>
            <DialogActions>
                <Button variant="contained" onClick={() => setOpenLogoutDialog(false)} sx={{ borderColor: theme.palette.border , color: theme.palette.text.primary }}>
                Cancelar
                </Button>
                <Button onClick={handleLogout} sx={{ backgroundColor: theme.palette.red, color: "#fff" }} variant="contained">
                Cerrar
                </Button>
            </DialogActions>
        </Dialog>
    </div>
  );
}
