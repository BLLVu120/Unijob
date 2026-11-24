import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, MapPin, Layers, ChevronLeft, ChevronRight, ChevronDown, SearchX, SlidersHorizontal, Clock, X, ArrowUpDown, Briefcase } from 'lucide-react';
import { COLORS, SHADOW, GRADIENT } from '../constants/colors';
import { jobService } from '../services/jobService';
import {
  INDUSTRIES, LOCATIONS, matchesIndustry, matchesLocation
} from '../utils/jobFormat';
import JobCard from '../components/JobCard';
import { formatNumber } from '../utils/textUtils';
import Select from '../components/Select';

const C = COLORS;
const PAGE_SIZE = 12;

const FIELD_BOX = {
  display: 'flex', alignItems: 'center', gap: 10, padding: '0 14px', height: 48,
  borderRadius: 12, background: C.white, border: `1px solid ${C.fieldBorder}`
};
const BARE_INPUT = {
  border: 'none', outline: 'none', boxShadow: 'none', background: 'transparent', fontSize: 15, flex: 1, minWidth: 0
};

// Lọc theo thời gian đăng (số ngày)
const POSTED = [
  { value: '', label: 'Tất cả' },
  { value: '1', label: '24 giờ qua' },
  { value: '3', label: '3 ngày qua' },
  { value: '7', label: '7 ngày qua' },
  { value: '30', label: '30 ngày qua' }
];

