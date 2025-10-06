import { Box } from "@mui/material"
import Logo from "./Logo"
import OptionsMenu from "./OptionsMenu"
import { useThemeContext } from "../context/ThemeContext"

const Header = ()=>{

    const { mode } = useThemeContext()

    return(
        <Box sx={{ position: 'relative', top: 0, left: 0, right: 0, height:'60px', backgroundColor: "#f6f7f8"}}>
            <Box sx={{backgroundColor: mode === 'dark' ? "#101922" :"#f6f7f8", display:'flex', justifyContent:'space-between',alignItems:'center', padding:2, position: 'fixed', top: 0, left: 0, right: 0, height:'60px', zIndex:10 }}>
                <Logo></Logo>
                <OptionsMenu></OptionsMenu>
            </Box>
        </Box>
    )
}

export default Header