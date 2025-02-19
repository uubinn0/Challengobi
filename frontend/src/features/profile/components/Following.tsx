import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { accountApi, FollowUser } from '../api';
import styles from './Following.module.scss';

const Following: React.FC = () => {
  const { userId } = useParams();
  const [following, setFollowing] = useState<FollowUser[]>([]);

  useEffect(() => {
    const loadFollowing = async () => {
      try {
        const data = await accountApi.getFollowing(Number(userId));
        setFollowing(data);
      } catch (error) {
        console.error('팔로잉 목록 로드 실패:', error);
      }
    };

    loadFollowing();
  }, [userId]);

  return (
    <div className={styles.container}>
      <h2>팔로잉</h2>
      <div className={styles.userList}>
        {following.map(user => (
          <div key={user.id} className={styles.userItem}>
            <img 
              src={user.profile_image || '/default-profile.jpg'} 
              alt={user.nickname} 
              className={styles.profileImage}
            />
            <span className={styles.nickname}>{user.nickname}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Following;
