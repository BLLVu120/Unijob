import { useState } from 'react';
import {
  User, Edit2, X,
  Calendar, Mail, Phone, MapPin, Heart, Briefcase, GraduationCap, Award, Camera
} from 'lucide-react';
import { COLORS } from '../constants/colors';
import { flex, txt } from '../utils/styles';
import { useAuth } from "../context/AuthContext";
import { setCurrentUser } from "../services/authService";
const C = COLORS;

const Card = ({ children, style = {} }) => (
  <div style={{
    background: C.white, borderRadius: 16, padding: 32,
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)', ...style
  }}>
    {children}
  </div>
);

const Modal = ({ open, onClose, title, children, onSave }) => {
  if (!open) return null;
  return (
    <>
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 9998
      }} />
      <div style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        ...flex('center', 'column'), justifyContent: 'center', padding: 24
      }}>
        <div style={{
          background: C.white, borderRadius: 16, width: '100%', maxWidth: 560,
          maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.15)'
        }}>
          <div style={{
            ...flex('center'), justifyContent: 'space-between',
            padding: '24px 28px', borderBottom: `1px solid ${C.border}`
          }}>
            <h3 style={{ ...txt(20, 700) }}>{title}</h3>
            <button onClick={onClose} style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: 4
            }}>
              <X size={22} color={C.gray} />
            </button>
          </div>
          <div style={{ padding: '28px' }}>
            {children}
          </div>
          <div style={{
            ...flex('center'), justifyContent: 'flex-end', gap: 12,
            padding: '20px 28px', borderTop: `1px solid ${C.border}`
          }}>
            <button onClick={onClose} style={{
              padding: '10px 24px', borderRadius: 8, border: `1px solid ${C.border}`,
              background: C.white, color: C.navy, fontSize: 14, fontWeight: 500, cursor: 'pointer'
            }}>
              Hủy
            </button>
            <button onClick={onSave} style={{
              padding: '10px 24px', borderRadius: 8, border: 'none',
              background: C.purple, color: C.white, fontSize: 14, fontWeight: 600, cursor: 'pointer'
            }}>
              Lưu thay đổi
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

const InputField = ({ label, value, onChange, placeholder, disabled, type = 'text', textarea, rows = 3, error, errorStyle }) => {
  const inputStyle = {
    width: '100%', padding: '11px 14px', borderRadius: 8,
    border: `1px solid ${error ? C.red : C.border}`, fontSize: 14, color: C.navy,
    outline: 'none', background: disabled ? C.grayBg : C.white,
    cursor: disabled ? 'not-allowed' : 'text', boxSizing: 'border-box'
  };

  return (
    <div style={{ marginBottom: 20 }}>
      <label style={{ ...txt(14, 600), display: 'block', marginBottom: 8 }}>
        {label}
      </label>
      {textarea ? (
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
          disabled={disabled}
        />
        
      ) : (
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          style={inputStyle}
          disabled={disabled}
        />
      )}
      {error && (
        <div style={{ fontSize: 12, color: C.red, marginTop: 4, ...errorStyle }}>
          {error}
        </div>
      )}
      {disabled && (
        <p style={{ ...txt(12, 400, C.gray), marginTop: 4 }}>
          Email không thể chỉnh sửa
        </p>
      )}
    </div>
  );
};

