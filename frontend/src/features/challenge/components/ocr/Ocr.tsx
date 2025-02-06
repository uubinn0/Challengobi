import React, { useState, ChangeEvent } from 'react';
import './Ocr.css';
import cameraIcon from '../../../../assets/camera.png';
import { useNavigate } from 'react-router-dom';


const Ocr: React.FC = () => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showAmountModal, setShowAmountModal] = useState<boolean>(false);
  const [inputText, setInputText] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [showAmountInfo, setShowAmountInfo] = useState<boolean>(false);
  const [showSubmitButton, setShowSubmitButton] = useState<boolean>(false);
  const confirmText: string = '저는 오늘 소비하지 않았습니다';
  const totalAmount: number = 50000;  // 총 금액 나중에 데이터 받아와서 할당
  const navigate = useNavigate();


  const handleNoSpendClick = (): void => {
    setShowModal(true);
  };

  const handleProgress = (): void => {
    navigate('/challenge/progress');
  };

  const handleCloseModal = (): void => {
    setShowModal(false);
    setInputText('');
  };

  const handleImageSubmit = (): void => {
    navigate('/challenge/consum-image');
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value;
    setInputText(value);
  };

  const handleAmountSubmit = (): void => {
    setShowAmountModal(false);
    setShowAmountInfo(true);
    setShowSubmitButton(true);
  };

  const handleAmountModalClose = (): void => {
    setShowAmountModal(false);
    setAmount('');
  };

  const handleAmountChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setAmount(value);
  };

  const getConfirmText = (): JSX.Element => {
    const text = '저는 오늘 소비하지 않았습니다';
    return (
      <div className="text-overlay">
        {text.split('').map((char, index) => (
          <span key={index} className="char-container">
            {index < inputText.length ? (
              <span className="typed-char">{inputText[index]}</span>
            ) : (
              <span className="guide-char">{char}</span>
            )}
          </span>
        ))}
      </div>
    );
  };

  const handleSubmit = (): void => {
    navigate('/challenge/progress');
  };

  return (
    <div className="ocr-container">
      <div className="title-box">
        <h1>고비 인증하기</h1>
        <p>
          사용 내역 캡처를 업로드해<br />
          편리하게 인증하세요!
        </p>
      </div>

      <div className="button-container">
        <button 
          className="submit-button"
          style={{ backgroundColor: '#DED9D4BD' }}
          onClick={handleImageSubmit}
        >
          <div className="button-content">
            <span>제출내역 이미지제출</span>
            <span className="camera-icon">
              <img src={cameraIcon} alt="카메라 아이콘" />
            </span>
          </div>
        </button>

        <button 
          className="submit-button"
          style={{ backgroundColor: '#DED9D4BD' }}
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
          <p>남은 금액: {totalAmount - parseInt(amount)}원</p>
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
      
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content no-spend-modal">
            <div className="modal-title">정말 오늘 소비내역이 없습니까?</div>
            <div className="modal-message">
              소비내역이 없다면, 아래 문구를 똑같이 입력해주세요.
            </div>
            <div className="modal-input-container">
              <input
                type="text"
                value={inputText}
                onChange={handleInputChange}
                className="modal-input"
              />
              <div className="modal-confirm-text">
                {getConfirmText()}
              </div>
            </div>
            <div className="modal-buttons">
              <button className="modal-button modal-cancel" onClick={handleCloseModal}>
                취소
              </button>
              <button 
                className="modal-button modal-confirm"
                onClick={handleProgress}
                disabled={inputText !== confirmText}
              >
                확인
              </button>

            </div>
          </div>
        </div>
      )}

      {showAmountModal && (
        <div className="modal-overlay">
          <div className="modal-content amount-modal">
            <div className="modal-title">소비한 금액을 작성해주세요.</div>
            <div className="modal-input-container">
              <input
                type="text"
                value={amount}
                onChange={handleAmountChange}
                className="modal-input"
                placeholder="금액을 입력하세요"
              />
            </div>
            <div className="modal-buttons">
              <button className="modal-button modal-cancel" onClick={handleAmountModalClose}>
                취소
              </button>
              <button 
                className="modal-button modal-confirm"
                onClick={handleAmountSubmit}
                disabled={!amount || parseInt(amount) <= 0}
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Ocr;
