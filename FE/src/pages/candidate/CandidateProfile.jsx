import { useState, useEffect, useCallback } from 'react';
import { getCurrentUser, refreshSession, updateCandidateProfile } from '../../services/authService';
import { User, Calendar, Mail, Phone, MapPin, Heart, ShieldAlert, CheckCircle2, AlertCircle } from 'lucide-react';
import { COLORS, TILE_GRADIENTS } from '../../constants/colors';
import { flex, txt } from '../../utils/styles';
import PageHeader from '../../components/PageHeader';
import {
  MessageBanner, ProfileCard, TileGrid, InfoTile, EmailText, ProfileModal, FormField, FormSelect, FormSection,
  SectionHeading
} from '../../components/ProfileKit';

const C = COLORS;

// BE lưu giới tính dạng male/female/other
const GENDER_LABELS = { male: 'Nam', female: 'Nữ', other: 'Khác' };
const GENDER_OPTIONS = Object.entries(GENDER_LABELS).map(([value, label]) => ({ value, label }));

const toProfile = (user) => ({
  name: user?.full_name || user?.name || '',
  gender: user?.gender || '',
  dob: user?.dob ? String(user.dob).slice(0, 10) : '',
  email: user?.email || '',
  phone: user?.phone_number || '',
  address: user?.address || ''
});

const initials = (name) =>
  (name || '?').trim().split(/\s+/).slice(-2).map(w => w[0]).join('').toUpperCase();

export default function CandidateProfile() {
  const [editing, setEditing] = useState(false);
  const [user, setUser] = useState(getCurrentUser);
  const [profile, setProfile] = useState(() => toProfile(getCurrentUser()));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  // Lấy hồ sơ mới nhất từ BE khi mở trang
  useEffect(() => {
    refreshSession()
      .then(fresh => {
        if (fresh) {
          setUser(fresh);
          setProfile(toProfile(fresh));
        }
      })
      .catch(err => setMessage({ type: 'error', text: `Không tải được hồ sơ: ${err.message}` }));
  }, []);

  // Hồ sơ đang hiển thị luôn lấy từ user đã lưu, không lấy từ bản nháp trong form
  const view = toProfile(user);
  const verified = !!user?.is_verified;
  const set = (field) => (value) => setProfile(p => ({ ...p, [field]: value }));

  const fields = [
    { icon: User, label: 'Họ và tên', value: view.name },
    { icon: Heart, label: 'Giới tính', value: GENDER_LABELS[view.gender] || view.gender },
    { icon: Calendar, label: 'Ngày sinh', value: view.dob ? new Date(view.dob).toLocaleDateString('vi-VN') : '' },
    { icon: Phone, label: 'Số điện thoại', value: view.phone },
    { icon: Mail, label: 'Email', value: view.email && <EmailText email={view.email} /> },
    { icon: MapPin, label: 'Địa chỉ', value: view.address }
  ].map((f, i) => ({ ...f, gradient: TILE_GRADIENTS[i] }));

  const openEdit = () => {
    setMessage(null);
    setProfile(toProfile(user));
    setEditing(true);
  };
  const closeEdit = () => setEditing(false);
  const clearMessage = useCallback(() => setMessage(null), []);

  const saveEdit = async () => {
    if (profile.phone && !/^\d{9,11}$/.test(profile.phone.replace(/\s/g, ''))) {
      setMessage({ type: 'error', text: 'Số điện thoại không hợp lệ' });
      return;
    }
    setSaving(true);
    try {
      const fresh = await updateCandidateProfile({
        gender: profile.gender,
        dob: profile.dob,
        phone_number: profile.phone.replace(/\s/g, ''),
        address: profile.address.trim()
      });
      setUser(fresh);
      setProfile(toProfile(fresh));
      setMessage({ type: 'success', text: 'Đã cập nhật hồ sơ' });
      closeEdit();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      background: C.grayBg, minHeight: '100vh'
    }}>
      <main style={{ padding: '40px 48px' }}>
        <PageHeader title="Hồ sơ cá nhân" subtitle="Thông tin này được nhà tuyển dụng xem khi bạn ứng tuyển" />

        {!editing && <MessageBanner message={message} onClose={clearMessage} />}

        <ProfileCard
          initials={initials(view.name)}
          name={view.name || 'Ứng viên'}
          verified={verified}
          badges={[
            { icon: User, label: 'Ứng viên', tone: 'purple' },
            verified
              ? { icon: CheckCircle2, label: 'Email đã xác thực', tone: 'green' }
              : { icon: ShieldAlert, label: 'Email chưa xác thực', tone: 'orange' }
          ]}
          onEdit={openEdit}
        >
          <SectionHeading icon={User}>Thông tin cá nhân</SectionHeading>
          <TileGrid>
            {fields.map(f => <InfoTile key={f.label} {...f} />)}
          </TileGrid>
        </ProfileCard>
      </main>

      <ProfileModal
        open={editing}
        onClose={closeEdit}
        title="Chỉnh sửa hồ sơ cá nhân"
        onSave={saveEdit}
        saving={saving}
      >
        {message?.type === 'error' && (
          <div style={{
            ...flex('center'), gap: 8, padding: '12px 14px', borderRadius: 12,
            background: C.redBg, border: '1px solid #fbcaca', ...txt(14, 500, C.red)
          }}>
            <AlertCircle size={16} /> {message.text}
          </div>
        )}
        <FormSection icon={User} title="Thông tin cá nhân">
          <FormField label="Họ và tên" value={profile.name} onChange={set('name')} disabled full />
          <FormSelect
            label="Giới tính" value={profile.gender} onChange={set('gender')}
            options={GENDER_OPTIONS} placeholder="Chọn giới tính"
          />
          <FormField label="Ngày sinh" type="date" value={profile.dob} onChange={set('dob')} />
        </FormSection>
        <FormSection icon={Phone} title="Liên hệ & địa chỉ">
          <FormField label="Email" value={profile.email} onChange={set('email')} disabled />
          <FormField label="Số điện thoại" value={profile.phone} onChange={set('phone')} placeholder="Nhập số điện thoại" />
          <FormField
            label="Địa chỉ" value={profile.address} onChange={set('address')}
            placeholder="Nhập địa chỉ" textarea rows={2} full
          />
        </FormSection>
      </ProfileModal>
    </div>
  );
}
