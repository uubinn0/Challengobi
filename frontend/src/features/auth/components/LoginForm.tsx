import React, { useState } from 'react';
import './LoginForm.css'; 
import { useNavigate } from 'react-router-dom';
import kakaoIcon from '../../../assets/kakao-icon.png';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api';
import axios from 'axios';

const LoginForm: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // 입력값 유효성 검사
    if (!email.trim() || !password.trim()) {
      setError('이메일과 비밀번호를 모두 입력해주세요.');
      return;
    }

    // 이메일 형식 검사
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('올바른 이메일 형식이 아닙니다.');
      return;
    }

    try {
      const response = await authApi.login({ email, password });
      
      if (response.tokens.access) {
        // 토큰을 로컬 스토리지에 저장
        localStorage.setItem('access_token', response.tokens.access);
        localStorage.setItem('refresh_token', response.tokens.refresh);
        
        // 사용자 정보 저장
        localStorage.setItem('user_id', String(response.user.id));
        localStorage.setItem('nickname', response.user.nickname);
        localStorage.setItem('email', response.user.email);
        localStorage.setItem('profile_image', response.user.profile_image || '/icons/default-profile.png');
        
        // localStorage 저장 확인을 위한 로그
        console.log('Stored User Info:', {
          access_token: localStorage.getItem('access_token'),
          refresh_token: localStorage.getItem('refresh_token'),
          user_id: localStorage.getItem('user_id'),
          nickname: localStorage.getItem('nickname'),
          email: localStorage.getItem('email'),
          profile_image: localStorage.getItem('profile_image')
        });

        // API 응답 데이터 확인
        console.log('API Response:', response);
        
        // 사용자 정보로 로그인 처리
        login({
          id: String(response.user.id),
          nickname: response.user.nickname,
          profileImage: response.user.profile_image || '/icons/default-profile.png'
        });
        
        navigate('/');
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        // 서버에서 반환하는 에러 메시지 처리
        const errorMessage = err.response?.data?.message || '로그인에 실패했습니다.';
        setError(errorMessage);
      } else {
        setError('이메일 또는 비밀번호가 올바르지 않습니다.');
      }
      setPassword(''); // 비밀번호만 초기화
    }
  };

  const handleSignUp = (): void => {
    navigate('/login/signup');
  };

  const handlePassword = (): void => {
    navigate('/login/password');
  };

  const togglePasswordVisibility = (): void => {
    setShowPassword(!showPassword);
  };
  
  return (
    <div className="login-container">
      <h2 className="login-title">챌린지에 도전하세요</h2>
      
      <form onSubmit={handleLogin}>
        {error && <div className="error-message">{error}</div>}
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
        onClick={handleLogin}
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
