import { useState } from 'react';
import { Award, Upload, X, CheckCircle, AlertCircle, Info, Heart, TrendingUp, ShieldCheck } from 'lucide-react';
import { COLORS } from '../constants/colors';   
import { flex, txt } from '../utils/styles';
const C = COLORS;

const FileUploadBox = ({ file, onRemove, disabled }) => (
  <div style={{
    background: C.greenBg,
    border: `1px solid ${C.green}`,
    borderRadius: 12,
    padding: '14px 16px',
    ...flex('center'),
    justifyContent: 'space-between',
    marginBottom: file ? 0 : 12
  }}>
    <div style={{ ...flex('center'), gap: 12 }}>
      <div style={{
        width: 40, height: 40, borderRadius: 8,
        background: C.green,
        ...flex('center'), justifyContent: 'center'
      }}>
        <CheckCircle size={20} color={C.white} />
      </div>
      <div>
        <p style={{ ...txt(14, 600) }}>{file}</p>
        <p style={{ ...txt(12, 400, C.gray) }}>File PDF, JPG hoặc PNG. Tối đa 5MB</p>
      </div>
    </div>
    {!disabled && onRemove && (
      <button onClick={onRemove} style={{
        background: 'none', border: 'none', cursor: 'pointer', padding: 4
      }}>
        <X size={18} color={C.gray} />
      </button>
    )}
  </div>
);

const FileUploadPlaceholder = ({ disabled }) => (
  <div style={{
    border: `2px dashed ${C.border}`,
    borderRadius: 12,
    padding: '32px',
    textAlign: 'center',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1
  }}>
    <Upload size={40} color={C.grayLight} style={{ margin: '0 auto 12px' }} />
    <p style={{ ...txt(14, 600), marginBottom: 4 }}>Click để tải file lên</p>
    <p style={{ ...txt(12, 400, C.gray) }}>File PDF, JPG hoặc PNG. Tối đa 5MB</p>
  </div>
);


