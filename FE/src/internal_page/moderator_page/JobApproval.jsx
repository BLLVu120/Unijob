import { useState } from 'react';
import {
  Eye, CheckSquare, XCircle, MapPin, Briefcase, Building2,
  X, CheckCircle, AlertTriangle, Search, CreditCard
} from 'lucide-react';
import { COLORS } from '../../constants/colors';
import { flex, txt } from '../../utils/styles';
import { pageBtnStyle } from '../../constants/pageBtnStyle';
const C = COLORS;

const JobDetailModal = ({ open, onClose, job, onApprove, onReject }) => {
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectionInput, setShowRejectionInput] = useState(false);

  if (!open || !job) return null;

  const handleReject = () => {
    if ((job.status === 'pending' || job.status === 'approved') && !showRejectionInput) {
      setShowRejectionInput(true);
    } else {
      onReject(rejectionReason);
      setRejectionReason('');
      setShowRejectionInput(false);
      onClose();
    }
  };

  const handleApprove = () => {
    onApprove();
    setRejectionReason('');
    setShowRejectionInput(false);
    onClose();
  };

  const handleClose = () => {
    setRejectionReason('');
    setShowRejectionInput(false);
    onClose();
  };

  const statusConfig = {
    pending: { bg: C.yellowBg, text: '#f59e0b', label: 'Đang chờ' },
    approved: { bg: C.greenBg, text: C.green, label: 'Đã duyệt' },
    rejected: { bg: C.redBg, text: C.red, label: 'Từ chối' }
  };

  const status = statusConfig[job.status];

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
        borderRadius: 20,
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)',
          borderRadius: '20px 20px 0 0',
          padding: '20px 24px'
        }}>
          <div style={{
            ...flex('center'),
            justifyContent: 'space-between',
            marginBottom: 12
          }}>
            <div style={{ ...flex('center'), gap: 8 }}>
              <span style={{
                padding: '4px 12px',
                borderRadius: 16,
                background: status.bg,
                color: status.text,
                fontSize: 12,
                fontWeight: 600
              }}>
                {status.label}
              </span>
            </div>
            <button onClick={onClose} style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              cursor: 'pointer',
              padding: 6,
              borderRadius: '50%',
              ...flex('center'),
              justifyContent: 'center'
            }}>
              <X size={20} color={C.white} />
            </button>
          </div>

          <h2 style={{ ...txt(20, 700, C.white), marginBottom: 6 }}>{job.title}</h2>
          <div style={{ ...flex('center'), gap: 6, marginBottom: 12 }}>
            <Building2 size={14} color={C.white} />
            <span style={{ ...txt(13, 500, C.white) }}>{job.company}</span>
            <CheckCircle size={14} color={C.white} />
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 10
          }}>
            {[
              { icon: MapPin, label: 'Địa điểm', value: job.location },
              { icon: CreditCard, label: 'Mức lương', value: job.salary },
              { icon: Briefcase, label: 'Kinh nghiệm', value: job.experience }
            ].map(({ icon: Icon, label, value }, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(10px)',
                borderRadius: 10,
                padding: '10px 8px',
                textAlign: 'center'
              }}>
                <div style={{ ...flex('center'), justifyContent: 'center', gap: 4, marginBottom: 3 }}>
                  <Icon size={12} color={C.white} />
                  <span style={{ ...txt(10, 500, C.white), opacity: 0.9 }}>{label}</span>
                </div>
                <p style={{ ...txt(12, 700, C.white) }}>{value}</p>
              </div>
            ))}
          </div>
        </div>

        <div style={{ padding: '20px 24px' }}>
          {['Mô tả công việc', 'Yêu cầu ứng viên', 'Thời gian làm việc', 'Quyền lợi'].map((section, idx) => (
            <div key={idx} style={{ marginBottom: 20 }}>
              <h3 style={{ ...txt(15, 700), marginBottom: 10, ...flex('center'), gap: 6 }}>
                <Briefcase size={16} /> {section}
              </h3>
              <div style={{ background: C.grayBg, borderRadius: 10, padding: '10px 12px' }}>
                <ul style={{ margin: 0, paddingLeft: 16 }}>
                  {[1, 2, 3].map((i, index, arr) => (
                     <li
                        key={i}
                        style={{
                        ...txt(14, 400, C.gray),
                        marginBottom: index === arr.length - 1 ? 0 : 8
                        }}
                    >
                      {section === 'Mô tả công việc' && 'Chúng tôi đang tìm kiếm nhân viên phục vụ part-time năng động'}
                      {section === 'Yêu cầu ứng viên' && 'Độ tuổi: 18-28 tuổi'}
                      {section === 'Thời gian làm việc' && 'Ca sáng: 07:00 - 11:00'}
                      {section === 'Quyền lợi' && 'Lương trả theo tuần qua chuyển khoản'}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}

          <div style={{ marginBottom: 20 }}>
            <h3 style={{ ...txt(15, 700), marginBottom: 12, ...flex('center'), gap: 6 }}>
              <Building2 size={16} /> Thông tin chung
            </h3>
            {[
              { label: 'SỐ LƯỢNG TUYỂN', value: '3 người' },
              { label: 'HẠN NỘP HỒ SƠ', value: '30/01/2025' },
              { label: 'CẤP BẬC', value: 'Nhân viên' },
              { label: 'HỌC VẤN', value: 'Cấp 3 trở lên' }
            ].map(({ label, value }, i) => (
              <div key={i} style={{
                paddingBottom: 10,
                marginBottom: 10,
                borderBottom: i < 3 ? `1px solid ${C.border}` : 'none'
              }}>
                <p style={{
                  ...txt(10, 700, C.gray),
                  textTransform: 'uppercase',
                  marginBottom: 3
                }}>
                  {label}
                </p>
                <p style={{ ...txt(13, 600) }}>{value}</p>
              </div>
            ))}
          </div>

          {job.status === 'rejected' && job.rejectionReason && (
            <div style={{ marginBottom: 20 }}>
              <h3 style={{
                ...txt(15, 700),
                marginBottom: 10,
                ...flex('center'),
                gap: 6
              }}>
                <AlertTriangle size={16} /> Lí do bị từ chối
              </h3>
              <div style={{
                background: C.redBg,
                borderRadius: 10,
                padding: '12px',
                border: `1px solid ${C.red}`
              }}>
                <p style={{ ...txt(13, 400, C.red) }}>{job.rejectionReason}</p>
              </div>
            </div>
          )}

          {(job.status === 'pending' || job.status === 'approved') && showRejectionInput && (
            <div>
              <h3 style={{
                ...txt(15, 700),
                marginBottom: 10,
                ...flex('center'),
                gap: 6
              }}>
                <AlertTriangle size={16} /> Lý do từ chối
              </h3>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Nhập nội dung từ chối nếu cần thiết"
                style={{
                  width: '100%',
                  minHeight: 80,
                  padding: '10px 12px',
                  borderRadius: 10,
                  border: `1px solid ${C.border}`,
                  fontSize: 13,
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  outline: 'none'
                }}
              />
            </div>
          )}
        </div>

        <div style={{
          padding: '16px 24px',
          borderTop: `1px solid ${C.border}`,
          ...flex('center'),
          justifyContent: 'flex-end',
          gap: 10
        }}>
          {job.status === 'pending' && (
            <>
              {!showRejectionInput ? (
                <>
                  <button onClick={handleClose} style={{
                    padding: '10px 20px',
                    borderRadius: 8,
                    border: `1px solid ${C.border}`,
                    background: C.white,
                    color: C.navy,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}>
                    Hủy
                  </button>
                  <button onClick={handleReject} style={{
                    padding: '10px 20px',
                    borderRadius: 8,
                    border: 'none',
                    background: C.red,
                    color: C.white,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer',
                    ...flex('center'),
                    gap: 6
                  }}>
                    <X size={16} /> Từ chối
                  </button>
                  <button onClick={handleApprove} style={{
                    padding: '10px 20px',
                    borderRadius: 8,
                    border: 'none',
                    background: C.green,
                    color: C.white,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer',
                    ...flex('center'),
                    gap: 6
                  }}>
                    <CheckCircle size={16} /> Duyệt tin
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => setShowRejectionInput(false)} style={{
                    padding: '10px 20px',
                    borderRadius: 8,
                    border: `1px solid ${C.border}`,
                    background: C.white,
                    color: C.navy,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}>
                    Hủy
                  </button>
                  <button onClick={handleReject} style={{
                    padding: '10px 20px',
                    borderRadius: 8,
                    border: 'none',
                    background: C.red,
                    color: C.white,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer',
                    ...flex('center'),
                    gap: 6
                  }}>
                    <X size={16} /> Xác nhận từ chối
                  </button>
                </>
              )}
            </>
          )}

          {job.status === 'approved' && (
            <>
              {!showRejectionInput ? (
                <>
                  <button onClick={handleClose} style={{
                    padding: '10px 20px',
                    borderRadius: 8,
                    border: `1px solid ${C.border}`,
                    background: C.white,
                    color: C.navy,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}>
                    Hủy
                  </button>
                  <button onClick={handleReject} style={{
                    padding: '10px 20px',
                    borderRadius: 8,
                    border: 'none',
                    background: C.red,
                    color: C.white,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer',
                    ...flex('center'),
                    gap: 6
                  }}>
                    <X size={16} /> Từ chối
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => setShowRejectionInput(false)} style={{
                    padding: '10px 20px',
                    borderRadius: 8,
                    border: `1px solid ${C.border}`,
                    background: C.white,
                    color: C.navy,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}>
                    Hủy
                  </button>
                  <button onClick={handleReject} style={{
                    padding: '10px 20px',
                    borderRadius: 8,
                    border: 'none',
                    background: C.red,
                    color: C.white,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer',
                    ...flex('center'),
                    gap: 6
                  }}>
                    <X size={16} /> Xác nhận từ chối
                  </button>
                </>
              )}
            </>
          )}

          {job.status === 'rejected' && (
            <>
              <button onClick={handleClose} style={{
                padding: '10px 20px',
                borderRadius: 8,
                border: `1px solid ${C.border}`,
                background: C.white,
                color: C.navy,
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer'
              }}>
                Hủy
              </button>
              <button onClick={handleApprove} style={{
                padding: '10px 20px',
                borderRadius: 8,
                border: 'none',
                background: C.green,
                color: C.white,
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                ...flex('center'),
                gap: 6
              }}>
                <CheckCircle size={16} /> Duyệt tin
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default function JobModerationPage() {
    const [jobs, setJobs] = useState([
    {
      id: 1,
      title: 'Nhân viên Phục vụ Part-time',
      company: 'The Coffee House',
      postedTime: '1 phút trước',
      status: 'approved',
      statusLabel: 'Đã duyệt',
      statusColor: C.greenBg,
      statusText: C.green,
      location: 'Quận 3, TP.HCM',
      salary: '80.000 - 150.000 VNĐ/giờ',
      experience: 'Không yêu cầu'
    },
    {
      id: 2,
      title: 'Nhân viên Bán hàng',
      company: 'Fashion Store ABC',
      postedTime: '2 phút trước',
      status: 'pending',
      statusLabel: 'Chờ duyệt',
      statusColor: C.yellowBg,
      statusText: '#f59e0b',
      location: 'Quận 1, TP.HCM',
      salary: '50.000 - 80.000 VNĐ/giờ',
      experience: '6 tháng'
    },
    {
      id: 3,
      title: 'Gia sư Toán - Lý',
      company: 'TutorVN',
      postedTime: '3 phút trước',
      status: 'approved',
      statusLabel: 'Đã duyệt',
      statusColor: C.greenBg,
      statusText: C.green,
      location: 'Online',
      salary: '100.000 - 200.000 VNĐ/giờ',
      experience: '1 năm'
    },
    {
      id: 4,
      title: 'Shipper Part-time',
      company: 'Postal Service ABC',
      postedTime: '1 giờ trước',
      status: 'approved',
      statusLabel: 'Đã duyệt',
      statusColor: C.greenBg,
      statusText: C.green,
      location: 'Quận 5, TP.HCM',
      salary: '40.000 - 60.000 VNĐ/giờ',
      experience: 'Không yêu cầu'
    },
    {
      id: 5,
      title: 'Content Writer',
      company: 'Thu ngân Part-time',
      postedTime: '2 giờ trước',
      status: 'rejected',
      statusLabel: 'Từ chối',
      statusColor: C.redBg,
      statusText: C.red,
      location: 'Remote',
      salary: '100.000 - 150.000 VNĐ/bài',
      experience: '6 tháng',
      rejectionReason: 'Mô tả công việc không rõ ràng, thiếu nhất quán với các yêu cầu cơ bản.'
    }
  ]);
  const [activeTab, setActiveTab] = useState('all');
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [page, setPage] = useState(1);
  const displayJobs = activeTab === "all" ? jobs : jobs.filter(job => job.status === activeTab);
  const rowsPerPage = 5;
  const total = displayJobs.length;
  const totalPages = Math.ceil(total / rowsPerPage);
  const start = (page - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  const currentJobs = displayJobs.slice(start, end);

  const stats = [
    { icon: Eye, label: 'Chờ duyệt', value: jobs.filter(j => j.status === 'pending').length },
    { icon: CheckSquare, label: 'Đã duyệt hôm nay', value: jobs.filter(j => j.status === 'approved').length },
    { icon: XCircle, label: 'Đã từ chối', value: jobs.filter(j => j.status === 'rejected').length }
  ];

  const tabs = [
    { id: 'all', label: 'Tất cả', count: jobs.length },
    { id: 'pending', label: 'Chờ duyệt', count: jobs.filter(j => j.status === 'pending').length },
    { id: 'approved', label: 'Đã duyệt', count: jobs.filter(j => j.status === 'approved').length },
    { id: 'rejected', label: 'Từ chối', count: jobs.filter(j => j.status === 'rejected').length }
  ];
  
  const handleApprove = () => {
    if (selectedJob) {
      setJobs(jobs.map(j => 
        j.id === selectedJob.id 
          ? { ...j, status: 'approved', statusLabel: 'Đã duyệt', statusColor: C.greenBg, statusText: C.green, rejectionReason: '' }
          : j
      ));
    }
  };

  const handleReject = (reason) => {
    if (selectedJob) {
      setJobs(jobs.map(j => 
        j.id === selectedJob.id 
          ? { ...j, status: 'rejected', statusLabel: 'Từ chối', statusColor: C.redBg, statusText: C.red, rejectionReason: reason }
          : j
      ));
    }
  };

  return (
    <div style={{
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      background: C.grayBg,
      minHeight: '100vh'
    }}>
      <main style={{ marginLeft: 220, padding: '40px 48px' }}>
        <h1 style={{ ...txt(32, 700), marginBottom: 32 }}>Duyệt tin tuyển dụng</h1>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
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
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <div style={{ ...flex('center'), justifyContent: 'space-between' }}>
            <div style={{ ...flex('center'), gap: 12 }}>
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setPage(1);
                  }}  
                  style={{
                    padding: '10px 20px',
                    borderRadius: 8,
                    border: 'none',
                    background: activeTab === tab.id ? C.blue : C.grayBg,
                    color: activeTab === tab.id ? C.white : C.navy,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer',
                    ...flex('center'),
                    gap: 8
                  }}
                >
                  {tab.label}
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: 12,
                    background: activeTab === tab.id ? 'rgba(255,255,255,0.2)' : C.white,
                    fontSize: 12
                  }}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            <div style={{ ...flex('center'), gap: 12 }}>
              <div style={{
                ...flex('center'),
                gap: 10,
                padding: '8px 14px',
                borderRadius: 8,
                border: `1px solid ${C.border}`,
                minWidth: 300
              }}>
                <Search size={18} color={C.gray} />
                <input
                  placeholder="Tìm kiếm theo tiêu đề, công ty..."
                  style={{
                    border: 'none',
                    outline: 'none',
                    fontSize: 14,
                    flex: 1,
                    background: 'transparent'
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div style={{
          background: C.white,
          borderRadius: 16,
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          {displayJobs.length > 0 ? (
            <>
              <div style={{
                padding: '20px 24px',
                borderBottom: `1px solid ${C.border}`
              }}>
                <h2 style={{ ...txt(18, 700) }}>
                  Danh sách tin ({displayJobs.length})
                </h2>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: C.grayBg }}>
                    {['TIN TUYỂN DỤNG', 'CÔNG TY', 'THỜI GIAN ĐĂNG', 'TRẠNG THÁI', 'THAO TÁC'].map(h => (
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
                  {currentJobs.map(job => (
                    <tr key={job.id} style={{ borderTop: `1px solid ${C.border}` }}>
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{ ...txt(14, 600) }}>{job.title}</span>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{ ...txt(14, 400) }}>{job.company}</span>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{ ...txt(14, 400) }}>{job.postedTime}</span>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{
                          padding: '6px 14px',
                          borderRadius: 16,
                          background: job.statusColor,
                          color: job.statusText,
                          fontSize: 13,
                          fontWeight: 600
                        }}>
                          {job.statusLabel}
                        </span>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <button
                          onClick={() => {
                            setSelectedJob(job);
                            setViewModalOpen(true);
                          }}
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
                  Hiển thị {start + 1}-{Math.min(end, total)} trong tổng số {total} tin
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
                <CheckSquare size={56} color={C.grayLight} />
              </div>
              <h3 style={{ ...txt(20, 600), marginBottom: 8 }}>
                Chưa có tin cần duyệt
              </h3>
              <p style={{
                ...txt(15, 400, C.gray),
                maxWidth: 400,
                margin: '0 auto 24px'
              }}>
                Danh sách tin tuyển dụng cần duyệt sẽ xuất hiện tại đây khi có nhà tuyển dụng đăng tin mới.
              </p>
            </div>
          )}
        </div>
      </main>

      <JobDetailModal
        open={viewModalOpen}
        onClose={() => {
          setViewModalOpen(false);
          setSelectedJob(null);
        }}
        job={selectedJob}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  );
}