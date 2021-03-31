const express = require('express');
const app = express();
const mongoose = require('mongoose');
const {MONGOURI} = require('./config/keys');
const port = process.env.PORT || 5000;

mongoose.connect(MONGOURI, { useUnifiedTopology:true, useNewUrlParser:true });

mongoose.connection.on('connected', () => {
    console.log("connected to mongodb")
});
mongoose.connection.on('error', (error) => {
    console.log("connection faild to mongodb" , error)
});

// registering models
require('./models/userModel');
require('./models/postModel');

// parsing the incoming request
app.use(express.json());

// route handlers
// registering routers
app.use(require('./routes/auth'));
app.use(require('./routes/post'));
app.use(require('./routes/user'));

if(process.env.NODE_ENV == "production") {
    app.use(express.static('client/build'));
    const path = require('path');
    app.get("*", (req, res) => {
        res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'))
    })
}

app.listen(port , () => {
    console.log("server is running on ",port)
});