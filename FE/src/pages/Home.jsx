import { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  MapPin, ChevronLeft, ChevronRight, Coffee, ShoppingCart, GraduationCap, Monitor, Megaphone, Truck, Palette, FileText, Search, ShieldCheck, Briefcase, Building2, ArrowRight, Sparkles, Plus
} from 'lucide-react';
import { COLORS, SHADOW, GRADIENT, DARK } from '../constants/colors';
import { jobService } from '../services/jobService';
import { getCurrentUser } from '../services/authService';
import { LOCATIONS, matchesIndustry } from '../utils/jobFormat';
import JobCard from '../components/JobCard';
import StateBox from '../components/StateBox';
import { formatNumber } from '../utils/textUtils';
import Select from '../components/Select';

const C = COLORS;
const CONTAINER = { maxWidth: 1200, margin: '0 auto', padding: '0 32px' };

// Mỗi ngành một màu gradient riêng (dùng cho thẻ "Khám phá theo lĩnh vực")
const CATEGORIES = [
  { key: 'fnb', icon: Coffee, title: 'F&B - Nhà hàng', gradient: GRADIENT.warning },
  { key: 'retail', icon: ShoppingCart, title: 'Bán hàng', gradient: 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)' },
  { key: 'education', icon: GraduationCap, title: 'Gia sư - Dạy học', gradient: GRADIENT.purple },
  { key: 'tech', icon: Monitor, title: 'Công nghệ thông tin', gradient: 'linear-gradient(135deg, #2563eb 0%, #60a5fa 100%)' },
  { key: 'marketing', icon: Megaphone, title: 'Marketing', gradient: GRADIENT.danger },
  { key: 'delivery', icon: Truck, title: 'Giao hàng', gradient: GRADIENT.cyan },
  { key: 'design', icon: Palette, title: 'Thiết kế', gradient: 'linear-gradient(135deg, #9333ea 0%, #c084fc 100%)' },
  { key: 'office', icon: FileText, title: 'Hành chính', gradient: GRADIENT.success }
];

// dark: dùng trên nền tối (chữ sáng)
const SectionTitle = ({ eyebrow, title, action, dark = false }) => (
  <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 28, gap: 16 }}>
    <div>
      <p style={{ fontSize: 13, fontWeight: 700, color: dark ? DARK.active : C.purple, letterSpacing: '.06em', marginBottom: 6 }}>{eyebrow}</p>
      <h2 style={{ fontSize: 30, fontWeight: 800, color: dark ? C.white : C.navy, letterSpacing: '-0.02em' }}>{title}</h2>
    </div>
    {action}
  </div>
);

/* ─── Hero ─────────────────────────────────────────────────── */

