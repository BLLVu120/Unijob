import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarDays, CalendarClock, CalendarCheck2, Clock, MapPin, MessageCircle, Eye, CalendarPlus,
  BadgeCheck, ChevronDown
} from 'lucide-react';
import { COLORS, SHADOW } from '../../constants/colors';
import { flex, txt, card } from '../../utils/styles';
import { getCurrentUser, getAllEmployers } from '../../services/authService';
import { jobService, attachEmployers } from '../../services/jobService';
import { interviewService } from '../../services/interviewService';
import PageHeader from '../../components/PageHeader';
import StateBox from '../../components/StateBox';

const C = COLORS;
const DEFAULT_DURATION = 30; // phút, khi BE không có thời lượng

const FILTER_TABS = [
  { id: 'upcoming', label: 'Sắp tới' },
  { id: 'past', label: 'Đã qua' },
  { id: 'all', label: 'Tất cả' }
];

// Trạng thái theo thời gian hiện tại
const STATUS = {
  upcoming: { label: 'Sắp diễn ra', bg: C.blueLight, color: C.purple },
  live: { label: 'Đang diễn ra', bg: C.greenBg, color: C.green },
  past: { label: 'Đã kết thúc', bg: C.grayBg, color: C.gray }
};

const pad = (n) => String(n).padStart(2, '0');
const fmtTime = (d) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;
const dayKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

const dayLabel = (d) => {
  const diff = Math.round((startOfDay(d) - startOfDay(new Date())) / 86400000);
  if (diff === 0) return 'Hôm nay';
  if (diff === 1) return 'Ngày mai';
  if (diff === -1) return 'Hôm qua';
  return null;
};

// Tạo file .ics để thêm lịch hẹn vào Google Calendar / Outlook / lịch điện thoại
const toIcsDate = (d) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
const downloadIcs = (iv) => {
  const ics = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Unijob//Interview//VI', 'BEGIN:VEVENT',
    `UID:${iv.interview_id}@unijob`,
    `DTSTAMP:${toIcsDate(new Date())}`,
    `DTSTART:${toIcsDate(iv.start)}`,
    `DTEND:${toIcsDate(iv.end)}`,
    `SUMMARY:Phỏng vấn: ${iv.title} - ${iv.company}`,
    `LOCATION:${iv.location || ''}`,
    'DESCRIPTION:Lịch phỏng vấn từ Unijob',
    'END:VEVENT', 'END:VCALENDAR'
  ].join('\r\n');
  const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = `phong-van-${dayKey(iv.start)}.ics`;
  a.click();
  URL.revokeObjectURL(url);
};

// Ghép lịch phỏng vấn với tin tuyển dụng + công ty
const loadInterviews = async (candidateId) => {
  const [interviews, jobs, employers] = await Promise.all([
    interviewService.getByCandidate(candidateId),
    jobService.getAllJobs(),
    getAllEmployers()
  ]);
  const jobById = Object.fromEntries(attachEmployers(jobs, employers).map(j => [j.job_id, j]));

  return interviews
    .filter(iv => iv.time)
    .map(iv => {
      const job = jobById[iv.job_id];
      const start = new Date(iv.time);
      const duration = iv.duration || DEFAULT_DURATION;
      return {
        ...iv,
        job,
        start,
        end: new Date(start.getTime() + duration * 60000),
        duration,
        title: job?.title || 'Tin tuyển dụng đã bị xóa',
        company: job?.company || '—',
        companyVerified: job?.companyVerified,
        location: job?.location
      };
    });
};

const statusOf = (iv, now) => (now < iv.start ? 'upcoming' : now <= iv.end ? 'live' : 'past');

