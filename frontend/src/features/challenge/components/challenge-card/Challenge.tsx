import { useState } from "react"
import { Pencil, Lock } from "lucide-react"
import styles from "./Challenge.module.scss"
import AddModal from "../../../../components/modals/AddModal"
import ChallengeDetailModal from "../../../../components/modals/ChallengeDetailModal"
import { useNavigate } from "react-router-dom"

interface Challenge {
  id: number
  title: string
  category: string
  period: string
  amount: string
  currentMembers: number
  maxMembers: number
  likes: number
  wants: number
  description?: string
  isLocked?: boolean
}

export default function ChallengePage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null)
  const navigate = useNavigate()

  const ongoingChallenges: Challenge[] = [
    {
      id: 1,
      title: "담배에 돈 쓰지 말..",
      category: "술/담배",
      period: "1월 1일 - 1월 28일",
      amount: "20,000원",
      currentMembers: 3,
      maxMembers: 5,
      likes: 35,
      wants: 20,
      isLocked: true,
    },
    {
      id: 2,
      title: "장을 적당히",
      category: "장보기",
      period: "1월 1일 - 1월 7일",
      amount: "100,000원",
      currentMembers: 3,
      maxMembers: 5,
      likes: 3,
      wants: 2,
    },
    // Add more challenges to test scrolling
    {
      id: 5,
      title: "커피 줄이기",
      category: "카페/디저트",
      period: "2월 1일 - 2월 28일",
      amount: "30,000원",
      currentMembers: 20,
      maxMembers: 20,
      likes: 20,
      wants: 20,
    },
  ]

  const recruitingChallenges: Challenge[] = [
    {
      id: 3,
      title: "외식을 줄입시다!!",
      category: "외식",
      period: "1월 1일 - 1월 7일",
      amount: "100,000원",
      currentMembers: 3,
      maxMembers: 5,
      likes: 10,
      wants: 5,
      isLocked: true,
    },
    {
      id: 4,
      title: "택시 안타야지",
      category: "교통",
      period: "1월 1일 - 1월 28일",
      amount: "30,000원",
      currentMembers: 7,
      maxMembers: 7,
      likes: 7,
      wants: 7,
    },
    // Add more challenges to test scrolling
    {
      id: 6,
      title: "영화 대신 넷플릭스",
      category: "문화생활",
      period: "2월 1일 - 2월 28일",
      amount: "50,000원",
      currentMembers: 15,
      maxMembers: 15,
      likes: 15,
      wants: 15,
    },
  ]

  const handleChallengeClick = (challenge: Challenge, isOngoing: boolean) => {
    if (isOngoing) {
      navigate(`/challenge/progress/${challenge.id}`)
    } else {
      setSelectedChallenge(challenge)
    }
  }

  return (
    <div className={styles.container}>
      <button className={styles.createButton} onClick={() => setIsModalOpen(true)}>
        <Pencil size={20} />
        챌린지 만들기
      </button>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>진행 중인 챌린지</h2>
        <div className={styles.challengeScrollContainer}>
          <div className={styles.challengeScroll}>
            {ongoingChallenges.map((challenge) => (
              <div 
                key={challenge.id} 
                className={styles.challengeCard}
                onClick={() => handleChallengeClick(challenge, true)}
                style={{ cursor: 'pointer' }}
              >
                <div className={styles.cardHeader}>
                  <h3 className={styles.cardTitle}>{challenge.title}</h3>
                  {challenge.isLocked && <Lock size={16} />}
                </div>
                <div className={styles.cardContent}>
                  <p>카테고리 : {challenge.category}</p>
                  <p>챌린지 기간 : {challenge.period}</p>
                  <p>챌린지 금액 : {challenge.amount}</p>
                  <p>챌린지 인원 : {challenge.currentMembers}명 / {challenge.maxMembers}명</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>모집 중인 챌린지</h2>
        <div className={styles.challengeScrollContainer}>
          <div className={styles.challengeScroll}>
            {recruitingChallenges.map((challenge) => (
              <div 
                key={challenge.id} 
                className={styles.challengeCard}
                onClick={() => handleChallengeClick(challenge, false)}
                style={{ cursor: 'pointer' }}
              >
                <div className={styles.cardHeader}>
                  <h3 className={styles.cardTitle}>{challenge.title}</h3>
                  {challenge.isLocked && <Lock size={16} />}
                </div>
                <div className={styles.cardContent}>
                  <p>카테고리 : {challenge.category}</p>
                  <p>챌린지 기간 : {challenge.period}</p>
                  <p>챌린지 금액 : {challenge.amount}</p>
                  <p>챌린지 인원 : {challenge.currentMembers}명 / {challenge.maxMembers}명</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {selectedChallenge && (
        <ChallengeDetailModal
          isOpen={!!selectedChallenge}
          onClose={() => setSelectedChallenge(null)}
          challenge={selectedChallenge}
        />
      )}
      <AddModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  )
}

