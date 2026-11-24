import { useState, useEffect } from 'react';
import { History, Award, Calendar, Clock, Briefcase, CheckCircle, X, QrCode, AlertCircle, Check } from 'lucide-react';
import { COLORS, GRADIENT } from '../../constants/colors';
import { flex, txt } from '../../utils/styles';
import { getCurrentUser } from '../../services/authService';
import { jobService } from '../../services/jobService';
import { PLANS, getActivePlan, startPayment } from '../../services/paymentService';
import PageHeader from '../../components/PageHeader';
import { InfoTile } from '../../components/ProfileKit';
import { formatDate, formatNumber } from '../../utils/textUtils';

const C = COLORS;

// Nền khung "gói hiện tại" theo màu của gói đang dùng
// Ô thông tin trong suốt (kính mờ) đặt trên banner màu
const GLASS_TILE = {
  background: 'rgba(255,255,255,0.12)',
  border: '1px solid rgba(255,255,255,0.24)',
  boxShadow: 'none',
  backdropFilter: 'blur(6px)'
};

const PLAN_BANNER = {
  basic: 'linear-gradient(135deg, #164e63 0%, #0e7490 50%, #0891b2 100%)',
  professional: 'linear-gradient(135deg, #2e1f8f 0%, #4334c9 50%, #6d5dfc 100%)',
  enterprise: 'linear-gradient(135deg, #7c2d12 0%, #c2410c 50%, #ea580c 100%)',
  none: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)'
};

const PACKAGE_ICONS = { basic: Briefcase, professional: CheckCircle, enterprise: Award };

// Gói trong PLANS → dữ liệu hiển thị của thẻ gói
const toPackage = (key, activePlan) => {
  const plan = PLANS[key];
  // Gia hạn khi còn hạn thì cộng nối tiếp từ ngày hết hạn hiện tại
  const from = activePlan?.key === key ? activePlan.expiresAt : new Date();
  const expiry = new Date(new Date(from).getTime() + plan.days * 86400000);
  return {
    id: key,
    name: plan.name,
    icon: PACKAGE_ICONS[key],
    posts: `${plan.posts} tin`,
    visibility: `${plan.visibilityDays} ngày/tin`,
    price: `${formatNumber(plan.price)}đ`,
    duration: plan.durationLabel,
    features: [
      `Đăng ${plan.posts} tin tuyển dụng`,
      `Hiển thị ${plan.visibilityDays} ngày/tin`,
      'Hỗ trợ qua email',
      'Thống kê cơ bản'
    ],
    paymentData: {
      key,
      name: plan.name,
      duration: plan.durationLabel,
      posts: `${plan.posts} tin`,
      visibility: `${plan.visibilityDays} ngày/tin`,
      expiry: formatDate(expiry, '—'),
      price: `${formatNumber(plan.price)}đ`,
      amount: plan.price
    },
    isCurrent: activePlan?.key === key
  };
};

