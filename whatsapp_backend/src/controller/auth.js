const {signvalidateSignUpData ,loginValidation} = require('../utils/validation')
const User  = require("../model/user")


exports.signup = async (req, res) => {
  try {
    const { firstName, lastName, mobileNumber } = req.body;

    if (!firstName) throw new Error("Please enter first name");
    if (!mobileNumber) throw new Error("Please enter mobile number");

    const userExists = await User.findOne({ mobileNumber });

    if (userExists) {
      throw new Error("Mobile number already registered");
    }

    const user = new User({
      firstName,
      lastName,
      mobileNumber,
    });

    const savedUser = await user.save();

    const token = await savedUser.getJWT();

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      message: "Signup successful",
      userData: savedUser,
      token,
    });

  } catch (error) {
    console.error(error);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};


exports.login = async (req, res) => {
  try {
    loginValidation(req);

    const { mobileNumber } = req.body;

    if (!mobileNumber) {
      throw new Error("Please enter a mobile number");
    }

    const exiestMobileNumber = await User.findOne({ mobileNumber });

    if (exiestMobileNumber) {
      const token = await exiestMobileNumber.getJWT();

      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
         maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.status(200).json({
        success: true,
        message: "Login successful",
        userData: exiestMobileNumber,
        token,
      });
    } else {
      throw new Error("Mobile number is not correct");
    }
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};


exports.logout = async (req, res) => {
    try{

        res.clearCookie("token", { httpOnly: true, secure: process.env.NODE_ENV==="production", sameSite: "Strict" });
        res.status(200).json({ message: "Logged out successfully" });
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:" some error in your backend ",
            errorMessage:error.message
        })
    }
}