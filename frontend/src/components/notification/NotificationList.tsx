import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './NotificationList.module.scss';
import { Notification } from '../../../types/notification';
import { ChevronRight } from 'lucide-react';

interface NotificationListProps {
  notifications: Notification[];
  onClose: () => void;
  onShowChallengeDetail?: (challengeId: string) => void;
  onNotificationClick: (notification: Notification) => void;
}

// 알림 타입별 아이콘 컴포넌트
const NotificationIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'FOLLOW':
      return <img src="/icons/follow.svg" alt="팔로우" className={styles.icon} />;
    case 'VERIFY':
      return <img src="/icons/verify.svg" alt="인증" className={styles.icon} />;
    case 'INVITE':
      return <img src="/icons/invite.svg" alt="초대" className={styles.icon} />;
    case 'COMPLETE':
      return <img src="/icons/complete.svg" alt="완료" className={styles.icon} />;
    default:
      return null;
  }
};

const NotificationList: React.FC<NotificationListProps> = ({ 
  notifications, 
  onClose, 
  onShowChallengeDetail,
  onNotificationClick 
}) => {
  const navigate = useNavigate();

  const handleNotificationClick = (notification: Notification) => {
    onNotificationClick(notification);
    
    switch (notification.type) {
      case 'FOLLOW':
        navigate('/profile');
        break;
      case 'VERIFY':
        navigate('/challenge');
        break;
      case 'INVITE':
        if (onShowChallengeDetail && notification.data.challengeId) {
          onShowChallengeDetail(notification.data.challengeId);
        }
        break;
      case 'COMPLETE':
        navigate('/profile');
        break;
    }
  };

  return (
    <div className={styles.container}>
      {notifications.length === 0 ? (
        <div className={styles.emptyState}>알림이 없습니다</div>
      ) : (
        notifications.map((notification) => (
          <div
            key={notification.id}
            className={styles.notificationItem}
            onClick={(e) => {
              e.stopPropagation();  // 이벤트 버블링 방지
              handleNotificationClick(notification);
            }}
          >
            <NotificationIcon type={notification.type} />
            <div className={styles.content}>
              <p className={styles.message}>{notification.message}</p>
              <ChevronRight className={styles.arrow} />
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default NotificationList; 