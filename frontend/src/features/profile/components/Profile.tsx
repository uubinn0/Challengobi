import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import styles from './Profile.module.scss';
import { Check } from 'lucide-react';
import { accountApi } from '../api';
import axios from 'axios';

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
    ongoing_challenges?: Array<{
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
  const { userId } = useParams();
  const [isMyProfile, setIsMyProfile] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    const checkProfile = async () => {
      const myId = localStorage.getItem('userId');
      setIsMyProfile(!userId || myId === userId);

      if (userId && myId !== userId) {
        try {
          const status = await accountApi.getFollowStatus(Number(userId));
          setIsFollowing(status);
        } catch (error) {
          console.error('팔로우 상태 확인 실패:', error);
        }
      }
    };

    checkProfile();
  }, [userId]);

  const handleFollowClick = async () => {
    try {
      if (isFollowing) {
        await accountApi.unfollowUser(Number(userId));
      } else {
        await accountApi.followUser(Number(userId));
      }
      setIsFollowing(!isFollowing);
    } catch (error) {
      console.error('팔로우 처리 실패:', error);
    }
  };

  if (!profileData) {
    return <div>Loading...</div>;
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
              <div className={styles.stats}>
                <span onClick={() => navigate(`/profile/${profileData.data.id}/following`)}>
                  팔로잉 {profileData.data.following_count}
                </span>
                <span onClick={() => navigate(`/profile/${profileData.data.id}/follower`)}>
                  팔로워 {profileData.data.follower_count}
                </span>
              </div>
            </div>
          </div>
          <div className={styles.challengeAmount}>
            <span className={styles.savingAmount}>굴비통장 {profileData.data.total_saving.toLocaleString()}원</span>
            <div className={styles.buttons}>
              {isMyProfile ? (
                <button 
                  className={styles.button} 
                  onClick={() => navigate('/profile/edit', {
                    state: { profileData }
                  })}
                >
                  프로필 편집하기
                </button>
              ) : (
                <button 
                  className={`${styles.button} ${isFollowing ? styles.following : ''}`} 
                  onClick={handleFollowClick}
                >
                  {isFollowing ? '팔로잉' : '팔로우'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className={styles.content}>
        <div className={styles.section}>
          <h3>획득한 뱃지</h3>
          <div className={styles.badgeList}>
            {(profileData.data.my_badge || []).map((badge, index) => (
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
            {(profileData.data.complete_challenge || []).map((challenge, index) => (
              <div 
                key={index} 
                className={styles.achievement}
                onClick={() => navigate(`/profile/challenge-complete`)}
              >
                <Check className={styles.checkIcon} />
                <span>{challenge.title}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 