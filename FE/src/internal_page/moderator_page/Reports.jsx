import { useState } from 'react';
import { AlertTriangle, ClipboardList, Clock, CheckCircle, XCircle, Eye, Search, X } from 'lucide-react';
import { flex, txt } from '../../utils/styles';
import { COLORS } from '../../constants/colors';
import { pageBtnStyle } from '../../constants/pageBtnStyle';
const C = COLORS;

const ReportDetailModal = ({ open, onClose, report, onApprove, onReject }) => {
  if (!open || !report) return null;

  const statusConfig = {
    pending: { bg: C.yellowBg, text: '#f59e0b', label: 'Đang xem xét' },
    approved: { bg: C.greenBg, text: C.green, label: 'Chấp nhận' },
    rejected: { bg: C.redBg, text: C.red, label: 'Từ chối' }
  };

  const status = statusConfig[report.status];

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
          <h2 style={{ ...txt(22, 700) }}>Chi tiết báo cáo</h2>
          <button onClick={onClose} style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 4
          }}>
            <X size={24} color={C.gray} />
          </button>
        </div>

        <div style={{ padding: '24px 28px' }}>
          <h3 style={{ ...txt(15, 700), marginBottom: 12 }}>
            Thông tin tin tuyển dụng được báo cáo
          </h3>
          <div style={{ marginBottom: 30 }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
              marginBottom: 12
            }}>
              <div>
                <p style={{
                  ...txt(11, 700, C.gray),
                  textTransform: 'uppercase',
                  marginBottom: 4
                }}>
                  ID
                </p>
                <p style={{ ...txt(14, 600) }}>{report.jobId}</p>
              </div>
              <div>
                <p style={{
                  ...txt(11, 700, C.gray),
                  textTransform: 'uppercase',
                  marginBottom: 4
                }}>
                  TIÊU ĐỀ
                </p>
                <p style={{ ...txt(14, 600) }}>{report.jobTitle}</p>
              </div>
              <div>
                <p style={{
                  ...txt(11, 700, C.gray),
                  textTransform: 'uppercase',
                  marginBottom: 4
                }}>
                  CÔNG TY
                </p>
                <p style={{ ...txt(14, 600) }}>{report.company}</p>
              </div>
              <div>
                <p style={{
                  ...txt(11, 700, C.gray),
                  textTransform: 'uppercase',
                  marginBottom: 4
                }}>
                  TRẠNG THÁI
                </p>
                <span style={{
                  padding: '4px 12px',
                  borderRadius: 12,
                  background: status.bg,
                  color: status.text,
                  fontSize: 12,
                  fontWeight: 600,
                  display: 'inline-block'
                }}>
                  {status.label}
                </span>
              </div>
            </div>
          </div>

          <h3 style={{ ...txt(15, 700), marginBottom: 12 }}>Người báo cáo</h3>
          <div style={{ marginBottom: 30 }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px'
            }}>
              <div>
                <p style={{
                  ...txt(11, 700, C.gray),
                  textTransform: 'uppercase',
                  marginBottom: 4
                }}>
                  HỌ VÀ TÊN
                </p>
                <p style={{ ...txt(14, 600) }}>{report.reporterName}</p>
              </div>
              <div>
                <p style={{
                  ...txt(11, 700, C.gray),
                  textTransform: 'uppercase',
                  marginBottom: 4
                }}>
                  SỐ ĐIỆN THOẠI
                </p>
                <p style={{ ...txt(14, 600) }}>{report.reporterPhone}</p>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <p style={{
                  ...txt(11, 700, C.gray),
                  textTransform: 'uppercase',
                  marginBottom: 4
                }}>
                  ĐỊA CHỈ
                </p>
                <p style={{ ...txt(14, 600) }}>{report.reporterAddress}</p>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <p style={{
                  ...txt(11, 700, C.gray),
                  textTransform: 'uppercase',
                  marginBottom: 4
                }}>
                  EMAIL
                </p>
                <p style={{ ...txt(14, 600) }}>{report.reporterEmail}</p>
              </div>
            </div>
          </div>

          <h3 style={{ ...txt(15, 700), marginBottom: 12 }}>Nội dung báo cáo</h3>
          <div style={{
            background: C.yellowBg,
            borderRadius: 12,
            padding: '16px',
            border: `1px solid ${'#f59e0b'}`
          }}>
            <p style={{ ...txt(14, 400, C.navy) }}>
              {report.content}
            </p>
          </div>
        </div>

        <div style={{
          padding: '20px 28px',
          borderTop: `1px solid ${C.border}`,
          ...flex('center'),
          justifyContent: 'flex-end',
          gap: 12
        }}>
          {report.status === 'pending' && (
            <>
              <button onClick={onClose} style={{
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
              <button onClick={onReject} style={{
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
              <button onClick={onApprove} style={{
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
                <CheckCircle size={16} /> Chấp nhận
              </button>
            </>
          )}

          {(report.status === 'approved' || report.status === 'rejected') && (
            <button onClick={onClose} style={{
              padding: '10px 20px',
              borderRadius: 8,
              border: 'none',
              background: C.blue,
              color: C.white,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer'
            }}>
              Đóng
            </button>
          )}
        </div>
      </div>
    </>
  );
};

const ApproveConfirmModal = ({ open, onClose, onConfirm, report }) => {
  if (!open || !report) return null;

  return (
    <>
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1002
      }} />
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 1003,
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
          background: C.greenBg,
          margin: '0 auto 20px',
          ...flex('center'),
          justifyContent: 'center'
        }}>
          <CheckCircle size={32} color={C.green} />
        </div>
        <h2 style={{ ...txt(22, 700), marginBottom: 12 }}>Xác nhận chấp nhận</h2>
        <p style={{ ...txt(15, 400, C.gray), marginBottom: 24 }}>
          Bạn có chắc chắn muốn chấp nhận báo cáo "<strong>{report.id}</strong>"? 
          Tin tuyển dụng liên quan sẽ bị xóa khỏi hệ thống.
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
            background: C.green,
            color: C.white,
            fontSize: 15,
            fontWeight: 600,
            cursor: 'pointer'
          }}>
            Chấp nhận
          </button>
        </div>
      </div>
    </>
  );
};

