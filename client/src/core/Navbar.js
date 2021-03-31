import React, { useContext, useEffect, useRef, useState } from 'react';
import { NavLink, useHistory } from 'react-router-dom';
import { UserContext } from '../App';
import './style_css/Navbar.css';
import { Typography } from '@material-ui/core';
import M from 'materialize-css';

const Navbar = () => {

  const history = useHistory();
  const {state, dispatch} = useContext(UserContext);
  const searchModal = useRef(null)
  const [search,setSearch] = useState('')
  const [userDetails,setUserDetails] = useState([])

  useEffect(()=>{
    M.Modal.init(searchModal.current)
  },[])

  const logout = () => {
    localStorage.clear();
    dispatch({type: "CLEAR"});
    history.push('/signin');
  };

  const fetchUsers = (query) => {
    setSearch(query)
    fetch('/search-users',{
      method:"post",
      headers:{
        "Content-Type":"application/json"
      },
      body:JSON.stringify({
        query
      })
    })
    .then(res=>res.json())
    .then(results=>{
      setUserDetails(results.user)
    })
  }

    return (
        <div className="navbar-container">
          <div className="navbar">
            <div className="navbar-logo-container">
              <NavLink className='links logo' to='/'>Memories</NavLink>
              <div className="search-logout-container">
                <i data-target="modal1" className="bi bi-search modal-trigger search-logout-btn"/>
                <i onClick={()=> logout()} className="bi bi-box-arrow-right search-logout-btn"/>
              </div>
            </div>
            <ul id="navbar-ul" className="navbar-ul">
              <li>
                <NavLink exact activeClassName="selected" className="links" to="/">
                  <i className="bi bi-house nav-icons"/>
                </NavLink>
              </li>
              <li>
                <NavLink exact activeClassName="selected" className="links" to="/createpost">
                  <i className="bi bi-plus-circle nav-icons"/>
                </NavLink>
              </li>
              <li>
                <NavLink exact activeClassName="selected" className="links" to="/followingsposts">
                  <i className="bi bi-collection nav-icons"/>
                </NavLink>
              </li>
              <li>
                <NavLink exact activeClassName="selected" className="links" to="/users">
                  <i className="bi bi-person-lines-fill nav-icons"/>
                </NavLink>
              </li>
              <li>
                <NavLink to="/profile" exact activeClassName="selected" className="links profile-link">
                  <img className='nav-user-profile' src={state && state.pic} />
                </NavLink>
              </li>
            </ul>
          </div>

          <div id="modal1" class="modal" ref={searchModal} style={{color:"black"}}>
            <div className="modal-content">
              <input
                type="text"
                placeholder="Search users"
                value={search}
                onChange={(e)=>fetchUsers(e.target.value)}
              />
              <ul>
                {
                  userDetails.map(item=>{
                    return (
                      <div>
                        {
                          item._id == state._id
                          ?
                          null
                          :
                          <NavLink to={`/profile/${item._id}`} 
                            onClick={()=>{
                              M.Modal.getInstance(searchModal.current).close()
                              setSearch('')
                            }
                          }>
                            <div className="search-user-container">
                              <img src={item.pic} />
                              <li >
                                {item.name}
                                <Typography variant="body2" color="textSecondary" component="p">
                                  <span>{item.email}</span>
                                </Typography>
                              </li>
                            </div>
                          </NavLink> 
                        }
                      </div>
                    )
                  })
                }
              </ul>
            </div>
            <div className="modal-footer">
              <button className="modal-close waves-effect waves-green btn-flat" onClick={()=>setSearch('')}>close</button>
            </div>
          </div>
        </div>
    )
};

export default Navbar;