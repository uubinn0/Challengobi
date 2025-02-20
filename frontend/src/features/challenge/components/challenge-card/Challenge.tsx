import { useState, useEffect } from "react"
import { Pencil, Lock } from "lucide-react"
import styles from "./Challenge.module.scss"
import AddModal from "../../../../components/modals/AddModal"
import ChallengeDetailModal from "../../../../components/modals/ChallengeDetailModal"
import { useNavigate } from "react-router-dom"
import axios from 'axios';

interface Challenge {
  challenge_id: number;
  challenge_title: string;
  challenge_info: string;
  creator_nickname: string;
  period: number;
  period_display: string;
  start_date: string;
  end_date: string;
  budget: number;
  budget_display: string;
  challenge_category: number;
  category_name: string;
  max_participants: number;
  current_participants: number;
  participants_display: string;
  encourage_cnt: number;
  want_cnt: number;
  participants_nicknames: string[];
}

interface MyChallenges {
  recruiting: Challenge[];
  in_progress: Challenge[];
  completed: Challenge[];
}

export default function ChallengePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [myChallenges, setMyChallenges] = useState<MyChallenges>({
    recruiting: [],
    in_progress: [],
    completed: []
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMyChallenges = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          alert('로그인이 필요합니다.');
          navigate('/login');
          return;
        }

        const response = await axios.get('http://localhost:8000/api/challenges/my-challenges/', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        setMyChallenges(response.data);
        console.log('My Challenges:', response.data);
      } catch (error) {
        console.error('챌린지 조회 중 오류 발생:', error);
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          alert('인증이 만료되었습니다. 다시 로그인해주세요.');
          navigate('/login');
        } else {
          alert('챌린지 조회 중 오류가 발생했습니다.');
        }
      }
    };

    fetchMyChallenges();
  }, [navigate]);

  const handleChallengeClick = (challenge: Challenge, isOngoing: boolean) => {
    if (isOngoing) {
      navigate(`/challenge/progress/${challenge.challenge_id}`, {
        state: { challengeData: challenge }
      });
    } else {
      setSelectedChallenge(challenge);
    }
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
    navigate('?modal=add');
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    navigate(-1);
  };

  return (
    <div className={styles.container}>
      <button className={styles.createButton} onClick={handleOpenModal}>
        <Pencil size={20} />
        챌린지 만들기
      </button>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>진행 중인 챌린지</h2>
        <div className={styles.challengeScrollContainer}>
          <div className={styles.challengeScroll}>
            {myChallenges.in_progress.map((challenge) => (
              <div 
                key={challenge.challenge_id} 
                className={styles.challengeCard}
                onClick={() => handleChallengeClick(challenge, true)}
                style={{ cursor: 'pointer' }}
              >
                <div className={styles.cardHeader}>
                  <h3 className={styles.cardTitle}>{challenge.challenge_title}</h3>
                </div>
                <div className={styles.cardContent}>
                  <p>카테고리: {challenge.category_name}</p>
                  <p>챌린지 기간: {challenge.period_display}</p>
                  <p>챌린지 금액: {challenge.budget_display}</p>
                  <p>챌린지 인원: {challenge.participants_display}</p>
                  <p>시작일: {challenge.start_date}</p>
                  <p>생성자: {challenge.creator_nickname}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>모집 중인 챌린지</h2>
        <div className={styles.challengeScrollContainer}>
          <div className={styles.challengeScroll}>
            {myChallenges.recruiting.map((challenge) => (
              <div 
                key={challenge.challenge_id} 
                className={styles.challengeCard}
                onClick={() => handleChallengeClick(challenge, false)}
                style={{ cursor: 'pointer' }}
              >
                <div className={styles.cardHeader}>
                  <h3 className={styles.cardTitle}>{challenge.challenge_title}</h3>
                </div>
                <div className={styles.cardContent}>
                  <p>카테고리: {challenge.category_name}</p>
                  <p>챌린지 기간: {challenge.period_display}</p>
                  <p>챌린지 금액: {challenge.budget_display}</p>
                  <p>챌린지 인원: {challenge.participants_display}</p>
                  <p>시작일: {challenge.start_date}</p>
                  <p>생성자: {challenge.creator_nickname}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {selectedChallenge && (
        <ChallengeDetailModal
          isOpen={!!selectedChallenge}
          onClose={() => setSelectedChallenge(null)}
          challenge={selectedChallenge}
        />
      )}
      <AddModal isOpen={isModalOpen} onClose={handleCloseModal} />
      
      <button 
        className={styles.rankingButton} 
        onClick={() => navigate('/challenge/ranking')}
      >
        순위 보기
      </button>
    </div>
  );
}
