import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './Footer.module.scss';
import HomeIcon from '../../icons/HomeIcon';
import SearchIcon from '../../icons/SearchIcon';
import AddIcon from '../../icons/AddIcon';
import ChallengeIcon from '../../icons/ChallengeIcon';
import ProfileIcon from '../../icons/ProfileIcon';
import AddModal from '../../modals/AddModal';

function Footer() {
  const [isModalOpen, setIsModalOpen] = useState(false); //모달상태 관리 

  
  return (
    <>
    <footer className={styles.footer}>
      <nav className={styles.nav}>

        <Link to="/" className={styles.navItem}>
          <HomeIcon />
          <span>홈</span>
        </Link>
        
        <Link to="/follow" className={styles.navItem}>
          <SearchIcon/>
          <span>검색</span>
        </Link>


        {/* ✅ 버튼을 눌렀을 때 모달 열기 */}
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

       {/* ✅ 공통 모달 추가 */}
      <AddModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>


  );
}

export default Footer;
