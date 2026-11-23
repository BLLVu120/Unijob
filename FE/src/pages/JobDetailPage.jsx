import { useState, useRef, useEffect } from 'react';
import { useParams } from "react-router-dom";
import {
  Send, Briefcase, MapPin, Clock,
  Users, Gift, X, Upload, AlertTriangle,
  CheckCircle2, ExternalLink, Calendar
} from 'lucide-react';
import { flex, txt } from '../utils/styles';
import { COLORS } from "../constants/colors";
import { getInitials, formatDate } from "../utils/textUtils"
import { jobService } from "../services/jobService";
import { applicationService } from '../services/applicationService';
import { getEmployerById, getCurrentUser } from "../services/authService";
import Toast from '../components/Toast';

const gap = (n) => ({ gap: `${n}px` });

const Card = ({ children, style = {} }) => (
  <div style={{
    width: '100%',
    background: COLORS.white, borderRadius: 12, border: `1px solid ${COLORS.border}`,
    padding: '28px 28px', ...style
  }}>
    {children}
  </div>
);

const SectionHead = ({ icon: Icon, title }) => (
  <h3 style={{ ...txt(20, 700), marginBottom: 14, ...flex('center'), ...gap(10) }}>
    <Icon size={22} color={COLORS.navy} /> {title}
  </h3>
);

