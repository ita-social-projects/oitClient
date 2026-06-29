import { Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import './App.css';
import { MainLayout } from './layout/MainLayout.tsx';
import NewsForm from './pages/admin/News/NewsForm.tsx';
import { AuthLayout } from './pages/auth/AuthLayout.tsx';
import { SignIn } from './pages/auth/SignIn.tsx';
import { SignUp } from './pages/auth/SignUp.tsx';
import { CheckEmailPage } from './pages/auth/CheckEmail.tsx';
import { CabinetLayout } from './pages/CabinetLayout.tsx';
import Home from './pages/public/Home.tsx';
import NewsArchive from './pages/user/News/NewsArchive.tsx';
import NewsDetail from './pages/user/News/NewsDetail.tsx';
import NewsList from './pages/user/News/NewsList.tsx';

export default function App() {
  return (
    <>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/news" element={<NewsList />} />
          <Route path="/archive" element={<NewsArchive />} />
          <Route path="/news/:id" element={<NewsDetail />} />
          <Route path="/news/create" element={<NewsForm />} />
          <Route path="/news/edit/:id" element={<NewsForm />} />
        </Route>

        <Route element={<AuthLayout />}>
          <Route path="/login" element={<SignIn />} />
          <Route path="/register" element={<SignUp />} />
          <Route path="/registration" element={<SignUp />} />
          <Route path="/registration/check-email" element={<CheckEmailPage />} />
        </Route>

        <Route element={<CabinetLayout />}>
          <Route path="/profile" element={<div>Profile Page</div>} />
          <Route path="/dashboard" element={<div>Profile Page</div>} />
          <Route path="/competitions" element={<div>Competitions Page</div>} />
        </Route>
      </Routes>

      <ToastContainer />
    </>
  );
}