// Thẻ thống kê: cùng kiểu các trang khác (icon trái, nhãn giữa, số sát phải)
const StatCard = ({ icon, label, value, bgColor }) => {
  const Icon = icon;
  return (
    <div style={{
      background: C.white, borderRadius: 16, border: `1px solid ${C.border}`,
      padding: '16px 20px', ...flex('center'), gap: 16
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: 12, flexShrink: 0,
        background: bgColor, ...flex('center'), justifyContent: 'center'
      }}>
        <Icon size={24} color={C.navy} />
      </div>
      <p style={{ ...txt(14, 500, C.gray), flex: 1, minWidth: 0 }}>{label}</p>
      <p style={{ ...txt(26, 700), flexShrink: 0 }}>{value}</p>
    </div>
  );
};

const InterviewCard = ({ iv, now, onView, onMessage }) => {
  const [hover, setHover] = useState(false);
  const status = statusOf(iv, now);
  const st = STATUS[status];
  const muted = status === 'past';

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        ...card(), padding: 18, display: 'flex', gap: 18, alignItems: 'stretch',
        borderColor: hover ? C.blueBorder : C.border, boxShadow: hover ? SHADOW.md : SHADOW.sm,
        transition: 'all .2s ease', opacity: muted ? 0.8 : 1,
        borderLeft: `4px solid ${status === 'live' ? C.green : muted ? C.border : C.purple}`
      }}
    >
      {/* Nội dung */}
      <div style={{ flex: 1, minWidth: 0, ...flex('stretch', 'column'), gap: 10 }}>
        <div style={{ minWidth: 0, ...flex('flex-start'), justifyContent: 'space-between', gap: 12 }}>
        <div style={{ minWidth: 0 }}>
          {/* Tiêu đề + nhãn trạng thái ngay bên cạnh */}
          <div style={{ ...flex('center'), gap: 10, minWidth: 0 }}>
            <h3 style={{
              ...txt(16, 700, hover ? C.purple : C.navy), lineHeight: 1.35, transition: 'color .2s ease',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0
            }}>
              Phỏng vấn: {iv.title}
            </h3>
            <span style={{
              padding: '3px 10px', borderRadius: 999, background: st.bg, color: st.color,
              fontSize: 12, fontWeight: 600, flexShrink: 0, whiteSpace: 'nowrap'
            }}>
              {st.label}
            </span>
          </div>
          <div style={{ ...flex('center'), gap: 5, marginTop: 2 }}>
            <span style={{ ...txt(13, 400, C.gray), overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{iv.company}</span>
            {iv.companyVerified && <BadgeCheck size={14} color={C.purple} />}
          </div>
        </div>
        {/* Nhãn giờ phỏng vấn ở góc phải trên */}
        <span style={{
          // Cùng cỡ nhãn trạng thái "Sắp diễn ra"
          ...flex('center'), gap: 5, padding: '3px 10px', borderRadius: 999, flexShrink: 0, whiteSpace: 'nowrap',
          background: muted ? C.grayBg : C.blueLight, color: muted ? C.gray : C.purple, fontSize: 12, fontWeight: 600
        }}>
          <Clock size={12} /> {fmtTime(iv.start)} - {fmtTime(iv.end)}
        </span>
        </div>

        <div style={{
          ...flex('center'), justifyContent: 'space-between', gap: 12, flexWrap: 'wrap',
          paddingTop: 10, borderTop: `1px solid ${C.border}`, marginTop: 'auto'
        }}>
          {/* Địa chỉ bọc thẻ */}
          <span style={{
            ...txt(13, 500, C.darkGray), ...flex('center'), gap: 6, minWidth: 0, maxWidth: '100%',
            height: 34, boxSizing: 'border-box', padding: '0 12px', borderRadius: 10, background: C.grayBg, border: `1px solid ${C.border}`
          }}>
            <MapPin size={14} color={C.purple} style={{ flexShrink: 0 }} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {iv.location || 'Địa điểm sẽ được nhà tuyển dụng thông báo'}
            </span>
          </span>
          <div style={{ ...flex('center'), gap: 8, flexShrink: 0 }}>
            {status !== 'past' && (
              <button onClick={() => downloadIcs(iv)} title="Tải file lịch (.ics)" style={btn('ghost')}>
                <CalendarPlus size={14} /> Thêm vào lịch
              </button>
            )}
            <button onClick={() => onView(iv)} disabled={!iv.job} style={btn('ghost', !iv.job)}>
              <Eye size={14} /> Xem tin
            </button>
            <button onClick={() => onMessage(iv)} disabled={!iv.emp_id} style={btn('primary', !iv.emp_id)}>
              <MessageCircle size={14} /> Nhắn tin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const btn = (variant, disabled) => ({
  height: 34, padding: '0 12px', borderRadius: 10, fontSize: 13, fontWeight: 600,
  cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1,
  display: 'flex', alignItems: 'center', gap: 6,
  ...(variant === 'primary'
    ? { border: 'none', background: C.purple, color: C.white }
    : { border: `1px solid ${C.border}`, background: C.white, color: C.navy })
});

export default function InterviewSchedule() {
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState([]);
  // Không có tài khoản ứng viên thì không cần tải
  const [loading, setLoading] = useState(() => !!getCurrentUser()?.candidate_id);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('upcoming');
  const [now, setNow] = useState(() => new Date());
  // Các ngày đang thu gọn
  const [collapsed, setCollapsed] = useState(() => new Set());
  const toggleDay = (key) => setCollapsed(prev => {
    const next = new Set(prev);
    if (next.has(key)) next.delete(key); else next.add(key);
    return next;
  });

  const fetchData = () => {
    const user = getCurrentUser();
    if (!user?.candidate_id) return;
    loadInterviews(user.candidate_id)
      .then(list => { setInterviews(list); setError(''); })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(fetchData, []);

  // Cập nhật trạng thái (sắp diễn ra / đang diễn ra / đã kết thúc) mỗi phút
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  const retry = () => {
    setLoading(true);
    fetchData();
  };

  const counts = useMemo(() => {
    const today = dayKey(now);
    return {
      today: interviews.filter(iv => dayKey(iv.start) === today).length,
      upcoming: interviews.filter(iv => statusOf(iv, now) !== 'past').length,
      past: interviews.filter(iv => statusOf(iv, now) === 'past').length,
      all: interviews.length
    };
  }, [interviews, now]);

  // Lọc + gom theo ngày. Sắp tới: gần nhất trước; đã qua: mới nhất trước
  const groups = useMemo(() => {
    const list = interviews
      .filter(iv => filter === 'all' || (filter === 'past' ? statusOf(iv, now) === 'past' : statusOf(iv, now) !== 'past'))
      .sort((a, b) => (filter === 'past' ? b.start - a.start : a.start - b.start));
    const map = new Map();
    list.forEach(iv => {
      const k = dayKey(iv.start);
      if (!map.has(k)) map.set(k, { date: startOfDay(iv.start), items: [] });
      map.get(k).items.push(iv);
    });
    return [...map.values()];
  }, [interviews, filter, now]);

  return (
    <div style={{ background: C.grayBg, minHeight: '100%' }}>
      <main style={{ padding: '40px 48px' }}>
        <PageHeader title="Lịch phỏng vấn" subtitle="Các buổi phỏng vấn nhà tuyển dụng đã hẹn với bạn" />

        {/* Thống kê */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 16, marginBottom: 24 }}>
          <StatCard icon={CalendarClock} label="Phỏng vấn hôm nay" value={counts.today} bgColor={C.orangeBg} />
          <StatCard icon={CalendarDays} label="Sắp tới" value={counts.upcoming} bgColor={C.blueLight} />
          <StatCard icon={CalendarCheck2} label="Đã qua" value={counts.past} bgColor={C.greenBg} />
        </div>

        {/* Thẻ lọc */}
        <div style={{ ...card(), padding: '12px 16px', marginBottom: 24, ...flex('center'), gap: 10, flexWrap: 'wrap' }}>
          <span style={{ ...txt(14, 600, C.gray), marginRight: 4 }}>Hiển thị:</span>
          {FILTER_TABS.map(tab => {
            const active = filter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                style={{
                  height: 36, padding: '0 16px', borderRadius: 999, cursor: 'pointer',
                  border: `1px solid ${active ? C.purple : C.border}`,
                  background: active ? C.purple : C.grayBg, color: active ? C.white : C.darkGray,
                  fontSize: 13, fontWeight: 600, ...flex('center'), gap: 8
                }}
              >
                {tab.label}
                <span style={{
                  minWidth: 20, height: 20, padding: '0 6px', borderRadius: 999, fontSize: 11, fontWeight: 700,
                  background: active ? 'rgba(255,255,255,0.25)' : C.white, color: active ? C.white : C.gray,
                  ...flex('center'), justifyContent: 'center'
                }}>
                  {counts[tab.id]}
                </span>
              </button>
            );
          })}
        </div>

        {loading ? (
          <StateBox type="loading" title="Đang tải lịch phỏng vấn..." />
        ) : error ? (
          <StateBox type="error" title="Không tải được lịch phỏng vấn" message={error} onRetry={retry} />
        ) : groups.length === 0 ? (
          <StateBox
            icon={CalendarDays}
            title={interviews.length === 0 ? 'Chưa có lịch phỏng vấn' : filter === 'past' ? 'Chưa có buổi phỏng vấn nào đã qua' : 'Không có buổi phỏng vấn sắp tới'}
            message="Khi nhà tuyển dụng hẹn phỏng vấn, lịch hẹn sẽ hiển thị tại đây."
            action={(
              <button
                onClick={() => navigate('/candidate/applied-jobs')}
                style={{
                  height: 42, padding: '0 20px', borderRadius: 12, border: 'none', background: C.purple,
                  color: C.white, fontSize: 14, fontWeight: 600, cursor: 'pointer'
                }}
              >
                Xem việc đã ứng tuyển
              </button>
            )}
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {groups.map(group => {
              const tag = dayLabel(group.date);
              const key = dayKey(group.date);
              const isCollapsed = collapsed.has(key);
              return (
                <section key={key}>
                  {/* Thẻ tiêu đề ngày: bấm để thu gọn / mở danh sách */}
                  <button
                    onClick={() => toggleDay(key)}
                    aria-expanded={!isCollapsed}
                    style={{
                      ...card(), width: '100%', padding: '12px 16px', marginBottom: isCollapsed ? 0 : 12,
                      ...flex('center'), gap: 10, cursor: 'pointer', textAlign: 'left'
                    }}
                  >
                    <span style={{
                      width: 32, height: 32, borderRadius: 9, background: C.blueLight, flexShrink: 0,
                      ...flex('center'), justifyContent: 'center'
                    }}>
                      <CalendarDays size={17} color={C.purple} />
                    </span>
                    <h2 style={{ ...txt(16, 700), textTransform: 'capitalize' }}>
                      {group.date.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </h2>
                    {tag && (
                      <span style={{
                        padding: '3px 10px', borderRadius: 999, fontSize: 12, fontWeight: 600,
                        background: tag === 'Hôm nay' ? C.orangeBg : C.blueLight, color: tag === 'Hôm nay' ? C.orange : C.purple
                      }}>
                        {tag}
                      </span>
                    )}
                    <span style={{
                      padding: '3px 10px', borderRadius: 999, fontSize: 12, fontWeight: 600,
                      background: C.grayBg, border: `1px solid ${C.border}`, color: C.darkGray,
                      ...flex('center'), gap: 5
                    }}>
                      <Clock size={12} /> {group.items.length} buổi
                    </span>
                    <ChevronDown
                      size={18}
                      color={C.gray}
                      style={{ marginLeft: 'auto', transition: 'transform .2s ease', transform: isCollapsed ? 'rotate(-90deg)' : 'none' }}
                    />
                  </button>
                  {!isCollapsed && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, animation: 'slideDown .2s ease' }}>
                    {group.items.map(iv => (
                      <InterviewCard
                        key={iv.interview_id}
                        iv={iv}
                        now={now}
                        onView={x => navigate(`/job-detail/${x.job_id}`)}
                        onMessage={x => navigate(`/candidate/messages?with=${x.emp_id}`)}
                      />
                    ))}
                  </div>
                  )}
                </section>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