export default function VerificationPage() {
  const [status, setStatus] = useState('not_verified');
  const [taxId, setTaxId] = useState('VD: 0123456789');
  const [businessFile, setBusinessFile] = useState('Giay_phep_kinh_doanh.pdf');
  const [taxFile, setTaxFile] = useState(null);

  const statusConfig = {
    not_verified: {
      bg: C.yellowBg,
      border: '#fcd34d',
      icon: AlertCircle,
      color: '#92400e',
      title: 'Chưa xác thực',
      message: 'Vui lòng hoàn tất form bên dưới để gửi yêu cầu xác thực.',
      showButton: true,
      canEditTaxId: true
    },
    under_review: {
      bg: C.blueLight,
      border: C.blue,
      icon: Info,
      color: C.blue,
      title: 'Đang xem xét',
      message: 'Yêu cầu của bạn đang được xem xét. Chúng tôi sẽ phản hồi trong vòng 24-48 giờ.',
      showButton: false,
      canEditTaxId: false
    },
    verified: {
      bg: C.greenBg,
      border: C.green,
      icon: CheckCircle,
      color: C.green,
      title: 'Xác thực thành công',
      message: 'Doanh nghiệp của bạn đã được xác thực thành công!',
      showButton: false,
      canEditTaxId: false
    },
    rejected: {
      bg: C.redBg,
      border: '#fca5a5',
      icon: X,
      color: C.red,
      title: 'Bị từ chối',
      message: 'Lí do: Vui lòng cập nhật các tài liệu bị từ chối và gửi lại yêu cầu xác thực. Nếu có thắc mắc, vui lòng liên hệ support@unijob.vn',
      showButton: true,
      canEditTaxId: true
    }
  };

  const config = statusConfig[status];
  const StatusIcon = config.icon;

  return (
    <div style={{
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      background: C.grayBg, minHeight: '100vh'
    }}>
      <main style={{ padding: '40px 48px' }}>
        <div style={{ 
          ...flex('center'), 
          justifyContent: 'space-between', 
          marginBottom: 32 
        }}>
          <h1 style={{ ...txt(32, 700) }}>Xác thực</h1>
          {config.showButton && (
            <button style={{
              padding: '10px 24px', borderRadius: 10,
              border: 'none', background: C.blue,
              color: C.white, fontSize: 14, fontWeight: 600,
              cursor: 'pointer'
            }}>
              Gửi yêu cầu xác thực
            </button>
          )}
        </div>

        <div style={{
          background: config.bg,
          border: `1px solid ${config.border}`,
          borderRadius: 16,
          padding: '20px 24px',
          marginBottom: 32,
          ...flex('center'),
          gap: 12
        }}>
          <StatusIcon size={24} color={config.color} />
          <div>
            <h3 style={{ ...txt(16, 700, config.color), marginBottom: 4 }}>
              {config.title}
            </h3>
            <p style={{ ...txt(14, 400, config.color) }}>
              {config.message}
            </p>
          </div>
        </div>

        <div style={{
          background: C.white,
          borderRadius: 16,
          border: `1px solid ${C.border}`,
          padding: '24px',
          marginBottom: 24
        }}>
          <h2 style={{ ...txt(20, 700), marginBottom: 20, ...flex('center'), gap: 8 }}>
            <ShieldCheck size={24} /> Tại sao nên xác thực?
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 20
          }}>
            {[
              {
                icon: Heart,
                color: C.green,
                title: 'Tăng độ tin cậy',
                description: 'Xây dựng niềm tin với ứng viên tiềm năng'
              },
              {
                icon: TrendingUp,
                color: C.blue,
                title: 'Tăng lượt ứng tuyển',
                description: 'Tin tuyển dụng được ưu tiên hiển thị hơn'
              },
              {
                icon: Award,
                color: C.orange,
                title: 'Badge xác thực',
                description: 'Nhận badge đã xác thực trên hồ sơ'
              }
            ].map(({ icon: Icon, color, title, description }, i) => (
              <div key={i} style={{
                background: C.grayBg,
                borderRadius: 12,
                padding: '20px',
                textAlign: 'center'
              }}>
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: `${color}20`,
                  ...flex('center'),
                  justifyContent: 'center',
                  margin: '0 auto 12px'
                }}>
                  <Icon size={24} color={color} />
                </div>
                <h3 style={{ ...txt(16, 600), marginBottom: 6 }}>{title}</h3>
                <p style={{ ...txt(13, 400, C.gray) }}>{description}</p>
              </div>
            ))}
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 24
        }}>
          <div style={{
            background: C.white,
            borderRadius: 16,
            border: `1px solid ${C.border}`,
            padding: '24px'
          }}>
            <h2 style={{ ...txt(20, 700), marginBottom: 20 }}>
              Thông tin doanh nghiệp
            </h2>

            <div style={{ marginBottom: 16 }}>
              <label style={{ ...txt(14, 600), display: 'block', marginBottom: 8 }}>
                Tên công ty
              </label>
              <input
                value="The Coffee House"
                disabled
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 8,
                  border: `1px solid ${C.border}`,
                  fontSize: 14,
                  background: C.grayBg,
                  color: C.gray
                }}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ ...txt(14, 600), display: 'block', marginBottom: 8 }}>
                Mã số thuế <span style={{ color: C.red }}>*</span>
              </label>
              <input
                value={taxId}
                onChange={e => setTaxId(e.target.value)}
                disabled={!config.canEditTaxId}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 8,
                  border: `1px solid ${C.border}`,
                  fontSize: 14,
                  background: config.canEditTaxId ? C.white : C.grayBg,
                  color: config.canEditTaxId ? C.navy : C.gray
                }}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ ...txt(14, 600), display: 'block', marginBottom: 8 }}>
                Ngành nghề
              </label>
              <input
                value="F&B"
                disabled
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 8,
                  border: `1px solid ${C.border}`,
                  fontSize: 14,
                  background: C.grayBg,
                  color: C.gray
                }}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ ...txt(14, 600), display: 'block', marginBottom: 8 }}>
                Quy mô
              </label>
              <input
                value="1000 - 5000 nhân viên"
                disabled
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 8,
                  border: `1px solid ${C.border}`,
                  fontSize: 14,
                  background: C.grayBg,
                  color: C.gray
                }}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ ...txt(14, 600), display: 'block', marginBottom: 8 }}>
                Website
              </label>
              <input
                value="https://thecoffeehouse.com"
                disabled
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 8,
                  border: `1px solid ${C.border}`,
                  fontSize: 14,
                  background: C.grayBg,
                  color: C.gray
                }}
              />
            </div>

            <div>
              <label style={{ ...txt(14, 600), display: 'block', marginBottom: 8 }}>
                Địa chỉ {status === 'under_review' && <span style={{ color: C.red }}>*</span>}
              </label>
              <input
                value="Tầng 3, Tòa nhà VTC Online 18 Tam Trinh, Hai Bà Trưng, Hà Nội"
                disabled
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 8,
                  border: `1px solid ${C.border}`,
                  fontSize: 14,
                  background: C.grayBg,
                  color: C.gray
                }}
              />
            </div>
          </div>

          <div style={{
            background: C.white,
            borderRadius: 16,
            border: `1px solid ${C.border}`,
            padding: '24px'
          }}>
            <h2 style={{ ...txt(20, 700), marginBottom: 20 }}>
              Tài liệu xác thực
            </h2>

            <div style={{ marginBottom: 24 }}>
              <label style={{ ...txt(14, 600), display: 'block', marginBottom: 8 }}>
                Giấy phép kinh doanh <span style={{ color: C.red }}>*</span>
              </label>
              {businessFile ? (
                <FileUploadBox 
                  file={businessFile} 
                  onRemove={status === 'not_verified' || status === 'rejected' ? () => setBusinessFile(null) : null}
                  disabled={status === 'under_review' || status === 'verified'}
                />
              ) : (
                <FileUploadPlaceholder disabled={status === 'under_review' || status === 'verified'} />
              )}
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ ...txt(14, 600), display: 'block', marginBottom: 8 }}>
                Mã số thuế <span style={{ color: C.red }}>*</span>
              </label>
              {taxFile || status === 'under_review' || status === 'verified' ? (
                <FileUploadBox 
                  file={taxFile || 'Giay_phep_kinh_doanh.pdf'}
                  onRemove={status === 'not_verified' || status === 'rejected' ? () => setTaxFile(null) : null}
                  disabled={status === 'under_review' || status === 'verified'}
                />
              ) : (
                <FileUploadPlaceholder disabled={status === 'under_review' || status === 'verified'} />
              )}
            </div>

            <div style={{
              background: C.blueLight,
              borderRadius: 12,
              padding: '14px',
              ...flex('flex-start'),
              gap: 10
            }}>
              <Info size={18} color={C.blue} style={{ flexShrink: 0, marginTop: 2 }} />
              <p style={{ ...txt(13, 400, C.blue) }}>
                Lưu ý: Tất cả thông tin và tài liệu đã được bảo mật tuyệt đối, chỉ được sử dụng để xác thực và không được chia sẻ với bên thứ ba.
              </p>
            </div>
          </div>
        </div>
      </main>

      <style>{`
        input:focus {
          outline: none;
          border-color: ${C.blue} !important;
        }
        input:disabled {
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}