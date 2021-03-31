const express = require('express');
const mongoose = require('mongoose');
const requireLogin = require('../middleware/requireLogin')
const router = express.Router();
const Post = mongoose.model('Post');
const User = mongoose.model('User');

mongoose.set('useFindAndModify', false);
// Display all the Posts

router.get('/allpost', requireLogin, (req, res) => {
    Post.find()
    // in postedBy we are getting an objectId so we need to populate that id inorder
    // to get the exact data and also we do not show the password and email
    // so we are only selecting the name and id
    .populate('postedBy', '_id name pic createdAt')
    .populate("comments.postedBy", "_id name pic")
    .sort('-createdAt')
    .then((posts) => {
        res.json({posts})
    })
    .catch((error) => {
        console.log(error)
    });
});

// Create Post

router.post('/createpost', requireLogin, (req, res)=> {
    const {title, body, pic} = req.body;
     if(!title && !body && !pic) {
        return res.status(422).json({ error: "Empty posts are not allowed" });
     }
     //  hiding the password
     req.user.password = undefined;
     if(!pic){
        const post = new Post({
            title,
            body,
            postedBy: req.user
        });
        post.save().then((result) => {
            res.json({post: result})
        })
        .catch((error) => {
            console.log(error)
        });
     }else{
        const post = new Post({
            title,
            photo:pic,
            body,
            postedBy: req.user
        });
        post.save().then((result) => {
            res.json({post: result})
        })
        .catch((error) => {
            console.log(error)
        });
     };
});

// Displaying the user posts on user profile

router.get('/mypost', requireLogin, (req,res)=> {
    User.findOne({_id: req.user._id})
    // don't send password to frontend
    .select("-password")
    .then((user) => {
        Post.find({postedBy:req.user._id})
        .populate("postedBy","_id name pic")
        .then((mypost)=> {
            res.json({user, mypost})
        })
    })
    .catch((err)=> {
        console.log(err)
    });
});

router.get('/getfollowingpost',requireLogin,(req,res)=>{
    // if postedBy in following
    Post.find({postedBy:{$in:req.user.followers, $in:req.user.following}})
    .populate('postedBy', '_id name pic createdAt')
    .populate("comments.postedBy", "_id name pic")
    .sort('-createdAt')
    .then((posts) => {
        res.json({posts});
    })
    .catch((error) => {
        console.log(error);
    });
});

// like functionality
// here we can also use post but it is good to use put for updating
router.put('/likes', requireLogin, (req, res) => {
    // in Post we have method findByIdAndUpdate
    // request id from client
    Post.findByIdAndUpdate(req.body.postId, {
        // push the id of the user into likes array
        $push:{likes: req.user._id}
    }, {
        // geting the updated record from monogDb
        new: true
    })
    // then execute 
    .exec((error, result) => {
        if(error) {
            return res.status(422).json({error:error})
        }else {
            res.json(result);
        };
    }); 
});

// delete like
router.put('/unlike', requireLogin, (req, res)=>{
    Post.findByIdAndUpdate(req.body.postId, {
        // pulling the user id
        $pull:{likes: req.user._id}
    }, {
        new:true
    }).exec((error, result)=>{
        if(error){
            return res.status(422).json({error:error})
        }else{
            res.json(result)
        };
    });
});

// comment functionality
router.put('/comment', requireLogin, (req, res) => {
    const comment = {
        text: req.body.text,
        postedBy: req.user._id
    }
    Post.findByIdAndUpdate(req.body.postId, {
        $push:{comments:comment}
    }, {
        new: true
    })
    .populate("comments.postedBy", "_id name pic")
    .exec((error, result) => {
        if(error){
            return res.status(422).json({error:error})
        }else{
            res.json(result)
        };
    });
}); 

// delete Post
router.delete('/deletepost/:postId', requireLogin, (req, res) => {
    Post.findOne({_id: req.params.postId})
    .populate("postedBy","_id")
    .exec((error, post) => {
        if(error || !post){
            return res.status(422).json({error: error})
        }
        else if(post.postedBy._id.toString() === req.user._id.toString()) {
            post.remove()
            .then((result) => {
                res.json(result)
            })
            .catch((error) => {
                console.log(error)
            })
        }
    });
});

module.exports = router;