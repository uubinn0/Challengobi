import React, { useState, FormEvent, ChangeEvent, MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import './SignUpForm.css';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { ko } from 'date-fns/locale';
import KeywordSelect from '../../../components/modals/KeywordSelect';

interface FormData {
  email: string;
  userId: string;
  password: string;
  confirmPassword: string;
  name: string;
  nickname: string;
  gender: string;
  birthDate: Date | null;
  occupation: string;
}

const SignUpForm: React.FC = () => {
  const navigate = useNavigate();
  const [showKeywordPopup, setShowKeywordPopup] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    email: '',
    userId: '',
    password: '',
    confirmPassword: '',
    name: '',
    nickname: '',
    gender: '',
    birthDate: null,
    occupation: ''
  });
  
  const [showVerification, setShowVerification] = useState<boolean>(false);
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [isDuplicateChecked, setIsDuplicateChecked] = useState<boolean>(false);
  const [isUserIdDuplicateChecked, setIsUserIdDuplicateChecked] = useState<boolean>(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (name === 'email' || name === 'nickname' || name === 'userId') {
      setIsDuplicateChecked(false);
      if (name === 'userId') {
        setIsUserIdDuplicateChecked(false);
      }
    }
  };
  
  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    setShowKeywordPopup(true);
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
    setFormData(prev => ({
      ...prev,
      birthDate: date
    }));
  };

  const handleVerificationCodeChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setVerificationCode(e.target.value);
  };

  const handleUserIdDuplicateCheck = (e: MouseEvent<HTMLButtonElement>): void => {
    e.preventDefault();
    setIsUserIdDuplicateChecked(true);
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
              {!showVerification && !isVerified && (
                <button 
                  type="button" 
                  onClick={handleSendVerification}
                  className="verify-button"
                >
                  인증번호 발송
                </button>
              )}
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
                <button 
                  type="button" 
                  onClick={handleVerify}
                  className="verify-button"
                  disabled={isVerified}
                >
                  {isVerified ? '인증완료' : '인증하기'}
                </button>
              </div>
            </div>
          )}

          <div className="form-group">
            <label>아이디</label>
            <div className="input-with-button">
              <input
                type="text"
                name="userId"
                value={formData.userId}
                onChange={handleChange}
                placeholder="아이디를 입력하세요"
              />
              <button 
                type="button" 
                onClick={handleUserIdDuplicateCheck}
                className="check-button"
                disabled={isUserIdDuplicateChecked}
              >
                {isUserIdDuplicateChecked ? '중복확인 완료' : '중복확인'}
              </button>
            </div>
          </div>

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
            <div className="gender-buttons">
              <button
                type="button"
                className={`gender-button ${formData.gender === '남' ? 'selected' : ''}`}
                onClick={() => setFormData({ ...formData, gender: '남' })}
              >
                남
              </button>
              <button
                type="button"
                className={`gender-button ${formData.gender === '여' ? 'selected' : ''}`}
                onClick={() => setFormData({ ...formData, gender: '여' })}
              >
                여
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>생년월일</label>
            <div className="calendar-wrapper">
              <DatePicker
                selected={formData.birthDate}
                onChange={handleDateChange}
                dateFormat="yyyy년 MM월 dd일"
                className="date-input"
                locale={ko}
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
                maxDate={new Date()}
                yearDropdownItemNumber={100}
                scrollableYearDropdown
                renderCustomHeader={({
                  date,
                  changeYear,
                  changeMonth,
                }) => (
                  <div 
                    className="react-datepicker__header__dropdown"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="react-datepicker__year-dropdown-container">
                      <select
                        value={date.getFullYear()}
                        onChange={(e) => {
                          e.stopPropagation();
                          changeYear(Number(e.target.value));
                        }}
                        className="react-datepicker__year-select"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {Array.from({ length: 100 }, (_, i) => (
                          <option key={i} value={new Date().getFullYear() - i}>
                            {new Date().getFullYear() - i}년
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <select
                        value={date.getMonth()}
                        onChange={(e) => {
                          e.stopPropagation();
                          changeMonth(Number(e.target.value));
                        }}
                        className="react-datepicker__month-select"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {Array.from({ length: 12 }, (_, i) => (
                          <option key={i} value={i}>
                            {i + 1}월
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
                customInput={
                  <input
                    className="date-input"
                    value={formData.birthDate ? formData.birthDate.toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit'
                    }) : ''}
                    readOnly
                    placeholder="생년월일을 선택하세요"
                    onClick={(e) => e.stopPropagation()}
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
            회원가입하기
          </button>

          <div className="login-link-wrapper">
            <span className="login-question">이미 계정이 있으신가요?</span>
            <button
              type="button"
              className="login-link-button"
              onClick={handleLogin}
            >
              로그인하러가기
            </button>
          </div>
        </form>
      </div>

      <KeywordSelect 
        isOpen={showKeywordPopup}
        onClose={() => setShowKeywordPopup(false)}
        onComplete={() => {
          setShowKeywordPopup(false);
          navigate('/login/success');
        }}
      />
    </div>
  );
};

export default SignUpForm;