const PaymentModal = ({ open, onClose, type, packageData }) => {
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState('');
  if (!open) return null;

  const handlePay = async () => {
    setPaying(true);
    setError('');
    try {
      await startPayment({
        amount: packageData.amount,
        description: `Unijob ${packageData.key}`,
        kind: 'plan',
        ref: packageData.key,
        returnTo: '/employer/subscription'
      });
    } catch (err) {
      setError(err.message);
      setPaying(false);
    }
  };
  const isRenewal = type === 'renewal';
  const title = isRenewal ? 'Gia hạn gói dịch vụ' : 'Mua gói dịch vụ';
  return (
    <>
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 998
      }} />
      <div style={{
        position: 'fixed', inset: 0, zIndex: 999,
        ...flex('center', 'column'), justifyContent: 'center', padding: 24
      }}>
        <div style={{
          background: C.white, borderRadius: 16, width: '100%', maxWidth: 520,
          maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
        }}>
          <div style={{
            ...flex('center'), justifyContent: 'space-between',
            padding: '24px 28px', borderBottom: `1px solid ${C.border}`
          }}>
            <div>
              <h3 style={{ ...txt(20, 700), marginBottom: 4 }}>{title}</h3>
              <p style={{ ...txt(13, 400, C.gray) }}>Xác nhận thông tin thanh toán</p>
            </div>
            <button onClick={onClose} style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: 4
            }}>
              <X size={22} color={C.gray} />
            </button>
          </div>

          <div style={{ padding: '28px' }}>
            <div style={{
              background: C.grayCard, borderRadius: 12, padding: '20px', marginBottom: 24
            }}>
              <h4 style={{ ...txt(18, 700), marginBottom: 16 }}>{packageData.name}</h4>
              {[
                { label: 'Thời hạn', value: packageData.duration },
                { label: 'Số tin đăng', value: packageData.posts },
                { label: 'Thời gian hiển thị tin', value: packageData.visibility },
                {
                  label: isRenewal ? 'Ngày hết hạn mới' : 'Ngày hết hạn',
                  value: packageData.expiry
                }
              ].map(({ label, value }, i) => (
                <div key={i} style={{
                  ...flex('center'), justifyContent: 'space-between',
                  paddingBottom: i < 3 ? 12 : 0, marginBottom: i < 3 ? 12 : 0,
                  borderBottom: i < 3 ? `1px solid ${C.border}` : 'none'
                }}>
                  <span style={{ ...txt(14, 400, C.gray) }}>{label}</span>
                  <span style={{ ...txt(14, 600) }}>{value}</span>
                </div>
              ))}
            </div>

            <div style={{
              background: `linear-gradient(135deg, ${C.blue}, ${C.purple})`,
              borderRadius: 12, padding: '16px 20px', marginBottom: 24,
              ...flex('center'), justifyContent: 'space-between'
            }}>
              <span style={{ ...txt(16, 600, C.white) }}>Tổng thanh toán</span>
              <span style={{ ...txt(24, 700, C.white) }}>{packageData.price}</span>
            </div>

            {/* Thẻ phương thức thanh toán — cùng kiểu với thẻ thông tin gói */}
            <div style={{ background: C.grayCard, borderRadius: 12, padding: '20px', marginBottom: error ? 12 : 28 }}>
              <h4 style={{ ...txt(18, 700), marginBottom: 16 }}>Phương thức thanh toán</h4>
              <div style={{
                ...flex('center'), gap: 12,
                padding: '14px 16px', borderRadius: 10,
                border: `2px solid ${C.purple}`, background: C.white
              }}>
                <span style={{
                  width: 36, height: 36, borderRadius: 10, background: C.blueLight, flexShrink: 0,
                  ...flex('center'), justifyContent: 'center'
                }}>
                  <QrCode size={18} color={C.purple} />
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ ...txt(14, 600) }}>VNPay</p>
                  <p style={{ ...txt(12, 400, C.gray) }}>Thẻ ATM / QR / ví điện tử · Môi trường thử nghiệm (Sandbox)</p>
                </div>
                {/* Đã chọn: hình tròn xanh dương + dấu check trắng */}
                <span style={{
                  width: 20, height: 20, borderRadius: '50%', background: C.info, flexShrink: 0,
                  ...flex('center'), justifyContent: 'center', boxShadow: '0 0 0 3px #dbeafe'
                }}>
                  <Check size={12} color={C.white} strokeWidth={3} />
                </span>
              </div>
            </div>
            {error && (
              <div role="alert" style={{
                ...flex('flex-start'), gap: 10, padding: '12px 14px', borderRadius: 12, marginBottom: 24,
                background: C.redBg, border: '1px solid #fbcaca', animation: 'slideDown .2s ease'
              }}>
                <AlertCircle size={18} color={C.red} style={{ flexShrink: 0, marginTop: 1 }} />
                <span style={{ ...txt(14, 500, C.red), lineHeight: 1.5 }}>{error}</span>
              </div>
            )}

            <div style={{ ...flex('center'), gap: 12 }}>
              <button
                onClick={onClose}
                style={{
                  flex: 1, padding: '12px', borderRadius: 10,
                  border: `1px solid ${C.border}`, background: C.white,
                  color: C.navy, fontSize: 15, fontWeight: 600, cursor: 'pointer'
                }}
              >
                Hủy
              </button>
              <button
                onClick={handlePay}
                disabled={paying}
                style={{
                  flex: 1, padding: '12px', borderRadius: 10, border: 'none',
                  background: C.blue, color: C.white, fontSize: 15, fontWeight: 600,
                  cursor: paying ? 'wait' : 'pointer', opacity: paying ? 0.7 : 1,
                  boxShadow: '0 2px 8px rgba(109, 93, 252, 0.3)'
                }}
              >
                {paying ? 'Đang chuyển đến VNPay...' : 'Xác nhận thanh toán'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};