const RejectConfirmModal = ({ open, onClose, onConfirm, report }) => {
  if (!open || !report) return null;

  return (
    <>
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1002
      }} />
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 1003,
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
          <XCircle size={32} color={C.red} />
        </div>
        <h2 style={{ ...txt(22, 700), marginBottom: 12 }}>Xác nhận từ chối</h2>
        <p style={{ ...txt(15, 400, C.gray), marginBottom: 24 }}>
          Bạn có chắc chắn muốn từ chối báo cáo "<strong>{report.id}</strong>"? 
          Báo cáo sẽ bị đánh dấu là không hợp lệ.
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
            Từ chối
          </button>
        </div>
      </div>
    </>
  );
};

export default function ReportsManagementPage() {
    const [reports, setReports] = useState([
    {
      id: 'RPT-001',
      jobId: 'JOB-2025-001',
      jobTitle: 'Nhân viên phục vụ part-time',
      company: 'The Coffee House',
      reporterName: 'Nguyễn Văn A',
      reporterPhone: '0912345678',
      reporterAddress: 'Quận 1, TP.HCM',
      reporterEmail: 'nguyenvana@email.com',
      reportTime: '23/01/2025 14:30',
      status: 'pending',
      statusLabel: 'Đang xem xét',
      statusColor: C.yellowBg,
      statusText: '#f59e0b',
      content: 'Công ty yêu cầu đặt cọc 2 triệu đồng trước khi làm việc. Tôi nghi ngờ đây là lừa đảo.'
    },
    {
      id: 'RPT-002',
      jobId: 'JOB-2025-002',
      jobTitle: 'Nhân viên phục vụ part-time',
      company: 'The Coffee House',
      reporterName: 'Nguyễn Văn A',
      reporterPhone: '0912345678',
      reporterAddress: 'Quận 1, TP.HCM',
      reporterEmail: 'nguyenvana@email.com',
      reportTime: '23/01/2025 14:30',
      status: 'approved',
      statusLabel: 'Chấp nhận',
      statusColor: C.greenBg,
      statusText: C.green,
      content: 'Tin tuyển dụng có nội dung không phù hợp với chính sách.'
    },
    {
      id: 'RPT-003',
      jobId: 'JOB-2025-003',
      jobTitle: 'Nhân viên phục vụ part-time',
      company: 'The Coffee House',
      reporterName: 'Nguyễn Văn A',
      reporterPhone: '0912345678',
      reporterAddress: 'Quận 1, TP.HCM',
      reporterEmail: 'nguyenvana@email.com',
      reportTime: '23/01/2025 14:30',
      status: 'approved',
      statusLabel: 'Chấp nhận',
      statusColor: C.greenBg,
      statusText: C.green,
      content: 'Thông tin không chính xác.'
    },
    {
      id: 'RPT-004',
      jobId: 'JOB-2025-004',
      jobTitle: 'Nhân viên phục vụ part-time',
      company: 'The Coffee House',
      reporterName: 'Nguyễn Văn A',
      reporterPhone: '0912345678',
      reporterAddress: 'Quận 1, TP.HCM',
      reporterEmail: 'nguyenvana@email.com',
      reportTime: '23/01/2025 14:30',
      status: 'approved',
      statusLabel: 'Chấp nhận',
      statusColor: C.greenBg,
      statusText: C.green,
      content: 'Vi phạm quy định.'
    },
    {
      id: 'RPT-005',
      jobId: 'JOB-2025-005',
      jobTitle: 'Nhân viên phục vụ part-time',
      company: 'The Coffee House',
      reporterName: 'Nguyễn Văn A',
      reporterPhone: '0912345678',
      reporterAddress: 'Quận 1, TP.HCM',
      reporterEmail: 'nguyenvana@email.com',
      reportTime: '23/01/2025 14:30',
      status: 'rejected',
      statusLabel: 'Từ chối',
      statusColor: C.redBg,
      statusText: C.red,
      content: 'Báo cáo không có cơ sở.'
    }
  ]);
  const [activeTab, setActiveTab] = useState('all');
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [page, setPage] = useState(1);
  const displayReports = activeTab === "all" ? reports : reports.filter(report => report.status === activeTab);
  const rowsPerPage = 5;
  const total = displayReports.length;
  const totalPages = Math.ceil(total / rowsPerPage);
  const start = (page - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  const currentReports = displayReports.slice(start, end);

  const stats = [
    { icon: ClipboardList, label: 'Tổng báo cáo', value: reports.length },
    { icon: Clock, label: 'Đang xem xét', value: reports.filter(r => r.status === 'pending').length },
    { icon: CheckCircle, label: 'Chấp nhận', value: reports.filter(r => r.status === 'approved').length },
    { icon: XCircle, label: 'Từ chối', value: reports.filter(r => r.status === 'rejected').length }
  ];

  const tabs = [
    { id: 'all', label: 'Tất cả', count: reports.length },
    { id: 'pending', label: 'Xem xét', count: reports.filter(r => r.status === 'pending').length },
    { id: 'approved', label: 'Chấp nhận', count: reports.filter(r => r.status === 'approved').length },
    { id: 'rejected', label: 'Từ chối', count: reports.filter(r => r.status === 'rejected').length }
  ];
  
  const handleApproveConfirm = () => {
    if (selectedReport) {
      setReports(reports.map(r => 
        r.id === selectedReport.id 
          ? { ...r, status: 'approved', statusLabel: 'Chấp nhận', statusColor: C.greenBg, statusText: C.green }
          : r
      ));
      setApproveModalOpen(false);
      setViewModalOpen(false);
    }
  };
  
  const handleRejectConfirm = () => {
    if (selectedReport) {
      setReports(reports.map(r => 
        r.id === selectedReport.id 
          ? { ...r, status: 'rejected', statusLabel: 'Từ chối', statusColor: C.redBg, statusText: C.red }
          : r
      ));
      setRejectModalOpen(false);
      setViewModalOpen(false);
    }
  };

  return (
    <div style={{
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      background: C.grayBg,
      minHeight: '100vh'
    }}>
      <main style={{ marginLeft: 220, padding: '40px 48px' }}>
        <h1 style={{ ...txt(32, 700), marginBottom: 32 }}>Báo cáo</h1>

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
                placeholder="Tìm kiếm theo tiêu đề, người báo cáo..."
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

        <div style={{
          background: C.white,
          borderRadius: 16,
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          {displayReports.length > 0 ? (
            <>
              <div style={{
                padding: '20px 24px',
                borderBottom: `1px solid ${C.border}`
              }}>
                <h2 style={{ ...txt(18, 700) }}>
                  Danh sách báo cáo ({displayReports.length})
                </h2>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: C.grayBg }}>
                    {['ID', 'TIN TUYỂN DỤNG', 'NGƯỜI BÁO CÁO', 'THỜI GIAN', 'TRẠNG THÁI', 'THAO TÁC'].map(h => (
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
                  {currentReports.map(report => (
                    <tr key={report.id} style={{ borderTop: `1px solid ${C.border}` }}>
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{ ...txt(13, 600, C.blue) }}>{report.id}</span>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <div>
                          <p style={{ ...txt(14, 600), marginBottom: 2 }}>{report.jobTitle}</p>
                          <p style={{ ...txt(12, 400, C.gray) }}>{report.company}</p>
                        </div>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{ ...txt(14, 400) }}>{report.reporterName}</span>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{ ...txt(14, 400) }}>{report.reportTime}</span>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{
                          padding: '6px 14px',
                          borderRadius: 16,
                          background: report.statusColor,
                          color: report.statusText,
                          fontSize: 13,
                          fontWeight: 600
                        }}>
                          {report.statusLabel}
                        </span>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ ...flex('center'), gap: 8 }}>
                          <button
                            onClick={() => {
                              setSelectedReport(report);
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
                          {report.status === 'pending' && (
                            <>
                              <button
                                onClick={() => {
                                  setSelectedReport(report);
                                  setRejectModalOpen(true);
                                }}
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
                                <X size={18} color={C.white} />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedReport(report);
                                  setApproveModalOpen(true);
                                }}
                                style={{
                                  width: 36,
                                  height: 36,
                                  borderRadius: 8,
                                  border: 'none',
                                  background: C.green,
                                  cursor: 'pointer',
                                  ...flex('center'),
                                  justifyContent: 'center'
                                }}
                              >
                                <CheckCircle size={18} color={C.white} />
                              </button>
                            </>
                          )}
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
                  Hiển thị {start + 1}-{Math.min(end, total)} trong tổng số {total} báo cáo
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
                <AlertTriangle size={56} color={C.grayLight} />
              </div>
              <h3 style={{ ...txt(20, 600), marginBottom: 8 }}>
                Chưa có báo cáo nào
              </h3>
              <p style={{
                ...txt(15, 400, C.gray),
                maxWidth: 400,
                margin: '0 auto 24px'
              }}>
                Danh sách báo cáo sẽ xuất hiện tại đây khi có người dùng gửi báo cáo về tin tuyển dụng.
              </p>
            </div>
          )}
        </div>
      </main>

      <ReportDetailModal
        open={viewModalOpen}
        onClose={() => {
          setViewModalOpen(false);
          setSelectedReport(null);
        }}
        report={selectedReport}
        onApprove={() => setApproveModalOpen(true)}
        onReject={() => setRejectModalOpen(true)}
      />

      <ApproveConfirmModal
        open={approveModalOpen}
        onClose={() => setApproveModalOpen(false)}
        onConfirm={handleApproveConfirm}
        report={selectedReport}
      />

      <RejectConfirmModal
        open={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        onConfirm={handleRejectConfirm}
        report={selectedReport}
      />
    </div>
  );
}