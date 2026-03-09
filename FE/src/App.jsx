import { Routes, Route } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

import MainLayout from "./layouts/MainLayout";
import CandidateLayout from "./layouts/CandidateLayout";
import EmployerLayout from "./layouts/EmployerLayout";
import AdminLayout from "./layouts/AdminLayout";
import ModeratorLayout from "./layouts/ModeratorLayout";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import EmailVerificationPage from "./pages/EmailVerificationPage";
import CompanyPage from "./pages/CompanyPage";
import JobPage from "./pages/JobPage";
import JobDetailPage from "./pages/JobDetailPage";
import CompanyDetailPage from "./pages/CompanyDetailPage";

import CandidateChat from "./candidate_page/CandidateChat";
import CandidateProfile from "./candidate_page/CandidateProfile";
import ChangePassword from "./candidate_page/ChangePassword";
import JobApplied from "./candidate_page/JobApplied";

import CompanyProfile from "./company_page/CompanyProfile";
import Subscription from "./company_page/Subscription";
import TransactionHistory from "./company_page/TransactionHistory";
import CompanyVerification from "./company_page/CompanyVerification";
import CompanyChat from "./company_page/CompanyChat";
import CandidateList from "./company_page/CandidateList";
import JobManagement from "./company_page/JobManagement";

import InternalLogin from "./internal_page/InternalLogin";
import UserManagement from "./internal_page/admin_page/UserManagement";
import CompanyManagement from "./internal_page/admin_page/CompanyManagement";
import JobApproval from "./internal_page/moderator_page/JobApproval";
import Reports from "./internal_page/moderator_page/Reports";

import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  const { user, logoutUser, logoutInternal } = useAuth();

  return (
    <Routes>
      <Route element={<MainLayout user={user} onLogout={logoutUser} />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<EmailVerificationPage />} />

        <Route path="/jobs" element={<JobPage />} />
        <Route path="/job-detail" element={<JobDetailPage />} />

        <Route path="/company" element={<CompanyPage />} />
        <Route path="/company-detail" element={<CompanyDetailPage />} />

        <Route element={<ProtectedRoute allowedRoles={["candidate"]} />}>
          <Route path="/candidate" element={<CandidateLayout />}>
            <Route path="profile" element={<CandidateProfile />} />
            <Route path="change-password" element={<ChangePassword />} />
            <Route path="messages" element={<CandidateChat />} />
            <Route path="applied-jobs" element={<JobApplied />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["employer"]} />}>
          <Route path="/employer" element={<EmployerLayout />}>
            <Route path="company-profile" element={<CompanyProfile />} />
            <Route path="subscription" element={<Subscription />} />
            <Route path="transactions" element={<TransactionHistory />} />
            <Route path="verification" element={<CompanyVerification />} />
            <Route path="messages" element={<CompanyChat />} />
            <Route path="candidates" element={<CandidateList />} />
            <Route path="jobs" element={<JobManagement />} />
          </Route>
        </Route>
      </Route>

      <Route path="/internal/login" element={<InternalLogin />} />
      <Route element={<ProtectedRoute internal allowedRoles={["admin", "moderator"]} />}>
        <Route path="/internal">
          <Route element={<ProtectedRoute internal allowedRoles={["admin"]} />}>
            <Route path="admin" element={<AdminLayout onLogout={logoutInternal} />}>
              <Route path="users" element={<UserManagement />} />
              <Route path="companies" element={<CompanyManagement />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute internal allowedRoles={["moderator"]} />}>
            <Route path="moderator" element={<ModeratorLayout onLogout={logoutInternal} />}>
              <Route path="job-approval" element={<JobApproval />} />
              <Route path="reports" element={<Reports />} />
            </Route>
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}