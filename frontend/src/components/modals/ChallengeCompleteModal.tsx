import React from 'react';
import styles from './ChallengeCompleteModal.module.scss';

interface ChallengeCompleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  days: number;
}

const ChallengeCompleteModal: React.FC<ChallengeCompleteModalProps> = ({ isOpen, onClose, days }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.header}>
          <span>챌린지고비</span>
          <button onClick={onClose} className={styles.closeButton}>
            <img src="/icons/close.svg" alt="닫기" />
          </button>
        </div>
        
        <div className={styles.imageContainer}>
          <img src="/images/challenge-complete.png" alt="챌린지 성공" />
        </div>
        
        <h2 className={styles.title}>챌린지 성공!</h2>
        <p className={styles.subtitle}>챌린지 '{days}일' 성공했어요!</p>
        
        <div className={styles.info}>
          <p>챌린지 내용</p>
          <p>기간:</p>
          <p>소비금액:</p>
        </div>

        <div className={styles.buttons}>
          <button className={styles.homeButton} onClick={onClose}>
            홈으로 가기
          </button>
          <button className={styles.profileButton} onClick={onClose}>
            내 프로필
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChallengeCompleteModal; 