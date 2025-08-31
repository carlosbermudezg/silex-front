import { useState } from "react"
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Logout, ToggleOn } from "@mui/icons-material";
import {
    Button,
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
  } from '@mui/material';

const ITEM_HEIGHT = 48;

export default function OptionsMenu() {
  const [openLogoutDialog, setOpenLogoutDialog] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const options = [
    {
      title:'Cambiar tema',
      onclick: '',
      icon: <ToggleOn></ToggleOn>
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
        <Dialog open={openLogoutDialog} onClose={() => setOpenLogoutDialog(false)}>
            <DialogTitle>¿Cerrar sesión?</DialogTitle>
                <DialogContent>
                    <Typography>¿Estás seguro de que deseas cerrar sesión?</Typography>
                </DialogContent>
            <DialogActions>
                <Button onClick={() => setOpenLogoutDialog(false)} color="primary">
                Cancelar
                </Button>
                <Button onClick={handleLogout} color="error" variant="contained">
                Cerrar
                </Button>
            </DialogActions>
        </Dialog>
    </div>
  );
}
