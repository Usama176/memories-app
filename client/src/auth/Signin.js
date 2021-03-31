import React, { useContext, useState } from 'react';
import { useHistory } from "react-router-dom";
import { Link } from 'react-router-dom';
import M from 'materialize-css';
import './style_css/Forms.css';
import { UserContext } from '../App';

const Signin = () => {

    const {state, dispatch} = useContext(UserContext);
    const history = useHistory();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const PostData = () => {
        if(!/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(email)){
            M.toast({html: "Invalid Email", classes:"#f44336 red"});
            return;
        }
        fetch("/signin",{
            method: "post",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify({
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
                localStorage.setItem("jwt", data.token);
                // data.user is object so we have to stringify
                localStorage.setItem("user", JSON.stringify(data.user));
                // dispatching type and the user data to userReducer
                dispatch({ type: "USER", payload: data.user });
                M.toast({html: 'Signin Successfull', classes:"#66bb6a green lighten-1"});
                history.push('/');
            }
        })
        .catch((error) => {
            console.log(error);
        });
    };

    return (
       
        <div className="main-signin">
            <div className="container">
                <div className="forms-container">
                    <div className="signin-signup">
                        <div className="form">
                            <h2 className="title">Sign In</h2>
                            <input onChange={(e)=> setEmail(e.target.value)}
                                className="input-field"
                                type="email" placeholder="Enter your email"
                            />
                            <input onChange={(e)=> setPassword(e.target.value)}
                                className="input-field"
                                type="password" placeholder="Enter your password"
                            />
                            <button onClick={() => PostData()} className="btn waves-effect waves-light">Sign In</button>
                            <div className="link-container">
                                <p>
                                    Don't have an account? <span><Link className="link" to='/signup'> Sign Up</Link></span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="panels-container">
                    <div className="panel left-panel">
                        {/* <div className="content">
                            <h3>New here ?</h3>
                            <p>
                            Lorem ipsum, dolor sit amet consectetur adipisicing elit. Debitis,
                            ex ratione. Aliquid!
                            </p>
                        </div> */}
                        <div className="content signin-content">
                            <h4><span><i className="fas fa-quote-left"/></span> A good life is a collection of happy Memories</h4>
                            <h6>"Now share your memories with the family of Memories app"</h6>
                        </div>
                        <img src="img/log.svg" className="image" alt="" />
                    </div>
                    <div className="panel right-panel">
                        <div className="content">
                            <h5>Hi! You are most welcome to the </h5>
                            <h4>MEMORIES App</h4>
                            <h6>"Now share your memories with the family of Memories app"</h6>
                        </div>
                    <img src="./img/images.png" className="1ge" alt="" />
                    </div>
                </div>
            </div>
        </div>

    );
}

export default Signin;
