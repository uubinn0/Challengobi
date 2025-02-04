// src/App.tsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/layout/header/Header';
import Footer from './components/layout/footer/Footer';
import HomePage from './pages/home-page/HomePage';
import LoginPage from './pages/login-page/LoginPage';
import ChallengePage from './pages/challenge-page/ChallengePage';
import ProfilePage from './pages/profile-page/ProfilePage';  
import ErrorPage from './pages/error-page/ErrorPage';
import FollowPage from './pages/follow-page/FollowPage';

const App: React.FC = () => {
  return (
    <>
      <Header />
      <div className="content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/challenge" element={<ChallengePage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/follow" element={<FollowPage />} />
          <Route path="*" element={<ErrorPage />} />
        </Routes>
      </div>
      <Footer />
    </>
  );
}

export default App;