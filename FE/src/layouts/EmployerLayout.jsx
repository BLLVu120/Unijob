import { Outlet } from 'react-router-dom';
import Sidebar from "../components/Sidebar";

const EmployerLayout = () => (
  <div style={{ display: 'flex', minHeight: '100%' }}>
    <Sidebar isEmployer={true} />
    <div style={{ flex: 1 }}>
      <Outlet />
    </div>
  </div>
);

export default EmployerLayout;
