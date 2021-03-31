const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../keys');
const mongoose = require('mongoose');
const User = mongoose.model('User');

module.exports = (req, res, next) => {

    const {authorization} = req.headers;

    if(!authorization) {
        return res.status(401).json({ error: "You must be logged in" });
    }

    const token = authorization.replace("Bearer ", "");

    jwt.verify(token, JWT_SECRET, (error, payload) => {
        if(error) {
            return res.status(401).json({ error: "You must be logged in" });
        }
        const {_id} = payload;
        // const userData = async () => {
             User.findById(_id).then((userData) => {
                req.user = userData;
                // to run the next middleware or to run the next code
                next();
            })
            
        // }
        // userData();
    });

};