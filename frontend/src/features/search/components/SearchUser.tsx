import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './SearchUser.module.scss';
import { accountApi } from '../../profile/api';
import profileTest from '@/assets/profile-test.jpg';

interface User {
  id: number;
  nickname: string;
  profile_image: string;
  similarity: number;
}

const SearchUser: React.FC = () => {
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

  const handleUserClick = async (userId: number) => {
    try {
      const userProfile = await accountApi.getUserProfile(userId);
      const followStatus = await accountApi.getFollowStatus(userId);
      
      navigate(`/profile/${userId}`, { 
        state: { 
          profileData: userProfile,
          isFollowing: followStatus,
          previousTab: 'search'
        } 
      });
    } catch (error) {
      console.error('사용자 프로필 로드 실패:', error);
    }
  };

  return (
    <div className={styles.container}>
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
                  src={user.profile_image || profileTest}
                  alt={user.nickname}
                  className={styles.profileImage}
                  onError={(e) => {
                    e.currentTarget.src = profileTest;
                  }}
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
