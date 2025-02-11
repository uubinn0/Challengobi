import React, { useState, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ProfileEdit.module.scss';
import type { UserProfile } from '../../auth/types/user';
import { existingNicknames } from '../../auth/data/dummyNicknames';

const ProfileEdit: React.FC = () => {
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState<boolean>(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['외식', '술/담배']);
  
  // userData state를 먼저 선언
  const [userData, setUserData] = useState<UserProfile>({
    email: 'ssafy@ssafy.com',
    userId: 'ssafy',
    password: '********',
    confirmPassword: '********',
    nickname: '쿨비',
    gender: '남성',
    birthDate: new Date('2025-01-22'),
    occupation: '취업준비생',
    profileImage: '/profile-fish.png',
    introduction: '돈을 적당히 쓰자',
    keywords: ['외식', '술/담배']
  });

  const [isNicknameChecked, setIsNicknameChecked] = useState<boolean>(false);
  const [tempNickname, setTempNickname] = useState<string>(userData.nickname);

  const handlePasswordChange = () => {
    navigate('/login/password');  // PasswordForm으로 이동
  };

  const handleKeywordChange = () => {
    setShowPopup(true);
  };

  const handleCategoryClick = (category: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(item => item !== category);
      } else {
        return [...prev, category];
      }
    });
  };

  const handleCancel = () => {
    setShowPopup(false);
    setSelectedCategories(['외식', '술/담배']); // 원래 값으로 복구
  };

  const handleComplete = () => {
    if (selectedCategories.length > 0) {
      setShowPopup(false);
      // TODO: 선택된 카테고리 저장 로직
    }
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserData(prev => ({
          ...prev,
          profileImage: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNicknameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setTempNickname(e.target.value);
    setIsNicknameChecked(false); // 닉네임이 변경되면 중복체크 상태 초기화
  };

  const handleNicknameCheck = () => {
    // 현재 사용자의 닉네임은 중복 체크에서 제외
    const isNicknameTaken = existingNicknames.some(
      nickname => nickname === tempNickname && nickname !== userData.nickname
    );

    if (isNicknameTaken) {
      alert('이미 사용 중인 닉네임입니다!');
      return;
    }

    setIsNicknameChecked(true);
    setUserData(prev => ({
      ...prev,
      nickname: tempNickname
    }));
    alert('사용 가능한 닉네임입니다!');
  };

  const handleSave = () => {
    if (!isNicknameChecked && userData.nickname !== tempNickname) {
      alert('닉네임 중복 확인이 필요합니다.');
      return;
    }

    // TODO: API 연동 시 저장 로직 구현
    console.log('저장된 사용자 정보:', userData);
    alert('프로필이 수정되었습니다.');
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.profileImage}>
          <img src={userData.profileImage} alt="프로필 이미지" />
        </div>
        <input
          type="file"
          id="profileImage"
          accept="image/*"
          onChange={handleImageChange}
          style={{ display: 'none' }}
        />
        <button 
          className={styles.editButton}
          onClick={() => document.getElementById('profileImage')?.click()}
        >
          사진 변경하기
        </button>
      </div>

      <div className={styles.form}>
        <div className={styles.formGroup}>
          <label>이메일</label>
          <input type="email" value={userData.email} readOnly />
        </div>

        <div className={styles.formGroup}>
          <label>비밀번호</label>
          <div className={styles.inputWithButton}>
            <input type="password" value={userData.password} readOnly />
            <button 
              className={styles.changeButton}
              onClick={handlePasswordChange}
            >
              비밀번호 변경
            </button>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label>한줄 소개</label>
          <div className={styles.inputWithButton}>
            <input
              type="text"
              name="introduction"
              value={userData.introduction}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label>닉네임</label>
          <div className={styles.inputWithButton}>
            <input
              type="text"
              name="nickname"
              value={tempNickname}
              onChange={handleNicknameChange}
            />
            <button 
              className={styles.checkButton}
              onClick={handleNicknameCheck}
              disabled={isNicknameChecked && tempNickname === userData.nickname}
            >
              {isNicknameChecked ? '확인 완료' : '중복 확인'}
            </button>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label>아이디</label>
          <input type="text" value={userData.userId} readOnly />
        </div>

        <div className={styles.formGroup}>
          <label>성별</label>
          <input type="text" value={userData.gender} />
        </div>

        <div className={styles.formGroup}>
          <label>생년월일</label>
          <input type="text" value={userData.birthDate?.toISOString().split('T')[0]} />
        </div>

        <div className={styles.formGroup}>
          <label>직업</label>
          <div className={styles.inputWithButton}>
            <select
              name="occupation"
              value={userData.occupation}
              onChange={handleInputChange}
              className={styles.selectInput}
            >
              <option value="student">학생(초/중/고)</option>
              <option value="university">대학(원)생</option>
              <option value="jobseeker">취업준비생</option>
              <option value="employee">직장인</option>
              <option value="housewife">주부</option>
              <option value="freelancer">프리랜서</option>
            </select>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label>키워드</label>
          <div className={styles.inputWithButton}>
            <input 
              type="text" 
              value={selectedCategories.join(', ')} 
              readOnly 
            />
            <button 
              className={styles.changeButton}
              onClick={handleKeywordChange}
            >
              변경
            </button>
          </div>
        </div>

        <div className={styles.buttons}>
          <button className={styles.deleteButton}>회원 탈퇴</button>
          <button className={styles.saveButton} onClick={handleSave}>
            저장
          </button>
        </div>
      </div>

      {showPopup && (
        <div className={styles.popupOverlay}>
          <div className={styles.popupContent}>
            <h3>키워드 선택</h3>
            <p>관심있는 키워드를 선택해주세요</p>
            <div className={styles.popupButtons}>
              {[
                '외식', '장보기', '카페/디저트',
                '교통', '문화생활', '쇼핑',
                '취미/여가', '술/담배', '기타'
              ].map((category) => (
                <button
                  key={category}
                  className={`${styles.popupButton} ${
                    selectedCategories.includes(category) ? styles.selected : ''
                  }`}
                  onClick={() => handleCategoryClick(category)}
                >
                  {category}
                </button>
              ))}
            </div>
            <div className={styles.popupActionButtons}>
              <button className={styles.cancelButton} onClick={handleCancel}>
                취소
              </button>
              <button 
                className={styles.completeButton} 
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

export default ProfileEdit; 