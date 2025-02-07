import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import "./PasswordForm.css";

const PasswordForm: React.FC = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState<string>('');
    const [showVerification, setShowVerification] = useState<boolean>(false);
    const [verificationCode, setVerificationCode] = useState<string>('');
    const [isVerified, setIsVerified] = useState<boolean>(false);

    const handleSendVerification = (): void => {
        setShowVerification(true);
    };

    const handleVerify = (): void => {
        setIsVerified(true);
    };

    const handleLogin = (): void => {
        navigate('/login');
    };

    return (
      <div className="password-reset-container">
        <h2>비밀번호 재설정</h2>
        <div className="input-group">
          <label>이메일</label>
          <div className="input-with-button">
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="가입한 이메일을 입력하세요" 
            />
            {!showVerification && (
              <button 
                type="button"
                className="verify-button"
                onClick={handleSendVerification}
              >
                인증번호 발송
              </button>
            )}
          </div>
          
          {showVerification && (
            <div className="input-group verification-section">
              <label>인증번호</label>
              <div className="input-with-button">
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="인증번호를 입력하세요"
                  disabled={isVerified}
                />
                <button 
                  type="button"
                  className="verify-button"
                  onClick={handleVerify}
                  disabled={isVerified}
                >
                  {isVerified ? '인증완료' : '인증하기'}
                </button>
              </div>
            </div>
          )}
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