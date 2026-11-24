import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import {
  Globe, Users, MapPin, Search, ChevronLeft, ChevronRight, ChevronDown, Briefcase, Star, BadgeCheck, Building2, Layers, MessageSquareText
} from 'lucide-react';
import { flex, txt, card, field } from '../utils/styles';
import { COLORS, GRADIENT, SHADOW } from '../constants/colors';
import { getEmployerById } from '../services/authService';
import { jobService } from '../services/jobService';
import { feedbackService } from '../services/feedbackService';
import { timeAgo, isJobOpen, normalize, LOCATIONS, matchesLocation } from '../utils/jobFormat';
import JobCard from '../components/JobCard';
import StateBox from '../components/StateBox';
import { getInitials } from '../utils/textUtils';
import Stars from '../components/Stars';

const C = COLORS;
const PAGE_SIZE = 6;

const CardTitle = ({ icon: Icon, children, extra }) => (
  <div style={{ ...flex('center'), justifyContent: 'space-between', marginBottom: 12 }}>
    <h2 style={{ ...txt(18, 700), ...flex('center'), gap: 10 }}>
      <span style={{ width: 34, height: 34, borderRadius: 10, background: C.blueLight, ...flex('center'), justifyContent: 'center' }}>
        <Icon size={17} color={C.purple} />
      </span>
      {children}
    </h2>
    {extra}
  </div>
);

