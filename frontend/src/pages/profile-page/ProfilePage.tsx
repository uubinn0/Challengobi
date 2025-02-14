import React from 'react';
import { Outlet } from 'react-router-dom';

const ProfilePage: React.FC = () => {
  return (
    <div>
      <Outlet />
    </div>
  );
};

export default ProfilePage;