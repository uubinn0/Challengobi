// WritePost.tsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './WritePost.css'

export default function WritePost() {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const navigate = useNavigate()
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // 여기에 글 작성 로직을 추가할 수 있습니다
    // API 호출 등을 수행한 후
    navigate(-1) // Progress 페이지로 돌아가기
  }

  const handleCancel = () => {
    navigate(-1) // Progress 페이지로 돌아가기
  }

  return (
    <div className="write-container">
      <h2 className="write-subtitle">글쓰기</h2>
      
      <form onSubmit={handleSubmit} className="write-form">
        <div className="form-group">
          <label>제목</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input-field"
            placeholder="제목을 입력하세요"
          />
        </div>

        <div className="form-group">
          <label>내용</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="textarea-field"
            placeholder="내용을 입력하세요"
          />
        </div>

        <div className="image-upload">
          <button type="button" className="upload-button">
            <span>사진을 선택해 주세요</span>
            <img src="/image-icon.svg" alt="이미지 업로드" />
          </button>
        </div>

        <div className="button-group">
          <button type="button" className="cancel-button" onClick={handleCancel}>
            취소
          </button>
          <button type="submit" className="submit-button">
            등록
          </button>
        </div>
      </form>
    </div>
  )
}