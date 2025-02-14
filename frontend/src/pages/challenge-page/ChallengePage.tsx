import React from 'react';
import { Outlet } from 'react-router-dom';

const ChallengePage: React.FC = () => {
  return (
    <div className="Challenge-page">
      <Outlet />
    </div>
  );
}

export default ChallengePage;