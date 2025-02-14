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

  const rankingData: RankingItem[] = [
    {
      id: 1,
      rank: 1,
      title: "외식을 줄입시다!!",
      period: "1주일",
      amount: "100만원",
      category: "외식",
      supportCount: 35,
      wantCount: 20
    },
    {
      id: 2,
      rank: 2,
      title: "외식을 줄입시다!!",
      period: "1주일",
      amount: "10만원",
      category: "외식",
      supportCount: 30,
      wantCount: 15
    },
    {
      id: 3,
      rank: 3,
      title: "외식을 줄입시다!!",
      period: "1주일",
      amount: "10만원",
      category: "외식",
      supportCount: 25,
      wantCount: 10
    },
    {
      id: 4,
      rank: 4,
      title: "외식을 줄입시다!!",
      period: "1주일",
      amount: "10만원",
      category: "외식",
      supportCount: 20,
      wantCount: 5
    },
  ];

  const handleChallengeClick = (challengeId: number) => {
    navigate(`/ongoing-challenge/${challengeId}`);
  };

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
        {rankingData.map((item) => (
          <div key={item.id} className="ranking-item">
            <div className="rank-number">
              {item.rank}위
            </div>
            <div 
              className="challenge-info"
              onClick={() => handleChallengeClick(item.id)}
              style={{ cursor: 'pointer' }}
            >
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
