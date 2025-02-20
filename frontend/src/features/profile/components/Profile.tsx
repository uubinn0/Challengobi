import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import styles from './Profile.module.scss';
import { Check } from 'lucide-react';
import { accountApi } from '../api';
import axios from 'axios';
import FollowModal from './FollowModal';
import { User } from '../types';  // User 타입 임포트

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
  const { userId } = useParams();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isMyProfile, setIsMyProfile] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);
  const [followers, setFollowers] = useState<User[]>([]);
  const [following, setFollowing] = useState<User[]>([]);
  const myId = localStorage.getItem('userId');

  useEffect(() => {
    const loadProfile = async () => {
      try {
        let response;
        if (userId) {
          response = await accountApi.getUserProfile(Number(userId));
          setIsMyProfile(myId === userId);
        } else {
          response = await accountApi.getMyProfile();
          setIsMyProfile(true);
        }
        setProfileData(response);
      } catch (error) {
        console.error('프로필 로드 실패:', error);
      }
    };

    loadProfile();
  }, [userId, myId]);

  // 팔로우 상태 체크
  useEffect(() => {
    const checkFollowStatus = async () => {
      if (userId && myId !== userId) {
        try {
          const status = await accountApi.getFollowStatus(Number(userId));
          setIsFollowing(status);
        } catch (error) {
          console.error('팔로우 상태 확인 실패:', error);
        }
      }
    };

    checkFollowStatus();
  }, [userId, myId]);

  const handleFollowClick = async () => {
    try {
      if (isFollowing) {
        // 이미 팔로우 중이면 언팔로우
        await accountApi.unfollowUser(Number(userId));
        setIsFollowing(false);  // 팔로우 상태 업데이트
        // 팔로워 수 업데이트 (현재 값에서 1 감소)
        if (profileData) {
          setProfileData({
            ...profileData,
            data: {
              ...profileData.data,
              follower_count: profileData.data.follower_count - 1
            }
          });
        }
      } else {
        // 팔로우 중이 아니면 팔로우
        await accountApi.followUser(Number(userId));
        setIsFollowing(true);  // 팔로우 상태 업데이트
        // 팔로워 수 업데이트 (현재 값에서 1 증가)
        if (profileData) {
          setProfileData({
            ...profileData,
            data: {
              ...profileData.data,
              follower_count: profileData.data.follower_count + 1
            }
          });
        }
      }
    } catch (error) {
      console.error('팔로우 처리 실패:', error);
    }
  };

  // 팔로워/팔로잉 목록 로드
  const loadFollowLists = async () => {
    try {
      if (userId) {
        const [followerList, followingList] = await Promise.all([
          accountApi.getFollowers(Number(userId)),
          accountApi.getFollowing(Number(userId))
        ]);

        // 팔로잉 목록은 이미 팔로우 중이므로 is_following을 true로 설정
        const followingWithStatus = followingList.map(user => ({
          ...user,
          is_following: true
        }));

        setFollowers(followerList);
        setFollowing(followingWithStatus);
      }
    } catch (error) {
      console.error('팔로우 목록 로드 실패:', error);
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
              {profileData.data.profile_image ? (
                <img 
                  src={profileData.data.profile_image} 
                  alt="프로필 이미지"
                />
              ) : (
                <div className={styles.imageContainer} />
              )}
            </div>
            <div className={styles.profileDetails}>
              <h2>{profileData.data.nickname}</h2>
              {profileData.data.introduction && (
                <p className={styles.introduction}>"{profileData.data.introduction}"</p>
              )}
              <div className={styles.stats}>
                <span onClick={() => navigate(`/profile/${profileData.data.id}/following`)}>
                  팔로잉 목록 {profileData.data.following_count}
                </span>
                <span onClick={() => navigate(`/profile/${profileData.data.id}/followers`)}>
                  팔로워 목록 {profileData.data.follower_count}
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
      {/* 모달 추가 */}
      {showFollowersModal && (
        <FollowModal
          title="팔로워"
          users={followers}
          onClose={() => setShowFollowersModal(false)}
        />
      )}
      {showFollowingModal && (
        <FollowModal
          title="팔로잉"
          users={following}
          onClose={() => setShowFollowingModal(false)}
        />
      )}
    </div>
  );
};

export default Profile; 