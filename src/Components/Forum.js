import { auth, db } from "../firebase";
import { doc, setDoc, getDoc } from "@firebase/firestore";
import React, { useEffect, useState } from "react";
import axios from "axios";
import {backendApi} from "../config/baseUrl";
import { CryptoState } from "../CryptoContext";
import {
    Typography,
    List,
    ListItem,
    Divider,
    makeStyles,
    TextField,
    Button,
    Container
  } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
    container: {
      width: "100%",
      height: "100%",
      marginTop: "48px",
      [theme.breakpoints.down("md")]: {
        width: "100%",
        height: "90vh",
      },
    },
    listItem: {
        marginTop: "16px",
        marginBottom: "16px",
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 5,
    },
    TextField: {
        width: "100%"
    },
    button: {
        backgroundColor: 'rgb(238, 188, 29)',
        marginTop: '16px',
    },
    created_by: {
        alignSelf: 'flex-end'
    },
    upper_text: {
        display: 'flex',
        justifyContent: 'space-between',
        padding: 0
    }
}));
  
const Forum = (symbol) => {
    const [comments, setComments] = useState([])
    const [textValue, setTextValue] = useState('')
    var coinCreatedOnComments = false
    const classes = useStyles();
    const { user, setAlert } = CryptoState();

    const getCoinForum = async () => {
        const result = await axios.get(backendApi+"/comments")
        if(result) {
            const coinComments = result.data.map((coinObj)=> 
            { 
                if(coinObj.id===symbol.symbol){
                setComments(coinObj['comment'])
                coinCreatedOnComments=true
            } 
            })
            if(coinCreatedOnComments==false) {
                const createCoinComment = await axios.post(backendApi+'/comments', {id:symbol.symbol, comment:[]})
                setComments(createCoinComment.data['comment'])
            }
        }
        console.log(comments)
    }
    useEffect(()=>{
        getCoinForum()
    },[textValue])

    const getComments = () => {
        return <React.Fragment>
            {comments.map((comment)=> {
                return (
                    <React.Fragment>
                <ListItem className={classes.listItem}>
                    <Container className={classes.upper_text}>
                    <Typography variant="body">{comment.text}</Typography>
                    <h5>created on :- {comment.date}</h5>
                    </Container>
                    <h5 className={classes.created_by}>created By :- {comment.created_by}</h5>
                </ListItem>
                <Divider />
                </React.Fragment>
                )
            })}
        </React.Fragment>
    }
    const submitComment = async() => {
        if (user) {
            let current_date = new Date()
            var formatted_date = `${current_date.getDate()}/${current_date.getMonth()+1}/${current_date.getFullYear()}`
            const username = user.displayName
            const submit_comment = await axios.patch(backendApi+`/comments/${symbol.symbol}`,{comment: [...comments, {text:textValue,created_by:username,date:formatted_date}], id: symbol.symbol})
            setTextValue("")
        }
        else {
            setAlert({open: true,
                message: 'please login to comment',
                type: "error"
            })
            
        }
    }
    return <div className={classes.container}>
        <Typography variant="h4" align="left" component="h4">Comments</Typography>
        <List
            sx={{
                width: '100%',
                maxWidth: 360,
                bgcolor: 'background.paper',
            }}
        >
            {getComments()}
        </List>
        <TextField label="comment your thought"
          multiline
          maxRows={4}
          value={textValue}
          onChange={(evt)=> {setTextValue(evt.target.value)}}
          className={classes.TextField}/>
        <Button variant="contained" className={classes.button} onClick={submitComment}>Submit</Button>

    </div>
}

export default Forum;