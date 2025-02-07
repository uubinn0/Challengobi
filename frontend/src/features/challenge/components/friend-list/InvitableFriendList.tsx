import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './FriendList.module.scss';
import { useFriendInvite } from '../../context/FriendInviteContext';
import { dummyFriends } from '../../data/dummyFriends';

const InvitableFriendList: React.FC = () => {
  const navigate = useNavigate();
  const { invitedFriendIds, toggleInvite } = useFriendInvite();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button onClick={() => navigate(-1)} className={styles.backButton}>
          뒤로가기
        </button>
        <h1>친구 초대하기</h1>
      </div>
      <div className={styles.friendList}>
        {dummyFriends.map((friend) => (
          <div key={friend.id} className={styles.friendItem}>
            <img src={friend.profileImage} alt={friend.name} className={styles.profileImage} />
            <div className={styles.friendInfo}>
              <span className={styles.name}>{friend.name}</span>
              <span className={styles.nickname}>{friend.nickname}</span>
            </div>
            <button
              onClick={() => toggleInvite(friend.id)}
              className={`${styles.inviteButton} ${invitedFriendIds.includes(friend.id) ? styles.invited : ''}`}
            >
              {invitedFriendIds.includes(friend.id) ? '초대 취소' : '초대하기'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InvitableFriendList; 