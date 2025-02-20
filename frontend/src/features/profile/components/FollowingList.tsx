import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { accountApi } from '../api';
import styles from './FollowList.module.scss';

interface Following {
  id: number;
  nickname: string;
  profile_image: string;
}

const FollowingList: React.FC = () => {
  const { userId } = useParams();
  const [following, setFollowing] = useState<Following[]>([]);

  useEffect(() => {
    const loadFollowing = async () => {
      try {
        const followingList = await accountApi.getFollowing(Number(userId));
        setFollowing(followingList);
      } catch (error) {
        console.error('팔로잉 목록 로드 실패:', error);
      }
    };

    loadFollowing();
  }, [userId]);

  return (
    <div className={styles.container}>
      <h2>팔로잉</h2>
      <div className={styles.list}>
        {following.map((user) => (
          <div key={user.id} className={styles.item}>
            <img 
              src={user.profile_image || '/default-profile.jpg'} 
              alt={`${user.nickname}의 프로필`} 
              className={styles.profileImage}
            />
            <span className={styles.nickname}>{user.nickname}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FollowingList; 