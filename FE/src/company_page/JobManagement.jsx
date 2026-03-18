import { useState, useEffect } from 'react';
import {
  Building2, CreditCard, Search, Eye, Edit, Trash2,
  Plus, RefreshCw, X, MapPin, Briefcase, GraduationCap,
  Clock, CheckCircle, XCircle, AlertCircle, Calendar,
  TrendingUp, PauseCircle, Hourglass
} from 'lucide-react';
import { flex, txt } from '../utils/styles';
import { COLORS } from '../constants/colors';
import { pageBtnStyle } from '../constants/pageBtnStyle';
import { jobService } from "../services/jobService";
import { formatDate } from '../utils/textUtils';
import { jobFormFields, getJobFieldKey, jobExperienceLabel } from '../constants/jobFormFields';
import { BG } from '../constants/backgrounds';
import Toast from '../components/Toast';
const C = COLORS;

const RenewJobModal = ({ open, onClose }) => {
  const [paymentMethod, setPaymentMethod] = useState('bank');

  if (!open) return null;

  return (
    <>
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000
      }} />
      <div style={{
        position: 'fixed', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 1001, width: '100%', maxWidth: 520,
        background: C.white, borderRadius: 16,
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        <div style={{
          ...flex('center'), justifyContent: 'space-between',
          padding: '24px 28px', borderBottom: `1px solid ${C.border}`
        }}>
          <div>
            <h2 style={{ ...txt(22, 700), marginBottom: 5 }}>Làm mới tin tuyển dụng</h2>
            <p style={{ ...txt(14, 400, C.gray) }}>Xác nhận thông tin thanh toán</p>
          </div>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: 4
          }}>
            <X size={24} color={C.gray} />
          </button>
        </div>

        <div style={{ padding: '24px 28px' }}>
          <div style={{
            background: C.grayBg, borderRadius: 12, padding: '16px 20px', marginBottom: 24
          }}>
            <h3 style={{ ...txt(14, 700, C.gray), textTransform: 'uppercase', marginBottom: 12 }}>
              CHI TIẾT THANH TOÁN
            </h3>
            <div style={{ ...flex('center'), justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ ...txt(14, 400, C.gray) }}>Thời hạn mở rộng</span>
              <span style={{ ...txt(14, 600) }}>+15 ngày</span>
            </div>
            <div style={{ ...flex('center'), justifyContent: 'space-between' }}>
              <span style={{ ...txt(14, 400, C.gray) }}>Ngày hết hạn mới</span>
              <span style={{ ...txt(14, 600) }}>20/4/2026</span>
            </div>
          </div>

          <div style={{
            background: `linear-gradient(135deg, ${C.purple}, ${C.purpleLight})`,
            borderRadius: 12, padding: '16px 20px', marginBottom: 24,
            ...flex('center'), justifyContent: 'space-between'
          }}>
            <span style={{ ...txt(16, 600, C.white) }}>Tổng thanh toán</span>
            <span style={{ ...txt(24, 700, C.white) }}>50.000đ</span>
          </div>

          <h3 style={{ ...txt(16, 700), marginBottom: 16 }}>Phương thức thanh toán</h3>
          {[
            { id: 'bank', label: 'Chuyển khoản ngân hàng', icon: Building2 },
            { id: 'wallet', label: 'Ví điện tử (Momo, ZaloPay)', icon: CreditCard },
            { id: 'card', label: 'Thẻ tín dụng/Ghi nợ', icon: CreditCard }
          ].map(method => (
            <div
              key={method.id}
              onClick={() => setPaymentMethod(method.id)}
              style={{
                ...flex('center'), gap: 12, padding: '14px 16px',
                border: `2px solid ${paymentMethod === method.id ? C.blue : C.border}`,
                borderRadius: 10, marginBottom: 12, cursor: 'pointer',
                background: paymentMethod === method.id ? C.blueLight : C.white,
                transition: 'all 0.2s'
              }}
            >
              <div style={{
                width: 20, height: 20, borderRadius: '50%',
                border: `2px solid ${paymentMethod === method.id ? C.blue : C.border}`,
                ...flex('center'), justifyContent: 'center',
                background: C.white
              }}>
                {paymentMethod === method.id && (
                  <div style={{
                    width: 12, height: 12, borderRadius: '50%', background: C.blue
                  }} />
                )}
              </div>
              <method.icon size={20} color={C.navy} />
              <span style={{ ...txt(14, 500) }}>{method.label}</span>
            </div>
          ))}
        </div>

        <div style={{
          padding: '20px 28px', borderTop: `1px solid ${C.border}`,
          ...flex('center'), justifyContent: 'flex-end', gap: 12
        }}>
          <button onClick={onClose} style={{
            padding: '12px 28px', borderRadius: 10,
            border: `1px solid ${C.border}`, background: C.white,
            color: C.navy, fontSize: 15, fontWeight: 600, cursor: 'pointer'
          }}>
            Hủy
          </button>
          <button style={{
            padding: '12px 28px', borderRadius: 10, border: 'none',
            background: C.blue, color: C.white,
            fontSize: 15, fontWeight: 600, cursor: 'pointer'
          }}>
            Xác nhận thanh toán
          </button>
        </div>
      </div>
    </>
  );
};

