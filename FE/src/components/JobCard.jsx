import { useState, createElement } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Briefcase, Clock, Bookmark, BadgeCheck } from 'lucide-react';
import { COLORS, SHADOW } from '../constants/colors';
import {
  formatSalary, formatExperience, timeAgo, jobIcon, JOB_TYPE_LABELS,
  readSavedJobs, toggleSavedJob
} from '../utils/jobFormat';

const C = COLORS;

const Chip = ({ icon: Icon, children }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 999,
    background: C.grayBg, color: C.darkGray, fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap'
  }}>
    {Icon && <Icon size={13} color={C.gray} />} {children}
  </span>
);

/**
 * Thẻ việc làm dùng chung. job: dữ liệu từ API (đã gắn company / companyVerified).
 */
// onUnsave: gọi khi người dùng bỏ lưu tin (trang "Việc đã lưu" dùng để ẩn thẻ khỏi danh sách)
export default function JobCard({ job, hideCompany = false, onUnsave }) {
  const navigate = useNavigate();
  const [saved, setSaved] = useState(() => readSavedJobs().includes(job.job_id));
  const [hover, setHover] = useState(false);
  const icon = createElement(jobIcon(job), { size: 22, color: C.purple });
  const open = () => navigate(`/job-detail/${job.job_id}`);

  return (
    <div
      onClick={open}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: C.white,
        borderRadius: 16,
        border: `1px solid ${hover ? C.blueBorder : C.border}`,
        boxShadow: hover ? SHADOW.md : SHADOW.sm,
        transform: hover ? 'translateY(-2px)' : 'none',
        transition: 'all .2s ease',
        padding: 20,
        minWidth: 0,
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        gap: 14
      }}
    >
      <div style={{ display: 'flex', gap: 14, alignItems: 'stretch' }}>
        {/* Icon vuông, cao đúng bằng khối tiêu đề + tên công ty bên cạnh */}
        <div style={{
          alignSelf: 'stretch', aspectRatio: '1 / 1', borderRadius: 12, background: C.blueLight, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          {icon}
        </div>
        <div style={{
          flex: 1, minWidth: 0, minHeight: 44,
          display: 'flex', flexDirection: 'column', justifyContent: 'center'
        }}>
          <h3 style={{
            fontSize: 16, fontWeight: 700, color: hover ? C.purple : C.navy, margin: 0, lineHeight: 1.35,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', transition: 'color .2s ease'
          }}>
            {job.title}
          </h3>
          {!hideCompany && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
              <span style={{ fontSize: 13, color: C.gray, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {job.company}
              </span>
              {job.companyVerified && <BadgeCheck size={14} color={C.purple} title="Đã xác thực" />}
            </div>
          )}
        </div>
        <button
          onClick={e => {
            e.stopPropagation();
            const nowSaved = toggleSavedJob(job.job_id);
            setSaved(nowSaved);
            if (!nowSaved) onUnsave?.(job.job_id);
          }}
          title={saved ? 'Bỏ lưu' : 'Lưu tin'}
          style={{
            width: 36, height: 36, borderRadius: 10, flexShrink: 0, cursor: 'pointer', alignSelf: 'flex-start',
            border: `1px solid ${saved ? C.blueBorder : C.border}`,
            background: saved ? C.blueLight : C.white,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
        >
          <Bookmark size={16} color={saved ? C.purple : C.gray} fill={saved ? C.purple : 'none'} />
        </button>
      </div>

      {/* Phần nhãn giãn ra để đường kẻ + dòng lương luôn nằm sát đáy thẻ,
          nhờ đó thẳng hàng với các thẻ khác cùng hàng */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignContent: 'flex-start', flex: 1 }}>
        <Chip icon={MapPin}>{job.location || 'Chưa cập nhật'}</Chip>
        <Chip icon={Briefcase}>{formatExperience(job.experience)}</Chip>
        {JOB_TYPE_LABELS[job.job_type] && <Chip>{JOB_TYPE_LABELS[job.job_type]}</Chip>}
      </div>

      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        paddingTop: 14, borderTop: `1px solid ${C.border}`
      }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: C.purple }}>
          {formatSalary(job.salary_min, job.salary_max)}
          {(job.salary_min || job.salary_max) && <span style={{ fontSize: 12, fontWeight: 500, color: C.gray }}> /giờ</span>}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: C.grayLight }}>
          <Clock size={13} /> {timeAgo(job.created_at)}
        </span>
      </div>
    </div>
  );
}
