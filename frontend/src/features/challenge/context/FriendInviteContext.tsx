import React, { createContext, useContext, useState, ReactNode } from 'react';

interface FriendInviteContextType {
  invitedFriendIds: number[];
  toggleInvite: (friendId: number) => void;
}

const FriendInviteContext = createContext<FriendInviteContextType | undefined>(undefined);

export const FriendInviteProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [invitedFriendIds, setInvitedFriendIds] = useState<number[]>([1, 2, 3]); // 초기에 초대된 친구들

  const toggleInvite = (friendId: number) => {
    setInvitedFriendIds(prev => 
      prev.includes(friendId)
        ? prev.filter(id => id !== friendId)
        : [...prev, friendId]
    );
  };

  return (
    <FriendInviteContext.Provider value={{ invitedFriendIds, toggleInvite }}>
      {children}
    </FriendInviteContext.Provider>
  );
};

export const useFriendInvite = () => {
  const context = useContext(FriendInviteContext);
  if (!context) {
    throw new Error('useFriendInvite must be used within a FriendInviteProvider');
  }
  return context;
}; 