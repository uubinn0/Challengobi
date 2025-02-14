import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './SuccessModal.module.scss';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SuccessModal: React.FC<SuccessModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleButtonClick = () => {
    onClose();
    navigate('/challenge'); // 내 챌린지 페이지로 이동
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.message}>챌린지를 생성했습니다!</h2>
        <button onClick={handleButtonClick} className={styles.button}>
          내 챌린지 바로가기
        </button>
      </div>
    </div>
  );
};

export default SuccessModal; 