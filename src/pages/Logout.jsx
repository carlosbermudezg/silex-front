import Loading from "../components/Loading";

import { Typography } from "@mui/material";

const Logout = ()=>{

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