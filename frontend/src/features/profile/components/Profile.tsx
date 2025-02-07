import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Profile.module.scss';
import { Check } from 'lucide-react';

const Profile: React.FC = () => {
  const navigate = useNavigate();

  const achievements = [
    { 
      id: 1, 
      title: '커피값 일주일에 3만원만 쓰기', 
      days: 35,
      completed: true
    },
    { 
      id: 2, 
      title: '소핑 5만원 한정', 
      days: 57,
      completed: true
    },
    { 
      id: 3, 
      title: '하루 만원으로 살아보기', 
      days: 15,
      completed: true
    }
  ];

  const handleEditProfile = () => {
    navigate('/profile/edit');
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.profileSection}>
          <div className={styles.profileImage}>
            <img src="/profile-fish.png" alt="프로필 이미지" />
          </div>
          <div className={styles.challengeInfo}>
            <h1>나는 물고기</h1>
            <h2>돈을 아끼자!</h2>
          </div>
        </div>
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
        <div className={styles.challengeAmount}>
          <span>물고기통장 10,000원</span>
          <div className={styles.buttons}>
            <button className={styles.button}>내가 쓴 글</button>
            <button className={styles.button} onClick={handleEditProfile}>
              프로필 편집하기
            </button>
          </div>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.section}>
          <h3>획득한 뱃지</h3>
          <div className={styles.badge}>
            {/* 물고기 이미지 추가 */}
            <img src="/fish-badge.png" alt="물고기 뱃지" />
          </div>
        </div>

        <div className={styles.section}>
          <h3>완료한 챌린지</h3>
          <div className={styles.achievementList}>
            {achievements.map((achievement) => (
              <div key={achievement.id} className={styles.achievementItem}>
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