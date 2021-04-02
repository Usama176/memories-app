import React, { useContext, useEffect, useState } from 'react';
import moment from 'moment';
import { 
    Card, 
    CardContent, 
    CardMedia, 
    Menu, 
    MenuItem, 
    TextareaAutosize, 
    Typography 
} from '@material-ui/core';
import SendIcon from '@material-ui/icons/Send';
import './style_css/Home.css';
import { UserContext } from '../App';
import M from 'materialize-css';
import { Link } from 'react-router-dom';

const Home = () => {

    // Mterial ui constants for delete button
    
    const [anchorEl, setAnchorEl] = useState(null);
    const handleClick = (event) => {
      setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
      setAnchorEl(null);
    };


    const {state, dispatch} = useContext(UserContext);
    const [data, setData] = useState([]);
    const [comment, setComment] = useState("");
    const [showComments, setShowComments] =useState("");
    const [postId, setPostId] = useState("");

    // getting posts from allpost
    useEffect(  
        async() => {
            await fetch('/allpost', {
                headers:{
                    "Authorization":"Bearer " + localStorage.getItem("jwt")
                }
            })
            .then((res) => res.json())
            .then((data) => {
                setData(data.posts)
                
            })
            .catch((error) => {
                console.log(error)
            });
    },[]);

    const likePost = async (id, like)=>{
        await fetch(`/${like}` ,{
            method:"put",
            headers:{
                "Content-Type":"application/json",
                "Authorization":"Bearer "+localStorage.getItem("jwt")
            },
            body:JSON.stringify({
                postId: id
            })
        })
        .then((res) => res.json())
        .then((result) => {
            // now to add likes at realtime
            // first get the old data store in the newData run the map on it
            const newData = data.map((item)=>{
                // check with which post the liked post matches
                // then at that post add the updated likes
                if(item._id === result._id) {
                    //   to get the old likes and add new likes to them
                    return {...item, likes:result.likes}
                }
                // for other posts which doesn't matches with liked posts
                else{
                    return item
                };
            });
            // update the old data with new data
            setData(newData);
        })
        .catch((error) => {
            console.log(error)
        });
    };

    const makeComment = (text, id)=>{
        fetch('/comment',{
            method:"put",
            headers:{
                "Content-Type":"application/json",
                "Authorization":"Bearer "+localStorage.getItem("jwt")
            },
            body:JSON.stringify({
                postId: id,
                text: text
            })
        })
        .then((res) => res.json())
        .then((result) => {
            const newData = data.map((item) => {
              if(item._id == result._id){
                return {...item, comments:result.comments}
              }else{
                  return item
              };
           });
          setData(newData);
          setComment("");
        })
        .catch((error) => {
            console.log(error)
        });
    };

    
    const deletePost = (postId) => {
        fetch(`/deletepost/${postId}`, {
            method: "delete",
            headers: {
                Authorization:"Bearer "+localStorage.getItem("jwt")
            }
        })
        .then((res) => res.json())
        .then((result) => {
            const newData = data.filter((item) => {
                return item._id !== result._id
            })
            setData(newData)
        })
        .catch((error) => {
            console.log(error)
        })
    }

    return (
        <div className="home-container">
            <div className="posts-container">
                {
                    data.map((item, key) => {
                        return (
                            
                            <Card key={key} className="post-card">
                                <div className="post-card-header">
                                    <Link to=
                                        {
                                            item.postedBy._id !== state._id
                                            ?
                                            "/profile/"+item.postedBy._id
                                            :
                                            "/profile" 
                                        }
                                    >
                                        <div className="user-info">
                                            <img src={item.postedBy.pic} className="post-user-profile" alt="profile" />
                                            <h5>
                                                    {item.postedBy.name}
                                                <Typography variant="body2" color="textSecondary" component="p">
                                                    <span>
                                                        {moment(item.createdAt).calendar()}
                                                    </span>
                                                </Typography>
                                            </h5>
                                        </div>
                                    </Link>
                                    {
                                        item.postedBy._id == state._id 
                                        &&
                                        <div>
                                            <i aria-controls="simple-menu" aria-haspopup="true" onClick={handleClick} 
                                             className="bi bi-three-dots-vertical delete-button"
                                            />
                                            <Menu
                                             id="simple-menu"
                                             anchorEl={anchorEl}
                                             keepMounted
                                             open={Boolean(anchorEl)}
                                             onClose={handleClose}
                                            >
                                                <MenuItem onClick={handleClose}>
                                                    <i className="bi bi-trash"
                                                     onClick={()=>
                                                            {
                                                                deletePost(item._id)
                                                            }
                                                     }
                                                    />
                                                </MenuItem>
                                            </Menu>
                                        </div>
                                    }
                                </div>
                                {
                                    item.photo
                                    ?
                                    <>
                                        <div className="post-card-info">
                                            <h5>{item.title}</h5>
                                            <Typography variant="body2" color="textSecondary" component="h6">
                                                <h6>{item.body}</h6>
                                            </Typography>
                                        </div>
                                        <CardMedia>
                                            <img src={item.photo}/>
                                        </CardMedia>
                                    </>
                                    :
                                    <CardMedia className="post-card-without-img">
                                    <div>
                                        <h5>{item.title}</h5>
                                        <Typography variant="body2" color="textSecondary" component="h6">
                                            <h6>{item.body}</h6>
                                        </Typography>
                                    </div>
                                </CardMedia>
                                }
                                <CardContent>
                                    <Typography variant="body2" color="textSecondary" component="h6">
                                        <h6>{item.likes.length} reacts</h6>
                                    </Typography>
                                    <div className="card-icons">
                                        <div>
                                            <button onClick={()=> 
                                                {
                                                    !item.likes.includes(state._id)
                                                    ?
                                                    likePost(item._id, "likes")
                                                    :
                                                    likePost(item._id, "unlike")
                                                }
                                            }>
                                                {
                                                    item.likes.includes(state._id)
                                                    ?
                                                    <i className="bi bi-heart-fill icons heart-icon"/>
                                                    :
                                                    <i className="bi bi-heart icons heart-icon"/>
                                                }
                                            </button>
                                        </div>
                                        <button 
                                            onClick={() =>
                                                {
                                                    if(item._id == postId) {
                                                        setShowComments("")
                                                        setPostId("")
                                                    } else {
                                                        setShowComments("increase-height")
                                                        setPostId(item._id)
                                                    }
                                                    if(item.comments.length < 1){
                                                        M.toast({html: "No comments yet!", classes:"#f44336 blue"})
                                                    }
                                                }
                                            }
                                        >
                                            {
                                                item._id == postId
                                                ?
                                                <i className="bi bi-chat-fill icons"/>
                                                :
                                                <i className="bi bi-chat icons"/>
                                            }
                                        </button>
                                    </div>
                                    <div className={`comments-container ${item._id == postId ? showComments : null}`}>
                                        {
                                            item.comments.map(record=>{
                                                return(
                                                    <div key={record._id} className="comment-container">
                                                        <img src={record.postedBy.pic} className="post-user-profile"  />
                                                        <div className="name-comment-container">
                                                            <Typography variant="body2"  component="p">
                                                                <p style={{fontWeight:"600"}}>{record.postedBy.name}</p>
                                                            </Typography>
                                                            <h6 className="comment">{record.text}</h6>
                                                        </div>
                                                    </div>
                                                )
                                            })
                                        }
                                    </div>
                                    
                                    <div className="add-comment-container">
                                        
                                        <TextareaAutosize className="add-comment-input" 
                                            aria-label="empty textarea"
                                            placeholder="Add a comment"
                                            value={comment}
                                            onChange={(e)=> setComment(e.target.value)}
                                        />
                                        <SendIcon className="post-comment-button"
                                            onClick={()=> 
                                                {
                                                    comment.length > 0
                                                    ?
                                                    makeComment(comment, item._id, )
                                                    :
                                                    M.toast({html: "Comment can't be blank", classes:"#f44336 blue"})
                                                }
                                            } 
                                        />
                                            
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })
                }
            </div>
        </div>
    );
}

export default Home;
