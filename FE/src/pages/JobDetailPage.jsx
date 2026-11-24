import { useState, useRef, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Send, Briefcase, MapPin, Clock, Users, Gift, X, Upload, AlertTriangle, ExternalLink, Calendar, ChevronLeft, BadgeCheck, Bookmark, Wallet, Layers, GraduationCap, Info, Building2
} from 'lucide-react';
import { flex, txt, card } from '../utils/styles';
import { COLORS, GRADIENT, SHADOW, TILE_GRADIENTS } from '../constants/colors';
import { formatSalary, formatExperience, JOB_TYPE_LABELS, readSavedJobs, toggleSavedJob } from '../utils/jobFormat';
import { getInitials, formatDate } from '../utils/textUtils';
import { jobService } from '../services/jobService';
import { applicationService } from '../services/applicationService';
import { getEmployerById, getCurrentUser } from '../services/authService';
import Toast from '../components/Toast';

const gap = (n) => ({ gap: `${n}px` });

const WarningBox = ({ children }) => (
  <div style={{
    background: COLORS.yellow, border: `1px solid ${COLORS.yellowBorder}`,
    borderRadius: 10, padding: '14px 16px',
    ...flex('flex-start'), ...gap(10)
  }}>
    <AlertTriangle size={18} color={COLORS.brown} style={{ flexShrink: 0, marginTop: 2 }} />
    <div style={{ ...txt(13, 400, COLORS.brown), lineHeight: 1.55 }}>{children}</div>
  </div>
);

const ModalShell = ({ open, onClose, children, maxW = 520 }) => {
  if (!open) return null;
  return (
    <>
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 9999
      }} />
      <div style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        ...flex('center', 'column'), justifyContent: 'center',
        paddingTop: 50,
        padding: '24px'
      }}>
        <div style={{
          background: COLORS.white, borderRadius: 16,
          width: '100%', maxWidth: maxW,
          maxHeight: '90vh', overflowY: 'auto',
          boxShadow: '0 20px 60px rgba(0,0,0,0.18)'
        }}>
          {children}
        </div>
      </div>
    </>
  );
};

