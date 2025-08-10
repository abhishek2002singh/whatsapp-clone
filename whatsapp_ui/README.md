# install react + vite
 - install tailwind css
 - install react-router-dom
 - install redux-toolkit
 - install toastify

# Build real time chat using web socket(socket clint)
   
   - install socket.io-client
   - make  Set user online
     socket.emit('userOnline', myUserId);

   - Join chat room
     socket.emit('joinChat', { myUserId, targetId });

   -  Listen for status changes
      socket.on('userStatusChanged', ({ userId, isOnline, lastSeen }) => {
      if (userId === targetId) {
        setIsOnline(isOnline);
        if (lastSeen) {
          setLastSeen(lastSeen);
           }
          }
       });

   -  Listen for new messages
    socket.on('messageReceived', (message) => {
      const newMessage = {
        ...message,
        senderName: firstName, // Use current user's firstName for own messages
        isOwn: message.senderId === myUserId
      };
      setMessages(prev => [...prev, newMessage]);
      
      // Mark as delivered if it's our chat
      if (message.senderId === targetId) {
        socket.emit('markMessagesAsRead', { 
          myUserId, 
          targetId, 
          messageIds: [message._id] 
        });
      }
    });

   -  Listen for message status updates
     socket.on('messageStatusUpdate', ({ messageId, status, deliveredAt }) => {
      setMessages(prev => prev.map(msg => 
        msg._id === messageId ? { ...msg, status, deliveredAt } : msg
      ));
    });

   -  Listen for messages read confirmation
    socket.on('messagesRead', ({ messageIds, readAt }) => {
      setMessages(prev => prev.map(msg => 
        messageIds.includes(msg._id) ? { ...msg, status: 'read', readAt } : msg
      ));
    });
