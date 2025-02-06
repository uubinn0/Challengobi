import React from 'react';
import { Outlet } from 'react-router-dom';
import { Challenge } from '../../features/home/types';

const HomePage: React.FC = () => {
  const challenges: Challenge[] = []; // 여기에 실제 챌린지 데이터를 넣거나 API에서 가져오세요


  return (
    <div className="home-page">
      <Outlet context={{ challenges }} />
    </div>
  );
}

export default HomePage;