// Một nhóm điều kiện lọc dạng nút chọn
const FilterGroup = ({ icon: Icon, title, options, value, onChange, last }) => (
  <div style={{ marginBottom: last ? 0 : 16 }}>
    <p style={{ fontSize: 13, fontWeight: 700, color: C.darkGray, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
      <Icon size={15} color={C.purple} /> {title}
    </p>
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {options.map(opt => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value || 'all'}
            onClick={() => onChange(opt.value)}
            style={{
              padding: '7px 14px', borderRadius: 999, fontSize: 13, fontWeight: 600, cursor: 'pointer',
              border: `1px solid ${active ? C.purple : C.border}`,
              background: active ? C.purple : C.white, color: active ? C.white : C.darkGray
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  </div>
);

const SORTS = {
  // Khóa trùng với sort_by của BE (GET /v1/job/search)
  newest: { label: 'Mới nhất' },
  oldest: { label: 'Cũ nhất' },
  salary: { label: 'Lương cao nhất' }
};
const SORT_OPTIONS = Object.entries(SORTS).map(([value, s]) => ({ value, label: s.label }));

export default function JobPage() {
  const [searchParams] = useSearchParams();
  const initial = {
    query: searchParams.get('q') || '',
    industry: INDUSTRIES[searchParams.get('industry')] ? searchParams.get('industry') : '',
    location: LOCATIONS[searchParams.get('location')] ? searchParams.get('location') : ''
  };
  const [searchQuery, setSearchQuery] = useState(initial.query);
  const [industry, setIndustry] = useState(initial.industry);
  const [location, setLocation] = useState(initial.location);
  const [filters, setFilters] = useState({ ...initial, posted: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [result, setResult] = useState({ key: null, jobs: [], error: '' });
  const [total, setTotal] = useState(null);
  const [page, setPage] = useState(1);

  // Từ khoá + sắp xếp do BE xử lý (tìm không phân biệt dấu); ngành / địa điểm / ngày đăng lọc tại trình duyệt
  const searchKey = `${filters.query.trim()}|${sortBy}`;
  useEffect(() => {
    let cancelled = false;
    const keyword = filters.query.trim();
    jobService.searchJobs({ keyword, sortBy })
      .then(jobs => {
        if (cancelled) return;
        setResult({ key: searchKey, jobs, error: '' });
        if (!keyword) setTotal(jobs.length);
      })
      .catch(err => !cancelled && setResult({ key: searchKey, jobs: [], error: err.message }));
    return () => { cancelled = true; };
  }, [searchKey, filters.query, sortBy]);

  // Mở trang kèm sẵn từ khoá (?q=...) → lấy riêng tổng số tin cho dòng giới thiệu
  useEffect(() => {
    if (!initial.query) return;
    jobService.searchJobs().then(jobs => setTotal(jobs.length)).catch(() => {});
  }, [initial.query]);

  const loading = result.key !== searchKey;
  const allJobs = result.jobs;
  const error = result.error;

  const applyFilters = (next = { ...filters, query: searchQuery, industry, location }) => {
    setFilters(next);
    setPage(1);
  };

  const filtered = useMemo(() => {
    const since = filters.posted ? Date.now() - Number(filters.posted) * 86400000 : 0;
    return allJobs
      .filter(job =>
        matchesIndustry(job, filters.industry) &&
        matchesLocation(job, filters.location) &&
        (!since || new Date(job.created_at).getTime() >= since)
      );
  }, [allJobs, filters]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const jobs = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const hasFilter = filters.query || filters.industry || filters.location || filters.posted;
  // Số điều kiện khác mặc định (sắp xếp khác "Mới nhất" cũng tính)
  const activeCount = (filters.industry ? 1 : 0) + (filters.posted ? 1 : 0) + (sortBy !== 'newest' ? 1 : 0);

  const clearFilters = () => {
    setIndustry('');
    setSortBy('newest');
    applyFilters({ ...filters, industry: '', posted: '' });
  };

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
            Việc làm part-time
          </h1>
          {/* Cùng kiểu nhãn kính mờ ở trang chủ ("Nền tảng việc làm part-time cho sinh viên") */}
          <p style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 999,
            background: 'rgba(255,255,255,0.14)', border: '1px solid rgba(255,255,255,0.3)',
            color: C.white, fontSize: 13, fontWeight: 600, maxWidth: 640
          }}>
            <Briefcase size={15} style={{ flexShrink: 0 }} />
            <span>
              {loading ? 'Đang tải cơ hội việc làm...' : `${formatNumber(total ?? allJobs.length)} cơ hội từ các nhà tuyển dụng trên Unijob`}
            </span>
          </p>
        </div>
      </section>

      <div style={{ maxWidth: 1264, margin: '-56px auto 0', padding: '0 32px 72px', position: 'relative' }}>
        <div style={{
          background: C.white, borderRadius: 18, padding: 14, boxShadow: SHADOW.lg, border: `1px solid ${C.border}`,
          display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: 10, marginBottom: 20
        }}>
          <div style={FIELD_BOX}>
            <Search size={18} color={C.grayLight} />
            <input
              placeholder="Tìm theo vị trí hoặc tên công ty"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && applyFilters()}
              style={BARE_INPUT}
            />
          </div>
          <div style={FIELD_BOX}>
            <Layers size={18} color={C.grayLight} />
            <Select wrapperStyle={{ flex: 1, minWidth: 0 }} iconRight={0} value={industry} onChange={e => setIndustry(e.target.value)} style={{ ...BARE_INPUT, cursor: 'pointer', fontSize: 14 }}>
              <option value="">Tất cả ngành nghề</option>
              {Object.entries(INDUSTRIES).map(([key, ind]) => (
                <option key={key} value={key}>{ind.label}</option>
              ))}
            </Select>
          </div>
          <div style={FIELD_BOX}>
            <MapPin size={18} color={C.grayLight} />
            <Select wrapperStyle={{ flex: 1, minWidth: 0 }} iconRight={0} value={location} onChange={e => setLocation(e.target.value)} style={{ ...BARE_INPUT, cursor: 'pointer', fontSize: 14 }}>
              <option value="">Tất cả địa điểm</option>
              {Object.entries(LOCATIONS).map(([key, loc]) => (
                <option key={key} value={key}>{loc.label}</option>
              ))}
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
          marginBottom: 20, overflow: 'hidden'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '12px 16px 12px 20px' }}>
            <p style={{ fontSize: 15, color: C.gray }}>
              {loading ? 'Đang tải...' : <>Tìm thấy <b style={{ color: C.navy }}>{formatNumber(filtered.length)}</b> việc làm{hasFilter ? ' phù hợp' : ''}</>}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {activeCount > 0 && (
                <button
                  onClick={clearFilters}
                  style={{
                    height: 40, padding: '0 14px', borderRadius: 10, cursor: 'pointer', fontSize: 14, fontWeight: 600,
                    border: `1px solid ${C.border}`, background: C.white, color: C.red,
                    display: 'flex', alignItems: 'center', gap: 6
                  }}
                >
                  <X size={15} /> Xóa bộ lọc
                </button>
              )}
              <button
                onClick={() => setShowFilters(v => !v)}
                style={{
                  height: 40, padding: '0 14px', borderRadius: 10, cursor: 'pointer', fontSize: 14, fontWeight: 600,
                  display: 'flex', alignItems: 'center', gap: 8,
                  border: `1px solid ${showFilters || activeCount ? C.blueBorder : C.border}`,
                  background: showFilters || activeCount ? C.blueLight : C.white,
                  color: showFilters || activeCount ? C.purple : C.navy
                }}
              >
                <SlidersHorizontal size={16} /> Bộ lọc
                {activeCount > 0 && (
                  <span style={{
                    minWidth: 20, height: 20, padding: '0 6px', borderRadius: 999, background: C.purple, color: C.white,
                    fontSize: 12, fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    {activeCount}
                  </span>
                )}
                <ChevronDown size={16} style={{ transition: 'transform .2s ease', transform: showFilters ? 'rotate(180deg)' : 'none' }} />
              </button>
            </div>
          </div>

          {showFilters && (
            <div style={{ borderTop: `1px solid ${C.border}`, padding: '18px 20px 20px', background: C.grayCard, animation: 'slideDown .18s ease-out' }}>
              <FilterGroup
                icon={ArrowUpDown}
                title="Sắp xếp"
                options={SORT_OPTIONS}
                value={sortBy}
                onChange={value => { setSortBy(value); setPage(1); }}
              />
              <FilterGroup
                icon={Clock}
                title="Thời gian đăng"
                options={POSTED}
                value={filters.posted}
                onChange={value => applyFilters({ ...filters, posted: value })}
              />
              <FilterGroup
                icon={Layers}
                title="Ngành nghề"
                options={[{ value: '', label: 'Tất cả' }, ...Object.entries(INDUSTRIES).map(([value, ind]) => ({ value, label: ind.label }))]}
                value={filters.industry}
                onChange={value => { setIndustry(value); applyFilters({ ...filters, industry: value }); }}
                last
              />
            </div>
          )}
        </div>

        {jobs.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 18 }}>
            {jobs.map(job => <JobCard key={job.job_id} job={job} />)}
          </div>
        ) : !loading && (
          <div style={{
            background: C.white, borderRadius: 18, border: `1px solid ${C.border}`, padding: '64px 32px', textAlign: 'center'
          }}>
            <div style={{
              width: 64, height: 64, borderRadius: 18, background: error ? C.redBg : C.blueLight, margin: '0 auto 16px',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <SearchX size={28} color={error ? C.red : C.purple} />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 6 }}>
              {error ? 'Không tải được việc làm' : 'Không tìm thấy việc làm phù hợp'}
            </h3>
            <p style={{ fontSize: 14, color: error ? C.red : C.gray, marginBottom: hasFilter && !error ? 20 : 0 }}>
              {error || 'Thử đổi từ khóa hoặc bỏ bớt bộ lọc.'}
            </p>
            {hasFilter && !error && (
              <button
                onClick={() => {
                  setSearchQuery(''); setIndustry(''); setLocation('');
                  applyFilters({ query: '', industry: '', location: '', posted: '' });
                }}
                style={{ padding: '10px 20px', borderRadius: 10, border: `1px solid ${C.border}`, background: C.white, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
              >
                Xóa bộ lọc
              </button>
            )}
          </div>
        )}

        {totalPages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 36 }}>
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
              style={{ width: 40, height: 40, borderRadius: 12, border: `1px solid ${C.border}`, background: C.white, cursor: 'pointer', opacity: page <= 1 ? 0.45 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <ChevronLeft size={18} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setPage(p)}
                style={{
                  width: 40, height: 40, borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: 'pointer',
                  border: p === page ? 'none' : `1px solid ${C.border}`,
                  background: p === page ? C.purple : C.white, color: p === page ? C.white : C.navy
                }}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              style={{ width: 40, height: 40, borderRadius: 12, border: `1px solid ${C.border}`, background: C.white, cursor: 'pointer', opacity: page >= totalPages ? 0.45 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
