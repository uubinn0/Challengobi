import React, { useState, useRef, useEffect } from 'react';
import styles from './Ocr.module.scss';
import cameraIcon from '../../../../assets/camera.png';
import { useNavigate, useParams } from 'react-router-dom';
import NoSpend from '../../../../components/modals/NoSpend';
import EasySubmit from '../../../../components/modals/EasySubmit';
import axios from 'axios';

const Ocr: React.FC = () => {
  const { id: challengeId } = useParams<{ id: string }>();
  const [showAmountModal, setShowAmountModal] = useState<boolean>(false);
  const [amount, setAmount] = useState<string>('');
  const [showAmountInfo, setShowAmountInfo] = useState<boolean>(false);
  const [showSubmitButton, setShowSubmitButton] = useState<boolean>(false);
  const totalAmount: number = 50000;
  const navigate = useNavigate();
  const [showNoSpendModal, setShowNoSpendModal] = useState<boolean>(false);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 디버깅을 위한 로그 추가
  console.log('OCR Component Challenge ID:', challengeId);

  useEffect(() => {
    // 컴포넌트 마운트 시 챌린지 ID 유효성 검사
    if (!challengeId) {
      alert('올바르지 않은 접근입니다.');
      navigate('/challenge');
    }
  }, [challengeId, navigate]);

  const handleNoSpendClick = (): void => {
    setShowNoSpendModal(true);
  };

  const handleCloseNoSpendModal = (): void => {
    setShowNoSpendModal(false);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFiles(event.target.files);
      setShowSubmitButton(true);
    }
  };

  const handleImageSubmit = async () => {
    if (!selectedFiles) {
      alert('이미지를 선택해주세요.');
      return;
    }

    if (!challengeId) {
      alert('챌린지 정보를 찾을 수 없습니다.');
      return;
    }

    // 디버깅을 위한 로그 추가
    console.log('Selected files:', selectedFiles);
    console.log('Challenge ID:', challengeId);

    setIsLoading(true);
    const formData = new FormData();
    // 'image' 대신 'files'로 변경하고, 파일 이름도 함께 전송
    formData.append('files', selectedFiles[0], selectedFiles[0].name);

    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        alert('로그인이 필요합니다.');
        navigate('/login');
        return;
      }

      // 요청 전 formData 내용 확인
      console.log('FormData contents:');
      for (const pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }

      const response = await axios.post(
        `http://localhost:8000/api/challenges/${challengeId}/expenses/ocr/`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          },
          // timeout 설정 추가
          timeout: 90000, // 90초
          withCredentials: true
        }
      );

      if (response.data) {
        // 디버깅을 위한 로그
        console.log('OCR Response data:', response.data);
        
        // 응답 데이터가 배열이 아닌 경우 배열로 변환
        const ocrResults = Array.isArray(response.data) ? response.data : [response.data];
        
        sessionStorage.setItem('currentChallengeId', challengeId);
        sessionStorage.setItem('ocrResults', JSON.stringify(ocrResults));
        navigate('/challenge/consum-image');
      } else {
        throw new Error('OCR 결과가 없습니다.');
      }
    } catch (error) {
      console.error('OCR 처리 중 오류 발생:', error);
      if (axios.isAxiosError(error)) {
        // 에러 응답 상세 정보 출력
        console.error('Error response:', error.response);
        console.error('Error request:', error.request);
        console.error('Error config:', error.config);
        
        if (error.response?.status === 401) {
          alert('인증이 만료되었습니다. 다시 로그인해주세요.');
          localStorage.removeItem('access_token');
          navigate('/login');
          return;
        }

        // 타임아웃 에러 처리
        if (error.code === 'ECONNABORTED') {
          alert('OCR 처리 시간이 초과되었습니다. 다시 시도해주세요.');
          return;
        }
        
        const errorMessage = error.response?.data?.error || '이미지 처리 중 오류가 발생했습니다.';
        alert(errorMessage);
      } else {
        alert('이미지 처리 중 오류가 발생했습니다.');
      }
    } finally {
      setIsLoading(false);
    }
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
    <div className={styles['ocr-container']}>
      <div className={styles['title-box']}>
        <h2>고비 인증하기</h2>
        <p>
          사용 내역 캡처를 업로드해<br />
          편리하게 인증하세요!
        </p>
      </div>

      <div className={styles['button-container']}>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept="image/*"
          multiple
          style={{ display: 'none' }}
        />
        
        <button 
          className={styles['submit-button']}
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
        >
          <div className={styles['button-content']}>
            <span>제출내역 <br/> 이미지 제출</span>
            <span className={styles['camera-icon']}>
              <img src={cameraIcon} alt="카메라 아이콘" />
            </span>
          </div>
        </button>

        <button 
          className={styles['submit-button']}
          onClick={() => setShowAmountModal(true)}
        >
          <div className={styles['button-content']}>
            <span>간편제출</span>
          </div>
        </button>
      </div>

      {showAmountInfo && (
        <div className={styles['amount-info']}>
          <p>남은 금액 {totalAmount}원에서</p>
          <p>{amount}원이 차감돼요</p>
          <p>남은 금액: <span style={{ color: totalAmount - parseInt(amount) < 0 ? '#FF0004' : 'inherit' }}>
            {totalAmount - parseInt(amount)}원
          </span>
          </p>
        </div>
      )}

      {selectedFiles && (
        <div className={styles['selected-files']}>
          <p>선택된 파일: {Array.from(selectedFiles).map(file => file.name).join(', ')}</p>
          <button 
            className={styles['submit-action-button']}
            onClick={handleImageSubmit}
            disabled={isLoading}
          >
            {isLoading ? '처리중...' : '제출하기'}
          </button>
        </div>
      )}

      {showSubmitButton && (
        <button 
          className={styles['submit-action-button']}
          onClick={handleSubmit}
        >
          제출
        </button>
      )}

      <button className={styles['no-spend-button']} onClick={handleNoSpendClick}>
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
