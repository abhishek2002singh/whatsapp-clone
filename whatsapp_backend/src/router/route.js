const express = require('express');
const routerPath = express.Router(); 
const {userAuth }=require('../middleware/auth')

// auth is here
const { signup, login, logout } = require('../controller/auth');


routerPath.post('/signup', signup);
routerPath.post('/login', login);
routerPath.post('/logout', logout);


const { allUser, userStatus , updateOnlineStatus} = require("../controller/allUser");

routerPath.get("/users", allUser); 
routerPath.get("/status", userStatus);
routerPath.post("/updateOnlineStatus", updateOnlineStatus);


//chating route
const {prevChat} = require('../controller/chatController')

routerPath.get("/chat" ,userAuth, prevChat)

module.exports = routerPath;
