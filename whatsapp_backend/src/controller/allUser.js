const User = require("../model/user"); 

exports.allUser = async (req, res) => {
  try {
    
    const users = await User.find({},{ 
      firstName: 1, 
      lastName: 1, 
      mobileNumber: 1, 
      imageUrl: 1 
    }); 

    
    if (!users || users.length === 0) {
      return res.status(404).json({ message: "No users found" });
    }

    
    res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({
      success: false,
      message: "Server error. Could not fetch users.",
      error: err.message
    });
  }
};





exports.userDetails = async (req, res) => {
  try {
    const { id } = req.params; 

   
    const user = await User.findById(id, { password: 0 });

    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.status(200).json({
      success: true,
      user
    });

  } catch (err) {
    console.error("Error fetching user details:", err);
    res.status(500).json({
      success: false,
      message: "Server error. Could not fetch user details.",
      error: err.message
    });
  }
};


exports.userStatus = async (req, res) => {
  try {
    const { id } = req.query; 

   
    const user = await User.findById(id, { password: 0 });

    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.status(200).json({
      success: true,
      user
    });

  } catch (err) {
    console.error("Error fetching user details:", err);
    res.status(500).json({
      success: false,
      message: "Server error. Could not fetch user details.",
      error: err.message
    });
  }
};


exports.updateOnlineStatus = async (req, res) => {
  try {
    const { userId } = req.query;
    const { isOnline } = req.body;
    
    const user = await User.findByIdAndUpdate(
      userId,
      { 
        isOnline,
        lastSeen: isOnline ? null : new Date()
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.status(200).json({
      success: true,
      user
    });

  } catch (err) {
    console.error("Error updating online status:", err);
    res.status(500).json({
      success: false,
      message: "Server error. Could not update status.",
      error: err.message
    });
  }
};

exports.allOnlineUser = async (req, res) => {
  try {
    const allOnline = await User.find({ isOnline: true });

    if (!allOnline || allOnline.length === 0) {
      return res.status(404).json({ message: "No online users found" });
    }

    return res.status(200).json({
      message: "Online users fetched successfully",
      data: allOnline
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

