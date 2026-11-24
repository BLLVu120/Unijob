import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { COLORS } from '../constants/colors';

const CandidateLayout = () => (
  <div style={{ display: 'flex', alignItems: 'flex-start', minHeight: 'calc(100vh - 64px)', background: COLORS.grayBg }}>
    <Sidebar isEmployer={false} />
    <div style={{ flex: 1, minWidth: 0 }}>
      <Outlet />
    </div>
  </div>
);

export default CandidateLayout;
