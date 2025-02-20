import type { FC } from "react"
import { useState, useEffect } from "react"
import { useNavigate, useLocation, useParams } from "react-router-dom"
import { Pencil, Heart, MessageSquare } from "lucide-react"
import styles from "./Progress.module.scss"
import ocrbuttonfish from '../../../../assets/ocr-button-fish.png'
import profileJaringobi from '../../../../assets/profile-jaringobi.png'
import type { Challenge } from "../../../../features/home/types"
import  ChallengeAPI  from "../../api"
import axios from "axios"
import { DEFAULT_PROFILE_IMAGE } from '../../../../constants'

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
  const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const challengeData = location.state?.challengeData as Challenge;

  const isFromHome = !location.pathname.startsWith("/ongoing-challenge");

  console.log("Current pathname:", location.pathname);
  console.log("isFromHome:", isFromHome);

  const userNickname = localStorage.getItem('nickname'); // nickname 가져오기

  useEffect(() => {
    if (!challengeData && isFromHome) {
      navigate('/'); // 데이터가 없으면 홈으로 리다이렉트
      return;
    }
  }, [challengeData, navigate, isFromHome]);

  useEffect(() => {
    // location.state로 전달된 데이터가 없을 경우 API로 챌린지 정보 가져오기
    const fetchChallengeData = async () => {
      if (!challengeData && id) {
        try {
          const token = localStorage.getItem('access_token');
          if (!token) {
            alert('로그인이 필요합니다.');
            navigate('/login');
            return;
          }

          const response = await axios.get(`http://localhost:8000/api/challenges/${id}/`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          // API 응답 데이터를 state에 저장
          const challenge = response.data;
          setCurrentChallenge(challenge);
        } catch (error) {
          console.error('챌린지 정보 조회 실패:', error);
          navigate('/challenge');
        }
      }
    };

    fetchChallengeData();
  }, [id, challengeData, navigate]);

  // JWT 토큰에서 user_id를 추출하는 함수
  const getUserIdFromToken = (token: string): number | null => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));

      const payload = JSON.parse(jsonPayload);
      return payload.user_id;
    } catch (error) {
      console.error('Failed to decode token:', error);
      return null;
    }
  };

  // 챌린지 잔액 정보를 가져오는 함수
  const fetchChallengeBalance = async (challengeId: string) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        console.error('No token found');
        return;
      }

      // 토큰에서 user_id 추출
      const userId = getUserIdFromToken(token);
      
      // 디버깅을 위한 로그
      console.log('Token:', token);
      console.log('Extracted User ID:', userId);

      if (!userId) {
        console.error('Could not extract user ID from token');
        return;
      }

      const response = await axios.get(
        `http://localhost:8000/api/challenges/${challengeId}/participants/`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      // 디버깅을 위한 로그
      console.log('Participants response:', response.data);

      if (response.data && response.data.length > 0) {
        // 백엔드 응답 구조에 맞게 수정
        const myParticipation = response.data.find(
          (participant: { user_id: number; balance: number }) => 
            participant.user_id === userId
        );
        
        console.log('My user ID:', userId);
        console.log('Found my participation:', myParticipation);
        
        if (myParticipation && typeof myParticipation.balance === 'number') {
          setBalance(myParticipation.balance);
          console.log('Setting balance to:', myParticipation.balance);
        } else {
          console.log('현재 사용자의 참가 정보를 찾을 수 없습니다.');
          console.log('Available participants:', response.data);
        }
      }
    } catch (error) {
      console.error('잔액 조회 실패:', error);
      if (axios.isAxiosError(error)) {
        console.error('Error details:', {
          status: error.response?.status,
          data: error.response?.data,
          headers: error.response?.headers
        });
      }
    }
  };

  // 컴포넌트가 마운트될 때와 challengeId가 변경될 때마다 잔액 조회
  useEffect(() => {
    if (id) {
      fetchChallengeBalance(id);
    }
  }, [id]);

  // 잔액이 변경될 때마다 실행되는 useEffect
  useEffect(() => {
    console.log('Current balance:', balance);
  }, [balance]);

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
        console.log("API Response Data:", postsData);  // API 응답 데이터 확인
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

  const handlePostClick = (post: any) => {
    console.log("Original post data:", post);
    
    navigate(`${location.pathname}/post/${post.post_id}`, {
      state: { 
        postData: {
          post_id: post.post_id,
          post_title: post.post_title,
          post_content: post.post_content,
          post_created_at: post.post_created_at,  // created_at을 post_created_at으로 매핑
          user_profile_image: post.user_profile_image,
          user_nickname: post.user_nickname,
          like_count: post.like_count,
          comment_count: post.comment_count
        }
      }
    });
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
    if (id) {
      navigate(`/challenge/ocr/${id}`);
    }
  };

  useEffect(() => {
    document.body.style.overflowY = "auto"
    return () => {
      document.body.style.overflowY = ""
    }
  }, [])

  // 챌린지 데이터가 없을 때 로딩 표시
  if (!challengeData && !currentChallenge) {
    return <div>Loading...</div>;
  }

  // 실제 사용할 챌린지 데이터 (location.state나 API 응답 중 하나)
  const challenge = challengeData || currentChallenge;

  return (
    <div className={styles.container}>
      <div className={styles.challengeCard}>
        <h1 className={styles.title}>{challenge.challenge_title}</h1>
        <p className={styles.subtitle}>{challenge.challenge_info}</p>
        <div className={styles.info}>
          <div className={styles.infoItem}>
            <span>카테고리 :</span>
            <span>{challenge.category_name}</span>
          </div>
          <div className={styles.infoItem}>
            <span>챌린지 기간 :</span>
            <span>{challenge.start_date} ~ {challenge.end_date}</span>
          </div>
          <div className={styles.infoItem}>
            <span>챌린지 금액 :</span>
            <span>{challenge.budget_display}</span>
          </div>
          <div className={styles.infoItem}>
            <span>챌린지 인원 :</span>
            <span>{challenge.participants_display}</span>
          </div>
          <div className={styles.infoItem}>
            <span>남은 금액 :</span>
            <span>{challenge.budget_display}</span> {/* 실제 남은 금액은 API에서 가져와야 함 */}
          </div>
        </div>
      </div>

      {isFromHome && (
        <div className={styles.progressCard}>
          <div className={styles.progressTextContainer}>
            <div className={styles.fishIconContainer}>
              <img 
                src={DEFAULT_PROFILE_IMAGE}
                alt="프로필 이미지" 
                className={styles.ocrFishIcon}
              />
            </div>
            <p className={styles.progressText}>
              {userNickname}님 챌린지 성공까지
              <br />
              {challenge.period}일 남았어요.
            </p>
          </div>
          <p className={styles.amountText}>
            현재까지
            <br />
            {/* 잔액이 있을 때만 표시, 없으면 로딩 표시 */}
            {balance !== null ? (
              <span className={balance < 0 ? styles.negative : ''}>
                {balance.toLocaleString()}원
              </span>
            ) : (
              '잔액 조회 중...'
            )} 남았어요
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
      )}

      <div className={styles.commentsSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>게시글</h2>
          {isFromHome && (  // 글쓰기 버튼도 같은 조건 적용
            <button 
              className={styles.writeButton} 
              onClick={handleWriteClick}
            >
              <Pencil size={20} />
              글쓰기
            </button>
          )}
        </div>

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
                onClick={() => handlePostClick(post)}
                style={{ cursor: 'pointer' }}
              >
                <div className={styles.commentHeader}>
                  <img 
                    src={DEFAULT_PROFILE_IMAGE}
                    alt="프로필 이미지" 
                    className={styles.avatar}
                  />
                  <div className={styles.commentInfo}>
                    <h3 className={styles.title}>{post.post_title}</h3>
                    <p className={styles.authorName}>
                      {formatDate(post.post_created_at)}
                    </p>
                  </div>
                </div>
                <div className={styles.commentActions}>
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
    </div>
  )
}

export default Progress