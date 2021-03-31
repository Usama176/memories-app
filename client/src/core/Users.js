import React, { useContext, useEffect, useRef, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { UserContext } from '../App';
import './style_css/Users.css';
import { Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import LinearProgress from '@material-ui/core/LinearProgress';

// for material ui progressbar
const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
  },
}));

const Users = () => {

  const {state, dispatch} = useContext(UserContext);
  const [search,setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);

  useEffect(() => {
        fetch('/users', {
            headers:{
                "Authorization":"Bearer " + localStorage.getItem("jwt")
            }
        })
        .then((res) => res.json())
        .then((data) => {
            setUsers(data)
        })
        .catch((error) => {
            console.log(error)
        })
  }, [])

  const searchUsers = (e) => {
    setSearch(e);
    if (search !== "") {
      const newUserList = users.filter((user) => {
        return (
          user.name.toLowerCase().includes(search.toLowerCase())
          ||
          user.email.toLowerCase().includes(search.toLowerCase())
        )
      });
      setFilteredUsers(newUserList);
    }
    else {
      setUsers(users);
    };
  };

    return (
      <>
        {
          !users
          ?
          <div className={makeStyles.root}>
              <LinearProgress />
          </div>
          :
          <div className="users-container">
            <input 
              type="text"
              placeholder="Search users"
              value={search}
              onChange={(e) => searchUsers(e.target.value)}
            /> 
            <ul>
              {
                search == 0 
                ?
                users.map(item=>{
                  return (
                    <div>
                      {
                        item._id == state._id
                        ?
                        null
                        :
                        <NavLink to={`/profile/${item._id}`}>
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
                :
                filteredUsers.map(item=>{
                  return (
                    <div>
                      {
                        item._id == state._id
                        ?
                        null
                        :
                        <NavLink to={`/profile/${item._id}`}>
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
        }
      </>
    )
};

export default Users;