const formatDateDisplay = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export default function ProfilePage() {
  const { updateUser } = useAuth();
  const [editingSection, setEditingSection] = useState(null);
  const [errors, setErrors] = useState({});
  const [profile, setProfile] = useState(() => {
    const sessionUser = JSON.parse(localStorage.getItem("user") || "null");
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const fullUser =
      users.find(u => u.email === sessionUser?.email) ||
      sessionUser ||
      {};

    return {
      name: fullUser.name || "",
      gender: fullUser.gender || "",
      dob: fullUser.birthDate || "",
      email: fullUser.email || "",
      phone: fullUser.phone || "",
      address: fullUser.address || ""
    };
  });
  const [editProfile, setEditProfile] = useState(profile);

  const validate = () => {
    const newErrors = {};

    if (!editProfile.name?.trim()) newErrors.name = "Vui lòng nhập họ và tên";
    else if (editProfile.name.trim().length < 2) newErrors.name = "Họ và tên phải có ít nhất 2 ký tự";
    
    if (!editProfile.gender) newErrors.gender = "Vui lòng chọn giới tính";
    
    if (!editProfile.dob) newErrors.dob = "Vui lòng chọn ngày sinh";
    
    if (!editProfile.phone?.trim()) newErrors.phone = "Vui lòng nhập số điện thoại";
    else if (!/^(0|\+84)[0-9]{9}$/.test(editProfile.phone.trim())) newErrors.phone = "Số điện thoại không hợp lệ";
    
    if (!editProfile.address?.trim()) newErrors.address = "Vui lòng nhập địa chỉ";
    else if (editProfile.address.trim().length < 5) newErrors.address = "Địa chỉ phải có ít nhất 5 ký tự";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const [skills] = useState([
    { name: 'Kỹ năng giao tiếp & chăm sóc khách hàng', level: 90, color: C.purple },
    { name: 'Kỹ năng tin học cơ bản', level: 85, color: C.darkBg },
    { name: 'Kỹ năng bán hàng & thuyết phục', level: 85, color: C.pink },
    { name: 'Kỹ năng quản lý thời gian & kỷ luật cá nhân', level: 70, color: C.gray }
  ]);

  const [experience] = useState([
    {
      title: 'Nhân viên phục vụ',
      company: 'Highlands Coffee',
      period: '06/2023 – 12/2024',
      desc: 'Phục vụ khách hàng, pha chế đồ uống, giữ vệ sinh quán. Được đánh giá cao về thái độ làm việc và kỹ năng giao tiếp.'
    },
    {
      title: 'Gia sư Toán',
      company: 'Freelance',
      period: '01/2023 – 05/2023',
      desc: 'Dạy kèm Toán cho học sinh THPT. Giúp học sinh cải thiện điểm số và tư tin trong môn học.'
    }
  ]);

  const [education] = useState([
    {
      degree: 'Sinh viên năm 3',
      school: 'Đại học Khoa học Tự nhiên',
      period: '2020 – 2024',
      gpa: '3.5/4.0'
    }
  ]);
  const openEdit = (section) => {
    if (section === "profile") {
      setEditProfile(profile);
      setErrors({});
    }
    setEditingSection(section);
  };
  const closeEdit = () => {
    setErrors({});
    setEditingSection(null);
  };
  const saveEdit = () => {
    if (editingSection === "profile") {
      if (!validate()) return;
      setProfile(editProfile);
    }

    const sessionUser = JSON.parse(localStorage.getItem("user"));
    const users = JSON.parse(localStorage.getItem("users")) || [];

    const updatedUsers = users.map((u) => {
      if (u.email === sessionUser.email) {
        return {
          ...u,
          name: editProfile.name,
          gender: editProfile.gender,
          birthDate: editProfile.dob,
          phone: editProfile.phone,
          address: editProfile.address
        };
      }
      return u;
    });

    localStorage.setItem("users", JSON.stringify(updatedUsers));
    const updatedUser = {
      ...sessionUser,
      name: editProfile.name,
      gender: editProfile.gender,
      birthDate: editProfile.dob,
      phone: editProfile.phone,
      address: editProfile.address
    };
    setCurrentUser(updatedUser);
    updateUser(updatedUser); 
    setEditingSection(null);
  };

  const getInitials = (name) => {
    if (!name) return "";
    const parts = name.trim().split(" ");
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <div style={{
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      background: C.grayBg, minHeight: '100vh'
    }}>
      <main style={{ padding: '40px 48px' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ ...txt(32, 700), marginBottom: 8 }}>Hồ sơ cá nhân</h1>
          <p style={{ ...txt(15, 400, C.gray) }}>Quản lý hồ sơ cá nhân của bạn</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>
            <Card>
              <div style={{ ...flex('flex-start'), gap: 24 }}>
                <div style={{ position: 'relative' }}>
                  <div style={{
                    width: 120, height: 120, borderRadius: 16,
                    background: `linear-gradient(135deg, ${C.purple}, #a78bfa)`,
                    ...flex('center'), justifyContent: 'center'
                  }}>
                    <span style={{ ...txt(48, 700, C.white) }}>{getInitials(profile.name)}</span>
                  </div>
                  <button style={{
                    position: 'absolute', bottom: -4, right: -4,
                    width: 36, height: 36, borderRadius: '50%',
                    background: C.navy, border: `3px solid ${C.white}`,
                    cursor: 'pointer', ...flex('center'), justifyContent: 'center'
                  }}>
                    <Camera size={16} color={C.white} />
                  </button>
                </div>

                <div style={{ flex: 1 }}>
                  <h2 style={{ ...txt(26, 700), marginBottom: 6 }}>{profile.name}</h2>
                  <p style={{ ...txt(14, 400, C.gray) }}>
                    Hồ sơ của bạn đã được xác minh và sẵn sàng.
                  </p>
                  <button
                    onClick={() => openEdit('profile')}
                    style={{
                      marginTop: 16, padding: '8px 20px', borderRadius: 20,
                      border: 'none', background: C.purple, color: C.white,
                      fontSize: 14, fontWeight: 600, cursor: 'pointer',
                      ...flex('center'), gap: 6
                    }}
                  >
                    <Edit2 size={14} /> Chỉnh sửa
                  </button>
                </div>
              </div>

              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginTop: 32
              }}>
                {[
                  { icon: User, iconBg: C.blue, label: 'HỌ VÀ TÊN', value: profile.name },
                  { icon: Heart, iconBg: C.pink, label: 'GIỚI TÍNH', value: profile.gender },
                  { icon: Calendar, iconBg: C.purple, label: 'NGÀY SINH', value: formatDateDisplay(profile.dob) },
                  { icon: Phone, iconBg: C.cyan, label: 'SỐ ĐIỆN THOẠI', value: profile.phone },
                  { icon: Mail, iconBg: C.green, label: 'EMAIL', value: profile.email },
                  { icon: MapPin, iconBg: C.orange, label: 'ĐỊA CHỈ', value: profile.address }
                ].map(({ icon: Icon, iconBg, label, value }, i) => (
                  <div key={i} style={{ ...flex('flex-start'), gap: 12 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 10, background: iconBg,
                      ...flex('center'), justifyContent: 'center', flexShrink: 0
                    }}>
                      <Icon size={20} color={C.white} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ ...txt(11, 700, C.grayLight), textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        {label}
                      </p>
                      <p style={{ ...txt(14, 600), marginTop: 4, wordBreak: 'break-word' }}>
                        {value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card style={{ paddingBottom: 20 }}>
              <div style={{ ...flex('center'), justifyContent: 'space-between', marginBottom: 10 }}>
                <h3 style={{ ...txt(20, 700), ...flex('center'), gap: 10 }}>
                  <Award size={22} /> Kỹ năng chuyên môn
                </h3>
                <button
                  onClick={() => openEdit('skills')}
                  style={{
                    padding: '8px 20px', borderRadius: 20, border: 'none',
                    background: C.purple, color: C.white, fontSize: 14, fontWeight: 600,
                    cursor: 'pointer', ...flex('center'), gap: 6
                  }}
                >
                  <Edit2 size={14} /> Chỉnh sửa
                </button>
              </div>
              <p style={{ ...txt(14, 400, C.gray), marginBottom: 24 }}>
                Kỹ năng cần thiết để làm việc part-time
              </p>

              {skills.map((skill, i) => (
                <div key={i} style={{ marginBottom: 24 }}>
                  <div style={{ ...flex('center'), justifyContent: 'space-between', marginBottom: 8 }}>
                    <p style={{ ...txt(14, 600) }}>{skill.name}</p>
                    <span style={{ ...txt(15, 700, skill.color) }}>{skill.level}%</span>
                  </div>
                  <div style={{
                    width: '100%', height: 8, borderRadius: 10, background: C.grayBg, overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${skill.level}%`, height: '100%',
                      background: `linear-gradient(90deg, ${skill.color}, ${skill.color}cc)`,
                      transition: 'width 0.5s ease'
                    }} />
                  </div>
                </div>
              ))}
            </Card>

            <Card style={{ paddingBottom: 0 }}>
              <div style={{ ...flex('center'), justifyContent: 'space-between', marginBottom: 24 }}>
                <h3 style={{ ...txt(20, 700), ...flex('center'), gap: 10 }}>
                  <Briefcase size={22} /> Kinh nghiệm làm việc
                </h3>
                <button
                  onClick={() => openEdit('experience')}
                  style={{
                    padding: '8px 20px', borderRadius: 20, border: 'none',
                    background: C.purple, color: C.white, fontSize: 14, fontWeight: 600,
                    cursor: 'pointer', ...flex('center'), gap: 6
                  }}
                >
                  <Edit2 size={14} /> Chỉnh sửa
                </button>
              </div>

              {experience.map((exp, i) => (
                <div
                  key={i}
                  style={{
                    paddingBottom: 24, marginTop: 24,
                    borderBottom: i < experience.length - 1 ? `1px solid ${C.border}` : 'none'
                  }}
                >
                  <div style={{ ...flex('flex-start'), gap: 8, marginBottom: 8 }}>
                    <div style={{
                      width: 10, height: 10, borderRadius: '50%', background: C.green,
                      marginTop: 5, flexShrink: 0
                    }} />
                    <div style={{ flex: 1 }}>
                      <h4 style={{ ...txt(16, 700), marginBottom: 4 }}>{exp.title}</h4>
                      <p style={{ ...txt(14, 600, C.green), marginBottom: 4 }}>{exp.company}</p>
                      <p style={{ ...txt(13, 400, C.gray), marginBottom: 8 }}>{exp.period}</p>
                      <p style={{ ...txt(14, 400, C.gray), lineHeight: 1.6 }}>{exp.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </Card>

            <Card>
              <div style={{ ...flex('center'), justifyContent: 'space-between', marginBottom: 24 }}>
                <h3 style={{ ...txt(20, 700), ...flex('center'), gap: 10 }}>
                  <GraduationCap size={22} /> Học vấn
                </h3>
                <button
                  onClick={() => openEdit('education')}
                  style={{
                    padding: '8px 20px', borderRadius: 20, border: 'none',
                    background: C.purple, color: C.white, fontSize: 14, fontWeight: 600,
                    cursor: 'pointer', ...flex('center'), gap: 6
                  }}
                >
                  <Edit2 size={14} /> Chỉnh sửa
                </button>
              </div>

              {education.map((edu, i) => (
                <div key={i} style={{ ...flex('flex-start'), gap: 12 }}>
                  <div style={{
                    width: 10, height: 10, borderRadius: '50%', background: C.green,
                    marginTop: 5, flexShrink: 0
                  }} />
                  <div style={{ flex: 1 }}>
                    <h4 style={{ ...txt(16, 700), marginBottom: 4 }}>{edu.degree}</h4>
                    <p style={{ ...txt(14, 600, C.teal), marginBottom: 4 }}>{edu.school}</p>
                    <p style={{ ...txt(13, 400, C.gray), marginBottom: 8 }}>{edu.period}</p>
                    <span style={{
                      display: 'inline-block', padding: '6px 14px', borderRadius: 20,
                      background: C.green, color: C.white, fontSize: 13, fontWeight: 600
                    }}>
                      GPA: {edu.gpa}
                    </span>
                  </div>
                </div>
              ))}
            </Card>
        </div>
      </main>

      <Modal
        open={editingSection === 'profile'}
        onClose={closeEdit}
        title="Chỉnh sửa hồ sơ cá nhân"
        onSave={saveEdit}
      >
        <InputField
          label="Họ và tên"
          value={editProfile.name}
          onChange={v => {
            setEditProfile({ ...editProfile, name: v });
            setErrors({ ...errors, name: "" });
          }}
          placeholder="Nhập họ và tên"
          error={errors.name}
        />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div style={{ marginBottom: 20 }}>
            <label style={{ ...txt(14, 600), display: 'block', marginBottom: 8 }}>Giới tính</label>
            <select
              value={editProfile.gender || ""}
              onChange={e => {
                setEditProfile({ ...editProfile, gender: e.target.value });
                setErrors({ ...errors, gender: "" });
              }}
              style={{
                width: '100%', padding: '11px 14px', borderRadius: 8,
                border: `1px solid ${errors.gender ? C.red : C.border}`, fontSize: 14, outline: 'none', appearance: 'none',
                background: `${C.white} url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2364748b' d='M6 9L1 4h10z'/%3E%3C/svg%3E") no-repeat right 14px center`
              }}
            >
              <option value="">Chọn giới tính</option>
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
              <option value="Khác">Khác</option>
            </select>
            {errors.gender && (
              <div style={{ fontSize: 12, color: C.red, marginTop: 4 }}>
                {errors.gender}
              </div>
            )}
          </div>
        <InputField
          label="Ngày sinh"
          type="date"
          style={{ fontSize: 0 }}
          value={editProfile.dob}
          onChange={v => {
            setEditProfile({ ...editProfile, dob: v });
            setErrors({ ...errors, dob: "" });
          }}
          error={errors.dob}
        />
        </div>
        <InputField
          label="Email"
          value={profile.email}
          onChange={v => setProfile({ ...profile, email: v })}
          disabled
        />
        <InputField
          label="Số điện thoại"
          value={editProfile.phone}
          onChange={v => {
            setEditProfile({ ...editProfile, phone: v });
            setErrors({ ...errors, phone: "" });
          }}
          placeholder="Nhập số điện thoại"
          error={errors.phone}
        />
        <InputField
          label="Địa chỉ"
          value={editProfile.address}
          onChange={v => {
            setEditProfile({ ...editProfile, address: v });
            setErrors({ ...errors, address: "" });
          }}
          placeholder="Nhập địa chỉ"
          textarea
          rows={2}
          error={errors.address}
          errorStyle={{ marginTop: -2 }}
        />
      </Modal>

      <Modal
        open={editingSection === 'skills'}
        onClose={closeEdit}
        title="Chỉnh sửa kỹ năng chuyên môn"
        onSave={saveEdit}
      >
        <p style={{ ...txt(14, 400, C.gray), marginBottom: 20 }}>
          Đánh giá mức độ thành thạo kỹ năng của bạn từ 0-100%
        </p>
        {skills.map((skill, i) => (
          <div key={i} style={{ marginBottom: 24 }}>
            <label style={{ ...txt(14, 600), display: 'block', marginBottom: 8 }}>
              {skill.name}
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={skill.level}
              style={{ width: '100%', accentColor: skill.color }}
            />
            <div style={{ ...flex('center'), justifyContent: 'space-between', marginTop: 6 }}>
              <span style={{ ...txt(13, 400, C.gray) }}>0%</span>
              <span style={{ ...txt(14, 700, skill.color) }}>{skill.level}%</span>
              <span style={{ ...txt(13, 400, C.gray) }}>100%</span>
            </div>
          </div>
        ))}
      </Modal>

      <Modal
        open={editingSection === 'experience'}
        onClose={closeEdit}
        title="Chỉnh sửa kinh nghiệm làm việc"
        onSave={saveEdit}
      >
        {experience.map((exp, i) => (
          <div
            key={i}
            style={{
              marginBottom: 24,
              borderBottom: i < experience.length - 1 ? `1px solid ${C.border}` : 'none'
            }}
          >
            <h4 style={{ ...txt(15, 700, C.gray), marginBottom: 16 }}>Kinh nghiệm {i + 1}</h4>
            <InputField label="Vị trí" value={exp.title} onChange={() => {}} placeholder="Nhập vị trí" />
            <InputField label="Công ty" value={exp.company} onChange={() => {}} placeholder="Nhập tên công ty" />
            <InputField label="Thời gian" value={exp.period} onChange={() => {}} placeholder="VD: 01/2023 - 05/2023" />
            <InputField
              label="Mô tả công việc"
              value={exp.desc}
              onChange={() => {}}
              placeholder="Mô tả công việc của bạn"
              textarea
              rows={3}
            />
          </div>
        ))}
        <button style={{
          padding: '10px 20px', borderRadius: 8, border: `1px dashed ${C.border}`,
          background: C.white, color: C.purple, fontSize: 14, fontWeight: 600,
          cursor: 'pointer', width: '100%'
        }}>
          + Thêm kinh nghiệm
        </button>
      </Modal>

      <Modal
        open={editingSection === 'education'}
        onClose={closeEdit}
        title="Chỉnh sửa học vấn"
        onSave={saveEdit}
      >
        {education.map((edu, i) => (
          <div key={i} style={{ marginBottom: 24 }}>
            <h4 style={{ ...txt(15, 700, C.gray), marginBottom: 16 }}>Học vấn {i + 1}</h4>
            <InputField label="Bằng cấp" value={edu.degree} onChange={() => {}} placeholder="VD: Sinh viên năm 3" />
            <InputField label="Trường học" value={edu.school} onChange={() => {}} placeholder="Nhập tên trường" />
            <InputField label="Thời gian" value={edu.period} onChange={() => {}} placeholder="VD: 2020 - 2024" />
            <InputField label="GPA" value={edu.gpa} onChange={() => {}} placeholder="VD: 3.5/4.0" />
          </div>
        ))}
        <button style={{
          padding: '10px 20px', borderRadius: 8, border: `1px dashed ${C.border}`,
          background: C.white, color: C.purple, fontSize: 14, fontWeight: 600,
          cursor: 'pointer', width: '100%'
        }}>
          + Thêm học vấn
        </button>
      </Modal>
    </div>
  );
}