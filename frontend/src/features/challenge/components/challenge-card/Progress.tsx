"use client"

import type { FC } from "react"
import { useState, useEffect } from "react"
// useLocation 추가
import { useNavigate, useLocation } from "react-router-dom"
import { Pencil, Heart, MessageSquare, Fish } from "lucide-react"
import "./Progress.css"

interface Comment {
  id: number
  author: string
  authorRole: string
  content: string
  likes: number
  comments: number
  avatar: string
}

const Progress: FC = () => {
  const [likedComments, setLikedComments] = useState<number[]>([])
  const navigate = useNavigate()
  // location 추가
  const location = useLocation()

  // 홈 화면에서 접근했는지 확인하는 변수 추가
  const isFromHome = location.pathname.includes("/ongoing-challenge/")

  const handleLike = (commentId: number) => {
    setLikedComments((prev) =>
      prev.includes(commentId) ? prev.filter((id) => id !== commentId) : [...prev, commentId],
    )
  }

  const handleVerifyClick = () => {
    navigate("/challenge/ocr")
  }

  const comments: Comment[] = [
    {
      id: 1,
      author: "죽을것 같아요",
      authorRole: "애호박",
      content: "죽을것 같아요",
      likes: 3,
      comments: 2,
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 2,
      author: "아무것도 못하네요",
      authorRole: "시작 프렌즈",
      content: "아무것도 못하네요",
      likes: 2,
      comments: 2,
      avatar: "/placeholder.svg?height=40&width=40",
    },
  ]

  useEffect(() => {
    document.body.style.overflowY = "auto"
    return () => {
      document.body.style.overflowY = ""
    }
  }, [])

  return (
    <div className="container">
      <div className="challenge-card">
        <h1 className="title">담배에 돈 쓰지 맙시다</h1>
        <p className="subtitle">올해는 금연해봅시다 우리</p>
        <div className="info">
          <div className="info-item">
            <span>카테고리 :</span>
            <span>술/담배</span>
          </div>
          <div className="info-item">
            <span>챌린지 기간 :</span>
            <span>1월 1일 - 1월 29일</span>
          </div>
          <div className="info-item">
            <span>챌린지 금액 :</span>
            <span>20,000원</span>
          </div>
          <div className="info-item">
            <span>챌린지 인원 :</span>
            <span>3명</span>
          </div>
          <div className="info-item">
            <span>남은 금액 :</span>
            <span>0원</span>
          </div>
        </div>
      </div>
      {/* 홈 화면에서 접근하지 않았을 때만 progress-card 표시 */}
      {!isFromHome && (
        <>
          <div className="progress-card">
            <div className="fish-icon-container">
              <Fish size={60} />
            </div>
            <p className="progress-text">
              자린 골비님 챌린지 성공까지
              <br />
              7일 남았어요.
            </p>
            <p className="amount-text">
              현재까지
              <br />
              10,000원 남았어요
            </p>
            <button onClick={handleVerifyClick} className="verify-button">
              <Fish size={24} />
              고비 인증하기
            </button>
          </div>
        </>
      )}
      <div className="comments-section">
        <h2 className="section-title">게시글</h2>
        <div className="comments-list">
          {comments.map((comment) => (
            <div key={comment.id} className="comment-item">
              <div className="comment-header">
                <img src={comment.avatar || "/placeholder.svg"} alt="" className="avatar" />
                <div className="comment-info">
                  <p className="comment-text">{comment.content}</p>
                  <p className="author-name">{comment.authorRole}</p>
                </div>
              </div>
              <div className="comment-actions">
                <button
                  onClick={() => handleLike(comment.id)}
                  className={`action-button ${likedComments.includes(comment.id) ? "liked" : ""}`}
                >
                  <Heart size={16} />
                  <span>{comment.likes}</span>
                </button>
                <button className="action-button">
                  <MessageSquare size={16} />
                  <span>{comment.comments}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* 홈 화면에서 접근하지 않았을 때만 write-button 표시 */}
      {!isFromHome && (
        <button className="write-button">
          <Pencil size={20} />
          글쓰기
        </button>
      )}
    </div>
  )
}

export default Progress

