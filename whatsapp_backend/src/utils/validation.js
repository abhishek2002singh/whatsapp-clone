const validator = require('validator')



const validateSignUpData = (req)=>{
    const {firstName, lastName, mobileNumber} =req.body
    if(!firstName || !lastName){
        throw new Error("name is not valid")
    }
   
    else if(!validator.isMobilePhone(mobileNumber)){
        throw new Error("please enter correct mobile number")
    }
   
}

const loginValidation = (req)=>{
    const {mobileNumber} = req.body
    if(!validator.isMobilePhone(mobileNumber)){
          throw new Error("plese enter a valid mobileNumber")
    }
}



module.exports = {
    validateSignUpData,
    loginValidation
   
}