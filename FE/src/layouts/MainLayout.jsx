import Navbar from "../components/Navbar";
import Footer from '../components/Footer';
import { Outlet } from 'react-router-dom';

export default function MainLayout({ user, onLogout }) {
  return (
    <>
      <Navbar
        isLoggedIn={!!user}
        isEmployer={user?.isEmployer}
        userData={user}
        onLogout={onLogout}
      />
      <Outlet />
      <Footer />
    </>
  );
}
