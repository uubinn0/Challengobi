import type React from "react"
import { useState } from "react"
import styles from "./ChallengeList.module.scss"
import type { Challenge } from "../../types"
import { SupportFish, WantFish } from "../../../../components/icons/FishIcon"
import ChallengeDetailModal from '../../../../components/modals/ChallengeDetailModal'

interface ChallengeListProps {
  challenges: Challenge[]
}

const ChallengeList: React.FC<ChallengeListProps> = ({ challenges }) => {
  const [likeStates, setLikeStates] = useState<{ [key: number]: boolean }>({})
  const [wantStates, setWantStates] = useState<{ [key: number]: boolean }>({})
  const [likeCounts, setLikeCounts] = useState<{ [key: number]: number }>(
    challenges.reduce(
      (acc, challenge) => ({
        ...acc,
        [challenge.id]: challenge.likes,
      }),
      {},
    ),
  )
  const [wantCounts, setWantCounts] = useState<{ [key: number]: number }>(
    challenges.reduce(
      (acc, challenge) => ({
        ...acc,
        [challenge.id]: challenge.wants,
      }),
      {},
    ),
  )
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null)

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
            <h3 className={styles.title}>{challenge.title}</h3>
            <div className={styles.info}>
              <p>고비: {challenge.period}</p>
              <p>금액: {challenge.amount}</p>
              <p>카테고리: {challenge.category}</p>
              <p>
                모집인원: {challenge.currentMembers}/{challenge.maxMembers}
              </p>
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

