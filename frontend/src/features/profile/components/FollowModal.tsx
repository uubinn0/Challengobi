import React from 'react';
import styles from './FollowModal.module.scss';
import profileTest from '@/assets/profile-test.jpg';

interface User {
  id: number;
  nickname: string;
  profile_image: string | null;
}

interface FollowModalProps {
  title: string;
  users: User[];
  onClose: () => void;
}

const FollowModal: React.FC<FollowModalProps> = ({ title, users, onClose }) => {
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>{title}</h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>
        <div className={styles.list}>
          {users.map((user) => (
            <div key={user.id} className={styles.item}>
              <img 
                src={user.profile_image || profileTest}
                alt={user.nickname}
                className={styles.profileImage}
                onError={(e) => {
                  e.currentTarget.src = profileTest;
                }}
              />
              <span className={styles.nickname}>{user.nickname}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FollowModal; 