import { useState } from 'react';
import {
  Building2, CreditCard, Search, Eye, Edit, Trash2,
  Plus, RefreshCw, X, MapPin, Briefcase, GraduationCap,
  Clock, CheckCircle, XCircle, AlertCircle, Calendar,
  TrendingUp, PauseCircle, Hourglass
} from 'lucide-react';
import { flex, txt } from '../utils/styles';
import { COLORS } from '../constants/colors';
import { pageBtnStyle } from '../constants/pageBtnStyle';
const C = COLORS;

const RenewJobModal = ({ open, onClose }) => {
  const [paymentMethod, setPaymentMethod] = useState('bank');

  if (!open) return null;

  return (
    <>
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000
      }} />
      <div style={{
        position: 'fixed', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 1001, width: '100%', maxWidth: 520,
        background: C.white, borderRadius: 16,
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        <div style={{
          ...flex('center'), justifyContent: 'space-between',
          padding: '24px 28px', borderBottom: `1px solid ${C.border}`
        }}>
          <div>
            <h2 style={{ ...txt(22, 700), marginBottom: 5 }}>Làm mới tin tuyển dụng</h2>
            <p style={{ ...txt(14, 400, C.gray) }}>Xác nhận thông tin thanh toán</p>
          </div>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: 4
          }}>
            <X size={24} color={C.gray} />
          </button>
        </div>

        <div style={{ padding: '24px 28px' }}>
          <div style={{
            background: C.grayBg, borderRadius: 12, padding: '16px 20px', marginBottom: 24
          }}>
            <h3 style={{ ...txt(14, 700, C.gray), textTransform: 'uppercase', marginBottom: 12 }}>
              CHI TIẾT THANH TOÁN
            </h3>
            <div style={{ ...flex('center'), justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ ...txt(14, 400, C.gray) }}>Thời hạn mở rộng</span>
              <span style={{ ...txt(14, 600) }}>+15 ngày</span>
            </div>
            <div style={{ ...flex('center'), justifyContent: 'space-between' }}>
              <span style={{ ...txt(14, 400, C.gray) }}>Ngày hết hạn mới</span>
              <span style={{ ...txt(14, 600) }}>20/4/2026</span>
            </div>
          </div>

          <div style={{
            background: `linear-gradient(135deg, ${C.purple}, ${C.purpleLight})`,
            borderRadius: 12, padding: '16px 20px', marginBottom: 24,
            ...flex('center'), justifyContent: 'space-between'
          }}>
            <span style={{ ...txt(16, 600, C.white) }}>Tổng thanh toán</span>
            <span style={{ ...txt(24, 700, C.white) }}>50.000đ</span>
          </div>

          <h3 style={{ ...txt(16, 700), marginBottom: 16 }}>Phương thức thanh toán</h3>
          {[
            { id: 'bank', label: 'Chuyển khoản ngân hàng', icon: Building2 },
            { id: 'wallet', label: 'Ví điện tử (Momo, ZaloPay)', icon: CreditCard },
            { id: 'card', label: 'Thẻ tín dụng/Ghi nợ', icon: CreditCard }
          ].map(method => (
            <div
              key={method.id}
              onClick={() => setPaymentMethod(method.id)}
              style={{
                ...flex('center'), gap: 12, padding: '14px 16px',
                border: `2px solid ${paymentMethod === method.id ? C.blue : C.border}`,
                borderRadius: 10, marginBottom: 12, cursor: 'pointer',
                background: paymentMethod === method.id ? C.blueLight : C.white,
                transition: 'all 0.2s'
              }}
            >
              <div style={{
                width: 20, height: 20, borderRadius: '50%',
                border: `2px solid ${paymentMethod === method.id ? C.blue : C.border}`,
                ...flex('center'), justifyContent: 'center',
                background: C.white
              }}>
                {paymentMethod === method.id && (
                  <div style={{
                    width: 12, height: 12, borderRadius: '50%', background: C.blue
                  }} />
                )}
              </div>
              <method.icon size={20} color={C.navy} />
              <span style={{ ...txt(14, 500) }}>{method.label}</span>
            </div>
          ))}
        </div>

        <div style={{
          padding: '20px 28px', borderTop: `1px solid ${C.border}`,
          ...flex('center'), justifyContent: 'flex-end', gap: 12
        }}>
          <button onClick={onClose} style={{
            padding: '12px 28px', borderRadius: 10,
            border: `1px solid ${C.border}`, background: C.white,
            color: C.navy, fontSize: 15, fontWeight: 600, cursor: 'pointer'
          }}>
            Hủy
          </button>
          <button style={{
            padding: '12px 28px', borderRadius: 10, border: 'none',
            background: C.blue, color: C.white,
            fontSize: 15, fontWeight: 600, cursor: 'pointer'
          }}>
            Xác nhận thanh toán
          </button>
        </div>
      </div>
    </>
  );
};

