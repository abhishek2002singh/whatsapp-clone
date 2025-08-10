const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken')

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true,
    required:true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },

  imageUrl:{
    type :String
  },
 

  mobileNumber: {
    type: String,
    required: true,
    unique: true,
    required:true,
    validate(value){
        if (!validator.isMobilePhone) {
            throw new Error("enter a valid mobile number" + value)
        }
    }
  },

  

  password: {
    type: String,
    
  },

  // 👇 User Info Fields
  age: {
    type: Number,
    min: 1
  },

  about: {
    type: String,
    default: 'Hey there! I am using ChatApp.'
  },

  profilePicture: {
    type: String, // URL
    default: 'https://via.placeholder.com/150'
  },

  links: {
    type: [String] // Array of URLs (social, resume, etc.)
  },

  
  isVerified: {
    type: Boolean,
    default: false
  },

  
  isOnline: {
    type: Boolean,
    default: false
  },

  lastSeen: {
    type: Date
  },

  privacy: {
    lastSeen: { type: String, enum: ['everyone', 'contacts', 'nobody'], default: 'everyone' },
    profilePicture: { type: String, enum: ['everyone', 'contacts', 'nobody'], default: 'everyone' },
    about: { type: String, enum: ['everyone', 'contacts', 'nobody'], default: 'everyone' },
    status: { type: String, enum: ['everyone', 'contacts', 'nobody'], default: 'everyone' }
  },

  createdAt: {
    type: Date,
    default: Date.now
  },

  updatedAt: {
    type: Date,
    default: Date.now
  }
});

userSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});


userSchema.methods.getJWT = async function (){
    const user = this;

    const token = await jwt.sign(
        {
            _id:user._id ,
           
            firstName : user?.firstName
         
        },
        "WHATSAPP$790",
        {
        expiresIn:"7d"
    })
    return token
}

userSchema.methods.validatePassword = async function(passwordInputUser){
    const user = this
    const passwordHash = user.password;

    const isPasswordValid = await bcrypt.compare(
        passwordInputUser , 
        passwordHash
    )
    return isPasswordValid
}

module.exports = mongoose.model('User', userSchema);