const ViewJobModal = ({ open, onClose, job }) => {
  if (!open || !job) return null;

  const statusConfig = {
    active: {
      badge: { bg: C.greenBg, text: C.green, label: 'Đang hoạt động', icon: CheckCircle }
    },
    pending: {
      badge: { bg: C.blueLight, text: C.blue, label: 'Chờ duyệt', icon: Clock }
    },
    paused: {
      badge: { bg: C.yellowBg, text: '#f59e0b', label: 'Tạm dừng', icon: PauseCircle }
    },
    expired: {
      badge: { bg: C.grayBg, text: C.gray, label: 'Hết hạn', icon: Clock }
    },
    rejected: {
      badge: { bg: C.redBg, text: C.red, label: 'Từ chối duyệt', icon: XCircle },
      showRejectionReason: true,
      rejectionReason: 'Mô tả công việc không rõ ràng, thiếu nhất quán với các yêu cầu.'
    }
  };

  const config = statusConfig[job?.detailedStatus] || statusConfig.pending;
  const StatusIcon = config.badge.icon;

  return (
    <>
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000
      }} />
      <div style={{
        position: 'fixed', inset: 0, zIndex: 1001,
        ...flex('center'), justifyContent: 'center', padding: 24, overflowY: 'auto'
      }}>
        <div style={{
          background: C.white, borderRadius: 20,
          width: '100%', maxWidth: 1100,
          maxHeight: '90vh', overflowY: 'auto',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
        }}>
          <div style={{
            background: `linear-gradient(135deg, ${C.purple}, ${C.purpleLight})`,
            borderRadius: '20px 20px 0 0', padding: '28px 32px'
          }}>
            <div style={{ ...flex('center'), justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ ...flex('center'), gap: 12 }}>
                <span style={{
                  padding: '6px 16px', borderRadius: 20,
                  background: 'rgba(255,255,255,0.2)',
                  color: C.white, fontSize: 14, fontWeight: 600
                }}>
                  <Calendar size={14} style={{ display: 'inline', marginRight: 6 }} />
                  Ngày đăng: {job.createdDate} • Hết hạn: {job.expiryDate}
                </span>
                <span style={{
                  padding: '6px 16px', borderRadius: 20,
                  background: config.badge.bg,
                  color: config.badge.text,
                  fontSize: 13, fontWeight: 600,
                  ...flex('center'), gap: 6
                }}>
                  <StatusIcon size={14} /> {config.badge.label}
                </span>
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
            <h2 style={{ ...txt(28, 700, C.white), marginBottom: 12 }}>{job.title}</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              {[
                { icon: MapPin, label: 'Địa điểm', value: job.location },
                { 
                  icon: Briefcase, 
                  label: 'Mức lương', 
                  value: `${job.salary_min?.toLocaleString()} - ${job.salary_max?.toLocaleString()} VND`
                },
                { icon: GraduationCap, label: 'Kinh nghiệm', value: jobExperienceLabel[job.experience] }
              ].map(({ icon: Icon, label, value }, i) => (
                <div key={i} style={{
                  background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)',
                  borderRadius: 12, padding: '12px 16px'
                }}>
                  <div style={{ ...flex('center'), gap: 6, marginBottom: 4 }}>
                    <Icon size={14} color={C.white} />
                    <span style={{ ...txt(12, 500, C.white), opacity: 0.9 }}>{label}</span>
                  </div>
                  <p style={{ ...txt(14, 700, C.white) }}>{value}</p>
                </div>
              ))}
            </div>
          </div>

          <div style={{ padding: '32px', display: 'grid', gridTemplateColumns: '1fr 400px', gap: 32 }}>
            <div>
              {[
                { title: 'Mô tả công việc', value: job.description },
                { title: 'Yêu cầu ứng viên', value: job.requirements },
                { title: 'Thời gian làm việc', value: job.working_shifts },
                { title: 'Quyền lợi', value: job.benefits }
              ].map((section, idx) => (
                <div key={idx} style={{ marginBottom: 32 }}>
                  <h3 style={{ ...txt(18, 700), marginBottom: 12 }}>{section.title}</h3>

                  <div style={{ background: C.grayBg, borderRadius: 12, padding: '16px' }}>
                    <p style={{ ...txt(14, 400, C.gray), whiteSpace: 'pre-line', margin: 0 }}>
                      {section.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div>
              <h3 style={{ ...txt(18, 700), marginBottom: 16 }}>Thông tin chung</h3>
                {[
                  { label: 'SỐ LƯỢNG TUYỂN', value: `${job.num_slot} người` },
                  { label: 'HẠN NỘP HỒ SƠ', value: formatDate(job.expiry_date) },
                  { label: 'CẤP BẬC', value: job.role },
                  { label: 'HỌC VẤN', value: job.education_level }
                ].map(({ label, value }, i, arr) => (
                <div
                    key={i}
                    style={{
                    paddingBottom: i === arr.length - 1 ? 0 : 16,
                    marginBottom: i === arr.length - 1 ? 0 : 16,
                    borderBottom: i === arr.length - 1 ? 'none' : `1px solid ${C.border}`
                    }}
                >
                  <p style={{ ...txt(11, 700, C.grayLight), textTransform: 'uppercase', marginBottom: 6 }}>
                    {label}
                  </p>
                  <p style={{ ...txt(14, 600) }}>{value}</p>
                </div>
              ))}

              {config.showRejectionReason && (
                <div style={{ marginTop: 24 }}>
                  <h3 style={{ ...txt(18, 700), marginBottom: 12, ...flex('center'), gap: 8 }}>
                    <AlertCircle size={20} color={C.red} /> Lí do bị từ chối
                  </h3>
                  <div style={{
                    background: C.redBg, borderRadius: 12, padding: 16,
                    border: `1px solid ${C.red}`
                  }}>
                    <p style={{ ...txt(14, 400, C.red) }}>
                      {config.rejectionReason}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div style={{
            padding: '20px 32px', borderTop: `1px solid ${C.border}`,
            ...flex('center'), justifyContent: 'flex-end'
          }}>
            <button onClick={onClose} style={{
              padding: '12px 32px', borderRadius: 10, border: 'none',
              background: C.blue, color: C.white,
              fontSize: 15, fontWeight: 600, cursor: 'pointer'
            }}>
              Đóng
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

const JobFormModal = ({ open, onClose, job, isEdit, onSuccess }) => {
  const initialFormData = {
    title: "",
    role: "Nhân viên",
    location: "TP. Hồ Chí Minh",
    experience: 0,
    education_level: "Không yêu cầu",
    salary_min: "",
    salary_max: "",
    num_slot: 1,
    expiry_date: "",
    description: "",
    requirements: "",
    benefits: "",
    working_shifts: "",
    job_type: "offline"
  };
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEdit && job) {
      setFormData({
        title: job.title || "",
        role: job.role || "Nhân viên",
        location: job.location || "TP. Hồ Chí Minh",
        experience: job.experience || 0,
        education_level: job.education_level || "Không yêu cầu",
        salary_min: job.salary_min || 0,
        salary_max: job.salary_max || 0,
        num_slot: job.num_slot || 1,
        expiry_date: job.expiry_date || "",
        description: job.description || "",
        requirements: job.requirements || "",
        benefits: job.benefits || "",
        working_shifts: job.working_shifts || "",
        job_type: job.job_type || "offline"
      });
    }
  }, [job, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) newErrors.title = "Vui lòng nhập tiêu đề";

    if (!formData.location.trim()) newErrors.location = "Vui lòng nhập địa điểm";
    
    if (!formData.salary_min && formData.salary_min !== 0)  newErrors.salary_min = "Vui lòng nhập lương tối thiểu";
    else if (Number(formData.salary_min) < 0) newErrors.salary_min = "Lương tối thiểu không hợp lệ";
    
    if (!formData.salary_max && formData.salary_max !== 0) newErrors.salary_max = "Vui lòng nhập lương tối đa";
    else if (Number(formData.salary_max) < Number(formData.salary_min)) 
      newErrors.salary_max = "Lương tối đa phải lớn hơn lương tối thiểu";

    if (!formData.expiry_date) newErrors.expiry_date = "Vui lòng chọn ngày hết hạn";
    
    if (!formData.description.trim()) newErrors.description = "Vui lòng nhập mô tả công việc";
    
    if (!formData.requirements.trim()) newErrors.requirements = "Vui lòng nhập yêu cầu ứng viên";
    
    if (!formData.benefits.trim()) newErrors.benefits = "Vui lòng nhập quyền lợi";

    if (!formData.working_shifts.trim()) newErrors.working_shifts = "Vui lòng nhập thời gian làm việc";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateJob = async () => {
    if (!validateForm()) return;
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const employerId = user?.emp_id;

      if (!employerId) {
        console.error("Không tìm thấy employer_id");
        return;
      }

      const jobPayload = {
        job_id: crypto.randomUUID(),
        employer_id: employerId,
        ...formData,
        salary_min: Number(formData.salary_min),
        salary_max: Number(formData.salary_max),
        experience: Number(formData.experience),
        num_slot: Number(formData.num_slot),
        is_active: true
      };

      await jobService.addJob(jobPayload);
      setFormData(initialFormData);
      onClose();     
      onSuccess?.("Tạo tin tuyển dụng thành công");

    } catch (err) {
      console.error("API error:", err);
    }
  };

  const handleUpdateJob = async () => {
    if (!validateForm()) return;

    try {
      const jobPayload = {
        job_id: job.job_id,
        ...formData,
        salary_min: Number(formData.salary_min),
        salary_max: Number(formData.salary_max),
        experience: Number(formData.experience),
        num_slot: Number(formData.num_slot)
      };

      await jobService.updateJob(jobPayload);

      onClose();
      onSuccess?.("Cập nhật tin tuyển dụng thành công");

    } catch (err) {
      console.error("Update job error:", err);
    }
  };

  if (!open) return null;

  return (
    <>
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000
      }} />
      <div style={{
        position: 'fixed', inset: 0, zIndex: 1001,
        ...flex('center'), justifyContent: 'center', padding: 24, overflowY: 'auto'
      }}>
        <div style={{
          background: C.white, borderRadius: 16,
          width: '100%', maxWidth: 900,
          maxHeight: '90vh', overflowY: 'auto',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
        }}>
          <div style={{
            ...flex('center'), justifyContent: 'space-between',
            padding: '24px 32px', borderBottom: `1px solid ${C.border}`
          }}>
            <h2 style={{ ...txt(24, 700) }}>
              {isEdit ? 'Sửa tin tuyển dụng' : 'Đăng tin tuyển dụng'}
            </h2>
            <button onClick={onClose} style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: 4
            }}>
              <X size={24} color={C.gray} />
            </button>
          </div>

          <div style={{ padding: '24px 32px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
              {jobFormFields.map((field, i) => (
                <div key={i} style={{ gridColumn: 'auto' }}>
                  <label style={{ ...txt(14, 600), display: 'block', marginBottom: 8 }}>
                    {field.label} {field.required && <span style={{ color: C.red }}>*</span>}
                  </label>
                  {field.type === 'select' ? (
                    <select 
                      name={field.name}
                      value={formData[field.name] || ""}
                      onChange={handleChange}
                      style={{
                        width: '100%', padding: '10px 14px', borderRadius: 8,
                        border: `1px solid ${C.border}`, fontSize: 14, outline: 'none', appearance: 'none',
                        background: `${C.white} ${BG.dropdown}`
                      }}>
                      {field.options.map(opt => (
                        <option key={opt.value || opt} value={opt.value || opt}>
                          {opt.label || opt}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={field.type || "text"}
                      name={field.name}
                      value={formData[field.name] || ""}
                      onChange={handleChange}
                      placeholder={field.placeholder}
                      style={{
                        width: '100%', padding: '10px 14px', borderRadius: 8,
                        border: `1px solid ${C.border}`, fontSize: 14, outline: 'none'
                      }}
                    />
                  )}
                  {errors[field.name] && (
                    <div style={{ fontSize: '12px', color: C.red, marginTop: '10px' }}>
                      {errors[field.name]}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {['Mô tả công việc', 'Yêu cầu ứng viên', 'Thời gian làm việc', 'Quyền lợi'].map((field, i) => (
              <div key={i} style={{ marginBottom: 20 }}>
                <label style={{ ...txt(14, 600), display: 'block', marginBottom: 8 }}>
                  {field} <span style={{ color: C.red }}>*</span>
                </label>
                <textarea
                  name={getJobFieldKey(field)}
                  value={formData[getJobFieldKey(field)]}
                  onChange={handleChange}
                  style={{
                    width: '100%', minHeight: 100, padding: '12px', borderRadius: 8,
                    border: `1px solid ${C.border}`, fontSize: 14, fontFamily: 'inherit',
                    resize: 'vertical', outline: 'none'
                  }}
                />
                {errors[getJobFieldKey(field)] && (
                  <div style={{ fontSize: '12px', color: C.red, marginTop: '6px' }}>
                    { errors[getJobFieldKey(field)] }
                  </div>
                )}
              </div>
            ))}
          </div>

          <div style={{
            padding: '20px 32px', borderTop: `1px solid ${C.border}`,
            ...flex('center'), justifyContent: 'flex-end', gap: 12
          }}>
            <button onClick={onClose} style={{
              padding: '12px 28px', borderRadius: 10,
              border: `1px solid ${C.border}`, background: C.white,
              color: C.navy, fontSize: 15, fontWeight: 600, cursor: 'pointer'
            }}>
              Hủy
            </button>
            <button
              type="button"
              onClick={isEdit ? handleUpdateJob : handleCreateJob}
              style={{
                padding: '12px 28px', borderRadius: 10, border: 'none',
                background: C.blue, color: C.white,
                fontSize: 15, fontWeight: 600, cursor: 'pointer'
              }}
            >
              {isEdit ? 'Lưu thay đổi' : 'Đăng tin'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

const DeleteConfirmModal = ({ open, onClose, onConfirm, jobTitle }) => {
  if (!open) return null;

  return (
    <>
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000
      }} />
      <div style={{
        position: 'fixed', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 1001, width: '100%', maxWidth: 480,
        background: C.white, borderRadius: 16,
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        padding: 32, textAlign: 'center'
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          background: C.redBg, margin: '0 auto 20px',
          ...flex('center'), justifyContent: 'center'
        }}>
          <Trash2 size={32} color={C.red} />
        </div>
        <h2 style={{ ...txt(22, 700), marginBottom: 12 }}>Xác nhận xóa</h2>
        <p style={{ ...txt(15, 400, C.gray), marginBottom: 24 }}>
          Bạn có chắc chắn muốn xóa tin tuyển dụng <strong>{jobTitle}</strong>? 
          Hành động này không thể hoàn tác.
        </p>
        <div style={{ ...flex('center'), justifyContent: 'center', gap: 12 }}>
          <button onClick={onClose} style={{
            padding: '12px 28px', borderRadius: 10,
            border: `1px solid ${C.border}`, background: C.white,
            color: C.navy, fontSize: 15, fontWeight: 600, cursor: 'pointer'
          }}>
            Hủy
          </button>
          <button onClick={onConfirm} style={{
            padding: '12px 28px', borderRadius: 10, border: 'none',
            background: C.red, color: C.white,
            fontSize: 15, fontWeight: 600, cursor: 'pointer'
          }}>
            Xóa tin
          </button>
        </div>
      </div>
    </>
  );
};

export default function JobManagementPage() {
  const [jobs, setJobs] = useState([]);
  const [toast, setToast] = useState(null);

  const reloadJobs = async (message) => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const employerId = user?.emp_id;
      const data = await jobService.getJobsByEmployer(employerId);
      setJobs(data || []);
      setToast({ show: false, message: "", type: "success" });
      setTimeout(() => {
        setToast({
          show: true,
          message,
          type: "success"
        });
      }, 50);

    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteJob = async (jobId) => {
    try {
      await jobService.deleteJob(jobId);
      setJobs(prev => prev.filter(job => job.job_id !== jobId));
      setToast({ show: false, message: "", type: "success" });

      setTimeout(() => {
        setToast({
          show: true,
          message: "Xóa tin tuyển dụng thành công",
          type: "success"
        });
      }, 50);

    } catch (err) {
      setToast({ show: false, message: "", type: "error" });

      setTimeout(() => {
        setToast({
          show: true,
          message: "Xóa tin thất bại",
          type: "error"
        });
      }, 50);
    }
  };

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        const employerId = user?.emp_id;

        if (!employerId) {
          console.error("Không tìm thấy employer");
          return;
        }

        const data = await jobService.getJobsByEmployer(employerId);
        setJobs(data || []);

      } catch (err) {
        console.error("Lỗi lấy job:", err);
      }
    };
    fetchJobs();
  }, []);

  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [renewModalOpen, setRenewModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  const fetchJobDetail = async (jobId) => {
    try {
      const job = await jobService.getJobById(jobId);
      setSelectedJob(job);
      setViewModalOpen(true);
    } catch (err) {
      console.error("Lỗi lấy chi tiết job:", err);
    }
  };

  const [page, setPage] = useState(1);
  const rowsPerPage = 5;
  const total = jobs.length;
  const totalPages = Math.ceil(total / rowsPerPage);
  const start = (page - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  const currentJobs = jobs.slice(start, end);

  const stats = [
    { icon: Briefcase, label: 'Tổng tin đăng', value: jobs.length, bgColor: C.grayBg },
    { icon: TrendingUp, label: 'Đang hoạt động', value: 18, bgColor: C.greenBg },
    { icon: Hourglass, label: 'Chờ duyệt', value: 3, bgColor: C.blueLight },
    { icon: PauseCircle, label: 'Tạm dừng', value: 4, bgColor: C.yellowBg },
    { icon: Clock, label: 'Hết hạn', value: 2, bgColor: C.grayBg },
    { icon: XCircle, label: 'Từ chối duyệt', value: 2, bgColor: C.redBg }
  ];

  return (
    <div style={{
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      background: C.grayBg, minHeight: '100vh'
    }}>
      <main style={{ padding: '40px 48px' }}>
        <div style={{ ...flex('center'), justifyContent: 'space-between', marginBottom: 32 }}>
          <h1 style={{ ...txt(32, 700) }}>Tin tuyển dụng</h1>
          <button
            onClick={() => setCreateModalOpen(true)}
            style={{
              padding: '12px 24px', borderRadius: 10,
              border: 'none', background: C.purple,
              color: C.white, fontSize: 15, fontWeight: 600,
              cursor: 'pointer', ...flex('center'), gap: 8
            }}
          >
            <Plus size={18} /> Tạo tin mới
          </button>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(6, 1fr)',
          gap: 20,
          marginBottom: 32
        }}>
          {stats.map((stat, i) => (
            <div key={i} style={{
              background: C.white,
              borderRadius: 16,
              border: `1px solid ${C.border}`,
              padding: '20px',
              ...flex('flex-start', 'column'),
              gap: 12
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: 12,
                background: stat.bgColor,
                ...flex('center'), justifyContent: 'center'
              }}>
                <stat.icon size={24} color={C.navy} />
              </div>
              <div>
                <p style={{ ...txt(13, 500, C.gray), marginBottom: 4 }}>{stat.label}</p>
                <p style={{ ...txt(28, 700) }}>{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div style={{
          background: C.white,
          borderRadius: 16,
          border: `1px solid ${C.border}`,
          padding: '20px 24px',
          marginBottom: 24,
          ...flex('center'),
          gap: 16
        }}>
          <div style={{
            ...flex('center'), gap: 10, flex: 1,
            padding: '10px 14px', borderRadius: 8,
            border: `1px solid ${C.border}`
          }}>
            <Search size={18} color={C.gray} />
            <input
              placeholder="Tìm kiếm tin tuyển dụng"
              style={{
                border: 'none', outline: 'none',
                fontSize: 14, flex: 1, background: 'transparent'
              }}
            />
          </div>
          <select style={{
            padding: '10px 14px', borderRadius: 8,
            border: `1px solid ${C.border}`,
            fontSize: 14, outline: 'none', cursor: 'pointer',
            minWidth: 180,
            appearance: 'none',
            background: `${C.white} ${BG.dropdown}`
          }}>
            <option value="">Tất cả trạng thái</option>
            <option value="active">Đang hoạt động</option>
            <option value="expired">Hết hạn</option>
            <option value="paused">Tạm dừng</option>
            <option value="rejected">Từ chối</option>
          </select>
          <button style={{
            padding: '10px 32px', borderRadius: 8,
            border: 'none', background: C.purple,
            color: C.white, fontSize: 14, fontWeight: 600,
            cursor: 'pointer'
          }}>
            Lọc
          </button>
        </div>

        <div style={{
          background: C.white,
          borderRadius: 16,
          border: `1px solid ${C.border}`,
          overflow: 'hidden'
        }}>
          {currentJobs.length > 0 ? (
            <>
              <div style={{
                padding: '20px 24px',
                borderBottom: `1px solid ${C.border}`,
                ...flex('center'),
                justifyContent: 'space-between'
              }}>
                <h2 style={{ ...txt(18, 700) }}>Danh sách tin tuyển dụng ({currentJobs.length})</h2>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: C.grayBg }}>
                    {['TIN TUYỂN DỤNG', 'TRẠNG THÁI', 'NGÀY ĐĂNG', 'NGÀY HẾT HẠN', 'HIỂN THỊ', 'THAO TÁC'].map(h => (
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
                <tr key={job.job_id} style={{ borderTop: `1px solid ${C.border}` }}>
                  <td style={{ padding: '16px 20px' }}>
                    <span style={{ ...txt(14, 600) }}>{job.title}</span>
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <span style={{
                      padding: '6px 14px', borderRadius: 16,
                      background: job.statusColor,
                      color: job.statusText,
                      fontSize: 13, fontWeight: 600
                    }}>
                      {job.statusLabel}
                    </span>
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <span style={{ ...txt(14, 400) }}>{job.createdDate}</span>
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <span style={{ ...txt(14, 400) }}>{job.expiryDate}</span>
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <label style={{
                      position: 'relative',
                      display: 'inline-block',
                      width: 44,
                      height: 24,
                      cursor: job.canToggle ? 'pointer' : 'not-allowed',
                      opacity: job.canToggle ? 1 : 0.5
                    }}>
                      <input
                        type="checkbox"
                        checked={job.enabled}
                        disabled={!job.canToggle}
                        style={{ display: 'none' }}
                      />
                      <div style={{
                        position: 'absolute',
                        inset: 0,
                        background: job.enabled ? C.green : C.gray,
                        borderRadius: 12,
                        transition: 'all 0.3s'
                      }} />
                      <div style={{
                        position: 'absolute',
                        top: 2,
                        left: job.enabled ? 22 : 2,
                        width: 20,
                        height: 20,
                        background: C.white,
                        borderRadius: '50%',
                        transition: 'all 0.3s'
                      }} />
                    </label>
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ ...flex('center'), gap: 8 }}>
                      <button
                        onClick={() => fetchJobDetail(job.job_id)}
                        title="Xem chi tiết"
                        style={{
                          width: 36, height: 36, borderRadius: 8,
                          border: 'none', background: C.blue,
                          cursor: 'pointer',
                          ...flex('center'), justifyContent: 'center'
                        }}
                      >
                        <Eye size={18} color={C.white} />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedJob(job);
                          setEditModalOpen(true);
                        }}
                        title="Sửa"
                        style={{
                          width: 36, height: 36, borderRadius: 8,
                          border: 'none', background: C.green,
                          cursor: 'pointer',
                          ...flex('center'), justifyContent: 'center'
                        }}
                      >
                        <Edit size={18} color={C.white} />
                      </button>
                      {job.showRenew && (
                        <button
                          onClick={() => {
                            setSelectedJob(job);
                            setRenewModalOpen(true);
                          }}
                          title="Làm mới"
                          style={{
                            width: 36, height: 36, borderRadius: 8,
                            border: 'none', background: C.darkPurple,
                            cursor: 'pointer',
                            ...flex('center'), justifyContent: 'center'
                          }}
                        >
                          <RefreshCw size={18} color={C.white} />
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setSelectedJob(job);
                          setDeleteModalOpen(true);
                        }}
                        title="Xóa"
                        style={{
                          width: 36, height: 36, borderRadius: 8,
                          border: 'none', background: C.red,
                          cursor: 'pointer',
                          ...flex('center'), justifyContent: 'center'
                        }}
                      >
                        <Trash2 size={18} color={C.white} />
                      </button>
                    </div>
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
                Hiển thị {start + 1}-{Math.min(end, total)} trong tổng số {total} tin tuyển dụng
              </span>
              <div style={{ ...flex('center'), gap: 8 }}>
                  {totalPages > 3 && page > 1 && (
                    <button onClick={() => setPage(page - 1)} style={pageBtnStyle}>←</button>
                  )}
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(p => p >= page - 1 && p <= page + 1)
                    .map(p => (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        style={{
                            ...pageBtnStyle,
                            border: p === page ? "none" : pageBtnStyle.border,
                            background: p === page ? C.blue : pageBtnStyle.background,
                            color: p === page ? C.white : undefined
                        }}
                      >
                      {p}
                      </button>
                    ))}
                  {totalPages > 3 && page < totalPages && (
                    <button onClick={() => setPage(page + 1)} style={pageBtnStyle}>→</button>
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
                width: 120,
                height: 120,
                borderRadius: '50%',
                background: C.grayBg,
                margin: '0 auto 24px',
                ...flex('center'),
                justifyContent: 'center'
              }}>
                <Briefcase size={56} color={C.grayLight} />
              </div>
              <h3 style={{ ...txt(20, 600), marginBottom: 8 }}>
                Chưa có tin tuyển dụng nào
              </h3>
              <p style={{ ...txt(15, 400, C.gray), marginBottom: 24, maxWidth: 420, margin: '0 auto 24px' }}>
                Bắt đầu đăng tin tuyển dụng đầu tiên của bạn để tìm kiếm ứng viên tiềm năng cho công ty.
              </p>
            </div>
          )}
        </div>
      </main>

      <ViewJobModal
        open={viewModalOpen}
        onClose={() => {
          setViewModalOpen(false);
          setSelectedJob(null);
        }}
        job={selectedJob}
      />

      <JobFormModal
        open={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedJob(null);
        }}
        job={selectedJob}
        isEdit={true}
        onSuccess={reloadJobs}
      />

      <JobFormModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        isEdit={false}
        onSuccess={reloadJobs}
      />

      <DeleteConfirmModal
        open={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedJob(null);
        }}
        onConfirm={async () => {
          await handleDeleteJob(selectedJob.job_id);
          setDeleteModalOpen(false);
          setSelectedJob(null);
        }}
        jobTitle={selectedJob?.title}
      />

      <RenewJobModal
        open={renewModalOpen}
        onClose={() => {
          setRenewModalOpen(false);
          setSelectedJob(null);
        }}
        job={selectedJob}
      />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}