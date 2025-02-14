import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from './Profile.module.scss';
import { Check } from 'lucide-react';
import { ProfileData } from '../api';

const Profile: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const profileData = location.state?.profileData as ProfileData;

  if (!profileData) {
    return <div>로딩 중...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.profileSection}>
          <div className={styles.profileImage}>
            <img src={profileData.profile_image || '/default-profile.jpg'} alt="프로필 이미지" />
          </div>
          <div className={styles.challengeInfo}>
            <h1>{profileData.nickname}</h1>
          </div>
        </div>
        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.label}>참여 챌린지</span>
            <span className={styles.number}>{profileData.challenge_cnt || 0}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.label}>팔로잉</span>
            <span className={styles.number}>{profileData.follow || 0}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.label}>팔로워</span>
            <span className={styles.number}>{profileData.follower || 0}</span>
          </div>
        </div>
        <div className={styles.challengeAmount}>
          <span>물고기통장 {(profileData.total_saving || 0).toLocaleString()}원</span>
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