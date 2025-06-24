import React, { ReactNode } from 'react';

interface TopBarProps {
  children?: ReactNode;
}

const TopBar: React.FC<TopBarProps> = ({ children }) => {
  return (
    <div className="w-full p-3 md:p-4 mb-4 bg-white rounded-md shadow-medium">
      {children}
    </div>
  );
};

export default TopBar;
