import React from "react";
import { Outlet } from "react-router-dom";

const ChallengePage: React.FC = () => {
  return (
    <div className="challenge-page">
      <Outlet />
    </div>
  );
}

export default ChallengePage;