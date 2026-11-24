import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Briefcase, ChevronLeft, ChevronRight, Coffee, ShoppingCart, GraduationCap, Laptop,
  Building2, HeartPulse, Plane, Layers, MapPin, BadgeCheck, Eye, SearchX
} from 'lucide-react';
import { COLORS, SHADOW, GRADIENT } from '../constants/colors';
import { getAllEmployers } from '../services/authService';
import { jobService } from '../services/jobService';
import { normalize } from '../utils/jobFormat';
import { field } from '../utils/styles';
import Select from '../components/Select';

const C = COLORS;
const PAGE_SIZE = 8; // 4 hàng x 2 thẻ

// Ngành nghề trong hồ sơ công ty (trường "field")
const FIELD_ICONS = {
  'F&B': Coffee, 'Bán lẻ': ShoppingCart, 'Giáo dục': GraduationCap,
  'Công nghệ': Laptop, 'Y tế': HeartPulse, 'Du lịch': Plane
};
const FIELDS = ['F&B', 'Bán lẻ', 'Công nghệ', 'Giáo dục', 'Y tế', 'Du lịch', 'Khác'];

const CompanyCard = ({ company }) => {
  const navigate = useNavigate();
  const [hover, setHover] = useState(false);
  const IconComponent = company.icon;

  return (
    <div
      onClick={() => navigate(`/company-detail/${company.id}`)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: C.white, borderRadius: 18, padding: 22, cursor: 'pointer', minWidth: 0,
        border: `1px solid ${hover ? C.blueBorder : C.border}`,
        boxShadow: hover ? SHADOW.md : SHADOW.sm, transform: hover ? 'translateY(-2px)' : 'none',
        transition: 'all .2s ease', display: 'flex', flexDirection: 'column', gap: 16
      }}
    >
      <div style={{ display: 'flex', alignItems: 'stretch', gap: 14 }}>
        {/* Icon vuông, cao đúng bằng khối tên công ty + ngành bên cạnh */}
        <div style={{
          alignSelf: 'stretch', aspectRatio: '1 / 1', borderRadius: 12, flexShrink: 0,
          background: hover ? GRADIENT.primary : C.blueLight,
          display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background .2s ease'
        }}>
          <IconComponent size={22} color={hover ? C.white : C.purple} />
        </div>
        <div style={{ flex: 1, minWidth: 0, minHeight: 44, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: C.navy, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {company.name}
            </h3>
            {company.verified && <BadgeCheck size={17} color={C.purple} style={{ flexShrink: 0 }} />}
          </div>
          <p style={{ fontSize: 13, color: C.gray, marginTop: 2, display: 'flex', alignItems: 'center', gap: 5 }}>
            <Layers size={13} /> {company.industry}
          </p>
        </div>
      </div>

      {/* Phần giới thiệu bọc thẻ: nền xám nhạt + viền tím đậm bên trái (giống trang chi tiết công ty) */}
      <div style={{
        background: C.grayBg, borderLeft: `4px solid ${C.purple}`, borderRadius: 10, padding: '10px 14px'
      }}>
        <p style={{
          fontSize: 14, color: C.darkGray, lineHeight: 1.6,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
        }}>
          {company.description || 'Công ty chưa cập nhật phần giới thiệu.'}
        </p>
      </div>

      {/* Giãn ra để đường kẻ + hàng dưới luôn sát đáy thẻ, thẳng hàng với các thẻ khác */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', gap: 6, fontSize: 13, color: C.gray, minWidth: 0 }}>
        <MapPin size={14} style={{ flexShrink: 0, marginTop: 2 }} />
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{company.address || 'Chưa cập nhật địa chỉ'}</span>
      </div>

      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        paddingTop: 14, borderTop: `1px solid ${C.border}`
      }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 999,
          background: company.jobs ? C.greenBg : C.grayBg, color: company.jobs ? C.green : C.gray, fontSize: 12, fontWeight: 600
        }}>
          <Briefcase size={13} /> {company.jobs} việc đang tuyển
        </span>
        <button
          onClick={e => { e.stopPropagation(); navigate(`/company-detail/${company.id}`); }}
          style={{
            height: 36, padding: '0 14px', borderRadius: 10, cursor: 'pointer',
            border: `1px solid ${hover ? C.purple : C.blueBorder}`,
            background: hover ? C.purple : C.blueLight, color: hover ? C.white : C.purple,
            display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, flexShrink: 0
          }}
        >
          <Eye size={15} /> Xem công ty
        </button>
      </div>
    </div>
  );
};

const loadCompanies = async () => {
  // Tin đang mở lấy từ API tìm kiếm công khai (đã lọc tin tắt / hết hạn ở BE)
  const [employers, openJobs] = await Promise.all([getAllEmployers(), jobService.searchJobs()]);
  return employers
    .map(emp => ({
      id: emp.emp_id,
      name: emp.emp_name,
      industry: emp.field || 'Chưa cập nhật ngành nghề',
      field: emp.field || '',
      description: emp.description,
      address: emp.address,
      jobs: openJobs.filter(j => j.employer_id === emp.emp_id).length,
      icon: FIELD_ICONS[emp.field] || Building2,
      verified: !!emp.is_verified
    }))
    // Công ty đã xác thực và có nhiều tin đang tuyển lên trước
    .sort((a, b) => (b.verified - a.verified) || (b.jobs - a.jobs) || a.name.localeCompare(b.name));
};

