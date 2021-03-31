import React,{ useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import axios from 'axios';
import { PhotoCamera } from '@material-ui/icons';
import M from 'materialize-css';
import './style_css/CreatePost.css';
import { makeStyles } from '@material-ui/core/styles';
import LinearProgress from '@material-ui/core/LinearProgress';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
  },
}));

const CreatePost = () => {

    const history = useHistory();
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [image, setImage] = useState("");
    const [cloudImgUrl, setCloudImgUrl] = useState("");
    const [imgUploadPercentage, setImgUploadPercentage] = useState(0);

    // to preview the profile image before uploading
    const imageHandler = (e) => {
        const reader = new FileReader();
        reader.onload = () => {
            if(reader.readyState === 2){
                setImage(reader.result)
            }
        }
        reader.readAsDataURL(e.target.files[0])
    };
    
    const PostDetails = () => {
        if(image) {
            // uploading image to cloudinary
            const formData = new FormData();
            // our file is in the image variable
            // append image to file and file to data
            formData.append("file", image);
            // now appending cloudinary to our formData
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
                setImgUploadPercentage(100, () => {
                    setTimeout(() => {
                        setImgUploadPercentage(0)
                    }, 500);
                });
            })
            .catch((error) => {
                console.log(error);
            });
        }
        
        else {
            fetch("/createpost", {
                method: "post",
                headers: {
                    "Content-Type":"application/json",
                    "Authorization":"Bearer "+localStorage.getItem("jwt")
                },
                body:JSON.stringify({
                    title,
                    body
                })
            })
            .then((res) => res.json())
            .then((data) => {
                if(data.error){
                    M.toast({html: data.error, classes:"#f44336 red"})
                }
                else{
                    M.toast({html: "Post created successfully", classes:"#66bb6a green lighten-1"});
                    history.push('/');
                }
            })
            .catch((error) => {
                console.log(error);
            });
        };
    };

    useEffect( () => {
        if(cloudImgUrl){
            fetch("/createpost",{
                method:"post",
                headers:{
                    "Content-Type":"application/json",
                    "Authorization":"Bearer "+localStorage.getItem("jwt")
                },
                body:JSON.stringify({
                    title,
                    body,
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
                    history.push('/');
                }
            })
            .catch((error)=>{
                console.log(error)
            });
        };
     },[cloudImgUrl]);

   return(
    <>
        <div className={makeStyles.root}>
            { imgUploadPercentage > 0 
            && 
            <LinearProgress variant="determinate" value={imgUploadPercentage} /> 
            }
        </div>
        <div className="create-post-container">
             <div className="input-filed create-post-card">
                 <h4>What's on your mind?</h4>
                 <input type="text" placeholder="title of your post"
                   value={title}
                   onChange={(e) => setTitle(e.target.value)}
                 />
                 <input type="text" placeholder="say something about your post"
                   value={body}
                   onChange={(e) => setBody(e.target.value)}
                 />
                <div className="img-img-upload-btn-container">
                    <img src={image ? image : "https://res.cloudinary.com/usamaar41/image/upload/v1617188233/download_svoifd.png"} />
                    <div className="choose-img-btn-container">
                       <input accept="image/*" type="file" id="image-upload"  onChange={(e) => imageHandler(e)}/>
                       <label htmlFor="image-upload" className="choose-img-btn-container" >
                           <div className="choose-img-btn">
                               <PhotoCamera/>
                               <p>Choose Photo</p>
                           </div>
                       </label>
                    </div>
                </div>
                <button onClick={()=>PostDetails()} className="submit-post-btn">Submit Post</button>
             </div>
        </div>
    </>
   )       
};


export default CreatePost;