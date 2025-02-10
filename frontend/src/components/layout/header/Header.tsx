import React from 'react';
import styles from './Header.module.scss';
import { Link } from 'react-router-dom';
import BellIcon from '../../icons/BellIcon';
import logo2 from '@/assets/logo1.png';  // logo1에서 logo2로 변경

const Header: React.FC = () => {
  return (
    <header className={styles.header}>
      <Link to='/' className={styles.logo}>
        <nav className={styles.nav}>
          <span className={styles.logoText}>챌린고비</span>
          <img src={logo2} alt="로고" className={styles.logoImage} />  {/* logo1에서 logo2로 변경 */}
        </nav>
      </Link>
      <div className={styles.iconContainer}>
        <Link to="/login" className={styles.loginText}>로그인</Link>
        <BellIcon width={20} height={20} fill="#000" />
      </div>
    </header>
  );
}

export default Header;