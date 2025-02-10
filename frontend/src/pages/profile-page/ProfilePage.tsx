import React from 'react';
import { Outlet } from 'react-router-dom';

const ProfilePage: React.FC = () => {
  return (
    <div className="profile-page">
      <Outlet />
    </div>
  );
}

export default ProfilePage;