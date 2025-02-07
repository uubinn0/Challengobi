import React from 'react';
import styles from './ChallengeDetailModal.module.scss';
import type { Challenge } from '../../features/home/types';

interface ChallengeDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  challenge: Challenge;
}

const ChallengeDetailModal: React.FC<ChallengeDetailModalProps> = ({ isOpen, onClose, challenge }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.title}>{challenge.title}</h2>
        <div className={styles.content}>
          <p className={styles.description}>외식을 줄이고 싶은 챌린저들을 모집합니다.</p>
          <div className={styles.details}>
            <div className={styles.detailItem}>
              <span>카테고리</span>
              <span>{challenge.category}</span>
            </div>
            <div className={styles.detailItem}>
              <span>챌린지 기간</span>
              <span>{challenge.period}</span>
            </div>
            <div className={styles.detailItem}>
              <span>챌린지 금액</span>
              <span>{challenge.amount}</span>
            </div>
            <div className={styles.detailItem}>
              <span>챌린지 인원</span>
              <span>{challenge.currentMembers}/{challenge.maxMembers}명</span>
            </div>
          </div>
        </div>
        <div className={styles.buttons}>
          <button className={styles.cancelButton} onClick={onClose}>
            취소하기
          </button>
          <button className={styles.joinButton}>
            챌린지 참가하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChallengeDetailModal; 