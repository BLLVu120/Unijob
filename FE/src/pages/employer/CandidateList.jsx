import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Users, MessageSquare, Search, Eye,
  User, Calendar, Phone, Mail, Home, X,
  CheckCircle, XCircle, Clock, Download, MessageCircle, CalendarClock, Info } from 'lucide-react';
import { flex, txt, card, field } from '../../utils/styles';
import { COLORS, TILE_GRADIENTS, GRADIENT } from '../../constants/colors';
import { PAGE_BTN_STYLE } from '../../constants/pageBtnStyle';
import { getCurrentUser, getAllCandidates } from '../../services/authService';
import { applicationService, APPLICATION_STATUS } from '../../services/applicationService';
import { jobService } from '../../services/jobService';
import { interviewService } from '../../services/interviewService';
import { sendMessage } from '../../services/messageService';
import { cvLink, normalize } from '../../utils/jobFormat';
import PageHeader from '../../components/PageHeader';
import { EmailText, InfoTile } from '../../components/ProfileKit';
import Toast from '../../components/Toast';
import { getInitials, formatDate, formatDateTime } from '../../utils/textUtils';
const C = COLORS;

// Trạng thái BE → 3 nhóm trên giao diện
const STATUS_GROUP = {
  submitted: 'pending', screening: 'pending', interview: 'pending',
  recruited: 'approved',
  rejected: 'rejected', withdrawn: 'rejected'
};

const GENDER_LABELS = { male: 'Nam', female: 'Nữ', other: 'Khác' };


const DEFAULT_FEEDBACK = {
  approve: 'Cảm ơn bạn đã tham gia ứng tuyển. Sau khi xem xét hồ sơ, chúng tôi rất vui mừng thông báo bạn đã được lựa chọn cho vị trí này. Chúng tôi sẽ sớm liên hệ về các bước tiếp theo.',
  reject: 'Cảm ơn bạn đã tham gia ứng tuyển. Sau khi xem xét hồ sơ, chúng tôi rất tiếc thông báo rằng hồ sơ của bạn chưa phù hợp với yêu cầu tuyển dụng hiện tại.'
};

// Ô nhập trong mục "Lịch phỏng vấn"
const INTERVIEW_INPUT = {
  width: '100%', height: 42, padding: '0 12px', borderRadius: 10, border: `1px solid ${C.border}`,
  fontSize: 14, outline: 'none', boxSizing: 'border-box', background: C.white, fontFamily: 'inherit'
};

// ISO → giá trị cho <input type="datetime-local"> theo giờ máy
const toLocalInput = (iso) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const STATUS_TABS = [
  { id: '', label: 'Tất cả' },
  { id: 'pending', label: 'Chờ duyệt' },
  { id: 'approved', label: 'Đã duyệt' },
  { id: 'rejected', label: 'Từ chối' }
];

