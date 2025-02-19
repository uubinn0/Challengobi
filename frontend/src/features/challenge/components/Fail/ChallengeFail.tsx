import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ChallengeFail.module.scss';
import failImage from '../../../../assets/challenge-fail.png';

const ChallengeFail: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.imageContainer}>
          <img 
            src={failImage}
            alt="챌린지 실패" 
            className={styles.failImage} 
          />
        </div>
        
        <h1 className={styles.title}>챌린지 실패</h1>

        <p className={styles.message}>
          아쉽게도 목표를 달성하지 못했어요. <br />
          다음에 다시 도전하세요!
        </p>

        <div className={styles.buttons}>
          <button 
            className={styles.homeButton}
            onClick={() => navigate('/')}
          >
            홈으로 가기
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChallengeFail; 