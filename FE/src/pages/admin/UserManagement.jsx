import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Users, CheckCircle, Clock, Search, Eye, Trash2, User, Heart, Calendar, Phone, Mail, MapPin
} from 'lucide-react';
import { flex, txt, card, field } from '../../utils/styles';
import { COLORS, TILE_GRADIENTS } from '../../constants/colors';
import { PAGE_BTN_STYLE } from '../../constants/pageBtnStyle';
import { getAllCandidates, deleteCandidate } from '../../services/authService';
import { timeAgo, normalize } from '../../utils/jobFormat';
import PageHeader from '../../components/PageHeader';
import { ProfileDialog, ProfileCard, TileGrid, InfoTile, EmailText } from '../../components/ProfileKit';
import Toast from '../../components/Toast';
import { formatDate } from '../../utils/textUtils';
const C = COLORS;

// Hộp thoại chi tiết người dùng — cùng bố cục trang hồ sơ ứng viên
const GENDER_LABELS = { male: 'Nam', female: 'Nữ', other: 'Khác' };

const UserDetailModal = ({ open, onClose, user }) => {
  if (!open || !user) return null;
  const verified = user.status === 'verified';
  const fields = [
    { icon: User, label: 'Họ và tên', value: user.name },
    { icon: Heart, label: 'Giới tính', value: GENDER_LABELS[user.gender] || user.gender },
    { icon: Calendar, label: 'Ngày sinh', value: user.dob ? new Date(user.dob).toLocaleDateString('vi-VN') : '' },
    { icon: Phone, label: 'Số điện thoại', value: user.phone },
    { icon: Mail, label: 'Email', value: user.email && <EmailText email={user.email} /> },
    { icon: MapPin, label: 'Địa chỉ', value: user.address }
  ].map((f, i) => ({ ...f, gradient: TILE_GRADIENTS[i] }));

  return (
    <ProfileDialog open={open} onClose={onClose}>
      <ProfileCard
        flat
        initials={user.avatar}
        name={user.name}
        verified={verified}
        badges={[
          { icon: User, label: 'Ứng viên', tone: 'purple' },
          verified
            ? { icon: CheckCircle, label: 'Email đã xác thực', tone: 'green' }
            : { icon: Clock, label: 'Chờ xác thực email', tone: 'orange' },
          { icon: Calendar, label: `Đăng ký ${user.createdDate}`, tone: 'purple' }
        ]}
      >
        <TileGrid>
          {fields.map(f => <InfoTile key={f.label} {...f} />)}
        </TileGrid>
      </ProfileCard>
    </ProfileDialog>
  );
};

const DeleteConfirmModal = ({ open, onClose, onConfirm, user }) => {
  if (!open || !user) return null;

  return (
    <>
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000
      }} />
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 1001,
        width: '100%',
        maxWidth: 480,
        background: C.white,
        borderRadius: 16,
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        padding: 32,
        textAlign: 'center'
      }}>
        <div style={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          background: C.redBg,
          margin: '0 auto 20px',
          ...flex('center'),
          justifyContent: 'center'
        }}>
          <Trash2 size={32} color={C.red} />
        </div>
        <h2 style={{ ...txt(22, 700), marginBottom: 12 }}>Xác nhận xóa</h2>
        <p style={{ ...txt(15, 400, C.gray), marginBottom: 24 }}>
          Bạn có chắc chắn muốn xóa tài khoản "<strong>{user.name}</strong>"?
          Hành động này không thể hoàn tác.
        </p>
        <div style={{ ...flex('center'), justifyContent: 'center', gap: 12 }}>
          <button onClick={onClose} style={{
            padding: '12px 28px',
            borderRadius: 10,
            border: `1px solid ${C.border}`,
            background: C.white,
            color: C.navy,
            fontSize: 15,
            fontWeight: 600,
            cursor: 'pointer'
          }}>
            Hủy
          </button>
          <button onClick={onConfirm} style={{
            padding: '12px 28px',
            borderRadius: 10,
            border: 'none',
            background: C.red,
            color: C.white,
            fontSize: 15,
            fontWeight: 600,
            cursor: 'pointer'
          }}>
            Xóa tài khoản
          </button>
        </div>
      </div>
    </>
  );
};

const STATUS_STYLE = {
  verified: { label: 'Đã xác thực', bg: C.greenBg, text: C.green },
  pending: { label: 'Chờ xác thực', bg: C.yellowBg, text: C.amber }
};

const initials = (name) =>
  (name || '?').trim().split(/\s+/).slice(-2).map(w => w[0]).join('').toUpperCase();

