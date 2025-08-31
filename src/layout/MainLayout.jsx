import { Outlet } from "react-router-dom"
import BottomNav from "../components/BottomNav"
import Header from "../components/Header"

const MainLayout = ()=>{
    return(
        <>
            <Header></Header>
            <Outlet></Outlet>
            <BottomNav></BottomNav>
        </>
    )
}
export default MainLayout