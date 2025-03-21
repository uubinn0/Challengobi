// WritePost.tsx
import { useState } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import styles from './WritePost.module.scss'
import ChallengeAPI from '../../api'

export default function WritePost() {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const navigate = useNavigate()
  const location = useLocation()
  const { id } = useParams()
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const challengeId = location.state?.challengeId || Number(id)
      
      if (!challengeId) {
        console.error('Challenge ID not found')
        return
      }

      const postData = {
        post_title: title,
        post_content: content
      }

      console.log('Creating post:', { challengeId, postData })
      
      await ChallengeAPI.createPost(challengeId, postData)
      console.log('Post created successfully')
      
      navigate(-1)
    } catch (error) {
      console.error('Failed to create post:', error)
    }
  }

  const handleCancel = () => {
    navigate(-1)
  }

  return (
    <div className={styles.writeContainer}>
      <h2 className={styles.writeSubtitle}>글쓰기</h2>
      
      <form onSubmit={handleSubmit} className={styles.writeForm}>
        <div className={styles.formGroup}>
          <label>제목</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={styles.inputField}
            placeholder="제목을 입력하세요"
          />
        </div>

        <div className={styles.formGroup}>
          <label>내용</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className={styles.textareaField}
            placeholder="내용을 입력하세요"
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
          <button type="submit" className={styles.submitButton}>
            등록
          </button>
        </div>
      </form>
    </div>
  )
}