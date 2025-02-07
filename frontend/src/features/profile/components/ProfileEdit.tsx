import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ProfileEdit.module.scss';

const ProfileEdit: React.FC = () => {
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState<boolean>(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['외식', '술담배']); // 현재 선택된 키워드

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
    setSelectedCategories(['외식', '술담배']); // 원래 값으로 복구
  };

  const handleComplete = () => {
    if (selectedCategories.length > 0) {
      setShowPopup(false);
      // TODO: 선택된 카테고리 저장 로직
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.profileImage}>
          <img src="/profile-fish.png" alt="프로필 이미지" />
        </div>
        <button className={styles.editButton}>사진 변경하기</button>
      </div>

      <div className={styles.form}>
        <div className={styles.formGroup}>
          <label>이메일</label>
          <input type="email" value="ssafy@ssafy.com" readOnly />
        </div>

        <div className={styles.formGroup}>
          <label>비밀번호</label>
          <div className={styles.inputWithButton}>
            <input type="password" value="**********" readOnly />
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
            <input type="text" defaultValue="돈을 적당히 쓰자" />
            <button className={styles.changeButton}>변경</button>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label>닉네임</label>
          <div className={styles.inputWithButton}>
            <input type="text" defaultValue="쿨비" />
            <button className={styles.checkButton}>중복 확인</button>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label>이름</label>
          <input type="text" defaultValue="김싸피" />
        </div>

        <div className={styles.formGroup}>
          <label>성별</label>
          <input type="text" defaultValue="남성" />
        </div>

        <div className={styles.formGroup}>
          <label>생년월일</label>
          <input type="text" defaultValue="2025.01.22" />
        </div>

        <div className={styles.formGroup}>
          <label>직업</label>
          <div className={styles.inputWithButton}>
            <input type="text" defaultValue="취업준비생" />
            <button className={styles.changeButton}>변경</button>
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
          <button className={styles.saveButton}>저장</button>
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