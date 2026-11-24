import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText, MessageSquare, Search, Eye, MessageCircle, Briefcase, MapPin, GraduationCap, Download, X, Check, Clock, AlertCircle, Info, Calendar, BadgeCheck, Building2, Users, CheckCircle, Star, Send, Wallet
} from 'lucide-react';
import { flex, txt, card, field } from '../../utils/styles';
import { COLORS, SHADOW, GRADIENT, TILE_GRADIENTS } from '../../constants/colors';
import { getCurrentUser, getAllEmployers } from '../../services/authService';
import { applicationService, APPLICATION_STATUS } from '../../services/applicationService';
import { jobService, attachEmployers } from '../../services/jobService';
import { interviewService } from '../../services/interviewService';
import {
  formatSalary, formatExperience, timeAgo, jobIcon, normalize, cvLink
} from '../../utils/jobFormat';
import PageHeader from '../../components/PageHeader';
import StateBox from '../../components/StateBox';
import { formatDate, formatDateTime } from '../../utils/textUtils';
import Stars from '../../components/Stars';
import { feedbackService } from '../../services/feedbackService';
import { InfoTile } from '../../components/ProfileKit';
const C = COLORS;

// Gom trạng thái BE thành 3 nhóm đang dùng trên giao diện
const STATUS_GROUP = {
  submitted: 'pending', screening: 'pending', interview: 'pending',
  recruited: 'accepted',
  rejected: 'rejected', withdrawn: 'rejected'
};

const GROUP_STYLE = {
  pending: { bg: C.yellowBg, text: C.amber },
  accepted: { bg: C.greenBg, text: C.green },
  rejected: { bg: C.redBg, text: C.red }
};

const FILTER_TABS = [
  { id: 'all', label: 'Tất cả' },
  { id: 'pending', label: 'Đang chờ' },
  { id: 'accepted', label: 'Đã chấp nhận' },
  { id: 'rejected', label: 'Đã từ chối' }
];


const EMPLOYER_NOTE = {
  pending: 'Nhà tuyển dụng đang xem xét hồ sơ của bạn. Kết quả sẽ được cập nhật tại đây.',
  accepted: 'Chúc mừng! Bạn đã được nhận vào vị trí này. Nhà tuyển dụng sẽ liên hệ với bạn về các bước tiếp theo.',
  rejected: 'Rất tiếc, hồ sơ của bạn chưa phù hợp với vị trí này. Chúc bạn sớm tìm được công việc phù hợp.'
};

// Dựng tiến trình ứng tuyển từ trạng thái + lịch phỏng vấn
const buildTimeline = (app) => {
  const steps = [{
    title: 'Nộp hồ sơ',
    date: formatDateTime(app.created_at),
    description: 'Hồ sơ của bạn đã được gửi thành công'
  }];
  if (['screening', 'interview', 'recruited', 'rejected'].includes(app.status)) {
    steps.push({ title: 'Đang xem xét', date: '', description: 'Nhà tuyển dụng đã xem hồ sơ của bạn' });
  }
  if (app.interview) {
    steps.push({
      title: 'Lịch phỏng vấn',
      date: formatDateTime(app.interview.time),
      description: app.interview.duration ? `Thời lượng dự kiến ${app.interview.duration} phút` : 'Nhà tuyển dụng đã hẹn lịch phỏng vấn'
    });
  }
  if (app.status === 'recruited') {
    steps.push({ title: 'Hồ sơ của bạn đã được chấp nhận', date: formatDateTime(app.updated_at), description: 'Xin chúc mừng! Một công việc mới đang chào đón bạn ở phía trước' });
  } else if (app.status === 'rejected') {
    steps.push({ title: 'Hồ sơ chưa phù hợp', date: formatDateTime(app.updated_at), description: 'Nhà tuyển dụng đã từ chối hồ sơ này', failed: true });
  } else if (app.status === 'withdrawn') {
    steps.push({ title: 'Đã rút hồ sơ', date: formatDateTime(app.updated_at), description: 'Bạn đã rút hồ sơ ứng tuyển', failed: true });
  }
  return steps;
};

