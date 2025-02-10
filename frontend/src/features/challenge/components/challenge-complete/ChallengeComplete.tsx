import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ChallengeComplete.module.scss';

const ChallengeComplete: React.FC = () => {
  const navigate = useNavigate();

  const handleHomeClick = () => {
    navigate('/');
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span>챌린지고비</span>
      </div>
      
      <div className={styles.content}>
        <div className={styles.imageContainer}>
          <img src="/images/fish-coin.png" alt="챌린지 성공" />
        </div>
        
        <h2 className={styles.title}>챌린지 성공!</h2>
        <p className={styles.subtitle}>챌린지 '14일' 성공했어요!</p>
        
        <div className={styles.info}>
          <p>챌린지 내용</p>
          <p>기간:</p>
          <p>소비금액:</p>
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