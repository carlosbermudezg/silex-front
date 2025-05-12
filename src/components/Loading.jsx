import CircularProgress from '@mui/material/CircularProgress';

const Loading = ({color})=>{
    return(
        <CircularProgress color={color} style={{alignSelf:'center'}} />
    )
}

export default Loading