import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import searchIcon from '../../../assets/SearchUser-search.png';
import styles from './SearchUser.module.scss';
import { accountApi } from '../../profile/api';

interface User {
  id: number;
  nickname: string;
  profile_image: string;
  similarity: number;
}

const SearchUser: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [recommendedUsers, setRecommendedUsers] = useState<User[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const loadRecommendations = async () => {
      try {
        const recommendations = await accountApi.getRecommendations();
        setRecommendedUsers(recommendations);
      } catch (error) {
        console.error('추천 사용자 로드 실패:', error);
      }
    };

    loadRecommendations();
  }, []);

  // 사용자 프로필로 이동하는 함수
  const handleUserClick = async (userId: number) => {
    try {
      // 해당 사용자의 프로필 정보를 가져옴
      const userProfile = await accountApi.getUserProfile(userId);
      // 프로필 페이지로 이동하면서 프로필 데이터와 이전 탭 정보를 전달
      navigate(`/profile/${userId}`, { 
        state: { 
          profileData: userProfile,
          previousTab: 'search'  // 검색 탭에서 왔다는 정보 추가
        } 
      });
    } catch (error) {
      console.error('사용자 프로필 로드 실패:', error);
    }
  };

  return (
    <div className={styles.searchContainer}>
      <div className={styles.searchBox}>
        <img src={searchIcon} alt="search" className={styles.searchIcon} />
        <input
          type="text"
          placeholder="검색어를 입력하세요"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button className={styles.searchButton}>검색</button>
      </div>

      <div className={styles.recommendedSection}>
        <h3>나와 비슷한 사용자</h3>
        <div className={styles.userGrid}>
          {recommendedUsers.map(user => (
            <div 
              key={user.id} 
              className={styles.userItem}
              onClick={() => handleUserClick(user.id)}
              style={{ cursor: 'pointer' }}
            >
              <div className={styles.userImage}>
                <img 
                  src={user.profile_image || '/default-profile.jpg'} 
                  alt={user.nickname} 
                />
              </div>
              <p className={styles.userName}>{user.nickname}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchUser;
