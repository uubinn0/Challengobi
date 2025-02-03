import React from 'react';
import styles from './Header.module.scss';
import { Link } from 'react-router-dom';
import BellIcon from '../../icons/BellIcon';

function Header() {
  return (
    <header className={styles.header}>
      {/* 로고 클릭시 홈으로 이동 */}
      <Link to='/' className={styles.logo}>
      <nav className={styles.nav}>
      <span className={styles.logoText}>챌린고비</span>
      </nav>
      </Link>
      <div className={styles.iconContainer}>
      <Link to="/login" className={styles.loginText}>로그인</Link>
      <BellIcon width={20} height={20} fill="#000" /> {/* 크기 및 색상 변경 가능 */}
      </div>
    </header>
  );
}

export default Header;
