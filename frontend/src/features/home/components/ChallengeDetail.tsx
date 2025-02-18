import { useParams } from "react-router-dom"
import { Pencil } from "lucide-react"
import styles from "./ChallengeDetail.module.scss"
import ChallengobiIcon from "../../../components/icons/ChallengobiIcon"
import type { Challenge } from "../types"

interface Comment {
  id: number
  author: string
  authorImage: string
  content: string
  likes: number
  comments: number
}

interface ChallengeDetailProps {
  challenges: Challenge[]
}

export default function ChallengeDetail({ challenges }: ChallengeDetailProps) {
  const { id } = useParams<{ id: string }>()
  const challenge = challenges.find((c) => c.challenge_id === Number(id))

  const comments: Comment[] = [
    {
      id: 1,
      author: "애호박",
      authorImage: "/placeholder.svg?height=40&width=40",
      content: "죽을것 같아요",
      likes: 2,
      comments: 2,
    },
    {
      id: 2,
      author: "시금치 프렌드",
      authorImage: "/placeholder.svg?height=40&width=40",
      content: "아무것도 못하네요",
      likes: 2,
      comments: 2,
    },
  ]

  if (!challenge) {
    return <div className={styles.loading}>Loading...</div>
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.challengeCard}>
          <h2 className={styles.title}>{challenge.challenge_title}</h2>
          {/* <p className={styles.subtitle}>{challenge.subtitle}</p> */}
    
          <div className={styles.infoList}>
            <div className={styles.infoItem}>
              <span className={styles.label}>카테고리 :</span>
              <span className={styles.value}>{challenge.category_name}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>챌린지 기간 :</span>
              <span className={styles.value}>{challenge.period}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>챌린지 금액 :</span>
              <span className={styles.value}>{challenge.budget}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>진행도 :</span>
              <span className={styles.value}>{challenge.current_participants}/{challenge.max_participants}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>성공률 :</span>
              {/* <span className={styles.value}>{challenge.success_rate}%</span> */}
            </div>
          </div>
        </div>

        <button className={styles.writeButton}>
          <Pencil size={20} />
          글쓰기
        </button>

        <div className={styles.comments}>
          {comments.map((comment) => (
            <div key={comment.id} className={styles.commentItem}>
              <div className={styles.commentHeader}>
                <img
                  src={comment.authorImage || "/placeholder.svg"}
                  alt={comment.author}
                  className={styles.authorImage}
                />
                <div className={styles.commentContent}>
                  <p className={styles.commentText}>{comment.content}</p>
                  <span className={styles.author}>{comment.author}</span>
                </div>
              </div>
              <div className={styles.commentActions}>
                <button className={styles.actionButton}>
                  <span>♥</span> {comment.likes}
                </button>
                <button className={styles.actionButton}>
                  <span>☰</span> {comment.comments}
                </button>
              </div>
            </div>
          ))}
        </div>

        <button className={styles.verifyButton}>
          <ChallengobiIcon color="#ffffff" width={24} height={13} />
          <span>고비 인증하기</span>
        </button>
      </div>
    </div>
  )
}

