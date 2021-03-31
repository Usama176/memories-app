const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const requireLogin = require('../middleware/requireLogin');
const Post = mongoose.model('Post');
const User = mongoose.model('User');

router.get('/user/:id', requireLogin, (req, res) => {
    User.findOne({_id: req.params.id})
    // don't send password to frontend
    .select("-password")
    .then((user) => {
         Post.find({postedBy: req.params.id})
         .populate("postedBy","_id name")
         .exec((error,posts) => {
            if(error) {
               return res.status(422).json({error:error});
            }
            res.json({user, posts});
         })
    }).catch((error)=>{
        return res.status(404).json({error:"User not found"})
    });
});

router.put('/updateprofile', requireLogin, (req,res) => {
    User.findByIdAndUpdate(req.user._id,{$set:{pic:req.body.pic}},
        {new:true},
        (error, result) => {
         if(error){
             return res.status(422).json({error:"Cannot update profile pic"})
         }
         res.json(result)
    });
});

router.put('/follow', requireLogin, (req, res) => {
    User.findByIdAndUpdate(req.body.followId, {
        $push:{followers: req.user._id}
    },{
        new: true
    },(error,result) => {
        if(error) {
            return res.status(422).json({error:error});
        };
        User.findByIdAndUpdate(req.user._id, {
            $push: {following: req.body.followId}
        },
        {
          new:true
        })
        .select("-password")
        .then((result) => {
          res.json(result);
        })
        .catch((error) => {
          return res.status(422).json({error:error});
        });
    }
)});

router.put('/unfollow', requireLogin, (req, res) => {
    User.findByIdAndUpdate(req.body.unfollowId, {
        $pull:{followers: req.user._id}
    },{
        new:true
    },(error, result) => {
        if(error){
            return res.status(422).json({error:error});
        };
        User.findByIdAndUpdate(req.user._id,{
            $pull: {following: req.body.unfollowId}
        },
        {
            new:true
        })
        .select("-password")
        .then((result) => {
          res.json(result);
        })
        .catch((error) => {
          return res.status(422).json({error:error});
        });
    }
)});

router.post('/search-users', (req,res)=>{
    let userPattern = new RegExp("^"+req.body.query)
    User.find({name:{$regex:userPattern}})
    .select("_id name email pic")
    .then((user) => {
        res.json({user});
    })
    .catch((error) => {
        console.log(error);
    });
});

router.get('/users', requireLogin, (req,res)=>{
    User.find()
    .select("_id name email pic")
    .then((user) => {
        res.json(user);
    })
    .catch((error) => {
        console.log(error);
    });
});

module.exports = router;