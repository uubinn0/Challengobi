// Post.tsx
import { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Heart, MessageSquare } from "lucide-react";
import ChallengeAPI from "../../api";
import styles from "./Post.module.scss";
  

interface Comment {
  id: number;
  content: string;
  user_nickname: string;
  user_profile_image: string;
  created_at: string;
}

export default function Post() {
  const location = useLocation();
  const navigate = useNavigate();
  const { id, postId } = useParams();
  const postData = location.state?.postData;
  const isFromHome = location.pathname.startsWith("/challenge/progress/");
  
  console.log("Location state:", location.state);  // 디버깅용
  console.log("Post data:", postData);            // 디버깅용
  console.log("URL params:", { id, postId });     // 디버깅용

  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const userId = localStorage.getItem('user_id'); // user_id도 필요합니다

  const userNickname = localStorage.getItem('nickname');  // localStorage에서 nickname 가져오기
  const isMyPost = postData?.user_nickname === userNickname;  // nickname 비교로 변경

  console.log("Local Storage Nickname:", userNickname);
  console.log("Post Author Nickname:", postData?.user_nickname);
  console.log("Is My Post?:", isMyPost);

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
        console.log('Fetched comments:', data); // 받아온 댓글 데이터 확인
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

  // 수정 핸들러 추가
  const handleEdit = () => {
    navigate(`/challenge/progress/${id}/post/${postId}/update`, {
      state: { 
        postData: {
          post_id: postData.post_id,
          post_title: postData.post_title,
          post_content: postData.post_content,
          user_nickname: postData.user_nickname
        }
      }
    });
  };

  // 삭제 핸들러 추가
  const handleDelete = async () => {
    if (!window.confirm('게시글을 삭제하시겠습니까?')) return;
    try {
      await ChallengeAPI.deletePost(Number(id), Number(postId));
      navigate(-1);
    } catch (error) {
      console.error('게시글 삭제 실패:', error);
    }
  };

  const handleCommentEdit = (commentId: number, content: string) => {
    setEditingCommentId(commentId);
    setEditingContent(content);
  };

  const handleCommentDelete = async (commentId: string | number) => {
    if (!window.confirm('댓글을 삭제하시겠습니까?')) return;
    
    try {
      const numericCommentId = Number(commentId);
      
      console.log('Attempting to delete comment:', {
        challengeId: id,
        postId: postId,
        commentId: numericCommentId
      });
      
      if (!id || !postId || isNaN(numericCommentId)) {
        console.error('Invalid IDs:', { id, postId, commentId: numericCommentId });
        throw new Error('필요한 ID 값이 없거나 유효하지 않습니다.');
      }

      await ChallengeAPI.deleteComment(
        Number(id),
        Number(postId),
        numericCommentId
      );
      
      // 댓글 삭제 후 댓글 목록 다시 불러오기
      const updatedComments = await ChallengeAPI.getComments(Number(id), Number(postId));
      setComments(updatedComments);
      
      console.log('Comment deleted successfully');
      alert('댓글이 삭제되었습니다.');
    } catch (error) {
      console.error('댓글 삭제 실패:', error);
      alert('댓글 삭제에 실패했습니다.');
    }
  };

  const handleCommentUpdate = async (commentId: number) => {
    try {
      if (!id || !postId || !userId) {
        throw new Error('필요한 ID 값이 없습니다.');
      }

      const updateData = {
        id: commentId,
        user_id: Number(userId),
        comment_content: editingContent
      };

      await ChallengeAPI.updateComment(
        Number(id),
        Number(postId),
        commentId,
        updateData
      );

      // 댓글 목록 새로고침
      const updatedComments = await ChallengeAPI.getComments(Number(id), Number(postId));
      setComments(updatedComments);
      
      // 수정 모드 종료
      setEditingCommentId(null);
      setEditingContent("");
      
      alert('댓글이 수정되었습니다.');
    } catch (error) {
      console.error('댓글 수정 실패:', error);
      alert('댓글 수정에 실패했습니다.');
    }
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditingContent("");
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
            <span>좋아요 {postData?.like_count || 0}</span>
          </button>
          <button className={styles.actionButton}>
            <MessageSquare size={16} />
            <span>댓글 {comments.length}</span>
          </button>
          {isMyPost && (
            <>
              <button 
                className={`${styles.actionButton} ${styles.editButton}`}
                onClick={handleEdit}
              >
                수정
              </button>
              <button 
                className={`${styles.actionButton} ${styles.deleteButton}`}
                onClick={handleDelete}
              >
                삭제
              </button>
            </>
          )}
        </div>
      </div>

      {/* 댓글 입력 */}
      {isFromHome && (
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
      )}

      {/* 댓글 목록 */}
      <div className={styles.comments}>
        <h3>댓글 목록 ({comments.length})</h3>
        {comments.length > 0 ? (
          comments.map(comment => (
            <div key={comment.id} className={styles.comment}>
              <div className={styles.commentHeader}>
                <img 
                  src={comment.user_profile_image} 
                  alt={comment.user_nickname} 
                  className={styles.avatar}
                />
                <div className={styles.commentInfo}>
                  <span className={styles.commentAuthor}>{comment.user_nickname}</span>
                  <span className={styles.commentDate}>
                    {formatDate(comment.created_at)}
                  </span>
                </div>
                {comment.user_nickname === userNickname && (
                  <div className={styles.commentActions}>
                    {editingCommentId === comment.id ? (
                      <>
                        <button 
                          className={`${styles.actionButton} ${styles.confirmButton}`}
                          onClick={() => handleCommentUpdate(comment.id)}
                        >
                          확인
                        </button>
                        <button 
                          className={`${styles.actionButton} ${styles.cancelButton}`}
                          onClick={handleCancelEdit}
                        >
                          취소
                        </button>
                      </>
                    ) : (
                      <>
                        <button 
                          className={`${styles.actionButton} ${styles.editButton}`}
                          onClick={() => handleCommentEdit(comment.id, comment.content)}
                        >
                          수정
                        </button>
                        <button 
                          className={`${styles.actionButton} ${styles.deleteButton}`}
                          onClick={() => handleCommentDelete(comment.id)}
                        >
                          삭제
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
              {editingCommentId === comment.id ? (
                <div className={styles.commentContent}>
                  <input
                    type="text"
                    value={editingContent}
                    onChange={(e) => setEditingContent(e.target.value)}
                    className={styles.commentInput}
                    placeholder={comment.content}
                  />
                </div>
              ) : (
                <p className={styles.commentContent}>{comment.content}</p>
              )}
            </div>
          ))
        ) : (
          <p>아직 댓글이 없습니다.</p>
        )}
      </div>
    </div>
  );
}