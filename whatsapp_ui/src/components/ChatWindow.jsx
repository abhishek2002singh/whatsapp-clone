import React, { useEffect, useState, useRef } from 'react';
import { 
  ArrowLeft, Search, Phone, Video, MoreVertical, 
  Paperclip, Smile, Mic, Send, Check, CheckCheck,
  File, Image, Camera, Headphones, User, BarChart2, Calendar, StickyNote,
  Sticker
} from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';
import { createSocketConnection } from '../utils/socket';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BASE_URL } from '../utils/Constant';


const ChatWindow = ({ contact, onBack }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isOnline, setIsOnline] = useState(contact.isOnline || false);
  const [lastSeen, setLastSeen] = useState(contact.lastSeen || null);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const messagesEndRef = useRef(null);
   const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  
  const navigate = useNavigate();

  const targetId = contact?.id;
  const user = useSelector(store => store.user);
  const myUserId = user?.userData?._id || user?._id;
  const firstName = user?.userData?.firstName || user?.firstName;

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Format last seen time
  const formatLastSeen = (date) => {
    if (!date) return "unknown";
    const now = new Date();
    const lastSeenDate = new Date(date);
    const diffInMinutes = Math.floor((now - lastSeenDate) / (1000 * 60));
    
    if (diffInMinutes < 1) return "just now";
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return `${Math.floor(diffInMinutes / 1440)} days ago`;
  };


  const fetchChatMessages = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/chat`, {
        params: { userId: targetId },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data.success) {
       
        const transformedMessages = response.data.messages.map(msg => ({
          ...msg,
          senderName: msg.senderId.firstName,
          isOwn: msg.senderId._id.toString() === myUserId.toString()
        }));
        setMessages(transformedMessages);
      }
    } catch (err) {
      console.error("Failed to load messages:", err);
    }
  };

  const fetchUserStatus = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/status`, {
      params: { id: targetId },
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });

  
    if (response.data.success) {
      setIsOnline(response?.data?.user?.isOnline);
      setLastSeen(response?.data?.user?.lastSeen);
    }
  } catch (err) {
    console.error("Failed to fetch user status:", err);
  }
};


