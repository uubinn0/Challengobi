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


const Footer: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const location = useLocation();
  const isHome = location.pathname === '/' || location.pathname.startsWith('/ongoing-challenge');
  const isFollow = location.pathname.startsWith('/follow');
  const isAdd = isModalOpen || location.search === '?modal=add';
  const isChallenge = location.pathname.startsWith('/challenge');
  const isProfile = location.pathname.startsWith('/profile');
  const navigate = useNavigate();

  const handleOpenModal = () => {
    setIsModalOpen(true);
    navigate('?modal=add');
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    navigate(-1);
  };

  return (
    <>
      <footer className={styles.footer}>
        <nav className={styles.nav}>
          <Link to="/" className={`${styles.navItem} ${isHome ? styles.active : ''}`}>
            {isHome ? (
              <HomeIconFill />
            ) : (
              <HomeIcon />
            )}
            <span style={{ color: isHome ? '#000' : 'inherit' }}>홈</span>
          </Link>
          
          <Link to="/follow" className={`${styles.navItem} ${isFollow ? styles.active : ''}`}>
            {isFollow ? (
              <SearchIconFill />
            ) : (
              <SearchIcon />
            )}
            <span style={{ color: isFollow ? '#000' : 'inherit' }}>검색</span>
          </Link>

          <button 
            className={`${styles.navItem} ${isAdd ? styles.active : ''}`}
            onClick={handleOpenModal}
          >
            {isAdd ? (
              <AddIconFill />
            ) : (
              <AddIcon />
            )}
            <span style={{ color: isAdd ? '#000' : 'inherit' }}>챌린지 만들기</span>
          </button>

          <Link to="/challenge" className={`${styles.navItem} ${isChallenge ? styles.active : ''}`}>
            {isChallenge ? (
              <ChallengeIconFill />
            ) : (
              <ChallengeIcon />
            )}
            <span style={{ color: isChallenge ? '#000' : 'inherit' }}>챌린지</span>
          </Link>

          <Link to="/profile" className={`${styles.navItem} ${isProfile ? styles.active : ''}`}>
            {isProfile ? (
              <ProfileIconFill />
            ) : (
              <ProfileIcon />
            )}
            <span style={{ color: isProfile ? '#000' : 'inherit' }}>프로필</span>
          </Link>

        </nav>
      </footer>

      <AddModal isOpen={isModalOpen} onClose={handleCloseModal} />
    </>
  );
}

export default Footer;