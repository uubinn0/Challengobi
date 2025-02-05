import React, { useState, FormEvent, ChangeEvent, MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import './SignUpForm.css';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { ko } from 'date-fns/locale';

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  nickname: string;
  gender: string;
  phone: string;
  birthDate: Date;
  occupation: string;
}

const SignUpForm: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    nickname: '',
    gender: '',
    phone: '',
    birthDate: new Date(),
    occupation: ''
  });
  
  const [showVerification, setShowVerification] = useState<boolean>(false);
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [isDuplicateChecked, setIsDuplicateChecked] = useState<boolean>(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState<boolean>(false);
  const [showPopup, setShowPopup] = useState<boolean>(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (name === 'email' || name === 'nickname') {
      setIsDuplicateChecked(false);
    }
  };
  
  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    setShowPopup(true);
  };

  const handleLogin = (): void => {
    navigate('/login');
  };

  const handleSendVerification = (e: MouseEvent<HTMLButtonElement>): void => {
    e.preventDefault();
    setShowVerification(true);
  };

  const handleVerify = (e: MouseEvent<HTMLButtonElement>): void => {
    e.preventDefault();
    setIsVerified(true);
  };

  const handleDuplicateCheck = (e: MouseEvent<HTMLButtonElement>): void => {
    e.preventDefault();
    setIsDuplicateChecked(true);
  };

  const handleDateChange = (date: Date | null): void => {
    if (date) {
      setFormData(prev => ({
        ...prev,
        birthDate: date
      }));
    }
    setIsCalendarOpen(false);
  };

  const handleCalendarClick = (e: MouseEvent<HTMLInputElement>): void => {
    e.preventDefault();
    setIsCalendarOpen(true);
  };

  const handleCategoryClick = (category: string): void => {
    setSelectedCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(item => item !== category);
      } else {
        return [...prev, category];
      }
    });
  };

  const handleCancel = (): void => {
    setShowPopup(false);
    setSelectedCategories([]);
  };

  const handleComplete = (): void => {
    if (selectedCategories.length > 0) {
      navigate('/login/success');
    }
  };

  const handleVerificationCodeChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setVerificationCode(e.target.value);
  };

  return (
    <div className="signup-container">
      <h2 className="signup-title">회원가입</h2>
      <div className="signup-form">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>이메일</label>
            <div className="input-with-button">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="이메일을 입력하세요"
              />
              <button 
                type="button" 
                onClick={showVerification ? handleVerify : handleSendVerification}
                className="verify-button"
                disabled={isVerified}
              >
                {isVerified ? '인증완료' : (showVerification ? '인증하기' : '인증번호 발송')}
              </button>
            </div>
          </div>

          {showVerification && (
            <div className="form-group">
              <label>인증번호</label>
              <div className="input-with-button">
                <input
                  type="text"
                  value={verificationCode}
                  onChange={handleVerificationCodeChange}
                  placeholder="인증번호를 입력하세요"
                  disabled={isVerified}
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label>비밀번호</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="비밀번호를 입력하세요"
            />
          </div>

          <div className="form-group">
            <label>비밀번호 확인</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="비밀번호를 다시 입력하세요"
            />
          </div>

          <div className="form-group">
            <label>이름</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="이름을 입력하세요"
            />
          </div>

          <div className="form-group">
            <label>닉네임</label>
            <div className="input-with-button">
              <input
                type="text"
                name="nickname"
                value={formData.nickname}
                onChange={handleChange}
                placeholder="닉네임을 입력하세요"
              />
              <button 
                type="button" 
                onClick={handleDuplicateCheck}
                className="check-button"
                disabled={isDuplicateChecked}
              >
                {isDuplicateChecked ? '중복확인 완료' : '중복확인'}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>성별</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
            >
              <option value="">성별을 선택하세요</option>
              <option value="male">남성</option>
              <option value="female">여성</option>
            </select>
          </div>

          <div className="form-group">
            <label>휴대폰번호</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="휴대폰번호를 입력하세요"
            />
          </div>

          <div className="form-group">
            <label>생년월일</label>
            <div className="calendar-wrapper">
              <DatePicker
                selected={formData.birthDate}
                onChange={handleDateChange}
                dateFormat="yyyy년 MM월 dd일"
                className="date-picker"
                showYearDropdown
                showMonthDropdown
                dropdownMode="select"
                placeholderText="생년월일을 선택하세요"
                yearDropdownItemNumber={100}
                scrollableYearDropdown
                locale={ko}
                maxDate={new Date()}
                minDate={new Date('1900-01-01')}
                open={isCalendarOpen}
                onClickOutside={() => setIsCalendarOpen(false)}
                customInput={
                  <input
                    type="text"
                    className="custom-datepicker-input"
                    onClick={handleCalendarClick}
                    onKeyDown={(e) => e.preventDefault()}
                    readOnly
                    autoComplete="off"
                  />
                }
              />
            </div>
          </div>

          <div className="form-group">
            <label>직업</label>
            <select
              name="occupation"
              value={formData.occupation}
              onChange={handleChange}
            >
              <option value="">직업을 선택해주세요</option>
              <option value="student">학생</option>
              <option value="employee">회사원</option>
              <option value="self-employed">자영업</option>
              <option value="other">기타</option>
            </select>
          </div>

          <button type="submit" className="submit-button">
            가입하기
          </button>

          <button
            type="button"
            className="login-link-button"
            onClick={handleLogin}
          >
            로그인하러가기
          </button>
        </form>
      </div>

      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h3>가입이 다 됐어요!</h3>
            <p>어떤 소식을 들려고 왔나요?</p>
            <div className="popup-buttons">
              {[
                '연애', '일상', 'MBTI/심리',
                '국내', '글로벌', '음식',
                '취미/여가', '문화/예술', '기타'
              ].map((category) => (
                <button
                  key={category}
                  className={`popup-button ${selectedCategories.includes(category) ? 'selected' : ''}`}
                  onClick={() => handleCategoryClick(category)}
                >
                  {category}
                </button>
              ))}
            </div>
            <div className="popup-action-buttons">
              <button className="cancel-button" onClick={handleCancel}>
                취소
              </button>
              <button 
                type='submit'
                className="complete-button" 
                onClick={handleComplete}
                disabled={selectedCategories.length === 0}
              >
                완료
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignUpForm;