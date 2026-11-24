import { useState, useEffect, useCallback } from 'react';
import { Building2, Layers, Users, Mail, Globe, MapPin, CheckCircle2, ShieldAlert, FileText, AlertCircle } from 'lucide-react';
import { COLORS, TILE_GRADIENTS } from '../../constants/colors';
import { flex, txt } from '../../utils/styles';
import { getCurrentUser, refreshSession, updateEmployerProfile } from '../../services/authService';
import PageHeader from '../../components/PageHeader';
import {
  MessageBanner, ProfileCard, TileGrid, InfoTile, EmailText, ProfileModal, FormField, FormSelect, FormSection,
  SectionHeading
} from '../../components/ProfileKit';

const C = COLORS;

const INDUSTRIES = ['F&B', 'Bán lẻ', 'Công nghệ', 'Giáo dục', 'Y tế', 'Du lịch', 'Khác'];
const COMPANY_SIZES = [
  '1-50 nhân viên', '51-200 nhân viên', '201-500 nhân viên',
  '501-1000 nhân viên', '1000 - 5000 nhân viên', '5000+ nhân viên'
];

// Giá trị đang lưu nhưng không có trong danh sách vẫn được giữ lại trong ô chọn
const toOptions = (list, current) =>
  [...(current && !list.includes(current) ? [current] : []), ...list].map(v => ({ value: v, label: v }));

// Hồ sơ BE ↔ form trên giao diện
const toCompany = (emp) => ({
  name: emp?.emp_name || '',
  industry: emp?.field || '',
  size: emp?.scope || '',
  website: emp?.website || '',
  email: emp?.email || '',
  address: emp?.address || '',
  description: emp?.description || ''
});

const initials = (name) =>
  (name || '?').trim().split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase();

export default function CompanyProfile() {
  const [user, setUser] = useState(getCurrentUser);
  const [form, setForm] = useState(() => toCompany(getCurrentUser()));
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    refreshSession()
      .then(fresh => {
        if (fresh) {
          setUser(fresh);
          setForm(toCompany(fresh));
        }
      })
      .catch(err => setMessage({ type: 'error', text: `Không tải được hồ sơ: ${err.message}` }));
  }, []);

  // Thông tin hiển thị luôn lấy từ dữ liệu đã lưu, không lấy từ bản nháp trong form
  const view = toCompany(user);
  const verified = !!user?.is_verified;
  const set = (field) => (value) => setForm(f => ({ ...f, [field]: value }));

  const fields = [
    { icon: Building2, label: 'Tên công ty', value: view.name },
    { icon: Layers, label: 'Ngành nghề', value: view.industry },
    { icon: Users, label: 'Quy mô', value: view.size },
    { icon: Globe, label: 'Website', value: view.website },
    { icon: Mail, label: 'Email', value: view.email && <EmailText email={view.email} /> },
    { icon: MapPin, label: 'Địa chỉ', value: view.address }
  ].map((f, i) => ({ ...f, gradient: TILE_GRADIENTS[i] }));

  const openEdit = () => {
    setMessage(null);
    setForm(toCompany(user));
    setEditing(true);
  };
  const closeEdit = () => setEditing(false);
  const clearMessage = useCallback(() => setMessage(null), []);

  const saveEdit = async () => {
    if (!form.name.trim() || !form.address.trim()) {
      setMessage({ type: 'error', text: 'Tên công ty và địa chỉ không được để trống' });
      return;
    }
    if (form.website && !/^https?:\/\//i.test(form.website.trim())) {
      setMessage({ type: 'error', text: 'Website phải bắt đầu bằng http:// hoặc https://' });
      return;
    }
    setSaving(true);
    try {
      const fresh = await updateEmployerProfile({
        emp_name: form.name.trim(),
        field: form.industry,
        scope: form.size,
        website: form.website.trim(),
        address: form.address.trim(),
        description: form.description.trim()
      });
      setUser(fresh);
      setForm(toCompany(fresh));
      setMessage({ type: 'success', text: 'Đã lưu thông tin công ty' });
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
        <PageHeader title="Hồ sơ công ty" subtitle="Thông tin hiển thị với ứng viên trên trang công ty" />

        {!editing && <MessageBanner message={message} onClose={clearMessage} />}

        <ProfileCard
          initials={initials(view.name)}
          name={view.name || 'Công ty'}
          verified={verified}
          badges={[
            { icon: Building2, label: 'Nhà tuyển dụng', tone: 'purple' },
            verified
              ? { icon: CheckCircle2, label: 'Doanh nghiệp đã xác thực', tone: 'green' }
              : { icon: ShieldAlert, label: 'Doanh nghiệp chưa xác thực', tone: 'orange' }
          ]}
          editLabel="Sửa thông tin"
          onEdit={openEdit}
        >
          <SectionHeading icon={Building2}>Thông tin doanh nghiệp</SectionHeading>
          <TileGrid>
            {fields.map(f => <InfoTile key={f.label} {...f} />)}
          </TileGrid>

          {/* Mô tả công ty: vẫn trong thẻ chính, tiêu đề nằm ngoài khung nội dung */}
          <div style={{ marginTop: 28 }}>
            <SectionHeading icon={FileText}>Mô tả công ty</SectionHeading>
            <div style={{ padding: '16px 20px', borderRadius: 14, background: C.grayBg, borderLeft: `4px solid ${C.purple}` }}>
              <p style={{
                ...txt(15, 400, view.description ? C.darkGray : C.grayLight),
                lineHeight: 1.7, whiteSpace: 'pre-line'
              }}>
                {view.description || 'Chưa có mô tả. Bấm "Sửa thông tin" để giới thiệu công ty với ứng viên.'}
              </p>
            </div>
          </div>
        </ProfileCard>
      </main>

      <ProfileModal
        open={editing}
        onClose={closeEdit}
        title="Chỉnh sửa thông tin công ty"
        onSave={saveEdit}
        saving={saving}
        maxWidth={640}
      >
        {message?.type === 'error' && (
          <div style={{
            ...flex('center'), gap: 8, padding: '12px 14px', borderRadius: 12,
            background: C.redBg, border: '1px solid #fbcaca', ...txt(14, 500, C.red)
          }}>
            <AlertCircle size={16} /> {message.text}
          </div>
        )}
        <FormSection icon={Building2} title="Thông tin cơ bản">
          <FormField label="Tên công ty" value={form.name} onChange={set('name')} placeholder="Nhập tên công ty" required full />
          <FormSelect
            label="Ngành nghề" value={form.industry} onChange={set('industry')}
            options={toOptions(INDUSTRIES, form.industry)} placeholder="Chọn ngành nghề" required
          />
          <FormSelect
            label="Quy mô" value={form.size} onChange={set('size')}
            options={toOptions(COMPANY_SIZES, form.size)} placeholder="Chọn quy mô" required
          />
        </FormSection>
        <FormSection icon={MapPin} title="Liên hệ & địa chỉ">
          <FormField label="Email" value={form.email} onChange={set('email')} disabled />
          <FormField label="Website" value={form.website} onChange={set('website')} placeholder="https://" />
          <FormField label="Địa chỉ" value={form.address} onChange={set('address')} placeholder="Nhập địa chỉ công ty" required full />
        </FormSection>
        <FormSection icon={FileText} title="Giới thiệu" cols={1}>
          <FormField
            label="Mô tả công ty" value={form.description} onChange={set('description')}
            placeholder="Giới thiệu về công ty của bạn" textarea rows={4} required
          />
        </FormSection>
      </ProfileModal>
    </div>
  );
}
