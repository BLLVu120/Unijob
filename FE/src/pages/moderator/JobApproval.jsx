import { useState, useEffect, useCallback } from 'react';
import {
  Eye, CheckSquare, XCircle, MapPin, Briefcase, Building2, X, CheckCircle, AlertTriangle, Search, CreditCard, FileText, ListChecks, Clock, Gift, Info, BadgeCheck, Users, Calendar, GraduationCap
} from 'lucide-react';
import { COLORS, TILE_GRADIENTS, GRADIENT } from '../../constants/colors';
import { flex, txt, card, field } from '../../utils/styles';
import { PAGE_BTN_STYLE } from '../../constants/pageBtnStyle';
import { jobService, attachEmployers } from '../../services/jobService';
import { getAllEmployers } from '../../services/authService';
import { formatSalary, formatExperience, timeAgo, normalize } from '../../utils/jobFormat';
import PageHeader from '../../components/PageHeader';
import { InfoTile } from '../../components/ProfileKit';
import Toast from '../../components/Toast';
import { formatDate } from '../../utils/textUtils';
const C = COLORS;

// Tiêu đề mục: icon trong ô tím nhạt (cùng kiểu trang chi tiết việc làm)
const SectionHead = ({ icon, children }) => {
  const Icon = icon;
  return (
    <h3 style={{ ...txt(18, 700), marginBottom: 12, ...flex('center'), gap: 10 }}>
      <span style={{ width: 34, height: 34, borderRadius: 10, background: C.blueLight, ...flex('center'), justifyContent: 'center' }}>
        <Icon size={17} color={C.purple} />
      </span>
      {children}
    </h3>
  );
};

// Nút ở chân hộp thoại — cùng cỡ các hộp thoại khác (cao 42, bo 12)
const footerBtn = (variant) => ({
  height: 42, padding: '0 22px', borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: 'pointer',
  display: 'flex', alignItems: 'center', gap: 8,
  ...(variant === 'ghost'
    ? { border: `1px solid ${C.border}`, background: C.white, color: C.navy }
    : { border: 'none', color: C.white, background: variant === 'danger' ? C.red : C.green })
});

