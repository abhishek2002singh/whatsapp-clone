const jwt = require('jsonwebtoken');
const User  = require('../model/user');


const userAuth =async(req , res , next)=>{
    try{ 
        const authHeader = req.header("Authorization");
    const token =
      req.cookies?.token ||
      (authHeader ? authHeader.replace("Bearer ", "") : null);

    if (!token) {
      return res.status(401).json({ error: "Please authenticate" });
    }
    
      //validate my token
          const decodedMessage = await jwt.verify(token ,"WHATSAPP$790")
         
          const {_id} = decodedMessage;
     
    
          const accessUser = await User.findById(_id)
          if(!accessUser){
            throw new Error("user not found")
          }
           req.accessUser = accessUser
         next()
        
    
      }catch(err){
        res.status(400).send("ERROR: " + err.message)
    }

   

}

module.exports = {
    
    userAuth ,
}
