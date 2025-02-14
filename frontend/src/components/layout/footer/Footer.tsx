// Footer.tsx
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import styles from './Footer.module.scss';
import HomeIcon from '../../icons/HomeIcon';
import HomeIconFill from '../../icons/HomeIcon-fill';
import SearchIcon from '../../icons/SearchIcon';
import SearchIconFill from '../../icons/SearchIcon-fill';
import AddIcon from '../../icons/AddIcon';
import AddIconFill from '../../icons/AddIcon-fill';
import ChallengeIcon from '../../icons/ChallengeIcon';
import ChallengeIconFill from '../../icons/ChallengeIcon-fill';
import ProfileIcon from '../../icons/ProfileIcon';
import ProfileIconFill from '../../icons/ProfileIcon-fill';
import AddModal from '../../modals/AddModal';
import { accountApi } from '../../../features/profile/api';


const Footer: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const location = useLocation();
  const navigate = useNavigate();

  // 토큰 체크 함수
  const checkAuth = (): boolean => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      alert('로그인이 필요한 서비스입니다.');
      return false;
    }
    return true;
  };

  // 각 버튼 클릭 핸들러
  const handleNavigation = (path: string) => {
    if (checkAuth()) {
      navigate(path);
    }
  };

  const handleOpenModal = () => {
    if (checkAuth()) {
      setIsModalOpen(true);
      navigate('?modal=add');
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    navigate(-1);
  };

  const handleProfileClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (checkAuth()) {
      try {
        const profileData = await accountApi.getMyProfile();
        navigate('/profile', { 
          state: { profileData } 
        });
      } catch (error) {
        console.error('프로필 조회 실패:', error);
        alert('프로필 조회에 실패했습니다.');
      }
    }
  };

  return (
    <>
      <footer className={styles.footer}>
        <nav className={styles.nav}>
          <Link 
            to="/" 
            className={`${styles.navItem} ${location.pathname === '/' ? styles.active : ''}`}
            onClick={(e) => {
              e.preventDefault();
              handleNavigation('/');
            }}
          >
            {location.pathname === '/' ? <HomeIconFill /> : <HomeIcon />}
            <span>홈</span>
          </Link>
          
          <Link 
            to="/follow" 
            className={`${styles.navItem} ${location.pathname.startsWith('/follow') ? styles.active : ''}`}
            onClick={(e) => {
              e.preventDefault();
              handleNavigation('/follow');
            }}
          >
            {location.pathname.startsWith('/follow') ? <SearchIconFill /> : <SearchIcon />}
            <span>검색</span>
          </Link>

          <button 
            className={`${styles.navItem} ${isModalOpen ? styles.active : ''}`}
            onClick={handleOpenModal}
          >
            {isModalOpen ? <AddIconFill /> : <AddIcon />}
            <span>챌린지 만들기</span>
          </button>

          <Link 
            to="/challenge" 
            className={`${styles.navItem} ${location.pathname.startsWith('/challenge') ? styles.active : ''}`}
            onClick={(e) => {
              e.preventDefault();
              handleNavigation('/challenge');
            }}
          >
            {location.pathname.startsWith('/challenge') ? <ChallengeIconFill /> : <ChallengeIcon />}
            <span>챌린지</span>
          </Link>

          <Link 
            to="/profile" 
            className={`${styles.navItem} ${location.pathname.startsWith('/profile') ? styles.active : ''}`}
            onClick={handleProfileClick}
          >
            {location.pathname.startsWith('/profile') ? <ProfileIconFill /> : <ProfileIcon />}
            <span>프로필</span>
          </Link>
        </nav>
      </footer>

      <AddModal isOpen={isModalOpen} onClose={handleCloseModal} />
    </>
  );
}

export default Footer;