// Thẻ bọc từng phần trong hộp thoại chi tiết
const SECTION_CARD = {
  background: C.white, border: `1px solid ${C.border}`, borderRadius: 16,
  padding: '20px 22px', boxShadow: '0 1px 3px rgba(15, 23, 42, 0.06)', marginBottom: 32
};

const RATING_LABELS = ['', 'Rất tệ', 'Chưa tốt', 'Bình thường', 'Tốt', 'Tuyệt vời'];

// Đánh giá nhà tuyển dụng — chỉ hiện với hồ sơ đã được nhận (BE cũng kiểm tra điều kiện này)
const FeedbackSection = ({ app }) => {
  const candidateId = getCurrentUser()?.candidate_id;
  const [existing, setExisting] = useState(undefined); // undefined: đang tải, null: chưa đánh giá
  const [rate, setRate] = useState(0);
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    feedbackService.getByEmployer(app.employerId)
      .then(list => {
        if (cancelled) return;
        setExisting(list.find(f => f.job_id === app.job_id && f.candidate_id === candidateId) || null);
      })
      .catch(() => !cancelled && setExisting(null));
    return () => { cancelled = true; };
  }, [app.employerId, app.job_id, candidateId]);

  const submit = async () => {
    if (!rate || busy) return;
    setBusy(true);
    setError('');
    try {
      await feedbackService.addFeedback({
        job_id: app.job_id,
        employer_id: app.employerId,
        candidate_id: candidateId,
        rate,
        comment: comment.trim() || null
      });
      setExisting({ rate, comment: comment.trim(), created_at: new Date().toISOString() });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ marginTop: 28 }}>
      <h3 style={{ ...txt(18, 700), marginBottom: 12, ...flex('center'), gap: 10 }}>
        <span style={{ width: 34, height: 34, borderRadius: 10, background: C.blueLight, ...flex('center'), justifyContent: 'center' }}>
          <Star size={17} color={C.purple} />
        </span>
        Đánh giá nhà tuyển dụng
      </h3>

      {existing === undefined ? (
        <div style={{ ...card(), padding: '16px 18px', ...txt(14, 400, C.gray) }}>Đang tải...</div>
      ) : existing ? (
        <div style={{ ...card(), padding: '16px 18px', borderLeft: `4px solid ${C.amber}` }}>
          <div style={{ ...flex('center'), justifyContent: 'space-between', gap: 10, marginBottom: existing.comment ? 10 : 0 }}>
            <span style={{ ...flex('center'), gap: 8 }}>
              <Stars value={existing.rate} size={16} />
              <span style={{ ...txt(14, 700) }}>{RATING_LABELS[existing.rate]}</span>
            </span>
            <span style={{
              ...flex('center'), gap: 5, padding: '4px 10px', borderRadius: 999,
              background: C.greenBg, border: `1px solid ${C.greenBorder}`, ...txt(12, 600, C.green)
            }}>
              <Check size={13} /> Đã gửi
            </span>
          </div>
          {existing.comment && (
            <p style={{ ...txt(14, 400, C.darkGray), lineHeight: 1.6 }}>“{existing.comment}”</p>
          )}
        </div>
      ) : (
        <div style={{ ...card(), padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Thẻ chọn sao: trái là sao, phải là điểm trên thang 5 */}
          <div style={{
            ...flex('center'), justifyContent: 'space-between', gap: 12, padding: '10px 14px', borderRadius: 12,
            background: C.yellowBg, border: `1px solid ${C.amberBorder}`
          }}>
            <Stars value={rate} onChange={setRate} size={20} />
            <span style={{ ...txt(13, 500, C.gray), flexShrink: 0 }}>
              <b style={{ ...txt(16, 800, rate ? C.amberDark : C.grayLight) }}>{rate || '–'}</b>/5
            </span>
          </div>
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            maxLength={1000}
            placeholder="Chia sẻ trải nghiệm làm việc của bạn (không bắt buộc)"
            style={{
              width: '100%', minHeight: 90, padding: 12, borderRadius: 12, border: `1px solid ${C.border}`,
              fontSize: 14, fontFamily: 'inherit', resize: 'vertical', outline: 'none', boxSizing: 'border-box'
            }}
          />
          {error && <p style={{ ...txt(13, 500, C.red) }}>{error}</p>}
          <button
            onClick={submit}
            disabled={!rate || busy}
            style={{
              height: 44, borderRadius: 12, border: 'none',
              background: rate && !busy ? C.purple : C.grayBg,
              ...txt(14, 600, rate && !busy ? C.white : C.grayLight),
              cursor: rate && !busy ? 'pointer' : 'not-allowed',
              ...flex('center'), justifyContent: 'center', gap: 8
            }}
          >
            <Send size={16} /> {busy ? 'Đang gửi...' : 'Gửi đánh giá'}
          </button>
        </div>
      )}
    </div>
  );
};

