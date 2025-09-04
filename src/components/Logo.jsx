import { useThemeContext } from '../context/ThemeContext'

const Logo = ()=>{

    const { mode } = useThemeContext()

    return(
        <section style={{
            display: 'flex',
            justifyContent:'center',
            alignItems:'center'
        }}>
            {
                mode === 'dark' ? <img width={130} src='logo-d.png'></img> : <img width={130} src='logo-l.png'></img>
            }
        </section>
    )
}

export default Logo