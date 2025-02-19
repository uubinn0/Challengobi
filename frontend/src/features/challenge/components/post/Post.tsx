// Post.tsx
import { useState, useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";
import { Heart, MessageSquare } from "lucide-react";
import   ChallengeAPI  from "../../api";
import styles from "./Post.module.scss";
  
interface PostData {
  post_id: number;
  post_title: string;
  post_content: string;
  post_created_at: string;
  user_profile_image: string;
  user_nickname: string;
  like_count: number;
  comment_count: number;
}

interface Comment {
  comment_id: number;
  content: string;
  user_nickname: string;
  user_profile_image: string;
  created_at: string;
}

export default function Post() {
  const location = useLocation();
  const { challengeId, postId } = useParams();
  const postData = location.state?.postData as PostData;
  
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    const fetchComments = async () => {
      if (challengeId && postId) {
        try {
          const data = await ChallengeAPI.getComments(Number(challengeId), Number(postId));
          setComments(data);
        } catch (error) {
          console.error('댓글 로딩 실패:', error);
        }
      }
    };
    fetchComments();
  }, [challengeId, postId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !challengeId || !postId) return;

    try {
      const newCommentData = await ChallengeAPI.createComment(
        Number(challengeId),
        Number(postId),
        newComment
      );
      setComments(prev => [...prev, newCommentData]);
      setNewComment("");
    } catch (error) {
      console.error('댓글 작성 실패:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={styles.postContainer}>
      {/* 메인 포스트 카드 */}
      <div className={styles.postCard}>
        <div className={styles.postHeader}>
          <img 
            src={postData.user_profile_image} 
            alt="프로필" 
            className={styles.avatar}
          />
          <div className={styles.postInfo}>
            <h1 className={styles.postTitle}>{postData.post_title}</h1>
            <div className={styles.authorInfo}>
              <span>{postData.user_nickname}</span>
              <span>{formatDate(postData.post_created_at)}</span>
            </div>
          </div>
        </div>
        
        <p className={styles.postContent}>{postData.post_content}</p>
        
        <div className={styles.postActions}>
          <button 
            className={`${styles.actionButton} ${isLiked ? styles.liked : ''}`}
            onClick={() => setIsLiked(!isLiked)}
          >
            <Heart size={16} />
            <span>좋아요 {postData.like_count}</span>
          </button>
          <button className={styles.actionButton}>
            <MessageSquare size={16} />
            <span>댓글 {postData.comment_count}</span>
          </button>
        </div>
      </div>

      {/* 댓글 목록 */}
      <div className={styles.comments}>
        {comments.map(comment => (
          <div key={comment.comment_id} className={styles.comment}>
            <div className={styles.commentHeader}>
              <img 
                src={comment.user_profile_image} 
                alt="" 
                className={styles.avatar}
              />
              <div className={styles.commentInfo}>
                <span className={styles.commentAuthor}>{comment.user_nickname}</span>
                <span className={styles.commentDate}>
                  {formatDate(comment.created_at)}
                </span>
              </div>
            </div>
            <p className={styles.commentContent}>{comment.content}</p>
          </div>
        ))}
      </div>

      {/* 댓글 입력 */}
      <form onSubmit={handleSubmit} className={styles.commentForm}>
        <input
          type="text"
          placeholder="댓글을 입력하세요"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className={styles.commentInput}
        />
        <button type="submit" className={styles.submitButton}>
          댓글 작성
        </button>
      </form>
    </div>
  );
}