// Post.tsx
import { useState } from "react"
import { Heart } from "lucide-react"
import "./Post.css"

interface Comment {
 id: number
 content: string
 author: string
 date: string
 avatar: string
}

export default function Post() {
 const [newComment, setNewComment] = useState("")
 const [comments] = useState<Comment[]>([
   {
     id: 1,
     content: "진정하세요",
     author: "수박 개발자",
     date: "2025년 1월 3일 14:50",
     avatar: "/placeholder.svg"
   }
 ])

 const handleSubmit = (e: React.FormEvent) => {
   e.preventDefault()
   if (newComment.trim() === "") return
   setNewComment("")
 }

 return (
   <div className="post-container">
     {/* 메인 포스트 카드 */}
     <div className="post-card">
       <h1 className="post-title">죽을것 같아요</h1>
       <div className="post-info">
         <span>애호박</span>
         <span>작성일자: 2025년 1월 3일</span>
       </div>
       <p className="post-content">
         담배를끊기우고싶어요 28일동안 2만원은 4갑만 피워야는거 아닌가? 이러다 사람 죽겠습니다 라떼가 내가 횡설수설합니다 아 담배 아
       </p>
       <div className="post-actions">
         <button className="like-button">
           <Heart size={16} />
           <span>댓글 1</span>
         </button>
       </div>
     </div>

     {/* 댓글 목록 */}
     <div className="comments">
       {comments.map(comment => (
         <div key={comment.id} className="comment">
           <div className="comment-header">
             <img src={comment.avatar} alt="" className="avatar"/>
             <div className="comment-info">
               <span className="comment-author">{comment.author}</span>
               <span className="comment-date">{comment.date}</span>
             </div>
           </div>
           <p className="comment-content">{comment.content}</p>
         </div>
       ))}
     </div>

     {/* 댓글 입력 */}
     <div className="comment-input-wrap">
       <form onSubmit={handleSubmit} className="comment-form">
         <input
           type="text"
           placeholder="댓글 입력창"
           value={newComment}
           onChange={(e) => setNewComment(e.target.value)}
         />
         <button type="submit">전송</button>
       </form>
     </div>
   </div>
 )
}