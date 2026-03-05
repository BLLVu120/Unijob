import { Outlet } from "react-router-dom";
import DarkSidebar from "../components/DarkSidebar";

export default function InternalLayout({ onLogout }) {
  return (
    <>
      <DarkSidebar handleLogout={onLogout} />
      <Outlet />
    </>
  );
}