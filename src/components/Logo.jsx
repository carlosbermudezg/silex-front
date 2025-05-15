import { useState } from "react";

const Logo = ()=>{

    const [mode, setMode] = useState(localStorage.getItem('darkMode'))

    window.addEventListener('localStorageChange', () => {
        setMode(localStorage.getItem('darkMode'))
    });

    return(
        <section style={{
            display: 'flex',
            justifyContent:'center',
            alignItems:'center',
            marginBottom:10
        }}>
            {
                mode == 'true' ? <img width={150} src='logo-d.png'></img> : <img width={150} src='logo-l.png'></img>
            }
        </section>
    )
}

export default Logo