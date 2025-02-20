import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Ranking.css';

interface RankingItem {
  id: number;
  rank: number;
  title: string;
  period: string;
  amount: string;
  category: string;
  supportCount: number;
  wantCount: number;
}

const Ranking = () => {
  const [activeTab, setActiveTab] = useState<'support' | 'want'>('support');
  const navigate = useNavigate();

  // 응원해요 랭킹 데이터
  const supportRankingData: RankingItem[] = [
    {
      id: 1,
      rank: 1,
      title: "한 달 동안 카페 음료 줄이기",
      period: "30일",
      amount: "150,000원",
      category: "카페",
      supportCount: 128,
      wantCount: 85
    },
    {
      id: 2,
      rank: 2,
      title: "배달음식 절약 챌린지",
      period: "14일",
      amount: "200,000원",
      category: "외식",
      supportCount: 96,
      wantCount: 67
    },
    {
      id: 3,
      rank: 3,
      title: "대중교통으로 출퇴근하기",
      period: "30일",
      amount: "300,000원",
      category: "교통",
      supportCount: 82,
      wantCount: 54
    },
    {
      id: 4,
      rank: 4,
      title: "옷 구매 멈추기",
      period: "21일",
      amount: "500,000원",
      category: "쇼핑",
      supportCount: 75,
      wantCount: 48
    },
    {
      id: 5,
      rank: 5,
      title: "편의점 음료수 대신 물 마시기",
      period: "14일",
      amount: "50,000원",
      category: "기타",
      supportCount: 63,
      wantCount: 41
    }
  ];

  // 하고싶어요 랭킹 데이터
  const wantRankingData: RankingItem[] = [
    {
      id: 6,
      rank: 1,
      title: "주말 카페 대신 홈카페",
      period: "30일",
      amount: "200,000원",
      category: "카페",
      supportCount: 75,
      wantCount: 156
    },
    {
      id: 7,
      rank: 2,
      title: "점심 도시락 챌린지",
      period: "30일",
      amount: "300,000원",
      category: "외식",
      supportCount: 89,
      wantCount: 134
    },
    {
      id: 8,
      rank: 3,
      title: "택시비 줄이기",
      period: "14일",
      amount: "150,000원",
      category: "교통",
      supportCount: 45,
      wantCount: 112
    },
    {
      id: 9,
      rank: 4,
      title: "불필요한 쇼핑 줄이기",
      period: "30일",
      amount: "1,000,000원",
      category: "쇼핑",
      supportCount: 92,
      wantCount: 98
    },
    {
      id: 10,
      rank: 5,
      title: "영화관 대신 넷플릭스",
      period: "30일",
      amount: "100,000원",
      category: "문화",
      supportCount: 67,
      wantCount: 87
    }
  ];

  return (
    <div className="ranking-container">
      <div className="ranking-tabs">
        <button 
          className={`tab ${activeTab === 'support' ? 'active' : ''}`}
          onClick={() => setActiveTab('support')}
        >
          응원해요 랭킹
        </button>
        <button 
          className={`tab ${activeTab === 'want' ? 'active' : ''}`}
          onClick={() => setActiveTab('want')}
        >
          하고싶어요 랭킹
        </button>
      </div>
      <div className="ranking-list">
        {(activeTab === 'support' ? supportRankingData : wantRankingData).map((item) => (
          <div key={item.id} className="ranking-item">
            <div className="rank-number">
              {item.rank}위
            </div>
            <div className="challenge-info">
              <h3>{item.title}</h3>
              <div className="challenge-details">
                <p>기간: {item.period}</p>
                <p>금액: {item.amount}</p>
                <p>카테고리: {item.category}</p>
                <p>모집인원: 3/5</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Ranking;
