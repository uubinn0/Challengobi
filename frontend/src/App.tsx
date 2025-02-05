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
import LoginForm from './features/auth/components/LoginForm';
import SignUpForm from './features/auth/components/SignUpForm';
import SuccessForm from './features/auth/components/SuccessForm';
import PasswordForm from './features/auth/components/PasswordForm';
import Ocr from './features/challenge/components/ocr/Ocr';
import Progress from './features/challenge/components/challenge-card/Progress';
import Challenge from './features/challenge/components/challenge-card/Challenge';
import ConsumImage from './features/challenge/components/ocr/ConsumImage';
import OcrComplete from './features/challenge/components/ocr/OcrComplete';

const App: React.FC = () => {
  return (
    <>
      <Header />
      <div className="content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />}>
          {/* url 경로 : login/signup 이런식으로 바꾸려고 하위컴포넌트 경로 추가했습니다 
                          다른것도 이런식으로 하위컴포넌트 방식으로 진행하는게 좋을것같습니다.
          */}
            <Route index element={<LoginForm />} />
            <Route path="signup" element={<SignUpForm />} />
            <Route path="success" element={<SuccessForm />} />
            <Route path="password" element={<PasswordForm />} />
          </Route>
          <Route path="/challenge" element={<ChallengePage />}>
            <Route index element={<Challenge />} />
            <Route path="progress" element={<Progress />}/>
            <Route path="ocr" element={<Ocr />} />
            <Route path="consum-image" element={<ConsumImage />} />
            <Route path="ocr-complete" element={<OcrComplete />} />
          
          </Route>
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