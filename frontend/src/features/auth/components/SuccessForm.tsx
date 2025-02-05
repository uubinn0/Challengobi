import React from "react";
import { useNavigate } from "react-router-dom";
import "./SuccessForm.css";

const SuccessForm: React.FC = () => {
  const navigate = useNavigate();

  const handleLogin = (): void => {
    navigate('/login');
  };

  return (
    <div className="signup-success-container">
      <h2>회원가입 성공!</h2>
      <p>이제 챌린지를 시작해 보세요.</p>
      <img src="/images/fish.png" alt="자린고비 아이콘" className="success-image" />
      <p className="success-message">자린고비가 되어보아요</p>
      <button className="login-button" onClick={handleLogin}>로그인 하러 가기</button>
    </div>
  );
}

export default SuccessForm;