// Ứng viên từ BE → dòng trong bảng
const toRow = (c) => {
  const status = c.is_verified ? 'verified' : 'pending';
  return {
    id: c.candidate_id,
    name: c.full_name,
    email: c.email,
    phone: c.phone_number,
    gender: c.gender,
    dob: c.dob,
    address: c.address,
    status,
    statusLabel: STATUS_STYLE[status].label,
    statusColor: STATUS_STYLE[status].bg,
    statusText: STATUS_STYLE[status].text,
    createdDate: formatDate(c.created_at),
    createdIso: c.created_at ? String(c.created_at).slice(0, 10) : '',
    lastLogin: timeAgo(c.updated_at || c.created_at),
    avatar: initials(c.full_name),
    bgColor: C.purple
  };
};


// Checkbox trong bảng: to hơn, màu tím (cùng kiểu trang Tin tuyển dụng)
const CHECKBOX = { width: 18, height: 18, margin: 0, display: 'block', cursor: 'pointer', accentColor: C.purple };

const STATUS_TABS = [
  { id: '', label: 'Tất cả' },
  { id: 'verified', label: 'Đã xác thực' },
  { id: 'pending', label: 'Chờ xác thực' }
];

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState(null);
  const clearNotice = useCallback(() => setNotice(null), []);
  const [busy, setBusy] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [filters, setFilters] = useState({ q: '', status: '', date: '' });

  const [selectedUsers, setSelectedUsers] = useState([]);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [page, setPage] = useState(1);

  const reload = () =>
    getAllCandidates()
      .then(list => setUsers(list
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .map(toRow)))
      .catch(err => setNotice({ type: 'error', text: `Không tải được danh sách: ${err.message}` }))
      .finally(() => setLoading(false));

  useEffect(() => { reload(); }, []);

  const displayUsers = useMemo(() => {
    const q = normalize(filters.q.trim());
    return users.filter(u =>
      (!q || normalize(`${u.name} ${u.email} ${u.phone}`).includes(q)) &&
      (!filters.status || u.status === filters.status) &&
      (!filters.date || u.createdIso === filters.date)
    );
  }, [users, filters]);

  const rowsPerPage = 5;
  const total = displayUsers.length;
  const totalPages = Math.max(1, Math.ceil(total / rowsPerPage));
  const start = (page - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  const currentUsers = displayUsers.slice(start, end);

  const stats = [
    { icon: Users, bgColor: C.grayBg, label: 'Tổng người dùng', value: users.length },
    { icon: CheckCircle, bgColor: C.greenBg, label: 'Đã xác thực', value: users.filter(u => u.status === 'verified').length },
    { icon: Clock, bgColor: C.yellowBg, label: 'Chờ xác thực', value: users.filter(u => u.status === 'pending').length }
  ];

  const applyFilters = () => {
    setFilters(f => ({ ...f, q: searchQuery, date: dateFilter }));
    setPage(1);
  };

  const selectStatus = (status) => {
    setFilters(f => ({ ...f, status }));
    setPage(1);
  };

  const handleCheckUser = (userId) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  const pageIds = currentUsers.map(u => u.id);
  const allPageChecked = pageIds.length > 0 && pageIds.every(id => selectedUsers.includes(id));
  const toggleAllPage = () => {
    setSelectedUsers(allPageChecked
      ? selectedUsers.filter(id => !pageIds.includes(id))
      : [...new Set([...selectedUsers, ...pageIds])]);
  };


  const deleteUsers = async (list) => {
    setBusy(true);
    const results = await Promise.allSettled(list.map(u => deleteCandidate(u.email)));
    const failed = results.filter(r => r.status === 'rejected').length;
    setBusy(false);
    setNotice(failed
      ? { type: 'error', text: `Đã xóa ${list.length - failed} tài khoản, ${failed} tài khoản xóa thất bại` }
      : { type: 'success', text: `Đã xóa ${list.length} tài khoản` });
    setSelectedUsers(ids => ids.filter(id => !list.some(u => u.id === id)));
    reload();
  };

  const handleDeleteSelected = () => {
    const list = users.filter(u => selectedUsers.includes(u.id));
    if (!list.length) return;
    if (!window.confirm(`Xóa ${list.length} tài khoản đã chọn? Toàn bộ hồ sơ ứng tuyển của họ cũng sẽ bị xóa.`)) return;
    deleteUsers(list);
  };

  return (
    <div style={{
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      background: C.grayBg,
      minHeight: '100vh'
    }}>
      <main style={{ marginLeft: 240, padding: '40px 48px' }}>
        <PageHeader
          title="Người dùng"
          subtitle="Quản lý tài khoản ứng viên và nhà tuyển dụng"
        />
        <Toast message={notice} onClose={clearNotice} />

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
          gap: 16,
          marginBottom: 24
        }}>
          {stats.map((stat, i) => (
            // Cùng kiểu thẻ thông số trang Tin tuyển dụng: icon trái, nhãn giữa, số sát phải
            <div key={i} style={{
              background: C.white, borderRadius: 16, border: `1px solid ${C.border}`,
              padding: '16px 20px', ...flex('center'), gap: 16
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: 12, flexShrink: 0,
                background: stat.bgColor, ...flex('center'), justifyContent: 'center'
              }}>
                <stat.icon size={24} color={C.navy} />
              </div>
              <p style={{ ...txt(14, 500, C.gray), flex: 1, minWidth: 0 }}>{stat.label}</p>
              <p style={{ ...txt(26, 700), flexShrink: 0 }}>{loading ? '…' : stat.value}</p>
            </div>
          ))}
        </div>

        {/* Thẻ tìm kiếm */}
        <div style={{ ...card(), padding: 14, marginBottom: 14, ...flex('center'), gap: 10 }}>
          <div style={{ ...flex('center'), gap: 10, flex: 1, ...field() }}>
            <Search size={18} color={C.grayLight} />
            <input
              placeholder="Tìm kiếm theo tên, email, số điện thoại..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && applyFilters()}
              style={{ border: 'none', outline: 'none', boxShadow: 'none', fontSize: 14, flex: 1, background: 'transparent' }}
            />
          </div>
          <input
            type="date"
            title="Lọc theo ngày đăng ký"
            value={dateFilter}
            onChange={e => setDateFilter(e.target.value)}
            style={{
              ...field(),
              fontSize: 14, color: C.darkGray, outline: 'none', minWidth: 160
            }}
          />
          <button
            onClick={applyFilters}
            style={{
              height: 44, padding: '0 22px', borderRadius: 12, border: 'none', background: C.purple,
              color: C.white, fontSize: 14, fontWeight: 600, cursor: 'pointer', ...flex('center'), gap: 8
            }}
          >
            <Search size={16} /> Tìm kiếm
          </button>
        </div>

        {/* Thẻ lọc trạng thái: bấm chip là lọc ngay */}
        <div style={{ ...card(), padding: '12px 16px', marginBottom: 24, ...flex('center'), gap: 10, flexWrap: 'wrap' }}>
          <span style={{ ...txt(14, 600, C.gray), marginRight: 4 }}>Lọc:</span>
          {STATUS_TABS.map(tab => {
            const active = filters.status === tab.id;
            const n = tab.id ? users.filter(u => u.status === tab.id).length : users.length;
            return (
              <button
                key={tab.id || 'all'}
                onClick={() => selectStatus(tab.id)}
                style={{
                  height: 36, padding: '0 16px', borderRadius: 999, cursor: 'pointer',
                  border: `1px solid ${active ? C.purple : C.border}`,
                  background: active ? C.purple : C.grayBg,
                  color: active ? C.white : C.darkGray,
                  fontSize: 13, fontWeight: 600, ...flex('center'), gap: 8
                }}
              >
                {tab.label}
                <span style={{
                  minWidth: 20, height: 20, padding: '0 6px', borderRadius: 999, fontSize: 11, fontWeight: 700,
                  background: active ? 'rgba(255,255,255,0.25)' : C.white, color: active ? C.white : C.gray,
                  ...flex('center'), justifyContent: 'center'
                }}>
                  {n}
                </span>
              </button>
            );
          })}
        </div>

        <div style={{
          background: C.white,
          borderRadius: 16,
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          {currentUsers.length > 0 ? (
            <>
              <div style={{
                padding: '20px 24px',
                borderBottom: `1px solid ${C.border}`,
                ...flex('center'),
                justifyContent: 'space-between'
              }}>
                <h2 style={{ ...txt(18, 700) }}>
                  Danh sách người dùng ({displayUsers.length.toLocaleString()})
                </h2>
                {selectedUsers.length > 0 && (
                  <div style={{ ...flex('center'), gap: 12 }}>
                    <span style={{ ...txt(14, 500, C.gray) }}>
                      Đã chọn: {selectedUsers.length}
                    </span>
                    <button
                      onClick={handleDeleteSelected}
                      disabled={busy}
                      style={{
                        padding: '8px 16px',
                        borderRadius: 8,
                        border: 'none',
                        background: C.red,
                        color: C.white,
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: 'pointer',
                        ...flex('center'),
                        gap: 6
                      }}
                    >
                      <Trash2 size={14} /> Xóa
                    </button>
                  </div>
                )}
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: C.grayBg }}>
                    <th style={{ width: 40, padding: '16px 20px' }}>
                      <input type="checkbox" checked={allPageChecked} onChange={toggleAllPage} style={CHECKBOX} />
                    </th>
                    {['NGƯỜI DÙNG', 'TRẠNG THÁI', 'NGÀY TẠO', 'CẬP NHẬT', 'THAO TÁC'].map(h => (
                      <th key={h} style={{
                        ...txt(12, 700, C.gray),
                        textAlign: 'left',
                        padding: '16px 20px',
                        textTransform: 'uppercase'
                      }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {currentUsers.map(user => (
                    <tr key={user.id} style={{ borderTop: `1px solid ${C.border}` }}>
                      <td style={{ padding: '16px 20px' }}>
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => handleCheckUser(user.id)}
                          style={CHECKBOX}
                        />
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ ...flex('center'), gap: 12 }}>
                          <div style={{
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            background: user.bgColor,
                            ...flex('center'),
                            justifyContent: 'center'
                          }}>
                            <span style={{ ...txt(14, 700, C.white) }}>{user.avatar}</span>
                          </div>
                          <div>
                            <p style={{ ...txt(14, 600) }}>{user.name}</p>
                            <p style={{ ...txt(13, 400, C.gray) }}>{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{
                          padding: '6px 14px',
                          borderRadius: 16,
                          background: user.statusColor,
                          color: user.statusText,
                          fontSize: 13,
                          fontWeight: 600
                        }}>
                          {user.statusLabel}
                        </span>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{ ...txt(14, 400) }}>{user.createdDate}</span>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{ ...txt(14, 400) }}>{user.lastLogin}</span>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ ...flex('center'), gap: 8 }}>
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setViewModalOpen(true);
                            }}
                            title="Xem chi tiết"
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: 10,
                              border: 'none',
                              background: C.blueLight,
                              cursor: 'pointer',
                              ...flex('center'),
                              justifyContent: 'center'
                            }}
                          >
                            <Eye size={17} color={C.purple} />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setDeleteModalOpen(true);
                            }}
                            title="Xóa"
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: 10,
                              border: 'none',
                              background: C.redBg,
                              cursor: 'pointer',
                              ...flex('center'),
                              justifyContent: 'center'
                            }}
                          >
                            <Trash2 size={17} color={C.red} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{
                padding: '16px 20px',
                borderTop: `1px solid ${C.border}`,
                ...flex('center'),
                justifyContent: 'space-between'
              }}>
                <span style={{ ...txt(14, 400, C.gray) }}>
                  Hiển thị {start + 1}-{Math.min(end, total)} trong tổng số {total} người dùng
                </span>
                <div style={{ ...flex('center'), gap: 8 }}>
                  {totalPages > 3 && page > 1 && (
                      <button onClick={() => setPage(page - 1)} style={PAGE_BTN_STYLE}>←</button>
                  )}
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(p => p >= page - 1 && p <= page + 1)
                    .map(p => (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        style={{
                            ...PAGE_BTN_STYLE,
                            border: p === page ? 'none' : PAGE_BTN_STYLE.border,
                            background: p === page ? C.blue : PAGE_BTN_STYLE.background,
                            color: p === page ? C.white : undefined
                        }}
                      >
                        {p}
                      </button>
                    ))}
                    {totalPages > 3 && page < totalPages && (
                        <button onClick={() => setPage(page + 1)} style={PAGE_BTN_STYLE}>→</button>
                    )}
                </div>
              </div>
            </>
          ) : (
            <div style={{
              padding: '80px 40px',
              textAlign: 'center'
            }}>
              <div style={{
                width: 88,
                height: 88,
                borderRadius: '50%',
                background: C.grayBg,
                margin: '0 auto 20px',
                ...flex('center'),
                justifyContent: 'center'
              }}>
                <Users size={40} color={C.grayLight} />
              </div>
              <h3 style={{ ...txt(20, 600), marginBottom: 8 }}>
                {loading ? 'Đang tải...' : users.length ? 'Không có người dùng phù hợp với bộ lọc' : 'Chưa có người dùng nào'}
              </h3>
              <p style={{
                ...txt(15, 400, C.gray),
                maxWidth: 400,
                margin: '0 auto 24px'
              }}>
                Danh sách người dùng sẽ xuất hiện tại đây khi có người đăng ký tài khoản mới.
              </p>
            </div>
          )}
        </div>
      </main>

      <UserDetailModal
        open={viewModalOpen}
        onClose={() => {
          setViewModalOpen(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
      />

      <DeleteConfirmModal
        open={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedUser(null);
        }}
        onConfirm={() => {
          const target = selectedUser;
          setDeleteModalOpen(false);
          setSelectedUser(null);
          if (target) deleteUsers([target]);
        }}
        user={selectedUser}
      />
    </div>
  );
}