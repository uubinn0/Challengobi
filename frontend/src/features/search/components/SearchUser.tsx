import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import searchIcon from '../../../assets/SearchUser-search.png';  // 이미지 import
import styles from './SearchUser.module.scss';

interface User {
  id: number;
  name: string;
  image: string;
}

const SearchUser: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const navigate = useNavigate();
  
  // 더미 데이터
  const dummyUsers: User[] = [
    { id: 1, name: '애호박 개발자', image: '/src/assets/userProfile.png' },
    { id: 2, name: '그지왕', image: '/src/assets/userProfile.png' },
    { id: 3, name: '투명 드래곤', image: '/src/assets/userProfile.png' },
    { id: 4, name: '보라색 참세', image: '/src/assets/userProfile.png' },
    { id: 5, name: '골드 카드', image: '/src/assets/userProfile.png' },
    { id: 6, name: '내가 이 구역 방장', image: '/src/assets/userProfile.png' },
  ];

  const filteredUsers = searchTerm
    ? dummyUsers.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : dummyUsers;

  return (
    <div className={styles.searchContainer}>
      <div className={styles.searchBox}>
        <img src={searchIcon} alt="search" className={styles.searchIcon} />
        <input
          type="text"
          placeholder="검색어를 입력하세요"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button className={styles.searchButton}>검색</button>
      </div>

      <div className={styles.recommendedSection}>
        <h3>추천 팔로우 목록</h3>
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
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchUser;
