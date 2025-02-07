import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './FriendList.module.scss';
import { useFriendInvite } from '../../context/FriendInviteContext';
import { dummyFriends } from '../../data/dummyFriends';

const InvitedFriendList: React.FC = () => {
  const navigate = useNavigate();
  const { invitedFriendIds } = useFriendInvite();

  const invitedFriends = dummyFriends.filter(friend => 
    invitedFriendIds.includes(friend.id)
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button onClick={() => navigate(-1)} className={styles.backButton}>
          뒤로가기
        </button>
        <h1>초대한 친구 목록</h1>
      </div>
      <div className={styles.friendList}>
        {invitedFriends.map((friend) => (
          <div key={friend.id} className={styles.friendItem}>
            <img src={friend.profileImage} alt={friend.name} className={styles.profileImage} />
            <div className={styles.friendInfo}>
              <span className={styles.name}>{friend.name}</span>
              <span className={styles.nickname}>{friend.nickname}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InvitedFriendList; 