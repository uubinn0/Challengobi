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
import ChallengeDetail from './features/home/components/ChallengeDetail';
import Home from './features/home/components/Home';
import Post from './features/challenge/components/post/Post'
import WritePost from './features/challenge/components/write-post/WritePost';
import InvitedFriendList from './features/challenge/components/friend-list/InvitedFriendList';
import InvitableFriendList from './features/challenge/components/friend-list/InvitableFriendList';
import { FriendInviteProvider } from './features/challenge/context/FriendInviteContext';
import Profile from './features/profile/components/Profile';
import ProfileEdit from './features/profile/components/ProfileEdit';
import ChallengeComplete from './features/profile/components/ChallengeComplete';

const App: React.FC = () => {
  return (
    <FriendInviteProvider>
      <Header />
      <div className="content">
        <Routes>
          <Route path="/" element={<HomePage />} >
            <Route index element={<Home />} />
            <Route path="challenge-detail/:id" element={<ChallengeDetail challenges={[]} />} />
             {/* 라우트 추가 홈화면에서 진행 챌린지 */}
            <Route path="ongoing-challenge/:id" element={<Progress />} />
            <Route path="ongoing-challenge/:id/post/:postId" element={<Post />} />
          </Route>




          <Route path="/login" element={<LoginPage />}>
            <Route index element={<LoginForm />} />
            <Route path="signup" element={<SignUpForm />} />
            <Route path="success" element={<SuccessForm />} />
            <Route path="password" element={<PasswordForm />} />
          </Route>



          <Route path="/challenge" element={<ChallengePage />}>
            <Route index element={<Challenge />} />
            <Route path="progress/:id" element={<Progress />}/>
            <Route path="progress/:id/write" element={<WritePost />} />
            <Route path="progress/:id/post/:postId" element={<Post />} />
            <Route path="ocr" element={<Ocr />} />
            <Route path="consum-image" element={<ConsumImage />} />
            <Route path="ocr-complete" element={<OcrComplete />} />
            <Route path="invite-friends" element={<InvitableFriendList />} />
            <Route path="invited-friends" element={<InvitedFriendList />} />
          </Route>



          <Route path="/profile" element={<ProfilePage />}>
            <Route index element={<Profile />} />
            <Route path="edit" element={<ProfileEdit />} />
          </Route>

          <Route path="/profile/challenge-complete" element={<ChallengeComplete />} />

          <Route path="/follow" element={<FollowPage />} >
          
          </Route>


 
          <Route path="*" element={<ErrorPage />} />
        </Routes>
      </div>
      <Footer />
    </FriendInviteProvider>
  );
}

export default App;