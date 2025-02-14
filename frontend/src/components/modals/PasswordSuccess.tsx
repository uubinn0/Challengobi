import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './PasswordSuccess.module.scss';

interface PasswordSuccessProps {
  isOpen: boolean;
  onClose: () => void;
}

const PasswordSuccess: React.FC<PasswordSuccessProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleLogin = () => {
    onClose();
    navigate('/login');
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2 className={styles.title}>비밀번호 재설정 완료</h2>
        <p className={styles.message}>다시 로그인해 주세요</p>
        <button 
          className={styles.loginButton}
          onClick={handleLogin}
        >
          로그인 하러 가기
        </button>
      </div>
    </div>
  );
};

export default PasswordSuccess;
