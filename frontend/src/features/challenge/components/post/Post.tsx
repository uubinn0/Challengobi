// Post.tsx
import { useState, useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";
import { Heart, MessageSquare } from "lucide-react";
import ChallengeAPI from "../../api";
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
  const { id, postId } = useParams();
  const postData = location.state?.postData;
  
  console.log("Location state:", location.state);  // 디버깅용
  console.log("Post data:", postData);            // 디버깅용
  console.log("URL params:", { id, postId });     // 디버깅용

  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchComments = async () => {
      if (!id || !postId) {
        console.error('Missing id or postId', { id, postId });
        setError('필요한 정보가 없습니다.');
        return;
      }

      try {
        setLoading(true);
        const data = await ChallengeAPI.getComments(Number(id), Number(postId));
        setComments(data);
      } catch (error) {
        console.error('댓글 로딩 실패:', error);
        setError('댓글을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [id, postId]);

  // 디버깅용 로그
  console.log('Current comments state:', comments);
  console.log('Current route params:', { id, postId });
  console.log('Post data:', postData);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !id || !postId) return;

    try {
      const newCommentData = await ChallengeAPI.createComment(
        Number(id),
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

  // 로딩 상태 표시 개선
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <p>로딩 중...</p>
      </div>
    );
  }

  // 에러 상태 표시 개선
  if (error) {
    return (
      <div className={styles.errorContainer}>
        <p>{error}</p>
      </div>
    );
  }

  // 데이터가 없을 때 표시 개선
  if (!postData) {
    return (
      <div className={styles.errorContainer}>
        <p>게시글을 찾을 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div className={styles.postContainer}>
      {/* 게시글 내용 */}
      <div className={styles.postCard}>
        <div className={styles.postHeader}>
          <img 
            src={postData?.user_profile_image} 
            alt="프로필" 
            className={styles.avatar}
          />
          <div className={styles.postInfo}>
            <h1 className={styles.postTitle}>{postData?.post_title}</h1>
            <div className={styles.authorInfo}>
              <span>{postData?.user_nickname}</span>
              <span>{postData?.post_created_at ? formatDate(postData.post_created_at) : ''}</span>
            </div>
          </div>
        </div>
        
        <p className={styles.postContent}>{postData?.post_content}</p>
        
        <div className={styles.postActions}>
          <button className={styles.actionButton}>
            <Heart size={16} />
            <span>좋아요 {postData?.like_count}</span>
          </button>
          <button className={styles.actionButton}>
            <MessageSquare size={16} />
            <span>댓글 {comments.length}</span>
          </button>
        </div>
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

      {/* 댓글 목록 */}
      <div className={styles.comments}>
        <h3>댓글 목록 ({comments.length})</h3>
        {comments.length > 0 ? (
          comments.map(comment => (
            <div key={comment.comment_id} className={styles.comment}>
              <div className={styles.commentHeader}>
                <img 
                  src={comment.user_profile_image} 
                  alt={comment.user_nickname} 
                  className={styles.avatar}
                />
                <div className={styles.commentInfo}>
                  <span className={styles.commentAuthor}>{comment.user_nickname}</span>
                  <span className={styles.commentDate}>
                    {new Date(comment.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <p className={styles.commentContent}>{comment.content}</p>
            </div>
          ))
        ) : (
          <p>아직 댓글이 없습니다.</p>
        )}
      </div>
    </div>
  );
}