import type { FC } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiEdit2 } from 'react-icons/fi';
import { AiOutlineHeart, AiFillHeart, AiOutlineMessage } from 'react-icons/ai';
import { FaFish } from 'react-icons/fa';
import './Progress.css';


interface CommentType {
  id: number;
  name: string;
  avatar: string;
  role: string;
  likes: number;
  comments: number;
}

const Progress: FC = () => {
  const [likedComments, setLikedComments] = useState<number[]>([]);
  const navigate = useNavigate();

  const handleLike = (commentId: number) => {
    setLikedComments(prev => 
      prev.includes(commentId) 
        ? prev.filter(id => id !== commentId)
        : [...prev, commentId]
    );
  };

  const handleVerifyClick = () => {
    navigate('/challenge/ocr');
  };

  const comments: CommentType[] = [
    {
      id: 1,
      name: "죽을것 같아요",
      avatar: "/avatar1.jpg",
      role: "매니저",
      likes: 2,
      comments: 2
    },
    {
      id: 2,
      name: "아무것도 못하겠어요",
      avatar: "/avatar2.jpg",
      role: "시작 프렌즈",
      likes: 2,
      comments: 2
    }
  ];

  return (
    <div className="recruit-container">
      <div className="recruit-header">
        <h2 className="recruit-title">담배에 돈 쓰지 맙시다</h2>
        <div className="recruit-info">
          <p>카테고리: 술/담배</p>
          <p>챌린지 기간: 1월 1일 ~ 1월 29일</p>
          <p>챌린지 금액: 20,000원</p>
          <p>챌린지 인원: 3명</p>
          <p>남은 공간: 0명</p>
        </div>
      </div>

      <FaFish className="fish-icon" />
      <p className="challenge-amount">챌린지까지 10,000원 남았어요.</p>

      <button className="verify-button" onClick={handleVerifyClick}>
        고비인증하기
      </button>
    
      <div className="comments-list">
        {comments.map((comment) => (
          <div key={comment.id} className="comment-item">
            <img src={comment.avatar} alt={comment.name} className="comment-avatar" />
            <div className="comment-content">
              <div className="comment-name">{comment.name}</div>
              <div className="comment-role">{comment.role}</div>
            </div>
            <div className="interaction-counts">
              <button 
                className="like-button"
                onClick={() => handleLike(comment.id)}
              >
                {likedComments.includes(comment.id) 
                  ? <AiFillHeart className="heart-icon filled" />
                  : <AiOutlineHeart className="heart-icon" />
                }
                <span>{comment.likes}</span>
              </button>
              <div className="comment-count">
                <AiOutlineMessage />
                <span>{comment.comments}</span>
              </div>
            </div>
          </div>
        ))}
      </div>


      <button className="write-button">
        <FiEdit2 /> 글쓰기
      </button>
    </div>
  );
};

export default Progress;
