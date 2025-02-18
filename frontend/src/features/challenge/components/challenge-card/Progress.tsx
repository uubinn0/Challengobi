"use client"

import type { FC } from "react"
import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { Pencil, Heart, MessageSquare } from "lucide-react"
import styles from "./Progress.module.scss"
import ocrbuttonfish from '../../../../assets/ocr-button-fish.png'
import profileJaringobi from '../../../../assets/profile-jaringobi.png'
import type { Challenge } from "../../../../features/home/types"
import  ChallengeAPI  from "../../api"

interface Post {
  post_id: number;
  user_id: number;
  post_title: string;
  post_content: string;
  post_image: string | null;
  post_created_at: string;
  post_updated_at: string;
  like_count: number;
  comment_count: number;
}

const Progress: FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [likedPosts, setLikedPosts] = useState<number[]>([]);
  
  const navigate = useNavigate();
  const location = useLocation();
  const challengeData = location.state?.challengeData as Challenge;

  const isFromHome = location.pathname.includes("/ongoing-challenge/")

  useEffect(() => {
    if (!challengeData && isFromHome) {
      navigate('/'); // 데이터가 없으면 홈으로 리다이렉트
      return;
    }
  }, [challengeData, navigate, isFromHome]);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return '날짜 정보 없음';
      }
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error('날짜 변환 오류:', error);
      return '날짜 정보 없음';
    }
  };

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        if (!challengeData?.challenge_id) {
          setError("챌린지 정보를 찾을 수 없습니다.");
          console.log("챌린지 ID가 없음:", challengeData);
          return;
        }

        console.log("챌린지 ID:", challengeData.challenge_id);
        const postsData = await ChallengeAPI.getPosts(challengeData.challenge_id);
        console.log("받아온 게시글 데이터:", postsData);
        setPosts(postsData);
        setLoading(false);
      } catch (err) {
        console.error("게시글 로딩 실패:", err);
        setError("게시글을 불러오는데 실패했습니다.");
        setLoading(false);
      }
    };

    fetchPosts();
  }, [challengeData]);

  const handlePostClick = (postId: number) => {
    navigate(`${location.pathname}/post/${postId}`);
  };

  const handleLike = (postId: number) => {
    setLikedPosts((prev) =>
      prev.includes(postId) ? prev.filter((id) => id !== postId) : [...prev, postId]
    );
  };

  const handleWriteClick = () => {
    navigate(`${location.pathname}/write`);
  };

  const handleVerifyClick = () => {
    navigate("/challenge/ocr");
  }

  useEffect(() => {
    document.body.style.overflowY = "auto"
    return () => {
      document.body.style.overflowY = ""
    }
  }, [])

  if (!challengeData) {
    return <div>Loading...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.challengeCard}>
        <h1 className={styles.title}>{challengeData.challenge_title}</h1>
        <p className={styles.subtitle}>{challengeData.challenge_info}</p>
        <div className={styles.info}>
          <div className={styles.infoItem}>
            <span>카테고리 :</span>
            <span>{challengeData.category_name}</span>
          </div>
          <div className={styles.infoItem}>
            <span>챌린지 기간 :</span>
            <span>{challengeData.start_date} ~ {challengeData.end_date}</span>
          </div>
          <div className={styles.infoItem}>
            <span>챌린지 금액 :</span>
            <span>{challengeData.budget_display}</span>
          </div>
          <div className={styles.infoItem}>
            <span>챌린지 인원 :</span>
            <span>{challengeData.participants_display}</span>
          </div>
          <div className={styles.infoItem}>
            <span>남은 금액 :</span>
            <span>{challengeData.budget_display}</span> {/* 실제 남은 금액은 API에서 가져와야 함 */}
          </div>
        </div>
      </div>

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
                {challengeData.creator_nickname}님 챌린지 성공까지
                <br />
                {challengeData.period}일 남았어요.
              </p>
            </div>
            <p className={styles.amountText}>
              현재까지
              <br />
              {challengeData.budget_display} 남았어요
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
        {loading ? (
          <div>게시글을 불러오는 중...</div>
        ) : error ? (
          <div className={styles.error}>{error}</div>
        ) : posts.length === 0 ? (
          <div className={styles.noComments}>아직 게시글이 없습니다.</div>
        ) : (
          <div className={styles.commentsList}>
            {posts.map((post) => (
              <div 
                key={post.post_id}
                className={styles.commentItem}
                onClick={() => handlePostClick(post.post_id)}
                style={{ cursor: 'pointer' }}
              >
                <div className={styles.commentHeader}>
                  <div className={styles.commentInfo}>
                    <h3 className={styles.title}>{post.post_title}</h3>
                    <p className={styles.commentText}>{post.post_content}</p>
                    <p className={styles.authorName}>
                      {formatDate(post.post_created_at)}
                    </p>
                  </div>
                </div>
                <div className={styles.commentActions} onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLike(post.post_id);
                    }}
                    className={`${styles.actionButton} ${likedPosts.includes(post.post_id) ? styles.liked : ""}`}
                  >
                    <Heart size={16} />
                    <span>좋아요 {post.like_count}</span>
                  </button>
                  <button 
                    className={styles.actionButton}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MessageSquare size={16} />
                    <span>댓글 {post.comment_count}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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