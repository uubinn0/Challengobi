import React, { ChangeEvent } from 'react';
import './EasySubmit.css';

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
    <div className="modal-overlay">
      <div className="amount-modal">
        <div className="modal-title">소비한 금액을 작성해주세요.</div>
        <div className="modal-input-container">
          <div className="input-wrapper">
            <input
              type="text"
              value={displayAmount}
              onChange={handleAmountChange}
              className="modal-input"
              placeholder="금액을 입력하세요"
            />
            <span className="currency-unit">원</span>
          </div>
          {koreanAmount && (
            <div className="korean-amount">
              {koreanAmount}원
            </div>
          )}
        </div>
        <div className="modal-buttons">
          <button className="modal-button modal-cancel" onClick={onClose}>
            취소
          </button>
          <button 
            className="modal-button modal-confirm"
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
