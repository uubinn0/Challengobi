import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './Header.module.scss';
import BellIcon from '../../icons/BellIcon';
import logo2 from '@/assets/logo3.png';
import NotificationList from '../../notification/NotificationList';
import { Notification } from '../../../types/notification';
import ChallengeDetailModal from '../../modals/ChallengeDetailModal';
import { useAuth } from '../../../features/auth/context/AuthContext';
import profileTest from '@/assets/profile-test.jpg';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      type: 'FOLLOW',
      message: '물고기님이 팔로우했습니다.',
      isRead: false,
      createdAt: '방금 전',
      data: { userId: '1', nickname: '물고기' }
    },
    {
      id: 2,
      type: 'VERIFY',
      message: '고비인증을 하지 않은 챌린지가 있습니다',
      isRead: false,
      createdAt: '1시간 전',
      data: { challengeId: '1' }
    },
    {
      id: 3,
      type: 'INVITE',
      message: '자린고비님이 챌린지에 초대하였습니다',
      isRead: false,
      createdAt: '2시간 전',
      data: { challengeId: '2', nickname: '자린고비' }
    },
    {
      id: 4,
      type: 'COMPLETE',
      message: '챌린지가 완료되었습니다',
      isRead: false,
      createdAt: '3시간 전',
      data: { challengeId: '3' }
    }
  ]);

  // 외부 클릭 감지를 위한 ref
  const notificationRef = useRef<HTMLDivElement>(null);

  // 외부 클릭 감지 핸들러
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const hasUnreadNotifications = notifications.some(n => !n.isRead);

  const [selectedChallenge, setSelectedChallenge] = useState<any>(null);
  const [showChallengeModal, setShowChallengeModal] = useState(false);

  const handleCloseNotifications = () => {
    setShowNotifications(false);
  };

  const handleShowChallengeDetail = (challengeId: string) => {
    // 실제로는 API에서 챌린지 정보를 가져와야 하지만, 임시로 더미 데이터 사용
    const dummyChallenge = {
      id: challengeId,
      title: "외식비 줄이기 챌린지",
      description: "외식을 줄이고 싶은 챌린저들을 모집합니다.",
      category: "식비",
      period: "2024.01.01 - 2024.01.31",
      amount: "50,000원",
      currentMembers: 3,
      maxMembers: 5,
      likes: 10,
      wants: 5
    };
    
    setSelectedChallenge(dummyChallenge);
    setShowChallengeModal(true);
    handleCloseNotifications();
  };

  const handleNotificationClick = (clickedNotification: Notification) => {
    // 클릭된 알림을 제거
    setNotifications(prev => prev.filter(notification => notification.id !== clickedNotification.id));
    setShowNotifications(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // 임시 사용자 데이터
  const user = {
    nickname: '물고기',
    profileImage: profileTest
  };

  return (
    <>
      <header className={styles.header}>
        <Link to='/' className={styles.logo}>
          <nav className={styles.nav}>
            <span className={styles.logoText}>챌린고비</span>
            <img src={logo2} alt="로고" className={styles.logoImage} />
          </nav>
        </Link>
        <div className={styles.iconContainer}>
          <div className={styles.userProfile}>
            <Link to="/profile">
              <img 
                src={user.profileImage} 
                alt="프로필" 
                className={styles.profileImage}
              />
            </Link>
          </div>
          <button onClick={handleLogout} className={styles.logoutButton}>
            로그아웃
          </button>
          <div className={styles.notificationContainer} ref={notificationRef}>
            <button 
              className={styles.bellButton}
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <BellIcon width={20} height={20} fill="#000" />
              {hasUnreadNotifications && <span className={styles.notificationDot} />}
            </button>
            {showNotifications && (
              <NotificationList 
                notifications={notifications}
                onClose={handleCloseNotifications}
                onShowChallengeDetail={handleShowChallengeDetail}
                onNotificationClick={handleNotificationClick}
              />
            )}
          </div>
        </div>
      </header>

      {showChallengeModal && selectedChallenge && (
        <ChallengeDetailModal
          isOpen={showChallengeModal}
          onClose={() => setShowChallengeModal(false)}
          challenge={selectedChallenge}
        />
      )}
    </>
  );
}

export default Header;