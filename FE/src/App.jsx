import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { pageTitleFor } from './utils/pageTitle';
import { getCurrentUser, logout } from './services/authService';

import MainLayout from './layouts/MainLayout';
import CandidateLayout from './layouts/CandidateLayout';
import EmployerLayout from './layouts/EmployerLayout';
import InternalLayout from './layouts/InternalLayout';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import EmailVerificationPage from './pages/EmailVerificationPage';
import VerificationConfirmationPage from './pages/VerificationConfirmationPage';
import PaymentResultPage from './pages/PaymentResultPage';
import CompanyPage from './pages/CompanyPage';
import JobPage from './pages/JobPage';
import JobDetailPage from './pages/JobDetailPage';
import CompanyDetailPage from './pages/CompanyDetailPage';

import CandidateChat from './pages/candidate/CandidateChat';
import CandidateProfile from './pages/candidate/CandidateProfile';
import ChangePassword from './pages/ChangePassword';
import JobApplied from './pages/candidate/JobApplied';
import SavedJobs from './pages/candidate/SavedJobs';
import InterviewSchedule from './pages/candidate/InterviewSchedule';

import CompanyProfile from './pages/employer/CompanyProfile';
import Subscription from './pages/employer/Subscription';
import TransactionHistory from './pages/employer/TransactionHistory';
import CompanyVerification from './pages/employer/CompanyVerification';
import CompanyChat from './pages/employer/CompanyChat';
import CandidateList from './pages/employer/CandidateList';
import JobManagement from './pages/employer/JobManagement';

import UserManagement from './pages/admin/UserManagement';
import CompanyManagement from './pages/admin/CompanyManagement';
import JobApproval from './pages/moderator/JobApproval';

import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  // Tiêu đề tab trình duyệt theo trang đang xem
  const { pathname } = useLocation();
  useEffect(() => {
    document.title = pageTitleFor(pathname);
  }, [pathname]);

  const [user, setUser] = useState(getCurrentUser);

  const handleLogout = () => {
    logout();
    setUser(null);
  };

  return (
    <Routes>
      <Route element={<MainLayout user={user} onLogout={handleLogout} />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<EmailVerificationPage />} />
        <Route path="/verify-success" element={<VerificationConfirmationPage />} />

        <Route path="/jobs" element={<JobPage />} />
        <Route path="/job-detail/:id" element={<JobDetailPage />} />

        <Route path="/company" element={<CompanyPage />} />
        <Route path="/company-detail/:id" element={<CompanyDetailPage />} />

        <Route element={<ProtectedRoute user={user} allowedRoles={['candidate']} />}>
          <Route path="/candidate" element={<CandidateLayout />}>
            <Route path="profile" element={<CandidateProfile />} />
            <Route path="change-password" element={<ChangePassword />} />
            <Route path="messages" element={<CandidateChat />} />
            <Route path="applied-jobs" element={<JobApplied />} />
            <Route path="saved-jobs" element={<SavedJobs />} />
            <Route path="interviews" element={<InterviewSchedule />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute user={user} allowedRoles={['employer']} />}>
          <Route path="/payment/result" element={<PaymentResultPage />} />
          <Route path="/employer" element={<EmployerLayout />}>
            <Route path="company-profile" element={<CompanyProfile />} />
            <Route path="subscription" element={<Subscription />} />
            <Route path="transactions" element={<TransactionHistory />} />
            <Route path="verification" element={<CompanyVerification />} />
            <Route path="messages" element={<CompanyChat />} />
            <Route path="candidates" element={<CandidateList />} />
            <Route path="jobs" element={<JobManagement />} />
            <Route path="change-password" element={<ChangePassword />} />
          </Route>
        </Route>
      </Route>

      {/* Trang đăng nhập nội bộ cũ → dùng chung trang đăng nhập */}
      <Route path="/internal/login" element={<Navigate to="/login" replace />} />

      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route path="/internal/admin" element={<InternalLayout onLogout={handleLogout} />}>
          <Route index element={<UserManagement />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="companies" element={<CompanyManagement />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['moderator']} />}>
        <Route path="/internal/moderator" element={<InternalLayout onLogout={handleLogout} />}>
          <Route index element={<JobApproval />} />
          <Route path="job-approval" element={<JobApproval />} />
          {/* Trang Báo cáo đã bỏ (BE chưa có API) → chuyển về Duyệt tin */}
          <Route path="reports" element={<Navigate to="/internal/moderator/job-approval" replace />} />
        </Route>
      </Route>
    </Routes>
  );
}