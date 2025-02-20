// UpdatePost.tsx
import { useState, useEffect } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import styles from './UpdatePost.module.scss'
import ChallengeAPI from '../../api'

export default function UpdatePost() {
  const location = useLocation();
  const navigate = useNavigate();
  const { id, postId } = useParams();
  const postData = location.state?.postData;
  
  const [title, setTitle] = useState(postData?.post_title || "");
  const [content, setContent] = useState(postData?.post_content || "");

  // 기존 게시글 데이터로 초기화
  useEffect(() => {
    if (postData) {
      setTitle(postData.post_title)
      setContent(postData.post_content)
    }
  }, [postData])
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (!id || !postId) {
        console.error('Challenge ID or Post ID not found');
        return;
      }

      const updateData = {
        post_id: Number(postId),
        post_title: title,
        post_content: content,
        image_url: postData?.board_image || null
      };

      console.log('Challenge ID:', id);
      console.log('Post ID:', postId);
      console.log('Update Data:', updateData);
      
      await ChallengeAPI.updatePost(Number(id), Number(postId), updateData);
      console.log('Post updated successfully');
      
      // 정확한 URL 경로로 이동
      navigate(`/challenge/progress/${id}/post/${postId}`, {
        state: {
          postData: {
            ...postData,
            post_title: title,
            post_content: content,
            updated_at: new Date().toISOString()
          }
        }
      });
    } catch (error: any) {
      console.error('Error response:', error.response?.data);
      alert('게시글 수정에 실패했습니다.');
    }
  };

  const handleCancel = () => {
    navigate(-1)
  }

  return (
    <div className={styles.updateContainer}>
      <h2 className={styles.updateSubtitle}>게시글 수정</h2>
      
      <form onSubmit={handleSubmit} className={styles.updateForm}>
        <div className={styles.formGroup}>
          <label>제목</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={styles.inputField}
            placeholder={postData?.post_title || "제목을 입력하세요"}
          />
        </div>

        <div className={styles.formGroup}>
          <label>내용</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className={styles.textareaField}
            placeholder={postData?.post_content || "내용을 입력하세요"}
          />
        </div>

        <div className={styles.imageUpload}>
          <button type="button" className={styles.uploadButton}>
            <span>사진을 선택해 주세요</span>
            <img src="/image-icon.svg" alt="이미지 업로드" />
          </button>
        </div>

        <div className={styles.buttonGroup}>
          <button type="button" className={styles.cancelButton} onClick={handleCancel}>
            취소
          </button>
          <button type="submit" className={styles.submitButton} onClick={handleSubmit}>
            수정
          </button>
        </div>
      </form>
    </div>
  )
}