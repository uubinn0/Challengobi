import React from 'react';
import { Outlet } from 'react-router-dom';

const FollowPage: React.FC = () => {
  return (
    <div>
      <Outlet/>
    </div>
  );
}

export default FollowPage;