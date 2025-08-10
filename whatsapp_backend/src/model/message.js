const mongoose = require("mongoose");

const messageStatus = {
  PENDING: "pending",
  SENT: "sent",
  DELIVERED: "delivered",
  READ: "read"
};

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(messageStatus),
      default: messageStatus.PENDING,
      required: true,
    },
    deliveredAt: {
      type: Date,
    },
    readAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

const chatSchema = new mongoose.Schema(
  {
    participants: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }],
    messages: [messageSchema],
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
  },
  { timestamps: true }
);

const Chat = mongoose.model("Chat", chatSchema);
const Message = mongoose.model("Message", messageSchema);

module.exports = { Chat, Message, messageStatus };