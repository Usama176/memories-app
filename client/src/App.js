import React, { createContext, useState, useEffect, useReducer, useContext } from 'react';
import { Route, useHistory, useLocation } from 'react-router-dom';
import { intitialState, reducer } from './reducer/userReducer';
import './App.css';
import Home from './core/Home';
import Signin from './auth/Signin';
import Navbar from './core/Navbar';
import Profile from './core/Profile';
import Signup from './auth/Signup';
import CreatePost from './core/CreatePost';
import UsersProfile from './core/UsersProfile';
import FollowingsPosts from './core/FollowingsPosts';
import Users from './core/Users';

export const UserContext = createContext();

// Routing component contains all the routers
const Routing = () => {
  const history = useHistory();
  // if the user is not logged out and close the app
  // in this case our state is going to destroy
  const {state, dispatch} = useContext(UserContext);

  useEffect(() => {
    // we need to convert the user to object by using parse
    const user = JSON.parse(localStorage.getItem("user"));   
    if(user) {
    // now updating user state
    dispatch({ type: "USER", payload: user })
  }
    else{ history.push('/signin')}
  },[]);

  return(
    <>
      <Route path='/signin'>
        <Signin/>
      </Route>
      <Route path='/signup'>
        <Signup/>
      </Route>
      <Route exact path='/'>
        <Home/>
      </Route>
      <Route exact path='/profile'>
        <Profile/>
      </Route>
      <Route path='/createpost'>
        <CreatePost/>
      </Route>
      <Route path='/followingsposts'>
        <FollowingsPosts />
      </Route>
      <Route path='/profile/:user_id'>
        <UsersProfile/>
      </Route>
      <Route path='/users'>
        <Users />
      </Route>
    </>
  )
};

// Main functional component
function App() {
  const location = useLocation();
  const [state, dispatch] = useReducer(reducer, intitialState);
  
  return (
    <div className="App">
      <UserContext.Provider value={{state, dispatch}}>
        {
          location.pathname=='/signup'||location.pathname=='/signin'
          ?
          null
          :
          <Navbar className="navbar-container"/>
        }
        <Routing/>
      </UserContext.Provider>
    </div>
  );
};

export default App;
