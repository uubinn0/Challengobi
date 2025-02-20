import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { accountApi } from '../api';
import styles from './FollowList.module.scss';

interface Follower {
  id: number;
  nickname: string;
  profile_image: string;
}

const FollowerList: React.FC = () => {
  const { userId } = useParams();
  const [followers, setFollowers] = useState<Follower[]>([]);

  useEffect(() => {
    const loadFollowers = async () => {
      try {
        const followerList = await accountApi.getFollowers(Number(userId));
        setFollowers(followerList);
      } catch (error) {
        console.error('팔로워 목록 로드 실패:', error);
      }
    };

    loadFollowers();
  }, [userId]);

  return (
    <div className={styles.container}>
      <h2>팔로워</h2>
      <div className={styles.list}>
        {followers.map((follower) => (
          <div key={follower.id} className={styles.item}>
            <img 
              src={follower.profile_image || '/default-profile.jpg'} 
              alt={`${follower.nickname}의 프로필`} 
              className={styles.profileImage}
            />
            <span className={styles.nickname}>{follower.nickname}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FollowerList; 