import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { accountApi, FollowUser } from '../api';
import styles from './Follower.module.scss';

const Follower: React.FC = () => {
  const { userId } = useParams();
  const [followers, setFollowers] = useState<FollowUser[]>([]);

  useEffect(() => {
    const loadFollowers = async () => {
      try {
        const data = await accountApi.getFollowers(Number(userId));
        setFollowers(data);
      } catch (error) {
        console.error('팔로워 목록 로드 실패:', error);
      }
    };

    loadFollowers();
  }, [userId]);

  return (
    <div className={styles.container}>
      <h2>팔로워</h2>
      <div className={styles.userList}>
        {followers.map(user => (
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

export default Follower;
