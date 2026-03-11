import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from "react-router-dom";
import { 
  User, Building2, Mail, Lock, Eye, EyeOff, Phone, MapPin,
  Calendar, Briefcase, Shield, Zap, CreditCard, CheckCircle, IdCard 
} from 'lucide-react';
import { COLORS } from '../constants/colors';
import { setPendingUser, registerUser, registerEmployer } from "../services/authService";

const RoleSelector = ({ selectedRole, onRoleChange }) => (
  <div style={{
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
    marginBottom: '24px'
  }}>
    <button
      onClick={() => onRoleChange('candidate')}
      style={{
        padding: '20px',
        borderRadius: '12px',
        border: selectedRole === 'candidate' ? `2px solid ${COLORS.blue}` : `2px solid ${COLORS.border}`,
        background: selectedRole === 'candidate' ? 'rgba(59, 130, 246, 0.05)' : COLORS.white,
        cursor: 'pointer',
        transition: 'all 0.2s',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px'
      }}
    >
      <User size={32} color={selectedRole === 'candidate' ? COLORS.blue : COLORS.navy} strokeWidth={2} />
      <div style={{
        fontSize: '15px',
        fontWeight: '600',
        color: COLORS.navy
      }}>
        Ứng viên
      </div>
      <div style={{
        fontSize: '12px',
        color: COLORS.gray
      }}>
        Tìm việc làm
      </div>
    </button>
    
    <button
      onClick={() => onRoleChange('employer')}
      style={{
        padding: '20px',
        borderRadius: '12px',
        border: selectedRole === 'employer' ? `2px solid ${COLORS.blue}` : `2px solid ${COLORS.border}`,
        background: selectedRole === 'employer' ? 'rgba(59, 130, 246, 0.05)' : COLORS.white,
        cursor: 'pointer',
        transition: 'all 0.2s',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px'
      }}
    >
      <Building2 size={32} color={selectedRole === 'employer' ? COLORS.blue : COLORS.navy} strokeWidth={2} />
      <div style={{
        fontSize: '15px',
        fontWeight: '600',
        color: COLORS.navy
      }}>
        Nhà tuyển dụng
      </div>
      <div style={{
        fontSize: '12px',
        color: COLORS.gray
      }}>
        Đăng tin tuyển
      </div>
    </button>
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

const FeatureItem = ({ icon: Icon, text }) => (
  <div style={{
    display: 'flex',
    alignItems: 'flex-start',
    gap: '16px',
    marginBottom: '20px'
  }}>
    <div style={{
      width: '48px',
      height: '48px',
      borderRadius: '12px',
      background: 'rgba(255, 255, 255, 0.15)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0
    }}>
      <Icon size={24} color={COLORS.white} strokeWidth={2} />
    </div>
    <p style={{
      fontSize: '15px',
      lineHeight: '1.6',
      color: COLORS.white,
      margin: 0,
      paddingTop: '12px'
    }}>
      {text}
    </p>
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
    idCard: '',
    agreed: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};

    if (!formData.fullName) newErrors.fullName = 'Vui lòng nhập họ tên';
    else if (formData.fullName.trim().length < 2) newErrors.fullName = 'Họ tên phải có ít nhất 2 ký tự';

    if (!formData.phone) newErrors.phone = 'Vui lòng nhập số điện thoại';
    else if (!/^(0|\+84)[0-9]{9,10}$/.test(formData.phone)) newErrors.phone = 'Số điện thoại không hợp lệ';

    if (!formData.email) newErrors.email = 'Vui lòng nhập email';
    else if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = 'Email không hợp lệ';

    if (!formData.password) newErrors.password = 'Vui lòng nhập mật khẩu';
    else if (formData.password.length < 8) newErrors.password = 'Mật khẩu tối thiểu 8 ký tự';

    if (formData.confirmPassword !== formData.password) newErrors.confirmPassword = 'Mật khẩu không khớp';

    if (!formData.birthDate) newErrors.birthDate = 'Vui lòng chọn ngày sinh';
    else {
      const birth = new Date(formData.birthDate);
      const age = new Date().getFullYear() - birth.getFullYear();
      if (age < 16)
        newErrors.birthDate = 'Bạn phải từ 16 tuổi trở lên';
    }

    if (!formData.gender) newErrors.gender = 'Vui lòng chọn giới tính';

    if (!formData.agreed) newErrors.agreed = 'Bạn phải đồng ý điều khoản';

    if (!formData.address) newErrors.address = 'Vui lòng nhập địa chỉ';
    else if (formData.address.trim().length < 5) newErrors.address = 'Địa chỉ phải có ít nhất 5 ký tự';

    if (!formData.idCard) newErrors.idCard = 'Vui lòng nhập số CMND/CCCD';
    else if (formData.idCard.length !== 12 || !/^\d+$/.test(formData.idCard)) 
      newErrors.idCard = 'Vui lòng nhập số CMND/CCCD hợp lệ (12 chữ số)';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const pendingUser = {
      full_name: formData.fullName,
      email: formData.email,
      phone_number: formData.phone,
      password: formData.password,
      dob: formData.birthDate,
      gender: formData.gender,
      address: formData.address,
      cid: formData.idCard,
      is_verified: false
    };

    try {
      await registerUser(pendingUser);
      setPendingUser(pendingUser);
      navigate("/verify-email");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
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

      <p style={{
        fontSize: '12px',
        color: COLORS.gray,
        margin: '-12px 0 20px 0',
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
          <select
            value={formData.gender}
            onChange={(e) => setFormData({...formData, gender: e.target.value})}
            style={{
              width: '100%',
              padding: '12px 14px',
              borderRadius: '8px',
              border: `1px solid ${COLORS.border}`,
              fontSize: '14px',
              color: COLORS.navy,
              outline: 'none',
              boxSizing: 'border-box',
              appearance: 'none',
              background: `${COLORS.white} url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2364748b' d='M6 9L1 4h10z'/%3E%3C/svg%3E") no-repeat right 14px center`
            }}
          >
            <option value="">Chọn giới tính</option>
            <option value="Nam">Nam</option>
            <option value="Nữ">Nữ</option>
            <option value="Khác">Khác</option>
          </select>
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
        value={formData.idCard}
        onChange={(val) => setFormData({...formData, idCard: val})}
      />
      {errors.idCard && (
        <div style={{ fontSize: '12px', color: COLORS.red, marginTop: '-10px', marginBottom: '15px' }}>
          {errors.idCard}
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
        alignItems: 'flex-start',
        gap: '12px',
        marginBottom: '24px'
      }}>
        <input
          type="checkbox"
          checked={formData.agreed}
          onChange={(e) => setFormData({...formData, agreed: e.target.checked})}
          style={{
            marginTop: '4px',
            cursor: 'pointer'
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
        style={{
          width: '100%',
          padding: '14px',
          borderRadius: '8px',
          border: 'none',
          background: `linear-gradient(135deg, ${COLORS.purple} 0%, ${COLORS.purpleGradient} 100%)`,
          color: COLORS.white,
          fontSize: '15px',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'all 0.2s',
          boxShadow: '0 4px 12px rgba(139, 127, 214, 0.3)'
        }}
      >
        Tạo tài khoản
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
    idCard: '',
    address: '',
    taxRegistrationNumber: '',
    agreed: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});

    const validate = () => {
      const newErrors = {};

      if (!formData.fullName) newErrors.fullName = 'Vui lòng nhập họ tên';
      else if (formData.fullName.trim().length < 2) newErrors.fullName = 'Họ tên phải có ít nhất 2 ký tự';

      if (!formData.phone) newErrors.phone = 'Vui lòng nhập số điện thoại';
      else if (!/^(0|\+84)[0-9]{9,10}$/.test(formData.phone)) newErrors.phone = 'Số điện thoại không hợp lệ';

      if (!formData.email) newErrors.email = 'Vui lòng nhập email';
      else if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = 'Email không hợp lệ';

      if (!formData.password) newErrors.password = 'Vui lòng nhập mật khẩu';
      else if (formData.password.length < 8) newErrors.password = 'Mật khẩu tối thiểu 8 ký tự';

      if (formData.confirmPassword !== formData.password)  newErrors.confirmPassword = 'Mật khẩu không khớp';

      if (!formData.companyName) newErrors.companyName = 'Vui lòng nhập tên công ty';
      else if (formData.companyName.trim().length < 3) newErrors.companyName = 'Tên công ty phải có ít nhất 3 ký tự';

      if (!formData.idCard) newErrors.idCard = 'Vui lòng nhập số CMND/CCCD';
      else if (formData.idCard.length !== 12 || !/^\d+$/.test(formData.idCard))
        newErrors.idCard = 'Vui lòng nhập số CMND/CCCD hợp lệ (12 chữ số)';

      if (!formData.address) newErrors.address = 'Vui lòng nhập địa chỉ';
      else if (formData.address.trim().length < 5) newErrors.address = 'Địa chỉ phải có ít nhất 5 ký tự';

      if (!formData.taxRegistrationNumber) newErrors.taxRegistrationNumber = 'Vui lòng nhập mã số thuế';

      if (!formData.agreed) newErrors.agreed = 'Bạn phải đồng ý điều khoản';

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const pendingUser = {
      emp_name: formData.companyName,
      representative_name: formData.fullName,
      phone_number: formData.phone,
      email: formData.email,
      password: formData.password,
      address: formData.address,
      tax_code: formData.taxRegistrationNumber,
      cid: formData.idCard,
      website: "",
      description: "",
      field: "",
      scope: "",
      is_verified: false,
      score: 0
    };

    try {
      await registerEmployer(pendingUser);
      setPendingUser(pendingUser);
      navigate("/verify-email");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
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

      <p style={{
        fontSize: '12px',
        color: COLORS.gray,
        margin: '-12px 0 20px 0',
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
        value={formData.idCard}
        onChange={(val) => setFormData({...formData, idCard: val})}
      />
      {errors.idCard && (
        <div style={{ fontSize: '12px', color: COLORS.red, marginTop: '-10px', marginBottom: '15px' }}>
          {errors.idCard}
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
        alignItems: 'flex-start',
        gap: '12px',
        marginBottom: '24px'
      }}>
        <input
          type="checkbox"
          checked={formData.agreed}
          onChange={(e) => setFormData({...formData, agreed: e.target.checked})}
          style={{
            marginTop: '4px',
            cursor: 'pointer'
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
        style={{
          width: '100%',
          padding: '14px',
          borderRadius: '8px',
          border: 'none',
          background: `linear-gradient(135deg, ${COLORS.purple} 0%, ${COLORS.purpleGradient} 100%)`,
          color: COLORS.white,
          fontSize: '15px',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'all 0.2s',
          boxShadow: '0 4px 12px rgba(139, 127, 214, 0.3)'
        }}
      >
        Tạo tài khoản
      </button>
    </form>
  );
};

const RegistrationPage = () => {
  const [selectedRole, setSelectedRole] = useState('candidate');

  const candidateFeatures = [
    { icon: CheckCircle, text: '10.000+ việc làm part-time được xác thực' },
    { icon: Shield, text: 'An toàn với hệ thống xác thực doanh nghiệp' },
    { icon: Zap, text: 'Nhanh chóng ứng tuyển chỉ trong 30 giây' },
    { icon: CreditCard, text: 'Miễn phí hoàn toàn cho ứng viên' }
  ];

  const employerFeatures = [
    { icon: User, text: '50.000+ ứng viên sẵn sàng làm việc' },
    { icon: Shield, text: 'Uy tín với hệ thống xác thực hồ sơ ứng viên' },
    { icon: Zap, text: 'Nhanh chóng đăng tin tuyển dụng trong 5 phút' },
    { icon: CreditCard, text: 'Hiệu quả tỷ lệ tìm được ứng viên phù hợp cao' }
  ];

  const features = selectedRole === 'candidate' ? candidateFeatures : employerFeatures;
  const heroTitle = selectedRole === 'candidate' 
    ? 'Với UNIJOB, tìm việc làm part-time trở nên dễ dàng hơn bao giờ hết'
    : 'Tìm kiếm ứng viên chất lượng cho doanh nghiệp của bạn';
  const heroSubtitle = selectedRole === 'candidate'
    ? 'Nền tảng kết nối ứng viên với hàng ngàn cơ hội việc làm part-time uy tín tại Việt Nam.'
    : 'Nền tảng tuyển dụng hàng đầu giúp doanh nghiệp kết nối với hàng ngàn ứng viên tiềm năng.';
  const gradientColor = selectedRole === 'candidate' 
    ? `linear-gradient(135deg, ${COLORS.purple} 0%, ${COLORS.purpleGradient} 100%)`
    : `linear-gradient(135deg, ${COLORS.blue} 0%, ${COLORS.blueGradient} 100%)`;

  return (
    <div style={{
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      margin: 0,
      padding: 0,
      minHeight: '100vh',
      background: COLORS.cream
    }}>
      
      <main style={{
        display: 'flex',
        minHeight: 'calc(100vh - 76px)',
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '40px 48px',
        gap: '48px',
        alignItems: 'center'
      }}>
        <div style={{
          flex: '1',
          background: gradientColor,
          borderRadius: '24px',
          padding: '60px',
          color: COLORS.white,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
          minHeight: '600px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}>
          <h1 style={{
            fontSize: '40px',
            fontWeight: '700',
            lineHeight: '1.3',
            marginBottom: '20px',
            letterSpacing: '-0.5px'
          }}>
            {heroTitle}
          </h1>
          
          <p style={{
            fontSize: '16px',
            lineHeight: '1.6',
            opacity: 0.95,
            marginBottom: '48px'
          }}>
            {heroSubtitle}
          </p>

          <div>
            {features.map((feature, idx) => (
              <FeatureItem key={idx} {...feature} />
            ))}
          </div>
        </div>

        <div style={{
          flex: '0 0 520px',
          background: COLORS.white,
          borderRadius: '20px',
          padding: '40px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
          maxHeight: 'calc(100vh - 156px)',
          overflowY: 'auto'
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
            <Link to="/login" style={{
              color: COLORS.blue,
              textDecoration: 'none',
              fontWeight: '600'
            }}>
              Đăng nhập ngay
            </Link>
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
            <div style={{ flex: 1, height: '1px', background: COLORS.border }} />
            Hoặc đăng ký bằng email
            <div style={{ flex: 1, height: '1px', background: COLORS.border }} />
          </div>

          {selectedRole === 'candidate' ? <CandidateRegistrationForm /> : <EmployerRegistrationForm />}
        </div>
      </main>
    </div>
  );
};

export default RegistrationPage;