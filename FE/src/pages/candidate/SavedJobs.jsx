import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bookmark, Search, ArrowRight } from 'lucide-react';
import { COLORS } from '../../constants/colors';
import { flex, txt, card, field } from '../../utils/styles';
import { jobService } from '../../services/jobService';
import { readSavedJobs, normalize, JOB_TYPE_LABELS } from '../../utils/jobFormat';
import PageHeader from '../../components/PageHeader';
import StateBox from '../../components/StateBox';
import JobCard from '../../components/JobCard';

const C = COLORS;

// Chip lọc theo hình thức làm việc
const FILTER_TABS = [
  { id: 'all', label: 'Tất cả' },
  ...Object.entries(JOB_TYPE_LABELS).map(([id, label]) => ({ id, label }))
];

// Việc đã lưu: danh sách tin người dùng bấm "Lưu tin" (lưu trong trình duyệt)
export default function SavedJobs() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [appliedQuery, setAppliedQuery] = useState('');
  const [filter, setFilter] = useState('all');

  // Tải danh sách (chỉ setState trong callback để không gây render dây chuyền)
  const fetchJobs = () => {
    const ids = readSavedJobs();
    jobService.getPublicJobs()
      .then(all => { setJobs(all.filter(j => ids.includes(j.job_id))); setError(''); })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(fetchJobs, []);

  const retry = () => {
    setLoading(true);
    fetchJobs();
  };

  // Bỏ lưu trên thẻ → ẩn khỏi danh sách
  const remove = (id) => setJobs(list => list.filter(j => j.job_id !== id));

  const filteredJobs = useMemo(() => {
    const q = normalize(appliedQuery.trim());
    return jobs.filter(job =>
      (filter === 'all' || job.job_type === filter) &&
      (!q || normalize(`${job.title} ${job.company} ${job.location}`).includes(q))
    );
  }, [jobs, filter, appliedQuery]);

  return (
    <div style={{ background: C.grayBg, minHeight: '100%' }}>
      <main style={{ padding: '40px 48px' }}>
        <PageHeader title="Việc đã lưu" subtitle="Những công việc bạn quan tâm, sẵn sàng để ứng tuyển" />

        {/* Thẻ tìm kiếm */}
        <div style={{ ...card(), padding: 14, marginBottom: 14, ...flex('center'), gap: 10 }}>
          <div style={{ ...flex('center'), gap: 10, flex: 1, ...field() }}>
            <Search size={18} color={C.grayLight} />
            <input
              placeholder="Tìm theo tên việc, công ty hoặc địa điểm"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && setAppliedQuery(searchQuery)}
              style={{ border: 'none', outline: 'none', boxShadow: 'none', fontSize: 14, flex: 1, background: 'transparent' }}
            />
          </div>
          <button
            onClick={() => setAppliedQuery(searchQuery)}
            style={{
              height: 44, padding: '0 22px', borderRadius: 12, border: 'none', background: C.purple,
              color: C.white, fontSize: 14, fontWeight: 600, cursor: 'pointer', ...flex('center'), gap: 8
            }}
          >
            <Search size={16} /> Tìm kiếm
          </button>
        </div>

        {/* Thẻ lọc hình thức làm việc */}
        <div style={{ ...card(), padding: '12px 16px', marginBottom: 24, ...flex('center'), gap: 10, flexWrap: 'wrap' }}>
          <span style={{ ...txt(14, 600, C.gray), marginRight: 4 }}>Lọc:</span>
          {FILTER_TABS.map(tab => {
            const active = filter === tab.id;
            const count = tab.id === 'all' ? jobs.length : jobs.filter(j => j.job_type === tab.id).length;
            return (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
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
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {loading ? (
          <StateBox type="loading" title="Đang tải việc đã lưu..." />
        ) : error ? (
          <StateBox type="error" title="Không tải được danh sách" message={error} onRetry={retry} />
        ) : filteredJobs.length === 0 ? (
          <StateBox
            icon={Bookmark}
            title={jobs.length === 0 ? 'Chưa có việc làm nào được lưu' : 'Không có việc làm phù hợp'}
            message={jobs.length === 0 ? 'Bấm biểu tượng lưu trên thẻ việc làm để xem lại tại đây.' : 'Thử đổi từ khóa hoặc bộ lọc.'}
            action={jobs.length === 0 && (
              <button
                onClick={() => navigate('/jobs')}
                style={{
                  height: 42, padding: '0 20px', borderRadius: 12, border: 'none', background: C.purple,
                  color: C.white, fontSize: 14, fontWeight: 600, cursor: 'pointer', ...flex('center'), gap: 8
                }}
              >
                Khám phá việc làm <ArrowRight size={16} />
              </button>
            )}
          />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 18 }}>
            {filteredJobs.map(job => (
              <JobCard key={job.job_id} job={job} onUnsave={remove} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
