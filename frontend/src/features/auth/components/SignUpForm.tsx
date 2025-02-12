import React, { useState, FormEvent, ChangeEvent, MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { ko } from 'date-fns/locale';
import KeywordSelect from '../../../components/modals/KeywordSelect';
import type { UserProfile } from '../types/user';
import { initialUserProfile } from '../types/user';
import { existingNicknames } from '../data/dummyNicknames';
import styles from './SignUpForm.module.scss';

const SignUpForm: React.FC = () => {
  const navigate = useNavigate();
  const [showKeywordPopup, setShowKeywordPopup] = useState<boolean>(false);
  const [formData, setFormData] = useState<UserProfile>({
    ...initialUserProfile
  });
  
  const [showVerification, setShowVerification] = useState<boolean>(false);
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [isDuplicateChecked, setIsDuplicateChecked] = useState<boolean>(false);
  const [isUserIdDuplicateChecked, setIsUserIdDuplicateChecked] = useState<boolean>(false);
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [passwordsMatch, setPasswordsMatch] = useState(true);

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
    
    if (!isDuplicateChecked) {
      alert('닉네임 중복 확인이 필요합니다.');
      return;
    }

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
    
    const isNicknameTaken = existingNicknames.includes(formData.nickname);
    
    if (isNicknameTaken) {
      alert('이미 사용 중인 닉네임입니다!');
      return;
    }

    setIsDuplicateChecked(true);
    alert('사용 가능한 닉네임입니다!');
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

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          profileImage: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePasswordConfirmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const confirmValue = e.target.value;
    setPasswordConfirm(confirmValue);
    setPasswordsMatch(confirmValue === formData.password);
  };

  const isFormValid = () => {
    return (
      formData.email.trim() !== '' &&
      verificationCode.trim() !== '' &&
      formData.userId.trim() !== '' &&
      formData.password.trim() !== '' &&
      passwordConfirm.trim() !== '' &&
      passwordsMatch &&
      formData.nickname.trim() !== '' &&
      formData.gender !== '' &&
      formData.birthDate !== null &&
      formData.occupation !== '' &&
      formData.introduction.trim() !== '' &&
      isVerified &&
      isUserIdDuplicateChecked &&
      isDuplicateChecked &&
      passwordsMatch
    );
  };


  return (
    <div className={styles.signupContainer}>
      <h2 className={styles.signupTitle}>회원가입</h2>
      <div className={styles.signupForm}>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label>이메일</label>
            <div className={styles.inputWithButton}>
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
                  className={styles.verifyButton}
                >
                  인증번호 발송
                </button>
              )}
            </div>
          </div>

          {showVerification && (
            <div className={styles.formGroup}>
              <label>인증번호</label>
              <div className={styles.inputWithButton}>
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
                  className={styles.verifyButton}
                  disabled={isVerified}
                >
                  {isVerified ? '인증완료' : '인증하기'}
                </button>
              </div>
            </div>
          )}

          <div className={styles.formGroup}>
            <label>아이디</label>
            <div className={styles.inputWithButton}>
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
                className={styles.checkButton}
                disabled={isUserIdDuplicateChecked}
              >
                {isUserIdDuplicateChecked ? '중복확인 완료' : '중복확인'}
              </button>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>비밀번호</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="비밀번호를 입력하세요"
            />
          </div>

          <div className={styles.formGroup}>
            <label>비밀번호 확인</label>
            <input
              type="password"
              value={passwordConfirm}
              onChange={handlePasswordConfirmChange}
            />
            {!passwordsMatch && (
              <span className={styles.errorMessage}>
                비밀번호가 일치하지 않습니다.
              </span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label>닉네임</label>
            <div className={styles.inputWithButton}>
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
                className={styles.checkButton}
                disabled={isDuplicateChecked}
              >
                {isDuplicateChecked ? '중복확인 완료' : '중복확인'}
              </button>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>성별</label>
            <div className={styles.genderButtons}>
              <button
                type="button"
                className={`${styles.genderButton} ${formData.gender === '남' ? styles.selected : ''}`}
                onClick={() => setFormData({ ...formData, gender: '남' })}
              >
                남
              </button>
              <button
                type="button"
                className={`${styles.genderButton} ${formData.gender === '여' ? styles.selected : ''}`}
                onClick={() => setFormData({ ...formData, gender: '여' })}
              >
                여
              </button>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>생년월일</label>
            <div className={styles.calendarWrapper}>
              <DatePicker
                selected={formData.birthDate}
                onChange={handleDateChange}
                dateFormat="yyyy년 MM월 dd일"
                className={styles.dateInput}
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
                    className={styles.reactDatepickerHeaderDropdown}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className={styles.reactDatepickerYearDropdownContainer}>
                      <select
                        value={date.getFullYear()}
                        onChange={(e) => {
                          e.stopPropagation();
                          changeYear(Number(e.target.value));
                        }}
                        className={styles.reactDatepickerYearSelect}
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
                        className={styles.reactDatepickerMonthSelect}
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
                    className={styles.dateInput}
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

          <div className={styles.formGroup}>
            <label>직업</label>
            <select
              name="occupation"
              value={formData.occupation}
              onChange={handleChange}
            >
              <option value="">직업을 선택해주세요</option>
              <option value="student">학생(초/중/고)</option>
              <option value="university">대학(원)생</option>
              <option value="jobseeker">취업준비생</option>
              <option value="employee">직장인</option>
              <option value="housewife">주부</option>
              <option value="freelancer">프리랜서</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>프로필 이미지</label>
            <div className={styles.profileImageUpload}>
              {formData.profileImage && (
                <img 
                  src={formData.profileImage} 
                  alt="프로필 미리보기" 
                  className={styles.profilePreview} 
                />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className={styles.imageInput}
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>한줄 소개</label>
            <input
              type="text"
              name="introduction"
              value={formData.introduction}
              onChange={handleChange}
              placeholder="자신을 한 줄로 소개해주세요"
            />
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={!isFormValid()}
            style={{ 
              opacity: isFormValid() ? 1 : 0.5,
              cursor: isFormValid() ? 'pointer' : 'not-allowed'
            }}
          >
            회원가입하기
          </button>

          <div className={styles.loginLinkWrapper}>
            <span className={styles.loginQuestion}>이미 계정이 있으신가요?</span>
            <button
              type="button"
              className={styles.loginLinkButton}
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