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

  const handleChallengeClick = (challenge: Challenge) => {
    navigate(`/ongoing-challenge/${challenge.challenge_id}`, {
      state: { challengeData: challenge }
    });
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
          onClick={() => handleChallengeClick(challenge)}
          role="button"
          tabIndex={0}
        >
          <div className={styles.header}>
            <div className={styles.title}>{challenge.challenge_title}</div>
            <div className={styles.successRate}>
              {challenge.current_participants}/{challenge.max_participants}
            </div>
          </div>
          
          <div className={styles.info}>
            <p>생성자: {challenge.creator_nickname}</p>
            <p>기간: {challenge.period_display}</p>
            <p>예산: {challenge.budget_display}</p>
            <p>카테고리: {challenge.category_name}</p>
            <p>참여자: {challenge.participants_display}</p>
            <p>시작일: {challenge.start_date}</p>
          </div>

          <div className={styles.progressSection}>
            <div className={styles.progressLabel}>
              <span>진행도</span>
              <span>{challenge.progress}%</span>
            </div>
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill} 
                style={{ width: `${(challenge.current_participants / challenge.max_participants) * 100}%` }} 
              />
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

