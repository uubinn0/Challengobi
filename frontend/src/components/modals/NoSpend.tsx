import React, { ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './NoSpend.module.scss';

interface NoSpendProps {
  isOpen: boolean;
  onClose: () => void;
}

const NoSpend: React.FC<NoSpendProps> = ({ isOpen, onClose }) => {
  const [inputText, setInputText] = React.useState<string>('');
  const navigate = useNavigate();
  const confirmText: string = '저는 오늘 소비하지 않았습니다';

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setInputText(e.target.value);
  };

  const handleProgress = (): void => {
    navigate('/challenge/ocr-complete');
  };

  const getConfirmText = (): JSX.Element => {
    const text = '저는 오늘 소비하지 않았습니다';
    return (
      <div className={styles['text-overlay']}>
        {text.split('').map((char, index) => (
          <span key={index} className={styles['char-container']}>
            {index < inputText.length ? (
              <span className={styles['typed-char']}></span>
            ) : (
              <span className={styles['guide-char']}>{char}</span>
            )}
          </span>
        ))}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className={styles['modal-overlay']}>
      <div className={styles['no-spend-modal']}>
        <div className={styles['modal-title']}>정말 오늘 소비내역이 없습니까?</div>
        <div className={styles['modal-message']}>
          소비내역이 없다면, 아래 문구를 똑같이 입력해주세요.
        </div>
        <div className={styles['modal-input-container']}>
          <input
            type="text"
            value={inputText}
            onChange={handleInputChange}
            className={styles['modal-input']}
          />
          <div className={styles['modal-confirm-text']}>
            {getConfirmText()}
          </div>
        </div>
        <div className={styles['modal-buttons']}>
          <button className={`${styles['modal-button']} ${styles['modal-cancel']}`} onClick={onClose}>
            취소
          </button>
          <button 
            className={`${styles['modal-button']} ${styles['modal-confirm']}`}
            onClick={handleProgress}
            disabled={inputText !== confirmText}
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
};

export default NoSpend;
