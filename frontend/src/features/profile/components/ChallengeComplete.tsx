import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './ChallengeComplete.module.scss';
import challengeSuccess3 from '@/assets/challenge-success3.jpg';

interface ChallengeCompleteProps {
  title: string;
  period: string;
  amount: string;
  days: number;
}

const ChallengeComplete: React.FC = () => {
  const location = useLocation();
  const challengeInfo = location.state as ChallengeCompleteProps;  // navigate로 전달받은 정보
  
  const navigate = useNavigate();

  const handleHomeClick = () => {
    navigate('/');
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  return (
    <div className={styles.container}>
     
      <div className={styles.content}>
        <div className={styles.imageContainer}>
          <img src={challengeSuccess3} alt="챌린지 성공" />
        </div>
        
        <h2 className={styles.title}>챌린지 성공!</h2>
        <p className={styles.subtitle}>챌린지 '{challengeInfo.days}일' 성공했어요!</p>
        
        <div className={styles.info}>
          <p>챌린지 내용: {challengeInfo.title}</p>
          <p>기간: {challengeInfo.period}</p>
          <p>소비금액: {challengeInfo.amount}</p>
        </div>

        <div className={styles.buttons}>
          <button className={styles.homeButton} onClick={handleHomeClick}>
            홈으로 가기
          </button>
          <button className={styles.profileButton} onClick={handleProfileClick}>
            내 프로필
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChallengeComplete; 