const WarningBox = ({ children }) => (
  <div style={{
    background: COLORS.yellow, border: `1px solid ${COLORS.yellowBorder}`,
    borderRadius: 10, padding: '14px 16px',
    ...flex('flex-start'), ...gap(10)
  }}>
    <AlertTriangle size={18} color="#92400e" style={{ flexShrink: 0, marginTop: 2 }} />
    <div style={{ ...txt(13, 400, '#92400e'), lineHeight: 1.55 }}>{children}</div>
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
  const [file, setFile] = useState(null);
  useEffect(() => {
    if (!open) {
      setFile(null);
      if (fileRef.current) fileRef.current.value = "";
    }
  }, [open]);
  const fileRef = useRef();

  const handleSubmit = async () => {
    try {
      if (!file) {
        setToast({ type: "warning", message: "Vui lòng upload CV" });
        return;
      }

      const user = getCurrentUser();

      if (!user || user.role !== "candidate") {
        setToast({ type: "error", message: "Bạn phải đăng nhập với tài khoản ứng viên" });
        return;
      }

      const uploadRes = await applicationService.uploadCV(file);
      const payload = {
        application_id: crypto.randomUUID(),
        job_id: job.job_id,
        candidate_id: user.candidate_id,
        cv_url: uploadRes.cv_url,
        status: "submitted",
      };

      await applicationService.addApplication(payload);
      setFile(null);
      onClose();
      setToast({
        type: "success",
        message: "Hồ sơ đã được gửi thành công!"
      });

    } catch (err) {
      console.error(err);
      setToast({ type: "error", message: err.message || "Ứng tuyển thất bại" });
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const f = e.dataTransfer?.files?.[0] || e.target.files?.[0];

    if (!f) return;

    if (f.type !== "application/pdf") {
      setToast({ type: "error", message: "Chỉ chấp nhận file PDF" });
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (f.size > maxSize) {
      setToast({ type: "error", message: "File vượt quá 5MB" });
      return;
    }

    setFile(f);
  };
  
  const labelStyle = { ...txt(14, 600), marginBottom: 6, display: 'block' };

  return (
    <ModalShell open={open} onClose={onClose}>
      <div style={{
        background: 'linear-gradient(135deg, #f97316, #fb923c)',
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
          background: '#fff7ed', border: `1px solid #fed7aa`, borderRadius: 10,
          padding: '12px 16px', marginBottom: 22
        }}>
          <p style={{ ...txt(15, 600, COLORS.navy) }}>{job?.title}</p>
          <p style={{ ...txt(13, 400, COLORS.gray), marginTop: 2 }}>{employer?.emp_name}</p>
        </div>

        <label style={labelStyle}>Tải lên CV <span style={{ color: COLORS.red }}>*</span></label>
        <div
          onClick={() => fileRef.current.click()}
          onDragOver={e => e.preventDefault()}
          onDrop={handleDrop}
          style={{
            border: `2px dashed ${file ? COLORS.green : COLORS.grayLight}`,
            borderRadius: 10, padding: '28px 16px', textAlign: 'center',
            cursor: 'pointer', background: file ? '#f0fdf4' : COLORS.offWhite,
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
            background: 'linear-gradient(135deg, #f97316, #fb923c)',
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

const ReportModal = ({ open, onClose }) => {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', address: '', email: '', content: '' });
  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const inputStyle = {
    width: '100%', padding: '11px 14px', borderRadius: 8,
    border: `1px solid ${COLORS.border}`, fontSize: 14, color: COLORS.navy,
    outline: 'none', boxSizing: 'border-box', background: COLORS.white
  };

  useEffect(() => { if (!open) setSubmitted(false); }, [open]);

  if (submitted) {
    return (
      <ModalShell open={open} onClose={onClose} maxW={460}>
        <div style={{ padding: '28px 28px 32px' }}>
          <div style={{ ...flex('center'), justifyContent: 'space-between', marginBottom: 28 }}>
            <span style={{ ...txt(20, 700) }}>Báo cáo tin tuyển dụng</span>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              <X size={20} color={COLORS.gray} />
            </button>
          </div>
          <div style={{
            background: COLORS.greenBg, border: `1px solid ${COLORS.greenBorder}`,
            borderRadius: 12, padding: '28px 20px', textAlign: 'center'
          }}>
            <CheckCircle2 size={40} color={COLORS.green} style={{ marginBottom: 12 }} />
            <p style={{ ...txt(15, 500, '#166534') }}>Báo cáo của bạn đã được tiếp nhận và xử lý.</p>
          </div>
        </div>
      </ModalShell>
    );
  }

  return (
    <ModalShell open={open} onClose={onClose}>
      <div style={{ padding: '28px 28px 32px' }}>
        <div style={{ ...flex('center'), justifyContent: 'space-between', marginBottom: 28 }}>
          <span style={{ ...txt(20, 700) }}>Báo cáo tin tuyển dụng</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={20} color={COLORS.gray} />
          </button>
        </div>

        <div style={{ ...flex('center'), ...gap(12), marginBottom: 22 }}>
          <span style={{ ...txt(14, 600), minWidth: 110 }}>Tin tuyển dụng:</span>
          <span style={{ ...txt(14, 400, COLORS.gray) }}>Nhân viên Phục vụ Part-time</span>
        </div>

        <div style={{ ...flex('flex-start'), ...gap(12), marginBottom: 22 }}>
          <label style={{ ...txt(14, 600), minWidth: 110, paddingTop: 2 }}>Nội dung <span style={{ color: COLORS.red }}>*</span></label>
          <textarea
            value={form.content} onChange={set('content')}
            placeholder="Nhập nội dung"
            rows={5}
            style={{ ...inputStyle, flex: 1, resize: 'vertical', minHeight: 100 }}
          />
        </div>

        <WarningBox>
          <strong>Lưu ý:</strong> Báo cáo sai sự thất có thể dẫn đến việc tài khoản bị khóa. Thông tin của bạn sẽ được bảo mật và chỉ sử dụng cho mục đích xác minh.
        </WarningBox>

        <div style={{ ...flex('center'), justifyContent: 'flex-end', ...gap(12), marginTop: 24 }}>
          <button onClick={onClose} style={{
            padding: '10px 28px', borderRadius: 8, border: `1px solid ${COLORS.border}`,
            background: COLORS.white, fontSize: 15, fontWeight: 500, color: COLORS.navy, cursor: 'pointer'
          }}>Hủy</button>
          <button onClick={() => setSubmitted(true)} style={{
            padding: '10px 28px', borderRadius: 8, border: 'none',
            background: COLORS.red, color: COLORS.white, fontSize: 15, fontWeight: 600, cursor: 'pointer'
          }}>Gửi báo cáo</button>
        </div>
      </div>
    </ModalShell>
  );
};

export default function JobDetailPage() {
  const currentUser = getCurrentUser();
  const isCandidate = currentUser?.role === "candidate";
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [employer, setEmployer] = useState(null);
  const [applyOpen, setApplyOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const jobData = await jobService.getJobById(id);
        setJob(jobData);

        if (jobData?.employer_id) {
          const emp = await getEmployerById(jobData.employer_id);
          setEmployer(emp);
        }
      } catch (err) {
        console.error("Lỗi lấy job:", err);
      }
    };

    fetchJob();
  }, [id]);

  if (!job) return;

  return (
    <div style={{
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      background: '#f1f5f9', minHeight: '100vh', paddingBottom: 28
    }}>
    {toast && (
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast(null)}
      />
    )}
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: 1200, margin: '0 auto', padding: '0 24px', display: 'flex', gap: 24, alignItems: 'flex-start' }}>
        <div style={{ width: 700, display: 'flex', marginTop: 28, flexDirection: 'column', gap: 20 }}>
          <Card>
            <div style={{ ...flex('center'), justifyContent: 'space-between', marginBottom: 10 }}>
              <div>
                <h1 style={{ ...txt(26, 700), marginBottom: 4 }}>{job.title}</h1>
                <div style={{ ...flex('center'), ...gap(5) }}>
                  <span style={{ ...txt(14, 500, COLORS.gray) }}>{employer?.emp_name}</span>
                </div>
              </div>
              <div style={{ ...flex('center'), ...gap(10), marginLeft: 29 }}>
                <button
                  onClick={() => {
                    if (!isCandidate) return;
                    setApplyOpen(true);
                  }}
                  disabled={!isCandidate}
                  style={{
                    padding: '8px 18px', borderRadius: 20, border: 'none',
                    background: isCandidate ? COLORS.navy : COLORS.grayLight,
                    cursor: isCandidate ? 'pointer' : 'not-allowed', 
                    color: COLORS.white, fontSize: 14, fontWeight: 600,
                    opacity: isCandidate ? 1 : 0.6,
                    ...flex('center'), ...gap(6)
                  }}
                >
                  <Send size={16} /> Ứng tuyển
                </button>
              </div>
            </div>

            <div style={{ ...flex('center'), ...gap(40), marginTop: 18, paddingTop: 18, borderTop: `1px solid ${COLORS.border}` }}>
              {[
                { 
                  icon: Briefcase,  
                  label: 'MỨC LƯƠNG',  
                  value: `${job.salary_min?.toLocaleString()} – ${job.salary_max?.toLocaleString()} VNĐ`,
                  valueColor: COLORS.blueText 
                },
                { 
                  icon: MapPin,     
                  label: 'ĐỊA ĐIỂM',
                  value: `${job.location}`,
                },
                { 
                  icon: Clock,      
                  label: 'KINH NGHIỆM',  
                  value: `${job.experience === 0 ? "Không yêu cầu" : `${job.experience} năm`}`
                }
              ].map(({ icon: Icon, label, value, valueColor }) => (
                <div key={label} style={{ ...flex('center'), ...gap(8) }}>
                  <Icon size={18} color={COLORS.grayMid} />
                  <div>
                    <p style={{ ...txt(11, 600, COLORS.grayMid), textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</p>
                    <p style={{ ...txt(14, 600, valueColor || COLORS.navy), marginTop: 2 }}>{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <SectionHead icon={Briefcase} title="Mô tả công việc" />
            <p style={{ ...txt(14, 400, COLORS.gray), marginBottom: 14 }}>
              {job.description}
            </p>
          </Card>

          <Card>
            <SectionHead icon={Users} title="Yêu cầu ứng viên" />
            <p style={{ ...txt(14, 400, COLORS.gray), marginBottom: 14 }}>
              {job.requirements}
            </p>
          </Card>

          <Card>
            <SectionHead icon={Calendar} title="Thời gian làm việc" />
            <p style={{ ...txt(14, 400, COLORS.gray), marginBottom: 14 }}>
              {job.working_shifts}
            </p>
          </Card>

          <Card>
            <SectionHead icon={Gift} title="Quyền lợi" />
            <p style={{ ...txt(14, 400, COLORS.gray), marginBottom: 14 }}>
              {job.benefits}
            </p>
          </Card>
        </div>

        <div style={{  width: 360, display: 'flex', flexDirection: 'column', gap: 20, marginTop: 28 }}>
          <Card>
            <div style={{ ...flex('center'), ...gap(16), marginBottom: 20 }}>
              <div style={{
                width: 72, height: 72, borderRadius: 14,
                background: 'linear-gradient(135deg, #f97316, #fb923c)',
                ...flex('center'), justifyContent: 'center'
              }}>
                <span style={{ ...txt(30, 800, COLORS.white), textAlign: 'center', lineHeight: 1.2 }}>
                  {getInitials(employer?.emp_name)}
                </span>
              </div>
              <span style={{ ...txt(18, 700) }}>{employer?.emp_name}</span>
            </div>

            {[
              { icon: Users, label: 'Quy mô:', value: employer?.scope },
              { icon: Briefcase, label: 'Lĩnh vực:', value: employer?.field },
              { icon: MapPin, label: 'Địa chỉ:', value: employer?.address }
            ].map(({ icon: Icon, label, value }, index) => (
              <div key={index} style={{ ...flex('flex-start'), ...gap(10), marginBottom: 12 }}>
                <Icon size={17} color={COLORS.grayMid} style={{ marginTop: 2, flexShrink: 0 }} />
                <div>
                  <span style={{ ...txt(13, 600, COLORS.gray) }}>{label} </span>
                  <span style={{ ...txt(13, 500, COLORS.navy) }}>{value || "Chưa cập nhật"}</span>
                </div>
              </div>
            ))}

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 10 }}>
              {employer?.website && (
                <a
                  href={employer.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    ...txt(14, 600, COLORS.blueText),
                    textDecoration: 'none'
                  }}
                >
                  Xem trang công ty <ExternalLink size={15} />
                </a>
              )}
            </div>
          </Card>

          <Card>
            <h3 style={{ ...txt(18, 700), marginBottom: 18, ...flex('center'), ...gap(8) }}>
              <span style={{
                width: 28, height: 28, borderRadius: '50%', background: COLORS.navy,
                ...flex('center'), justifyContent: 'center'
              }}>
                <span style={{ color: COLORS.white, fontSize: 15, fontWeight: 700 }}>i</span>
              </span>
              Thông tin chung
            </h3>
            
            {[
              { label: 'SỐ LƯỢNG TUYỂN', value: `${job.num_slot} người`, color: COLORS.green },
              { label: 'HẠN NỘP HỒ SƠ', value: formatDate(job.expiry_date), color: COLORS.red },
              { label: 'CẤP BẬC', value: job.role },
              { label: 'HỌC VẤN', value: job.education_level }
            ].map(({ label, value, color }, i, arr) => {
              const isLast = i === arr.length - 1;
              return (
                  <div
                  key={label}
                  style={{
                      paddingBottom: isLast ? 0 : 14,
                      marginBottom: isLast ? 0 : 14,
                      borderBottom: isLast ? 'none' : `1px solid ${COLORS.border}`
                  }}
                  >
                  <p style={{ ...txt(11, 700, COLORS.grayMid), marginBottom: 4 }}>
                      {label}
                  </p>
                  <p style={{ ...txt(14, 600, color || COLORS.navy) }}>{value}</p>
                  </div>
              );
            })}
          </Card>

          {isCandidate && (
            <div style={{
              background: COLORS.yellow, border: `1px solid ${COLORS.yellowBorder}`,
              borderRadius: 12, padding: 22
            }}>
              <h4 style={{ ...txt(16, 700, '#92400e'), marginBottom: 12, ...flex('center'), ...gap(8) }}>
                <AlertTriangle size={18} color="#92400e" /> Lưu ý khi ứng tuyển
              </h4>
              <ul style={{ margin: 0, paddingLeft: 18, marginBottom: 16 }}>
                {[
                  'Không chuyển tiền đặt cọc cho bất kỳ lý do gì',
                  'Không cung cấp thông tin các nhân nhạy cảm qua email/điện thoại',
                  'Xác minh thông tin công ty trước khi ứng tuyển'
                ].map((it, i) => (
                  <li key={i} style={{ ...txt(13, 400, '#92400e'), marginBottom: 5 }}>{it}</li>
                ))}
              </ul>
              <p style={{ ...txt(13, 400, '#92400e'), marginBottom: 16 }}>
                Nếu bạn thấy rằng tin tuyển dụng này không đúng, hãy phản ánh với chúng tôi.
              </p>
              <button
                onClick={() => setReportOpen(true)}
                style={{
                  width: '100%', padding: '11px', borderRadius: 8, border: 'none',
                  background: COLORS.red, color: COLORS.white, fontSize: 14, fontWeight: 600,
                  cursor: 'pointer', ...flex('center'), justifyContent: 'center', ...gap(6)
                }}
              >
                <AlertTriangle size={16} /> Báo cáo tin tuyển dụng
              </button>
            </div>
          )}
        </div>
      </div>
    </div>

      <ApplyModal
        open={applyOpen}
        onClose={() => setApplyOpen(false)}
        setToast={setToast}
        job={job}
        employer={employer}
      />
      <ReportModal open={reportOpen} onClose={() => setReportOpen(false)} />

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(110%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
        input:focus, textarea:focus { border-color: #3b82f6 !important; }
        input::placeholder, textarea::placeholder { color: #94a3b8; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
      `}</style>
    </div>
  );
}