const mongoose = require('mongoose');
// making relation to User model
const { ObjectId } = mongoose.Schema.Types;

const postSchema = new mongoose.Schema({
    title: {
        type: String
    },
    body: {
        type: String
    },
    photo: {
        type: String
    },
    likes:[
        {
            type: ObjectId,
            ref: "User"
        }
    ],
    comments:[
        {
            text: String,
            postedBy:{
                type: ObjectId,
                ref: "User"
            }
        }
    ],
    postedBy: {
        type: ObjectId,
        ref: 'User',
    }
},{timestamps:true});

mongoose.model("Post", postSchema);