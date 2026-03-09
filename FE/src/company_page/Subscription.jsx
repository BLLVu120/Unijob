import { useState } from 'react';
import { CreditCard, History, Award, Calendar, Clock, Briefcase, CheckCircle, X, Building, Wallet } from 'lucide-react';
import { COLORS } from '../constants/colors';
import { flex, txt } from '../utils/styles';

const C = COLORS;
const PaymentModal = ({ open, onClose, type, packageData }) => {
  const [paymentMethod, setPaymentMethod] = useState('bank');
  if (!open) return null;
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

            <div style={{ marginBottom: 28 }}>
              <h4 style={{ ...txt(16, 600), marginBottom: 16 }}>Phương thức thanh toán</h4>
              
              {[
                { id: 'bank', icon: Building, label: 'Chuyển khoản ngân hàng' },
                { id: 'wallet', icon: Wallet, label: 'Ví điện tử (Momo, ZaloPay)' },
                { id: 'card', icon: CreditCard, label: 'Thẻ tín dụng/Ghi nợ' }
              ].map(({ id, icon: Icon, label }) => (
                <div
                  key={id}
                  onClick={() => setPaymentMethod(id)}
                  style={{
                    ...flex('center'), gap: 12,
                    padding: '14px 16px', borderRadius: 8,
                    border: `2px solid ${paymentMethod === id ? C.blue : C.border}`,
                    background: paymentMethod === id ? C.blueLight : C.white,
                    marginBottom: 12, cursor: 'pointer', transition: 'all 0.2s'
                  }}
                >
                  <input
                    type="radio"
                    checked={paymentMethod === id}
                    onChange={() => setPaymentMethod(id)}
                    style={{ width: 18, height: 18, cursor: 'pointer', accentColor: C.blue }}
                  />
                  <Icon size={20} color={paymentMethod === id ? C.blue : C.gray} />
                  <span style={{ ...txt(14, 500, paymentMethod === id ? C.blue : C.navy) }}>
                    {label}
                  </span>
                </div>
              ))}
            </div>

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
                style={{
                  flex: 1, padding: '12px', borderRadius: 10, border: 'none',
                  background: C.blue, color: C.white, fontSize: 15, fontWeight: 600,
                  cursor: 'pointer', boxShadow: '0 2px 8px rgba(99, 102, 241, 0.3)'
                }}
              >
                Xác nhận thanh toán
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};


const PackageCard = ({ pkg, isCurrent, onSelect, onRenew }) => {
  // Extract the base name without "Gói " prefix
  const baseName = pkg.name.replace('Gói ', '');
  
  const iconColors = {
    'Basic': C.gray,
    'Professional': C.blue,
    'Enterprise': C.orange
  };

  const buttonColors = {
    'Basic': { bg: C.gray, hover: '#475569' },
    'Professional': { bg: C.blue, hover: C.blueDark },
    'Enterprise': { bg: C.orange, hover: C.orangeDark }
  };

  const IconComp = pkg.icon;
  const btnColor = buttonColors[baseName];

  return (
    <div style={{
      background: C.white, borderRadius: 16, padding: 32,
      boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
      border: isCurrent ? `2px solid ${C.blue}` : `1px solid ${C.border}`,
      position: 'relative'
    }}>
      <div style={{
        width: 56, height: 56, borderRadius: 12,
        background: `${iconColors[baseName]}15`,
        ...flex('center'), justifyContent: 'center', marginBottom: 20
      }}>
        <IconComp size={28} color={iconColors[baseName]} />
      </div>

      <h3 style={{ ...txt(24, 700), marginBottom: 8 }}>{pkg.name}</h3>
      <p style={{ ...txt(14, 400, C.gray), marginBottom: 16 }}>
        {pkg.posts} • {pkg.visibility}
      </p>

      <div style={{ marginBottom: 24 }}>
        <span style={{ ...txt(32, 700, iconColors[baseName]) }}>
          {pkg.price.split('/')[0]}
        </span>
        <span style={{ ...txt(15, 400, C.gray) }}> / {pkg.duration}</span>
      </div>

      <div style={{ marginBottom: 28 }}>
        {pkg.features.map((feature, i) => (
          <div key={i} style={{ ...flex('center'), gap: 10, marginBottom: 10 }}>
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
            border: `1px solid ${C.border}`, background: C.grayBg,
            color: C.gray, fontSize: 15, fontWeight: 600, 
            cursor: 'not-allowed', opacity: 0.6
          }}
        >
          Gói hiện tại
        </button>
      ) : (
        <button
          onClick={onSelect}
          style={{
            width: '100%', padding: '12px', borderRadius: 10, border: 'none',
            background: btnColor.bg, color: C.white, fontSize: 15, fontWeight: 600,
            cursor: 'pointer', transition: 'all 0.2s'
          }}
          onMouseEnter={e => e.currentTarget.style.background = btnColor.hover}
          onMouseLeave={e => e.currentTarget.style.background = btnColor.bg}
        >
          Chọn gói này
        </button>
      )}
    </div>
  );
};

