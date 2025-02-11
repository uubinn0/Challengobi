import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Following.module.scss';

interface User {
  id: number;
  name: string;
  image: string;
  isFollowing: boolean;
}

const Following: React.FC = () => {
  const [searchTerm] = useState<string>('');
  const navigate = useNavigate();
  
  // 더미 데이터에 isFollowing 상태 추가
  const [users, setUsers] = useState<User[]>([
    { id: 1, name: '애호박 개발자', image: '/src/assets/userProfile.png', isFollowing: true },
    { id: 2, name: '그지왕', image: '/src/assets/userProfile.png', isFollowing: true },
    { id: 3, name: '투명 드래곤', image: '/src/assets/userProfile.png', isFollowing: true },
    { id: 4, name: '보라색 참세', image: '/src/assets/userProfile.png', isFollowing: true },
    { id: 5, name: '골드 카드', image: '/src/assets/userProfile.png', isFollowing: true },
    { id: 6, name: '내가 이 구역 방장', image: '/src/assets/userProfile.png', isFollowing: true },
  ]);

  const filteredUsers = searchTerm
    ? users.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : users;

  // 팔로우/팔로잉 토글 함수
  const toggleFollow = (userId: number) => {
    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, isFollowing: !user.isFollowing }
        : user
    ));
  };

  return (
    <div className={styles.searchContainer}>
      <div className={styles.recommendedSection}>
        <h2>팔로잉 목록</h2>
        <div className={styles.userGrid}>
          {filteredUsers.map(user => (
            <div key={user.id} className={styles.userItem}>
              <div 
                className={styles.userImage}
                onClick={() => navigate('/profile')}
                style={{ cursor: 'pointer' }}
              >
                <img src={user.image} alt={user.name} />
              </div>
              <p className={styles.userName}>{user.name}</p>
              <button 
                className={`${styles.followButton} ${user.isFollowing ? styles.following : ''}`}
                onClick={() => toggleFollow(user.id)}
              >
                {user.isFollowing ? '팔로잉' : '팔로우'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Following;