const JobDetailModal = ({ open, onClose, job, onApprove, onReject }) => {
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectionInput, setShowRejectionInput] = useState(false);

  if (!open || !job) return null;

  const handleReject = () => {
    if ((job.status === 'pending' || job.status === 'approved') && !showRejectionInput) {
      setShowRejectionInput(true);
    } else {
      onReject(rejectionReason);
      setRejectionReason('');
      setShowRejectionInput(false);
      onClose();
    }
  };

  const handleApprove = () => {
    onApprove();
    setRejectionReason('');
    setShowRejectionInput(false);
    onClose();
  };

  const handleClose = () => {
    setRejectionReason('');
    setShowRejectionInput(false);
    onClose();
  };

  const statusConfig = {
    pending: { bg: C.yellowBg, text: C.amber, label: 'Đang chờ' },
    approved: { bg: C.greenBg, text: C.green, label: 'Đã duyệt' },
    rejected: { bg: C.redBg, text: C.red, label: 'Từ chối' }
  };

  const status = statusConfig[job.status];

  return (
    <>
      <div onClick={handleClose} style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000
      }} />
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 1001,
        width: '100%',
        maxWidth: 1100,
        background: C.white,
        borderRadius: 20,
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        <div style={{
          background: GRADIENT.hero,
          borderRadius: '20px 20px 0 0', padding: '28px 32px', position: 'relative'
        }}>
          <button onClick={handleClose} title="Đóng" style={{
            position: 'absolute', top: 20, right: 20, width: 36, height: 36, borderRadius: '50%',
            background: 'rgba(255,255,255,0.2)', border: 'none', cursor: 'pointer',
            ...flex('center'), justifyContent: 'center'
          }}>
            <X size={20} color={C.white} />
          </button>

          {/* Tiêu đề + nhãn trạng thái ngay bên cạnh */}
          <div style={{ ...flex('center'), gap: 12, flexWrap: 'wrap', marginBottom: 8, paddingRight: 56 }}>
            <h2 style={{ ...txt(28, 700, C.white), lineHeight: 1.25 }}>{job.title}</h2>
            <span style={{
              padding: '3px 10px', borderRadius: 999, background: status.bg, color: status.text,
              fontSize: 12, fontWeight: 600, flexShrink: 0
            }}>
              {status.label}
            </span>
          </div>
          <div style={{ ...flex('center'), gap: 6 }}>
            <Building2 size={18} color={C.white} />
            <span style={{ ...txt(16, 500, C.white) }}>{job.company}</span>
            {job.companyVerified && <BadgeCheck size={17} color={C.white} />}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginTop: 24 }}>
            {[
              { icon: MapPin, label: 'Địa điểm', value: job.location },
              { icon: CreditCard, label: 'Mức lương', value: job.salary },
              { icon: Briefcase, label: 'Kinh nghiệm', value: job.experience }
            ].map((f, i) => (
              // Cùng kiểu ô thông tin trang hồ sơ (InfoTile), mỗi thẻ một màu
              <InfoTile key={f.label} {...f} gradient={[TILE_GRADIENTS[1], TILE_GRADIENTS[2], TILE_GRADIENTS[3]][i]} />
            ))}
          </div>
        </div>

        <div style={{ padding: 32 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 360px', gap: 32 }}>
            <div>
              {[
                { title: 'Mô tả công việc', icon: FileText, text: job.raw.description },
                { title: 'Yêu cầu ứng viên', icon: ListChecks, text: job.raw.requirements },
                { title: 'Thời gian làm việc', icon: Clock, text: job.raw.working_shifts },
                { title: 'Quyền lợi', icon: Gift, text: job.raw.benefits }
              ].map(({ title, icon, text }) => {
                const Icon = icon;
                const lines = (text || '').split('\n').map(l => l.replace(/^[-•*]\s*/, '').trim()).filter(Boolean);
                return (
                  <div key={title} style={{ marginBottom: 24 }}>
                    <SectionHead icon={Icon}>{title}</SectionHead>
                    <div style={{ ...card(), padding: '18px 24px', borderLeft: `4px solid ${C.purple}` }}>
                      {lines.length === 0 ? (
                        <p style={{ ...txt(14, 400, C.gray) }}>Chưa cập nhật</p>
                      ) : (
                        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {lines.map((line, index) => (
                            <li key={index} style={{ ...flex('flex-start'), gap: 10 }}>
                              <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.purple, flexShrink: 0, marginTop: 9 }} />
                              <span style={{ ...txt(15, 400, C.darkGray), lineHeight: 1.55 }}>{line}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div>
              <SectionHead icon={Info}>Thông tin chung</SectionHead>
              <div style={{ ...card(), padding: '8px 24px', marginBottom: 24 }}>
                {[
                  { icon: Users, label: 'Số lượng tuyển', value: job.raw.num_slot ? `${job.raw.num_slot} người` : '—' },
                  { icon: Calendar, label: 'Hạn nộp hồ sơ', value: job.raw.expiry_date ? formatDate(job.raw.expiry_date) : 'Không thời hạn', color: C.red },
                  { icon: Briefcase, label: 'Cấp bậc', value: job.raw.role || '—' },
                  { icon: GraduationCap, label: 'Học vấn', value: job.raw.education_level || '—' }
                ].map(({ icon, label, value, color }, i, arr) => {
                  const Icon = icon;
                  return (
                    // Cùng kiểu "Thông tin chung" ở trang chi tiết việc làm: icon | nhãn | giá trị sát phải
                    <div key={label} style={{
                      ...flex('center'), gap: 12, padding: '12px 0',
                      borderBottom: i === arr.length - 1 ? 'none' : `1px solid ${C.border}`
                    }}>
                      <Icon size={18} color={C.grayLight} style={{ flexShrink: 0 }} />
                      <span style={{ ...txt(14, 400, C.gray), flex: 1 }}>{label}</span>
                      <span style={{ ...txt(14, 600, color || C.navy), textAlign: 'right' }}>{value}</span>
                    </div>
                  );
                })}
              </div>

          {job.status === 'rejected' && job.rejectionReason && (
            <div style={{ marginBottom: 20 }}>
              <SectionHead icon={AlertTriangle}>Lí do bị từ chối</SectionHead>
              <div style={{
                background: C.redBg, borderRadius: 12, padding: '12px 14px', border: '1px solid #fbcaca'
              }}>
                <p style={{ ...txt(13, 400, C.red) }}>{job.rejectionReason}</p>
              </div>
            </div>
          )}

          {(job.status === 'pending' || job.status === 'approved') && showRejectionInput && (
            <div>
              <SectionHead icon={AlertTriangle}>Lý do từ chối</SectionHead>
              <p style={{ ...txt(12, 400, C.gray), marginBottom: 8 }}>
                Từ chối sẽ ẩn tin khỏi trang tìm việc. Lưu ý: BE chưa lưu lý do từ chối.
              </p>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Nhập nội dung từ chối nếu cần thiết"
                style={{
                  width: '100%',
                  minHeight: 96,
                  padding: '12px 14px',
                  borderRadius: 12, boxSizing: 'border-box',
                  border: `1px solid ${C.border}`,
                  fontSize: 13,
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  outline: 'none'
                }}
              />
            </div>
          )}
            </div>
          </div>
        </div>

        <div style={{
          padding: '18px 32px',
          borderTop: `1px solid ${C.border}`,
          ...flex('center'),
          justifyContent: 'flex-end',
          gap: 10
        }}>
          {/* Cùng kiểu chân hộp thoại Ứng viên / Doanh nghiệp: nút đỏ "Từ chối", nút xanh "Duyệt" */}
          {showRejectionInput ? (
            <>
              <button onClick={() => setShowRejectionInput(false)} style={footerBtn('ghost')}>
                Quay lại
              </button>
              <button onClick={handleReject} style={footerBtn('danger')}>
                <XCircle size={16} /> Xác nhận từ chối
              </button>
            </>
          ) : (
            <>
              {job.status !== 'rejected' && (
                <button onClick={handleReject} style={footerBtn('danger')}>
                  <XCircle size={16} /> Từ chối
                </button>
              )}
              {job.status !== 'approved' && (
                <button onClick={handleApprove} style={footerBtn('success')}>
                  <CheckCircle size={16} /> Duyệt tin
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

/*
 * BE chưa có bước kiểm duyệt riêng, nên dùng is_active của tin:
 *   Đã duyệt = đang hiển thị (is_active = true)
 *   Từ chối  = bị ẩn (is_active = false)
 */
const STATUS_STYLE = {
  pending: { label: 'Chờ duyệt', bg: C.yellowBg, text: C.amber },
  approved: { label: 'Đã duyệt', bg: C.greenBg, text: C.green },
  rejected: { label: 'Từ chối', bg: C.redBg, text: C.red }
};

const toRow = (job) => {
  const status = job.is_active === false ? 'rejected' : 'approved';
  return {
    id: job.job_id,
    raw: job,
    title: job.title,
    company: job.company,
    companyVerified: job.companyVerified,
    postedTime: timeAgo(job.created_at),
    updatedAt: job.updated_at,
    status,
    statusLabel: STATUS_STYLE[status].label,
    statusColor: STATUS_STYLE[status].bg,
    statusText: STATUS_STYLE[status].text,
    location: job.location || '—',
    salary: formatSalary(job.salary_min, job.salary_max),
    experience: formatExperience(job.experience)
  };
};

export default function JobApproval() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState(null);
  const clearNotice = useCallback(() => setNotice(null), []);
  const [searchQuery, setSearchQuery] = useState('');
  const [appliedQuery, setAppliedQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [page, setPage] = useState(1);

  const reload = () =>
    Promise.all([jobService.getAllJobs(), getAllEmployers()])
      .then(([list, employers]) => setJobs(attachEmployers(list, employers).map(toRow)))
      .catch(err => setNotice({ type: 'error', text: `Không tải được danh sách tin: ${err.message}` }))
      .finally(() => setLoading(false));

  useEffect(() => { reload(); }, []);

  const q = normalize(appliedQuery.trim());
  const displayJobs = jobs.filter(job =>
    (activeTab === 'all' || job.status === activeTab) &&
    (!q || normalize(`${job.title} ${job.company}`).includes(q))
  );
  const rowsPerPage = 5;
  const total = displayJobs.length;
  const totalPages = Math.max(1, Math.ceil(total / rowsPerPage));
  const start = (page - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  const currentJobs = displayJobs.slice(start, end);

  const today = new Date().toDateString();
  const stats = [
    { icon: Eye, bgColor: C.yellowBg, label: 'Chờ duyệt', value: jobs.filter(j => j.status === 'pending').length },
    { icon: CheckSquare, bgColor: C.greenBg, label: 'Đã duyệt hôm nay', value: jobs.filter(j => j.status === 'approved' && j.updatedAt && new Date(j.updatedAt).toDateString() === today).length },
    { icon: XCircle, bgColor: C.redBg, label: 'Đã từ chối', value: jobs.filter(j => j.status === 'rejected').length }
  ];

  const tabs = [
    { id: 'all', label: 'Tất cả', count: jobs.length },
    { id: 'pending', label: 'Chờ duyệt', count: jobs.filter(j => j.status === 'pending').length },
    { id: 'approved', label: 'Đã duyệt', count: jobs.filter(j => j.status === 'approved').length },
    { id: 'rejected', label: 'Từ chối', count: jobs.filter(j => j.status === 'rejected').length }
  ];

  const applySearch = () => {
    setAppliedQuery(searchQuery);
    setPage(1);
  };

  const setActive = async (job, active) => {
    try {
      await jobService.updateJob({ job_id: job.id, is_active: active });
      setNotice({ type: 'success', text: `${active ? 'Đã duyệt' : 'Đã từ chối (ẩn)'} tin "${job.title}"` });
      reload();
    } catch (err) {
      setNotice({ type: 'error', text: err.message });
    }
  };

  const handleApprove = () => {
    if (selectedJob) setActive(selectedJob, true);
  };

  const handleReject = () => {
    if (selectedJob) setActive(selectedJob, false);
  };

  return (
    <div style={{
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      background: C.grayBg,
      minHeight: '100vh'
    }}>
      <main style={{ marginLeft: 240, padding: '40px 48px' }}>
        <PageHeader
          title="Duyệt tin tuyển dụng"
          subtitle="Kiểm duyệt tin tuyển dụng trước khi hiển thị với ứng viên"
        />
        <Toast message={notice} onClose={clearNotice} />

        {/* Thẻ thống kê: cùng kiểu trang admin (icon trái, nhãn giữa, số sát phải) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 16, marginBottom: 24 }}>
          {stats.map((stat, i) => (
            <div key={i} style={{
              background: C.white, borderRadius: 16, border: `1px solid ${C.border}`,
              padding: '16px 20px', ...flex('center'), gap: 16
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: 12, flexShrink: 0,
                background: stat.bgColor, ...flex('center'), justifyContent: 'center'
              }}>
                <stat.icon size={24} color={C.navy} />
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
              placeholder="Tìm kiếm theo tiêu đề, công ty..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && applySearch()}
              style={{ border: 'none', outline: 'none', boxShadow: 'none', fontSize: 14, flex: 1, background: 'transparent' }}
            />
          </div>
          <button
            onClick={applySearch}
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
          {tabs.map(tab => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setPage(1); }}
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
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        <div style={{
          background: C.white,
          borderRadius: 16,
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          {currentJobs.length > 0 ? (
            <>
              <div style={{
                padding: '20px 24px',
                borderBottom: `1px solid ${C.border}`
              }}>
                <h2 style={{ ...txt(18, 700) }}>
                  Danh sách tin ({displayJobs.length})
                </h2>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: C.grayBg }}>
                    {['TIN TUYỂN DỤNG', 'CÔNG TY', 'THỜI GIAN ĐĂNG', 'TRẠNG THÁI', 'THAO TÁC'].map(h => (
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
                  {currentJobs.map(job => (
                    <tr key={job.id} style={{ borderTop: `1px solid ${C.border}` }}>
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{ ...txt(14, 600) }}>{job.title}</span>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{ ...txt(14, 400) }}>{job.company}</span>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{ ...txt(14, 400) }}>{job.postedTime}</span>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{
                          padding: '6px 14px',
                          borderRadius: 16,
                          background: job.statusColor,
                          color: job.statusText,
                          fontSize: 13,
                          fontWeight: 600
                        }}>
                          {job.statusLabel}
                        </span>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <button
                          onClick={() => {
                            setSelectedJob(job);
                            setViewModalOpen(true);
                          }}
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 10,
                            border: 'none',
                            background: C.blueLight,
                            cursor: 'pointer',
                            ...flex('center'),
                            justifyContent: 'center'
                          }}
                        >
                          <Eye size={17} color={C.purple} />
                        </button>
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
                  Hiển thị {start + 1}-{Math.min(end, total)} trong tổng số {total} tin
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
                <CheckSquare size={40} color={C.grayLight} />
              </div>
              <h3 style={{ ...txt(20, 600), marginBottom: 8 }}>
                {loading ? 'Đang tải...' : jobs.length ? 'Không có tin phù hợp' : 'Chưa có tin cần duyệt'}
              </h3>
              <p style={{
                ...txt(15, 400, C.gray),
                maxWidth: 400,
                margin: '0 auto 24px'
              }}>
                Danh sách tin tuyển dụng cần duyệt sẽ xuất hiện tại đây khi có nhà tuyển dụng đăng tin mới.
              </p>
            </div>
          )}
        </div>
      </main>

      <JobDetailModal
        open={viewModalOpen}
        onClose={() => {
          setViewModalOpen(false);
          setSelectedJob(null);
        }}
        job={selectedJob}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  );
}