"use client"

import type { FC } from "react"
import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { Pencil, Heart, MessageSquare } from "lucide-react"
import styles from "./Progress.module.scss"
import ocrbuttonfish from '../../../../assets/ocr-button-fish.png'
import profileJaringobi from '../../../../assets/profile-jaringobi.png'

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
 const location = useLocation()

 const isFromHome = location.pathname.includes("/ongoing-challenge/")

 const handlePostClick = (commentId: number) => {
   const currentPath = location.pathname;
   navigate(`${currentPath}/post/${commentId}`);
 };

 const handleLike = (commentId: number) => {
   setLikedComments((prev) =>
     prev.includes(commentId) ? prev.filter((id) => id !== commentId) : [...prev, commentId],
   )
 }
 const handleWriteClick = () => {
  navigate(`${location.pathname}/write`);
};

 const handleVerifyClick = () => {
   navigate("/challenge/ocr");
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
   <div className={styles.container}>
     <div className={styles.challengeCard}>
       <h1 className={styles.title}>담배에 돈 쓰지 맙시다</h1>
       <p className={styles.subtitle}>올해는 금연해봅시다 우리</p>
       <div className={styles.info}>
         <div className={styles.infoItem}>
           <span>카테고리 :</span>
           <span>술/담배</span>
         </div>
         <div className={styles.infoItem}>
           <span>챌린지 기간 :</span>
           <span>1월 1일 - 1월 29일</span>
         </div>
         <div className={styles.infoItem}>
           <span>챌린지 금액 :</span>
           <span>20,000원</span>
         </div>
         <div className={styles.infoItem}>
           <span>챌린지 인원 :</span>
           <span>3명</span>
         </div>
         <div className={styles.infoItem}>
           <span>남은 금액 :</span>
           <span>0원</span>
         </div>
       </div>
     </div>
     {/* 홈 화면에서 접근하지 않았을 때만 progress-card 표시 */}
     {!isFromHome && (
       <>
         <div className={styles.progressCard}>
           <div className={styles.progressTextContainer}>
             <div className={styles.fishIconContainer}>
               <img 
                 src={profileJaringobi}
                 alt="자린고비 프로필" 
                 className={styles.ocrFishIcon}
               />
             </div>
             <p className={styles.progressText}>
               자린 고비님 챌린지 성공까지
               <br />
               7일 남았어요.
             </p>
           </div>
           <p className={styles.amountText}>
             현재까지
             <br />
             10,000원 남았어요
           </p>
           <button onClick={handleVerifyClick} className={styles.verifyButton}>
             <img 
               src={ocrbuttonfish} 
               alt="물고기 아이콘" 
               className={styles.ocrFishIcon}
             />
             고비 인증하기
           </button>
         </div>
       </>
     )}
     <div className={styles.commentsSection}>
       <h2 className={styles.sectionTitle}>게시글</h2>
       <div className={styles.commentsList}>
         {comments.map((comment) => (
           <div 
             key={comment.id} 
             className={styles.commentItem}
             onClick={() => handlePostClick(comment.id)}
             style={{ cursor: 'pointer' }}
           >
             <div className={styles.commentHeader}>
               <img src={comment.avatar || "/placeholder.svg"} alt="" className={styles.avatar} />
               <div className={styles.commentInfo}>
                 <p className={styles.commentText}>{comment.content}</p>
                 <p className={styles.authorName}>{comment.authorRole}</p>
               </div>
             </div>
             <div className={styles.commentActions} onClick={(e) => e.stopPropagation()}>
               <button
                 onClick={(e) => {
                   e.stopPropagation();
                   handleLike(comment.id);
                 }}
                 className={`${styles.actionButton} ${likedComments.includes(comment.id) ? styles.liked : ""}`}
               >
                 <Heart size={16} />
                 <span>{comment.likes}</span>
               </button>
               <button 
                 className={styles.actionButton}
                 onClick={(e) => e.stopPropagation()}
               >
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
       <button className={styles.writeButton} onClick={handleWriteClick}>
       <Pencil size={20} />
       글쓰기
     </button>
     )}
   </div>
 )
}

export default Progress