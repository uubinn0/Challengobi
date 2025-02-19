import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import searchIcon from '../../../assets/SearchUser-search.png';
import styles from './SearchUser.module.scss';
import { accountApi } from '../../profile/api';

interface User {
  id: number;
  name: string;
  image: string;
}

interface RecommendedUser {
  id: number;
  nickname: string;
  profile_image: string;
  similarity: number;
}

const SearchUser: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [recommendedUsers, setRecommendedUsers] = useState<RecommendedUser[]>([]);
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
            <div key={user.id} className={styles.userItem}>
              <div 
                className={styles.userImage}
                onClick={() => navigate('/profile')}
                style={{ cursor: 'pointer' }}
              >
                <img src={user.profile_image || '/default-profile.jpg'} alt={user.nickname} />
              </div>
              <p className={styles.userName}>{user.nickname}</p>
              <span className={styles.similarity}>
                유사도: {Math.round(user.similarity * 100)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchUser;