export default function CompanyDetailPage() {
  const { id } = useParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [filters, setFilters] = useState({ q: '', location: '' });
  const [page, setPage] = useState(1);

  const [employer, setEmployer] = useState(null);
  const [allJobs, setAllJobs] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loadState, setLoadState] = useState('loading');

  useEffect(() => {
    Promise.all([
      getEmployerById(id),
      jobService.getJobsByEmployer(id).catch(() => []),
      feedbackService.getByEmployer(id).catch(() => [])
    ])
      .then(([emp, jobs, fbs]) => {
        if (!emp) {
          setLoadState('notfound');
          return;
        }
        setEmployer(emp);
        // Gắn thông tin công ty để thẻ việc làm hiển thị đúng
        setAllJobs(jobs.filter(isJobOpen).map(j => ({ ...j, company: emp.emp_name, companyVerified: !!emp.is_verified })));
        setFeedbacks(fbs);
        setLoadState('ok');
      })
      .catch(() => setLoadState('notfound'));
  }, [id]);

  const filteredJobs = useMemo(() => {
    const q = normalize(filters.q.trim());
    return allJobs.filter(job =>
      (!q || normalize(`${job.title} ${job.role}`).includes(q)) &&
      matchesLocation(job, filters.location)
    );
  }, [allJobs, filters]);

  const totalPages = Math.max(1, Math.ceil(filteredJobs.length / PAGE_SIZE));
  const jobs = filteredJobs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const avgRating = feedbacks.length
    ? feedbacks.reduce((sum, f) => sum + (f.rate || 0), 0) / feedbacks.length
    : 0;

  const applyFilters = () => {
    setFilters({ q: searchQuery, location });
    setPage(1);
  };

  if (!employer) {
    return (
      <div style={{ minHeight: '60vh', ...flex('center'), justifyContent: 'center', ...txt(16, 500, C.gray) }}>
        {loadState === 'loading' ? 'Đang tải thông tin công ty...' : 'Không tìm thấy công ty này.'}
      </div>
    );
  }

  const website = employer.website;
  const meta = [
    employer.field && { icon: Layers, text: employer.field },
    employer.scope && { icon: Users, text: employer.scope },
    employer.address && { icon: MapPin, text: employer.address }
  ].filter(Boolean);

  return (
    <div style={{ fontFamily: "'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif", background: C.grayBg, minHeight: '100vh', paddingBottom: 64 }}>
      <div style={{ background: C.white, borderBottom: `1px solid ${C.border}` }}>
        <div style={{ height: 160, background: GRADIENT.hero, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', width: 360, height: 360, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', top: -180, right: 80 }} />
          <div style={{ position: 'absolute', width: 220, height: 220, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', bottom: -140, left: 120 }} />
        </div>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px 28px', position: 'relative' }}>
          <div style={{ ...flex('flex-start'), justifyContent: 'space-between', gap: 24 }}>
            {/* Logo giãn theo chiều cao khối thông tin: đáy logo chạm đúng hàng ngành / quy mô / địa chỉ */}
            <div style={{ ...flex('flex-end'), gap: 22, minWidth: 0 }}>
              <div style={{
                width: 136, height: 136, borderRadius: 26, background: C.white, padding: 6, flexShrink: 0, boxShadow: SHADOW.md,
                marginTop: -54
              }}>
                <div style={{
                  width: '100%', height: '100%', borderRadius: 20, background: GRADIENT.primary,
                  ...flex('center'), justifyContent: 'center'
                }}>
                  <span style={{ ...txt(38, 800, C.white) }}>{getInitials(employer.emp_name, 'start')}</span>
                </div>
              </div>
              <div style={{ paddingTop: 16, minWidth: 0 }}>
                <div style={{ ...flex('center'), gap: 12, marginBottom: 8 }}>
                  <h1 style={{ ...txt(28, 800), lineHeight: 1.2 }}>{employer.emp_name}</h1>
                  {employer.is_verified && (
                    <span title="Đã xác thực" style={{ display: 'inline-flex', flexShrink: 0 }}>
                      <BadgeCheck size={24} color={C.purple} />
                    </span>
                  )}
                </div>
                <div style={{ ...flex('center'), gap: 8, flexWrap: 'wrap' }}>
                  {meta.map(({ icon: Icon, text }) => (
                    <span key={text} style={{
                      ...txt(13, 500, C.darkGray), ...flex('center'), gap: 6, padding: '5px 12px',
                      borderRadius: 999, background: C.grayBg, border: `1px solid ${C.border}`
                    }}>
                      <Icon size={15} /> {text}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            {website && (
              <a
                href={website}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  height: 44, padding: '0 18px', borderRadius: 12, border: `1px solid ${C.border}`, background: C.white,
                  ...flex('center'), gap: 8, ...txt(14, 600), textDecoration: 'none', flexShrink: 0, marginTop: 18
                }}
              >
                <Globe size={16} color={C.purple} /> Website
              </a>
            )}
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
            {[
              { icon: Briefcase, value: allJobs.length, label: 'việc đang tuyển' },
              { icon: Star, value: feedbacks.length ? avgRating.toFixed(1) : '—', label: `điểm đánh giá (${feedbacks.length})` },
              { icon: Building2, value: employer.is_verified ? 'Có' : 'Chưa', label: 'xác thực doanh nghiệp' }
            ].map(({ icon: Icon, value, label }) => (
              <div key={label} style={{ ...flex('center'), gap: 10, padding: '12px 18px', borderRadius: 14, background: C.grayBg }}>
                <Icon size={18} color={C.purple} />
                {/* Số liệu và chữ mô tả đứng sát nhau như một cụm */}
                <span style={{ ...flex('baseline'), gap: 5 }}>
                  <span style={{ ...txt(15, 700) }}>{value}</span>
                  <span style={{ ...txt(14, 400, C.gray) }}>{label}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 32px 0', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 360px', gap: 24, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Tiêu đề nằm ngoài, nội dung trong thẻ viền đậm trái (như trang chi tiết việc làm) */}
          <section>
            <CardTitle icon={Building2}>Giới thiệu công ty</CardTitle>
            <div style={{ ...card(), padding: '18px 24px', borderLeft: `4px solid ${C.purple}` }}>
              <p style={{ ...txt(15, 400, C.darkGray), lineHeight: 1.8, whiteSpace: 'pre-line' }}>
                {employer.description || 'Công ty chưa cập nhật phần giới thiệu.'}
              </p>
            </div>
          </section>

          <section>
            <CardTitle icon={Briefcase} extra={
              <span style={{
                ...flex('center'), gap: 6, padding: '6px 12px', borderRadius: 999,
                background: C.blueLight, border: `1px solid ${C.blueBorder}`, ...txt(13, 600, C.purple)
              }}>
                <Briefcase size={14} /> {filteredJobs.length} việc làm
              </span>
            }>
              Việc làm đang tuyển
            </CardTitle>
            {/* Thẻ tìm kiếm + lọc địa điểm */}
            <div style={{ ...card(), padding: 14, marginBottom: 16, display: 'grid', gridTemplateColumns: '1fr 200px auto', gap: 10 }}>
              <div style={{ ...flex('center'), gap: 10, ...field() }}>
                <Search size={17} color={C.grayLight} />
                <input
                  placeholder="Tìm vị trí ứng tuyển"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && applyFilters()}
                  style={{ border: 'none', outline: 'none', boxShadow: 'none', fontSize: 14, flex: 1, background: 'transparent' }}
                />
              </div>
              {/* Ẩn mũi tên mặc định của trình duyệt (bị lệch), dùng icon riêng căn giữa */}
              <div style={{ position: 'relative' }}>
                <select
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  style={{
                    width: '100%', height: 44, padding: '0 38px 0 14px', borderRadius: 12, border: `1px solid ${C.fieldBorder}`,
                    background: C.white, fontSize: 14, cursor: 'pointer', appearance: 'none', WebkitAppearance: 'none'
                  }}
                >
                  <option value="">Tất cả địa điểm</option>
                  {Object.entries(LOCATIONS).map(([key, loc]) => (
                    <option key={key} value={key}>{loc.label}</option>
                  ))}
                </select>
                <ChevronDown size={16} color={C.gray} style={{
                  position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none'
                }} />
              </div>
              <button
                onClick={applyFilters}
                style={{ height: 44, padding: '0 20px', borderRadius: 12, border: 'none', background: C.purple, color: C.white, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
              >
                Tìm kiếm
              </button>
            </div>

            {jobs.length === 0 ? (
              <div style={{ ...card(), padding: 8 }}>
                <StateBox
                  compact
                  icon={Briefcase}
                  title={allJobs.length ? 'Không có việc làm phù hợp' : 'Chưa có tin tuyển dụng'}
                  message={allJobs.length ? 'Thử đổi từ khoá hoặc địa điểm khác.' : 'Công ty hiện chưa có tin tuyển dụng nào đang mở.'}
                />
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 14 }}>
                {jobs.map(job => <JobCard key={job.job_id} job={job} hideCompany />)}
              </div>
            )}

            {totalPages > 1 && (
              <div style={{ ...flex('center'), justifyContent: 'center', gap: 12, marginTop: 20 }}>
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  style={{ width: 36, height: 36, borderRadius: 10, border: `1px solid ${C.border}`, background: C.white, cursor: 'pointer', opacity: page <= 1 ? 0.45 : 1, ...flex('center'), justifyContent: 'center' }}
                >
                  <ChevronLeft size={18} />
                </button>
                <span style={{ ...txt(14, 500, C.gray) }}>{page}/{totalPages}</span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  style={{ width: 36, height: 36, borderRadius: 10, border: `1px solid ${C.border}`, background: C.white, cursor: 'pointer', opacity: page >= totalPages ? 0.45 : 1, ...flex('center'), justifyContent: 'center' }}
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </section>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, position: 'sticky', top: 88 }}>
          <section>
          <CardTitle icon={MapPin}>Địa chỉ</CardTitle>
          <div style={{ ...card(), overflow: 'hidden' }}>
            {/* Icon ghim trước địa chỉ */}
            <div style={{ padding: '14px 18px', ...flex('flex-start'), gap: 10, ...txt(14, 500, C.darkGray), lineHeight: 1.6 }}>
              <MapPin size={17} color={C.purple} style={{ flexShrink: 0, marginTop: 2 }} />
              <span>{employer.address || 'Chưa cập nhật'}</span>
            </div>
            {employer.address ? (
              <iframe
                title="Bản đồ công ty"
                src={`https://maps.google.com/maps?q=${encodeURIComponent(employer.address)}&output=embed`}
                width="100%"
                height="220"
                style={{ border: 0, display: 'block', borderTop: `1px solid ${C.border}` }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            ) : null}
          </div>
          </section>

          <section>
          <CardTitle icon={Star}>Đánh giá từ ứng viên</CardTitle>
          <div style={{ ...card(), padding: 18 }}>
            {/* Thẻ tổng quan: trái là nội dung, phải là sao + điểm trung bình */}
            {feedbacks.length > 0 && (
              <div style={{
                ...flex('center'), justifyContent: 'space-between', gap: 12, padding: '12px 14px', marginBottom: 10,
                borderRadius: 12, background: C.blueLight, border: `1px solid ${C.blueBorder}`
              }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ ...txt(14, 600) }}>Điểm trung bình</div>
                  <div style={{ ...txt(12, 400, C.gray) }}>Dựa trên {feedbacks.length} đánh giá</div>
                </div>
                <div style={{ ...flex('flex-end', 'column'), gap: 2, flexShrink: 0 }}>
                  <Stars value={avgRating} />
                  <span style={{ ...txt(16, 800, C.purple) }}>{avgRating.toFixed(1)}</span>
                </div>
              </div>
            )}
            {feedbacks.length === 0 ? (
              <StateBox
                compact
                icon={MessageSquareText}
                title="Chưa có đánh giá nào"
                message="Đánh giá của ứng viên đã làm việc tại công ty sẽ hiển thị ở đây."
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {feedbacks.slice(0, 5).map((fb, i) => (
                  // Mỗi đánh giá là một thẻ: hàng trên (sao + điểm | thời gian), kẻ phân cách, rồi nội dung
                  <div key={fb.feedback_id || i} style={{
                    padding: '12px 14px', borderRadius: 12, background: C.grayBg, border: `1px solid ${C.border}`
                  }}>
                    <div style={{
                      ...flex('center'), justifyContent: 'space-between', gap: 12,
                      paddingBottom: 10, marginBottom: 10, borderBottom: `1px solid ${C.border}`
                    }}>
                      <span style={{ ...flex('center'), gap: 6 }}>
                        <Stars value={fb.rate || 0} size={13} />
                        <span style={{ ...txt(13, 700) }}>{(fb.rate || 0).toFixed(1)}</span>
                      </span>
                      <span style={{ ...txt(12, 400, C.grayLight), flexShrink: 0 }}>{timeAgo(fb.created_at)}</span>
                    </div>
                    <p style={{ ...txt(14, 400, fb.comment ? C.darkGray : C.grayLight), lineHeight: 1.6 }}>
                      {fb.comment ? `“${fb.comment}”` : 'Không có nhận xét'}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
          </section>
        </div>
      </div>
    </div>
  );
}