const HeroSection = ({ jobs, companies, error }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');

  const search = () => {
    const params = new URLSearchParams();
    if (query.trim()) params.set('q', query.trim());
    if (location) params.set('location', location);
    navigate(`/jobs${params.toString() ? `?${params}` : ''}`);
  };

  const stats = [
    { icon: Briefcase, value: error ? '—' : jobs === null ? '…' : formatNumber(jobs.length), label: 'Việc làm đang tuyển', gradient: GRADIENT.purple, tint: C.blueLight, border: C.blueBorder, color: C.purpleDark },
    { icon: Building2, value: error ? '—' : companies === null ? '…' : formatNumber(companies.total), label: 'Nhà tuyển dụng', gradient: GRADIENT.warning, tint: C.orangeBg, border: C.orangeLight, color: C.orangeDark },
    { icon: ShieldCheck, value: error ? '—' : companies === null ? '…' : formatNumber(companies.verified), label: 'Doanh nghiệp đã xác thực', gradient: GRADIENT.success, tint: C.greenBg, border: C.greenBorder, color: C.greenDark }
  ];

  return (
    <section style={{
      position: 'relative', overflow: 'hidden',
      background: GRADIENT.hero,
      padding: '72px 0 88px'
    }}>
      {/* Vòng tròn trang trí trên nền tím */}
      <div style={{ position: 'absolute', width: 520, height: 520, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', top: -260, right: -120 }} />
      <div style={{ position: 'absolute', width: 320, height: 320, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', bottom: -180, left: -60 }} />

      <div style={{ ...CONTAINER, position: 'relative', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 320px', gap: 48, alignItems: 'center' }}>
        <div>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 999,
            background: 'rgba(255,255,255,0.14)', border: '1px solid rgba(255,255,255,0.3)', color: C.white, fontSize: 13, fontWeight: 600, marginBottom: 22
          }}>
            <Sparkles size={15} /> Nền tảng việc làm part-time cho sinh viên
          </span>
          <h1 style={{ fontSize: 52, fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.035em', color: C.white, marginBottom: 18 }}>
            Tìm việc part-time <span style={{ background: GRADIENT.highlight, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>uy tín</span>, phù hợp lịch học của bạn
          </h1>
          <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.85)', lineHeight: 1.7, marginBottom: 32, maxWidth: 640 }}>
            Hàng trăm công việc từ các nhà tuyển dụng đã được xác thực. Ứng tuyển trong vài giây, nhận phản hồi ngay trên Unijob.
          </p>

          <div style={{
            display: 'flex', alignItems: 'center', background: C.white, borderRadius: 16, padding: 8,
            boxShadow: '0 20px 40px rgba(30, 20, 90, 0.35)', maxWidth: 760
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, padding: '0 14px' }}>
              <Search size={19} color={C.grayLight} />
              <input
                type="text"
                placeholder="Vị trí, kỹ năng hoặc tên công ty"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && search()}
                style={{ flex: 1, border: 'none', outline: 'none', boxShadow: 'none', padding: '12px 0', fontSize: 15, background: 'transparent' }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 16px', width: 230, flexShrink: 0, borderLeft: `1px solid ${C.border}` }}>
              <MapPin size={18} color={C.grayLight} />
              <Select wrapperStyle={{ flex: 1, minWidth: 0 }} iconRight={0}
                value={location}
                onChange={e => setLocation(e.target.value)}
                style={{ flex: 1, minWidth: 0, border: 'none', outline: 'none', boxShadow: 'none', fontSize: 14, fontWeight: 500, background: 'transparent', cursor: 'pointer', padding: '12px 0' }}
              >
                <option value="">Tất cả địa điểm</option>
                {Object.entries(LOCATIONS).map(([key, loc]) => (
                  <option key={key} value={key}>{loc.label}</option>
                ))}
              </Select>
            </div>
            <button
              onClick={search}
              style={{
                padding: '13px 24px', borderRadius: 12, border: 'none', background: C.purple, color: C.white,
                fontSize: 15, fontWeight: 600, cursor: 'pointer', boxShadow: SHADOW.primary,
                display: 'flex', alignItems: 'center', gap: 8
              }}
            >
              <Search size={17} /> Tìm việc
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginTop: 20 }}>
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)' }}>Phổ biến:</span>
            {CATEGORIES.slice(0, 4).map(cat => (
              <Link
                key={cat.key}
                to={`/jobs?industry=${cat.key}`}
                style={{
                  padding: '5px 12px', borderRadius: 999, background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.28)',
                  color: C.white, fontSize: 13, fontWeight: 500, textDecoration: 'none'
                }}
              >
                {cat.title}
              </Link>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Mỗi thẻ một màu: nền nhạt + ô icon gradient + số cùng tông */}
          {stats.map(({ icon: Icon, value, label, gradient, tint, border, color }, i) => (
            <div key={label} style={{
              display: 'flex', alignItems: 'center', gap: 16, padding: '20px 22px', borderRadius: 18,
              background: `linear-gradient(135deg, ${C.white} 0%, ${tint} 100%)`, border: `1px solid ${border}`,
              boxShadow: SHADOW.md, marginLeft: i === 1 ? 24 : 0
            }}>
              <div style={{
                width: 52, height: 52, borderRadius: 14, background: gradient,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                boxShadow: '0 8px 18px rgba(15, 23, 42, 0.15)'
              }}>
                <Icon size={24} color={C.white} />
              </div>
              <div>
                <p style={{ fontSize: 26, fontWeight: 800, color, letterSpacing: '-0.02em', lineHeight: 1.1 }}>{value}</p>
                <p style={{ fontSize: 14, color: C.gray, marginTop: 4 }}>{label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ─── Ngành nghề ───────────────────────────────────────────── */

const CategoryCard = ({ icon, title, count, gradient, onClick }) => {
  const [hover, setHover] = useState(false);
  const Icon = icon;
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: 'relative', overflow: 'hidden', borderRadius: 16, padding: 22, cursor: 'pointer',
        background: gradient,
        boxShadow: hover ? '0 14px 30px rgba(15, 23, 42, 0.18)' : SHADOW.sm,
        transform: hover ? 'translateY(-3px)' : 'none', filter: hover ? 'saturate(1.15)' : 'none',
        transition: 'all .2s ease', display: 'flex', alignItems: 'center', gap: 16
      }}
    >
      {/* Vòng tròn trang trí góc phải */}
      <div style={{
        position: 'absolute', width: 120, height: 120, borderRadius: '50%', pointerEvents: 'none',
        background: 'rgba(255,255,255,0.14)', top: -50, right: -36,
        transform: hover ? 'scale(1.15)' : 'none', transition: 'transform .3s ease'
      }} />
      <div style={{
        width: 52, height: 52, borderRadius: 14, flexShrink: 0, position: 'relative',
        background: 'rgba(255,255,255,0.22)', border: '1px solid rgba(255,255,255,0.35)',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <Icon size={24} color={C.white} strokeWidth={1.9} />
      </div>
      <div style={{ minWidth: 0, position: 'relative' }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: C.white, margin: 0 }}>{title}</h3>
        <p style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.85)', margin: '3px 0 0' }}>{count}</p>
      </div>
    </div>
  );
};

const CategoriesSection = ({ jobs }) => {
  const navigate = useNavigate();
  // Nền tối để các thẻ ngành nghề màu nổi bật
  return (
    <section style={{ position: 'relative', overflow: 'hidden', background: GRADIENT.dark, padding: '80px 0' }}>
      <div style={{ position: 'absolute', width: 480, height: 480, borderRadius: '50%', background: 'radial-gradient(circle, rgba(143,130,255,0.25) 0%, rgba(143,130,255,0) 70%)', top: -200, right: -120, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', width: 380, height: 380, borderRadius: '50%', background: 'radial-gradient(circle, rgba(236,72,153,0.15) 0%, rgba(236,72,153,0) 70%)', bottom: -180, left: -100, pointerEvents: 'none' }} />
      <div style={{ ...CONTAINER, position: 'relative' }}>
        <SectionTitle dark eyebrow="NGÀNH NGHỀ" title="Khám phá theo lĩnh vực" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {CATEGORIES.map(({ key, ...cat }) => (
            <CategoryCard
              key={key}
              {...cat}
              count={jobs === null ? '…' : `${formatNumber(jobs.filter(job => matchesIndustry(job, key)).length)} việc làm`}
              onClick={() => navigate(`/jobs?industry=${key}`)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

/* ─── Việc làm mới nhất ────────────────────────────────────── */

const HOME_PAGE_SIZE = 4; // 2 hàng x 2 thẻ

// Nút phân trang trên nền tối: bấm được thì nền trắng, bị vô hiệu thì kính mờ
const navBtn = (disabled) => ({
  width: 40, height: 40, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
  border: `1px solid ${disabled ? 'rgba(255,255,255,0.18)' : C.border}`,
  background: disabled ? 'rgba(255,255,255,0.08)' : C.white,
  cursor: disabled ? 'not-allowed' : 'pointer'
});

const JobsSection = ({ allJobs, error, onRetry }) => {
  const [page, setPage] = useState(1);
  const list = allJobs || [];
  const totalPages = Math.max(1, Math.ceil(list.length / HOME_PAGE_SIZE));
  const jobs = list.slice((page - 1) * HOME_PAGE_SIZE, page * HOME_PAGE_SIZE);

  // Nền tối tông xanh than, khác với tông tím của mục ngành nghề
  return (
    <section style={{ position: 'relative', overflow: 'hidden', background: GRADIENT.night, padding: '80px 0' }}>
      <div style={{ position: 'absolute', width: 460, height: 460, borderRadius: '50%', background: 'radial-gradient(circle, rgba(14,165,233,0.18) 0%, rgba(14,165,233,0) 70%)', top: -200, left: -120, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', width: 420, height: 420, borderRadius: '50%', background: 'radial-gradient(circle, rgba(109,93,252,0.2) 0%, rgba(109,93,252,0) 70%)', bottom: -200, right: -100, pointerEvents: 'none' }} />
      <div style={{ ...CONTAINER, position: 'relative' }}>
        <SectionTitle
          dark
          eyebrow="MỚI CẬP NHẬT"
          title="Việc làm mới nhất"
          action={
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} style={navBtn(page <= 1)}>
                <ChevronLeft size={18} color={page <= 1 ? DARK.label : C.darkGray} />
              </button>
              <span style={{ fontSize: 14, fontWeight: 600, color: DARK.text, minWidth: 48, textAlign: 'center' }}>{page}/{totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} style={navBtn(page >= totalPages)}>
                <ChevronRight size={18} color={page >= totalPages ? DARK.label : C.darkGray} />
              </button>
              <Link
                to="/jobs"
                style={{
                  marginLeft: 8, height: 40, padding: '0 16px', borderRadius: 12,
                  border: `1px solid ${C.blueBorder}`, background: C.blueLight,
                  display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 600,
                  color: C.purple, textDecoration: 'none', transition: 'all .18s ease'
                }}
                onMouseEnter={e => { e.currentTarget.style.background = C.purple; e.currentTarget.style.color = C.white; e.currentTarget.style.borderColor = C.purple; }}
                onMouseLeave={e => { e.currentTarget.style.background = C.blueLight; e.currentTarget.style.color = C.purple; e.currentTarget.style.borderColor = C.blueBorder; }}
              >
                Xem tất cả <ArrowRight size={16} />
              </Link>
            </div>
          }
        />
        {error ? (
          <StateBox
            type="error"
            title="Không tải được việc làm"
            message={error}
            onRetry={onRetry}
          />
        ) : allJobs === null ? (
          <StateBox type="loading" title="Đang tải việc làm..." />
        ) : jobs.length === 0 ? (
          <StateBox type="empty" title="Chưa có tin tuyển dụng nào" message="Các tin tuyển dụng mới sẽ xuất hiện tại đây." />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 18 }}>
            {jobs.map(job => <JobCard key={job.job_id} job={job} />)}
          </div>
        )}
      </div>
    </section>
  );
};

/* ─── Kêu gọi nhà tuyển dụng ───────────────────────────────── */

// Khối kêu gọi nhà tuyển dụng:
//  - NTD đã đăng nhập → vào thẳng trang Tin tuyển dụng và mở form tạo tin
//  - Chưa đăng nhập → đăng ký / đăng nhập với vai trò nhà tuyển dụng
//  - Ứng viên / quản trị → ẩn
const EmployerCta = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();
  if (user && user.role !== 'employer') return null;
  const isEmployer = user?.role === 'employer';

  const primaryBtn = {
    position: 'relative', flexShrink: 0, padding: '14px 26px', borderRadius: 12, border: 'none',
    background: C.white, color: C.purple, fontSize: 15, fontWeight: 700, cursor: 'pointer',
    display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 8px 24px rgba(15,23,42,0.18)'
  };
  const ghostBtn = {
    ...primaryBtn, background: 'rgba(255,255,255,0.14)', color: C.white,
    border: '1px solid rgba(255,255,255,0.4)', boxShadow: 'none'
  };

  return (
    <section style={{ padding: '0 0 88px' }}>
      <div style={CONTAINER}>
        <div style={{
          position: 'relative', overflow: 'hidden', borderRadius: 24, background: GRADIENT.hero,
          padding: '48px 56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 32
        }}>
          <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.10)', top: -120, right: 160 }} />
          <div style={{ position: 'relative' }}>
            <h2 style={{ fontSize: 30, fontWeight: 800, color: C.white, letterSpacing: '-0.02em', marginBottom: 10 }}>
              {isEmployer ? `Đăng tin mới cho ${user.name || 'công ty bạn'}` : 'Bạn đang cần tuyển nhân sự part-time?'}
            </h2>
            <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.85)', maxWidth: 560, lineHeight: 1.6 }}>
              {isEmployer
                ? 'Tạo tin tuyển dụng chỉ trong vài phút và theo dõi hồ sơ ứng viên ngay trong trang quản lý.'
                : 'Tạo tài khoản nhà tuyển dụng miễn phí để đăng tin, tiếp cận hàng ngàn sinh viên năng động và quản lý ứng viên trên một nền tảng.'}
            </p>
          </div>
          {isEmployer ? (
            <button onClick={() => navigate('/employer/jobs?new=1')} style={primaryBtn}>
              <Plus size={17} /> Đăng tin tuyển dụng
            </button>
          ) : (
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
              <button onClick={() => navigate('/login?role=employer')} style={ghostBtn}>
                Đăng nhập
              </button>
              <button onClick={() => navigate('/register?role=employer')} style={primaryBtn}>
                Đăng ký nhà tuyển dụng <ArrowRight size={17} />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default function Home() {
  const [jobs, setJobs] = useState(null);
  const [companies, setCompanies] = useState(null);
  const [error, setError] = useState('');

  const load = () =>
    jobService.getPublicJobs()
      .then(list => {
        setError('');
        setJobs(list);
        // Đếm nhà tuyển dụng từ danh sách tin đã gắn thông tin công ty
        const emps = new Map();
        list.forEach(j => j.employer && emps.set(j.employer.emp_id, j.employer));
        setCompanies({ total: emps.size, verified: [...emps.values()].filter(e => e.is_verified).length });
      })
      .catch(err => { setError(err.message); setJobs([]); setCompanies({ total: 0, verified: 0 }); });

  useEffect(() => { load(); }, []);

  const retry = () => {
    setError('');
    setJobs(null);
    setCompanies(null);
    load();
  };

  const publicJobs = useMemo(() => (error ? [] : jobs), [jobs, error]);

  return (
    <div style={{ fontFamily: "'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif", background: C.grayBg }}>
      <HeroSection jobs={publicJobs} companies={companies} error={error} />
      <CategoriesSection jobs={publicJobs} />
      <JobsSection allJobs={jobs} error={error} onRetry={retry} />
      <EmployerCta />
    </div>
  );
}
