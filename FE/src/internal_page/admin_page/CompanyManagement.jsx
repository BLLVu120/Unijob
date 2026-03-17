import { useState, useEffect } from 'react';
import {
  Building2, CheckCircle, Clock, Ban, Search, Eye, Trash2,
  ShieldOff, ShieldCheck, X, FileText
} from 'lucide-react';
import { flex, txt } from '../../utils/styles';
import { COLORS } from '../../constants/colors';
import { pageBtnStyle } from '../../constants/pageBtnStyle';
import { getAllEmployers } from "../../services/authService";
import { getInitials, formatDate } from '../../utils/textUtils';
import Toast from "../../components/Toast";
const C = COLORS;

const industries = [
  'Công nghệ thông tin',
  'Marketing',
  'Thiết kế',
  'Hành chính',
  'Bán hàng',
  'F&B - Nhà hàng',
  'Giao hàng',
  'Gia sư - Dạy học',
  'Khác'
];

const CompanyDetailModal = ({ open, onClose, company, onApprove, onReject }) => {
  const [note, setNote] = useState('');

  if (!open || !company) return null;

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
        maxWidth: 800,
        background: C.white,
        borderRadius: 16,
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        <div style={{
          ...flex('center'),
          justifyContent: 'space-between',
          padding: '24px 28px',
          borderBottom: `1px solid ${C.border}`
        }}>
          <h2 style={{ ...txt(22, 700) }}>Chi tiết doanh nghiệp</h2>
          <button onClick={onClose} style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 4
          }}>
            <X size={24} color={C.gray} />
          </button>
        </div>

        <div style={{ padding: '28px' }}>
          <h3 style={{ ...txt(16, 700), marginBottom: 16, ...flex('center'), gap: 8 }}>
            <Building2 size={20} /> Thông tin công ty
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px 24px',
            marginBottom: 32
          }}>
            <div>
              <p style={{
                ...txt(11, 700, C.gray),
                textTransform: 'uppercase',
                marginBottom: 6
              }}>
                TÊN CÔNG TY
              </p>
              <p style={{ ...txt(15, 600) }}>{company.name}</p>
            </div>

            <div>
              <p style={{
                ...txt(11, 700, C.gray),
                textTransform: 'uppercase',
                marginBottom: 6
              }}>
                NGÀY ĐĂNG KÝ
              </p>
              <p style={{ ...txt(15, 600) }}>{company.registeredDate}</p>
            </div>

            <div>
              <p style={{
                ...txt(11, 700, C.gray),
                textTransform: 'uppercase',
                marginBottom: 6
              }}>
                MÃ SỐ THUẾ
              </p>
              <p style={{ ...txt(15, 600) }}>{company.taxId}</p>
            </div>

            <div>
              <p style={{
                ...txt(11, 700, C.gray),
                textTransform: 'uppercase',
                marginBottom: 6
              }}>
                NGÀNH NGHỀ
              </p>
              <p style={{ ...txt(15, 600) }}>{company.industry}</p>
            </div>

            <div>
              <p style={{
                ...txt(11, 700, C.gray),
                textTransform: 'uppercase',
                marginBottom: 6
              }}>
                QUY MÔ CÔNG TY
              </p>
              <p style={{ ...txt(15, 600) }}>{company.size}</p>
            </div>

            <div>
              <p style={{
                ...txt(11, 700, C.gray),
                textTransform: 'uppercase',
                marginBottom: 6
              }}>
                WEBSITE
              </p>
              <p style={{ ...txt(15, 600, C.blue) }}>{company.website}</p>
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <p style={{
                ...txt(11, 700, C.gray),
                textTransform: 'uppercase',
                marginBottom: 6
              }}>
                ĐỊA CHỈ
              </p>
              <p style={{ ...txt(15, 600) }}>{company.address}</p>
            </div>
          </div>

          <h3 style={{ ...txt(16, 700), marginBottom: 16, ...flex('center'), gap: 8 }}>
            <FileText size={20} /> Giấy tờ đính kèm
          </h3>
          {[
            { name: 'Giấy phép kinh doanh', size: '1.8 MB' },
            { name: 'Mã số thuế', size: '1.1 MB' }
          ].map((doc, i) => (
            <div key={i} style={{
              ...flex('center'),
              justifyContent: 'space-between',
              background: C.grayBg,
              borderRadius: 12,
              padding: '16px 20px',
              marginBottom: 12
            }}>
              <div style={{ ...flex('center'), gap: 12 }}>
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: 8,
                  background: C.navy,
                  ...flex('center'),
                  justifyContent: 'center'
                }}>
                  <FileText size={20} color={C.white} />
                </div>
                <div>
                  <p style={{ ...txt(14, 600) }}>{doc.name}</p>
                  <p style={{ ...txt(12, 400, C.gray) }}>PDF • {doc.size}</p>
                </div>
              </div>
              <button style={{
                padding: '8px 16px',
                borderRadius: 8,
                border: `1px solid ${C.border}`,
                background: C.white,
                color: C.navy,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                ...flex('center'),
                gap: 6
              }}>
                <Eye size={14} /> Chi tiết
              </button>
            </div>
          ))}

          <div style={{ marginTop: 24 }}>
            <label style={{
              ...txt(14, 600),
              display: 'block',
              marginBottom: 8,
              textTransform: 'uppercase',
              color: C.gray
            }}>
              Ghi chú (nếu từ chối)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Nhập lí do từ chối xác thực..."
              style={{
                width: '100%',
                minHeight: 100,
                padding: '12px',
                borderRadius: 12,
                border: `1px solid ${C.border}`,
                fontSize: 14,
                fontFamily: 'inherit',
                resize: 'vertical',
                outline: 'none'
              }}
            />
          </div>
        </div>

        <div style={{
          padding: '20px 28px',
          borderTop: `1px solid ${C.border}`,
          ...flex('center'),
          justifyContent: 'flex-end',
          gap: 12
        }}>
          {company.status === 'pending' && (
            <>
              <button
                onClick={onReject}
                style={{
                  padding: '12px 28px',
                  borderRadius: 10,
                  border: 'none',
                  background: C.red,
                  color: C.white,
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: 'pointer',
                  ...flex('center'),
                  gap: 8
                }}
              >
                <X size={18} /> Từ chối
              </button>
              <button
                onClick={onApprove}
                style={{
                  padding: '12px 28px',
                  borderRadius: 10,
                  border: 'none',
                  background: C.green,
                  color: C.white,
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: 'pointer',
                  ...flex('center'),
                  gap: 8
                }}
              >
                <CheckCircle size={18} /> Xác thực
              </button>
            </>
          )}

          {company.status === 'verified' && (
            <button
              onClick={onReject}
              style={{
                padding: '12px 28px',
                borderRadius: 10,
                border: 'none',
                background: C.red,
                color: C.white,
                fontSize: 15,
                fontWeight: 600,
                cursor: 'pointer',
                ...flex('center'),
                gap: 8
              }}
            >
              <X size={18} /> Từ chối
            </button>
          )}

          {company.status === 'rejected' && (
            <button
              onClick={onApprove}
              style={{
                padding: '12px 28px',
                borderRadius: 10,
                border: 'none',
                background: C.green,
                color: C.white,
                fontSize: 15,
                fontWeight: 600,
                cursor: 'pointer',
                ...flex('center'),
                gap: 8
              }}
            >
              <CheckCircle size={18} /> Xác thực
            </button>
          )}
        </div>
      </div>
    </>
  );
};

