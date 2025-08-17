const { Chat } = require("../model/message");

exports.prevChat = async (req, res) => {

    console.log("lallalalala",req.query)
  const { userId } = req.query;
  console.log("kkkkkkkkkk",userId)
  const loggedUserId = req.accessUser._id;

  console.log(userId)

  console.log("hahahahahah" ,loggedUserId)

  try {
    let chat = await Chat.findOne({
      participants: { $all: [loggedUserId, userId] },
    })
    .populate({
      path: "messages.senderId",
      select: "firstName",
    })
    .populate({
      path: "participants",
      select: "firstName  isOnline lastSeen",
    });

    if (!chat) {
      chat = new Chat({
        participants: [loggedUserId, userId],
        messages: [],
      });
      await chat.save();
      
      // Populate after save if needed
      chat = await Chat.findById(chat._id)
        .populate({
          path: "participants",
          select: "firstName  isOnline lastSeen",
        });
    }

    res.status(200).json({
      success: true,
      chat,
      messages: chat.messages.map(msg => ({
        ...msg.toObject(),
        isOwn: msg.senderId._id.toString() === loggedUserId.toString()
      }))
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: "Failed to fetch chat messages"
    });
  }
};

// Get last message for a given chat

exports.latestMessagesForAllChats = async (req, res) => {
  try {
    const {userId} = req.query;

    console.log(userId)
    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    const chats = await Chat.find({ participants: userId })
      .populate({
        path: 'messages',
        select: 'text sender createdAt',
        populate: { path: 'sender', select: 'name email' }
      })
      .populate('participants', 'name email')
      .sort({ updatedAt: -1 })
      .lean();

    const result = chats.map(chat => {
      const otherParticipant = chat.participants.find(
        p => p._id.toString() !== userId
      );

      // Get the last message in this chat (if any)
      const lastMessage = chat.messages.length
        ? chat.messages[chat.messages.length - 1]
        : null;

      return {
        chatId: chat._id,
        participant: otherParticipant || null,
        lastMessage: lastMessage,
        updatedAt: chat.updatedAt
      };
    });

    res.status(200).json({ success: true, chats: result });
  } catch (err) {
    console.error("Error fetching last messages:", err);
    res.status(500).json({ message: "Server error" });
  }
};


// get all unread message 
 
exports.allUnReadMessage = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ 
        success: false,
        message: "User ID is required" 
      });
    }

    

    // Get all chats where the user is a participant
    const chats = await Chat.find({ participants: userId })
      .populate("participants", "name email profileImage")
      .populate("messages.senderId", "name")
      .lean();

    const result = chats
      .map(chat => {
        // Filter unread messages (not sent by user and not read)
        const unreadMessages = chat.messages.filter(msg => {
          const isNotSender = msg.senderId?._id.toString() !== userId;
          const isUnread = !msg.readBy?.includes(userId) && 
                          (msg.status === "sent" || msg.status === "pending" || !msg.status);
                   

          
          return isNotSender && isUnread;
        });
        

        // Find the other participant (excluding current user)
        const participant = chat.participants.find(
          p => p._id.toString() !== userId
        );

        // Get last unread message details
        const lastUnreadMessage = unreadMessages.length > 0 
          ? unreadMessages[unreadMessages.length - 1]
          : null;

        return {
          chatId: chat._id,
          participant,
          unreadCount: unreadMessages.length,
          lastUnreadMessage: lastUnreadMessage ? {
            text: lastUnreadMessage.text,
            createdAt: lastUnreadMessage.createdAt,
            type: lastUnreadMessage.type
          } : null
        };
      })
      .filter(chat => chat.unreadCount > 0); // Only include chats with unread messages

    const totalUnread = result.reduce((sum, chat) => sum + chat.unreadCount, 0);

    res.status(200).json({
      success: true,
      totalUnread,
      chats: result
    });

  } catch (err) {
    console.error("Error fetching unread messages:", err);
    res.status(500).json({ 
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};





