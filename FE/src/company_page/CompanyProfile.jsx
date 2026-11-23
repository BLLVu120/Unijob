import { useState } from 'react';
import { Camera, Save, Edit2 } from 'lucide-react';
import { flex, txt } from '../utils/styles';
import { COLORS } from '../constants/colors';
const C = COLORS;

const InputField = ({ label, value, onChange, placeholder, disabled, required, textarea, rows = 4 }) => {
  const baseStyle = {
    width: '100%', padding: '12px 14px', borderRadius: 8,
    border: `1px solid ${C.border}`, fontSize: 14, color: disabled ? C.grayLight : C.navy,
    outline: 'none', background: disabled ? C.grayBg : C.white,
    cursor: disabled ? 'not-allowed' : 'text', boxSizing: 'border-box',
    fontFamily: 'inherit'
  };

  return (
    <div style={{ marginBottom: 24 }}>
      <label style={{ ...txt(14, 600), display: 'block', marginBottom: 8 }}>
        {label} {required && <span style={{ color: C.red }}>*</span>}
      </label>
      {textarea ? (
        <textarea
          value={value}
          onChange={e => onChange?.(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          rows={rows}
          style={{ ...baseStyle, resize: 'vertical', minHeight: 100 }}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={e => onChange?.(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          style={baseStyle}
        />
      )}
    </div>
  );
};


const SelectField = ({ label, value, onChange, options, placeholder, disabled, required }) => (
  <div style={{ marginBottom: 24 }}>
    <label style={{ ...txt(14, 600), display: 'block', marginBottom: 8 }}>
      {label} {required && <span style={{ color: C.red }}>*</span>}
    </label>
    <select
      value={value}
      onChange={e => onChange?.(e.target.value)}
      disabled={disabled}
      style={{
        width: '100%', padding: '12px 14px', borderRadius: 8,
        border: `1px solid ${C.border}`, fontSize: 14,
        color: disabled ? C.grayLight : C.navy,
        outline: 'none', background: disabled ? C.grayBg : C.white,
        cursor: disabled ? 'not-allowed' : 'pointer', boxSizing: 'border-box',
        appearance: 'none',
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2364748b' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 14px center'
      }}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(opt => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  </div>
);

export default function CompanyProfilePage() {
  const [editMode, setEditMode] = useState(false);
  const [company, setCompany] = useState({
    name: 'The Coffee House',
    industry: 'F&B',
    size: '1000 - 5000 nhân viên',
    website: 'https://thecoffeehouse.com',
    email: 'hr@thecoffeehouse.com',
    address: 'Tầng 3, Tòa nhà VTC Online 18 Tam Trinh, Hai Bà Trưng, Hà Nội',
    description: 'The Coffee House được thành lập từ năm 2014, với sứ mệnh mang đến những trải nghiệm cà phê tuyệt vời và không gian thân thiện cho khách hàng.'
  });

  const [tempCompany, setTempCompany] = useState({ ...company });

  const handleEdit = () => {
    setTempCompany({ ...company });
    setEditMode(true);
  };

  const handleCancel = () => {
    setTempCompany({ ...company });
    setEditMode(false);
  };

  const handleSave = () => {
    setCompany({ ...tempCompany });
    setEditMode(false);
  };

  const updateField = (field, value) => {
    setTempCompany({ ...tempCompany, [field]: value });
  };

  const industries = [
    'F&B',
    'Bán lẻ',
    'Công nghệ',
    'Giáo dục',
    'Y tế',
    'Du lịch',
    'Khác'
  ];

  const companySizes = [
    '1-50 nhân viên',
    '51-200 nhân viên',
    '201-500 nhân viên',
    '501-1000 nhân viên',
    '1000 - 5000 nhân viên',
    '5000+ nhân viên'
  ];

  return (
    <div style={{
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      background: C.grayBg, minHeight: '100vh'
    }}>

      <main style={{ padding: '40px 48px' }}>
        <div style={{ 
          ...flex('center'), justifyContent: 'space-between', marginBottom: 32 
        }}>
          <div>
            <h1 style={{ ...txt(32, 700), marginBottom: 8 }}>Hồ sơ công ty</h1>
          </div>

          {editMode ? (
            <div style={{ ...flex('center'), gap: 12 }}>
              <button
                onClick={handleCancel}
                style={{
                  padding: '10px 24px', borderRadius: 10,
                  border: `1px solid ${C.border}`, background: C.white,
                  color: C.navy, fontSize: 14, fontWeight: 600,
                  cursor: 'pointer', transition: 'all 0.2s'
                }}
              >
                Hủy
              </button>
              <button
                onClick={handleSave}
                style={{
                  padding: '10px 24px', borderRadius: 10, border: 'none',
                  background: C.blue, color: C.white, fontSize: 14, fontWeight: 600,
                  cursor: 'pointer', transition: 'all 0.2s',
                  boxShadow: '0 2px 8px rgba(99, 102, 241, 0.25)',
                  ...flex('center'), gap: 8
                }}
              >
                <Save size={16} /> Lưu thay đổi
              </button>
            </div>
          ) : (
            <button
              onClick={handleEdit}
              style={{
                padding: '10px 24px', borderRadius: 10, border: 'none',
                background: C.blue, color: C.white, fontSize: 14, fontWeight: 600,
                cursor: 'pointer', transition: 'all 0.2s',
                boxShadow: '0 2px 8px rgba(99, 102, 241, 0.25)',
                ...flex('center'), gap: 8
              }}
            >
              <Edit2 size={16} /> Sửa thông tin
            </button>
          )}
        </div>

        <div style={{
          background: C.white, borderRadius: 16, padding: 40,
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
        }}>
          <h2 style={{ ...txt(24, 700), marginBottom: 32 }}>Thông tin cơ bản</h2>

          <div style={{ ...flex('flex-start'), gap: 32, marginBottom: 32 }}>
            <div style={{ position: 'relative' }}>
              <div style={{
                width: 120, height: 120, borderRadius: 16,
                background: `linear-gradient(135deg, ${C.blue}, ${C.purple})`,
                ...flex('center'), justifyContent: 'center'
              }}>
                <span style={{ ...txt(48, 700, C.white) }}>CH</span>
              </div>
              {editMode && (
                <button style={{
                  position: 'absolute', bottom: -4, right: -4,
                  width: 36, height: 36, borderRadius: '50%',
                  background: C.navy, border: `3px solid ${C.white}`,
                  cursor: 'pointer', ...flex('center'), justifyContent: 'center'
                }}>
                  <Camera size={16} color={C.white} />
                </button>
              )}
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr', 
                gap: '0 24px' 
              }}>
                <InputField
                    label="Tên công ty"
                    value={editMode ? tempCompany.name : company.name}
                    onChange={v => updateField('name', v)}
                    placeholder="Nhập tên công ty"
                    disabled={!editMode}
                    required
                />

                <InputField
                    label="Địa chỉ"
                    value={editMode ? tempCompany.address : company.address}
                    onChange={v => updateField('address', v)}
                    placeholder="Nhập địa chỉ công ty"
                    disabled={!editMode}
                    required
                />

                <InputField
                    label="Email"
                    value={company.email}
                    placeholder="email@company.com"
                    disabled={true}
                />

                <SelectField
                    label="Ngành nghề"
                    value={editMode ? tempCompany.industry : company.industry}
                    onChange={v => updateField('industry', v)}
                    options={industries}
                    disabled={!editMode}
                    required
                />

                <InputField
                    label="Website"
                    value={editMode ? tempCompany.website : company.website}
                    onChange={v => updateField('website', v)}
                    placeholder="https://"
                    disabled={!editMode}
                />

                <SelectField
                    label="Quy mô"
                    value={editMode ? tempCompany.size : company.size}
                    onChange={v => updateField('size', v)}
                    options={companySizes}
                    disabled={!editMode}
                    required
                />

                <InputField
                    label="Mô tả công ty"
                    value={editMode ? tempCompany.description : company.description}
                    onChange={v => updateField('description', v)}
                    placeholder="Giới thiệu về công ty của bạn"
                    disabled={!editMode}
                    textarea
                    required
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      <style>{`
        input:focus:not(:disabled), 
        textarea:focus:not(:disabled), 
        select:focus:not(:disabled) {
          border-color: ${C.blue} !important;
        }
        input::placeholder, 
        textarea::placeholder {
          color: ${C.grayLight};
        }
      `}</style>
    </div>
  );
}