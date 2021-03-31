import React, { useContext, useEffect, useState } from 'react';
import { Typography } from '@material-ui/core';
import './style_css/Profile.css';
import { UserContext } from '../App';
import { useParams } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import LinearProgress from '@material-ui/core/LinearProgress';

// for material ui progressbar
const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    '& > * + *': {
      marginTop: theme.spacing(2),
    },
  },
}));

const UsersProfile = () => {
    
    const {user_id} = useParams();
    const {state, dispatch} = useContext(UserContext);
    const [userProfile, setUserProfile] = useState(null);
    const [showfollow, setShowFollow] = useState(state? state.following.includes(user_id):true);

    useEffect( async ()=>{
        await (`/user/${user_id}`, {
            headers:{
                "Authorization":"Bearer "+localStorage.getItem("jwt")
            }
        })
        .then((res) => res.json())
        .then((data) => {
            setUserProfile(data);
        })
        .catch((error) => {
            console.log(error)
        });
    },[]);

    const followUser = async () =>  {
        await fetch('/follow', {
            method:"put",
            headers:{
                "Content-Type":"application/json",
                "Authorization":"Bearer "+localStorage.getItem('jwt')
            },
            body:JSON.stringify({followId:user_id})
        })
        .then((res) => res.json())
        .then((data) => {
            dispatch({
                type:"UPDATE",
                payload:{
                    followers:data.followers,
                    following:data.following
                }
            })
            localStorage.setItem("user", JSON.stringify(data))
            // now we need to update the user info in real time
            // so we are calling a call method which will give us the previous state
            setUserProfile((prevState) => {
                return {
                    // spread the previous state
                    ...prevState,
                    // now overwrite the user feiled with updated record
                    user:{
                        // spread previous state
                        ...prevState.user,
                        // overwrite the follower array
                        followers:[...prevState.user.followers, data._id]
                    }
                };
            })
            setShowFollow(true);
        })
        .catch((error) => {
            console.log(error);
        });
    };

    const unfollowUser = async () => {
        await fetch('/unfollow', {
            method:"put",
            headers:{
                "Content-Type":"application/json",
                "Authorization":"Bearer "+localStorage.getItem('jwt')
            },
            body:JSON.stringify({unfollowId: user_id})
        })
        .then((res) => res.json())
        .then((data) => {
            dispatch({
                type:"UPDATE",
                payload:{
                    followers:data.followers,
                    following:data.following
                }
            })
            localStorage.setItem("user", JSON.stringify(data))
            setUserProfile((prevState)=>{
                const newFollower = prevState.user.followers
                // now filtering the array on the basis of condition
                // that if the id of the item is not equal to the ids
                // which we are getting from the backend then remove that item's id
                .filter((item) => item !== data._id)
                return {
                    ...prevState,
                    user:{
                       ...prevState.user,
                       followers:newFollower
                    }
                };
             })
             setShowFollow(false);
        })
        .catch((error) => {
            console.log(error);
        });
    };

    return (
        <>
            {
                userProfile
                ?
                <div className="profile">
                    <div className="user-profile-container">
                        <div className="profile-img-container">
                            <img className="profile-img" src={userProfile.user.pic}/>
                        </div>
                        <div className="user-info-container">
                            <h2 className="user-name">{userProfile.user.name}</h2>
                            <Typography variant="body2" component="h6">
                                <h6>{userProfile.user.email}</h6>
                            </Typography>
                            <Typography variant="body2" color="textSecondary" component="h6">
                                <div className="user-info">
                                    <h6>{userProfile.posts.length} posts</h6>
                                    <h6>{userProfile.user.followers.length} followers</h6>
                                    <h6>{userProfile.user.following.length} following</h6>
                                </div>
                            </Typography>
                            {
                                showfollow
                                ?
                                <button className="follow-btn" onClick={()=>unfollowUser()}>Unfollow</button>
                                :
                                <button className="follow-btn" onClick={()=>followUser()}>Follow</button>
                            }
                        </div>
                    </div>

                    <div className="user-gallery-container">
                        {
                            userProfile.posts.map((item, key) => {
                                return(
                                    !item.photo
                                    ?
                                    null
                                    :
                                    <img className={"gallery-img"} src={item.photo} key={item._id} alt={item.title}/>
                                )
                            })
                        }
                    </div>
                </div>
                :
                <div className={makeStyles.root}>
                    <LinearProgress />
                </div>
            }
        </>
    );
}

export default UsersProfile;