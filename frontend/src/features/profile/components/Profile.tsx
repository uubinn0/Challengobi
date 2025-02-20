import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import styles from './Profile.module.scss';
import { Check } from 'lucide-react';
import { accountApi } from '../api';
import axios from 'axios';
import FollowModal from './FollowModal';
import { User } from '../types';  // User 타입 임포트
import { DEFAULT_PROFILE_IMAGE } from '../../../constants';  // profileTest 대신 DEFAULT_PROFILE_IMAGE import
import profileTest from '@/assets/profile-test.jpg';  // profile-test.jpg import 추가
import badgePoint1 from '../../../assets/bagde/point/point_badge1.jpg';
import badgePoint2 from '../../../assets/bagde/point/point_badge2.jpg';
import badgePoint3 from '../../../assets/bagde/point/point_badge3.jpg';
import badgePoint4 from '../../../assets/bagde/point/point_badge4.jpg';
import badgePoint5 from '../../../assets/bagde/point/point_badge5.jpg';
import badgeStreak1 from '../../../assets/bagde/streak/streak_badge1.jpg';
import badgeStreak2 from '../../../assets/bagde/streak/streak_badge2.jpg';
import badgeStreak3 from '../../../assets/bagde/streak/streak_badge3.jpg';
import badgeStreak4 from '../../../assets/bagde/streak/streak_badge4.jpg';
import badgeStreak5 from '../../../assets/bagde/streak/streak_badge5.jpg';

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

// 더미 뱃지 데이터 수정 - 모든 뱃지 포함
const dummyBadges = [
  {
    imageUrl: badgePoint1,
    isAchieved: true
  },
  {
    imageUrl: badgePoint2,
    isAchieved: true
  },
  {
    imageUrl: badgePoint3,
    isAchieved: true
  },
  {
    imageUrl: badgePoint4,
    isAchieved: false
  },
  {
    imageUrl: badgePoint5,
    isAchieved: false
  },
  {
    imageUrl: badgeStreak1,
    isAchieved: true
  },
  {
    imageUrl: badgeStreak2,
    isAchieved: true
  },
  {
    imageUrl: badgeStreak3,
    isAchieved: false
  },
  {
    imageUrl: badgeStreak4,
    isAchieved: false
  },
  {
    imageUrl: badgeStreak5,
    isAchieved: false
  }
];

// 더미 챌린지 데이터 추가
const dummyCompletedChallenge = [
  {
    title: "외식비 줄이기 챌린지",
    period: "2024.01.01 - 2024.01.31",
    saving: 50000,
    days: "31"
  }
];

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

  // API 응답을 User 타입에 맞게 변환
  const loadFollowers = async () => {
    const response = await accountApi.getFollowers(Number(userId));
    const formattedFollowers = response.map(follower => ({
      id: follower.id,
      nickname: follower.follower_nickname,
      profile_image: follower.follower_profile_image || null
    }));
    setFollowers(formattedFollowers);
  };

  const loadFollowing = async () => {
    const response = await accountApi.getFollowing(Number(userId));
    const formattedFollowing = response.map(follow => ({
      id: follow.id,
      nickname: follow.following_nickname,
      profile_image: follow.following_profile_image || null
    }));
    setFollowing(formattedFollowing);
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
              <img 
                src={profileData.data.profile_image || DEFAULT_PROFILE_IMAGE} 
                alt={profileData.data.nickname}
                className={styles.profileImage}
                onError={(e) => {
                  e.currentTarget.src = DEFAULT_PROFILE_IMAGE;
                }}
              />
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
          <div className={styles.badgeContainer}>
            <div className={styles.badgeSection}>
              <h4>통장 뱃지</h4>
              <div className={styles.badgeList}>
                {dummyBadges.slice(0, 5).map((badge, index) => (
                  <div key={index} className={styles.badge}>
                    <img 
                      src={badge.imageUrl} 
                      alt={`통장 뱃지 ${index + 1}`} 
                      className={!badge.isAchieved ? styles.unachieved : ''}
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className={styles.badgeSection}>
              <h4>고비인증 일수 뱃지</h4>
              <div className={styles.badgeList}>
                {dummyBadges.slice(5, 10).map((badge, index) => (
                  <div key={index} className={styles.badge}>
                    <img 
                      src={badge.imageUrl} 
                      alt={`고비인증 일수 뱃지 ${index + 1}`} 
                      className={!badge.isAchieved ? styles.unachieved : ''}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className={styles.section}>
          <h3>완료한 챌린지</h3>
          <div className={styles.achievementList}>
            {(dummyCompletedChallenge || []).map((challenge, index) => (
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