export default function CompanyPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [industry, setIndustry] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [allCompanies, setAllCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ q: '', field: '' });

  useEffect(() => {
    loadCompanies()
      .then(setAllCompanies)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const applyFilters = (next = { q: searchQuery, field: industry }) => {
    setFilters(next);
    setCurrentPage(1);
  };

  const filtered = useMemo(() => {
    const q = normalize(filters.q.trim());
    return allCompanies.filter(c =>
      (!q || normalize(`${c.name} ${c.industry}`).includes(q)) &&
      (!filters.field || c.field === filters.field)
    );
  }, [allCompanies, filters]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const companies = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div style={{ fontFamily: "'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif", background: C.grayBg, minHeight: '100vh' }}>
      <section style={{ background: GRADIENT.hero, padding: '56px 32px 96px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', width: 420, height: 420, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', top: -200, right: -60 }} />
        {/* Tiêu đề bên trái, dòng mô tả bọc thẻ kính mờ nằm sát mép phải */}
        <div style={{
          maxWidth: 1200, margin: '0 auto', position: 'relative',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap'
        }}>
          <h1 style={{ fontSize: 40, fontWeight: 800, color: C.white, letterSpacing: '-0.03em' }}>
            Nhà tuyển dụng uy tín
          </h1>
          {/* Cùng kiểu nhãn kính mờ ở trang chủ ("Nền tảng việc làm part-time cho sinh viên") */}
          <p style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 999,
            background: 'rgba(255,255,255,0.14)', border: '1px solid rgba(255,255,255,0.3)',
            color: C.white, fontSize: 13, fontWeight: 600, maxWidth: 640
          }}>
            <Building2 size={15} style={{ flexShrink: 0 }} />
            <span>
              Tìm hiểu về công ty, văn hóa làm việc và cơ hội nghề nghiệp
              {allCompanies.length > 0 && ` tại ${allCompanies.length} doanh nghiệp`}
            </span>
          </p>
        </div>
      </section>

      <div style={{ maxWidth: 1264, margin: '-56px auto 0', padding: '0 32px 72px', position: 'relative' }}>
        <div style={{
          background: C.white, borderRadius: 18, padding: 14, boxShadow: SHADOW.lg, border: `1px solid ${C.border}`,
          display: 'grid', gridTemplateColumns: '2fr 1fr auto', gap: 10, marginBottom: 20
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, ...field({ height: 48 }) }}>
            <Search size={18} color={C.grayLight} />
            <input
              placeholder="Tìm theo tên công ty hoặc ngành nghề"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && applyFilters()}
              style={{ border: 'none', outline: 'none', boxShadow: 'none', background: 'transparent', fontSize: 15, flex: 1 }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, ...field({ height: 48 }) }}>
            <Layers size={18} color={C.grayLight} />
            <Select wrapperStyle={{ flex: 1, minWidth: 0 }} iconRight={0}
              value={industry}
              onChange={e => setIndustry(e.target.value)}
              style={{ border: 'none', outline: 'none', boxShadow: 'none', background: 'transparent', fontSize: 14, flex: 1, cursor: 'pointer' }}
            >
              <option value="">Tất cả ngành nghề</option>
              {FIELDS.map(f => <option key={f} value={f}>{f}</option>)}
            </Select>
          </div>
          <button
            onClick={() => applyFilters()}
            style={{
              padding: '0 28px', height: 48, borderRadius: 12, border: 'none', background: C.purple, color: C.white,
              fontSize: 15, fontWeight: 600, cursor: 'pointer', boxShadow: SHADOW.primary,
              display: 'flex', alignItems: 'center', gap: 8
            }}
          >
            <Search size={17} /> Tìm kiếm
          </button>
        </div>

        <div style={{
          background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, boxShadow: SHADOW.sm,
          minHeight: 64, padding: '12px 20px', marginBottom: 20, display: 'flex', alignItems: 'center'
        }}>
          <p style={{ fontSize: 15, color: C.gray }}>
            {loading ? 'Đang tải...' : <>Có <b style={{ color: C.navy }}>{filtered.length}</b> nhà tuyển dụng{filters.q || filters.field ? ' phù hợp' : ''}</>}
          </p>
        </div>

        {companies.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 18 }}>
            {companies.map(company => <CompanyCard key={company.id} company={company} />)}
          </div>
        ) : !loading && (
          <div style={{ background: C.white, borderRadius: 18, border: `1px solid ${C.border}`, padding: '64px 32px', textAlign: 'center' }}>
            <div style={{
              width: 64, height: 64, borderRadius: 18, background: error ? C.redBg : C.blueLight, margin: '0 auto 16px',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <SearchX size={28} color={error ? C.red : C.purple} />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 6 }}>
              {error ? 'Không tải được danh sách công ty' : 'Không tìm thấy công ty phù hợp'}
            </h3>
            <p style={{ fontSize: 14, color: error ? C.red : C.gray }}>{error || 'Thử đổi từ khóa hoặc ngành nghề.'}</p>
          </div>
        )}

        {totalPages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 36 }}>
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              style={{ width: 40, height: 40, borderRadius: 12, border: `1px solid ${C.border}`, background: C.white, cursor: 'pointer', opacity: currentPage === 1 ? 0.45 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <ChevronLeft size={18} />
            </button>
            <span style={{ fontSize: 14, fontWeight: 600, color: C.gray }}>{currentPage}/{totalPages}</span>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage >= totalPages}
              style={{ width: 40, height: 40, borderRadius: 12, border: `1px solid ${C.border}`, background: C.white, cursor: 'pointer', opacity: currentPage >= totalPages ? 0.45 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
