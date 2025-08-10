import React, { useEffect, useState } from 'react';
import WhatsAppSidebar from './WhatsAppSidebar';
import MessageArea from './MessageArea';
import ChatWindow from './ChatWindow';
import axios from 'axios';
import { BASE_URL } from '../utils/Constant';

const WhatsAppContainer = () => {
  const [selectedContact, setSelectedContact] = useState(null);
  const [contacts, setContacts] = useState([]);

  const fetchUsers = async () => {
    try {
      const { data } = await axios.get(`${BASE_URL}/users`, {
        withCredentials: true
      });
      
      if (data.success && data.users) {
        // Transform API users into contacts format
        const transformedContacts = data.users.map(user => ({
          id: user._id,
          name: user.firstName && user.lastName 
            ? `${user.firstName} ${user.lastName}` 
            : user.mobileNumber,
          lastMessage: "", 
          time: "Just now", 
          avatar: null, 
          unread: 0, 
          isVerified: false, 
          mobileNumber: user.mobileNumber, 
          isOnline: Math.random() > 0.5, 
          userData: user 
        }));
        
        setContacts(transformedContacts);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleContactSelect = (contact) => {
    setSelectedContact(contact);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <WhatsAppSidebar 
        contacts={contacts} 
        selectedContact={selectedContact}
        onContactSelect={handleContactSelect} 
      />
      {selectedContact ? (
        <ChatWindow contact={selectedContact} onBack={() => setSelectedContact(null)} />
      ) : (
        <MessageArea />
      )}
    </div>
  );
};

export default WhatsAppContainer;