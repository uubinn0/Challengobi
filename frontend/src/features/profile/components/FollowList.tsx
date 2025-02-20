import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { accountApi } from '../api';
import styles from './FollowList.module.scss';
import { DEFAULT_PROFILE_IMAGE } from '../../../constants';
import profileTest from '@/assets/profile-test.jpg';  // profile-test.jpg import

interface FollowData {
  id: number;
  follower: number;
  following: number;
  follower_nickname: string;
  following_nickname: string;
  created_at: string;
  follower_profile_image?: string;
  following_profile_image?: string;
}

const FollowList: React.FC<{ type: 'followers' | 'following' }> = ({ type }) => {
  const { userId } = useParams();
  const [follows, setFollows] = useState<FollowData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const myId = localStorage.getItem('userId');

  useEffect(() => {
    let isMounted = true;  // 컴포넌트 마운트 상태 체크

    const loadFollows = async () => {
      try {
        setIsLoading(true);
        if (type === 'followers') {
          const response = await accountApi.getFollowers(Number(userId));
          if (isMounted) setFollows(response);
        } else {
          const response = await accountApi.getFollowing(Number(userId));
          if (isMounted) setFollows(response);
        }
      } catch (error) {
        console.error('팔로우 목록 로드 실패:', error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadFollows();

    // 클린업 함수
    return () => {
      isMounted = false;
    };
  }, [userId, type]);

  const handleFollowClick = async (targetUserId: number) => {
    try {
      // 팔로잉 목록에서는 무조건 언팔로우
      if (type === 'following') {
        await accountApi.unfollowUser(targetUserId);
      } else {
        // 팔로워 목록에서는 팔로우 상태에 따라 처리
        const isFollowing = follows.some(f => 
          f.follower === Number(myId) && f.following === targetUserId
        );

        if (isFollowing) {
          await accountApi.unfollowUser(targetUserId);
        } else {
          await accountApi.followUser(targetUserId);
        }
      }

      // 목록 새로고침
      const response = type === 'followers' 
        ? await accountApi.getFollowers(Number(userId))
        : await accountApi.getFollowing(Number(userId));
      setFollows(response);
    } catch (error) {
      console.error('팔로우 처리 실패:', error);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <h2>{type === 'followers' ? '팔로워' : '팔로잉'}</h2>
        <div className={styles.loadingMessage}>로딩 중...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h2>{type === 'followers' ? '팔로워' : '팔로잉'}</h2>
      <div className={styles.list}>
        {follows.length === 0 ? (
          <div className={styles.emptyMessage}>
            {type === 'followers' 
              ? '아직 팔로워가 없습니다.' 
              : '아직 팔로잉하는 사용자가 없습니다.'}
          </div>
        ) : (
          follows.map((follow) => {
            const displayUserId = type === 'followers' ? follow.follower : follow.following;
            const displayNickname = type === 'followers' ? follow.follower_nickname : follow.following_nickname;
            const displayImage = type === 'followers' ? follow.follower_profile_image : follow.following_profile_image;

            return (
              <div key={follow.id} className={styles.item}>
                <div className={styles.userInfo}>
                  <img 
                    src={displayImage || profileTest} 
                    alt={displayNickname}
                    className={styles.profileImage}
                    onError={(e) => {
                      e.currentTarget.src = profileTest;
                    }}
                  />
                  <span className={styles.nickname}>{displayNickname}</span>
                </div>
                {Number(myId) !== displayUserId && (
                  <button 
                    className={`${styles.followButton} ${type === 'following' ? styles.following : ''}`}
                    onClick={() => handleFollowClick(displayUserId)}
                  >
                    {type === 'following' ? (
                      <>
                        팔로우<br />
                        취소
                      </>
                    ) : '팔로우'}
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default FollowList;