const PackageCard = ({ pkg, isCurrent, onSelect }) => {
  const baseName = pkg.name.replace('Gói ', '');

  const iconColors = {
    'Basic': C.cyan,
    'Professional': C.blue,
    'Enterprise': C.orange
  };

  // Mỗi gói một tông màu: nền thẻ, viền và nút theo màu gói
  const THEMES = {
    'Basic': { tint: 'linear-gradient(165deg, #e0f7fd 0%, #ffffff 60%)', border: COLORS.cyanBorder, btn: GRADIENT.cyan },
    'Professional': { tint: 'linear-gradient(165deg, #ebe7ff 0%, #ffffff 60%)', border: COLORS.violetBorder, btn: GRADIENT.purple },
    'Enterprise': { tint: 'linear-gradient(165deg, #ffedd5 0%, #ffffff 60%)', border: COLORS.orangeBorder, btn: GRADIENT.warning }
  };

  const IconComp = pkg.icon;
  const theme = THEMES[baseName] || THEMES.Professional;

  return (
    <div style={{
      background: theme.tint, borderRadius: 16, padding: 28,
      boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
      border: isCurrent ? `2px solid ${iconColors[baseName]}` : `1px solid ${theme.border}`,
      position: 'relative'
    }}>
      <div style={{
        width: 56, height: 56, borderRadius: 12,
        background: theme.btn, boxShadow: '0 6px 16px rgba(15, 23, 42, 0.12)',
        ...flex('center'), justifyContent: 'center', marginBottom: 14
      }}>
        <IconComp size={28} color={C.white} />
      </div>

      {/* Nhãn số tin / thời gian hiển thị ở góc phải trên của thẻ (màu theo gói) */}
      <span style={{
        position: 'absolute', top: 24, right: 24,
        padding: '5px 12px', borderRadius: 999, fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap',
        color: iconColors[baseName], background: C.white,
        border: `1px solid ${theme.border}`
      }}>
        {pkg.posts} • {pkg.visibility}
      </span>

      <h3 style={{ ...txt(24, 700), marginBottom: 8 }}>{pkg.name}</h3>

      <div style={{ marginBottom: 16 }}>
        <span style={{ ...txt(32, 700, iconColors[baseName]) }}>
          {pkg.price.split('/')[0]}
        </span>
        <span style={{ ...txt(15, 400, C.gray) }}> / {pkg.duration}</span>
      </div>

      <div style={{ marginBottom: 20 }}>
        {pkg.features.map((feature, i) => (
          <div key={i} style={{ ...flex('center'), gap: 10, marginBottom: 6 }}>
            <CheckCircle size={18} color={C.green} />
            <span style={{ ...txt(14, 400, C.gray) }}>{feature}</span>
          </div>
        ))}
      </div>

      {isCurrent ? (
        <button
          disabled
          style={{
            width: '100%', padding: '12px', borderRadius: 10,
            border: `1px solid ${theme.border}`, background: C.white,
            color: iconColors[baseName], fontSize: 15, fontWeight: 600,
            cursor: 'not-allowed'
          }}
        >
          Gói hiện tại
        </button>
      ) : (
        <button
          onClick={onSelect}
          style={{
            width: '100%', padding: '12px', borderRadius: 10, border: 'none',
            background: theme.btn, color: C.white, fontSize: 15, fontWeight: 600,
            cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 6px 16px rgba(15, 23, 42, 0.12)'
          }}
        >
          Chọn gói này
        </button>
      )}
    </div>
  );
};

