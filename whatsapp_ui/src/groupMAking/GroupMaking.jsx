import React, { useState, useMemo } from "react";
import { useSelector } from "react-redux";

const GroupMaking = () => {
  const allUser = useSelector((state) => state.allUser || []);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);

  // Filter users by name or mobile number
  const filteredUsers = useMemo(() => {
    return allUser.filter((user) => {
      const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
      return (
        fullName.includes(searchTerm.toLowerCase()) ||
        user.mobileNumber.includes(searchTerm)
      );
    });
  }, [searchTerm, allUser]);

  // Toggle user selection
  const handleSelectUser = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  // Create group handler
  const handleCreateGroup = () => {
    if (selectedUsers.length < 2) {
      alert("Select at least 2 members to create a group.");
      return;
    }
    console.log("Selected user IDs for group:", selectedUsers);
    // Here, you can send selectedUsers to backend
  };

  return (
    <div className="w-[556px] bg-gray-100 h-screen p-4 right-0 shadow-md flex flex-col">
      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search by name or phone..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full px-3 py-2 mb-4 border rounded-md outline-none focus:ring-2 focus:ring-blue-500"
      />

      {/* User List */}
      <div className="flex-1 overflow-y-auto">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user) => (
            <label
              key={user._id}
              className="flex items-center gap-3 p-2 bg-white rounded-md shadow-sm mb-2 cursor-pointer hover:bg-gray-200"
            >
              <input
                type="checkbox"
                checked={selectedUsers.includes(user._id)}
                onChange={() => handleSelectUser(user._id)}
              />
              <div>
                <p className="font-semibold">{`${user.firstName} ${user.lastName}`}</p>
                <p className="text-sm text-gray-500">{user.mobileNumber}</p>
              </div>
            </label>
          ))
        ) : (
          <p className="text-gray-500">No users found</p>
        )}
      </div>

      {/* Create Group Button */}
      <button
        onClick={handleCreateGroup}
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:bg-gray-400"
        disabled={selectedUsers.length < 2}
      >
        Create Group
      </button>
    </div>
  );
};

export default GroupMaking;
