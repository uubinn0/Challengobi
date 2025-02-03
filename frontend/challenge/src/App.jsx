// src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header/Header';
import Footer from './components/layout/Footer/Footer';
import HomePage from './pages/HomePage/HomePage';
import LoginPage from './pages/LoginPage/LoginPage';
import ChallengePage from './pages/ChallengePage/ChallengePage';
import ProfilePage from './pages/ProfilePage/ProfilePage';
import ErrorPage from './pages/ErrorPage/ErrorPage';
import FollowPage from './pages/FollowPage/FollowPage';

function App() {
  return (
    <>
    <Header />  {/* ✅ 헤더가 항상 최상단에 위치하도록 유지 */}
    <div className="content">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/challenge" element={<ChallengePage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/follow" element={<FollowPage/>}/>
        <Route path="*" element={<ErrorPage />} />
      </Routes>
    </div>
      <Footer />
      </>
  );
}

export default App;
