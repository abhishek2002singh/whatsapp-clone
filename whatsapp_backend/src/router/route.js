const express = require('express');
const routerPath = express.Router(); 
const {userAuth }=require('../middleware/auth')

// auth is here
const { signup, login, logout } = require('../controller/auth');


routerPath.post('/signup', signup);
routerPath.post('/login', login);
routerPath.post('/logout', logout);


const { allUser, userStatus , updateOnlineStatus ,allOnlineUser} = require("../controller/allUser");

routerPath.get("/users", allUser); 
routerPath.get("/status", userStatus);
routerPath.post("/updateOnlineStatus", updateOnlineStatus);
routerPath.get("/allOnlineUser", allOnlineUser);


//chating route
const {prevChat ,latestMessagesForAllChats, allUnReadMessage} = require('../controller/chatController')

routerPath.get("/chat" ,userAuth, prevChat)
routerPath.get("/lastMessage" , latestMessagesForAllChats)
routerPath.get("/allUnReadMessage" , allUnReadMessage)


module.exports = routerPath;
