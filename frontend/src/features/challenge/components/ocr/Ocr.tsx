import React, { useState } from 'react';
import './Ocr.css';
import cameraIcon from '../../../../assets/camera.png';
import { useNavigate } from 'react-router-dom';
import NoSpend from '../../../../components/modals/NoSpend';
import EasySubmit from '../../../../components/modals/EasySubmit';

const Ocr: React.FC = () => {
  const [showAmountModal, setShowAmountModal] = useState<boolean>(false);
  const [amount, setAmount] = useState<string>('');
  const [showAmountInfo, setShowAmountInfo] = useState<boolean>(false);
  const [showSubmitButton, setShowSubmitButton] = useState<boolean>(false);
  const totalAmount: number = 50000;
  const navigate = useNavigate();
  const [showNoSpendModal, setShowNoSpendModal] = useState<boolean>(false);

  const handleNoSpendClick = (): void => {
    setShowNoSpendModal(true);
  };

  const handleCloseNoSpendModal = (): void => {
    setShowNoSpendModal(false);
  };

  const handleImageSubmit = (): void => {
    navigate('/challenge/consum-image');
  };

  const handleSubmit = (): void => {
    navigate('/challenge/ocr-complete');
  };

  const handleAmountSubmit = (submittedAmount: string): void => {
    setAmount(submittedAmount);
    setShowAmountInfo(true);
    setShowSubmitButton(true);
  };

  return (
    <div className="ocr-container">
      <div className="title-box">
        <h2>고비 인증하기</h2>
        <p>
          사용 내역 캡처를 업로드해<br />
          편리하게 인증하세요!
        </p>
      </div>

      <div className="button-container">
        <button 
          className="submit-button"
          onClick={handleImageSubmit}
        >
          <div className="button-content">
            <span>제출내역 <br/> 이미지 제출</span>
            <span className="camera-icon">
              <img src={cameraIcon} alt="카메라 아이콘" />
            </span>
          </div>
        </button>

        <button 
          className="submit-button"
          onClick={() => setShowAmountModal(true)}
        >
          <div className="button-content">
            <span>간편제출</span>
          </div>
        </button>
      </div>

      {showAmountInfo && (
        <div className="amount-info">
          <p>남은 금액 {totalAmount}원에서</p>
          <p>{amount}원이 차감돼요</p>
          <p>남은 금액: <span style={{ color: totalAmount - parseInt(amount) < 0 ? '#FF0004' : 'inherit' }}>
            {totalAmount - parseInt(amount)}원
          </span>
          </p>
        </div>
      )}

      {showSubmitButton && (
        <button 
          className="submit-action-button"
          onClick={handleSubmit}
        >
          제출
        </button>
      )}

      <button className="no-spend-button" onClick={handleNoSpendClick}>
        오늘 소비하지 않았어요
      </button>
      
      <NoSpend 
        isOpen={showNoSpendModal} 
        onClose={handleCloseNoSpendModal}
      />

      <EasySubmit 
        isOpen={showAmountModal}
        onClose={() => setShowAmountModal(false)}
        onSubmit={handleAmountSubmit}
        amount={amount}
        onAmountChange={setAmount}
      />
    </div>
  );
};

export default Ocr;
