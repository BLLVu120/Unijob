import { Outlet } from "react-router-dom";
import DarkSidebar from "../components/DarkSidebar";

const InternalLayout = () => {
  return (
    <div style={{ display: "flex", minHeight: '100%' }}>
      <DarkSidebar />
      <div style={{ flex: 1 }}>
        <Outlet />
      </div>
    </div>
  );
};

export default InternalLayout;