const ApplicationModal = ({ open, onClose, application: app }) => {
  if (!open || !app) return null;
  const job = app.job || {};
  // Tách mô tả thành từng ý (bỏ ký hiệu đầu dòng), như trang chi tiết việc làm
  const descLines = (job.description || '').split('\n').map(l => l.replace(/^[-•*]\s*/, '').trim()).filter(Boolean);
  const style = GROUP_STYLE[app.group];
  const cvUrl = cvLink(app.cv_url);
  const cvName = app.cv_url ? decodeURIComponent(app.cv_url.split('/').pop()) : 'CV.pdf';

  return (
    <>
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000
      }} />
      <div style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        ...flex('center', 'column'), justifyContent: 'center', padding: 24
      }}>
        <div style={{
          background: C.white, borderRadius: 20,
          width: '100%', maxWidth: 960,
          maxHeight: '90vh', overflowY: 'auto',
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
        }}>
          <div style={{
            background: GRADIENT.hero,
            borderRadius: '20px 20px 0 0',
            padding: '28px 32px',
            position: 'relative'
          }}>
            <button
              onClick={onClose}
              title="Đóng"
              style={{
                position: 'absolute', top: 20, right: 20, width: 36, height: 36, borderRadius: '50%',
                background: 'rgba(255,255,255,0.2)', border: 'none', cursor: 'pointer',
                ...flex('center'), justifyContent: 'center'
              }}
            >
              <X size={20} color={C.white} />
            </button>

            {/* Tiêu đề công việc + nhãn trạng thái ngay bên cạnh */}
            <div style={{ ...flex('center'), gap: 12, flexWrap: 'wrap', marginBottom: 8, paddingRight: 56 }}>
              <h2 style={{ ...txt(28, 700, C.white), lineHeight: 1.25 }}>
                {app.title}
              </h2>
              <span style={{
                padding: '5px 14px', borderRadius: 999, background: style.bg, color: style.text,
                fontSize: 13, fontWeight: 600, ...flex('center'), gap: 6, flexShrink: 0
              }}>
                {app.group === 'accepted' && <CheckCircle size={14} />}
                {app.statusLabel}
              </span>
            </div>
            <div style={{ ...flex('center'), gap: 6 }}>
              <Building2 size={18} color={C.white} />
              <span style={{ ...txt(16, 500, C.white) }}>{app.company}</span>
              {app.companyVerified && <BadgeCheck size={17} color={C.white} />}
            </div>

            {/* Cùng kiểu ô thông tin ở hộp thoại xem tin / duyệt tin (InfoTile), mỗi thẻ một màu */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 16, marginTop: 24 }}>
              {[
                { icon: MapPin, label: 'Địa điểm', value: job.location },
                { icon: Wallet, label: 'Mức lương', value: app.salary },
                { icon: GraduationCap, label: 'Kinh nghiệm', value: formatExperience(job.experience) }
              ].map((f, i) => (
                <InfoTile key={f.label} {...f} gradient={[TILE_GRADIENTS[1], TILE_GRADIENTS[2], TILE_GRADIENTS[3]][i]} />
              ))}
            </div>
          </div>

          <div style={{ padding: '32px', display: 'grid', gridTemplateColumns: '1fr 380px', gap: 32 }}>
            <div>
              <h3 style={{ ...txt(20, 700), marginBottom: 16, ...flex('center'), gap: 8 }}>
                <Clock size={22} /> Tiến trình ứng tuyển
              </h3>
              <div style={SECTION_CARD}>
              <div>
                {buildTimeline(app).map((item, i, arr) => (
                  <div key={i} style={{
                    ...flex('flex-start'), gap: 16, position: 'relative'
                  }}>
                    {/* Hình tròn xanh lá + dấu check; bước từ chối / rút hồ sơ: đỏ + dấu X */}
                    <div style={{
                      width: 26, height: 26, borderRadius: '50%', marginTop: 1,
                      background: item.failed ? C.red : C.green, ...flex('center'), justifyContent: 'center',
                      flexShrink: 0, zIndex: 1, boxShadow: `0 0 0 4px ${item.failed ? C.redBg : C.greenBg}`
                    }}>
                      {item.failed
                        ? <X size={15} color={C.white} strokeWidth={3} />
                        : <Check size={15} color={C.white} strokeWidth={3} />}
                    </div>
                    <div style={{
                      flex: 1,
                      paddingBottom: i < arr.length - 1 ? 28 : 0
                    }}>
                      {/* Tên bước + nhãn thời gian ngay bên cạnh */}
                      <div style={{ ...flex('center'), gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                        <h4 style={{ ...txt(16, 600, item.failed ? C.red : C.navy) }}>{item.title}</h4>
                        {item.date && (
                          <span style={{
                            padding: '2px 10px', borderRadius: 999, fontSize: 12, fontWeight: 600,
                            background: C.blueLight, color: C.purple, whiteSpace: 'nowrap'
                          }}>
                            {item.date}
                          </span>
                        )}
                      </div>
                      <p style={{ ...txt(14, 400, C.gray) }}>{item.description}</p>
                    </div>
                    {i < arr.length - 1 && (
                      <div style={{
                        position: 'absolute',
                        left: 12,
                        top: 31,
                        width: 2,
                        height: 'calc(100% - 26px)',
                        background: C.border
                      }} />
                    )}
                  </div>
                ))}
              </div>
              </div>

              <h3 style={{ ...txt(18, 700), marginBottom: 12, ...flex('center'), gap: 10 }}>
                <span style={{ width: 34, height: 34, borderRadius: 10, background: C.blueLight, ...flex('center'), justifyContent: 'center' }}>
                  <MessageSquare size={17} color={C.purple} />
                </span>
                Mô tả công việc
              </h3>
              {/* Giống trang chi tiết việc làm: thẻ trắng viền tím trái, mỗi ý một dòng có chấm tím */}
              <div style={{ ...card(), padding: '18px 24px', borderLeft: `4px solid ${C.purple}`, marginBottom: 32 }}>
                {descLines.length === 0 ? (
                  <p style={{ ...txt(14, 400, C.gray) }}>Nhà tuyển dụng chưa cung cấp mô tả.</p>
                ) : (
                  <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {descLines.map((line, i) => (
                      <li key={i} style={{ ...flex('flex-start'), gap: 10 }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.purple, flexShrink: 0, marginTop: 9 }} />
                        <span style={{ ...txt(15, 400, C.darkGray), lineHeight: 1.55 }}>{line}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <h3 style={{ ...txt(18, 700), marginBottom: 12, ...flex('center'), gap: 10 }}>
                <span style={{ width: 34, height: 34, borderRadius: 10, background: C.blueLight, ...flex('center'), justifyContent: 'center' }}>
                  <AlertCircle size={17} color={C.purple} />
                </span>
                Phản hồi từ nhà tuyển dụng
              </h3>
              <div style={{
                background: C.amberBg, borderRadius: 12, padding: 20,
                border: `1px solid #fcd34d`
              }}>
                <p style={{ ...txt(14, 400, C.brown), lineHeight: 1.7 }}>
                  {EMPLOYER_NOTE[app.group]}
                </p>
              </div>
            </div>

            <div>
              <h3 style={{ ...txt(18, 700), marginBottom: 12, ...flex('center'), gap: 10 }}>
                <span style={{ width: 34, height: 34, borderRadius: 10, background: C.blueLight, ...flex('center'), justifyContent: 'center' }}>
                  <Info size={17} color={C.purple} />
                </span>
                Thông tin ứng tuyển
              </h3>
              <div style={{ ...SECTION_CARD, padding: '8px 24px' }}>

                {[
                { icon: Clock, label: 'Ngày ứng tuyển', value: formatDateTime(app.created_at) || '—' },
                { icon: Users, label: 'Số lượng tuyển', value: job.num_slot ? `${job.num_slot} người` : '—' },
                { icon: Calendar, label: 'Hạn nộp hồ sơ', value: formatDate(job.expiry_date, '—'), color: C.red },
                { icon: Briefcase, label: 'Cấp bậc', value: job.role || '—' },
                { icon: GraduationCap, label: 'Học vấn', value: job.education_level || '—' }
                ].map(({ icon, label, value, color }, i, arr) => {
                  const Icon = icon;
                  return (
                    // Cùng kiểu "Thông tin chung" ở trang chi tiết việc làm: icon | nhãn | giá trị sát phải
                    <div key={label} style={{
                      ...flex('center'), gap: 12, padding: '12px 0',
                      borderBottom: i === arr.length - 1 ? 'none' : `1px solid ${C.border}`
                    }}>
                      <Icon size={18} color={C.grayLight} style={{ flexShrink: 0 }} />
                      <span style={{ ...txt(14, 400, C.gray), flex: 1 }}>{label}</span>
                      <span style={{ ...txt(14, 600, color || C.navy), textAlign: 'right' }}>{value}</span>
                    </div>
                  );
                })}
              </div>

              <div>
                <h3 style={{ ...txt(18, 700), marginBottom: 16, ...flex('center'), gap: 8 }}>
                  <FileText size={20} /> Hồ sơ đã nộp
                </h3>
                <div style={{
                  background: COLORS.redBg, borderRadius: 12,
                  padding: '16px', border: `1px solid #fecaca`
                }}>
                  <div style={{ ...flex('center'), gap: 12 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 8,
                      background: C.redDark, ...flex('center'), justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <span style={{ ...txt(12, 700, C.white) }}>PDF</span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        ...txt(14, 600),
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {cvName}
                      </p>
                      <p style={{ ...txt(12, 400, C.gray) }}>
                        Nộp ngày {formatDate(app.created_at, '—')}
                      </p>
                    </div>
                  </div>
                </div>
                <button
                onClick={() => cvUrl && window.open(cvUrl, '_blank', 'noopener')}
                disabled={!cvUrl}
                style={{
                  width: '100%', marginTop: 16, padding: '12px',
                  borderRadius: 10, border: 'none',
                  background: C.blue, color: C.white,
                  fontSize: 14, fontWeight: 600, cursor: cvUrl ? 'pointer' : 'not-allowed',
                  opacity: cvUrl ? 1 : 0.6,
                  ...flex('center'), justifyContent: 'center', gap: 8
                }}>
                  <Download size={16} /> Tải xuống
                </button>

                {app.group === 'accepted' && app.employerId && <FeedbackSection app={app} />}
              </div>
            </div>
          </div>

          <div style={{
            padding: '20px 32px', borderTop: `1px solid ${C.border}`,
            ...flex('center'), justifyContent: 'flex-end'
          }}>
            <button onClick={onClose} style={{
              padding: '12px 32px', borderRadius: 10, border: 'none',
              background: C.blue, color: C.white, fontSize: 15,
              fontWeight: 600, cursor: 'pointer'
            }}>
              Đóng
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

const Chip = ({ icon: Icon, children, color }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 999,
    background: C.grayBg, color: color || C.darkGray, fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap'
  }}>
    {Icon && <Icon size={13} color={color || C.gray} />} {children}
  </span>
);

// Thẻ hồ sơ ứng tuyển — cùng bố cục với thẻ việc làm (JobCard)
const ApplicationCard = ({ application, onViewDetail, onMessage }) => {
  const [hover, setHover] = useState(false);
  const config = GROUP_STYLE[application.group];
  const IconComponent = application.icon;
  const job = application.job;

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: C.white, borderRadius: 16, minWidth: 0,
        border: `1px solid ${hover ? C.blueBorder : C.border}`,
        boxShadow: hover ? SHADOW.md : SHADOW.sm,
        transform: hover ? 'translateY(-2px)' : 'none',
        transition: 'all .2s ease',
        padding: 20, display: 'flex', flexDirection: 'column', gap: 14
      }}
    >
      {/* Icon vuông cao đúng bằng khối tiêu đề + tên công ty */}
      <div style={{ display: 'flex', gap: 14, alignItems: 'stretch' }}>
        <div style={{
          alignSelf: 'stretch', aspectRatio: '1 / 1', borderRadius: 12, background: C.blueLight, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <IconComponent size={22} color={C.purple} />
        </div>
        <div style={{ flex: 1, minWidth: 0, minHeight: 44, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h3 style={{
            fontSize: 16, fontWeight: 700, color: hover ? C.purple : C.navy, margin: 0, lineHeight: 1.35,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', transition: 'color .2s ease'
          }}>
            {application.title}
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
            <span style={{ fontSize: 13, color: C.gray, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {application.company}
            </span>
            {application.companyVerified && <BadgeCheck size={14} color={C.purple} />}
          </div>
        </div>
        <span style={{
          alignSelf: 'flex-start', padding: '4px 12px', borderRadius: 999, flexShrink: 0,
          background: config.bg, color: config.text, fontSize: 12, fontWeight: 600
        }}>
          {application.statusLabel}
        </span>
      </div>

      {/* Nhãn giãn ra để đường kẻ + hàng dưới luôn sát đáy thẻ, thẳng hàng với thẻ bên cạnh */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignContent: 'flex-start', flex: 1 }}>
        <Chip icon={MapPin}>{job?.location || 'Chưa cập nhật'}</Chip>
        {job && <Chip icon={Briefcase}>{formatExperience(job.experience)}</Chip>}
        <Chip icon={Clock}>Ứng tuyển {application.appliedAgo}</Chip>
      </div>

      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
        paddingTop: 14, borderTop: `1px solid ${C.border}`
      }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: C.purple, minWidth: 0 }}>
          {application.salary}
          {(job?.salary_min || job?.salary_max) && <span style={{ fontSize: 12, fontWeight: 500, color: C.gray }}> /giờ</span>}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <button
            onClick={() => onViewDetail(application)}
            style={{
              height: 34, padding: '0 14px', borderRadius: 10,
              border: `1px solid ${C.border}`, background: C.white, color: C.navy,
              fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6
            }}
          >
            <Eye size={14} /> Chi tiết
          </button>
          <button
            onClick={() => onMessage(application)}
            disabled={!application.employerId}
            style={{
              height: 34, padding: '0 14px', borderRadius: 10, border: 'none',
              background: C.purple, color: C.white, fontSize: 13, fontWeight: 600,
              cursor: application.employerId ? 'pointer' : 'not-allowed',
              opacity: application.employerId ? 1 : 0.6, display: 'flex', alignItems: 'center', gap: 6
            }}
          >
            <MessageCircle size={14} /> Nhắn tin
          </button>
        </div>
      </div>
    </div>
  );
};

// Ghép hồ sơ ứng tuyển với tin tuyển dụng, công ty và lịch phỏng vấn
const loadApplications = async (candidateId) => {
  const [apps, jobs, employers, interviews] = await Promise.all([
    applicationService.getByCandidateId(candidateId),
    jobService.getAllJobs(),
    getAllEmployers(),
    interviewService.getByCandidate(candidateId).catch(() => [])
  ]);

  const jobById = Object.fromEntries(attachEmployers(jobs, employers).map(j => [j.job_id, j]));

  return apps
    .map(app => {
      const job = jobById[app.job_id];
      const interview = interviews
        .filter(iv => iv.job_id === app.job_id)
        .sort((a, b) => new Date(b.time) - new Date(a.time))[0];
      return {
        ...app,
        id: app.application_id,
        job,
        interview,
        title: job?.title || 'Tin tuyển dụng đã bị xóa',
        company: job?.company || '—',
        companyVerified: job?.companyVerified,
        employerId: job?.employer_id,
        salary: job ? formatSalary(job.salary_min, job.salary_max) : '—',
        statusLabel: APPLICATION_STATUS[app.status]?.label || app.status,
        group: STATUS_GROUP[app.status] || 'pending',
        appliedAgo: timeAgo(app.created_at),
        icon: jobIcon(job || {})
      };
    })
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
};

export default function JobApplied() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [appliedQuery, setAppliedQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const user = getCurrentUser();
    if (!user?.candidate_id) return;
    loadApplications(user.candidate_id)
      .then(setApplications)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filteredApps = useMemo(() => {
    const q = normalize(appliedQuery.trim());
    return applications.filter(app =>
      (filter === 'all' || app.group === filter) &&
      (!q || normalize(`${app.title} ${app.company}`).includes(q))
    );
  }, [applications, filter, appliedQuery]);

  const handleViewDetail = (app) => {
    setSelectedApplication(app);
    setModalOpen(true);
  };

  const handleMessage = (app) => navigate(`/candidate/messages?with=${app.employerId}`);

  return (
    <div style={{
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      background: C.grayBg, minHeight: '100vh'
    }}>
      <main style={{ padding: '40px 48px' }}>
        <PageHeader title="Việc đã ứng tuyển" subtitle="Theo dõi trạng thái các công việc bạn đã ứng tuyển" />

        {/* Thẻ tìm kiếm */}
        <div style={{ ...card(), padding: 14, marginBottom: 14, ...flex('center'), gap: 10 }}>
          <div style={{ ...flex('center'), gap: 10, flex: 1, ...field() }}>
            <Search size={18} color={C.grayLight} />
            <input
              placeholder="Tìm kiếm công việc đã ứng tuyển"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && setAppliedQuery(searchQuery)}
              style={{ border: 'none', outline: 'none', boxShadow: 'none', fontSize: 14, flex: 1, background: 'transparent' }}
            />
          </div>
          <button
            onClick={() => setAppliedQuery(searchQuery)}
            style={{
              height: 44, padding: '0 22px', borderRadius: 12, border: 'none', background: C.purple,
              color: C.white, fontSize: 14, fontWeight: 600, cursor: 'pointer', ...flex('center'), gap: 8
            }}
          >
            <Search size={16} /> Tìm kiếm
          </button>
        </div>

        {/* Thẻ lọc trạng thái */}
        <div style={{ ...card(), padding: '12px 16px', marginBottom: 24, ...flex('center'), gap: 10, flexWrap: 'wrap' }}>
          <span style={{ ...txt(14, 600, C.gray), marginRight: 4 }}>Lọc:</span>
          {FILTER_TABS.map(tab => {
            const active = filter === tab.id;
            const count = tab.id === 'all' ? applications.length : applications.filter(a => a.group === tab.id).length;
            return (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                style={{
                  height: 36, padding: '0 16px', borderRadius: 999, cursor: 'pointer',
                  border: `1px solid ${active ? C.purple : C.border}`,
                  background: active ? C.purple : C.grayBg,
                  color: active ? C.white : C.darkGray,
                  fontSize: 13, fontWeight: 600, ...flex('center'), gap: 8
                }}
              >
                {tab.label}
                <span style={{
                  minWidth: 20, height: 20, padding: '0 6px', borderRadius: 999, fontSize: 11, fontWeight: 700,
                  background: active ? 'rgba(255,255,255,0.25)' : C.white, color: active ? C.white : C.gray,
                  ...flex('center'), justifyContent: 'center'
                }}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {loading ? (
          <StateBox type="loading" title="Đang tải hồ sơ ứng tuyển..." />
        ) : error ? (
          <StateBox type="error" title="Không tải được danh sách" message={error} onRetry={() => window.location.reload()} />
        ) : filteredApps.length === 0 ? (
          <StateBox
            icon={FileText}
            title={applications.length === 0 ? 'Bạn chưa ứng tuyển công việc nào' : 'Không có hồ sơ phù hợp'}
            message={applications.length === 0 ? 'Hãy tìm và ứng tuyển công việc phù hợp với lịch học của bạn.' : 'Thử đổi từ khóa hoặc bộ lọc trạng thái.'}
            action={applications.length === 0 && (
              <button
                onClick={() => navigate('/jobs')}
                style={{
                  height: 42, padding: '0 20px', borderRadius: 12, border: 'none', background: C.purple,
                  color: C.white, fontSize: 14, fontWeight: 600, cursor: 'pointer'
                }}
              >
                Khám phá việc làm
              </button>
            )}
          />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 18 }}>
            {filteredApps.map(app => (
              <ApplicationCard
                key={app.id}
                application={app}
                onViewDetail={handleViewDetail}
                onMessage={handleMessage}
              />
            ))}
          </div>
        )}
      </main>

      <ApplicationModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedApplication(null);
        }}
        application={selectedApplication}
      />
    </div>
  );
}
