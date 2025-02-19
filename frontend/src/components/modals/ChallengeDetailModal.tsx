import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from './ChallengeDetailModal.module.scss';
import { SupportFish, WantFish } from '../../components/icons/FishIcon';
import type { Challenge } from '../../features/home/types';
import { HomeAPI } from '../../features/home/api';

interface ChallengeDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  challenge: Challenge;
}

const ChallengeDetailModal: React.FC<ChallengeDetailModalProps> = ({ isOpen, onClose, challenge }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isFromChallengePage = location.pathname === '/challenge';
  
  const [isLiked, setIsLiked] = useState(false);
  const [isWanted, setIsWanted] = useState(false);
  const [likeCount, setLikeCount] = useState(challenge.encourage_cnt);
  const [wantCount, setWantCount] = useState(challenge.want_cnt);

  if (!isOpen) return null;

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(prev => prev + (isLiked ? -1 : 1));
  };

  const handleWant = () => {
    setIsWanted(!isWanted);
    setWantCount(prev => prev + (isWanted ? -1 : 1));
  };

  const handleInviteFriends = () => {
    onClose();
    navigate('/challenge/invite-friends');
  };

  const handleViewInvitedFriends = () => {
    onClose();
    navigate('/challenge/invited-friends');
  };

  const handleJoinChallenge = async () => {
    try {
      await HomeAPI.joinChallenge(challenge.challenge_id);
      onClose();
      navigate('/challenge');
    } catch (error) {
      console.error('챌린지 참가 실패:', error);
      // 에러 처리 (예: 알림 표시)
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.title}>{challenge.challenge_title}</h2>
        <div className={styles.content}>
          <p className={styles.description}>
            {challenge.challenge_info || "외식을 줄이고 싶은 챌린저들을 모집합니다."}
          </p>
          <div className={styles.details}>
            <div className={styles.detailItem}>
              <span>카테고리</span>
              <span>{challenge.category_name}</span>
            </div>
            <div className={styles.detailItem}>
              <span>챌린지 기간</span>
              <span>{challenge.period_display}</span>
            </div>
            <div className={styles.detailItem}>
              <span>챌린지 금액</span>
              <span>{challenge.budget_display}</span>
            </div>
            <div className={styles.detailItem}>
              <span>챌린지 인원</span>
              <span>{challenge.current_participants}/{challenge.max_participants}명</span>
            </div>
          </div>

          <div className={styles.actions}>
            <button
              className={`${styles.likeButton} ${isLiked ? styles.active : ''}`}
              onClick={handleLike}
            >
              <SupportFish className={styles.fishIcon} />
              응원하기 {likeCount}
            </button>
            <button
              className={`${styles.wantButton} ${isWanted ? styles.active : ''}`}
              onClick={handleWant}
            >
              <WantFish className={styles.fishIcon} />
              하고싶어요 {wantCount}
            </button>
          </div>
          
          {isFromChallengePage && (
            <div className={styles.friendsSection}>
              <h3>초대된 친구</h3>
              <div className={styles.friendButtons}>
                <button onClick={handleViewInvitedFriends} className={styles.viewFriendsButton}>
                  초대한 친구 목록 보기
                </button>
                <button onClick={handleInviteFriends} className={styles.inviteButton}>
                  친구 초대하기
                </button>
              </div>
            </div>
          )}
          <div className={styles.progressContainer}>
            <div className={styles.progressLabel}>
              <span>모집률</span>
              <span>{Math.round((challenge.current_participants / challenge.max_participants) * 100)}%</span>
            </div>
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill}
                style={{ 
                    width: `${(challenge.current_participants / challenge.max_participants) * 100}%`
                }}
              />
            </div>
          </div>
        </div>
        <div className={styles.buttons}>
          <button className={styles.cancelButton} onClick={onClose}>
            취소하기
          </button>
          <button 
            className={styles.joinButton}
            onClick={handleJoinChallenge}
          >
            챌린지 참가하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChallengeDetailModal; 