import type React from "react"
import { useState,  useEffect } from "react"
import { Routes, Route, useLocation, useNavigate } from "react-router-dom"
import styles from "./Home.module.scss"
import SearchBar from "./search-bar/SearchBar"
import CategoryTabs from "./category-tabs/CategoryTabs"
import ChallengeList from "./challenge-list/ChallengeList"
import OngoingChallengeList from "./ongoing-challenge-list/OngoingChallengeList"
import ChallengeDetail from "./ChallengeDetail"
import HomeAPI from "../api"
import { accountApi } from '../../profile/api'

import type { Challenge } from "../types"

const HomePage: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()

  const [recruitingChallenges, setRecruitingChallenges] = useState<Challenge[]>([])
  const [inProgressChallenges, setInProgressChallenges] = useState<Challenge[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"recruiting" | "ongoing">("recruiting")
  const [activeCategory, setActiveCategory] = useState("전체")
  const [searchTerm, setSearchTerm] = useState("");

  // 카테고리 매핑 정의
  

  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('access_token');
        
        if (!token) {
          navigate('/login');
          return;
        }
        
        // 사용자 프로필 정보 가져오기 및 응답 구조 확인
        const userProfile = await accountApi.getMyProfile();
        console.log('프로필 API 응답:', userProfile);  // 전체 응답 구조 확인
        
        // data 객체 내부의 nickname 접근
        const userNickname = userProfile.data.nickname;
        console.log('추출된 닉네임:', userNickname);
        
        // 챌린지 목록 가져오기
        const [recruitingResponse, inProgressResponse] = await Promise.all([
          HomeAPI.getRecruitingChallenges(),
          HomeAPI.getInProgressChallenges()
        ]);
        
        // 모집 중인 챌린지 필터링 - 사용자가 참여하지 않은 챌린지만 남김
        const filteredRecruitingChallenges = recruitingResponse.filter(challenge => {
          const participants = challenge.participants_nicknames || [];
          return !participants.includes(userNickname);
        });
        
        // 진행 중인 챌린지 필터링 - 사용자가 참여하지 않은 챌린지만 남김
        const filteredInProgressChallenges = inProgressResponse.filter(challenge => {
          const participants = challenge.participants_nicknames || [];
          return !participants.includes(userNickname);
        });

        // 디버깅용 로그
        console.log('현재 사용자:', userNickname);
        console.log('필터링 전 모집 중 챌린지:', recruitingResponse);
        console.log('필터링 후 모집 중 챌린지:', filteredRecruitingChallenges);
        console.log('참여자 목록 예시:', recruitingResponse[0]?.participants_nicknames);
        
        setRecruitingChallenges(filteredRecruitingChallenges as unknown as Challenge[]);
        setInProgressChallenges(filteredInProgressChallenges as unknown as Challenge[]);
      } catch (err) {
        console.error('Error:', err);
        setError('챌린지 목록을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchChallenges();
  }, [navigate]);

  // 필터링된 챌린지 목록 (모집 중)
  const filteredRecruitingChallenges = recruitingChallenges.filter(challenge => {
    const matchesSearch = searchTerm === "" || 
      challenge.challenge_title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === "전체" || 
      challenge.category_name === activeCategory;
    
    return matchesSearch && matchesCategory;
  });

  // 필터링된 챌린지 목록 (진행 중)
  const filteredInProgressChallenges = inProgressChallenges.filter(challenge => {
    const matchesSearch = searchTerm === "" || 
      challenge.challenge_title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === "전체" || 
      challenge.category_name === activeCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleCategoryChange = (category: string) => {
    console.log('Category changed to:', category);
    setActiveCategory(category);
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const renderMainContent = () => {
    if (!location.pathname.endsWith('/')) {
      return null;
    }

    return (
      <>
        <div className={styles.searchWrapper}>
          <SearchBar onSearch={handleSearch} />
        </div>
        <CategoryTabs 
          categories={[
            "전체",
            "카페/디저트",
            "외식",
            "장보기",
            "쇼핑",
            "문화생활",
            "취미/여가",
            "술/담배",
            "교통",
            "기타"
          ]}
          activeCategory={activeCategory}
          onCategoryChange={handleCategoryChange}
        />
        <div className={styles.challengeTabs}>
          <button
            className={`${styles.tab} ${activeTab === "recruiting" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("recruiting")}
          >
            현재 모집중인 챌린지
          </button>
          <button
            className={`${styles.tab} ${activeTab === "ongoing" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("ongoing")}
          >
            진행 중인 챌린지
          </button>
        </div>

        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div>{error}</div>
        ) : activeTab === "recruiting" ? (
          <ChallengeList challenges={filteredRecruitingChallenges} />
        ) : (
          <OngoingChallengeList challenges={filteredInProgressChallenges} />
        )}
      </>
    );
  };

  if (loading) {
    return <div>로딩 중...</div>
  }

  if (error) {
    return <div>{error}</div>
  }

  return (
    <div className={styles.homePage}>
      <Routes>
        <Route path="/" element={renderMainContent()} />
        <Route path="/challenge/:id" element={<ChallengeDetail challenges={recruitingChallenges} />} />
      </Routes>
    </div>
  )
}

export default HomePage

