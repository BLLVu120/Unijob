import { Outlet } from 'react-router-dom';
import DarkSidebar from '../components/DarkSidebar';

// Khung chung cho khu vực nội bộ (admin / moderator): thanh bên tối + nội dung
export default function InternalLayout({ onLogout }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <DarkSidebar handleLogout={onLogout} />
      <div style={{ flex: 1 }}>
        <Outlet />
      </div>
    </div>
  );
}
