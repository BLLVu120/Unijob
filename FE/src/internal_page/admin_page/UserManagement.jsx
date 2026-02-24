import { useState } from 'react';
import {
  Users, CheckCircle, Clock, Ban, Search, Eye, Trash2,
  ShieldOff, ShieldCheck, X
} from 'lucide-react';
import { flex, txt } from '../../utils/styles';
import { COLORS } from '../../constants/colors';
import { pageBtnStyle } from '../../constants/pageBtnStyle';
const C = COLORS;
 
const UserDetailModal = ({ open, onClose, user }) => {
  if (!open || !user) return null;

  const statusConfig = {
    verified: { bg: C.greenBg, text: C.green, label: 'Đã xác thực' },
    pending: { bg: C.yellowBg, text: '#f59e0b', label: 'Chờ xác thực' },
    blocked: { bg: C.redBg, text: C.red, label: 'Đã khóa' }
  };

  const status = statusConfig[user.status];

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
        maxWidth: 520,
        background: C.white,
        borderRadius: 16,
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        <div style={{
          ...flex('center'),
          justifyContent: 'space-between',
          padding: '24px 28px',
          borderBottom: `1px solid ${C.border}`
        }}>
          <h2 style={{ ...txt(22, 700) }}>Chi tiết người dùng</h2>
          <button onClick={onClose} style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 4
          }}>
            <X size={24} color={C.gray} />
          </button>
        </div>

        <div style={{
          padding: '28px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 24
        }}>
          <div>
            <p style={{
              ...txt(11, 700, C.gray),
              textTransform: 'uppercase',
              marginBottom: 6
            }}>
              HỌ VÀ TÊN
            </p>
            <p style={{ ...txt(15, 600) }}>{user.name}</p>
          </div>

          <div>
            <p style={{
              ...txt(11, 700, C.gray),
              textTransform: 'uppercase',
              marginBottom: 6
            }}>
              EMAIL
            </p>
            <p style={{ ...txt(15, 600) }}>{user.email}</p>
          </div>

          <div>
            <p style={{
              ...txt(11, 700, C.gray),
              textTransform: 'uppercase',
              marginBottom: 6
            }}>
              SỐ ĐIỆN THOẠI
            </p>
            <p style={{ ...txt(15, 600) }}>{user.phone}</p>
          </div>

          <div>
            <p style={{
              ...txt(11, 700, C.gray),
              textTransform: 'uppercase',
              marginBottom: 6
            }}>
              TRẠNG THÁI
            </p>
            <span style={{
              padding: '6px 14px',
              borderRadius: 16,
              background: status.bg,
              color: status.text,
              fontSize: 13,
              fontWeight: 600,
              display: 'inline-block'
            }}>
              {status.label}
            </span>
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <p style={{
              ...txt(11, 700, C.gray),
              textTransform: 'uppercase',
              marginBottom: 6
            }}>
              NGÀY ĐĂNG KÝ
            </p>
            <p style={{ ...txt(15, 600) }}>{user.createdDate}</p>
          </div>
        </div>
      </div>
    </>
  );
};

const LockConfirmModal = ({ open, onClose, onConfirm, user, isUnlock }) => {
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
          background: isUnlock ? C.greenBg : C.yellowBg,
          margin: '0 auto 20px',
          ...flex('center'),
          justifyContent: 'center'
        }}>
          {isUnlock ? (
            <ShieldCheck size={32} color={C.green} />
          ) : (
            <ShieldOff size={32} color="#f59e0b" />
          )}
        </div>
        <h2 style={{ ...txt(22, 700), marginBottom: 12 }}>
          {isUnlock ? 'Xác nhận mở khóa' : 'Xác nhận khóa tài khoản'}
        </h2>
        <p style={{ ...txt(15, 400, C.gray), marginBottom: 24 }}>
          {isUnlock
            ? `Bạn có chắc chắn muốn mở khóa tài khoản của "${user.name}"? Người dùng sẽ có thể đăng nhập trở lại.`
            : `Bạn có chắc chắn muốn khóa tài khoản của "${user.name}"? Người dùng sẽ không thể đăng nhập.`
          }
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
            background: isUnlock ? C.green : '#f59e0b',
            color: C.white,
            fontSize: 15,
            fontWeight: 600,
            cursor: 'pointer'
          }}>
            {isUnlock ? 'Mở khóa' : 'Khóa tài khoản'}
          </button>
        </div>
      </div>
    </>
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