useEffect(() => {
  fetchUserStatus();
}, [targetId]);
  

  useEffect(() => {
    if (!myUserId) {
      navigate('/login');
      return;
    }

    const socket = createSocketConnection();
    
    // Set user online
    socket.emit('userOnline', myUserId);

    // Join chat room
    socket.emit('joinChat', { myUserId, targetId });

    // Listen for status changes
    socket.on('userStatusChanged', ({ userId, isOnline, lastSeen }) => {
      if (userId === targetId) {
        setIsOnline(isOnline);
        if (lastSeen) {
          setLastSeen(lastSeen);
        }
      }
    });

    // Listen for new messages
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

    // Listen for message status updates
    socket.on('messageStatusUpdate', ({ messageId, status, deliveredAt }) => {
      setMessages(prev => prev.map(msg => 
        msg._id === messageId ? { ...msg, status, deliveredAt } : msg
      ));
    });

    // Listen for messages read confirmation
    socket.on('messagesRead', ({ messageIds, readAt }) => {
      setMessages(prev => prev.map(msg => 
        messageIds.includes(msg._id) ? { ...msg, status: 'read', readAt } : msg
      ));
    });

    // Load initial messages
    fetchChatMessages();

    return () => {
      socket.disconnect();
    };
  }, [myUserId, targetId, navigate, firstName]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;
    
    const socket = createSocketConnection();
    
    
    
    setInputMessage("");
    
    // Send message to server
    socket.emit("sendMessage", { 
      myUserId, 
      targetId, 
      text: inputMessage 
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const renderMessageStatus = (status) => {
    switch (status) {
      case 'pending':
        return <span className="text-gray-400 text-xs ml-1">🕒</span>;
      case 'sent':
        return <Check className="w-3 h-3 text-gray-400 ml-1" />;
      case 'delivered':
        return <CheckCheck className="w-3 h-3  text-blue-500  ml-1" />;
      case 'read':
        return <CheckCheck className="w-3 h-3 text-blue-500 ml-1" />;
      default:
        return null;
    }
  };

    // Attachment menu items
  const attachmentOptions = [
    { icon: <File size={20} className='text-[rgb(127,102,255)] ' />, label: 'Document', action: () => handleDocumentSelect() },
    { icon: <Image size={20} className='text-[rgb(0,123,252)]'/>, label: 'Photos & videos', action: () => handleMediaSelect() },
    { icon: <Camera size={20} className='text-[rgb(255,46,116)]' />, label: 'Camera', action: () => handleCameraOpen() },
    { icon: <Headphones size={20}  className='text-[rgb(250,101,51)]'/>, label: 'Audio', action: () => handleAudioSelect() },
    { icon: <User size={20} className='text-[rgb(0,157,226)]'/>, label: 'Contact', action: () => handleContactSelect() },
    { icon: <BarChart2 size={20} className='text-[rgb(255,192,75)]' />, label: 'Poll', action: () => handlePollCreate() },
    { icon: <Calendar size={20} className='text-[rgb(255,46,116)]' />, label: 'Event', action: () => handleEventCreate() },
    { icon: <StickyNote size={20} className='text-[rgb(17,177,135)] font-bold'/>, label: 'New sticker', action: () => handleStickerSelect() }
  ];

  // Handler functions for each attachment option
  const handleDocumentSelect = () => {
    console.log('Document selected');
    setShowAttachmentMenu(false);
    
  };

  const handleMediaSelect = () => {
    console.log('Media selected');
    setShowAttachmentMenu(false);
    
  };

  const handleCameraOpen = () => {
    console.log('Camera opened');
    setShowAttachmentMenu(false);
   
  };

  const handleAudioSelect = () => {
    console.log('Audio selected');
    setShowAttachmentMenu(false);
    
  };

  const handleContactSelect = () => {
    console.log('Contact selected');
    setShowAttachmentMenu(false);
   
  };

  const handlePollCreate = () => {
    console.log('Poll created');
    setShowAttachmentMenu(false);
    
  };

  const handleEventCreate = () => {
    console.log('Event created');
    setShowAttachmentMenu(false);
    
  };

  const handleStickerSelect = () => {
    console.log('Sticker selected');
    setShowAttachmentMenu(false);
   
  };

   const onEmojiClick = (emojiData) => {
    setInputMessage(prev => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#efeae2] h-screen">
      {/* Chat Header */}
      <div className="bg-[#f0f2f5] px-4 py-3 border-b border-gray-300 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button onClick={onBack} className="lg:hidden">
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div className="flex items-center space-x-3">
            {contact.avatar ? (
              <img 
                src={contact.avatar} 
                alt="" 
                className="w-10 h-10 rounded-full object-cover" 
              />
            ) : (
              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                <div className="w-5 h-5 bg-gray-400 rounded-full"></div>
              </div>
            )}
            <div>
              <h3 className="font-medium text-gray-900 text-sm">
                {contact.name}
              </h3>
              <p className="text-xs text-gray-600">
                {isOnline ? 'Online' : `Last seen ${formatLastSeen(lastSeen)}`}
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <Search className="w-5 h-5 text-gray-600 cursor-pointer hover:text-gray-800" />
          <Phone className="w-5 h-5 text-gray-600 cursor-pointer hover:text-gray-800" />
          <Video className="w-5 h-5 text-gray-600 cursor-pointer hover:text-gray-800" />
          <MoreVertical className="w-5 h-5 text-gray-600 cursor-pointer hover:text-gray-800" />
        </div>
      </div>

      {/* Messages Area */}
      {/* Messages Area */}
<div className="flex-1 overflow-y-auto p-4 space-y-2 bg-[#efeae2]"  onClick={() => {setShowAttachmentMenu(false), setShowEmojiPicker(false)}}>
  {myUserId !== contact.id &&
    messages.map((msg, index) => (
      <div
        key={msg._id || index}
        className={`flex ${msg.isOwn ? "justify-end" : "justify-start"}`}
      >
        <div
          className={`max-w-[70%] rounded-lg px-3 py-2 mb-1 ${
            msg.isOwn
              ? "bg-[#d9fdd3] text-gray-900"
              : "bg-white text-gray-900"
          } shadow-sm`}
        >
          {!msg.isOwn && (
            <p className="text-xs font-semibold text-gray-700 mb-1">
              {msg.senderName}
            </p>
          )}
          <p className="text-sm">{msg.text}</p>
          <div className="flex items-center justify-end mt-1 space-x-1">
            <span className="text-xs text-gray-500">
              {new Date(msg.createdAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
            {msg.isOwn && renderMessageStatus(msg.status)}
          </div>
        </div>
      </div>
    ))}
  <div ref={messagesEndRef} />
</div>


      {/* Message Input Area */}
      <div className="bg-[#f0f2f5] p-4 flex items-center space-x-3" >
        
        
        <div className="flex-1 bg-white rounded-full flex items-center px-1 py-2">
  <div className="flex items-center relative mr-4"> {/* Added mr-4 for spacing */}
    <button 
      onClick={() => {setShowAttachmentMenu(!showAttachmentMenu),setShowEmojiPicker(false);}}
      className="text-gray-600 hover:text-gray-800"
    >
      <Paperclip className="w-6 h-6 bg-[rgb(255,255,255)] cursor-default hover:cursor-pointer" />
    </button>

    {showAttachmentMenu && (
      <div 
        className="absolute bottom-12 left-0 w-56 bg-[rgb(255,255,255)]  rounded-lg shadow-2xl py-2 z-10"
      >
        {attachmentOptions.map((option, index) => (
          <button
            key={index}
            onClick={option.action}
            className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            <span className="mr-3 ">{option.icon}</span>
            <span>{option.label}</span>
          </button>
        ))}
      </div>
    )}
  </div>
    <button onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
          <Sticker className="w-6 h-6 font-bold text-black cursor-pointer hover:text-gray-800 mr-3" onClick={() => setShowAttachmentMenu(false)}/>
        </button>
        
        {showEmojiPicker && (
          <div className="absolute bottom-16 mr-2 z-50">
            <EmojiPicker
 
              onEmojiClick={onEmojiClick}
              width={300}
              height={350}
            />
          </div>
        )}

  {/* <Sticker className="w-6 h-6 font-bold text-black cursor-pointer hover:text-gray-800 mr-3" onClick={() => setShowAttachmentMenu(false)}/>*/}
  
  <input
    type="text"
    placeholder="Type a message"
    value={inputMessage}
    onChange={(e) => setInputMessage(e.target.value)}
    onKeyPress={handleKeyPress}
    className="flex-1 outline-none text-sm"
    onClick={() => {
      setShowAttachmentMenu(false);
      setShowEmojiPicker(false);
    }}
  />
</div>


        <div className="flex items-center">
          <button 
            onClick={handleSendMessage} 
            className="p-2 bg-green-600 rounded-full hover:bg-green-700"
            disabled={!inputMessage.trim()}
          >
            <Send className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;

 