export default function Subscription() {
  const [modalType, setModalType] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);

  const [activePlan, setActivePlan] = useState(null);
  const [jobsInPlan, setJobsInPlan] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const user = getCurrentUser();
    Promise.all([getActivePlan(user.emp_id), jobService.getJobsByEmployer(user.emp_id)])
      .then(([plan, jobs]) => {
        setActivePlan(plan);
        if (plan) {
          setJobsInPlan(jobs.filter(j => new Date(j.created_at) >= plan.startedAt).length);
        }
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const daysLeft = activePlan
    ? Math.max(0, Math.ceil((activePlan.expiresAt - new Date()) / 86400000))
    : 0;

  const currentPlan = activePlan
    ? {
        name: activePlan.name,
        subtitle: 'Gói dịch vụ hiện tại của bạn',
        startDate: formatDate(activePlan.startedAt, '—'),
        endDate: formatDate(activePlan.expiresAt, '—'),
        daysLeft,
        postsUsed: Math.max(0, activePlan.posts - jobsInPlan),
        postsTotal: activePlan.posts
      }
    : {
        name: loading ? 'Đang tải...' : 'Chưa đăng ký gói',
        subtitle: error ? `Không tải được thông tin gói: ${error}` : 'Chọn một gói bên dưới để bắt đầu đăng tin',
        startDate: '—',
        endDate: '—',
        daysLeft: 0,
        postsUsed: 0,
        postsTotal: 0
      };

  const packages = Object.keys(PLANS).map(key => toPackage(key, activePlan));

  const openModal = (type, pkg) => {
    setModalType(type);
    setSelectedPackage(pkg);
  };

  const closeModal = () => {
    setModalType(null);
    setSelectedPackage(null);
  };

  return (
    <div style={{
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      background: C.grayBg, minHeight: '100vh'
    }}>

      <main style={{ padding: '40px 48px' }}>
        <PageHeader title="Đăng kí gói" subtitle="Chọn gói dịch vụ phù hợp với nhu cầu tuyển dụng" />

        <div style={{
          background: PLAN_BANNER[activePlan?.key] || PLAN_BANNER.none, // màu theo gói đang dùng
          borderRadius: 16, padding: '32px 40px', marginBottom: 32,
          position: 'relative', overflow: 'hidden'
        }}>
          <div style={{ ...flex('center'), justifyContent: 'space-between' }}>
            <div>
              {/* Tên gói + nhãn mô tả ngay bên cạnh */}
              <div style={{ ...flex('center'), gap: 12, flexWrap: 'wrap' }}>
                <h2 style={{ ...txt(28, 700, C.white) }}>{currentPlan.name}</h2>
                <span style={{
                  padding: '5px 12px', borderRadius: 999, fontSize: 13, fontWeight: 600, color: C.white,
                  background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.3)'
                }}>
                  {currentPlan.subtitle}
                </span>
              </div>
            </div>

            {activePlan && <button
              onClick={() => openModal('renewal', packages.find(p => p.isCurrent))}
              style={{
                padding: '10px 28px', borderRadius: 10,
                border: 'none', background: C.white, color: C.blue,
                fontSize: 15, fontWeight: 600, cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                ...flex('center'), gap: 8
              }}
            >
              <History size={18} /> Gia hạn ngay
            </button>}
          </div>

          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 16, marginTop: 28
          }}>
            {[
              { icon: Calendar, label: 'Ngày bắt đầu', value: currentPlan.startDate },
              { icon: Calendar, label: 'Ngày hết hạn', value: currentPlan.endDate },
              { icon: Clock, label: 'Số ngày còn lại', value: `${currentPlan.daysLeft} ngày` },
              { icon: Briefcase, label: 'Tin còn lại có thể đăng', value: `${currentPlan.postsUsed}/${currentPlan.postsTotal}` }
            ].map(f => (
              // Ô kính mờ trong suốt trên nền banner của gói hiện tại
              <InfoTile key={f.label} {...f} gradient={GLASS_TILE.background} style={GLASS_TILE} />
            ))}
          </div>
        </div>

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24
        }}>
          {packages.map(pkg => (
            <PackageCard
              key={pkg.id}
              pkg={pkg}
              isCurrent={pkg.isCurrent}
              onSelect={() => openModal('purchase', pkg)}
              onRenew={() => openModal('renewal', pkg)}
            />
          ))}
        </div>
      </main>

      {selectedPackage && (
        <PaymentModal
          open={!!modalType}
          onClose={closeModal}
          type={modalType}
          packageData={selectedPackage.paymentData}
        />
      )}
    </div>
  );
}