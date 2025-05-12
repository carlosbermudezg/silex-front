import { Outlet } from "react-router-dom"
import BottomNav from "../components/BottomNav"

const MainLayout = ()=>{
    return(
        <>
            <Outlet></Outlet>
            <BottomNav></BottomNav>
        </>
    )
}
export default MainLayout