import { useState } from 'react';
import {
  FileText, MessageSquare, Search, Eye, MessageCircle, Briefcase,
  MapPin, GraduationCap, Download,
  X, CheckCircle, Clock, AlertCircle, Info, Coffee, Monitor
} from 'lucide-react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import { flex, txt } from '../utils/styles';
import { COLORS } from '../constants/colors';
const C = COLORS;

const ApplicationModal = ({ open, onClose }) => {
  if (!open) return null;

  return (
    <>
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000
      }} />
      <div style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        ...flex('center', 'column'), justifyContent: 'center', padding: 24
      }}>
        <div style={{
          background: C.white, borderRadius: 20,
          width: '100%', maxWidth: 960,
          maxHeight: '90vh', overflowY: 'auto',
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #6366f1, #ec4899)',
            borderRadius: '20px 20px 0 0',
            padding: '28px 32px',
            position: 'relative'
          }}>
            <div style={{
                ...flex('center'),
                justifyContent: 'space-between',
                marginBottom: 12
            }}>
            <div style={{ ...flex('center'), gap: 12 }}>
                <span
                style={{
                    padding: '6px 16px',
                    borderRadius: 20,
                    background: C.greenBg,
                    color: C.green,
                    fontSize: 13,
                    fontWeight: 600,
                    ...flex('center'),
                    gap: 6
                }}
                >
                <FontAwesomeIcon icon={faCheckCircle} />
                Đã chấp nhận
                </span>
            </div>

            <button
                onClick={onClose}
                style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                cursor: 'pointer',
                ...flex('center'),
                justifyContent: 'center',
                flexShrink: 0
                }}
            >
                <X size={20} color={C.white} />
            </button>
            </div>
            <h2 style={{ ...txt(28, 700, C.white), marginBottom: 8 }}>
              Nhân viên Phục vụ Part-time
            </h2>
            <div style={{ ...flex('center'), gap: 6 }}>
              <Briefcase size={18} color={C.white} />
              <span style={{ ...txt(16, 500, C.white) }}>The Coffee House</span>
              <FontAwesomeIcon icon={faCheckCircle} color={C.white} />
            </div>

            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 16, marginTop: 24
            }}>
              {[
                { label: 'Địa điểm', value: 'Quận 3, TP.HCM', icon: MapPin },
                { label: 'Mức lương', value: '80.000 - 150.000 VNĐ/giờ', icon: Briefcase },
                { label: 'Kinh nghiệm', value: 'Không yêu cầu', icon: GraduationCap }
              ].map(({ label, value, icon: Icon }, i) => (
                <div key={i} style={{
                  background: 'rgba(255,255,255,0.15)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: 12, padding: '14px 16px'
                }}>
                  <div style={{ ...flex('center'), gap: 8, marginBottom: 6 }}>
                    <Icon size={16} color={C.white} />
                    <span style={{ ...txt(13, 500, C.white), opacity: 0.9 }}>
                      {label}
                    </span>
                  </div>
                  <p style={{ ...txt(16, 700, C.white) }}>{value}</p>
                </div>
              ))}
            </div>
          </div>

          <div style={{ padding: '32px', display: 'grid', gridTemplateColumns: '1fr 380px', gap: 32 }}>
            <div>
              <h3 style={{ ...txt(20, 700), marginBottom: 20, ...flex('center'), gap: 8 }}>
                <Clock size={22} /> Tiến trình ứng tuyển
              </h3>
              <div style={{ marginBottom: 32 }}>
                {[
                  {
                    title: 'Nộp hồ sơ',
                    date: '10/01/2025 14:30',
                    description: 'Hồ sơ của bạn đã được gửi thành công'
                  },
                  {
                    title: 'Đang xem xét',
                    date: '11/01/2025 09:15',
                    description: 'Nhà tuyển dụng đã xem hồ sơ của bạn'
                  },
                  {
                    title: 'Hồ sơ của bạn đã được chấp nhận',
                    date: '14/01/2025 12:15',
                    description: 'Xin chúc mừng! Một công việc mới đang chào đón bạn ở phía trước'
                  }
                ].map((item, i, arr) => (
                  <div key={i} style={{
                    ...flex('flex-start'), gap: 16, position: 'relative'
                  }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: '50%',
                      background: C.green, ...flex('center'), justifyContent: 'center',
                      flexShrink: 0, zIndex: 1
                    }}>
                      <CheckCircle size={20} color={C.white} />
                    </div>
                    <div style={{ 
                      flex: 1, 
                      paddingBottom: i < arr.length - 1 ? 32 : 0
                    }}>
                      <h4 style={{ ...txt(16, 600), marginBottom: 4 }}>{item.title}</h4>
                      <p style={{ ...txt(14, 500, C.blue), marginBottom: 4 }}>{item.date}</p>
                      <p style={{ ...txt(14, 400, C.gray) }}>{item.description}</p>
                    </div>
                    {i < arr.length - 1 && (
                      <div style={{
                        position: 'absolute',
                        left: 19,
                        top: 40,
                        width: 2,
                        height: 'calc(100% - 8px)',
                        background: C.border
                      }} />
                    )}
                  </div>
                ))}
              </div>

              <h3 style={{ ...txt(20, 700), marginBottom: 16, ...flex('center'), gap: 8 }}>
                <MessageSquare size={22} /> Thư xin việc
              </h3>
              <div style={{
                background: C.grayBg, borderRadius: 12, padding: 20, marginBottom: 32
              }}>
                <p style={{ ...txt(14, 400, C.gray), lineHeight: 1.7 }}>
                  Em là sinh viên năm 3 ngành Toán - Tin học tại ĐH Khoa học Tự nhiên. Em có kinh nghiệm dạy kèm Toán và Lý cho học sinh THPT được 2 năm với kết quả tốt. Em rất mong được làm việc tại trung tâm để phát triển kỹ năng giảng dạy của mình.
                </p>
              </div>

              <h3 style={{ ...txt(20, 700), marginBottom: 16, ...flex('center'), gap: 8 }}>
                <AlertCircle size={22} /> Phản hồi từ nhà tuyển dụng
              </h3>
              <div style={{
                background: '#fef3c7', borderRadius: 12, padding: 20,
                border: `1px solid #fcd34d`
              }}>
                <p style={{ ...txt(14, 400, '#92400e'), lineHeight: 1.7 }}>
                  Cảm ơn bạn đã tham gia ứng tuyển—sau khi xem xét hồ sơ và trao đổi, chúng tôi rất vui mừng thông báo bạn đã được lựa chọn cho vị trí này; đội ngũ mong sớm chào đón bạn gia nhập và cùng nhau tạo nên những giá trị mới.
                </p>
              </div>
            </div>

            <div>
              <h3 style={{ ...txt(20, 700), marginBottom: 20, ...flex('center'), gap: 8 }}>
                <Info size={22} /> Thông tin ứng tuyển
              </h3>

                {[
                { label: 'NGÀY ỨNG TUYỂN', value: '16/01/2026 14:30' },
                { label: 'SỐ LƯỢNG TUYỂN', value: '3 người' },
                { label: 'HẠN NỘP HỒ SƠ', value: '30/01/2026', color: C.red },
                { label: 'CẤP BẬC', value: 'Nhân viên' },
                { label: 'HỌC VẤN', value: 'Cấp 3 trở lên' }
                ].map(({ label, value, color }, i, arr) => {
                const isLast = i === arr.length - 1;

                return (
                    <div
                    key={i}
                    style={{
                        paddingBottom: isLast ? 0 : 16,
                        marginBottom: isLast ? 0 : 16,
                        borderBottom: isLast ? 'none' : `1px solid ${C.border}`
                    }}
                    >
                    <p
                        style={{
                        ...txt(11, 700, C.grayLight),
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        marginBottom: 6
                        }}
                    >
                        {label}
                    </p>
                    <p style={{ ...txt(14, 600, color || C.navy) }}>
                        {value}
                    </p>
                    </div>
                );
                })}

              <div style={{ marginTop: 32 }}>
                <h3 style={{ ...txt(18, 700), marginBottom: 16, ...flex('center'), gap: 8 }}>
                  <FileText size={20} /> Hồ sơ đã nộp
                </h3>
                <div style={{
                  background: '#fef2f2', borderRadius: 12,
                  padding: '16px', border: `1px solid #fecaca`
                }}>
                  <div style={{ ...flex('center'), gap: 12 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 8,
                      background: '#dc2626', ...flex('center'), justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <span style={{ ...txt(12, 700, C.white) }}>PDF</span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ 
                        ...txt(14, 600),
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        CV_NguyenTuyetAnh.pdf
                      </p>
                      <p style={{ ...txt(12, 400, C.gray) }}>
                        2.4 MB • 10/01/2025
                      </p>
                    </div>
                  </div>
                </div>
                <button style={{
                  width: '100%', marginTop: 16, padding: '12px',
                  borderRadius: 10, border: 'none',
                  background: C.blue, color: C.white,
                  fontSize: 14, fontWeight: 600, cursor: 'pointer',
                  ...flex('center'), justifyContent: 'center', gap: 8
                }}>
                  <Download size={16} /> Tải xuống
                </button>
              </div>
            </div>
          </div>

          <div style={{
            padding: '20px 32px', borderTop: `1px solid ${C.border}`,
            ...flex('center'), justifyContent: 'flex-end'
          }}>
            <button onClick={onClose} style={{
              padding: '12px 32px', borderRadius: 10, border: 'none',
              background: C.blue, color: C.white, fontSize: 15,
              fontWeight: 600, cursor: 'pointer'
            }}>
              Đóng
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

const ApplicationCard = ({ application, onViewDetail }) => {
  const statusConfig = {
    'Đang chờ': { bg: C.yellowBg, text: '#f59e0b' },
    'Đã chấp nhận': { bg: C.greenBg, text: C.green },
    'Đã từ chối': { bg: C.redBg, text: C.red }
  };

  const config = statusConfig[application.status];
  const IconComponent = application.icon;

  return (
    <div style={{
      background: C.white, borderRadius: 16,
      border: `1px solid ${C.border}`,
      padding: '24px', marginBottom: 20
    }}>
      <div style={{ ...flex('flex-start'), gap: 20 }}>
        <div style={{
          width: 72, height: 72, borderRadius: 14,
          background: `linear-gradient(135deg, ${C.purple}, #a78bfa)`,
          ...flex('center'), justifyContent: 'center', flexShrink: 0
        }}>
          <IconComponent size={36} color={C.white} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
            <div
            style={{
                ...flex('center'),
                justifyContent: 'space-between',
                marginBottom: 8
            }}
            >
            <div style={{ ...flex('center'), gap: 10, minWidth: 0 }}>
                <h3 style={{ ...txt(18, 600), whiteSpace: 'nowrap' }}>
                {application.title}
                </h3>
                <span
                style={{ padding: '4px 12px',
                    borderRadius: 16,
                    background: config.bg,
                    color: config.text,
                    fontSize: 13,
                    fontWeight: 600,
                    flexShrink: 0
                }}
                >
                {application.status}
                </span>
            </div>

            <span style={{ ...txt(13, 400, C.gray), whiteSpace: 'nowrap', flexShrink: 0 }}>
                Ứng tuyển {application.appliedAgo}
            </span>
            </div>
          <p style={{ ...txt(14, 500, C.blue), marginBottom: 12 }}>
            {application.company}
          </p>

          <div style={{
            ...flex('center'), justifyContent: 'space-between',
            paddingTop: 16, borderTop: `1px solid ${C.border}`
          }}>
            <span style={{ ...txt(16, 700, C.blueText) }}>
              {application.salary}
            </span>

            <div style={{ ...flex('center'), gap: 10 }}>
              <button
                onClick={() => onViewDetail(application)}
                style={{
                  padding: '8px 18px', borderRadius: 20,
                  border: `1px solid ${C.border}`,
                  background: C.white, color: C.navy,
                  fontSize: 14, fontWeight: 600, cursor: 'pointer',
                  ...flex('center'), gap: 6
                }}
              >
                <Eye size={14} /> Chi tiết
              </button>
              <button style={{
                padding: '8px 18px', borderRadius: 20,
                border: 'none', background: C.blue,
                color: C.white, fontSize: 14, fontWeight: 600,
                cursor: 'pointer', ...flex('center'), gap: 6
              }}>
                <MessageCircle size={14} /> Nhắn tin
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function AppliedJobsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const applications = [
    {
      id: 1,
      title: 'Nhân viên Phục vụ Part-time',
      company: 'The Coffee House',
      salary: '25.000 - 30.000 VNĐ/giờ',
      status: 'Đang chờ',
      appliedAgo: '3 ngày trước',
      icon: Coffee
    },
    {
      id: 2,
      title: 'Gia sư Toán - Lý',
      company: 'Trung tâm Gia sư Smart',
      salary: '80.000 - 150.000 VNĐ/giờ',
      status: 'Đã chấp nhận',
      appliedAgo: '3 ngày trước',
      icon: GraduationCap
    },
    {
      id: 3,
      title: 'Content Creator',
      company: 'Startup Media Hub',
      salary: '80.000 - 150.000 VNĐ/giờ',
      status: 'Đã từ chối',
      appliedAgo: '4 ngày trước',
      icon: Monitor
    },
    {
      id: 4,
      title: 'Barista Part-time',
      company: 'Highlands Coffee',
      salary: '28.000 - 32.000 VNĐ/giờ',
      status: 'Đã từ chối',
      appliedAgo: '5 ngày trước',
      icon: Coffee
    }
  ];

  const filteredApps = applications.filter(app => {
    if (filter === 'all') return true;
    if (filter === 'pending') return app.status === 'Đang chờ';
    if (filter === 'accepted') return app.status === 'Đã chấp nhận';
    if (filter === 'rejected') return app.status === 'Đã từ chối';
    return true;
  });

  const handleViewDetail = (app) => {
    setSelectedApplication(app);
    setModalOpen(true);
  };

  return (
    <div style={{
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      background: C.grayBg, minHeight: '100vh'
    }}>
      <main style={{ padding: '40px 48px' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ ...txt(32, 700), marginBottom: 8 }}>Việc đã ứng tuyển</h1>
          <p style={{ ...txt(15, 400, C.gray) }}>Xem chi tiết việc bạn đã ứng tuyển</p>
        </div>

        <div style={{ ...flex('center'), gap: 16, marginBottom: 32 }}>
          <div style={{
            ...flex('center'), gap: 10, flex: 1,
            background: C.white, border: `1px solid ${C.border}`,
            borderRadius: 10, padding: '10px 16px'
          }}>
            <Search size={20} color={C.gray} />
            <input
              placeholder="Tìm kiếm công việc đã ứng tuyển"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                border: 'none', outline: 'none', fontSize: 14,
                flex: 1, background: 'transparent'
              }}
            />
          </div>
          <button
            style={{
              padding: '10px 24px', borderRadius: 10,
              border: 'none', background: C.blue,
              color: C.white, fontSize: 14, fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Tìm kiếm
          </button>
        </div>

        <div style={{ ...flex('center'), gap: 12, marginBottom: 32 }}>
          <span style={{ ...txt(14, 600, C.gray) }}>Lọc:</span>
          {[
            { id: 'all', label: 'Tất cả' },
            { id: 'pending', label: 'Đang chờ' },
            { id: 'accepted', label: 'Đã chấp nhận' },
            { id: 'rejected', label: 'Đã từ chối' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              style={{
                padding: '8px 20px', borderRadius: 20,
                border: 'none',
                background: filter === tab.id ? C.purple : C.white,
                color: filter === tab.id ? C.white : C.navy,
                fontSize: 14, fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div>
          {filteredApps.map(app => (
            <ApplicationCard
              key={app.id}
              application={app}
              onViewDetail={handleViewDetail}
            />
          ))}
        </div>
      </main>

      <ApplicationModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedApplication(null);
        }}
        application={selectedApplication}
      />
    </div>
  );
}