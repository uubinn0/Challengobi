import React, { useState, ChangeEvent, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './ProfileEdit.module.scss';
import { existingNicknames } from '../../auth/data/dummyNicknames';
import ConfirmModal from '../../../components/modals/ConfirmModal';
import { accountApi, ProfileUpdateData, ProfileData } from '../api';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { ko } from 'date-fns/locale';
import { DEFAULT_PROFILE_IMAGE } from '../../../constants';

const ProfileEdit: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const initialProfileData = location.state?.profileData as ProfileData;
  const [showPopup, setShowPopup] = useState<boolean>(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  
  // userData state 선언 수정
  const [userData, setUserData] = useState<ProfileData>({
    message: '',
    data: {
      id: 0,
      email: '',
      nickname: '',
      sex: 'M',
      birth_date: '',
      career: 0,
      introduction: null,
      profile_image: null,
      total_saving: 0,
      challenge_categories: {
        cafe: false,
        restaurant: false,
        grocery: false,
        shopping: false,
        culture: false,
        hobby: false,
        drink: false,
        transportation: false,
        etc: false
      },
      my_badge: [],
      complete_challenge: []
    }
  });

  const [isNicknameChecked, setIsNicknameChecked] = useState<boolean>(false);
  const [tempNickname, setTempNickname] = useState<string>('');

  const [birthDate, setBirthDate] = useState<Date | null>(
    initialProfileData?.data?.birth_date ? new Date(initialProfileData.data.birth_date) : null
  );

  const [deletePassword, setDeletePassword] = useState<string>('');

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await accountApi.getMyProfile();
        setUserData(response);
        
        // 서버에서 받은 카테고리 문자열을 쉼표로 분리
        setSelectedCategories(response.data.challenge_categories || []);  // 배열 그대로 사용
        
        setTempNickname(response.data.nickname);
        setBirthDate(response.data.birth_date ? new Date(response.data.birth_date) : null);
      } catch (error) {
        console.error('프로필 로드 실패:', error);
      }
    };

    loadProfile();
  }, []);

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

  const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        // FormData 생성
        const formData = new FormData();
        formData.append('profile_image', file);
        formData.append('user_id', String(userData.data.id));
        formData.append('nickname', userData.data.nickname);
        formData.append('sex', userData.data.sex);
        formData.append('birth_date', userData.data.birth_date);
        formData.append('career', String(userData.data.career));
        formData.append('introduction', userData.data.introduction || '');
        
        // challenge_categories에서 true인 카테고리만 추출
        const selectedCats = Object.entries(userData.data.challenge_categories)
          .filter(([_, value]) => value)
          .map(([key]) => key);
        selectedCats.forEach(category => {
          formData.append('categories', category);
        });

        // 이미지 미리보기 설정
        const previewUrl = URL.createObjectURL(file);
        setUserData(prev => ({
          ...prev,
          data: {
            ...prev.data,
            profile_image: previewUrl
          }
        }));

        // 서버로 전송
        const response = await fetch('http://localhost:8000/api/accounts/me/', {
          method: 'PUT',
          body: formData,
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        });

        if (!response.ok) {
          throw new Error('이미지 업로드 실패');
        }

        alert('프로필 이미지가 업데이트되었습니다.');
        
      } catch (error) {
        console.error('이미지 업로드 실패:', error);
        alert('이미지 업로드에 실패했습니다.');
      }
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      data: {
        ...prev.data,
        [name]: value
      }
    }));
  };

  const handleNicknameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setTempNickname(e.target.value);
    setIsNicknameChecked(false); // 닉네임이 변경되면 중복체크 상태 초기화
  };

  const handleNicknameCheck = () => {
    // 현재 사용자의 닉네임은 중복 체크에서 제외
    const isNicknameTaken = existingNicknames.some(
      nickname => nickname === tempNickname && nickname !== userData.data.nickname
    );

    if (isNicknameTaken) {
      alert('이미 사용 중인 닉네임입니다!');
      return;
    }

    setIsNicknameChecked(true);
    setUserData(prev => ({
      ...prev,
      data: {
        ...prev.data,
        nickname: tempNickname
      }
    }));
    alert('사용 가능한 닉네임입니다!');
  };

  const handleSave = async () => {
    if (!isNicknameChecked && userData.data.nickname !== tempNickname) {
      alert('닉네임 중복 확인이 필요합니다.');
      return;
    }

    try {
      const updateData: ProfileUpdateData = {
        user_id: userData.data.id,
        nickname: userData.data.nickname,
        sex: userData.data.sex,
        birth_date: userData.data.birth_date,
        career: userData.data.career,
        introduction: userData.data.introduction || '',
        categories: selectedCategories,
        phone: ''
      };

      await accountApi.updateProfile(updateData);
      
      // 업데이트된 프로필 데이터 다시 로드
      const updatedProfile = await accountApi.getMyProfile();
      setUserData(updatedProfile);
      
      alert('프로필이 수정되었습니다.');
      // 프로필 수정 화면 유지
    } catch (error) {
      console.error('프로필 수정 실패:', error);
      alert('프로필 수정에 실패했습니다.');
    }
  };

  const handleDeleteAccount = async () => {
    try {
      if (!deletePassword) {
        alert('비밀번호를 입력해주세요.');
        return;
      }

      await accountApi.deleteAccount({
        user_id: userData.data.id,
        password: deletePassword
      });

      alert('회원 탈퇴가 완료되었습니다.');
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      navigate('/');
    } catch (error) {
      console.error('회원 탈퇴 실패:', error);
      alert('비밀번호가 일치하지 않습니다.');
    }
  };

  const handleGenderSelect = (gender: string) => {
    setUserData(prev => ({
      ...prev,
      data: {
        ...prev.data,
        sex: gender === '남' ? 'M' : 'F'
      }
    }));
  };

  const handleDateChange = (date: Date | null) => {
    setBirthDate(date);
    if (date) {
      const formattedDate = date.toISOString().split('T')[0];
      setUserData(prev => ({
        ...prev,
        data: {
          ...prev.data,
          birth_date: formattedDate
        }
      }));
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.profileImage}>
          <img 
            src={userData.data.profile_image || DEFAULT_PROFILE_IMAGE} 
            alt="프로필 이미지"
            className={styles.profileImage}
            onError={(e) => {
              e.currentTarget.src = DEFAULT_PROFILE_IMAGE;
            }}
          />
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
          <input 
            type="email" 
            value={userData.data.email} 
            readOnly 
          />
        </div>

        <div className={styles.formGroup}>
          <label>비밀번호</label>
          <div className={styles.inputWithButton}>
            <input type="password" value="********" readOnly />
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
              value={userData.data.introduction || ''}
              onChange={handleInputChange}
              placeholder="한줄 소개를 입력해주세요"
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
              disabled={isNicknameChecked && tempNickname === userData.data.nickname}
            >
              {isNicknameChecked ? '확인 완료' : '중복 확인'}
            </button>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label>성별</label>
          <div className={styles.genderButtons}>
            <button
              type="button"
              className={`${styles.genderButton} ${userData.data.sex === 'M' ? styles.selected : ''}`}
              onClick={() => handleGenderSelect('남')}
            >
              남
            </button>
            <button
              type="button"
              className={`${styles.genderButton} ${userData.data.sex === 'F' ? styles.selected : ''}`}
              onClick={() => handleGenderSelect('여')}
            >
              여
            </button>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label>생년월일</label>
          <DatePicker
            selected={birthDate}
            onChange={handleDateChange}
            dateFormat="yyyy년 MM월 dd일"
            className={styles.dateInput}
            locale={ko}
            showMonthDropdown
            showYearDropdown
            dropdownMode="select"
            maxDate={new Date()}
            placeholderText="생년월일을 선택하세요"
          />
        </div>

        <div className={styles.formGroup}>
          <label>직업</label>
          <select
            name="career"
            value={userData.data.career}
            onChange={handleInputChange}
            className={styles.selectInput}
          >
            <option value={1}>학생(초/중/고)</option>
            <option value={2}>대학(원)생</option>
            <option value={3}>취업준비생</option>
            <option value={4}>직장인</option>
            <option value={5}>주부</option>
            <option value={6}>프리랜서</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label>키워드</label>
          <div className={styles.inputWithButton}>
            <input 
              type="text" 
              value={Object.entries(userData.data.challenge_categories)
                .filter(([_, value]) => value)
                .map(([key]) => {
                  // 키워드 매핑
                  const categoryMap: { [key: string]: string } = {
                    cafe: '카페/디저트',
                    restaurant: '외식',
                    grocery: '장보기',
                    shopping: '쇼핑',
                    culture: '문화생활',
                    hobby: '취미/여가',
                    drink: '술/담배',
                    transportation: '교통',
                    etc: '기타'
                  };
                  return categoryMap[key];
                })
                .join(', ')} 
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
          <button 
            className={styles.deleteButton} 
            onClick={() => setShowDeleteConfirm(true)}
          >
            회원 탈퇴
          </button>
          <button 
            className={styles.saveButton} 
            onClick={handleSave}
          >
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
              <button 
                className={styles.cancelButton} 
                onClick={handleCancel}
              >
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

      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteAccount}
        title="회원 탈퇴"
        message="정말 탈퇴하시겠습니까?"
      >
        <input
          type="password"
          placeholder="비밀번호를 입력하세요"
          value={deletePassword}
          onChange={(e) => setDeletePassword(e.target.value)}
          className={styles.passwordInput}
        />
      </ConfirmModal>
    </div>
  );
};

export default ProfileEdit; 