export default function PackagesPage() {
  const [modalType, setModalType] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);

  const currentPlan = {
    name: 'Gói Professional',
    subtitle: 'Gói dịch vụ hiện tại của bạn',
    startDate: '01/01/2025',
    endDate: '31/03/2025',
    daysLeft: 70,
    postsUsed: 8,
    postsTotal: 20
  };

  const packages = [
    {
      id: 'basic',
      name: 'Gói Basic',
      icon: Briefcase,
      posts: '5 tin',
      visibility: '15 ngày/tin',
      price: '500.000đ',
      duration: '1 tháng',
      features: [
        'Đăng 5 tin tuyển dụng',
        'Hiển thị 15 ngày/tin',
        'Hỗ trợ qua email',
        'Thống kê cơ bản'
      ],
      paymentData: {
        name: 'Gói Professional',
        duration: '3 tháng',
        posts: '20 tin',
        visibility: '30 ngày/tin',
        expiry: '20/4/2026',
        price: '2.000.000đ'
      }
    },
    {
      id: 'professional',
      name: 'Gói Professional',
      icon: CheckCircle,
      posts: '20 tin',
      visibility: '30 ngày/tin',
      price: '2.000.000đ',
      duration: '3 tháng',
      features: [
        'Đăng 20 tin tuyển dụng',
        'Hiển thị 30 ngày/tin',
        'Hỗ trợ qua email',
        'Thống kê cơ bản'
      ],
      paymentData: {
        name: 'Gói Professional',
        duration: '3 tháng',
        posts: '20 tin',
        visibility: '30 ngày/tin',
        expiry: '20/4/2026',
        price: '2.000.000đ'
      },
      isCurrent: true
    },
    {
      id: 'enterprise',
      name: 'Gói Enterprise',
      icon: Award,
      posts: '50 tin',
      visibility: '45 ngày/tin',
      price: '5.000.000đ',
      duration: '1 tháng',
      features: [
        'Đăng 50 tin tuyển dụng',
        'Hiển thị 45 ngày/tin',
        'Hỗ trợ qua email',
        'Thống kê cơ bản'
      ],
      paymentData: {
        name: 'Gói Professional',
        duration: '3 tháng',
        posts: '20 tin',
        visibility: '30 ngày/tin',
        expiry: '20/4/2026',
        price: '2.000.000đ'
      }
    }
  ];

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
        <h1 style={{ ...txt(32, 700), marginBottom: 32 }}>Đăng kí gói</h1>

        <div style={{
          background: `linear-gradient(135deg, ${C.blue}, ${C.purple})`,
          borderRadius: 16, padding: '32px 40px', marginBottom: 32,
          position: 'relative', overflow: 'hidden'
        }}>
          <div style={{ ...flex('center'), justifyContent: 'space-between' }}>
            <div>
              <div style={{ ...flex('center'), gap: 10, marginBottom: 6 }}>
                <CheckCircle size={24} color={C.white} />
                <h2 style={{ ...txt(28, 700, C.white) }}>{currentPlan.name}</h2>
              </div>
              <p style={{ ...txt(15, 400, 'rgba(255,255,255,0.9)') }}>
                {currentPlan.subtitle}
              </p>
            </div>

            <button
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
            </button>
          </div>

          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginTop: 28
          }}>
            {[
              { icon: Calendar, label: 'Ngày bắt đầu', value: currentPlan.startDate },
              { icon: Calendar, label: 'Ngày hết hạn', value: currentPlan.endDate },
              { icon: Clock, label: 'Số ngày còn lại', value: `${currentPlan.daysLeft} ngày` },
              { icon: Briefcase, label: 'Tin còn lại có thể đăng', value: `${currentPlan.postsUsed}/${currentPlan.postsTotal}` }
            ].map(({ icon: Icon, label, value }, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.15)', borderRadius: 12,
                padding: '16px 20px', backdropFilter: 'blur(10px)'
              }}>
                <div style={{ ...flex('center'), gap: 10, marginBottom: 8 }}>
                  <Icon size={20} color={C.white} />
                  <span style={{ ...txt(13, 500, 'rgba(255,255,255,0.9)') }}>{label}</span>
                </div>
                <p style={{ ...txt(20, 700, C.white) }}>{value}</p>
              </div>
            ))}
          </div>
        </div>

        <h2 style={{ ...txt(24, 700), marginBottom: 24 }}>Các gói dịch vụ</h2>
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