import React, { useState, useRef, useEffect } from 'react';
import styles from './Ocr.module.scss';
import cameraIcon from '../../../../assets/camera.png';
import { useNavigate, useParams } from 'react-router-dom';
import NoSpend from '../../../../components/modals/NoSpend';
import EasySubmit from '../../../../components/modals/EasySubmit';
import axios from 'axios';

// JWT 토큰에서 user_id를 추출하는 함수
const getUserIdFromToken = (token: string): number | null => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    const payload = JSON.parse(jsonPayload);
    return payload.user_id;
  } catch (error) {
    console.error('Failed to decode token:', error);
    return null;
  }
};

const Ocr: React.FC = () => {
  const navigate = useNavigate();  // useNavigate 훅 사용
  const { id: challengeId } = useParams<{ id: string }>();
  const [showAmountModal, setShowAmountModal] = useState<boolean>(false);
  const [amount, setAmount] = useState<string>('');
  const [showAmountInfo, setShowAmountInfo] = useState<boolean>(false);
  const [showSubmitButton, setShowSubmitButton] = useState<boolean>(false);
  const [balance, setBalance] = useState<number | null>(null);
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

  // 잔액 조회 함수
  const fetchBalance = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token || !challengeId) return;

      const response = await axios.get(
        `http://localhost:8000/api/challenges/${challengeId}/participants/`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data && response.data.length > 0) {
        const userId = getUserIdFromToken(token);
        const myParticipation = response.data.find(
          (participant: any) => participant.user_id === userId
        );
        
        if (myParticipation) {
          setBalance(myParticipation.balance);
        }
      }
    } catch (error) {
      console.error('잔액 조회 실패:', error);
    }
  };

  // 컴포넌트 마운트 시 잔액 조회
  useEffect(() => {
    fetchBalance();
  }, [challengeId]);

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

  // 간편 제출 처리 함수 (금액 입력 시)
  const handleAmountSubmit = (submittedAmount: string): void => {
    setAmount(submittedAmount);
    setShowAmountInfo(true);
    setShowSubmitButton(true);
    setShowAmountModal(false);
  };

  // 최종 제출 처리 함수
  const handleSubmit = async (): Promise<void> => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token || !challengeId) {
        alert('로그인이 필요합니다.');
        navigate('/login');
        return;
      }

      setIsLoading(true);
      const amountNumber = parseInt(amount);

      // 간편 인증 API 호출
      const response = await axios.post(
        `http://localhost:8000/api/challenges/${challengeId}/expenses/verifications/simple/`,
        { amount: amountNumber },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data) {
        // 새로운 잔액으로 업데이트
        setBalance(response.data.remaining_balance);
        navigate('/challenge/ocr-complete');
      }
    } catch (error) {
      console.error('간편 인증 처리 중 오류:', error);
      if (axios.isAxiosError(error)) {
        alert(error.response?.data?.error || '처리 중 오류가 발생했습니다.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // EasySubmit 컴포넌트에 currentBalance prop 전달을 위한 타입 정의
  interface EasySubmitProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (amount: string) => void;
    amount: string;
    onAmountChange: (amount: string) => void;
    currentBalance?: number | null;
  }

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
          <p>남은 금액 {balance?.toLocaleString() || 0}원에서</p>
          <p>{parseInt(amount).toLocaleString()}원이 차감됩니다</p>
          <p>차감 후 금액: <span style={{ 
            color: (balance !== null ? balance - parseInt(amount) : 0) < 0 ? '#FF0004' : 'inherit' 
          }}>
            {(balance !== null ? balance - parseInt(amount) : 0).toLocaleString()}원
          </span></p>
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
        currentBalance={balance}
      />
    </div>
  );
};

export default Ocr;
