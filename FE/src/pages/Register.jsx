import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { User, Users, Building2, Mail, Lock, Eye, EyeOff, Phone, MapPin, Calendar, Briefcase, IdCard, ChevronDown } from 'lucide-react';
import { COLORS } from '../constants/colors';
import { registerCandidate, registerEmployer } from '../services/authService';
import AuthHero from '../components/AuthHero';
import FormError from '../components/FormError';
import PasswordStrength from '../components/PasswordStrength';
import { firstFailedRule } from '../utils/password';

// Thẻ chọn vai trò — cùng kiểu với trang Đăng nhập (icon trong ô vuông bên trái, chữ bên phải)
const ROLES = [
  { key: 'candidate', icon: User, title: 'Ứng viên', subtitle: 'Tìm việc làm' },
  { key: 'employer', icon: Building2, title: 'Nhà tuyển dụng', subtitle: 'Đăng tin tuyển' }
];

const RoleSelector = ({ selectedRole, onRoleChange }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
    {ROLES.map(({ key, icon, title, subtitle }) => {
      const Icon = icon;
      const active = selectedRole === key;
      return (
        <button
          key={key}
          type="button"
          onClick={() => onRoleChange(key)}
          style={{
            padding: '12px',
            borderRadius: '14px',
            border: `2px solid ${active ? COLORS.purple : COLORS.border}`,
            background: active ? COLORS.blueLight : COLORS.white,
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            textAlign: 'left',
            minWidth: 0
          }}
        >
          <span style={{
            width: 36, height: 36, borderRadius: 10, flexShrink: 0,
            background: active ? COLORS.purple : COLORS.grayBg,
            display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s'
          }}>
            <Icon size={18} color={active ? COLORS.white : COLORS.navy} strokeWidth={2} />
          </span>
          <span style={{ minWidth: 0 }}>
            <span style={{ display: 'block', fontSize: '14px', fontWeight: 700, color: COLORS.navy, whiteSpace: 'nowrap' }}>{title}</span>
            <span style={{ display: 'block', fontSize: '12px', color: COLORS.gray, marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{subtitle}</span>
          </span>
        </button>
      );
    })}
  </div>
);

const InputField = ({ label, type = 'text', placeholder, icon: Icon, required, value, onChange, showPasswordToggle, onTogglePassword, showPassword }) => (
  <div style={{ marginBottom: '20px' }}>
    <label style={{
      display: 'block',
      fontSize: '14px',
      fontWeight: '600',
      color: COLORS.navy,
      marginBottom: '8px'
    }}>
      {label} {required && <span style={{ color: COLORS.red }}>*</span>}
    </label>
    <div style={{
      position: 'relative',
      display: 'flex',
      alignItems: 'center'
    }}>
      {Icon && (
        <Icon size={18} color={COLORS.gray} style={{
          position: 'absolute',
          left: '14px',
          pointerEvents: 'none'
        }} />
      )}
      <input
        type={showPasswordToggle ? (showPassword ? 'text' : 'password') : type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: Icon ? '12px 44px 12px 44px' : '12px 14px',
          borderRadius: '8px',
          border: `1px solid ${COLORS.border}`,
          fontSize: '14px',
          color: COLORS.navy,
          outline: 'none',
          transition: 'border-color 0.2s',
          boxSizing: 'border-box'
        }}
        onFocus={e => e.target.style.borderColor = COLORS.blue}
        onBlur={e => e.target.style.borderColor = COLORS.border}
      />
      {showPasswordToggle && (
        <button
          type="button"
          onClick={onTogglePassword}
          style={{
            position: 'absolute',
            right: '14px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          {showPassword ? (
            <Eye size={18} color={COLORS.gray} />
          ) : (
            <EyeOff size={18} color={COLORS.gray} />
          )}
        </button>
      )}
    </div>
  </div>
);

const CandidateRegistrationForm = () => {
const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    birthDate: '',
    gender: '',
    address: '',
    IdCard: '',
    agreed: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};

    if (!formData.fullName) newErrors.fullName = 'Vui lòng nhập họ tên';

    if (!formData.phone)
      newErrors.phone = 'Vui lòng nhập số điện thoại';
    else if (!/^\d{9,11}$/.test(formData.phone))
      newErrors.phone = 'Số điện thoại không hợp lệ';

    if (!formData.email)
      newErrors.email = 'Vui lòng nhập email';
    else if (!/^\S+@\S+\.\S+$/.test(formData.email))
      newErrors.email = 'Email không hợp lệ';

    if (!formData.password)
      newErrors.password = 'Vui lòng nhập mật khẩu';
    else if (firstFailedRule(formData.password))
      newErrors.password = `Mật khẩu chưa đạt: ${firstFailedRule(formData.password).text.toLowerCase()}`;

    if (formData.confirmPassword !== formData.password)
      newErrors.confirmPassword = 'Mật khẩu không khớp';

    if (!formData.birthDate)
      newErrors.birthDate = 'Vui lòng chọn ngày sinh';
    else {
      const birth = new Date(formData.birthDate);
      const age = new Date().getFullYear() - birth.getFullYear();
      if (age < 16)
        newErrors.birthDate = 'Bạn phải từ 16 tuổi trở lên';
    }

    if (!formData.gender)
      newErrors.gender = 'Vui lòng chọn giới tính';

    if (!formData.agreed)
      newErrors.agreed = 'Bạn phải đồng ý điều khoản';

    if (!formData.address)
      newErrors.address = 'Vui lòng nhập địa chỉ';

    if (!formData.IdCard)
      newErrors.IdCard = 'Vui lòng nhập số CMND/CCCD';
    else if (formData.IdCard.length !== 12 || !/^\d+$/.test(formData.IdCard))
      newErrors.IdCard = 'Vui lòng nhập số CMND/CCCD hợp lệ (12 chữ số)';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await registerCandidate(formData);
      navigate('/verify-email');
    } catch (err) {
      setErrors({ form: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormError message={errors.form} />
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
      <div>
        <InputField
          label="Họ và tên"
          placeholder="Nhập họ tên"
          icon={User}
          required
          value={formData.fullName}
          onChange={(val) => setFormData({...formData, fullName: val})}
        />
        {errors.fullName && (
          <div style={{ fontSize: '12px', color: COLORS.red, marginTop: '-10px' }}>
            {errors.fullName}
          </div>
        )}
      </div>

      <div>
        <InputField
          label="Số điện thoại"
          placeholder="Nhập số điện thoại"
          icon={Phone}
          required
          value={formData.phone}
          onChange={(val) => setFormData({...formData, phone: val})}
        />
        {errors.phone && (
          <div style={{ fontSize: '12px', color: COLORS.red, marginTop: '-10px', marginBottom: '15px' }}>
            {errors.phone}
          </div>
        )}
      </div>
    </div>     
      <InputField
        label="E-mail"
        type="email"
        placeholder="E-mail"
        icon={Mail}
        required
        value={formData.email}
        onChange={(val) => setFormData({...formData, email: val})}
      />
      {errors.email && (
        <div style={{ fontSize: '12px', color: COLORS.red, marginTop: '-10px', marginBottom: '15px' }}>
          {errors.email}
        </div>
      )}

      <InputField
        label="Mật khẩu"
        placeholder="Tối thiểu 8 ký tự"
        icon={Lock}
        required
        value={formData.password}
        onChange={(val) => setFormData({...formData, password: val})}
        showPasswordToggle
        showPassword={showPassword}
        onTogglePassword={() => setShowPassword(!showPassword)}
      />
      {errors.password && (
        <div style={{ fontSize: '12px', color: COLORS.red, marginTop: '-10px', marginBottom: '15px' }}>
          {errors.password}
        </div>
      )}

      {/* Thanh độ mạnh (khi đang nhập) + dòng gợi ý luôn hiện bên dưới */}
      <PasswordStrength password={formData.password} style={{ margin: '-8px 0 18px' }} />
      <p style={{
        fontSize: '12px',
        color: COLORS.gray,
        margin: formData.password ? '-10px 0 20px 0' : '-12px 0 20px 0',
        lineHeight: '1.5'
      }}>
        Sử dụng ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt
      </p>

      <InputField
        label="Xác nhận mật khẩu"
        placeholder="Nhập lại mật khẩu"
        icon={Lock}
        required
        value={formData.confirmPassword}
        onChange={(val) => setFormData({...formData, confirmPassword: val})}
        showPasswordToggle
        showPassword={showConfirmPassword}
        onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
      />
      {errors.confirmPassword && (
        <div style={{ fontSize: '12px', color: COLORS.red, marginTop: '-10px', marginBottom: '15px' }}>
          {errors.confirmPassword}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '600',
            color: COLORS.navy,
            marginBottom: '8px'
          }}>
            Ngày sinh
          </label>
          <div style={{ position: 'relative' }}>
            <Calendar size={18} color={COLORS.gray} style={{
              position: 'absolute',
              left: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              pointerEvents: 'none'
            }} />
            <input
              type="date"
              value={formData.birthDate}
              onChange={(e) => setFormData({...formData, birthDate: e.target.value})}
              style={{
                width: '100%',
                padding: '12px 14px 12px 44px',
                borderRadius: '8px',
                border: `1px solid ${COLORS.border}`,
                fontSize: '14px',
                color: COLORS.navy,
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>
          {errors.birthDate && (
            <div style={{ fontSize: '12px', color: COLORS.red, marginTop: '10px'}}>
              {errors.birthDate}
            </div>
          )}
        </div>

        <div>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '600',
            color: COLORS.navy,
            marginBottom: '8px'
          }}>
            Giới tính
          </label>
          {/* Ẩn mũi tên mặc định (sát mép, lệch), dùng icon riêng căn giữa theo chiều dọc */}
          <div style={{ position: 'relative' }}>
            <Users size={18} color={COLORS.gray} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            <select
              value={formData.gender}
              onChange={(e) => setFormData({...formData, gender: e.target.value})}
              style={{
                width: '100%',
                padding: '12px 42px 12px 44px',
                borderRadius: '8px',
                border: `1px solid ${COLORS.border}`,
                fontSize: '14px',
                color: formData.gender ? COLORS.navy : COLORS.grayLight,
                outline: 'none',
                boxSizing: 'border-box',
                background: COLORS.white,
                appearance: 'none',
                WebkitAppearance: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="">Chọn giới tính</option>
              <option value="male" style={{ color: COLORS.navy }}>Nam</option>
              <option value="female" style={{ color: COLORS.navy }}>Nữ</option>
              <option value="other" style={{ color: COLORS.navy }}>Khác</option>
            </select>
            <ChevronDown size={18} color={COLORS.gray} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          </div>
          {errors.gender && (
            <div style={{ fontSize: '12px', color: COLORS.red, marginTop: '10px' }}>
              {errors.gender}
            </div>
          )}
        </div>
      </div>

      <InputField
        label="Số CMND/CCCD"
        placeholder="Nhập số CMND/CCCD"
        icon={IdCard}
        required
        value={formData.IdCard}
        onChange={(val) => setFormData({...formData, IdCard: val})}
      />
      {errors.IdCard && (
        <div style={{ fontSize: '12px', color: COLORS.red, marginTop: '-10px', marginBottom: '15px' }}>
          {errors.IdCard}
        </div>
      )}

      <InputField
        label="Địa chỉ"
        placeholder="Nhập địa chỉ nhà"
        icon={MapPin}
        value={formData.address}
        onChange={(val) => setFormData({...formData, address: val})}
      />
      {errors.address && (
        <div style={{ fontSize: '12px', color: COLORS.red, marginTop: '-10px', marginBottom: '15px' }}>
          {errors.address}
        </div>
      )}

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '24px'
      }}>
        <input
          type="checkbox"
          checked={formData.agreed}
          onChange={(e) => setFormData({...formData, agreed: e.target.checked})}
          style={{
            // Cùng cỡ với checkbox ở bảng Tin tuyển dụng của nhà tuyển dụng
            width: 18, height: 18, margin: 0, flexShrink: 0,
            cursor: 'pointer', accentColor: COLORS.purple
          }}
        />
        <label style={{
          fontSize: '13px',
          color: COLORS.gray,
          lineHeight: '1.5'
        }}>
          Tôi đã đọc và đồng ý với{' '}
          <a href="#" style={{ color: COLORS.blue, textDecoration: 'none', fontWeight: '500' }}>
            Điều khoản
          </a>
          {' '}và{' '}
          <a href="#" style={{ color: COLORS.blue, textDecoration: 'none', fontWeight: '500' }}>
            Chính sách bảo mật
          </a>
        </label>
      </div>
        {errors.agreed && (
          <div style={{ fontSize: '12px', color: COLORS.red, marginTop: '-15px', marginBottom: '15px' }}>
            {errors.agreed}
          </div>
        )}

      <button
        type="submit"
        disabled={loading}
        style={{
          width: '100%',
          padding: '14px',
          borderRadius: '8px',
          border: 'none',
          background: COLORS.purple,
          color: COLORS.white,
          fontSize: '15px',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'all 0.2s',
          boxShadow: '0 6px 20px rgba(109, 93, 252, 0.28)'
        }}
      >
        {loading ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}
      </button>
    </form>
  );
};

const EmployerRegistrationForm = () => {
const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    IdCard: '',
    address: '',
    taxRegistrationNumber: '',
    agreed: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});

    const validate = () => {
      const newErrors = {};

      if (!formData.fullName)
        newErrors.fullName = 'Vui lòng nhập họ tên';

      if (!formData.phone)
        newErrors.phone = 'Vui lòng nhập số điện thoại';
      else if (!/^\d{9,11}$/.test(formData.phone))
        newErrors.phone = 'Số điện thoại không hợp lệ';

      if (!formData.email)
        newErrors.email = 'Vui lòng nhập email';
      else if (!/^\S+@\S+\.\S+$/.test(formData.email))
        newErrors.email = 'Email không hợp lệ';

      if (!formData.password)
        newErrors.password = 'Vui lòng nhập mật khẩu';
      else if (firstFailedRule(formData.password))
        newErrors.password = `Mật khẩu chưa đạt: ${firstFailedRule(formData.password).text.toLowerCase()}`;

      if (formData.confirmPassword !== formData.password)
        newErrors.confirmPassword = 'Mật khẩu không khớp';

      if (!formData.companyName)
        newErrors.companyName = 'Vui lòng nhập tên công ty';

      if (!formData.IdCard)
        newErrors.IdCard = 'Vui lòng nhập số CMND/CCCD';
      else if (formData.IdCard.length !== 12 || !/^\d+$/.test(formData.IdCard))
        newErrors.IdCard = 'Vui lòng nhập số CMND/CCCD hợp lệ (12 chữ số)';

      if (!formData.address)
        newErrors.address = 'Vui lòng nhập địa chỉ';

      if (!formData.taxRegistrationNumber)
        newErrors.taxRegistrationNumber = 'Vui lòng nhập mã số thuế';

      if (!formData.agreed)
        newErrors.agreed = 'Bạn phải đồng ý điều khoản';

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
  };

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await registerEmployer(formData);
      navigate('/verify-email');
    } catch (err) {
      setErrors({ form: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormError message={errors.form} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div>
          <InputField
            label="Họ và tên"
            placeholder="Nhập họ tên"
            icon={User}
            required
            value={formData.fullName}
            onChange={(val) => setFormData({...formData, fullName: val})}
          />
          {errors.fullName && (
          <div style={{ fontSize: '12px', color: COLORS.red, marginTop: '-10px' }}>
            {errors.fullName}
          </div>
          )}
        </div>

        <div>
          <InputField
            label="Số điện thoại"
            placeholder="Nhập số điện thoại"
            icon={Phone}
            required
            value={formData.phone}
            onChange={(val) => setFormData({...formData, phone: val})}
          />
          {errors.phone && (
            <div style={{ fontSize: '12px', color: COLORS.red, marginTop: '-10px', marginBottom: '15px' }}>
              {errors.phone}
            </div>
          )}
        </div>
      </div>

      <InputField
        label="E-mail"
        type="email"
        placeholder="E-mail"
        icon={Mail}
        required
        value={formData.email}
        onChange={(val) => setFormData({...formData, email: val})}
      />
      {errors.email && (
        <div style={{ fontSize: '12px', color: COLORS.red, marginTop: '-10px', marginBottom: '15px' }}>
          {errors.email}
        </div>
      )}

      <InputField
        label="Mật khẩu"
        placeholder="Tối thiểu 8 ký tự"
        icon={Lock}
        required
        value={formData.password}
        onChange={(val) => setFormData({...formData, password: val})}
        showPasswordToggle
        showPassword={showPassword}
        onTogglePassword={() => setShowPassword(!showPassword)}
      />
      {errors.password && (
        <div style={{ fontSize: '12px', color: COLORS.red, marginTop: '-10px', marginBottom: '15px' }}>
          {errors.password}
        </div>
      )}

      {/* Thanh độ mạnh (khi đang nhập) + dòng gợi ý luôn hiện bên dưới */}
      <PasswordStrength password={formData.password} style={{ margin: '-8px 0 18px' }} />
      <p style={{
        fontSize: '12px',
        color: COLORS.gray,
        margin: formData.password ? '-10px 0 20px 0' : '-12px 0 20px 0',
        lineHeight: '1.5'
      }}>
        Sử dụng ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt
      </p>

      <InputField
        label="Xác nhận mật khẩu"
        placeholder="Nhập lại mật khẩu"
        icon={Lock}
        required
        value={formData.confirmPassword}
        onChange={(val) => setFormData({...formData, confirmPassword: val})}
        showPasswordToggle
        showPassword={showConfirmPassword}
        onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
      />
      {errors.confirmPassword && (
        <div style={{ fontSize: '12px', color: COLORS.red, marginTop: '-10px', marginBottom: '15px' }}>
          {errors.confirmPassword}
        </div>
      )}

      <InputField
        label="Tên công ty"
        placeholder="Nhập tên công ty"
        icon={Briefcase}
        required
        value={formData.companyName}
        onChange={(val) => setFormData({...formData, companyName: val})}
      />
      {errors.companyName && (
        <div style={{ fontSize: '12px', color: COLORS.red, marginTop: '-10px', marginBottom: '15px' }}>
          {errors.companyName}
        </div>
      )}

      <InputField
        label="Số CMND/CCCD"
        placeholder="Nhập số CMND/CCCD"
        icon={IdCard}
        required
        value={formData.IdCard}
        onChange={(val) => setFormData({...formData, IdCard: val})}
      />
      {errors.IdCard && (
        <div style={{ fontSize: '12px', color: COLORS.red, marginTop: '-10px', marginBottom: '15px' }}>
          {errors.IdCard}
        </div>
      )}

      <InputField
        label="Địa chỉ"
        placeholder="Nhập địa chỉ"
        icon={MapPin}
        required
        value={formData.address}
        onChange={(val) => setFormData({...formData, address: val})}
      />
      {errors.address && (
        <div style={{ fontSize: '12px', color: COLORS.red, marginTop: '-10px', marginBottom: '15px' }}>
          {errors.address}
        </div>
      )}

      <InputField
        label="Mã số thuế"
        placeholder="Nhập mã số thuế"
        icon={IdCard}
        required
        value={formData.taxRegistrationNumber}
        onChange={(val) => setFormData({...formData, taxRegistrationNumber: val})}
      />
      {errors.taxRegistrationNumber && (
        <div style={{ fontSize: '12px', color: COLORS.red, marginTop: '-10px', marginBottom: '15px' }}>
          {errors.taxRegistrationNumber}
        </div>
      )}

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '24px'
      }}>
        <input
          type="checkbox"
          checked={formData.agreed}
          onChange={(e) => setFormData({...formData, agreed: e.target.checked})}
          style={{
            // Cùng cỡ với checkbox ở bảng Tin tuyển dụng của nhà tuyển dụng
            width: 18, height: 18, margin: 0, flexShrink: 0,
            cursor: 'pointer', accentColor: COLORS.purple
          }}
        />
        <label style={{
          fontSize: '13px',
          color: COLORS.gray,
          lineHeight: '1.5'
        }}>
          Tôi đã đọc và đồng ý với{' '}
          <a href="#" style={{ color: COLORS.blue, textDecoration: 'none', fontWeight: '500' }}>
            Điều khoản
          </a>
          {' '}và{' '}
          <a href="#" style={{ color: COLORS.blue, textDecoration: 'none', fontWeight: '500' }}>
            Chính sách bảo mật
          </a>
        </label>
      </div>
      {errors.agreed && (
        <div style={{ fontSize: '12px', color: COLORS.red, marginTop: '-15px', marginBottom: '15px' }}>
          {errors.agreed}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        style={{
          width: '100%',
          padding: '14px',
          borderRadius: '8px',
          border: 'none',
          background: COLORS.purple,
          color: COLORS.white,
          fontSize: '15px',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'all 0.2s',
          boxShadow: '0 6px 20px rgba(109, 93, 252, 0.28)'
        }}
      >
        {loading ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}
      </button>
    </form>
  );
};

const Register = () => {
  // ?role=employer (từ nút ở trang chủ) → chọn sẵn vai trò
  const [searchParams] = useSearchParams();
  const [selectedRole, setSelectedRole] = useState(() => {
    const r = searchParams.get('role');
    return ['candidate', 'employer'].includes(r) ? r : 'candidate';
  });


  return (
    <div style={{
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      margin: 0,
      padding: 0,
      minHeight: '100vh',
      background: COLORS.grayBg
    }}>
      
      <main style={{
        display: 'flex',
        minHeight: 'calc(100vh - 76px)',
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '40px 48px 64px',
        gap: '40px',
        alignItems: 'flex-start'
      }}>
        <AuthHero role={selectedRole} />

        <div style={{
          flex: '0 0 520px',
          background: COLORS.white,
          borderRadius: '20px',
          padding: '40px',
          border: `1px solid ${COLORS.border}`,
          boxShadow: '0 12px 40px rgba(15, 23, 42, 0.06)'
        }}>
          <h2 style={{
            fontSize: '32px',
            fontWeight: '700',
            color: COLORS.navy,
            marginBottom: '8px'
          }}>
            Tạo tài khoản mới
          </h2>
          
          <p style={{
            fontSize: '14px',
            color: COLORS.gray,
            marginBottom: '32px'
          }}>
            Đã có tài khoản?{' '}
            <a href="/login" style={{
              color: COLORS.blue,
              textDecoration: 'none',
              fontWeight: '600'
            }}>
              Đăng nhập ngay
            </a>
          </p>

          <RoleSelector 
            selectedRole={selectedRole} 
            onRoleChange={setSelectedRole}
          />

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            margin: '24px 0',
            fontSize: '13px',
            color: COLORS.grayLight
          }}>
            {/* Chỉ còn đường kẻ phân cách, không chữ */}
            <div style={{ flex: 1, height: '1px', background: COLORS.border }} />
          </div>

          {selectedRole === 'candidate' ? <CandidateRegistrationForm /> : <EmployerRegistrationForm />}
        </div>
      </main>
    </div>
  );
};

export default Register;