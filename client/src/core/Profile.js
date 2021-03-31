import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { UserContext } from '../App';
import { Typography } from '@material-ui/core';
import { PhotoCamera } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import LinearProgress from '@material-ui/core/LinearProgress';
import M from 'materialize-css';
import './style_css/Profile.css';

const useStyles = makeStyles((theme) => ({
    root: {
      width: '100%',
      '& > * + *': {
        marginTop: theme.spacing(2),
      },
    },
}));

const Profile = () => {
    
    const {state, dispatch} = useContext(UserContext);
    const [userPosts, setUserPosts] = useState([]);
    const [profileImage, setProfileImage] = useState("");
    const [cloudImgUrl, setCloudImgUrl] = useState("");
    const [imgUploadPercentage, setImgUploadPercentage] = useState(0);

    // to preview the profile image before uploading
    const imageHandler = (e) => {
        const reader = new FileReader();
        reader.onload = () => {
            if(reader.readyState === 2){
                setProfileImage(reader.result)
            }
        }
        reader.readAsDataURL(e.target.files[0])
    };

    useEffect( async () => {
        await fetch('/mypost', {
                headers:{
                    "Authorization":"Bearer "+localStorage.getItem("jwt")
                }
            })
            .then((res) => res.json())
            .then((data) => {
                console.log(data)
                setUserPosts(data.mypost);
                dispatch({
                    type:"UPDATE",
                    payload:{
                        followers:data.user.followers,
                        following:data.user.following
                    }
                })
            })
            .catch((error) => {
                console.log(error);
            });
    },[]);

    const UpdateProfile = () => {

        if(profileImage) {
            // uploading image to cloudinary
            const formData = new FormData();
            formData.append("file", profileImage);
            formData.append("upload_preset", "memorise-app");
            formData.append("cloud_name", "usamaar41");
            // for progress bar
            const options = {
                onUploadProgress: (progressEvent) => {
                    const {loaded, total} = progressEvent;
                    let percent = Math.floor(loaded * 100 / total);
                    if(percent < 100) {
                        setImgUploadPercentage(percent);
                    }
                }
            }
            // now adding API Base URL
            axios.post("https://api.cloudinary.com/v1_1/usamaar41/image/upload", formData, options)
            .then((res) => {
                setCloudImgUrl(res.data.url);
            })
            .catch((error) => {
                console.log(error);
            });
        }
    }

    useEffect( () => {
        if(cloudImgUrl){
            fetch('/updateprofile',{
                method:"put",
                headers:{
                    "Content-Type":"application/json",
                    "Authorization":"Bearer "+localStorage.getItem("jwt")
                },
                body:JSON.stringify({
                    pic:cloudImgUrl
                })
            })
            .then((res)=>res.json())
            .then((data)=>{
                if(data.error){
                    M.toast({html: data.error,classes:"#c62828 red darken-3"});
                }
                else {
                    localStorage.setItem("user", JSON.stringify({...state,pic:data.pic}))
                    dispatch({type:"UPDATEPROFILE", payload:data.pic})
                }
            })
            .catch((error)=>{
                console.log(error)
            });
        };
    },[cloudImgUrl]);

    return (
        <div className={makeStyles.root}>
            { 
                imgUploadPercentage == 0 || imgUploadPercentage == 100
                ? 
                null
                :
                <LinearProgress variant="determinate" value={imgUploadPercentage} />
            }
            <div className="profile">
                <div className="user-profile-container">
                    <div className="profile-img-container">
                        <img src={profileImage ? profileImage : state ? state.pic : null } className="profile-img" alt="profile"/>
                    </div>
                    <div className="user-info-container">
                        <h2 className="user-name">{state? state.name : "loading"}</h2>
                        <Typography variant="body2" color="textSecondary" component="h6">
                            <h6>{state? state.email : "loading"}</h6>
                        </Typography>
                        <Typography variant="body2" color="textSecondary" component="h6">
                            <div className="user-info">
                                <h6>{userPosts? userPosts.length : "Loading"} posts</h6>
                                <h6>{state? state.followers.length : "loading"} followers</h6>
                                <h6>{state? state.following.length : "loading"} following</h6>
                            </div>
                        </Typography>
                        <div className="profile-img-update-btn-container">
                            <input accept="image/*" type="file" id="image-upload"  onChange={(e) => imageHandler(e)}/>
                            <label htmlFor="image-upload">
                                <div className="upload-btn">
                                    <PhotoCamera/>
                                </div>
                            </label>
                            <button onClick={() => UpdateProfile()} className="update-btn">UPDATE PROFILE</button>
                        </div>
                    </div>
                </div>
            
                <div className="user-gallery-container">
                    {
                        userPosts.map((item, key) => {
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
        </div>
    );
}

export default Profile;
