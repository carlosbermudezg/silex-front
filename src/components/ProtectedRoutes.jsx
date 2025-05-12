import { Navigate, Outlet } from "react-router-dom"

const ProtectedRoutes = ({children, redirectTo = '/login', isAuth})=>{
    if(!isAuth){
        return <Navigate to={redirectTo} />
    }
    return children ? children : <Outlet />
}

export default ProtectedRoutes