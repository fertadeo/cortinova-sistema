"use client"

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface AvatarContextType {
  avatarUpdateTrigger: number;
  triggerAvatarUpdate: () => void;
}

const AvatarContext = createContext<AvatarContextType | undefined>(undefined);

export const useAvatarContext = () => {
  const context = useContext(AvatarContext);
  if (context === undefined) {
    throw new Error('useAvatarContext must be used within an AvatarProvider');
  }
  return context;
};

interface AvatarProviderProps {
  children: ReactNode;
}

export const AvatarProvider: React.FC<AvatarProviderProps> = ({ children }) => {
  const [avatarUpdateTrigger, setAvatarUpdateTrigger] = useState(0);

  const triggerAvatarUpdate = useCallback(() => {
    setAvatarUpdateTrigger(prev => prev + 1);
  }, []);

  const value = {
    avatarUpdateTrigger,
    triggerAvatarUpdate
  };

  return (
    <AvatarContext.Provider value={value}>
      {children}
    </AvatarContext.Provider>
  );
};
