import { Outlet } from 'react-router-dom';
import Sidebar from "../components/Sidebar";

const CandidateLayout = () => (
  <div style={{ display: 'flex', minHeight: '100%' }}>
    <Sidebar isEmployer={false} />
    <div style={{ flex: 1 }}>
      <Outlet />
    </div>
  </div>
);

export default CandidateLayout;
