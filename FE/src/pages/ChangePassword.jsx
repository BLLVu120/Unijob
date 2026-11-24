import { useState, useCallback } from 'react';
import { Eye, EyeOff, Lock, KeyRound, ShieldCheck, Check, X, Lightbulb, RotateCcw } from 'lucide-react';
import { COLORS, SHADOW } from '../constants/colors';
import { flex, txt, card } from '../utils/styles';
import { changePassword } from '../services/authService';
import PageHeader from '../components/PageHeader';
import Toast from '../components/Toast';
import PasswordStrength from '../components/PasswordStrength';
import { PASSWORD_RULES, getPasswordStrength, firstFailedRule } from '../utils/password';

const C = COLORS;


const TIPS = [
  'Không sử dụng mật khẩu đã dùng trước đó',
  'Không chia sẻ mật khẩu với bất kỳ ai',
  'Sử dụng mật khẩu khác nhau cho các tài khoản',
  'Đổi mật khẩu định kỳ 3-6 tháng'
];

const PasswordField = ({ label, value, onChange, placeholder, state, hint }) => {
  const [show, setShow] = useState(false);
  const borderColor = state === 'error' ? C.red : state === 'ok' ? C.green : C.border;

  return (
    <div>
      <label style={{ ...txt(14, 600), display: 'block', marginBottom: 8 }}>{label}</label>
      <div style={{ position: 'relative' }}>
        <Lock size={17} color={C.grayLight} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          style={{
            width: '100%', height: 46, padding: '0 46px 0 42px', borderRadius: 12,
            border: `1px solid ${borderColor}`, fontSize: 14, color: C.navy,
            outline: 'none', background: C.white, boxSizing: 'border-box'
          }}
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          title={show ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
          style={{
            position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
            width: 32, height: 32, borderRadius: 8, background: 'none', border: 'none', cursor: 'pointer',
            ...flex('center'), justifyContent: 'center'
          }}
        >
          {/* Đang ẩn mật khẩu → mắt gạch chéo; đang hiện → mắt mở */}
          {show ? <Eye size={18} color={C.gray} /> : <EyeOff size={18} color={C.gray} />}
        </button>
      </div>
      {hint}
    </div>
  );
};

// Tiêu đề thẻ: icon trong ô tím nhạt + tiêu đề + mô tả
const CardTitle = ({ icon, title, subtitle }) => {
  const Icon = icon;
  return (
    <div style={{ ...flex('center'), gap: 12, marginBottom: 22 }}>
      <span style={{
        width: 42, height: 42, borderRadius: 12, background: C.blueLight, flexShrink: 0,
        ...flex('center'), justifyContent: 'center'
      }}>
        <Icon size={20} color={C.purple} />
      </span>
      <div>
        <h2 style={{ ...txt(18, 700) }}>{title}</h2>
        {subtitle && <p style={{ ...txt(13, 400, C.gray), marginTop: 2 }}>{subtitle}</p>}
      </div>
    </div>
  );
};

export default function ChangePassword() {
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const clearMessage = useCallback(() => setMessage(null), []);

  const { passed } = getPasswordStrength(passwords.new);
  const confirmState = !passwords.confirm ? null : passwords.confirm === passwords.new ? 'ok' : 'error';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (!passwords.current) {
      setMessage({ type: 'error', text: 'Vui lòng nhập mật khẩu hiện tại' });
      return;
    }
    const failed = firstFailedRule(passwords.new);
    if (failed) {
      setMessage({ type: 'error', text: `Mật khẩu mới chưa đạt yêu cầu: ${failed.text.toLowerCase()}` });
      return;
    }
    if (passwords.new !== passwords.confirm) {
      setMessage({ type: 'error', text: 'Xác nhận mật khẩu không khớp' });
      return;
    }
    if (passwords.new === passwords.current) {
      setMessage({ type: 'error', text: 'Mật khẩu mới phải khác mật khẩu hiện tại' });
      return;
    }

    setLoading(true);
    try {
      await changePassword(passwords.current, passwords.new);
      setPasswords({ current: '', new: '', confirm: '' });
      setMessage({ type: 'success', text: 'Đổi mật khẩu thành công' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setPasswords({ current: '', new: '', confirm: '' });
    setMessage(null);
  };

  return (
    <div style={{
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      background: C.grayBg, minHeight: '100vh'
    }}>
      <main style={{ padding: '40px 48px' }}>
        <PageHeader title="Đổi mật khẩu" subtitle="Cập nhật mật khẩu của bạn để bảo mật tài khoản" />
        <Toast message={message} onClose={clearMessage} />

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 400px', gap: 24, alignItems: 'start' }}>
          {/* ── Form đổi mật khẩu ── */}
          <form onSubmit={handleSubmit} style={{ ...card(), padding: 28 }}>
            <CardTitle icon={KeyRound} title="Thông tin mật khẩu" subtitle="Nhập mật khẩu hiện tại và mật khẩu mới" />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <PasswordField
                label="Mật khẩu hiện tại"
                value={passwords.current}
                onChange={v => setPasswords({ ...passwords, current: v })}
                placeholder="Nhập mật khẩu hiện tại"
              />

              <div style={{ height: 1, background: C.border }} />

              <PasswordField
                label="Mật khẩu mới"
                value={passwords.new}
                onChange={v => setPasswords({ ...passwords, new: v })}
                placeholder="Nhập mật khẩu mới"
                hint={<PasswordStrength password={passwords.new} style={{ marginTop: 10 }} />}
              />

              <PasswordField
                label="Xác nhận mật khẩu mới"
                value={passwords.confirm}
                onChange={v => setPasswords({ ...passwords, confirm: v })}
                placeholder="Nhập lại mật khẩu mới"
                state={confirmState}
                hint={confirmState && (
                  <p style={{ ...txt(12, 500, confirmState === 'ok' ? C.green : C.red), marginTop: 8, ...flex('center'), gap: 5 }}>
                    {confirmState === 'ok' ? <Check size={14} /> : <X size={14} />}
                    {confirmState === 'ok' ? 'Mật khẩu khớp' : 'Mật khẩu chưa khớp'}
                  </p>
                )}
              />
            </div>

            <div style={{ ...flex('center'), justifyContent: 'flex-end', gap: 10, marginTop: 28, paddingTop: 20, borderTop: `1px solid ${C.border}` }}>
              <button
                type="button"
                onClick={handleReset}
                style={{
                  height: 44, padding: '0 20px', borderRadius: 12, border: `1px solid ${C.border}`,
                  background: C.white, color: C.navy, fontSize: 14, fontWeight: 600, cursor: 'pointer',
                  ...flex('center'), gap: 8
                }}
              >
                <RotateCcw size={16} /> Nhập lại
              </button>
              <button
                type="submit"
                disabled={loading}
                style={{
                  height: 44, padding: '0 22px', borderRadius: 12, border: 'none',
                  background: C.purple, color: C.white, fontSize: 14, fontWeight: 600,
                  cursor: loading ? 'wait' : 'pointer', opacity: loading ? 0.7 : 1,
                  boxShadow: SHADOW.primary, ...flex('center'), gap: 8
                }}
              >
                <ShieldCheck size={16} /> {loading ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
              </button>
            </div>
          </form>

          {/* ── Cột phải: yêu cầu (tự đánh dấu khi gõ) + mẹo ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, position: 'sticky', top: 88 }}>
            <div style={{ ...card(), padding: 28 }}>
              <CardTitle icon={ShieldCheck} title="Yêu cầu mật khẩu" subtitle={`Đã đạt ${passed}/${PASSWORD_RULES.length} yêu cầu`} />
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {PASSWORD_RULES.map(rule => {
                  const ok = rule.test(passwords.new);
                  return (
                    <li key={rule.text} style={{ ...flex('center'), gap: 10, ...txt(14, 400, ok ? C.green : C.darkGray), lineHeight: 1.5, transition: 'color .2s ease' }}>
                      <span style={{
                        width: 20, height: 20, borderRadius: '50%', flexShrink: 0, transition: 'all .2s ease',
                        background: ok ? C.green : C.grayBg, border: ok ? 'none' : `1px solid ${C.border}`,
                        ...flex('center'), justifyContent: 'center'
                      }}>
                        {ok && <Check size={12} color={C.white} strokeWidth={3} />}
                      </span>
                      {rule.text}
                    </li>
                  );
                })}
              </ul>
            </div>

            <div style={{
              ...card(), padding: 28, border: '1px solid #fde68a',
              background: 'linear-gradient(160deg, #fffbeb 0%, #ffffff 100%)'
            }}>
              <div style={{ ...flex('center'), gap: 12, marginBottom: 22 }}>
                <span style={{
                  width: 42, height: 42, borderRadius: 12, background: C.amberBg, flexShrink: 0,
                  ...flex('center'), justifyContent: 'center'
                }}>
                  <Lightbulb size={20} color={C.amberDark} />
                </span>
                <h2 style={{ ...txt(18, 700) }}>Mẹo bảo mật</h2>
              </div>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {TIPS.map(tip => (
                  <li key={tip} style={{ ...flex('flex-start'), gap: 10, ...txt(14, 400, C.darkGray), lineHeight: 1.5 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.amber, flexShrink: 0, marginTop: 8 }} />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
