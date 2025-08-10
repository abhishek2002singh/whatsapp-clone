const socketIO = require('socket.io');
const crypto = require('crypto');
const { Chat, Message, messageStatus } = require('../model/message');
const User = require('../model/user');

const getSecretRoomId = (myUserId, targetId) => {
  return crypto.createHash('sha256').update([myUserId, targetId].sort().join("$")).digest('hex');
};

const initializeSocket = (server) => {
  const io = socketIO(server, {
    cors: {
      origin: "https://https-github-com-abhishek2002singh.onrender.com"
    }
  });

  // Track online users
  const onlineUsers = new Map();

  io.on("connection", (socket) => {
    console.log("✅ New client connected:", socket.id);

    // Update online status
    socket.on("userOnline", async (userId) => {
      try {
        await User.findByIdAndUpdate(userId, { 
          isOnline: true,
          lastSeen: null 
        });
        onlineUsers.set(userId, socket.id);
        console.log(`✅ User ${userId} is online`);
        
        // Notify all connected clients about the user's online status
        io.emit("userStatusChanged", { 
          userId, 
          isOnline: true 
        });
      } catch (err) {
        console.error("Error updating online status:", err);
      }
    });

    // Join chat room
    socket.on('joinChat', async ({ myUserId, targetId }) => {
      const room = getSecretRoomId(myUserId, targetId);
      socket.join(room);
      console.log(`User ${myUserId} joined chat with ${targetId} in room ${room}`);

      // Mark messages as delivered when user joins the chat
      try {
        const chat = await Chat.findOne({
          participants: { $all: [myUserId, targetId] }
        });

        if (chat) {
          const undeliveredMessages = chat.messages.filter(
            msg => msg.senderId.toString() !== myUserId && 
                   msg.status === messageStatus.SENT
          );

          if (undeliveredMessages.length > 0) {
            const messageIds = undeliveredMessages.map(msg => msg._id);
            
            await Chat.updateMany(
              { 
                "_id": chat._id,
                "messages._id": { $in: messageIds }
              },
              {
                $set: { 
                  "messages.$.status": messageStatus.DELIVERED,
                  "messages.$.deliveredAt": new Date()
                }
              }
            );

            // Notify sender that messages were delivered
            undeliveredMessages.forEach(msg => {
              io.to(getSecretRoomId(msg.senderId, myUserId)).emit("messageStatusUpdate", {
                messageId: msg._id,
                status: messageStatus.DELIVERED,
                deliveredAt: new Date()
              });
            });
          }
        }
      } catch (err) {
        console.error("Error marking messages as delivered:", err);
      }
    });

    // Send message
    socket.on("sendMessage", async ({ myUserId, targetId, text }) => {
      try {
        const room = getSecretRoomId(myUserId, targetId);
        
        let chat = await Chat.findOne({
          participants: { $all: [myUserId, targetId] }
        });

        if (!chat) {
          chat = new Chat({
            participants: [myUserId, targetId],
            messages: []
          });
        }

        const newMessage = {
          senderId: myUserId,
          text,
          status: messageStatus.SENT
        };

        chat.messages.push(newMessage);
        chat.lastMessage = chat.messages[chat.messages.length - 1]._id;
        await chat.save();

        const savedMessage = chat.messages[chat.messages.length - 1];

        // Emit to sender (optimistic update)
        socket.emit("messageSent", {
          _id: savedMessage._id,
          senderId: myUserId,
          text,
          status: messageStatus.SENT,
          createdAt: savedMessage.createdAt
        });

        // Emit to receiver
        io.to(room).emit("messageReceived", {
          _id: savedMessage._id,
          senderId: myUserId,
          text,
          status: messageStatus.SENT,
          createdAt: savedMessage.createdAt
        });

        // If receiver is online, mark as delivered immediately
        if (onlineUsers.has(targetId)) {
          setTimeout(async () => {
            await Chat.updateOne(
              { 
                "_id": chat._id,
                "messages._id": savedMessage._id 
              },
              {
                $set: { 
                  "messages.$.status": messageStatus.DELIVERED,
                  "messages.$.deliveredAt": new Date()
                }
              }
            );

            io.to(room).emit("messageStatusUpdate", {
              messageId: savedMessage._id,
              status: messageStatus.DELIVERED,
              deliveredAt: new Date()
            });
          }, 1000);
        }

      } catch (err) {
        console.error("Error sending message:", err);
        socket.emit("messageError", {
          error: "Failed to send message"
        });
      }
    });

    // Mark messages as read
    socket.on("markMessagesAsRead", async ({ myUserId, targetId, messageIds }) => {
      try {
        const room = getSecretRoomId(myUserId, targetId);
        
        await Chat.updateMany(
          { 
            participants: { $all: [myUserId, targetId] },
            "messages._id": { $in: messageIds }
          },
          {
            $set: { 
              "messages.$.status": messageStatus.READ,
              "messages.$.readAt": new Date()
            }
          }
        );

        // Notify sender that messages were read
        io.to(getSecretRoomId(targetId, myUserId)).emit("messagesRead", {
          messageIds,
          readAt: new Date()
        });

      } catch (err) {
        console.error("Error marking messages as read:", err);
      }
    });

    // Disconnect event
    socket.on("disconnect", async () => {
      // Find which user disconnected
      let disconnectedUserId = null;
      for (const [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          disconnectedUserId = userId;
          onlineUsers.delete(userId);
          break;
        }
      }

      if (disconnectedUserId) {
        try {
          await User.findByIdAndUpdate(disconnectedUserId, {
            isOnline: false,
            lastSeen: new Date()
          });
          
          console.log(`🚪 User ${disconnectedUserId} went offline`);
          
          // Notify all connected clients about the user's offline status
          io.emit("userStatusChanged", { 
            userId: disconnectedUserId, 
            isOnline: false,
            lastSeen: new Date()
          });
        } catch (err) {
          console.error("Error updating offline status:", err);
        }
      }
    });
  });
};

module.exports = initializeSocket;