import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from './Profile.module.scss';
import { Check } from 'lucide-react';
import { accountApi } from '../api';

interface ProfileData {
  message: string;
  data: {
    id: number;
    email: string;
    nickname: string;
    profile_image: string | null;
    phone: string;
    birth_date: string;
    sex: 'M' | 'F';
    career: number;
    challenge_streak: number;
    follower_count: number;
    following_count: number;
    introduction: string | null;
    is_following: boolean;
    total_saving: number;
    my_badge: Array<{
      imageUrl: string;
      name: string;
      description: string;
      isAchieved?: boolean;
    }>;
    complete_challenge: Array<{
      title: string;
      period: string;
      saving: number;
      days: string;
    }>;
  };
}

interface RecommendedUser {
  id: number;
  nickname: string;
  profile_image: string;
  similarity: number;
}

const Profile: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const profileData = location.state?.profileData as ProfileData;
  const [recommendedUsers, setRecommendedUsers] = useState<RecommendedUser[]>([]);

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

  if (!profileData) {
    return <div>로딩 중...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.profileInfo}>
          <div className={styles.profileHeader}>
            <div className={styles.profileImage}>
              <img src={profileData.data.profile_image || '/default-profile.jpg'} alt="프로필 이미지" />
            </div>
            <div className={styles.profileDetails}>
              <h2>{profileData.data.nickname}</h2>
              {profileData.data.introduction && (
                <p className={styles.introduction}>"{profileData.data.introduction}"</p>
              )}
            </div>
          </div>
        </div>
        <div className={styles.challengeAmount}>
          <span className={styles.savingAmount}>굴비통장 {profileData.data.total_saving.toLocaleString()}원</span>
          <div className={styles.buttons}>
            <button 
              className={styles.button} 
              onClick={() => navigate('/profile/edit', {
                state: { profileData }
              })}
            >
              프로필 편집하기
            </button>
          </div>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.section}>
          <h3>획득한 뱃지</h3>
          <div className={styles.badgeList}>
            {(profileData.my_badge || []).map((badge, index) => (
              <div key={index} className={styles.badge}>
                <img 
                  src={badge.imageUrl} 
                  alt={`뱃지 ${index + 1}`} 
                  className={!badge.isAchieved ? styles.unachieved : ''}
                />
              </div>
            ))}
          </div>
        </div>

        <div className={styles.section}>
          <h3>완료한 챌린지</h3>
          <div className={styles.achievementList}>
            {(profileData.complete_challenge || []).map((challenge, index) => (
              <div 
                key={index} 
                className={styles.achievementItem}
                onClick={() => navigate('/profile/challenge-complete', {
                  state: { challenge }
                })}
                style={{ cursor: 'pointer' }}
              >
                <div className={styles.achievementInfo}>
                  <span className={styles.achievementTitle}>{challenge.title}</span>
                  <span className={styles.achievementDays}>{challenge.days}일</span>
                </div>
                <Check className={styles.checkIcon} size={24} color="#4BB7FF" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 