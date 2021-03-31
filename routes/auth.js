const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../keys');
const router = express.Router();
const User = mongoose.model('User');
const requireLogin = require('../middleware/requireLogin');

router.get('/protected', requireLogin, (req, res) => {
    res.send("You are logged in")
});

// Signup
router.post('/signup', (req, res) => {
    const { name, email, password, pic } = req.body;

    if(!name) {
        return res.status(422).json({ error: "Name is required" });
    } else if(!email) {
        return res.status(422).json({ error: "Email is required" });
    } else if(!password) {
        return res.status(422).json({ error: "Password is required" });
    }

    // quering database

    User.findOne({ email: email })
    .then((savedUser) => {
        if(savedUser) {
            return res.status(422).json({ error: "This email already exists" });
        }
        // hashing password using bcryptjs
        bcrypt.hash(password, 10)
        .then((hashedPassword) => {
            const user = new User({
                name,
                email,
                // hashing password before saving it db
                password: hashedPassword,
                pic: pic
            });
            // calling save method from User model
            user.save()
            .then((user) => {
                res.json({ message: "Welcome to MEMORIES" })
            })
            .catch((error) => {
                console.log(error);
            });
        });        
    })
    .catch((error) => {
        console.log(error);
    });

});

// Signin
router.post('/signin', (req, res) => {
    const { email, password} = req.body;

    if(!email) {
        return res.status(422).json({ error: "Email is required" });
    } else if(!password) {
        return res.status(422).json({ error: "Password is required" });
    }

    // quering database
    
    User.findOne({ email: email })
    .then((savedUser) => {
        if(!savedUser) {
            return res.status(422).json({ error: "Invalid email or password" });
        }
        bcrypt.compare(password, savedUser.password)
        .then((doMatch) => {
            if(doMatch){
                // craeting a json web token on the basis of user id
                const userToken = jwt.sign({_id: savedUser._id}, JWT_SECRET);
                const { _id, name, email, pic, followers, following } = savedUser;
                res.json({token: userToken, user: { _id, email, name, pic, followers, following }});
            }
            else {
                return res.status(422).json({ error: "Invalid email or password" });
            };
        })
        .catch((error) => {
            console.log(error);
        });
    });
});

module.exports = router;