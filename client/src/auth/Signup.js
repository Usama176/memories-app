import React, {useEffect, useState, } from 'react';
import { Link, useHistory } from 'react-router-dom';
import axios from 'axios';
import { PhotoCamera } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import LinearProgress from '@material-ui/core/LinearProgress';
import M from 'materialize-css';
import './style_css/Forms.css';
import { IconButton } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
    root: {
      width: '100%',
      '& > * + *': {
        marginTop: theme.spacing(2),
      },
    },
}));

const Signup = () => {

    const history = useHistory();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [profileImage, setProfileImage] = useState("");
    const [cloudImgUrl, setCloudImgUrl] = useState(undefined);
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

    const PostData = () => {
        if(!/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(email)){
            M.toast({html: "Invalid Email", classes:"#f44336 red"});
            return;
        }
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
                    console.log(percent)
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
        else {
            if(!/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(email)){
                M.toast({html: "Invalid Email", classes:"#f44336 red"});
                return;
            }
            fetch("/signup", {
                method:"post",
                headers: {
                    "Content-Type":"application/json"
                },
                body:JSON.stringify({
                    name:name,
                    email,
                    password
                })
            })
            .then((res) => res.json())
            .then((data) => {
                if(data.error){
                    M.toast({html: data.error, classes:"#f44336 red"})
                }
                else{
                    M.toast({html: "Account created successfully", classes:"#66bb6a green lighten-1"});
                    history.push('/signin');
                }

            })
            .catch((error) => {
                console.log(error);
            });
        };
    };

    useEffect( () => {
        if(cloudImgUrl){
            fetch("/signup",{
                method:"post",
                headers:{
                    "Content-Type":"application/json",
                    "Authorization":"Bearer "+localStorage.getItem("jwt")
                },
                body:JSON.stringify({
                    name:name,
                    email,
                    password,
                    pic:cloudImgUrl
                })
            })
            .then((res)=>res.json())
            .then((data)=>{
                if(data.error){
                    M.toast({html: data.error,classes:"#c62828 red darken-3"});
                }
                else{
                    M.toast({html:"Post Created Successfully",classes:"#43a047 green darken-1"});
                    history.push('/signin');
                }
            })
            .catch((error)=>{
                console.log(error)
            });
        };
    },[cloudImgUrl]);

    return (
        
        <div className={makeStyles.root}>
            { imgUploadPercentage > 0 
            && 
            <LinearProgress variant="determinate" value={imgUploadPercentage} /> 
            }
            <div className="main">
                <div className="container sign-up-mode">
                    <div className="forms-container">
                        <div className="signin-signup">
                            <div className="form">
                                <div className="img-and-upload-btn-container">
                                    <div className="profile-img-container">
                                        <img src={profileImage.length > 0 ? profileImage : "https://res.cloudinary.com/usamaar41/image/upload/v1616780304/blank-profile_atbknn.png"} className="profile-img" alt="profile"/>
                                    </div>
                                    <div>
                                        <input accept="image/*" type="file" id="image-upload"  onChange={(e) => imageHandler(e)}/>
                                        <label className="img-upload-btn-container" htmlFor="image-upload">
                                            <IconButton color="primary" aria-label="upload picture" component="span">
                                                <PhotoCamera className="img-upload-btn"/>
                                            </IconButton>
                                        </label>
                                    </div>
                                </div>
                                <input type="text" placeholder="Your Good Name"
                                    className="input-field"
                                    value={name}
                                    onChange={(e)=> setName(e.target.value)}
                                />
                                <input type="text" placeholder="e.g johndoe@provider.com"
                                    className="input-field"
                                    value={email}
                                    onChange={(e)=> setEmail(e.target.value)}
                                />

                                <input type="password" placeholder="Set your password"
                                    className="input-field"
                                    value={password}
                                    onChange={(e)=> setPassword(e.target.value)}
                                />
                                <button disabled={imgUploadPercentage > 0 && true} onClick={() => PostData()} className="btn waves-effect waves-light">
                                    Sign Up
                                </button>
                                <div className="link-container">
                                    <p>Already have an account? <span><Link className="link" exact to='/signin'> Sign In</Link></span></p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="panels-container">
                        <div className="panel left-panel">
                            <div className="content">
                                <h3>New here ?</h3>
                                <p>
                                Lorem ipsum, dolor sit amet consectetur adipisicing elit. Debitis,
                                ex ratione. Aliquid!
                                </p>
                                <button className="btn transparent" id="sign-up-btn">
                                Sign up
                                </button>
                            </div>
                            <img src="img/log.svg" className="image" alt="" />
                        </div>
                        <div className="panel right-panel">
                            <div className="content signup-content">
                                <h4><span><i className="fas fa-quote-left"/></span> A good life is a collection of happy Memories</h4>
                                <h6>"Now share your memories with the family of Memories app"</h6>
                           </div>
                           <img src="./img/images.png" className="1ge" alt="" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Signup;
