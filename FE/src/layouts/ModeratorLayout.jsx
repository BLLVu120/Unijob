import { Outlet } from "react-router-dom";
import DarkSidebar from "../components/DarkSidebar";
const user = JSON.parse(localStorage.getItem("internalUser"));

const ModeratorLayout = ({ onLogout }) => {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <DarkSidebar role={user?.role} handleLogout={onLogout} />
      <div style={{ flex: 1 }}>
        <Outlet />
      </div>
    </div>
  );
};

export default ModeratorLayout;
