// import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
// import { logoutThunk } from "../../store/slices/userData.slice"
import { useEffect } from "react"
import Loading from "../components/Loading";

import { Typography } from "@mui/material";

const Logout = ()=>{

    // const dispatch = useDispatch()
    // const navigate = useNavigate()

    // const isAuth = useSelector( state => state.isAuth )

    // useEffect(()=>{
    //     !isAuth && navigate("/")
    //     setTimeout(()=>{
    //         // dispatch(logoutThunk())
    //         navigate("/")
    //     },1500)
    // },[])

    return(
        <section className="logout">
            <Loading color="secondary" />
            <br></br>
            <Typography variant="body2" className="text-center" component="h2">
                Cerrando sesión.
            </Typography>
        </section>
    )
}

export default Logout