export default function UserManagementPage() {
  const users = [
    {
      id: 1,
      name: 'Nguyễn Văn Anh',
      email: 'vananh@email.com',
      phone: '0912 345 678',
      status: 'verified',
      statusLabel: 'Đã xác thực',
      statusColor: C.greenBg,
      statusText: C.green,
      createdDate: '15/10/2025',
      lastLogin: 'Đang online',
      avatar: 'VA',
      bgColor: '#7c3aed'
    },
    {
      id: 2,
      name: 'Lê Minh Hoàng',
      email: 'minhhoang@email.com',
      phone: '0923 456 789',
      status: 'pending',
      statusLabel: 'Chờ xác thực',
      statusColor: C.yellowBg,
      statusText: '#f59e0b',
      createdDate: '10/10/2025',
      lastLogin: '3 ngày trước',
      avatar: 'MH',
      bgColor: '#7c3aed'
    },
    {
      id: 3,
      name: 'Phạm Hồng',
      email: 'phamhong@email.com',
      phone: '0934 567 890',
      status: 'blocked',
      statusLabel: 'Đã khóa',
      statusColor: C.redBg,
      statusText: C.red,
      createdDate: '10/10/2025',
      lastLogin: '3 ngày trước',
      avatar: 'PH',
      bgColor: '#7c3aed'
    },
    {
      id: 4,
      name: 'Nguyễn Văn Anh',
      email: 'vananh@email.com',
      phone: '0912 345 678',
      status: 'verified',
      statusLabel: 'Đã xác thực',
      statusColor: C.greenBg,
      statusText: C.green,
      createdDate: '15/10/2025',
      lastLogin: '2 giờ trước',
      avatar: 'VA',
      bgColor: '#7c3aed'
    },
    {
      id: 5,
      name: 'Lê Minh Hoàng',
      email: 'minhhoang@email.com',
      phone: '0923 456 789',
      status: 'pending',
      statusLabel: 'Chờ xác thực',
      statusColor: C.yellowBg,
      statusText: '#f59e0b',
      createdDate: '10/10/2025',
      lastLogin: '3 ngày trước',
      avatar: 'MH',
      bgColor: '#7c3aed'
    }
  ];
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [lockModalOpen, setLockModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isUnlockAction, setIsUnlockAction] = useState(false);
  const [page, setPage] = useState(1);
  const rowsPerPage = 5;
  const total = users.length;
  const totalPages = Math.ceil(total / rowsPerPage);
  const start = (page - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  const currentUsers = users.slice(start, end);

  const stats = [
    { icon: Users, label: 'Tổng người dùng', value: 5 },
    { icon: CheckCircle, label: 'Đã xác thực', value: 2 },
    { icon: Clock, label: 'Chờ xác thực', value: 2 },
    { icon: Ban, label: 'Đã khóa', value: 1 }
  ];

  const displayUsers = users;

  const handleCheckUser = (userId) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  const handleLockUser = (user) => {
    setSelectedUser(user);
    setIsUnlockAction(user.status === 'blocked');
    setLockModalOpen(true);
  };

  const handleDeleteSelected = () => {
    console.log('Bulk delete:', selectedUsers);
    setSelectedUsers([]);
  };

  return (
    <div style={{
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      background: C.grayBg,
      minHeight: '100vh'
    }}>
      <main style={{ marginLeft: 220, padding: '40px 48px' }}>
        <h1 style={{ ...txt(32, 700), marginBottom: 32 }}>Người dùng</h1>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 20,
          marginBottom: 32
        }}>
          {stats.map((stat, i) => (
            <div key={i} style={{
              background: C.white,
              borderRadius: 16,
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              ...flex('center'),
              gap: 16
            }}>
              <div style={{
                width: 56,
                height: 56,
                borderRadius: 12,
                background: C.grayBg,
                ...flex('center'),
                justifyContent: 'center'
              }}>
                <stat.icon size={28} color={C.navy} />
              </div>
              <div>
                <p style={{ ...txt(13, 500, C.gray) }}>
                  {stat.label}
                </p>
                <p style={{ ...txt(26, 700) }}>{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div style={{
          background: C.white,
          borderRadius: 16,
          padding: '20px 24px',
          marginBottom: 24,
          ...flex('center'),
          gap: 16,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <div style={{
            ...flex('center'),
            gap: 10,
            flex: 1,
            padding: '10px 14px',
            borderRadius: 8,
            border: `1px solid ${C.border}`
          }}>
            <Search size={18} color={C.gray} />
            <input
              placeholder="Tìm kiếm theo tên, email..."
              style={{
                border: 'none',
                outline: 'none',
                fontSize: 14,
                flex: 1,
                background: 'transparent'
              }}
            />
          </div>
          <select style={{
            padding: '10px 14px',
            borderRadius: 8,
            border: `1px solid ${C.border}`,
            fontSize: 14,
            outline: 'none',
            cursor: 'pointer',
            minWidth: 180,
            appearance: 'none',
            background: `${C.white} url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2364748b' d='M6 9L1 4h10z'/%3E%3C/svg%3E") no-repeat right 14px center`
          }}>
            <option>Tất cả trạng thái</option>
          </select>
          <input
            type="date"
            placeholder="Ngày tạo"
            style={{
              padding: '10px 14px',
              borderRadius: 8,
              border: `1px solid ${C.border}`,
              fontSize: 14,
              outline: 'none',
              minWidth: 150
            }}
          />
          <button style={{
            padding: '10px 32px',
            borderRadius: 8,
            border: 'none',
            background: C.blue,
            color: C.white,
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer'
          }}>
            Lọc
          </button>
        </div>

        <div style={{
          background: C.white,
          borderRadius: 16,
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          {displayUsers.length > 0 ? (
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
                    <button style={{
                      padding: '8px 16px',
                      borderRadius: 8,
                      border: 'none',
                      background: C.darkNavy,
                      color: C.white,
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer',
                      ...flex('center'),
                      gap: 6
                    }}>
                      <ShieldOff size={14} /> Khóa
                    </button>
                    <button
                      onClick={handleDeleteSelected}
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
                      <input type="checkbox" style={{ cursor: 'pointer' }} />
                    </th>
                    {['NGƯỜI DÙNG', 'TRẠNG THÁI', 'NGÀY TẠO', 'ĐĂNG NHẬP', 'THAO TÁC'].map(h => (
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
                          style={{ cursor: 'pointer' }}
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
                              borderRadius: 8,
                              border: 'none',
                              background: C.blue,
                              cursor: 'pointer',
                              ...flex('center'),
                              justifyContent: 'center'
                            }}
                          >
                            <Eye size={18} color={C.white} />
                          </button>
                          <button
                            onClick={() => handleLockUser(user)}
                            title={user.status === 'blocked' ? 'Mở khóa' : 'Khóa tài khoản'}
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: 8,
                              border: 'none',
                              background: C.darkNavy,
                              cursor: 'pointer',
                              ...flex('center'),
                              justifyContent: 'center'
                            }}
                          >
                            {user.status === 'blocked' ? (
                              <ShieldCheck size={18} color={C.white} />
                            ) : (
                              <Ban size={18} color={C.white} />
                            )}
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
                              borderRadius: 8,
                              border: 'none',
                              background: C.red,
                              cursor: 'pointer',
                              ...flex('center'),
                              justifyContent: 'center'
                            }}
                          >
                            <Trash2 size={18} color={C.white} />
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
                      <button onClick={() => setPage(page - 1)} style={pageBtnStyle}>←</button>
                  )}
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(p => p >= page - 1 && p <= page + 1)
                    .map(p => (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        style={{
                            ...pageBtnStyle,
                            border: p === page ? "none" : pageBtnStyle.border,
                            background: p === page ? C.blue : pageBtnStyle.background,
                            color: p === page ? C.white : undefined
                        }}
                      >
                        {p}
                      </button>
                    ))}
                    {totalPages > 3 && page < totalPages && (
                        <button onClick={() => setPage(page + 1)} style={pageBtnStyle}>→</button>
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
                width: 120,
                height: 120,
                borderRadius: '50%',
                background: C.grayBg,
                margin: '0 auto 24px',
                ...flex('center'),
                justifyContent: 'center'
              }}>
                <Users size={56} color={C.grayLight} />
              </div>
              <h3 style={{ ...txt(20, 600), marginBottom: 8 }}>
                Chưa có người dùng nào
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

      <LockConfirmModal
        open={lockModalOpen}
        onClose={() => {
          setLockModalOpen(false);
          setSelectedUser(null);
        }}
        onConfirm={() => {
          console.log(isUnlockAction ? 'Unlocked' : 'Locked', selectedUser);
          setLockModalOpen(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
        isUnlock={isUnlockAction}
      />

      <DeleteConfirmModal
        open={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedUser(null);
        }}
        onConfirm={() => {
          console.log('Deleted', selectedUser);
          setDeleteModalOpen(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
      />
    </div>
  );
}