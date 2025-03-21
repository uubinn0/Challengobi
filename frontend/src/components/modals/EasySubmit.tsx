import React, { ChangeEvent } from 'react';
import styles from './EasySubmit.module.scss';

interface EasySubmitProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (amount: string) => void;
  amount: string;
  onAmountChange: (amount: string) => void;
}

const EasySubmit: React.FC<EasySubmitProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  amount, 
  onAmountChange 
}) => {
  const formatToKoreanNumber = (value: string): string => {
    const num = parseInt(value);
    if (!num) return '';
    
    const units = ['', '만', '억', '조', '경', '해'];
    let result = '';
    let unitIndex = 0;
    let tempNum = num;
    
    while (tempNum > 0) {
      const part = tempNum % 10000;
      if (part > 0) {
        result = `${part}${units[unitIndex]}${result ? ' ' : ''}${result}`;
      }
      tempNum = Math.floor(tempNum / 10000);
      unitIndex++;
    }
    
    return result;
  };

  const handleAmountChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    
    if (value.length <= 20) {
        const formattedValue = value.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        onAmountChange(value);
        e.target.value = formattedValue;
    }
  };

  const displayAmount = amount ? amount.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '';
  const koreanAmount = amount ? formatToKoreanNumber(amount) : '';

  const handleSubmit = () => {
    onSubmit(amount);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles['modal-overlay']}>
      <div className={styles['amount-modal']}>
        <div className={styles['modal-title']}>소비한 금액을 작성해주세요.</div>
        <div className={styles['modal-input-container']}>
          <div className={styles['input-wrapper']}>
            <input
              type="text"
              value={displayAmount}
              onChange={handleAmountChange}
              className={styles['modal-input']}
              placeholder="금액을 입력하세요"
            />
            <span className={styles['currency-unit']}>원</span>
          </div>
          {koreanAmount && (
            <div className={styles['korean-amount']}>
              {koreanAmount}원
            </div>
          )}
        </div>
        <div className={styles['modal-buttons']}>
          <button className={`${styles['modal-button']} ${styles['modal-cancel']}`} onClick={onClose}>
            취소
          </button>
          <button 
            className={`${styles['modal-button']} ${styles['modal-confirm']}`}
            onClick={handleSubmit}
            disabled={!amount || parseInt(amount) <= 0}
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
};

export default EasySubmit;
