const mongoose = require('mongoose');
// making relation to User model
const { ObjectId } = mongoose.Schema.Types;

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
    },

    email:{
        type: String,
        required: true,
    },

    password:{
        type: String,
        required: true,
    },

    pic:{
        type: String,
        default: "https://res.cloudinary.com/usamaar41/image/upload/v1616780304/blank-profile_atbknn.png"
    },

    followers:[
        {
            type: ObjectId,
            ref: "User"
        }
    ],

    following:[
        {
            type: ObjectId,
            ref: "User"
        }
    ],
});
// default export
mongoose.model('User', userSchema);