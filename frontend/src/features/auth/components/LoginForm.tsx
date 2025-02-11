import React, { useState, FormEvent } from 'react';
import './LoginForm.css'; 
import { useNavigate } from 'react-router-dom';
import kakaoIcon from '../../../assets/kakao-icon.png';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleLogin = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    // 로그인 로직 구현
  };

  const handleSignUp = (): void => {
    navigate('/login/signup');
  };

  const handlePassword = (): void => {
    navigate('/login/password');
  };

  const handleHomePage = (): void => {
    navigate('/');
  };

  const togglePasswordVisibility = (): void => {
    setShowPassword(!showPassword);
  };
  
  return (
    <div className="login-container">
      <h2 className="login-title">챌린지에 도전하세요</h2>
      
      <form onSubmit={handleLogin}>
        <div className="input-group">
          <input
            type="email"
            placeholder="이메일을 입력하세요"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        
        <div className="input-group">
          <div className="password-input-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="비밀번호를 입력하세요"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button 
              type="button"
              className="password-toggle-btn"
              onClick={togglePasswordVisibility}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          <span className="forgot-password" onClick={handlePassword}>
            비밀번호를 잊으셨나요?
          </span>
        </div>

        <div className="kakao-login">
          <img src={kakaoIcon} alt="카카오 아이콘" />
        </div>

        <button 
        type="submit" 
        className="login-button"
        onClick={handleHomePage}
        >
          로그인</button>
        <button 
          type="button" 
          className="signup-button" 
          onClick={handleSignUp}
        >
          회원가입
        </button>
      </form>
    </div>
  );
};

export default LoginForm;
