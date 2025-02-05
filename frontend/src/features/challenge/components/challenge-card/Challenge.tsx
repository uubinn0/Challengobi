import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Challenge.css';

interface ChallengeItem {
  category: string;
  period: string;
  reward: number;
  duration: string;
}

const Challenge: React.FC = () => {
  const navigate = useNavigate();
  const challenges: ChallengeItem[] = [
    {
      category: '술/담배',
      period: '1월 1일 - 1월 28일',
      reward: 20000,
      duration: '28일'
    },
    {
      category: '장보기',
      period: '1월 1일 - 1월 7일',
      reward: 15000,
      duration: '7일'
    },
    {
      category: '외식',
      period: '1월 1일 - 1월 7일',
      reward: 100000,
      duration: '7일'
    },
    {
      category: '교육',
      period: '1월 1일 - 1월 28일',
      reward: 50000,
      duration: '28일'
    }
  ];

  const handleCardClick = (index: number) => {
    if (index === 0) {
      navigate('/challenge/progress');
    }
  };

  return (
    <div className="challenge-container">
      <button className="create-challenge-btn">
        <span>✎</span> 챌린지 만들기
      </button>
      
      <h2>진행 중인 챌린지</h2>
      <div className="challenge-grid">
        {challenges.slice(0, 2).map((challenge, index) => (
          <div key={index} className="challenge-card">
            <div className="card-header">
              <span className="lock-icon">🔒</span>
            </div>
            <div 
              className="card-content"
              onClick={() => handleCardClick(index)}
              style={index === 0 ? { cursor: 'pointer' } : {}}
            >
              <p>카테고리 : {challenge.category}</p>
              <p>챌린지 기간 : {challenge.period}</p>
              <p>챌린지 금액 : {challenge.reward.toLocaleString()}원</p>
              <p>챌린지 기간 : {challenge.duration}</p>
            </div>
          </div>
        ))}
      </div>

      <h2>모집 중인 챌린지</h2>
      <div className="challenge-grid">
        {challenges.slice(2, 4).map((challenge, index) => (
          <div key={index} className="challenge-card">
            <div className="card-header">
              <span className="lock-icon">🔒</span>
            </div>
            <div className="card-content">
              <p>카테고리 : {challenge.category}</p>
              <p>챌린지 기간 : {challenge.period}</p>
              <p>챌린지 금액 : {challenge.reward.toLocaleString()}원</p>
              <p>챌린지 기간 : {challenge.duration}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Challenge;
