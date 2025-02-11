import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Profile.module.scss';
import { Check } from 'lucide-react';
// 모든 뱃지 이미지 import 유지
import fish1 from '../../../assets/badge/fish1.jpg';
import fish2 from '@/assets/badge/fish2.jpg';
import fish3 from '@/assets/badge/fish3.jpg';
import fish4 from '@/assets/badge/fish4.jpg';
import fish5 from '@/assets/badge/fish5.jpg';
import badge1 from '@/assets/badge/badge1.jpg';
import badge2 from '@/assets/badge/badge2.jpg';
import badge3 from '@/assets/badge/badge3.jpg';
import badge4 from '@/assets/badge/badge4.jpg';
import badge5 from '@/assets/badge/badge5.jpg';
import profileTest from '@/assets/profile-test.jpg';  // 같은 이미지 import
// 백엔드에서 받을 뱃지 데이터 타입 정의
interface BadgeData {
  id: number;
  isAchieved: boolean;  // 획득 여부
  imageUrl: string;     // 이미지 경로
}

interface Achievement {
  id: number;
  title: string;
  days: number;
  completed: boolean;
  period: string;    // 추가
  amount: string;    // 추가
}

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const [badges] = useState<BadgeData[]>([
    { id: 1, isAchieved: false, imageUrl: fish1 },
    { id: 2, isAchieved: false, imageUrl: fish2 },
    { id: 3, isAchieved: false, imageUrl: fish3 },
    { id: 4, isAchieved: false, imageUrl: fish4 },
    { id: 5, isAchieved: false, imageUrl: fish5 },
    { id: 6, isAchieved: false, imageUrl: badge1 },
    { id: 7, isAchieved: false, imageUrl: badge2 },
    { id: 8, isAchieved: false, imageUrl: badge3 },
    { id: 9, isAchieved: false, imageUrl: badge4 },
    { id: 10, isAchieved: false, imageUrl: badge5 }
  ]);

  const achievements: Achievement[] = [
    { 
      id: 1, 
      title: '커피값 일주일에 3만원만 쓰기', 
      days: 35,
      completed: true,
      period: "1월 1일 - 2월 5일",
      amount: "30,000원"
    },
    { 
      id: 2, 
      title: '소핑 5만원 한정', 
      days: 57,
      completed: true,
      period: "2월 10일 - 4월 8일",
      amount: "50,000원"
    },
    { 
      id: 3, 
      title: '하루 만원으로 살아보기', 
      days: 15,
      completed: true,
      period: "4월 15일 - 4월 30일",
      amount: "10,000원"
    }
  ];

  const handleEditProfile = () => {
    navigate('/profile/edit');
  };

  const handleAchievementClick = (achievement: Achievement) => {
    navigate('/profile/challenge-complete', {
      state: {
        title: achievement.title,
        period: achievement.period,
        amount: achievement.amount,
        days: achievement.days
      }
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.profileSection}>
          <div className={styles.profileImage}>
            <img src={profileTest} alt="프로필 이미지" />
          </div>
          <div className={styles.challengeInfo}>
            <h2>나는 물고기</h2>
            <div className={styles.stats}>
              <div className={styles.stat}>
                <span className={styles.label}>참여 챌린지</span>
                <span className={styles.number}>3</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.label}>팔로우</span>
                <span className={styles.number}>6</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.label}>팔로워</span>
                <span className={styles.number}>6</span>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.challengeAmount}>
          <span>물고기통장 10,000원</span>
          <div className={styles.buttons}>
            <button className={styles.button} onClick={handleEditProfile}>
              프로필 편집하기
            </button>
          </div>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.section}>
          <h3>획득한 뱃지</h3>
          <div className={styles.badgeList}>
            {badges.map(badge => (
              <div key={badge.id} className={styles.badge}>
                <img 
                  src={badge.imageUrl} 
                  alt={`뱃지 ${badge.id}`} 
                  className={!badge.isAchieved ? styles.unachieved : ''}
                />
              </div>
            ))}
          </div>
        </div>

        <div className={styles.section}>
          <h3>완료한 챌린지</h3>
          <div className={styles.achievementList}>
            {achievements.map((achievement) => (
              <div 
                key={achievement.id} 
                className={styles.achievementItem}
                onClick={() => handleAchievementClick(achievement)}
                style={{ cursor: 'pointer' }}  // 클릭 가능함을 표시
              >
                <div className={styles.achievementInfo}>
                  <span className={styles.achievementTitle}>{achievement.title}</span>
                  <span className={styles.achievementDays}>{achievement.days}일</span>
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