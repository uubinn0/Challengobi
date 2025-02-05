import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import "./PasswordForm.css";

const PasswordForm: React.FC = () => {
    const navigate = useNavigate();
    const [showVerification, setShowVerification] = useState<boolean>(false);
    const [verificationCode, setVerificationCode] = useState<string>('');
    const [isVerified, setIsVerified] = useState<boolean>(false);

    const handleLogin = (): void => {
      navigate('/login');
    };

    const handleSendVerification = (): void => {
        setShowVerification(true);
    };

    const handleVerify = (): void => {
        setIsVerified(true);
    };

    return (
      <div className="password-reset-container">
        <h2>비밀번호 재설정</h2>
        <div className="input-group">
          <label>이메일</label>
          <input type="email" placeholder="가입한 이메일을 입력하세요" />
          
          {showVerification && (
          <div className="input-group">
            <label>인증번호</label>
            <input
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              placeholder="인증번호를 입력하세요"
              disabled={isVerified}
            />
          </div>
        )}
          <button 
            className="verify-button"
            onClick={showVerification ? handleVerify : handleSendVerification}
            disabled={isVerified}
          >
            {isVerified ? '인증완료' : (showVerification ? '인증하기' : '인증번호 발송')}
          </button>
        </div>

        

        <div className="input-group">
          <label>비밀번호</label>
          <input type="password" placeholder="비밀번호를 입력하세요" />
        </div>
        <div className="input-group">
          <label>비밀번호 확인</label>
          <input type="password" placeholder="비밀번호를 다시 입력하세요" />
        </div>
        <button
            type="button"
            className="reset-button"
            onClick={handleLogin}
          >
          재설정 완료</button>
      </div>
    );
  };
  
  export default PasswordForm;