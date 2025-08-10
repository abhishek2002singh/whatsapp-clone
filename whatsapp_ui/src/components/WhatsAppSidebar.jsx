import React, { useEffect, useState } from 'react';
import { Search, Plus, MoreVertical, Settings, Users as UsersIcon, MessageCircle } from 'lucide-react';
import { BASE_URL } from '../utils/Constant';
import axios from 'axios';
import { useSelector } from 'react-redux';

const WhatsAppSidebar = ({ contacts, selectedContact, onContactSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [onlineUsers, setOnlineUsers] = useState([]);
  const user = useSelector(store => store.user);
   const myUserId = user?.userData?._id || user?._id;

  console.log("my" ,contacts)


  // Fetch online users
  useEffect(() => {
    const fetchOnlineUsers = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/allOnlineUser`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (response?.data?.data) {
          setOnlineUsers(response.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch online users:", err);
      }
    };

    fetchOnlineUsers();
    const interval = setInterval(fetchOnlineUsers, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

 
  const getEnhancedContacts = () => {
    return contacts?.map(contact => {
      const isOnline = onlineUsers.some(user => user._id === contact.id);
      return { ...contact, isOnline };
    });
  };

  // Filter contacts based on search term and active filter
  const filteredContacts = getEnhancedContacts()?.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    switch (activeFilter) {
      case 'Unread':
        return matchesSearch && contact.unread > 0;
      case 'Favourites':
        return matchesSearch && contact.isFavourite;
      case 'Groups':
        return matchesSearch && contact.isGroup;
      default:
        return matchesSearch;
    }
  });

  const handleContactClick = (contact) => {
    onContactSelect(contact);
  };



  const filterButtons = ['All', 'Unread', 'Favourites', 'Groups'];

  return (
    <>
      {/* Left Sidebar Icons */}
      <div className="w-16 bg-[rgb(247,245,243)] flex flex-col items-center py-4 space-y-4 border-r-[1px] border-gray-300">
        <div className="relative">
          <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
          <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-medium">
            {contacts?.reduce((sum, contact) => sum + contact.unread, 0)}
          </span>
        </div>
        
        <button 
          onClick={() => setShowOnlineUsers(true)}
          className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center hover:bg-gray-500 cursor-pointer"
        >
          <UsersIcon className="w-5 h-5 text-white" />
        </button>
        
        <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center hover:bg-gray-500 cursor-pointer">
          <Settings className="w-5 h-5 text-white" />
        </div>
        
        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center hover:bg-blue-600 cursor-pointer">
          <div className="w-6 h-6 bg-white rounded-full"></div>
        </div>
        
        <div className="mt-auto">
          <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center hover:bg-gray-500 cursor-pointer">
            <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop&crop=face" 
                 alt="Profile" 
                 className="w-8 h-8 rounded-full" />
          </div>
        </div>
      </div>

      {/* Main WhatsApp Sidebar */}
      <div className="w-[461px] bg-white flex flex-col border-r-[1px] border-gray-300">
        {/* Header */}
        <div className="bg-[rgb(255,255,255)] p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <h1 className="text-xl font-medium text-green-600">WhatsApp</h1>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white rounded-md border border-gray-300 flex items-center justify-center cursor-pointer hover:bg-gray-50">
                <Plus className="w-4 h-4 text-gray-600" />
              </div>
              <MoreVertical className="w-6 h-6 text-gray-600 cursor-pointer" />
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search or start a new chat"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-100 rounded-full text-sm focus:outline-none focus:bg-white focus:ring-1 focus:ring-green-500"
            />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="px-4 py-3 border-b border-gray-200">
          <div className="flex space-x-2">
            {filterButtons.map(filter => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  activeFilter === filter
                    ? 'bg-green-100 text-green-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {filteredContacts?.length > 0 ? (
            filteredContacts.map((contact, index) => (
              <div 
                key={contact.id} 
                className={`px-4 py-3 cursor-pointer transition-colors ${
                  selectedContact?.id === contact.id 
                    ? 'bg-[#f0f2f5] border-r-4 border-green-500' 
                    : 'hover:bg-gray-50'
                } ${index < filteredContacts.length - 1 ? 'border-b border-gray-100' : ''}`}
                onClick={() => handleContactClick(contact)}
              >
                <div className="flex items-center space-x-3">
                  {/* Avatar with online indicator */}
                  <div className="relative flex-shrink-0">
                    {contact.imageUrl ? (
                      <img src={contact.imageUrl} alt="" className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                      <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-gray-600 text-lg font-medium">
                          {contact.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    {contact.isOnline && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  
                  {/* Chat Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1 flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate text-sm">
                         {contact.id === myUserId ? "You" : contact.name}
                          
                        </h3>
                       
                      </div>
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <span className={`text-xs ${
                          contact.time === 'Yesterday' 
                            ? 'text-gray-500' 
                            : contact.unread > 0
                              ? 'text-green-600 font-medium' 
                              : 'text-gray-500'
                        }`}>
                          {contact.time}
                        </span>
                        {contact.unread > 0 && (
                          <span className="bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                            {contact.unread}
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 truncate mt-1">
                      {contact.lastMessage || "No messages yet"}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="flex items-center justify-center h-32">
              <div className="text-center text-gray-500">
                <p className="text-sm">No chats found</p>
                <p className="text-xs mt-1">Try a different search term</p>
              </div>
            </div>
          )}
        </div>
      </div>

      
    </>
  );
};

export default WhatsAppSidebar;