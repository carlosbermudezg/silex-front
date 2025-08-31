import { Box } from "@mui/material"
import Logo from "./Logo"
import OptionsMenu from "./OptionsMenu"

const Header = ()=>{

    return(
        <Box sx={{ position: 'relative', top: 0, left: 0, right: 0, height:'60px'}}>
            <Box sx={{ display:'flex', justifyContent:'space-between',alignItems:'center', padding:2, position: 'fixed', top: 0, left: 0, right: 0, height:'60px', zIndex:10, backgroundColor:'#29292a'}}>
                <Logo></Logo>
                <OptionsMenu></OptionsMenu>
            </Box>
        </Box>
    )
}

export default Header