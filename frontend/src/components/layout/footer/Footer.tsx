// Footer.tsx
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from './Footer.module.scss';
import HomeIcon from '../../icons/HomeIcon';
import HomeIconFill from '../../icons/HomeIcon-fill';
import SearchIcon from '../../icons/SearchIcon';
import SearchIconFill from '../../icons/SearchIcon-fill';
import AddIcon from '../../icons/AddIcon';
import ChallengeIcon from '../../icons/ChallengeIcon';
import ProfileIcon from '../../icons/ProfileIcon';
import AddModal from '../../modals/AddModal';


const Footer: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const location = useLocation();
  const isHome = location.pathname === '/';
  const isFollow = location.pathname.startsWith('/follow');

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

          <button className={styles.navItem} onClick={() => setIsModalOpen(true)}>
            <AddIcon />
            <span>챌린지 만들기</span>
          </button>

          <Link to="/challenge" className={styles.navItem}>
            <ChallengeIcon/>
            <span>챌린지</span>
          </Link>

          <Link to="/profile" className={styles.navItem}>
            <ProfileIcon/>
            <span>프로필</span>
          </Link>

        </nav>
      </footer>

      <AddModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}

export default Footer;