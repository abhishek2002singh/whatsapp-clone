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