import { useState, useRef, useEffect } from 'react';
import {
  Heart, Send, Briefcase, MapPin, Clock,
  Users, Gift, X, Upload, AlertTriangle,
  CheckCircle2, ExternalLink, Calendar
} from 'lucide-react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import { flex, txt } from '../utils/styles';
import { COLORS } from "../constants/colors";

const gap = (n) => ({ gap: `${n}px` });

const Card = ({ children, style = {} }) => (
  <div style={{
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

const BulletList = ({ items }) => (
  <ul style={{ margin: 0, paddingLeft: 22 }}>
    {items.map((it, i) => (
      <li key={i} style={{ ...txt(14, 400, COLORS.gray), marginBottom: 6 }}>{it}</li>
    ))}
  </ul>
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

const ApplyModal = ({ open, onClose, onSubmitted }) => {
  const [file, setFile] = useState(null);
  const [form, setForm] = useState({ name: '', phone: '', email: '', letter: '' });
  const fileRef = useRef();

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleDrop = (e) => {
    e.preventDefault();
    const f = e.dataTransfer?.files?.[0] || e.target.files?.[0];
    if (f) setFile(f);
  };

  const inputStyle = {
    width: '100%', padding: '11px 14px', borderRadius: 8,
    border: `1px solid ${COLORS.border}`, fontSize: 14, color: COLORS.navy,
    outline: 'none', boxSizing: 'border-box', background: COLORS.white
  };

  const labelStyle = { ...txt(14, 600), marginBottom: 6, display: 'block' };

  return (
    <ModalShell open={open} onClose={onClose}>
      <div style={{
        background: 'linear-gradient(135deg,#f97316,#fb923c)',
        borderRadius: '16px 16px 0 0', padding: '24px 28px 20px',
        ...flex('center'), justifyContent: 'space-between'
      }}>
        <span style={{ ...txt(22, 700, COLORS.white) }}>Nộp hồ sơ ứng tuyến</span>
        <button onClick={onClose} style={{
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
          <p style={{ ...txt(15, 600, COLORS.navy) }}>Nhân viên phục vụ part-time</p>
          <p style={{ ...txt(13, 400, COLORS.gray), marginTop: 2 }}>The Coffee House</p>
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
          <input ref={fileRef} type="file" accept=".pdf,.jpg,.png" onChange={handleDrop} style={{ display: 'none' }} />
          <Upload size={32} color={file ? COLORS.green : COLORS.grayMid} style={{ marginBottom: 8 }} />
          <p style={{ ...txt(15, 600, file ? COLORS.green : COLORS.navy) }}>
            {file ? file.name : 'Click để tải file lên'}
          </p>
          <p style={{ ...txt(12, 400, COLORS.grayMid), marginTop: 4 }}>File PDF, JPG hoặc PNG. Tối đa 5MB</p>
        </div>

        {[
          { key: 'name',   label: 'Họ và tên',        ph: 'Nhập họ và tên' },
          { key: 'phone',  label: 'Số điện thoại',     ph: 'Nhập số điện thoại' },
          { key: 'email',  label: 'Địa chỉ email',     ph: 'Nhập địa chỉ email' }
        ].map(({ key, label, ph }) => (
          <div key={key} style={{ marginBottom: 18 }}>
            <label style={labelStyle}>{label} <span style={{ color: COLORS.red }}>*</span></label>
            <input value={form[key]} onChange={set(key)} placeholder={ph} style={inputStyle} />
          </div>
        ))}

        <div style={{ marginBottom: 22 }}>
          <label style={labelStyle}>Thư giới thiệu <span style={{ color: COLORS.red }}>*</span></label>
          <textarea
            value={form.letter} onChange={set('letter')}
            placeholder="Nhập nội dung"
            rows={5}
            style={{ ...inputStyle, resize: 'vertical', minHeight: 100 }}
          />
        </div>

        <WarningBox>
          <strong>Lưu ý:</strong> Thông tin của bạn sẽ được gửi trực tiếp đến nhà tuyển dụng. Hãy đảm bảo thông tin chính xác và CV phù hợp với vị trí ứng tuyến.
        </WarningBox>

        <button
          onClick={() => { onClose(); onSubmitted(); }}
          style={{
            marginTop: 22, width: '100%', padding: '14px', borderRadius: 10, border: 'none',
            background: 'linear-gradient(135deg,#f97316,#fb923c)',
            color: COLORS.white, fontSize: 16, fontWeight: 600, cursor: 'pointer',
            ...flex('center'), justifyContent: 'center', ...gap(8)
          }}
        >
          <Send size={18} /> Gửi hồ sơ ứng tuyến
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

        {[
          { key: 'name',    label: 'Họ và tên',       ph: 'Nhập họ và tên' },
          { key: 'phone',   label: 'Số điện thoại',    ph: 'Nhập số điện thoại' },
          { key: 'address', label: 'Địa chỉ',          ph: 'Nhập địa chỉ' },
          { key: 'email',   label: 'Địa chỉ email',    ph: 'Nhập địa chỉ email' }
        ].map(({ key, label, ph }) => (
          <div key={key} style={{ ...flex('center'), ...gap(12), marginBottom: 16 }}>
            <label style={{ ...txt(14, 600), minWidth: 110 }}>{label} <span style={{ color: COLORS.red }}>*</span></label>
            <input value={form[key]} onChange={set(key)} placeholder={ph} style={{ ...inputStyle, flex: 1 }} />
          </div>
        ))}

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
  const [applyOpen, setApplyOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [appliedSuccess, setAppliedSuccess] = useState(false);
  const [saved, setSaved] = useState(false);

  const descBullets = [
    'Phục vụ khách hàng, nhận order và giao đồ uống',
    'Pha chế các loại đồ uống theo quy trình chuẩn',
    'Giữ gìn vệ sinh khu vực làm việc',
    'Hỗ trợ thu ngân khi cần thiết',
    'Tư vấn menu cho khách hàng'
  ];
  const requireBullets = [
    'Độ tuổi: 18–28 tuổi',
    'Ngoại hình ưa nhìn, giao tiếp tốt',
    'Nhiệt tình, trách nhiệm với công việc',
    'Chịu được áp lực cao trong giờ cao điểm',
    'Ưu tiên có kinh nghiệm làm F&B'
  ];
  const scheduleBullets = [
    'Ca sáng: 07:00 – 11:00',
    'Ca trưa: 11:00 – 15:00',
    'Ca chiều: 15:00 – 19:00',
    'Ca tối: 19:00 – 23:00'
  ];
  const benefitBullets = [
    'Lương trả theo tuần qua chuyển khoản',
    'Tăng lương sau 3 tháng làm việc',
    'Thưởng thêm 50.000đ/ca cho ngày lễ/Tết',
    'Hỗ trợ xe/xáng 15.000đ/ngày'
  ];

  return (
    <div style={{
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      background: '#f1f5f9', minHeight: '100vh', paddingBottom: 28
    }}>
      {appliedSuccess && (
        <div style={{
          position: 'fixed', top: 24, right: 24, zIndex: 1000,
          background: COLORS.greenBg, border: `1px solid ${COLORS.greenBorder}`,
          borderRadius: 12, padding: '16px 24px',
          ...flex('center'), ...gap(10),
          boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
          animation: 'slideIn 0.3s ease'
        }}>
          <CheckCircle2 size={22} color={COLORS.green} />
          <span style={{ ...txt(15, 600, '#166534') }}>Hồ sơ đã được gửi thành công!</span>
          <button onClick={() => setAppliedSuccess(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', marginRight: -8 }}>
            <X size={16} color={COLORS.gray} />
          </button>
        </div>
      )}

    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <div style={{ maxWidth: 1200, padding: '0 24px', display: 'flex', gap: 24, alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', marginTop: 28, flexDirection: 'column', gap: 20 }}>
          <Card>
            <div style={{ ...flex('center'), justifyContent: 'space-between', marginBottom: 10 }}>
              <div>
                <h1 style={{ ...txt(26, 700), marginBottom: 4 }}>Nhân viên phục vụ part-time</h1>
                <div style={{ ...flex('center'), ...gap(5) }}>
                  <span style={{ ...txt(14, 500, COLORS.gray) }}>The Coffee House</span>
                  <FontAwesomeIcon icon={faCheckCircle} size="sm" color={COLORS.blue} />
                </div>
              </div>
              <div style={{ ...flex('center'), ...gap(10), marginLeft: 29 }}>
                <button
                  onClick={() => setSaved(!saved)}
                  style={{
                    padding: '8px 18px', borderRadius: 20,
                    border: `1.5px solid ${saved ? COLORS.pink : COLORS.border}`,
                    background: saved ? '#fdf2f8' : COLORS.white,
                    color: saved ? COLORS.pink : COLORS.navy, fontSize: 14, fontWeight: 600,
                    cursor: 'pointer', ...flex('center'), ...gap(6)
                  }}
                >
                  <Heart size={16} fill={saved ? COLORS.pink : 'none'} color={saved ? COLORS.pink : COLORS.navy} /> Lưu tin
                </button>
                <button
                  onClick={() => setApplyOpen(true)}
                  style={{
                    padding: '8px 18px', borderRadius: 20, border: 'none',
                    background: COLORS.navy, color: COLORS.white, fontSize: 14, fontWeight: 600,
                    cursor: 'pointer', ...flex('center'), ...gap(6)
                  }}
                >
                  <Send size={16} /> Ứng tuyến
                </button>
              </div>
            </div>

            <div style={{ ...flex('center'), ...gap(40), marginTop: 18, paddingTop: 18, borderTop: `1px solid ${COLORS.border}` }}>
              {[
                { icon: Briefcase,  label: 'MỨC LƯƠNG',   value: '25.000 – 30.000 VNĐ/giờ', valueColor: COLORS.blueText },
                { icon: MapPin,     label: 'ĐỊA ĐIỂM',    value: 'Quận 1, TP.HCM' },
                { icon: Clock,      label: 'KINH NGHIỆM',  value: 'Không yêu cầu' }
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
              Chúng tôi đang tìm kiếm nhân viên phục vụ part-time năng động, nhiệt tình để gia nhập đội ngũ tại cửa hàng The Coffee House chi nhánh Quận 1.
            </p>
            <BulletList items={descBullets} />
          </Card>

          <Card>
            <SectionHead icon={Users} title="Yêu cầu ứng viên" />
            <BulletList items={requireBullets} />
          </Card>

          <Card>
            <SectionHead icon={Calendar} title="Thời gian làm việc" />
            <BulletList items={scheduleBullets} />
          </Card>

          <Card>
            <SectionHead icon={Gift} title="Quyền lợi" />
            <BulletList items={benefitBullets} />
          </Card>
        </div>

        <div style={{ ...flex('stretch', 'column'), ...gap(20), marginTop: 28 }}>
          <Card>
            <div style={{ ...flex('center'), ...gap(16), marginBottom: 20 }}>
              <div style={{
                width: 72, height: 72, borderRadius: 14,
                background: 'linear-gradient(135deg,#f97316,#fb923c)',
                ...flex('center'), justifyContent: 'center'
              }}>
                <span style={{ ...txt(13, 800, COLORS.white), textAlign: 'center', lineHeight: 1.2 }}>THE<br/>COFFEE<br/>HOUSE</span>
              </div>
              <span style={{ ...txt(18, 700) }}>THE COFFEE HOUSE</span>
            </div>

            {[
              { icon: Users,      label: 'Quy mô:',   value: '1000+ nhân viên' },
              { icon: Briefcase,  label: 'Lĩnh vực:', value: 'F&B' },
              { icon: MapPin,     label: 'Địa chỉ:',  value: '141 Nguyễn Thái Bình, Quận 1, TP. Hồ Chí Minh' }
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} style={{ ...flex('flex-start'), ...gap(10), marginBottom: 12 }}>
                <Icon size={17} color={COLORS.grayMid} style={{ marginTop: 2, flexShrink: 0 }} />
                <div>
                  <span style={{ ...txt(13, 600, COLORS.gray) }}>{label} </span>
                  <span style={{ ...txt(13, 500, COLORS.navy) }}>{value}</span>
                </div>
              </div>
            ))}

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 10 }}>
                <a href="#" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    ...txt(14, 600, COLORS.blueText),
                    textDecoration: 'none'
                }}>
                    Xem trang công ty <ExternalLink size={15} />
                </a>
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
            { label: 'SỐ LƯỢNG TUYỂN', value: '3 người', color: COLORS.green },
            { label: 'HẠN NỘP HỒ SƠ', value: '30/01/2025', color: COLORS.red },
            { label: 'CẤP BẬC',        value: 'Nhân viên' },
            { label: 'HỌC VẤN',        value: 'Cấp 3 trở lên' }
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

          <div style={{
            background: COLORS.yellow, border: `1px solid ${COLORS.yellowBorder}`,
            borderRadius: 12, padding: 22
          }}>
            <h4 style={{ ...txt(16, 700, '#92400e'), marginBottom: 12, ...flex('center'), ...gap(8) }}>
              <AlertTriangle size={18} color="#92400e" /> Lưu ý khi ứng tuyến
            </h4>
            <ul style={{ margin: 0, paddingLeft: 18, marginBottom: 16 }}>
              {[
                'Không chuyển tiền đặt cọc cho bất kỳ lý do gì',
                'Không cung cấp thông tin các nhân nhạy cảm qua email/điện thoại',
                'Xác minh thông tin công ty trước khi ứng tuyến'
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
        </div>
      </div>
    </div>

      {/* ════ MODALS ════ */}
      <ApplyModal
        open={applyOpen}
        onClose={() => setApplyOpen(false)}
        onSubmitted={() => setAppliedSuccess(true)}
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