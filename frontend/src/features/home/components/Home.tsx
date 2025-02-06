import type React from "react"
import { useState, useMemo } from "react"
import { Routes, Route, useLocation } from "react-router-dom"
import styles from "./Home.module.scss"
import SearchBar from "./search-bar/SearchBar"
import CategoryTabs from "./category-tabs/CategoryTabs"
import ChallengeList from "./challenge-list/ChallengeList"
import OngoingChallengeList from "./ongoing-challenge-list/OngoingChallengeList"
import ChallengeDetail from "./ChallengeDetail"

import type { Challenge, OngoingChallenge } from "../types"

// Dummy data for ongoing challenges
const ongoingChallenges: OngoingChallenge[] = [
  {
    id: 1,
    title: "커피 끊기 챌린지",
    subtitle: "하루 한 잔만 마시자",
    category: "카페/디저트",
    amount: "2만원",
    period: "14일",
    progress: 80,
    successRate: 75,
    supports: 100,
    wants: 65,
  },
  {
    id: 2,
    title: "장을 적당히 보자",
    subtitle: "이번달은 적게 써봅시다",
    category: "장보기",
    amount: "10만원",
    period: "30일",
    progress: 50,
    successRate: 80,
    supports: 40,
    wants: 19,
  },
  {
    id: 3,
    title: "담배에 돈 쓰지 맙시다",
    subtitle: "올해는 금연해봅시다 우리",
    category: "술/담배",
    amount: "20,000원",
    period: "1월 1일 - 1월 29일",
    progress: 60,
    successRate: 70,
    supports: 85,
    wants: 30,
  },
]

const HomePage: React.FC = () => {
  const location = useLocation()
  const categories = [
    "전체",
    "외식",
    "장보기",
    "카페/디저트",
    "교통",
    "문화생활",
    "쇼핑",
    "취미/여가",
    "술/담배",
    "기타",
  ]

  const [activeCategory, setActiveCategory] = useState("전체")
  const [activeTab, setActiveTab] = useState<"recruiting" | "ongoing">("ongoing")

  const challenges: Challenge[] = [
    {
      id: 1,
      title: "외식을 줄입시다!!",
      period: "1주일",
      amount: "10만원",
      category: "외식",
      currentMembers: 3,
      maxMembers: 5,
      likes: 10,
      wants: 5,
    },
    {
      id: 2,
      title: "올해는 금연한다 내가",
      period: "1주일",
      amount: "2만원",
      category: "술/담배",
      currentMembers: 4,
      maxMembers: 6,
      likes: 76,
      wants: 12,
    },
  ]

  const filteredChallenges = useMemo(() => {
    if (activeCategory === "전체") return challenges
    return challenges.filter((challenge) => challenge.category === activeCategory)
  }, [activeCategory])

  const filteredOngoingChallenges = useMemo(() => {
    if (activeCategory === "전체") return ongoingChallenges
    return ongoingChallenges.filter((challenge) => challenge.category === activeCategory)
  }, [activeCategory])

  const renderMainContent = () => {
    if (location.pathname !== "/") {
      return null
    }

    return (
      <>
        <SearchBar />
        <CategoryTabs categories={categories} activeCategory={activeCategory} onCategoryChange={setActiveCategory} />
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
          <ChallengeList challenges={filteredChallenges} />
        ) : (
          <OngoingChallengeList challenges={filteredOngoingChallenges} />
        )}
      </>
    )
  }

  return (
    <div className={styles.homePage}>
      <Routes>
        <Route path="/" element={renderMainContent()} />
        <Route path="/challenge/:id" element={<ChallengeDetail challenges={ongoingChallenges} />} />
      </Routes>
    </div>
  )
}

export default HomePage

