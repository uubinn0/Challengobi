import React, { useState, ChangeEvent, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './ProfileEdit.module.scss';
import { existingNicknames } from '../../auth/data/dummyNicknames';
import ConfirmModal from '../../../components/modals/ConfirmModal';
import { accountApi } from '../api';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { ko } from 'date-fns/locale';

// 타입 정의 추가
interface ProfileData {
  id: number;
  email: string;
  nickname: string;
  sex: 'M' | 'F';
  birth_date: string;
  career: number;
  challenge_streak: number;
  follower_count: number;
  following_count: number;
  introduction: string | null;
  is_following: boolean;
  profile_image: string | null;
  total_saving: number;
}

const ProfileEdit: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const initialProfileData = location.state?.profileData as ProfileData;
  const [showPopup, setShowPopup] = useState<boolean>(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  
  // userData state 선언
  const [userData, setUserData] = useState<ProfileData>({
    id: initialProfileData?.id || 0,
    email: initialProfileData?.email || '',
    nickname: initialProfileData?.nickname || '',
    sex: initialProfileData?.sex || 'M',
    birth_date: initialProfileData?.birth_date || '',
    career: initialProfileData?.career || 0,
    challenge_streak: initialProfileData?.challenge_streak || 0,
    follower_count: initialProfileData?.follower_count || 0,
    following_count: initialProfileData?.following_count || 0,
    introduction: initialProfileData?.introduction || '',
    is_following: initialProfileData?.is_following || false,
    profile_image: initialProfileData?.profile_image || null,
    total_saving: initialProfileData?.total_saving || 0
  });

  const [isNicknameChecked, setIsNicknameChecked] = useState<boolean>(false);
  const [tempNickname, setTempNickname] = useState<string>('');

  // 성별 선택 상태 추가
  const [selectedGender, setSelectedGender] = useState<string>(
    initialProfileData?.sex === 'M' ? '남' : 
    initialProfileData?.sex === 'F' ? '여' : ''
  );

  const [birthDate, setBirthDate] = useState<Date | null>(
    initialProfileData?.birth_date ? new Date(initialProfileData.birth_date) : null
  );

  // 컴포넌트 마운트 시 전달받은 데이터로 초기화
  useEffect(() => {
    if (initialProfileData) {
      console.log('전달받은 프로필 데이터:', initialProfileData);
      setUserData(prev => ({
        ...prev,
        email: initialProfileData.email,
        nickname: initialProfileData.nickname,
        sex: initialProfileData.sex,
        birth_date: initialProfileData.birth_date,
        career: initialProfileData.career,
        challenge_streak: initialProfileData.challenge_streak,
        follower_count: initialProfileData.follower_count,
        following_count: initialProfileData.following_count,
        introduction: initialProfileData.introduction,
        is_following: initialProfileData.is_following,
        profile_image: initialProfileData.profile_image,
        total_saving: initialProfileData.total_saving
      }));
      setSelectedCategories(initialProfileData.categories || []);
      setTempNickname(initialProfileData.nickname);
      setSelectedGender(initialProfileData.sex === 'M' ? '남' : initialProfileData.sex === 'F' ? '여' : '');
      setBirthDate(initialProfileData.birth_date ? new Date(initialProfileData.birth_date) : null);
    } else {
      // 데이터가 없는 경우 API로 로드
      loadUserProfile();
    }
  }, [initialProfileData]);

  const loadUserProfile = async () => {
    try {
      const profileData = await accountApi.getMyProfile();
      console.log('API로 받아온 프로필 데이터:', profileData);
      setUserData(prev => ({
        ...prev,
        nickname: profileData.nickname,
        // API 응답에 맞게 다른 필드들도 설정
      }));
      setSelectedCategories(profileData.categories || []);
      setTempNickname(profileData.nickname);
      setSelectedGender(profileData.sex === 'M' ? '남' : profileData.sex === 'F' ? '여' : '');
      setBirthDate(profileData.birth_date ? new Date(profileData.birth_date) : null);
    } catch (error) {
      console.error('프로필 로드 실패:', error);
      alert('프로필 정보를 불러오는데 실패했습니다.');
    }
  };

  // userData가 변경될 때마다 콘솔에 출력
  useEffect(() => {
    console.log('현재 userData:', userData);
  }, [userData]);

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
          profile_image: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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

  const handleSave = async () => {
    if (!isNicknameChecked && userData.nickname !== tempNickname) {
      alert('닉네임 중복 확인이 필요합니다.');
      return;
    }

    try {
      await accountApi.updateProfile({
        user_id: userData.id,
        nickname: userData.nickname,
        categories: selectedCategories,
        // 다른 필드들도 필요에 따라 추가
      });
      
      alert('프로필이 수정되었습니다.');
      navigate('/profile');
    } catch (error) {
      console.error('프로필 수정 실패:', error);
      alert('프로필 수정에 실패했습니다.');
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await accountApi.deleteAccount(userData.id);
      alert('회원 탈퇴가 완료되었습니다.');
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      navigate('/');
    } catch (error) {
      console.error('회원 탈퇴 실패:', error);
      alert('회원 탈퇴에 실패했습니다.');
    }
  };

  // 성별 선택 핸들러 추가
  const handleGenderSelect = (gender: string) => {
    setSelectedGender(gender);
    setUserData(prev => ({
      ...prev,
      sex: gender === '남' ? 'M' : 'F'
    }));
  };

  // 직업 매핑 함수
  const getCareerDisplay = (career: number) => {
    const careerMap: { [key: number]: string } = {
      1: '학생(초/중/고)',
      2: '대학(원)생',
      3: '취업준비생',
      4: '직장인',
      5: '주부',
      6: '프리랜서'
    };
    return careerMap[career] || '';
  };

  const handleDateChange = (date: Date | null) => {
    setBirthDate(date);
    if (date) {
      const formattedDate = date.toISOString().split('T')[0];
      setUserData(prev => ({
        ...prev,
        birth_date: formattedDate
      }));
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.profileImage}>
          <img src={userData.profile_image || '/default-profile.jpg'} alt="프로필 이미지" />
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
            value={userData.email} 
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
              value={userData.introduction || ''}
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
              disabled={isNicknameChecked && tempNickname === initialProfileData?.nickname}
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
              className={`${styles.genderButton} ${userData.sex === 'M' ? styles.selected : ''}`}
              onClick={() => handleGenderSelect('M')}
            >
              남
            </button>
            <button
              type="button"
              className={`${styles.genderButton} ${userData.sex === 'F' ? styles.selected : ''}`}
              onClick={() => handleGenderSelect('F')}
            >
              여
            </button>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label>생년월일</label>
          <div className={styles.calendarWrapper}>
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
                  value={birthDate ? birthDate.toLocaleDateString('ko-KR', {
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
            name="career"
            value={userData.career}
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
          <button 
            className={styles.deleteButton} 
            onClick={() => setShowDeleteConfirm(true)}
          >
            회원 탈퇴
          </button>
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

      <ConfirmModal
        isOpen={showDeleteConfirm}
        message="정말로 탈퇴하시겠습니까?"
        onConfirm={handleDeleteAccount}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
};

export default ProfileEdit; 