import { ChevronRight, LogOut, MessageSquareText, Star, Users } from 'lucide-react';
import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Menu = ({ onClose }) => {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  return (
    <div 
      ref={menuRef}
      className="absolute mr-2 top-14 w-48  bg-white rounded-2xl shadow-lg py-1 z-50 border border-gray-200 "
    >
      <Link to='/GroupMaking'>
        <button className="py-3 text-sm w-48 text-gray-700 hover:bg-gray-100 cursor-pointer flex items-center">
            <Users className="w-4 h-4 mx-2 text-gray-800 font-bold" />
        New group
        
      </button>
      </Link>
      <button className=" py-3 text-sm w-48 text-gray-700 hover:bg-gray-100 cursor-pointer flex  items-center">
        <Star className="w-4 h-4 mx-2 text-gray-800 font-bold" />
        Starred messages
      </button>
      <button className=" py-3 text-sm w-48 text-gray-700 hover:bg-gray-100 cursor-pointer flex  items-center">
        <MessageSquareText className="w-4 h-4 mx-2 text-gray-800 font-bold"/>
        Select chats
      </button>
      <button className=" py-3 text-sm w-48 text-gray-700 hover:bg-gray-100 cursor-pointer flex items-center">
        <LogOut className="w-4 h-4 mx-2 text-gray-800 font-bold"/>
        Log out
      </button>
    </div>
  );
};

export default Menu;
