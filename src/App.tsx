import { Route, Routes } from 'react-router-dom';

import './App.css';
import { MainLayout } from './layouts/MainLayout.tsx';
import { AuthLayout } from './pages/auth/AuthLayout.tsx';
import { SignIn } from './pages/auth/SignIn.tsx';
import { SignUp } from './pages/auth/SignUp.tsx';
import Home from './pages/public/Home.tsx';
import NewsList from "./pages/user/News/NewsList.tsx";

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
         <Route path="/news" element={<NewsList />} />
      </Route>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<SignIn />} />
        <Route path="/register" element={<SignUp />} />
      </Route>
    </Routes>
  );
}