const LockConfirmModal = ({ open, onClose, onConfirm, company, isUnlock }) => {
  if (!open || !company) return null;

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
            <ShieldOff size={32} color={'#f59e0b'} />
          )}
        </div>
        <h2 style={{ ...txt(22, 700), marginBottom: 12 }}>
          {isUnlock ? 'Xác nhận mở khóa' : 'Xác nhận khóa doanh nghiệp'}
        </h2>
        <p style={{ ...txt(15, 400, C.gray), marginBottom: 24 }}>
          {isUnlock ? (
            <>
              Bạn có chắc chắn muốn mở khóa doanh nghiệp{" "}
              <strong>{company.name}</strong>? Doanh nghiệp sẽ có thể hoạt động trở lại.
            </>
          ) : (
            <>
              Bạn có chắc chắn muốn khóa doanh nghiệp{" "}
              <strong>{company.name}</strong>? Doanh nghiệp sẽ không thể đăng tin tuyển dụng.
            </>
          )}
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
            {isUnlock ? 'Mở khóa' : 'Khóa doanh nghiệp'}
          </button>
        </div>
      </div>
    </>
  );
};

const DeleteConfirmModal = ({ open, onClose, onConfirm, company }) => {
  if (!open || !company) return null;

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
          Bạn có chắc chắn muốn xóa doanh nghiệp <strong>{company.name}</strong>?
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
            Xóa doanh nghiệp
          </button>
        </div>
      </div>
    </>
  );
};


