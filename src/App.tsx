import { Route, Routes } from 'react-router-dom';

import './App.css';
import { MainLayout } from './layout/MainLayout.tsx';
import { AuthLayout } from './pages/auth/AuthLayout.tsx';
import { SignIn } from './pages/auth/SignIn.tsx';
import { SignUp } from './pages/auth/SignUp.tsx';
import Home from './pages/public/Home.tsx';
import NewsDetail from './pages/user/News/NewsDetail.tsx';
import NewsList from './pages/user/News/NewsList.tsx';

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/news" element={<NewsList />} />
        <Route path="/news/:id" element={<NewsDetail />} />
      </Route>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<SignIn />} />
        <Route path="/register" element={<SignUp />} />
      </Route>
      <Route element={<CabinetLayout />}>
        <Route path="/profile" element={<div>Profile Page</div>} />
        <Route path="/dashboard" element={<div>Profile Page</div>} />
        <Route path="/competitions" element={<div>Competitions Page</div>} />
        <Route path="/archive" element={<div>Archive Page</div>} />
        <Route path="/profile/news" element={<div>News Page</div>} />
      </Route>
    </Routes>
  );
}
