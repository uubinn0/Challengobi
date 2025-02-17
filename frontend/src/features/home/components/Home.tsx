import type React from "react"
import { useState, useMemo, useEffect } from "react"
import { Routes, Route, useLocation, useNavigate } from "react-router-dom"
import styles from "./Home.module.scss"
import SearchBar from "./search-bar/SearchBar"
import CategoryTabs from "./category-tabs/CategoryTabs"
import ChallengeList from "./challenge-list/ChallengeList"
import OngoingChallengeList from "./ongoing-challenge-list/OngoingChallengeList"
import ChallengeDetail from "./ChallengeDetail"
import HomeAPI from "../api"
import axios from "axios"

import type { Challenge } from "../types"

const HomePage: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const categories = [
    { value: "전체", label: "전체" },
    { value: "카페/디저트", label: "카페/디저트" },
    { value: "외식", label: "외식" },
    { value: "장보기", label: "장보기" },
    { value: "쇼핑", label: "쇼핑" },
    { value: "문화생활", label: "문화생활" },
    { value: "취미/여가", label: "취미/여가" },
    { value: "술/담배", label: "술/담배" },
    { value: "교통", label: "교통" },
    { value: "기타", label: "기타" }
  ]

  const [recruitingChallenges, setRecruitingChallenges] = useState<Challenge[]>([])
  const [inProgressChallenges, setInProgressChallenges] = useState<Challenge[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"recruiting" | "ongoing">("recruiting")
  const [activeCategory, setActiveCategory] = useState("전체")

  // 카테고리 매핑 정의
  const categoryMapping: { [key: number]: string } = {
    1: "카페/디저트",
    2: "외식",
    3: "장보기",
    4: "쇼핑",
    5: "문화생활",
    6: "취미/여가",
    7: "술/담배",
    8: "교통",
    9: "기타"
  };

  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem('access_token')
        
        if (!token) {
          navigate('/login')
          return
        }
        
        const [recruitingResponse, inProgressResponse] = await Promise.all([
          HomeAPI.getRecruitingChallenges(),
          HomeAPI.getInProgressChallenges()
        ])
        
        console.log('Recruiting Challenges:', recruitingResponse)
        console.log('In Progress Challenges:', inProgressResponse)

        setRecruitingChallenges(recruitingResponse as unknown as Challenge[])
        setInProgressChallenges(inProgressResponse as unknown as Challenge[])
      } catch (err) {
        console.error('Error:', err)
        setError('챌린지 목록을 불러오는데 실패했습니다.')
      } finally {
        setLoading(false)
      }
    }

    fetchChallenges()
  }, [navigate])

  // 필터링된 챌린지 목록 (모집 중)
  const filteredRecruitingChallenges = useMemo(() => {
    console.log('Filtering recruiting challenges:', {
      activeCategory,
      challenges: recruitingChallenges,
    });

    if (activeCategory === "전체") {
      return recruitingChallenges;
    }

    return recruitingChallenges.filter((challenge) => {
      const categoryName = categoryMapping[challenge.challenge_category];
      console.log('Comparing:', {
        challengeCategory: challenge.challenge_category,
        categoryName,
        activeCategory,
        matches: categoryName === activeCategory
      });
      return categoryName === activeCategory;
    });
  }, [activeCategory, recruitingChallenges, categoryMapping]);

  // 필터링된 챌린지 목록 (진행 중)
  const filteredInProgressChallenges = useMemo(() => {
    console.log('Filtering in-progress challenges:', {
      activeCategory,
      challenges: inProgressChallenges,
    });

    if (activeCategory === "전체") {
      return inProgressChallenges;
    }

    return inProgressChallenges.filter((challenge) => {
      const categoryName = categoryMapping[challenge.challenge_category];
      return categoryName === activeCategory;
    });
  }, [activeCategory, inProgressChallenges, categoryMapping]);

  const handleCategoryChange = (category: string) => {
    console.log('Category changed to:', category);
    setActiveCategory(category);
  };

  const renderMainContent = () => {
    if (!location.pathname.endsWith('/')) {
      return null;
    }

    return (
      <>
        <SearchBar />
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

        {activeTab === "recruiting" ? (
          <ChallengeList 
            challenges={filteredRecruitingChallenges} 
          />
        ) : (
          <OngoingChallengeList 
            challenges={filteredInProgressChallenges} 
          />
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