export default function CompanyManagementPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [toast, setToast] = useState(null);
  const [companies, setCompanies] = useState([]);
  useEffect(() => {
    const fetchEmployers = async () => {
      try {
        const data = await getAllEmployers();
        const employers = data.map((u, index) => ({
          id: u.id || index + 1,
          email: u.email,
          name: u.emp_name || "-",
          taxId: u.tax_code || "-",
          industry: u.field || "-",
          jobs: "0 việc",
          status: u.blocked ? "blocked" : u.is_verified ? "verified" : "pending",
          statusLabel: u.blocked ? "Đã khóa" : u.is_verified ? "Đã xác thực" : "Chờ xác thực",
          statusColor: u.blocked ? C.redBg : u.is_verified ? C.greenBg : C.yellowBg,
          statusText: u.blocked ? C.red : u.is_verified ? C.green : "#f59e0b",
          avatar: getInitials(u.emp_name),
          bgColor: "#7c3aed",
          registeredDate: u.created_at ? formatDate(u.created_at) : "-",
          size: u.scope || "-",
          website: u.website || "-",
          address: u.address || "-"
        }));
        setCompanies(employers);
      } catch (err) {
        console.error(err);
      }
    };
    fetchEmployers();
  }, []);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [lockModalOpen, setLockModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [isUnlockAction, setIsUnlockAction] = useState(false);
  const [industryFilter, setIndustryFilter] = useState("all");
  const [page, setPage] = useState(1);
  const rowsPerPage = 5;

  const displayCompanies = companies.filter(company => {
    const matchSearch =
      company.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.taxId?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchStatus = statusFilter === "all" || company.status === statusFilter;
    const matchIndustry = industryFilter === "all" || company.industry === industryFilter;
    return matchSearch && matchStatus && matchIndustry;
  });

  const total = displayCompanies.length;
  const totalPages = Math.ceil(total / rowsPerPage);
  const start = (page - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  const currentCompanies = displayCompanies.slice(start, end);

  const stats = [
    { icon: Building2, label: 'Tổng doanh nghiệp', value: companies.length },
    { icon: CheckCircle, label: 'Đã xác thực', value: companies.filter(c => c.status === 'verified').length },
    { icon: Clock, label: 'Chờ xác thực', value: companies.filter(c => c.status === 'pending').length },
    { icon: Ban, label: 'Bị từ chối', value: companies.filter(c => c.status === 'rejected').length }
  ];


  const handleLockCompany = (company) => {
    setSelectedCompany(company);
    setIsUnlockAction(company.status === 'blocked');
    setLockModalOpen(true);
  };

  const handleApprove = () => {
    console.log('Approved:', selectedCompany);
    setViewModalOpen(false);
  };

  const handleReject = () => {
    console.log('Rejected:', selectedCompany);
    setViewModalOpen(false);
  };

  return (
    <div style={{
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      background: C.grayBg,
      minHeight: '100vh'
    }}>

    {toast && (
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast(null)}
      />
    )}
      <main style={{ marginLeft: 220, padding: '40px 48px' }}>
        <h1 style={{ ...txt(32, 700), marginBottom: 32 }}>Doanh nghiệp</h1>
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
              placeholder="Tìm kiếm theo tên công ty, mã số thuế..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                border: 'none',
                outline: 'none',
                fontSize: 14,
                flex: 1,
                background: 'transparent'
              }}
            />
          </div>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
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
            <option value="all">Tất cả trạng thái</option>
            <option value="verified">Đã xác thực</option>
            <option value="pending">Chờ xác thực</option>
            <option value="rejected">Bị từ chối</option>
            <option value="blocked">Đã khóa</option>
          </select>
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
            <option>Tất cả ngành nghề</option>
            {industries.map((industry) => (
              <option key={industry} value={industry}>
                {industry}
              </option>
            ))}
          </select>
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
          {displayCompanies.length > 0 ? (
            <>
              <div style={{
                padding: '20px 24px',
                borderBottom: `1px solid ${C.border}`
              }}>
                <h2 style={{ ...txt(18, 700) }}>
                  Danh sách doanh nghiệp ({displayCompanies.length.toLocaleString()})
                </h2>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: C.grayBg }}>
                    {['DOANH NGHIỆP', 'NGÀNH NGHỀ', 'VIỆC LÀM', 'TRẠNG THÁI', 'THAO TÁC'].map(h => (
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
                  {currentCompanies.map(company => (
                    <tr key={company.id} style={{ borderTop: `1px solid ${C.border}` }}>
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ ...flex('center'), gap: 12 }}>
                          <div style={{
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            background: company.bgColor,
                            ...flex('center'),
                            justifyContent: 'center'
                          }}>
                            <span style={{ ...txt(14, 700, C.white) }}>{company.avatar}</span>
                          </div>
                          <div>
                            <p style={{ ...txt(14, 600) }}>{company.name}</p>
                            <p style={{ ...txt(13, 400, C.gray) }}>{company.taxId}</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{ ...txt(14, 400) }}>{company.industry}</span>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{ ...txt(14, 400) }}>{company.jobs}</span>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{
                          padding: '6px 14px',
                          borderRadius: 16,
                          background: company.statusColor,
                          color: company.statusText,
                          fontSize: 13,
                          fontWeight: 600
                        }}>
                          {company.statusLabel}
                        </span>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ ...flex('center'), gap: 8 }}>
                          <button
                            onClick={() => {
                              setSelectedCompany(company);
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
                            onClick={() => handleLockCompany(company)}
                            title="Khóa doanh nghiệp"
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
                            <Ban size={18} color={C.white} />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedCompany(company);
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
                  Hiển thị {start + 1}-{Math.min(end, total)} trong tổng số {total} doanh nghiệp
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
                <Building2 size={56} color={C.grayLight} />
              </div>
              <h3 style={{ ...txt(20, 600), marginBottom: 8 }}>
                Chưa có doanh nghiệp nào
              </h3>
              <p style={{
                ...txt(15, 400, C.gray),
                maxWidth: 400,
                margin: '0 auto 24px'
              }}>
                Danh sách doanh nghiệp sẽ xuất hiện tại đây.
              </p>
            </div>
          )}
        </div>
      </main>

      <CompanyDetailModal
        open={viewModalOpen}
        onClose={() => {
          setViewModalOpen(false);
          setSelectedCompany(null);
        }}
        company={selectedCompany}
        onApprove={handleApprove}
        onReject={handleReject}
      />

      <LockConfirmModal
        open={lockModalOpen}
        onClose={() => {
          setLockModalOpen(false);
          setSelectedCompany(null);
        }}
        onConfirm={() => {
          const users = getUsers();
          const updatedUsers = users.map(u => {
            if (u.email === selectedCompany.email) {
              const blocked = !u.blocked;
              return {
                ...u,
                blocked,
              };
            }
            return u;
          });
          saveUsers(updatedUsers);
          const verified = u.is_verified === true || u.is_verified === "true";
          const employers = updatedUsers
            .filter(u => u.role === "employer")
            .map((u, index) => ({
              id: index + 1,
              name: u.companyName || u.name,
              taxId: u.taxId || "-",
              industry: u.industry || "-",
              jobs: "0 việc",
              status: u.blocked ? "blocked" : verified ? "verified" : "pending",
              statusLabel: u.blocked ? "Đã khóa" : verified ? "Đã xác thực" : "Chờ xác thực",
              statusColor: u.blocked ? C.redBg : verified ? C.greenBg : C.yellowBg,
              statusText: u.blocked ? C.red : verified ? C.green : "#f59e0b",
              avatar: getInitials(u.companyName || u.name),
              bgColor: "#7c3aed",
              registeredDate: u.createdAt ? formatDate(u.createdAt) : "-",
              size: u.companySize || "-",
              website: u.website || "-",
              address: u.address || "-"
            }));

          setCompanies(employers);
          setToast({ message: isUnlockAction ? "Đã mở khóa doanh nghiệp" : "Đã khóa doanh nghiệp", type: "success" });
          setLockModalOpen(false);
          setSelectedCompany(null);
        }}
        company={selectedCompany}
        isUnlock={isUnlockAction}
      />

      <DeleteConfirmModal
        open={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedCompany(null);
        }}
        onConfirm={() => {
          const users = getUsers();
          const updated = users.filter(u => {
            if (u.role !== "employer") return true;
            return u.email !== selectedCompany.email;
          });

          saveUsers(updated);
          const employers = updated
            .filter(u => u.role === "employer")
            .map((u, index) => ({
              id: index + 1,
              name: u.companyName || u.name,
              taxId: u.taxId || "-",
              industry: u.industry || "-",
              jobs: "0 việc",
              status: u.verified ? "verified" : "pending",
              statusLabel: u.verified ? "Đã xác thực" : "Chờ xác thực",
              statusColor: u.verified ? C.greenBg : C.yellowBg,
              statusText: u.verified ? C.green : "#f59e0b",
              avatar: getInitials(u.companyName || u.name),
              bgColor: "#7c3aed",
              registeredDate: u.createdAt ? formatDate(u.createdAt) : "-",
              size: u.companySize || "-",
              website: u.website || "-",
              address: u.address || "-"
            }));

          setCompanies(employers);
          setToast({ message: "Đã xóa doanh nghiệp thành công", type: "success" });
          setDeleteModalOpen(false);
          setSelectedCompany(null);
        }}
        company={selectedCompany}
      />
    </div>
  );
}