const ViewJobModal = ({ open, onClose, job }) => {
  if (!open) return null;

  const statusConfig = {
    active: {
      badge: { bg: C.greenBg, text: C.green, label: 'Đang hoạt động', icon: CheckCircle }
    },
    pending: {
      badge: { bg: C.blueLight, text: C.blue, label: 'Chờ duyệt', icon: Clock }
    },
    paused: {
      badge: { bg: C.yellowBg, text: '#f59e0b', label: 'Tạm dừng', icon: PauseCircle }
    },
    expired: {
      badge: { bg: C.grayBg, text: C.gray, label: 'Hết hạn', icon: Clock }
    },
    rejected: {
      badge: { bg: C.redBg, text: C.red, label: 'Từ chối duyệt', icon: XCircle },
      showRejectionReason: true,
      rejectionReason: 'Mô tả công việc không rõ ràng, thiếu nhất quán với các yêu cầu.'
    }
  };

  const config = statusConfig[job.detailedStatus];
  const StatusIcon = config.badge.icon;

  return (
    <>
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000
      }} />
      <div style={{
        position: 'fixed', inset: 0, zIndex: 1001,
        ...flex('center'), justifyContent: 'center', padding: 24, overflowY: 'auto'
      }}>
        <div style={{
          background: C.white, borderRadius: 20,
          width: '100%', maxWidth: 1100,
          maxHeight: '90vh', overflowY: 'auto',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
        }}>
          <div style={{
            background: `linear-gradient(135deg, ${C.purple}, ${C.purpleLight})`,
            borderRadius: '20px 20px 0 0', padding: '28px 32px'
          }}>
            <div style={{ ...flex('center'), justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ ...flex('center'), gap: 12 }}>
                <span style={{
                  padding: '6px 16px', borderRadius: 20,
                  background: 'rgba(255,255,255,0.2)',
                  color: C.white, fontSize: 14, fontWeight: 600
                }}>
                  <Calendar size={14} style={{ display: 'inline', marginRight: 6 }} />
                  Ngày đăng: {job.createdDate} • Hết hạn: {job.expiryDate}
                </span>
                <span style={{
                  padding: '6px 16px', borderRadius: 20,
                  background: config.badge.bg,
                  color: config.badge.text,
                  fontSize: 13, fontWeight: 600,
                  ...flex('center'), gap: 6
                }}>
                  <StatusIcon size={14} /> {config.badge.label}
                </span>
              </div>
              <button onClick={onClose} style={{
                width: 36, height: 36, borderRadius: '50%',
                background: 'rgba(255,255,255,0.2)',
                border: 'none', cursor: 'pointer',
                ...flex('center'), justifyContent: 'center'
              }}>
                <X size={20} color={C.white} />
              </button>
            </div>
            <h2 style={{ ...txt(28, 700, C.white), marginBottom: 12 }}>{job.title}</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              {[
                { icon: MapPin, label: 'Địa điểm', value: job.location },
                { icon: Briefcase, label: 'Mức lương', value: job.salary },
                { icon: GraduationCap, label: 'Kinh nghiệm', value: job.experience }
              ].map(({ icon: Icon, label, value }, i) => (
                <div key={i} style={{
                  background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)',
                  borderRadius: 12, padding: '12px 16px'
                }}>
                  <div style={{ ...flex('center'), gap: 6, marginBottom: 4 }}>
                    <Icon size={14} color={C.white} />
                    <span style={{ ...txt(12, 500, C.white), opacity: 0.9 }}>{label}</span>
                  </div>
                  <p style={{ ...txt(14, 700, C.white) }}>{value}</p>
                </div>
              ))}
            </div>
          </div>

          <div style={{ padding: '32px', display: 'grid', gridTemplateColumns: '1fr 400px', gap: 32 }}>
            <div>
              {['Mô tả công việc', 'Yêu cầu ứng viên', 'Thời gian làm việc', 'Quyền lợi'].map((section, idx) => (
                <div key={idx} style={{ marginBottom: 32 }}>
                  <h3 style={{ ...txt(18, 700), marginBottom: 12 }}>{section}</h3>
                  <div style={{ background: C.grayBg, borderRadius: 12, padding: '16px' }}>
                    <ul style={{ margin: 0, paddingLeft: 20 }}>
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
            </div>

            <div>
              <h3 style={{ ...txt(18, 700), marginBottom: 16 }}>Thông tin chung</h3>
                {[
                { label: 'SỐ LƯỢNG TUYỂN', value: '3 người' },
                { label: 'HẠN NỘP HỒ SƠ', value: '30/01/2025' },
                { label: 'CẤP BẬC', value: 'Nhân viên' },
                { label: 'HỌC VẤN', value: 'Cấp 3 trở lên' }
                ].map(({ label, value }, i, arr) => (
                <div
                    key={i}
                    style={{
                    paddingBottom: i === arr.length - 1 ? 0 : 16,
                    marginBottom: i === arr.length - 1 ? 0 : 16,
                    borderBottom: i === arr.length - 1 ? 'none' : `1px solid ${C.border}`
                    }}
                >
                  <p style={{ ...txt(11, 700, C.grayLight), textTransform: 'uppercase', marginBottom: 6 }}>
                    {label}
                  </p>
                  <p style={{ ...txt(14, 600) }}>{value}</p>
                </div>
              ))}

              {config.showRejectionReason && (
                <div style={{ marginTop: 24 }}>
                  <h3 style={{ ...txt(18, 700), marginBottom: 12, ...flex('center'), gap: 8 }}>
                    <AlertCircle size={20} color={C.red} /> Lí do bị từ chối
                  </h3>
                  <div style={{
                    background: C.redBg, borderRadius: 12, padding: 16,
                    border: `1px solid ${C.red}`
                  }}>
                    <p style={{ ...txt(14, 400, C.red) }}>
                      {config.rejectionReason}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div style={{
            padding: '20px 32px', borderTop: `1px solid ${C.border}`,
            ...flex('center'), justifyContent: 'flex-end'
          }}>
            <button onClick={onClose} style={{
              padding: '12px 32px', borderRadius: 10, border: 'none',
              background: C.blue, color: C.white,
              fontSize: 15, fontWeight: 600, cursor: 'pointer'
            }}>
              Đóng
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

const JobFormModal = ({ open, onClose, job, isEdit }) => {
  if (!open) return null;

  return (
    <>
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000
      }} />
      <div style={{
        position: 'fixed', inset: 0, zIndex: 1001,
        ...flex('center'), justifyContent: 'center', padding: 24, overflowY: 'auto'
      }}>
        <div style={{
          background: C.white, borderRadius: 16,
          width: '100%', maxWidth: 900,
          maxHeight: '90vh', overflowY: 'auto',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
        }}>
          <div style={{
            ...flex('center'), justifyContent: 'space-between',
            padding: '24px 32px', borderBottom: `1px solid ${C.border}`
          }}>
            <h2 style={{ ...txt(24, 700) }}>
              {isEdit ? 'Sửa tin tuyển dụng' : 'Đăng tin tuyển dụng'}
            </h2>
            <button onClick={onClose} style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: 4
            }}>
              <X size={24} color={C.gray} />
            </button>
          </div>

          <div style={{ padding: '24px 32px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
              {[
                { label: 'Tiêu đề tin tuyển dụng', placeholder: 'Nhập tiêu đề tin tuyển dụng', required: true, value: isEdit ? job?.title : '' },
                { label: 'Ngành nghề', type: 'select', options: ['F&B', 'Bán hàng', 'Giáo dục'], value: isEdit ? 'F&B' : '' },
                { label: 'Kinh nghiệm yêu cầu', type: 'select', options: ['Không yêu cầu', '1 năm', '2 năm'], value: isEdit ? job?.experience : '' },
                { label: 'Địa điểm làm việc', type: 'select', options: ['TP. Hồ Chí Minh', 'Hà Nội'], value: isEdit ? 'TP. Hồ Chí Minh' : '' },
                { label: 'Quận/Huyện', type: 'select', options: ['Quận 1', 'Quận 2', 'Quận 3'], value: isEdit ? 'Quận 3' : '' },
                { label: 'Số lượng cần tuyển', type: 'number', required: true, value: isEdit ? '3' : '' },
                { label: 'Mức lương tối thiểu (đồng/giờ)', type: 'number', required: true, value: isEdit ? '50000' : '' },
                { label: 'Mức lương tối đa (đồng/giờ)', type: 'number', required: true, value: isEdit ? '50000' : '' },
                { label: 'Hạn nộp hồ sơ', type: 'date', value: isEdit ? '' : '' },
                { label: 'Trình độ học vấn', type: 'select', options: ['Không yêu cầu', 'THPT', 'Cao đẳng'], value: isEdit ? 'Không yêu cầu' : '' },
                { label: 'Cấp bậc', type: 'select', options: ['Nhân viên', 'Trưởng nhóm'], value: isEdit ? 'Nhân viên' : '', fullWidth: true }
              ].map((field, i) => (
                <div key={i} style={{ gridColumn: field.fullWidth ? '1 / -1' : 'auto' }}>
                  <label style={{ ...txt(14, 600), display: 'block', marginBottom: 8 }}>
                    {field.label} {field.required && <span style={{ color: C.red }}>*</span>}
                  </label>
                  {field.type === 'select' ? (
                    <select defaultValue={field.value} style={{
                      width: '100%', padding: '10px 14px', borderRadius: 8,
                      border: `1px solid ${C.border}`, fontSize: 14, outline: 'none', appearance: 'none',
                      background: `${C.white} url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2364748b' d='M6 9L1 4h10z'/%3E%3C/svg%3E") no-repeat right 14px center`
                    }}>
                      {field.options.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={field.type || 'text'}
                      defaultValue={field.value}
                      placeholder={field.placeholder}
                      style={{
                        width: '100%', padding: '10px 14px', borderRadius: 8,
                        border: `1px solid ${C.border}`, fontSize: 14, outline: 'none'
                      }}
                    />
                  )}
                </div>
              ))}
            </div>

            {['Mô tả công việc', 'Yêu cầu ứng viên', 'Thời gian làm việc', 'Quyền lợi'].map((field, i) => (
              <div key={i} style={{ marginBottom: 20 }}>
                <label style={{ ...txt(14, 600), display: 'block', marginBottom: 8 }}>
                  {field} <span style={{ color: C.red }}>*</span>
                </label>
                <textarea
                  placeholder={`Nhập ${field.toLowerCase()}`}
                  defaultValue={isEdit ? 'Sample content...' : ''}
                  style={{
                    width: '100%', minHeight: 100, padding: '12px', borderRadius: 8,
                    border: `1px solid ${C.border}`, fontSize: 14, fontFamily: 'inherit',
                    resize: 'vertical', outline: 'none'
                  }}
                />
              </div>
            ))}
          </div>

          <div style={{
            padding: '20px 32px', borderTop: `1px solid ${C.border}`,
            ...flex('center'), justifyContent: 'flex-end', gap: 12
          }}>
            <button onClick={onClose} style={{
              padding: '12px 28px', borderRadius: 10,
              border: `1px solid ${C.border}`, background: C.white,
              color: C.navy, fontSize: 15, fontWeight: 600, cursor: 'pointer'
            }}>
              Hủy
            </button>
            <button style={{
              padding: '12px 28px', borderRadius: 10, border: 'none',
              background: C.blue, color: C.white,
              fontSize: 15, fontWeight: 600, cursor: 'pointer'
            }}>
              {isEdit ? 'Lưu thay đổi' : 'Đăng tin'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

const DeleteConfirmModal = ({ open, onClose, onConfirm, jobTitle }) => {
  if (!open) return null;

  return (
    <>
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000
      }} />
      <div style={{
        position: 'fixed', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 1001, width: '100%', maxWidth: 480,
        background: C.white, borderRadius: 16,
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        padding: 32, textAlign: 'center'
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          background: C.redBg, margin: '0 auto 20px',
          ...flex('center'), justifyContent: 'center'
        }}>
          <Trash2 size={32} color={C.red} />
        </div>
        <h2 style={{ ...txt(22, 700), marginBottom: 12 }}>Xác nhận xóa</h2>
        <p style={{ ...txt(15, 400, C.gray), marginBottom: 24 }}>
          Bạn có chắc chắn muốn xóa tin tuyển dụng "<strong>{jobTitle}</strong>"? 
          Hành động này không thể hoàn tác.
        </p>
        <div style={{ ...flex('center'), justifyContent: 'center', gap: 12 }}>
          <button onClick={onClose} style={{
            padding: '12px 28px', borderRadius: 10,
            border: `1px solid ${C.border}`, background: C.white,
            color: C.navy, fontSize: 15, fontWeight: 600, cursor: 'pointer'
          }}>
            Hủy
          </button>
          <button onClick={onConfirm} style={{
            padding: '12px 28px', borderRadius: 10, border: 'none',
            background: C.red, color: C.white,
            fontSize: 15, fontWeight: 600, cursor: 'pointer'
          }}>
            Xóa tin
          </button>
        </div>
      </div>
    </>
  );
};

export default function JobManagementPage() {
  const jobs = [
    {
      id: 1,
      title: 'Nhân viên Phục vụ',
      status: 'active',
      detailedStatus: 'active',
      statusLabel: 'Đang hoạt động',
      statusColor: C.greenBg,
      statusText: C.green,
      createdDate: '15/10/2025',
      expiryDate: '30/10/2025',
      location: 'Quận 3, TP.HCM',
      salary: '80.000 - 150.000 VNĐ/giờ',
      experience: 'Không yêu cầu',
      enabled: true,
      canToggle: true
    },
    {
      id: 2,
      title: 'Gia sư Toán - Lý',
      status: 'pending',
      detailedStatus: 'pending',
      statusLabel: 'Chờ duyệt',
      statusColor: C.blueLight,
      statusText: C.blue,
      createdDate: '10/10/2025',
      expiryDate: '25/10/2025',
      location: 'Online/Offline',
      salary: '100.000 - 200.000 VNĐ/giờ',
      experience: '1 năm',
      enabled: false,
      canToggle: false
    },
    {
      id: 3,
      title: 'Content Creator',
      status: 'expired',
      detailedStatus: 'expired',
      statusLabel: 'Hết hạn',
      statusColor: C.grayBg,
      statusText: C.gray,
      createdDate: '10/10/2025',
      expiryDate: '25/10/2025',
      location: 'Quận 1, TP.HCM',
      salary: '80.000 - 150.000 VNĐ/giờ',
      experience: 'Không yêu cầu',
      enabled: false,
      canToggle: false,
      showRenew: true
    },
    {
      id: 4,
      title: 'Nhân viên Bán hàng',
      status: 'rejected',
      detailedStatus: 'rejected',
      statusLabel: 'Từ chối duyệt',
      statusColor: C.redBg,
      statusText: C.red,
      createdDate: '15/10/2025',
      expiryDate: '30/10/2025',
      location: 'Quận 1, TP.HCM',
      salary: '50.000 - 80.000 VNĐ/giờ',
      experience: 'Không yêu cầu',
      enabled: false,
      canToggle: false
    },
    {
      id: 5,
      title: 'Barista Part-time',
      status: 'paused',
      detailedStatus: 'paused',
      statusLabel: 'Tạm dừng',
      statusColor: C.yellowBg,
      statusText: '#f59e0b',
      createdDate: '10/10/2025',
      expiryDate: '25/10/2025',
      location: 'Quận 3, TP.HCM',
      salary: '60.000 - 90.000 VNĐ/giờ',
      experience: 'Không yêu cầu',
      enabled: true,
      canToggle: true
    }
  ];

  const [selectedJobs, setSelectedJobs] = useState([]);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [renewModalOpen, setRenewModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [page, setPage] = useState(1);
  const rowsPerPage = 5;
  const total = jobs.length;
  const totalPages = Math.ceil(total / rowsPerPage);
  const start = (page - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  const currentJobs = jobs.slice(start, end);

  const stats = [
    { icon: Briefcase, label: 'Tổng tin đăng', value: 24, bgColor: C.grayBg },
    { icon: TrendingUp, label: 'Đang hoạt động', value: 18, bgColor: C.greenBg },
    { icon: Hourglass, label: 'Chờ duyệt', value: 3, bgColor: C.blueLight },
    { icon: PauseCircle, label: 'Tạm dừng', value: 4, bgColor: C.yellowBg },
    { icon: Clock, label: 'Hết hạn', value: 2, bgColor: C.grayBg },
    { icon: XCircle, label: 'Từ chối duyệt', value: 2, bgColor: C.redBg }
  ];

  const displayJobs = jobs;

  const handleCheckJob = (jobId) => {
    if (selectedJobs.includes(jobId)) {
      setSelectedJobs(selectedJobs.filter(id => id !== jobId));
    } else {
      setSelectedJobs([...selectedJobs, jobId]);
    }
  };

  const handleDeleteSelected = () => {
    console.log('Deleting jobs:', selectedJobs);
    setSelectedJobs([]);
  };

  return (
    <div style={{
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      background: C.grayBg, minHeight: '100vh'
    }}>
      <main style={{ padding: '40px 48px' }}>
        <div style={{ ...flex('center'), justifyContent: 'space-between', marginBottom: 32 }}>
          <h1 style={{ ...txt(32, 700) }}>Tin tuyển dụng</h1>
          <button
            onClick={() => setCreateModalOpen(true)}
            style={{
              padding: '12px 24px', borderRadius: 10,
              border: 'none', background: C.purple,
              color: C.white, fontSize: 15, fontWeight: 600,
              cursor: 'pointer', ...flex('center'), gap: 8
            }}
          >
            <Plus size={18} /> Tạo tin mới
          </button>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(6, 1fr)',
          gap: 20,
          marginBottom: 32
        }}>
          {stats.map((stat, i) => (
            <div key={i} style={{
              background: C.white,
              borderRadius: 16,
              border: `1px solid ${C.border}`,
              padding: '20px',
              ...flex('flex-start', 'column'),
              gap: 12
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: 12,
                background: stat.bgColor,
                ...flex('center'), justifyContent: 'center'
              }}>
                <stat.icon size={24} color={C.navy} />
              </div>
              <div>
                <p style={{ ...txt(13, 500, C.gray), marginBottom: 4 }}>{stat.label}</p>
                <p style={{ ...txt(28, 700) }}>{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div style={{
          background: C.white,
          borderRadius: 16,
          border: `1px solid ${C.border}`,
          padding: '20px 24px',
          marginBottom: 24,
          ...flex('center'),
          gap: 16
        }}>
          <div style={{
            ...flex('center'), gap: 10, flex: 1,
            padding: '10px 14px', borderRadius: 8,
            border: `1px solid ${C.border}`
          }}>
            <Search size={18} color={C.gray} />
            <input
              placeholder="Tìm kiếm tin tuyển dụng"
              style={{
                border: 'none', outline: 'none',
                fontSize: 14, flex: 1, background: 'transparent'
              }}
            />
          </div>
          <select style={{
            padding: '10px 14px', borderRadius: 8,
            border: `1px solid ${C.border}`,
            fontSize: 14, outline: 'none', cursor: 'pointer',
            minWidth: 180,
            appearance: 'none',
            background: `${C.white} url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2364748b' d='M6 9L1 4h10z'/%3E%3C/svg%3E") no-repeat right 14px center`
          }}>
            <option value="">Tất cả trạng thái</option>
            <option value="active">Đang hoạt động</option>
            <option value="expired">Hết hạn</option>
            <option value="paused">Tạm dừng</option>
            <option value="rejected">Từ chối</option>
          </select>
          <input type="date" style={{
            padding: '10px 14px', borderRadius: 8,
            border: `1px solid ${C.border}`,
            fontSize: 14, outline: 'none', minWidth: 150
          }} />
          <button style={{
            padding: '10px 32px', borderRadius: 8,
            border: 'none', background: C.purple,
            color: C.white, fontSize: 14, fontWeight: 600,
            cursor: 'pointer'
          }}>
            Lọc
          </button>
        </div>

        <div style={{
          background: C.white,
          borderRadius: 16,
          border: `1px solid ${C.border}`,
          overflow: 'hidden'
        }}>
          {currentJobs.length > 0 ? (
            <>
              <div style={{
                padding: '20px 24px',
                borderBottom: `1px solid ${C.border}`,
                ...flex('center'),
                justifyContent: 'space-between'
              }}>
                <h2 style={{ ...txt(18, 700) }}>Danh sách tin tuyển dụng ({displayJobs.length})</h2>
                {selectedJobs.length > 0 && (
                  <div style={{ ...flex('center'), gap: 8 }}>
                    <span style={{ ...txt(14, 500, C.gray) }}>Đã chọn: {selectedJobs.length}</span>
                    <button
                      onClick={handleDeleteSelected}
                      style={{
                        padding: '8px 16px', borderRadius: 8,
                        border: 'none', background: C.red,
                        color: C.white, fontSize: 13, fontWeight: 600,
                        cursor: 'pointer', ...flex('center'), gap: 6
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
                    {['TIN TUYỂN DỤNG', 'TRẠNG THÁI', 'NGÀY ĐĂNG', 'NGÀY HẾT HẠN', 'HIỂN THỊ', 'THAO TÁC'].map(h => (
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
                  {displayJobs.map(job => (
                <tr key={job.id} style={{ borderTop: `1px solid ${C.border}` }}>
                  <td style={{ padding: '16px 20px' }}>
                    <input
                      type="checkbox"
                      checked={selectedJobs.includes(job.id)}
                      onChange={() => handleCheckJob(job.id)}
                      style={{ cursor: 'pointer' }}
                    />
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <span style={{ ...txt(14, 600) }}>{job.title}</span>
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <span style={{
                      padding: '6px 14px', borderRadius: 16,
                      background: job.statusColor,
                      color: job.statusText,
                      fontSize: 13, fontWeight: 600
                    }}>
                      {job.statusLabel}
                    </span>
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <span style={{ ...txt(14, 400) }}>{job.createdDate}</span>
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <span style={{ ...txt(14, 400) }}>{job.expiryDate}</span>
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <label style={{
                      position: 'relative',
                      display: 'inline-block',
                      width: 44,
                      height: 24,
                      cursor: job.canToggle ? 'pointer' : 'not-allowed',
                      opacity: job.canToggle ? 1 : 0.5
                    }}>
                      <input
                        type="checkbox"
                        checked={job.enabled}
                        disabled={!job.canToggle}
                        style={{ display: 'none' }}
                      />
                      <div style={{
                        position: 'absolute',
                        inset: 0,
                        background: job.enabled ? C.green : C.gray,
                        borderRadius: 12,
                        transition: 'all 0.3s'
                      }} />
                      <div style={{
                        position: 'absolute',
                        top: 2,
                        left: job.enabled ? 22 : 2,
                        width: 20,
                        height: 20,
                        background: C.white,
                        borderRadius: '50%',
                        transition: 'all 0.3s'
                      }} />
                    </label>
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ ...flex('center'), gap: 8 }}>
                      <button
                        onClick={() => {
                          setSelectedJob(job);
                          setViewModalOpen(true);
                        }}
                        title="Xem chi tiết"
                        style={{
                          width: 36, height: 36, borderRadius: 8,
                          border: 'none', background: C.blue,
                          cursor: 'pointer',
                          ...flex('center'), justifyContent: 'center'
                        }}
                      >
                        <Eye size={18} color={C.white} />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedJob(job);
                          setEditModalOpen(true);
                        }}
                        title="Sửa"
                        style={{
                          width: 36, height: 36, borderRadius: 8,
                          border: 'none', background: C.green,
                          cursor: 'pointer',
                          ...flex('center'), justifyContent: 'center'
                        }}
                      >
                        <Edit size={18} color={C.white} />
                      </button>
                      {job.showRenew && (
                        <button
                          onClick={() => {
                            setSelectedJob(job);
                            setRenewModalOpen(true);
                          }}
                          title="Làm mới"
                          style={{
                            width: 36, height: 36, borderRadius: 8,
                            border: 'none', background: C.darkPurple,
                            cursor: 'pointer',
                            ...flex('center'), justifyContent: 'center'
                          }}
                        >
                          <RefreshCw size={18} color={C.white} />
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setSelectedJob(job);
                          setDeleteModalOpen(true);
                        }}
                        title="Xóa"
                        style={{
                          width: 36, height: 36, borderRadius: 8,
                          border: 'none', background: C.red,
                          cursor: 'pointer',
                          ...flex('center'), justifyContent: 'center'
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
                Hiển thị {start + 1}-{Math.min(end, total)} trong tổng số {total} tin tuyển dụng
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
            /* Empty State */
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
                <Briefcase size={56} color={C.grayLight} />
              </div>
              <h3 style={{ ...txt(20, 600), marginBottom: 8 }}>
                Chưa có tin tuyển dụng nào
              </h3>
              <p style={{ ...txt(15, 400, C.gray), marginBottom: 24, maxWidth: 420, margin: '0 auto 24px' }}>
                Bắt đầu đăng tin tuyển dụng đầu tiên của bạn để tìm kiếm ứng viên tiềm năng cho công ty.
              </p>
            </div>
          )}
        </div>
      </main>

      <ViewJobModal
        open={viewModalOpen}
        onClose={() => {
          setViewModalOpen(false);
          setSelectedJob(null);
        }}
        job={selectedJob}
      />

      <JobFormModal
        open={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedJob(null);
        }}
        job={selectedJob}
        isEdit={true}
      />

      <JobFormModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        isEdit={false}
      />

      <DeleteConfirmModal
        open={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedJob(null);
        }}
        onConfirm={() => {
          console.log('Deleted:', selectedJob);
          setDeleteModalOpen(false);
          setSelectedJob(null);
        }}
        jobTitle={selectedJob?.title}
      />

      <RenewJobModal
        open={renewModalOpen}
        onClose={() => {
          setRenewModalOpen(false);
          setSelectedJob(null);
        }}
        job={selectedJob}
      />
    </div>
  );
}