import { useAuthInit } from '@hooks/useAuthInit.ts';
import { Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import './App.css';
import { MainLayout } from './layout/MainLayout.tsx';
import NewsAdminList from './pages/admin/News/NewsAdminList.tsx';
import NewsForm from './pages/admin/News/NewsForm.tsx';
import AdminUsersPage from './pages/admin/Users/AdminUsersPage.tsx';
import { AuthLayout } from './pages/auth/AuthLayout.tsx';
import { CheckEmailPage } from './pages/auth/CheckEmail.tsx';
import { SignIn } from './pages/auth/SignIn.tsx';
import { SignUp } from './pages/auth/SignUp.tsx';
import { VerifyEmailPage } from './pages/auth/VerifyEmail.tsx';
import { CabinetLayout } from './layout/CabinetLayout.tsx';
import Home from './pages/public/Home.tsx';
import NewsArchive from './pages/user/News/NewsArchive.tsx';
import NewsDetail from './pages/user/News/NewsDetail.tsx';
import NewsList from './pages/user/News/NewsList.tsx';
import { RequireRole } from './shared/components/RequireRole.tsx';

export default function App() {
  const loading = useAuthInit();
  if (loading) return null;

  return (
    <>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/news" element={<NewsList />} />
          <Route path="/archive" element={<NewsArchive />} />
          <Route path="/news/:id" element={<NewsDetail />} />
        </Route>

        <Route element={<AuthLayout />}>
          <Route path="/signIn" element={<SignIn />} />
          <Route path="/registration" element={<SignUp />} />
          <Route path="/registration/check-email" element={<CheckEmailPage />} />
          <Route path="/confirm_registration" element={<VerifyEmailPage />} />
        </Route>

        <Route element={<CabinetLayout />}>
          <Route path="/profile" element={<div>Profile Page</div>} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/competitions" element={<div>Competitions Page</div>} />
          <Route
            path="/profile/news"
            element={
              <RequireRole roles={['ADMIN', 'ORG']}>
                <NewsAdminList />
              </RequireRole>
            }
          />
          <Route
            path="/profile/news/create"
            element={
              <RequireRole roles={['ADMIN', 'ORG']}>
                <NewsForm />
              </RequireRole>
            }
          />
          <Route
            path="/profile/news/edit/:id"
            element={
              <RequireRole roles={['ADMIN', 'ORG']}>
                <NewsForm />
              </RequireRole>
            }
          />
        </Route>
      </Routes>

      <ToastContainer />
    </>
  );
}