const CandidateModal = ({ open, onClose, candidate, onDecision, onScheduleInterview, busy }) => {
  const statusConfig = {
    pending: {
      badge: { bg: C.yellowBg, text: C.amber, label: candidate ? APPLICATION_STATUS[candidate.status]?.label || 'Chờ duyệt' : 'Chờ duyệt', icon: Clock },
      buttons: [
        { label: 'Từ chối', color: C.red, action: 'reject', icon: XCircle },
        { label: 'Duyệt hồ sơ', color: C.green, action: 'approve', icon: CheckCircle }
      ]
    },
    approved: {
      badge: { bg: C.greenBg, text: C.green, label: 'Đã duyệt', icon: CheckCircle },
      buttons: [
        { label: 'Từ chối', color: C.red, action: 'reject', icon: XCircle }
      ]
    },
    rejected: {
      badge: { bg: C.redBg, text: C.red, label: 'Từ chối', icon: XCircle },
      buttons: [
        { label: 'Từ chối', color: C.red, action: 'reject', icon: XCircle, disabled: true },
        { label: 'Duyệt hồ sơ', color: C.green, action: 'approve', icon: CheckCircle }
      ]
    }
  };

  const config = statusConfig[candidate?.group] || statusConfig.pending;
  const [feedback, setFeedback] = useState('');
  // '' = chưa sửa → hiển thị theo lịch đã hẹn (nếu có)
  const [interviewTime, setInterviewTime] = useState('');
  const [interviewDuration, setInterviewDuration] = useState('');
  const [localError, setLocalError] = useState('');

  if (!open || !candidate) return null;

  const BadgeIcon = config.badge.icon;
  const info = candidate.profile || {};
  const cvUrl = cvLink(candidate.cv_url);
  const cvName = candidate.cv_url ? decodeURIComponent(candidate.cv_url.split('/').pop()) : 'CV.pdf';

  const decide = (action) => {
    const text = feedback.trim() || DEFAULT_FEEDBACK[action];
    onDecision(action, text);
  };

  const existing = candidate.interview;
  const timeValue = interviewTime || (existing ? toLocalInput(existing.time) : '');
  const durationValue = interviewDuration || existing?.duration || 30;
  const canSchedule = candidate.group === 'pending';

  const submitInterview = () => {
    if (!timeValue || new Date(timeValue) < new Date()) {
      setLocalError('Vui lòng chọn thời gian phỏng vấn trong tương lai');
      return;
    }
    setLocalError('');
    onScheduleInterview(new Date(timeValue).toISOString(), Number(durationValue) || 30);
  };

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
            background: GRADIENT.hero,
            borderRadius: '20px 20px 0 0',
            padding: '28px 32px'
          }}>
            <div style={{ ...flex('center'), justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ ...flex('center'), gap: 12 }}>
                    {/* Nhãn trạng thái đứng đầu hàng */}
                    <span style={{
                    padding: '6px 16px', borderRadius: 20,
                    background: config.badge.bg,
                    color: config.badge.text,
                    fontSize: 13, fontWeight: 600,
                    ...flex('center'), gap: 6
                    }}>
                    {BadgeIcon && <BadgeIcon size={14} />}
                    {config.badge.label}
                    </span>
                    <span style={{
                        padding: '6px 16px', borderRadius: 20,
                        background: 'rgba(255,255,255,0.2)',
                        color: C.white, fontSize: 13, fontWeight: 600
                    }}>
                        Ứng tuyển: {candidate.appliedDate}
                    </span>
                    {candidate.interview && (
                      <span style={{
                        padding: '6px 16px', borderRadius: 20,
                        background: 'rgba(255,255,255,0.2)',
                        color: C.white, fontSize: 13, fontWeight: 600,
                        ...flex('center'), gap: 6
                      }}>
                        <CalendarClock size={14} /> PV: {formatDateTime(candidate.interview.time)}
                      </span>
                    )}
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
                <span style={{ ...txt(24, 700, C.white) }}>{candidate.avatar}</span>
              </div>
              <div>
                <h2 style={{ ...txt(28, 700, C.white), marginBottom: 4 }}>
                  {candidate.name}
                </h2>
                <p style={{ ...txt(16, 500, C.white), opacity: 0.95 }}>
                  Ứng tuyển vị trí: {candidate.position}
                </p>
              </div>
            </div>
          </div>

          <div style={{ padding: '32px' }}>
            {/* Thông tin cá nhân: chiếm toàn chiều ngang, 2 hàng × 3 thẻ */}
            <h3 style={{ ...txt(20, 700), marginBottom: 16, ...flex('center'), gap: 8 }}>
              <User size={22} /> Thông tin cá nhân
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 12, marginBottom: 32 }}>
                {[
                  { icon: User, label: 'Họ và tên', value: info.full_name || candidate.name },
                  { icon: Users, label: 'Giới tính', value: GENDER_LABELS[info.gender] || info.gender },
                  { icon: Calendar, label: 'Ngày sinh', value: info.dob ? formatDate(info.dob, '—') : '' },
                  { icon: Phone, label: 'Số điện thoại', value: info.phone_number },
                  { icon: Mail, label: 'Email', value: info.email && <EmailText email={info.email} /> },
                  { icon: Home, label: 'Địa chỉ', value: info.address }
                ].map((f, i) => <InfoTile key={f.label} {...f} gradient={TILE_GRADIENTS[i]} />)}
            </div>

            {/* Bên dưới: trái hồ sơ đã nộp + lịch phỏng vấn — phải ghi phản hồi */}
            <div style={{ display: 'grid', gridTemplateColumns: '380px minmax(0, 1fr)', gap: 32, alignItems: 'start' }}>
              <div>
              <h3 style={{ ...txt(20, 700), marginBottom: 16, ...flex('center'), gap: 8 }}>
                <FileText size={22} /> Hồ sơ đã nộp
              </h3>
              <div style={{
                background: COLORS.redBg, borderRadius: 12,
                padding: '16px', border: `1px solid #fecaca`, marginBottom: 12
              }}>
                <div style={{ ...flex('center'), gap: 12 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 8,
                    background: C.redDark, ...flex('center'), justifyContent: 'center'
                  }}>
                    <span style={{ ...txt(12, 700, C.white) }}>PDF</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ ...txt(14, 600), overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cvName}</p>
                    <p style={{ ...txt(12, 400, C.gray) }}>Nộp ngày {candidate.appliedDate}</p>
                  </div>
                </div>
              </div>
              <button
              onClick={() => cvUrl && window.open(cvUrl, '_blank', 'noopener')}
              disabled={!cvUrl}
              style={{
                width: '100%', padding: '12px', borderRadius: 10,
                border: 'none', background: C.green,
                color: C.white, fontSize: 14, fontWeight: 600,
                cursor: cvUrl ? 'pointer' : 'not-allowed', opacity: cvUrl ? 1 : 0.6,
                ...flex('center'), justifyContent: 'center', gap: 8
              }}>
                <Download size={16} /> Tải xuống
              </button>

              <h3 style={{ ...txt(20, 700), marginTop: 32, marginBottom: 16, ...flex('center'), gap: 8 }}>
                <CalendarClock size={22} /> Lịch phỏng vấn
              </h3>
              <div style={{
                background: C.white, border: `1px solid ${C.border}`, borderRadius: 14, padding: 16,
                boxShadow: '0 1px 3px rgba(15, 23, 42, 0.05)'
              }}>
                {existing && (
                  <div style={{
                    ...flex('center'), gap: 10, padding: '10px 12px', borderRadius: 12, marginBottom: canSchedule ? 12 : 0,
                    background: C.blueLight, border: `1px solid ${C.blueBorder}`
                  }}>
                    <Calendar size={16} color={C.purple} style={{ flexShrink: 0 }} />
                    <span style={{ ...txt(13, 500, C.darkGray) }}>
                      Đã hẹn: <b style={{ color: C.purple }}>{formatDateTime(existing.time)}</b>
                      {existing.duration ? ` · ${existing.duration} phút` : ''}
                    </span>
                  </div>
                )}
                {canSchedule ? (
                  <>
                    {/* Mỗi hàng: nhãn bên trái — ô chọn bên phải */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'auto minmax(0, 1fr)', alignItems: 'center', columnGap: 14, rowGap: 10, marginBottom: 12 }}>
                      <label style={{ ...txt(13, 600), whiteSpace: 'nowrap' }}>Thời gian</label>
                      <input
                        type="datetime-local"
                        value={timeValue}
                        onChange={e => setInterviewTime(e.target.value)}
                        style={INTERVIEW_INPUT}
                      />
                      <label style={{ ...txt(13, 600), whiteSpace: 'nowrap' }}>Thời lượng (phút)</label>
                      <input
                        type="number"
                        min={10}
                        value={durationValue}
                        onChange={e => setInterviewDuration(e.target.value)}
                        style={INTERVIEW_INPUT}
                      />
                    </div>
                    {localError && <p style={{ ...txt(13, 500, C.red), marginBottom: 12 }}>{localError}</p>}
                    <button
                      onClick={submitInterview}
                      disabled={busy}
                      style={{
                        width: '100%', height: 42, borderRadius: 12, border: 'none',
                        background: C.purple, color: C.white, fontSize: 14, fontWeight: 600,
                        cursor: busy ? 'wait' : 'pointer', opacity: busy ? 0.7 : 1,
                        ...flex('center'), justifyContent: 'center', gap: 8
                      }}
                    >
                      <CalendarClock size={16} /> {existing ? 'Cập nhật lịch phỏng vấn' : 'Hẹn phỏng vấn'}
                    </button>
                  </>
                ) : !existing && (
                  <p style={{ ...txt(13, 400, C.gray) }}>
                    Chỉ có thể hẹn phỏng vấn khi hồ sơ đang chờ xử lý.
                  </p>
                )}
              </div>
              </div>

              <div>
              <h3 style={{ ...txt(20, 700), marginBottom: 16, ...flex('center'), gap: 8 }}>
                <MessageCircle size={22} /> Phản hồi
              </h3>
              {/* Ghi chú bọc thẻ: nền tím nhạt + icon thông tin */}
              <div style={{
                ...flex('flex-start'), gap: 8, padding: '10px 12px', borderRadius: 12, marginBottom: 12,
                background: C.blueLight, border: `1px solid ${C.blueBorder}`
              }}>
                <Info size={16} color={C.purple} style={{ flexShrink: 0, marginTop: 1 }} />
                <p style={{ ...txt(13, 400, C.darkGray), lineHeight: 1.5 }}>
                  Nội dung sẽ được gửi qua tin nhắn cho ứng viên khi bạn duyệt hoặc từ chối. Để trống để dùng nội dung mặc định.
                </p>
              </div>
              <textarea
                value={feedback}
                onChange={e => setFeedback(e.target.value)}
                placeholder="Nhập nội dung phản hồi"
                style={{
                  width: '100%', minHeight: 220, padding: '12px',
                  borderRadius: 12, border: `1px solid ${C.border}`,
                  fontSize: 14, fontFamily: 'inherit',
                  resize: 'vertical', outline: 'none',
                  background: C.white, boxSizing: 'border-box'
                }}
              />
              </div>
            </div>
          </div>

          <div style={{
            padding: '20px 32px', borderTop: `1px solid ${C.border}`,
            ...flex('center'), justifyContent: 'flex-end', gap: 12
          }}>
            {config.buttons.map((btn, i) => {
              const BtnIcon = btn.icon;
              const disabled = btn.disabled || busy;
              return (
                <button
                  key={i}
                  onClick={() => decide(btn.action)}
                  disabled={disabled}
                  style={{
                    padding: '12px 28px', borderRadius: 10, border: 'none',
                    background: btn.disabled ? C.grayBg : btn.color,
                    color: btn.disabled ? C.gray : C.white,
                    fontSize: 15, fontWeight: 600,
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    opacity: disabled ? 0.5 : 1,
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

// Ghép hồ sơ ứng tuyển của mọi tin thuộc nhà tuyển dụng với thông tin ứng viên
const loadCandidates = async (empId) => {
  const [jobs, candidates, interviews] = await Promise.all([
    jobService.getJobsByEmployer(empId),
    getAllCandidates(),
    interviewService.getByEmployer(empId).catch(() => [])
  ]);
  const appsByJob = await Promise.all(jobs.map(job =>
    applicationService.getByJobId(job.job_id).then(apps => apps.map(app => ({ ...app, job })))
  ));
  const candidateById = Object.fromEntries(candidates.map(c => [c.candidate_id, c]));

  return appsByJob.flat()
    .map(app => {
      const profile = candidateById[app.candidate_id];
      const interview = interviews
        .filter(iv => iv.candidate_id === app.candidate_id && iv.job_id === app.job_id)
        .sort((a, b) => new Date(b.time) - new Date(a.time))[0];
      const name = profile?.full_name || 'Ứng viên';
      return {
        ...app,
        id: app.application_id,
        profile,
        interview,
        name,
        email: profile?.email || '',
        position: app.job.title,
        appliedDate: formatDate(app.created_at, '—'),
        appliedIso: app.created_at ? String(app.created_at).slice(0, 10) : '',
        group: STATUS_GROUP[app.status] || 'pending',
        avatar: getInitials(name),
        bgColor: C.purple
      };
    })
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
};

export default function CandidateList() {
  const navigate = useNavigate();
  const [self] = useState(getCurrentUser);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState(null);
  const clearNotice = useCallback(() => setNotice(null), []);
  const [busy, setBusy] = useState(false);

  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [filters, setFilters] = useState({ q: '', status: '', date: '' });
  const [page, setPage] = useState(1);

  const reload = () =>
    loadCandidates(self.emp_id)
      .then(list => {
        setCandidates(list);
        // Cập nhật luôn ứng viên đang mở (nếu có)
        setSelectedCandidate(cur => cur ? list.find(c => c.id === cur.id) || cur : cur);
      })
      .catch(err => setNotice({ type: 'error', text: `Không tải được danh sách ứng viên: ${err.message}` }))
      .finally(() => setLoading(false));

  // Chỉ tải khi mở trang
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { reload(); }, []);

  const displayCandidates = useMemo(() => {
    const q = normalize(filters.q.trim());
    return candidates.filter(c =>
      (!q || normalize(`${c.name} ${c.email} ${c.position}`).includes(q)) &&
      (!filters.status || c.group === filters.status) &&
      (!filters.date || c.appliedIso === filters.date)
    );
  }, [candidates, filters]);

  const rowsPerPage = 5;
  const total = displayCandidates.length;
  const totalPages = Math.max(1, Math.ceil(total / rowsPerPage));
  const start = (page - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  const currentCandidates = displayCandidates.slice(start, end);

  const countGroup = (g) => candidates.filter(c => c.group === g).length;
  const stats = [
    { icon: Users, label: 'Tổng ứng viên', value: candidates.length, bgColor: C.grayBg, iconColor: C.navy },
    { icon: Clock, label: 'Chờ duyệt', value: countGroup('pending'), bgColor: C.yellowBg, iconColor: C.amber },
    { icon: CheckCircle, label: 'Đã duyệt', value: countGroup('approved'), bgColor: C.greenBg, iconColor: C.green },
    { icon: XCircle, label: 'Từ chối', value: countGroup('rejected'), bgColor: C.grayBg, iconColor: C.navy }
  ];

  const applyFilters = () => {
    setFilters(f => ({ ...f, q: searchQuery, date: dateFilter }));
    setPage(1);
  };

  const selectStatus = (status) => {
    setFilters(f => ({ ...f, status }));
    setPage(1);
  };

  // Mở hồ sơ mới nộp → chuyển sang "Đang xét duyệt" để ứng viên thấy tiến trình
  const handleViewCandidate = (candidate) => {
    setSelectedCandidate(candidate);
    setModalOpen(true);
    if (candidate.status === 'submitted') {
      applicationService.updateStatus(candidate.id, 'screening')
        .then(reload)
        .catch(() => {});
    }
  };

  const handleDecision = async (action, feedbackText) => {
    const target = selectedCandidate;
    setBusy(true);
    try {
      await applicationService.updateStatus(target.id, action === 'approve' ? 'recruited' : 'rejected');
      await sendMessage({
        sender_id: self.emp_id,
        receiver_id: target.candidate_id,
        content: `[${target.position}] ${feedbackText}`
      }).catch(() => {});
      setNotice({ type: 'success', text: `${action === 'approve' ? 'Đã duyệt' : 'Đã từ chối'} hồ sơ của ${target.name}` });
      setModalOpen(false);
      setSelectedCandidate(null);
      reload();
    } catch (err) {
      setNotice({ type: 'error', text: err.message });
    } finally {
      setBusy(false);
    }
  };

  const handleScheduleInterview = async (timeIso, duration) => {
    const target = selectedCandidate;
    setBusy(true);
    try {
      if (target.interview) {
        await interviewService.update({ interview_id: target.interview.interview_id, time: timeIso, duration });
      } else {
        await interviewService.add({
          job_id: target.job_id, emp_id: self.emp_id, candidate_id: target.candidate_id, time: timeIso, duration
        });
      }
      await applicationService.updateStatus(target.id, 'interview');
      await sendMessage({
        sender_id: self.emp_id,
        receiver_id: target.candidate_id,
        content: `[${target.position}] Mời bạn tham gia phỏng vấn lúc ${formatDateTime(timeIso)} (khoảng ${duration} phút).`
      }).catch(() => {});
      setNotice({ type: 'success', text: `Đã hẹn phỏng vấn với ${target.name}` });
      reload();
    } catch (err) {
      setNotice({ type: 'error', text: err.message });
    } finally {
      setBusy(false);
    }
  };

  const groupBadge = {
    approved: { bg: C.greenBg, color: C.green, label: 'Đã duyệt' },
    rejected: { bg: C.redBg, color: C.red, label: 'Từ chối' }
  };

  return (
    <div style={{
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      background: C.grayBg, minHeight: '100vh'
    }}>
      <main style={{ padding: '40px 48px' }}>
        <PageHeader
          title="Ứng viên"
          subtitle="Quản lý hồ sơ ứng tuyển vào các tin tuyển dụng của bạn"
        />
        <Toast message={notice} onClose={clearNotice} />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 16, marginBottom: 24 }}>
          {stats.map((stat, i) => (
            <div key={i} style={{
              background: C.white, borderRadius: 16, border: `1px solid ${C.border}`,
              padding: '16px 20px', ...flex('center'), gap: 14
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: 12, flexShrink: 0,
                background: stat.bgColor, ...flex('center'), justifyContent: 'center'
              }}>
                <stat.icon size={24} color={stat.iconColor} />
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
              placeholder="Tìm theo tên, email hoặc vị trí ứng tuyển"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && applyFilters()}
              style={{ border: 'none', outline: 'none', boxShadow: 'none', fontSize: 14, flex: 1, background: 'transparent' }}
            />
          </div>
          <input
            type="date"
            value={dateFilter}
            onChange={e => setDateFilter(e.target.value)}
            title="Lọc theo ngày nộp"
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
            const n = tab.id ? countGroup(tab.id) : candidates.length;
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
          border: `1px solid ${C.border}`,
          overflow: 'hidden'
        }}>
          <div style={{
            background: C.white,
            borderRadius: 16,
            border: `1px solid ${C.border}`,
            overflow: 'hidden'
          }}>
            {currentCandidates.length > 0 ? (
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
                    {currentCandidates.map(c => {
                      const badge = groupBadge[c.group] || {
                        bg: C.yellowBg, color: C.amber,
                        label: APPLICATION_STATUS[c.status]?.label || 'Chờ duyệt'
                      };
                      return (
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
                        padding: '6px 14px', borderRadius: 16,
                        background: badge.bg, color: badge.color,
                        fontSize: 13, fontWeight: 600
                      }}>
                        {badge.label}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ ...flex('center'), gap: 8 }}>
                        <button
                          onClick={() => handleViewCandidate(c)}
                          title="Xem hồ sơ"
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
                        onClick={() => navigate(`/employer/messages?with=${c.candidate_id}`)}
                        title="Nhắn tin"
                        style={{
                          width: 36, height: 36, borderRadius: 10,
                          border: 'none', background: C.blueLight,
                          cursor: 'pointer',
                          ...flex('center'), justifyContent: 'center'
                        }}>
                          <MessageSquare size={17} color={C.purple} />
                        </button>
                      </div>
                    </td>
                  </tr>
                      );
                    })}
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
                  {loading ? 'Đang tải...' : candidates.length ? 'Không có ứng viên phù hợp với bộ lọc' : 'Chưa có ứng viên nào'}
                </h3>
                {!loading && !candidates.length && (
                  <p style={{ ...txt(15, 400, C.gray), marginBottom: 24, maxWidth: 400, margin: '0 auto' }}>
                    Danh sách ứng viên sẽ xuất hiện tại đây khi có người ứng tuyển vào các tin tuyển dụng của bạn.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {selectedCandidate && (
        <CandidateModal
          key={selectedCandidate.id}
          open={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setSelectedCandidate(null);
          }}
          candidate={selectedCandidate}
          onDecision={handleDecision}
          onScheduleInterview={handleScheduleInterview}
          busy={busy}
        />
      )}
    </div>
  );
}