const ApplyModal = ({ open, onClose, setToast, job, employer }) => {
  // Hộp thoại chỉ được mount khi mở (xem nơi gọi) nên mỗi lần mở là state mới, không cần effect reset
  const [file, setFile] = useState(null);
  const fileRef = useRef();

  const handleSubmit = async () => {
    try {
      if (!file) {
        setToast({ type: 'warning', message: 'Vui lòng upload CV' });
        return;
      }

      const user = getCurrentUser();

      if (!user || user.role !== 'candidate') {
        setToast({ type: 'error', message: 'Bạn phải đăng nhập với tài khoản ứng viên' });
        return;
      }

      const applied = await applicationService.getByCandidateId(user.candidate_id);
      if (applied.some(a => a.job_id === job.job_id && a.status !== 'withdrawn')) {
        setToast({ type: 'warning', message: 'Bạn đã ứng tuyển vị trí này rồi' });
        return;
      }

      const uploadRes = await applicationService.uploadCV(file);
      const payload = {
        application_id: crypto.randomUUID(),
        job_id: job.job_id,
        candidate_id: user.candidate_id,
        cv_url: uploadRes.cv_url,
        status: 'submitted',
      };

      await applicationService.addApplication(payload);
      setFile(null);
      onClose();
      setToast({
        type: 'success',
        message: 'Hồ sơ đã được gửi thành công!'
      });

    } catch (err) {
      console.error(err);
      setToast({ type: 'error', message: err.message || 'Ứng tuyển thất bại' });
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const f = e.dataTransfer?.files?.[0] || e.target.files?.[0];

    if (!f) return;

    if (f.type !== 'application/pdf') {
      setToast({ type: 'error', message: 'Chỉ chấp nhận file PDF' });
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (f.size > maxSize) {
      setToast({ type: 'error', message: 'File vượt quá 5MB' });
      return;
    }

    setFile(f);
  };
  
  const labelStyle = { ...txt(14, 600), marginBottom: 6, display: 'block' };

  return (
    <ModalShell open={open} onClose={onClose}>
      <div style={{
        background: GRADIENT.primary,
        borderRadius: '16px 16px 0 0', padding: '24px 28px 20px',
        ...flex('center'), justifyContent: 'space-between'
      }}>
        <span style={{ ...txt(22, 700, COLORS.white) }}>Nộp hồ sơ ứng tuyển</span>
        <button 
          onClick={() => {
            setFile(null);
            onClose();
          }}
          style={{
            width: 32, height: 32, borderRadius: '50%', border: 'none',
            background: 'rgba(255,255,255,0.25)', cursor: 'pointer',
            ...flex('center'), justifyContent: 'center'
        }}>
          <X size={18} color={COLORS.white} />
        </button>
      </div>

      <div style={{ padding: '24px 28px 28px' }}>
        <div style={{
          background: COLORS.orangeBg, border: '1px solid #fed7aa', borderLeft: '4px solid #f97316', borderRadius: 10,
          padding: '12px 16px', marginBottom: 22
        }}>
          <p style={{ ...txt(15, 600, COLORS.navy), ...flex('center'), gap: 6 }}>
            <Briefcase size={14} color={COLORS.gray} style={{ flexShrink: 0 }} />
            <span style={{ ...txt(13, 500, COLORS.gray) }}>Việc làm:</span>{job?.title}
          </p>
          <p style={{ ...txt(14, 500, COLORS.darkGray), marginTop: 4, ...flex('center'), gap: 6 }}>
            <Building2 size={14} color={COLORS.gray} style={{ flexShrink: 0 }} />
            <span style={{ ...txt(13, 500, COLORS.gray) }}>Công ty:</span>{employer?.emp_name}
          </p>
        </div>

        <label style={labelStyle}>Tải lên CV <span style={{ color: COLORS.red }}>*</span></label>
        <div
          onClick={() => fileRef.current.click()}
          onDragOver={e => e.preventDefault()}
          onDrop={handleDrop}
          style={{
            border: `2px dashed ${file ? COLORS.green : COLORS.grayLight}`,
            borderRadius: 10, padding: '28px 16px', textAlign: 'center',
            cursor: 'pointer', background: file ? COLORS.greenBg : COLORS.offWhite,
            marginBottom: 22, transition: 'all 0.2s'
          }}
        >
          <input ref={fileRef} type="file" accept=".pdf" onChange={handleDrop} style={{ display: 'none' }} />
          <Upload size={32} color={file ? COLORS.green : COLORS.grayMid} style={{ marginBottom: 8 }} />
          <p style={{ ...txt(15, 600, file ? COLORS.green : COLORS.navy) }}>
            {file ? file.name : 'Click để tải file lên'}
          </p>
          {!file && (
            <p style={{ ...txt(12, 400, COLORS.grayMid), marginTop: 4 }}>
              File .PDF tối đa 5MB
            </p>
          )}
        </div>

        <WarningBox>
          <strong>Lưu ý:</strong> Thông tin của bạn sẽ được gửi trực tiếp đến nhà tuyển dụng. Hãy đảm bảo thông tin chính xác và CV phù hợp với vị trí ứng tuyển.
        </WarningBox>

        <button
          onClick={handleSubmit}
          style={{
            marginTop: 22, width: '100%', padding: '14px', borderRadius: 10, border: 'none',
            background: GRADIENT.primary,
            color: COLORS.white, fontSize: 16, fontWeight: 600, cursor: 'pointer',
            ...flex('center'), justifyContent: 'center', ...gap(8)
          }}
        >
          <Send size={18} /> Gửi hồ sơ ứng tuyển
        </button>
      </div>
    </ModalShell>
  );
};

export default function JobDetailPage() {
  const currentUser = getCurrentUser();
  const isCandidate = currentUser?.role === 'candidate';
  const navigate = useNavigate();
  const { id } = useParams();
  const [saved, setSaved] = useState(() => readSavedJobs().includes(id));
  const [job, setJob] = useState(null);
  const [employer, setEmployer] = useState(null);
  const [applyOpen, setApplyOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [loadState, setLoadState] = useState('loading');

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const jobData = await jobService.getJobById(id);
        if (!jobData) {
          setLoadState('notfound');
          return;
        }
        setJob(jobData);
        setLoadState('ok');

        if (jobData.employer_id) {
          const emp = await getEmployerById(jobData.employer_id);
          setEmployer(emp);
        }
      } catch {
        setLoadState('notfound');
      }
    };

    fetchJob();
  }, [id]);

  if (!job) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', ...txt(16, 500, COLORS.gray) }}>
        {loadState === 'loading' ? 'Đang tải tin tuyển dụng...' : 'Không tìm thấy tin tuyển dụng này.'}
      </div>
    );
  }

  const sections = [
    { icon: Briefcase, title: 'Mô tả công việc', text: job.description },
    { icon: Users, title: 'Yêu cầu ứng viên', text: job.requirements },
    { icon: Calendar, title: 'Thời gian làm việc', text: job.working_shifts },
    { icon: Gift, title: 'Quyền lợi', text: job.benefits }
  ];

  return (
    <div style={{
      fontFamily: "'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif",
      background: COLORS.grayBg, minHeight: '100vh', paddingBottom: 64
    }}>
    {toast && (
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast(null)}
      />
    )}

    <div style={{ background: COLORS.white, borderBottom: `1px solid ${COLORS.border}` }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 32px' }}>
        <Link to="/jobs" style={{ ...txt(13, 600, COLORS.gray), textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 18 }}>
          <ChevronLeft size={16} /> Quay lại danh sách việc làm
        </Link>
        <div style={{ ...flex('center'), justifyContent: 'space-between', gap: 24 }}>
          <div style={{ ...flex('center'), gap: 18, minWidth: 0 }}>
            <div style={{
              width: 72, height: 72, borderRadius: 18, background: GRADIENT.primary, flexShrink: 0,
              ...flex('center'), justifyContent: 'center', boxShadow: SHADOW.primary
            }}>
              <span style={{ ...txt(24, 800, COLORS.white) }}>{getInitials(employer?.emp_name, 'start')}</span>
            </div>
            <div style={{ minWidth: 0 }}>
              <h1 style={{ ...txt(28, 800), lineHeight: 1.2, marginBottom: 6 }}>{job.title}</h1>
              <div style={{ ...flex('center'), gap: 6 }}>
                <Link to={`/company-detail/${job.employer_id}`} style={{ ...txt(15, 600, COLORS.purple), textDecoration: 'none' }}>
                  {employer?.emp_name}
                </Link>
                {employer?.is_verified && <BadgeCheck size={17} color={COLORS.purple} />}
              </div>
            </div>
          </div>
          <div style={{ ...flex('center'), gap: 10, flexShrink: 0 }}>
            <button
              onClick={() => setSaved(toggleSavedJob(job.job_id))}
              style={{
                height: 46, padding: '0 18px', borderRadius: 12, cursor: 'pointer', fontSize: 14, fontWeight: 600,
                border: `1px solid ${saved ? COLORS.blueBorder : COLORS.border}`,
                background: saved ? COLORS.blueLight : COLORS.white, color: saved ? COLORS.purple : COLORS.navy,
                ...flex('center'), gap: 8
              }}
            >
              <Bookmark size={17} fill={saved ? COLORS.purple : 'none'} /> {saved ? 'Đã lưu' : 'Lưu tin'}
            </button>
            {/* Nút ứng tuyển chỉ hiện với ứng viên / khách; nhà tuyển dụng & quản trị thì ẩn */}
            {(isCandidate || !currentUser) && (
              <button
                onClick={() => (isCandidate ? setApplyOpen(true) : navigate('/login'))}
                style={{
                  height: 46, padding: '0 24px', borderRadius: 12, border: 'none', background: COLORS.purple,
                  color: COLORS.white, fontSize: 15, fontWeight: 700, cursor: 'pointer', boxShadow: SHADOW.primary,
                  ...flex('center'), gap: 8
                }}
              >
                <Send size={17} /> {isCandidate ? 'Ứng tuyển ngay' : 'Đăng nhập để ứng tuyển'}
              </button>
            )}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginTop: 26 }}>
          {[
            { icon: Wallet, label: 'Mức lương', value: formatSalary(job.salary_min, job.salary_max) },
            { icon: MapPin, label: 'Địa điểm', value: job.location || '—' },
            { icon: Clock, label: 'Kinh nghiệm', value: formatExperience(job.experience) },
            { icon: Layers, label: 'Hình thức', value: JOB_TYPE_LABELS[job.job_type] || '—' }
          ].map(({ icon: Icon, label, value }, i) => (
            // Ô gradient cùng kiểu ô thông tin ở trang hồ sơ
            <div key={label} style={{
              position: 'relative', overflow: 'hidden', ...flex('center'), gap: 12, padding: '14px 16px',
              borderRadius: 14, background: TILE_GRADIENTS[i], boxShadow: '0 1px 3px rgba(15, 23, 42, 0.08)', minWidth: 0
            }}>
              <div style={{
                position: 'absolute', width: 110, height: 110, borderRadius: '50%',
                background: 'rgba(255,255,255,0.12)', top: -48, right: -36, pointerEvents: 'none'
              }} />
              <div style={{
                width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.2)',
                border: '1px solid rgba(255,255,255,0.3)', ...flex('center'), justifyContent: 'center', flexShrink: 0
              }}>
                <Icon size={18} color={COLORS.white} />
              </div>
              <div style={{ minWidth: 0, position: 'relative' }}>
                <p style={{ ...txt(12, 500, 'rgba(255,255,255,0.85)') }}>{label}</p>
                <p style={{ ...txt(14, 700, COLORS.white), whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>

    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 32px 0', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 360px', gap: 24, alignItems: 'start' }}>
      {/* 4 mục tách riêng: tiêu đề nằm ngoài, nội dung trong thẻ riêng */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {sections.map(({ icon: Icon, title, text }) => {
          const lines = (text || '').split('\n').map(l => l.replace(/^[-•*]\s*/, '').trim()).filter(Boolean);
          return (
            <section key={title}>
              <h3 style={{ ...txt(18, 700), marginBottom: 12, ...flex('center'), gap: 10 }}>
                <span style={{ width: 34, height: 34, borderRadius: 10, background: COLORS.blueLight, ...flex('center'), justifyContent: 'center' }}>
                  <Icon size={17} color={COLORS.purple} />
                </span>
                {title}
              </h3>
              <div style={{ ...card(), padding: '18px 24px', borderLeft: `4px solid ${COLORS.purple}` }}>
                {lines.length === 0 ? (
                  <p style={{ ...txt(14, 400, COLORS.gray) }}>Chưa cập nhật</p>
                ) : (
                  <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {lines.map((line, i) => (
                      <li key={i} style={{ ...flex('flex-start'), gap: 10 }}>
                        {/* Dấu chấm đầu dòng */}
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: COLORS.purple, flexShrink: 0, marginTop: 9 }} />
                        <span style={{ ...txt(15, 400, COLORS.darkGray), lineHeight: 1.55 }}>{line}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          );
        })}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, position: 'sticky', top: 88 }}>
        {/* Tiêu đề nằm ngoài thẻ, cùng kiểu các mục bên trái */}
        <div>
        <h3 style={{ ...txt(18, 700), marginBottom: 12, ...flex('center'), gap: 10 }}>
          <span style={{ width: 34, height: 34, borderRadius: 10, background: COLORS.blueLight, ...flex('center'), justifyContent: 'center' }}>
            <Info size={17} color={COLORS.purple} />
          </span>
          Thông tin chung
        </h3>
        <div style={{ ...card(), padding: '8px 24px' }}>
          {[
            { icon: Users, label: 'Số lượng tuyển', value: job.num_slot ? `${job.num_slot} người` : '—' },
            { icon: Calendar, label: 'Hạn nộp hồ sơ', value: job.expiry_date ? formatDate(job.expiry_date) : 'Không thời hạn', color: COLORS.red },
            { icon: Briefcase, label: 'Cấp bậc', value: job.role || '—' },
            { icon: GraduationCap, label: 'Học vấn', value: job.education_level || '—' }
          ].map(({ icon: Icon, label, value, color }, i, arr) => (
            <div key={label} style={{
              ...flex('center'), gap: 12, padding: '12px 0',
              borderBottom: i === arr.length - 1 ? 'none' : `1px solid ${COLORS.border}`
            }}>
              <Icon size={18} color={COLORS.grayLight} />
              <span style={{ ...txt(14, 400, COLORS.gray), flex: 1 }}>{label}</span>
              <span style={{ ...txt(14, 600, color || COLORS.navy) }}>{value}</span>
            </div>
          ))}
        </div>
        </div>

        {/* Thẻ công ty: nền tím nhạt chuyển dần sang trắng */}
        <div style={{
          ...card(), padding: 24, border: `1px solid ${COLORS.blueBorder}`,
          background: 'linear-gradient(160deg, #ebe7ff 0%, #f5f3ff 55%, #ffffff 100%)'
        }}>
          <div style={{ ...flex('center'), gap: 14, marginBottom: 18 }}>
            <div style={{
              width: 52, height: 52, borderRadius: 14, background: GRADIENT.primary, flexShrink: 0,
              ...flex('center'), justifyContent: 'center', boxShadow: SHADOW.primary
            }}>
              <span style={{ ...txt(18, 800, COLORS.white) }}>{getInitials(employer?.emp_name, 'start')}</span>
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ ...txt(16, 700) }}>{employer?.emp_name}</p>
              {employer?.is_verified && (
                // inline-flex + lineHeight 1 để icon và chữ thẳng hàng
                <span style={{
                  ...txt(12, 600, COLORS.purple), display: 'inline-flex', alignItems: 'center', gap: 4,
                  lineHeight: 1, marginTop: 5
                }}>
                  <BadgeCheck size={14} style={{ display: 'block', flexShrink: 0 }} /> Đã xác thực
                </span>
              )}
            </div>
          </div>
          {[
            { icon: Users, label: 'Quy mô', value: employer?.scope },
            { icon: Briefcase, label: 'Lĩnh vực', value: employer?.field },
            { icon: MapPin, label: 'Địa chỉ', value: employer?.address }
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} style={{ ...flex('flex-start'), gap: 10, marginBottom: 12 }}>
              <Icon size={16} color={COLORS.grayLight} style={{ marginTop: 3, flexShrink: 0 }} />
              <span style={{ ...txt(14, 400, COLORS.gray) }}>
                {label}: <span style={{ color: COLORS.navy, fontWeight: 500 }}>{value || 'Chưa cập nhật'}</span>
              </span>
            </div>
          ))}
          <Link
            to={`/company-detail/${job.employer_id}`}
            style={{
              marginTop: 8, ...flex('center'), justifyContent: 'center', gap: 6, padding: '11px', borderRadius: 12,
              border: `1px solid ${COLORS.blueBorder}`, background: COLORS.white, ...txt(14, 600, COLORS.purple), textDecoration: 'none'
            }}
          >
            Xem trang công ty <ExternalLink size={15} />
          </Link>
        </div>

        {isCandidate && (
          <div style={{
            background: COLORS.yellowBg, border: `1px solid ${COLORS.yellowBorder}`,
            borderRadius: 16, padding: 22
          }}>
            <h4 style={{ ...txt(15, 700, COLORS.brown), marginBottom: 12, ...flex('center'), gap: 8 }}>
              <AlertTriangle size={18} color={COLORS.brown} /> Lưu ý khi ứng tuyển
            </h4>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {[
                'Không chuyển tiền đặt cọc cho bất kỳ lý do gì',
                'Không cung cấp thông tin cá nhân nhạy cảm qua email/điện thoại',
                'Xác minh thông tin công ty trước khi ứng tuyển'
              ].map((it, i) => (
                <li key={i} style={{ ...txt(13, 400, COLORS.brown), marginBottom: 5 }}>{it}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>

      {applyOpen && (
      <ApplyModal
        open={applyOpen}
        onClose={() => setApplyOpen(false)}
        setToast={setToast}
        job={job}
        employer={employer}
      />
      )}

    </div>
  );
}