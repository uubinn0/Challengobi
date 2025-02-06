import type React from "react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import styles from "./OngoingChallengeList.module.scss"
import type { OngoingChallenge } from "../../types"

interface OngoingChallengeListProps {
  challenges: OngoingChallenge[]
}

const OngoingChallengeList: React.FC<OngoingChallengeListProps> = ({ challenges }) => {
  const navigate = useNavigate()
  const [supportStates, setSupportStates] = useState<{ [key: number]: boolean }>({})
  const [wantStates, setWantStates] = useState<{ [key: number]: boolean }>({})
  const [supportCounts, setSupportCounts] = useState<{ [key: number]: number }>(
    challenges.reduce(
      (acc, challenge) => ({
        ...acc,
        [challenge.id]: challenge.supports,
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

  const handleSupport = (e: React.MouseEvent, challengeId: number) => {
    e.stopPropagation()
    setSupportStates((prev) => ({
      ...prev,
      [challengeId]: !prev[challengeId],
    }))
    setSupportCounts((prev) => ({
      ...prev,
      [challengeId]: prev[challengeId] + (supportStates[challengeId] ? -1 : 1),
    }))
  }

  const handleWant = (e: React.MouseEvent, challengeId: number) => {
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

  const handleChallengeClick = (challengeId: number) => {
    navigate(`/challenge/${challengeId}`)
  }

  if (challenges.length === 0) {
    return (
      <div className={styles.noChallenges}>
        <p>해당 카테고리의 챌린지가 없습니다.</p>
      </div>
    )
  }

  return (
    <div className={styles.challengeList}>
      {challenges.map((challenge) => (
        <div
          key={challenge.id}
          className={styles.challengeCard}
          onClick={() => handleChallengeClick(challenge.id)}
          role="button"
          tabIndex={0}
        >
          <div className={styles.header}>
            <h3 className={styles.title}>{challenge.title}</h3>
            <span className={`${styles.successRate} ${challenge.successRate <= 10 ? styles.lowSuccessRate : ""}`}>
              성공률 : {challenge.successRate}%
            </span>
          </div>
          <div className={styles.info}>
            <p>카테고리: {challenge.category}</p>
            <p>금액: {challenge.amount}</p>
            <p>기간: {challenge.period}</p>
          </div>
          <div className={styles.progressSection}>
            <div className={styles.progressLabel}>
              <span>진행도</span>
              <span>{challenge.progress}%</span>
            </div>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: `${challenge.progress}%` }} />
            </div>
          </div>
          <div className={styles.actions}>
            <button
              className={`${supportStates[challenge.id] ? styles.active : ""}`}
              onClick={(e) => handleSupport(e, challenge.id)}
            >
              응원하기 {supportCounts[challenge.id]}
            </button>
            <button
              className={`${wantStates[challenge.id] ? styles.active : ""}`}
              onClick={(e) => handleWant(e, challenge.id)}
            >
              하고싶어요 {wantCounts[challenge.id]}
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

export default OngoingChallengeList

