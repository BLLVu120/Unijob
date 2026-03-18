import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { FileText, Users, MessageSquare, Award, Search, Eye,
  User, Calendar, Phone, Mail, Home, Briefcase, X,
  CheckCircle, XCircle, Clock, Download, MessageCircle
} from 'lucide-react';
import { flex, txt } from '../utils/styles';
import { COLORS } from '../constants/colors';
import { BG } from '../constants/backgrounds';
import { pageBtnStyle } from "../constants/pageBtnStyle";
import { formatDate, getInitials } from "../utils/textUtils";
import { jobService } from '../services/jobService';
import { feedbackService } from "../services/feedbackService";
import { applicationService } from "../services/applicationService";
import { getUserById, getCurrentEmployer } from "../services/authService";
const C = COLORS;

const CandidateModal = ({ open, onClose, candidate, onApprove, onReject, statusLabel }) => {
  const statusConfig = {
    pending: {
      badge: { bg: C.yellowBg, text: '#f59e0b', label: 'Chờ duyệt', icon: Clock },
      showFeedback: false,
      feedbackPlaceholder: 'Nhập nội dung phản hồi',
      buttons: [
        { label: 'Từ chối', color: C.red, action: 'reject', icon: XCircle },
        { label: 'Duyệt hồ sơ', color: C.green, action: 'approve', icon: CheckCircle }
      ]
    },
    approved: {
      badge: { bg: C.greenBg, text: C.green, label: 'Đã duyệt', icon: CheckCircle },
      showFeedback: true,
      feedbackEditable: true,
      feedbackContent: 'Cảm ơn bạn đã tham gia ứng tuyển—sau khi xem xét hồ sơ và trao đổi, chúng tôi rất vui mừng thông báo bạn đã được lựa chọn cho vị trí này; đội ngũ mong sớm chào đón bạn gia nhập và cùng nhau tạo nên những giá trị mới.',
      buttons: [
        { label: 'Từ chối', color: C.red, action: 'reject', icon: XCircle }
      ]
    },
    rejected: {
      badge: { bg: C.redBg, text: C.red, label: 'Từ chối', icon: XCircle },
      showFeedback: true,
      feedbackEditable: true,
      feedbackContent: 'Cảm ơn bạn đã tham gia ứng tuyển—sau khi xem xét hồ sơ và trao đổi, chúng tôi rất tiếc thông báo rằng hồ sơ của bạn chưa phù hợp với yêu cầu tuyển dụng hiện tại.',
      buttons: [
        { label: 'Từ chối', color: C.red, action: 'reject', icon: XCircle },
        { label: 'Duyệt hồ sơ', color: C.green, action: 'approve', icon: CheckCircle }
      ]
    }
  };
  
  const config = statusConfig[candidate?.uiStatus] || statusConfig.pending;
  const [feedback, setFeedback] = useState(config.feedbackContent || '');

  if (!open || !candidate) return null;

  const BadgeIcon = config.badge.icon;

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
            background: 'linear-gradient(135deg, #10b981, #06b6d4)',
            borderRadius: '20px 20px 0 0',
            padding: '28px 32px'
          }}>
            <div style={{ ...flex('center'), justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ ...flex('center'), gap: 12 }}>
                    <span style={{
                        padding: '6px 16px', borderRadius: 20,
                        background: 'rgba(255,255,255,0.2)',
                        color: C.white, fontSize: 14, fontWeight: 600
                    }}>
                        Ứng tuyển: {candidate.appliedDate}
                    </span>
                    <span style={{
                    padding: '6px 16px', borderRadius: 20,
                    background: config.badge.bg,
                    color: config.badge.text,
                    fontSize: 13, fontWeight: 600,
                    ...flex('center'), gap: 6
                    }}>
                    {BadgeIcon && <BadgeIcon size={14} />}
                    {statusLabel[candidate.status] || config.badge.label}
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

            <div style={{ ...flex('center'), gap: 16 }}>
              <div style={{
                width: 64, height: 64, borderRadius: '50%',
                background: C.purple,
                ...flex('center'), justifyContent: 'center'
              }}>
                <span style={{ ...txt(24, 700, C.white) }}>{getInitials(candidate.name)}</span>
              </div>
              <div>
                <h2 style={{ ...txt(28, 700, C.white), marginBottom: 4 }}>
                  {candidate.name}
                </h2>
                <p style={{ ...txt(16, 500, C.white), opacity: 0.95 }}>
                  Ứng tuyển: {candidate.position}
                </p>
              </div>
            </div>
          </div>

          <div style={{ padding: '32px', display: 'grid', gridTemplateColumns: '1fr 380px', gap: 32 }}>
            <div>
              <h3 style={{ ...txt(20, 700), marginBottom: 20, ...flex('center'), gap: 8 }}>
                <User size={22} /> Thông tin cá nhân
              </h3>
              <div style={{
                background: C.grayBg, borderRadius: 12, padding: '20px', marginBottom: 32,
                display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16
              }}>
                {[
                  { icon: User, label: 'HỌ VÀ TÊN', value: candidate.name, iconColor: C.blue },
                  { icon: Users, label: 'GIỚI TÍNH', value: candidate.gender, iconColor: C.pink },
                  { icon: Calendar, label: 'NGÀY SINH', value: formatDate(candidate.dob), iconColor: C.purple },
                  { icon: Phone, label: 'SỐ ĐIỆN THOẠI', value: candidate.phone, iconColor: C.cyan },
                  { icon: Mail, label: 'EMAIL', value: candidate.email, iconColor: C.green },
                  { icon: Home, label: 'ĐỊA CHỈ', value: candidate.address, iconColor: C.orange }
                ].map(({ icon: Icon, label, value, iconColor }, i) => (
                  <div key={i}>
                    <div style={{ ...flex('center'), gap: 8, marginBottom: 6 }}>
                      <Icon size={16} color={iconColor} />
                      <span style={{ ...txt(11, 700, C.grayLight), textTransform: 'uppercase' }}>
                        {label}
                      </span>
                    </div>
                    <p style={{ ...txt(14, 600) }}>{value}</p>
                  </div>
                ))}
              </div>

              <h3 style={{ ...txt(20, 700), marginBottom: 16, ...flex('center'), gap: 8 }}>
                <Briefcase size={22} /> Kinh nghiệm làm việc
              </h3>
              {[
                {
                  title: 'Nhân viên phục vụ',
                  company: 'Highlands Coffee',
                  period: '06/2023 - 12/2024',
                  description: 'Phục vụ khách hàng, pha chế đồ uống, giữ vệ sinh quán. Được đánh giá cao về thái độ làm việc và kỹ năng giao tiếp.'
                },
                {
                  title: 'Gia sư Toán',
                  company: 'Freelance',
                  period: '01/2023 - 05/2023',
                  description: 'Dạy kèm Toán cho học sinh THPT. Giúp học sinh thân thiện điểm số và tự tin hơn trong môn học.'
                }
              ].map((exp, i) => (
                <div key={i} style={{
                  background: C.grayBg, borderRadius: 12, padding: '16px', marginBottom: 16
                }}>
                  <div style={{ ...flex('center'), gap: 8, marginBottom: 8 }}>
                    <div style={{
                      width: 8, height: 8, borderRadius: '50%', background: C.green
                    }} />
                    <h4 style={{ ...txt(16, 600) }}>{exp.title}</h4>
                  </div>
                  <p style={{ ...txt(14, 600, C.green), marginBottom: 4 }}>{exp.company}</p>
                  <p style={{ ...txt(13, 400, C.gray), marginBottom: 8 }}>{exp.period}</p>
                  <p style={{ ...txt(14, 400, C.gray) }}>{exp.description}</p>
                </div>
              ))}

              <h3 style={{ ...txt(20, 700), marginBottom: 16, marginTop: 24, ...flex('center'), gap: 8 }}>
                <Briefcase size={22} /> Học vấn
              </h3>
              <div style={{
                background: C.grayBg, borderRadius: 12, padding: '16px'
              }}>
                <div style={{ ...flex('center'), gap: 8, marginBottom: 8 }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%', background: C.green
                  }} />
                  <h4 style={{ ...txt(16, 600) }}>Sinh viên năm 3</h4>
                </div>
                <p style={{ ...txt(14, 600, C.green), marginBottom: 4 }}>
                  Đại học Khoa học Tự nhiên
                </p>
                <p style={{ ...txt(13, 400, C.gray), marginBottom: 12 }}>2020 - 2024</p>
                <span style={{
                  padding: '6px 14px', borderRadius: 16,
                  background: C.green, color: C.white,
                  fontSize: 13, fontWeight: 600,
                  display: 'inline-block'
                }}>
                  GPA: 3.5/4.0
                </span>
              </div>
            </div>

            <div>
              <h3 style={{ ...txt(20, 700), marginBottom: 16, ...flex('center'), gap: 8 }}>
                <Award size={22} /> Kỹ năng
              </h3>
              <div style={{ marginBottom: 32 }}>
                {[
                  { name: 'Kỹ năng giao tiếp & chăm sóc khách hàng', progress: 90, color: C.blue },
                  { name: 'Kỹ năng tin học cơ bản', progress: 85, color: C.green },
                  { name: 'Kỹ năng bán hàng & thuyết phục', progress: 85, color: C.pink },
                  { name: 'Kỹ năng quản lý thời gian & kỹ luật cá nhân', progress: 70, color: C.purple }
                ].map((skill, i) => (
                  <div key={i} style={{ marginBottom: 16 }}>
                    <div style={{ ...flex('center'), justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ ...txt(13, 500) }}>{skill.name}</span>
                      <span style={{ ...txt(13, 600, skill.color) }}>{skill.progress}%</span>
                    </div>
                    <div style={{
                      width: '100%', height: 8, borderRadius: 4, background: C.grayBg, overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${skill.progress}%`, height: '100%', background: skill.color
                      }} />
                    </div>
                  </div>
                ))}
              </div>

              <h3 style={{ ...txt(18, 700), marginBottom: 16, ...flex('center'), gap: 8 }}>
                <FileText size={20} /> Hồ sơ đã nộp
              </h3>
              <div style={{
                background: '#fef2f2', borderRadius: 12,
                padding: '16px', border: `1px solid #fecaca`, marginBottom: 16
              }}>
                <div style={{ ...flex('center'), gap: 12 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 8,
                    background: '#dc2626', ...flex('center'), justifyContent: 'center'
                  }}>
                    <span style={{ ...txt(12, 700, C.white) }}>PDF</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ ...txt(14, 600) }}>{candidate.cv ? candidate.cv.split('/').pop() : "Không có CV"}</p>
                    <p style={{ ...txt(12, 400, C.gray) }}>{candidate.appliedDate || "N/A"}</p>
                  </div>
                </div>
              </div>
              <button 
                onClick={async () => {
                  try {
                    const res = await fetch(candidate.cv);
                    const blob = await res.blob();

                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement("a");

                    a.href = url;
                    a.download = candidate.cv.split("/").pop() || "cv.pdf";

                    document.body.appendChild(a);
                    a.click();
                    a.remove();

                    window.URL.revokeObjectURL(url);
                  } catch (err) {
                    console.error(err);
                    alert("Không tải được CV");
                  }
                }}
                style={{
                  width: '100%', padding: '12px', borderRadius: 10,
                  border: 'none', background: C.green,
                  color: C.white, fontSize: 14, fontWeight: 600,
                  cursor: 'pointer', ...flex('center'), justifyContent: 'center', gap: 8
              }}>
                <Download size={16} /> Tải xuống
              </button>

              <h3 style={{ ...txt(18, 700), marginTop: 32, marginBottom: 16, ...flex('center'), gap: 8 }}>
                <MessageCircle size={20} /> Phản hồi
              </h3>
              <textarea
                value={feedback}
                onChange={e => setFeedback(e.target.value)}
                placeholder="Nhập nội dung phản hồi"
                style={{
                  width: '100%', minHeight: 120, padding: '12px',
                  borderRadius: 12, border: `1px solid ${C.border}`,
                  fontSize: 14, fontFamily: 'inherit',
                  resize: 'vertical', outline: 'none',
                  background: C.white
                }}
              />
            </div>
          </div>

          <div style={{
            padding: '20px 32px', borderTop: `1px solid ${C.border}`,
            ...flex('center'), justifyContent: 'flex-end', gap: 12
          }}>
            {config.buttons.map((btn, i) => {
              const BtnIcon = btn.icon;
              const statusMap = {
                approve: "approved",
                reject: "rejected"
              };
              const isDisabled = statusMap[btn.action] === candidate.uiStatus;

              return (
                <button
                  key={i}
                  onClick={() => btn.action === 'approve' ? onApprove(feedback) : onReject(feedback)}
                  disabled={isDisabled}
                  style={{
                    padding: '12px 28px', borderRadius: 10, border: 'none',
                    background: isDisabled ? C.grayBg : btn.color,
                    color: isDisabled ? C.gray : C.white,
                    fontSize: 15, fontWeight: 600,
                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                    opacity: isDisabled ? 0.5 : 1,
                    ...flex('center'), gap: 8
                  }}
                >
                  <BtnIcon size={18} /> {btn.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default function CandidatesPage() {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);

  const mapStatus = (status) => {
    switch (status?.toLowerCase()) {
      case "submitted": case "screening": case "interview": return "pending";
      case "recruited": return "approved";
      case "rejected": case "withdrawn": return "rejected";
      default: return "pending";
    }
  };

  const statusLabel = {
    submitted: "Đã nộp",
    screening: "Sàng lọc",
    interview: "Phỏng vấn",
    recruited: "Trúng tuyển",
    rejected: "Từ chối",
    withdrawn: "Rút hồ sơ"
  };

  const fixCvUrl = (url) => {
    if (!url) return "";

    if (url.startsWith("http")) return url;

    return "https://api.d4f.io.vn" +
      url.replace("/src/store/cv", "/cv");
  };

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const employer = getCurrentEmployer();

        if (!employer?.emp_id) {
          console.error("Không tìm thấy employer");
          return;
        }

        const jobs = await jobService.getJobsByEmployer(employer.emp_id);

        if (!jobs.length) {
          console.warn("Employer chưa có job");
          return;
        }

        const job = jobs[0];
        const applications = await applicationService.getByJobId(job.job_id);
        
        const fullCandidates = await Promise.all(
          applications.map(async (app) => {
            const user = await getUserById(app.candidate_id);
            
            return {
              id: app.application_id,
              job_id: job.job_id,            
              candidate_id: app.candidate_id,
              name: user?.full_name || "N/A",
              email: user?.email || "N/A",
              phone: user?.phone_number || "",
              gender: user?.gender || "",
              dob: user?.dob || "",
              address: user?.address || "",
              position: job?.title || "N/A",
              appliedDate: formatDate(app.created_at),
              status: app.status,
              uiStatus: mapStatus(app.status),
              avatar: getInitials(user?.full_name),
              bgColor: C.purple,
              cv: fixCvUrl(app.cv_url)
            };
          })
        );
        setCandidates(fullCandidates.filter(Boolean));

      } catch (err) {
        console.error(err);
      }
    };

    fetchCandidates();
  }, []);
  const rowsPerPage = 5;
  const total = candidates.length;
  const totalPages = Math.ceil(total / rowsPerPage);
  const start = (page - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  const currentCandidates = candidates.slice(start, end);

  const stats = [
    {
      icon: Users,
      label: 'Tổng ứng viên',
      value: candidates.length,
      bgColor: C.grayBg,
      iconColor: C.navy
    },
    {
      icon: Clock,
      label: 'Chờ duyệt',
      value: candidates.filter(c => c.uiStatus === 'pending').length,
      bgColor: C.yellowBg,
      iconColor: '#f59e0b'
    },
    {
      icon: CheckCircle,
      label: 'Đã duyệt',
      value: candidates.filter(c => c.uiStatus === 'approved').length,
      bgColor: C.greenBg,
      iconColor: C.green
    },
    {
      icon: XCircle,
      label: 'Từ chối',
      value: candidates.filter(c => c.uiStatus === 'rejected').length,
      bgColor: C.grayBg,
      iconColor: C.navy
    }
  ];

  const displayCandidates = candidates;

  const handleViewCandidate = (candidate) => {
    setSelectedCandidate(candidate);
    setModalOpen(true);
  };

  const handleApprove = async (feedback) => {
    const employer = getCurrentEmployer();
    // await applicationService.updateStatus(selectedCandidate.id, "recruited");

    await feedbackService.addFeedback({
      job_id: selectedCandidate.job_id,
      employer_id: employer.emp_id,
      candidate_id: selectedCandidate.candidate_id,
      rate: 5,
      comment: feedback
    });
    const res = await feedbackService.getByEmployer(employer.emp_id);
    setModalOpen(false);
  };

  const handleReject = async (feedback) => {
    const employer = getCurrentEmployer();
    // await applicationService.updateStatus(selectedCandidate.id, "rejected");

    await feedbackService.addFeedback({
      job_id: selectedCandidate.job_id,
      employer_id: employer.emp_id,
      candidate_id: selectedCandidate.candidate_id,
      rate: 2,
      comment: feedback
    });
    const res = await feedbackService.getByEmployer(employer.emp_id);
    setModalOpen(false);
  };

  return (
    <div style={{
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      background: C.grayBg, minHeight: '100vh'
    }}>
      <main style={{ padding: '40px 48px' }}>
        <h1 style={{ ...txt(32, 700), marginBottom: 32 }}>Ứng viên</h1>

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
              border: `1px solid ${C.border}`,
              padding: '20px 24px',
              ...flex('center'),
              gap: 16
            }}>
              <div style={{
                width: 56,
                height: 56,
                borderRadius: 12,
                background: stat.bgColor,
                ...flex('center'),
                justifyContent: 'center'
              }}>
                <stat.icon size={28} color={stat.iconColor} />
              </div>
              <div>
                <p style={{ ...txt(14, 500, C.gray) }}>{stat.label}</p>
                <p style={{ ...txt(26, 700) }}>{stat.value}</p>
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
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
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
            background: `${C.white} ${BG.dropdown}`
          }}>
            <option value="">Tất cả trạng thái</option>
            <option value="pending">Chờ duyệt</option>
            <option value="approved">Đã duyệt</option>
            <option value="rejected">Từ chối</option>
          </select>
          <button style={{
            padding: '10px 32px', borderRadius: 8,
            border: 'none', background: C.blue,
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
          <div style={{
            background: C.white,
            borderRadius: 16,
            border: `1px solid ${C.border}`,
            overflow: 'hidden'
          }}>
            {displayCandidates.length > 0 ? (
              <>
                <div style={{ padding: '20px 24px', borderBottom: `1px solid ${C.border}` }}>
                  <h2 style={{ ...txt(18, 700) }}>Danh sách ứng viên ({displayCandidates.length})</h2>
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: C.grayBg }}>
                      {['ỨNG VIÊN', 'VỊ TRÍ ỨNG TUYỂN', 'NGÀY NỘP', 'TRẠNG THÁI', 'THAO TÁC'].map(h => (
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
                    {currentCandidates.map((c, i) => (
                  <tr key={c.id} style={{ borderTop: `1px solid ${C.border}` }}>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ ...flex('center'), gap: 12 }}>
                        <div style={{
                          width: 40, height: 40, borderRadius: '50%',
                          background: c.bgColor,
                          ...flex('center'), justifyContent: 'center'
                        }}>
                          <span style={{ ...txt(14, 700, C.white) }}>{c.avatar}</span>
                        </div>
                        <div>
                          <p style={{ ...txt(14, 600) }}>{c.name}</p>
                          <p style={{ ...txt(13, 400, C.gray) }}>{c.email}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{ ...txt(14, 400) }}>{c.position}</span>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{ ...txt(14, 400) }}>{c.appliedDate}</span>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{
                        padding: '6px 14px',
                        borderRadius: 16,
                        background:
                          c.uiStatus === 'approved' ? C.greenBg :
                          c.uiStatus === 'pending' ? C.yellowBg :
                          C.redBg,
                        color:
                          c.uiStatus === 'approved' ? C.green :
                          c.uiStatus === 'pending' ? '#f59e0b' :
                          C.red,
                        fontSize: 13,
                        fontWeight: 600
                      }}>
                        {statusLabel[c.status] || c.status}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ ...flex('center'), gap: 8 }}>
                        <button
                          onClick={() => handleViewCandidate(c)}
                          style={{
                            width: 36, height: 36, borderRadius: 8,
                            border: `1px solid ${C.border}`, background: C.white,
                            cursor: 'pointer',
                            ...flex('center'), justifyContent: 'center'
                          }}
                        >
                          <Eye size={18} color={C.navy} />
                        </button>
                        <button
                          onClick={() => navigate(`/employer/messages/${c.id}`)}
                          style={{
                            width: 36, height: 36, borderRadius: 8,
                            border: 'none', background: C.blue,
                            cursor: 'pointer',
                            ...flex('center'), justifyContent: 'center'
                        }}>
                          <MessageSquare size={18} color={C.white} />
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
                Hiển thị {start + 1}-{Math.min(end, total)} trong tổng số {total} ứng viên
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
                  Chưa có ứng viên nào
                </h3>
                <p style={{ ...txt(15, 400, C.gray), marginBottom: 24, maxWidth: 400, margin: '0 auto' }}>
                  Danh sách ứng viên sẽ xuất hiện tại đây khi có người ứng tuyển vào các tin tuyển dụng của bạn.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {selectedCandidate && (
        <CandidateModal
          open={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setSelectedCandidate(null);
          }}
          candidate={selectedCandidate}
          onApprove={handleApprove}
          onReject={handleReject}
          statusLabel={statusLabel}
        />
      )}
    </div>
  );
}