import type React from "react"
import { useState, useEffect } from "react"
import styles from "./ChallengeList.module.scss"
import type { Challenge } from "../../types"
import { SupportFish, WantFish } from "../../../../components/icons/FishIcon"
import ChallengeDetailModal from '../../../../components/modals/ChallengeDetailModal'
import challengeList1 from '../../../../assets/challengelist1.jpg'
import challengeList2 from '../../../../assets/challengelist2.jpg'
import challengeList3 from '../../../../assets/challengelist3.jpg'

interface ChallengeListProps {
  challenges: Challenge[]
}

const ChallengeList: React.FC<ChallengeListProps> = ({ challenges }) => {
  const [likeStates, setLikeStates] = useState<{ [key: number]: boolean }>({})
  const [wantStates, setWantStates] = useState<{ [key: number]: boolean }>({})
  const [likeCounts, setLikeCounts] = useState<{ [key: number]: number }>({})
  const [wantCounts, setWantCounts] = useState<{ [key: number]: number }>({})
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null)

  useEffect(() => {
    setLikeCounts(
      challenges.reduce(
        (acc, challenge) => ({
          ...acc,
          [challenge.id]: challenge.likes,
        }),
        {},
      ),
    );
    setWantCounts(
      challenges.reduce(
        (acc, challenge) => ({
          ...acc,
          [challenge.id]: challenge.wants,
        }),
        {},
      ),
    );
  }, [challenges]);

  const handleLike = (challengeId: number, e: React.MouseEvent) => {
    e.stopPropagation()
    setLikeStates((prev) => ({
      ...prev,
      [challengeId]: !prev[challengeId],
    }))
    setLikeCounts((prev) => ({
      ...prev,
      [challengeId]: prev[challengeId] + (likeStates[challengeId] ? -1 : 1),
    }))
  }

  const handleWant = (challengeId: number, e: React.MouseEvent) => {
    e.stopPropagation()
    setWantStates((prev) => ({
      ...prev,
      [challengeId]: !prev[challengeId],
    }))
    setWantCounts((prev) => ({
      ...prev,
      [challengeId]: prev[challengeId] + (wantStates[challengeId] ? -1 : 1),
    }))
  }

  const handleChallengeClick = (challenge: Challenge) => {
    setSelectedChallenge(challenge)
  }

  const getChallengeImage = (currentMembers: number, maxMembers: number) => {
    if (currentMembers === maxMembers) return challengeList3;
    if (currentMembers === 1) return challengeList1;
    return challengeList2;
  };

  if (challenges.length === 0) {
    return (
      <div className={styles.noChallenges}>
        <p>해당 카테고리의 챌린지가 없습니다.</p>
      </div>
    )
  }

  return (
    <>
      <div className={styles.challengeList}>
        {challenges.map((challenge) => (
          <div 
            key={challenge.id} 
            className={styles.challengeCard}
            onClick={() => handleChallengeClick(challenge)}
          >
            <div className={styles.cardContent}>
              <div className={styles.content}>
                <h3 className={styles.title}>{challenge.title}</h3>
                <div className={styles.info}>
                  <p>생성자: {challenge.creator_nickname}</p>
                  <p>기간: {challenge.period_display}</p>
                  <p>예산: {challenge.budget_display}</p>
                  <p>카테고리: {challenge.category_name}</p>
                  <p>참여자: {challenge.participants_display}</p>
                  <p>시작일: {challenge.start_date}</p>
                </div>
              </div>
              <div className={styles.challengeImage}>
                <img 
                  src={getChallengeImage(challenge.currentMembers, challenge.maxMembers)} 
                  alt="챌린지 상태"
                />
              </div>
            </div>
            <div className={styles.actions}>
              <button
                className={`${styles.likeButton} ${likeStates[challenge.id] ? styles.active : ""}`}
                onClick={(e) => handleLike(challenge.id, e)}
              >
                <SupportFish className={styles.fishIcon} />
                응원하기 {likeCounts[challenge.id]}
              </button>
              <button
                className={`${styles.wantButton} ${wantStates[challenge.id] ? styles.active : ""}`}
                onClick={(e) => handleWant(challenge.id, e)}
              >
                <WantFish className={styles.fishIcon} />
                하고싶어요 {wantCounts[challenge.id]}
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {selectedChallenge && (
        <ChallengeDetailModal
          isOpen={!!selectedChallenge}
          onClose={() => setSelectedChallenge(null)}
          challenge={selectedChallenge}
        />
      )}
    </>
  )
}

export default ChallengeList

