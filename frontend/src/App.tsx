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
import SearchUser from './features/search/components/SearchUser';
import Ranking from './features/challenge/components/ranking/Ranking';
import ChallengeComplete from './features/profile/components/ChallengeComplete';
import styles from './App.module.scss';
import Following from './features/profile/components/Following';
import Follower from './features/profile/components/Follower';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './features/auth/context/AuthContext';
import ChallengeFail from './features/challenge/components/Fail/ChallengeFail';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <FriendInviteProvider>
          <div className={styles.appContainer}>
            <Header />
            <main className={styles.mainContent}>
              <Routes>
                <Route path="/*" element={<HomePage />}>
                  <Route index element={<Home />} />
                  <Route path="challenge-detail/:id" element={<ChallengeDetail challenges={[]} />} />
                  <Route path="ongoing-challenge/:id" element={<Progress />} />
                  <Route path="ongoing-challenge/:id/post/:postId" element={<Post />} />
                </Route>

                <Route path="/login/*" element={<LoginPage />}>
                  <Route index element={<LoginForm />} />
                  <Route path="signup" element={<SignUpForm />} />
                  <Route path="success" element={<SuccessForm />} />
                  <Route path="password" element={<PasswordForm />} />
                </Route>

                <Route path="/challenge/*" element={<ChallengePage />}>
                  <Route index element={<Challenge />} />
                  <Route path="progress/:id" element={<Progress />} />
                  <Route path="progress/:id/write" element={<WritePost />} />
                  <Route path="progress/:id/post/:postId" element={<Post />} />
                  <Route path="ocr/:id" element={<Ocr />} />
                  <Route path="consum-image" element={<ConsumImage />} />
                  <Route path="ocr-complete" element={<OcrComplete />} />
                  <Route path="invite-friends" element={<InvitableFriendList />} />
                  <Route path="invited-friends" element={<InvitedFriendList />} />
                  <Route path="ranking" element={<Ranking />} />
                  <Route path="fail" element={<ChallengeFail />} />
                </Route>

                <Route path="/profile/*" element={<ProfilePage />}>
                  <Route index element={<Profile />} />
                  <Route path=":userId" element={<Profile />} />
                  <Route path=":userId/following" element={<Following />} />
                  <Route path=":userId/follower" element={<Follower />} />
                  <Route path="edit" element={<ProfileEdit />} />
                  <Route path="challenge-complete" element={<ChallengeComplete />} />
                </Route>

                <Route path="/profile" element={<Profile />} />
                <Route path="/profile/:userId" element={<Profile />} />

                <Route path="/follow/*" element={<FollowPage />}>
                  <Route index element={<SearchUser />} />
                </Route>

                <Route path="/fail" element={<ChallengeFail />} />

                <Route path="*" element={<ErrorPage />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </FriendInviteProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;