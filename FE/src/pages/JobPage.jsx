import { useState } from 'react';
import {
  Search, MapPin, Briefcase, Heart, Info,
  ChevronLeft, ChevronRight, Clock, Coffee, GraduationCap,
  ShoppingCart, Palette
} from 'lucide-react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import { flex, txt } from '../utils/styles';
import { COLORS } from '../constants/colors';

const C = COLORS;
const JobCard = ({ job }) => {
  const [saved, setSaved] = useState(false);
  const IconComponent = job.icon;

  return (
    <div style={{
      background: C.white,
      borderRadius: 16,
      border: `1px solid ${C.border}`,
      padding: '24px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      transition: 'all 0.2s'
    }}
    onMouseEnter={e => {
      e.currentTarget.style.transform = 'translateY(-4px)';
      e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)';
    }}
    onMouseLeave={e => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
    }}
    >
      {/* Header */}
      <div style={{ 
        ...flex('flex-start'), 
        gap: 16,
        paddingBottom: 20,
        borderBottom: `1px solid ${C.border}`,
        marginBottom: 16
      }}>
        <div style={{
          width: 72,
          height: 72,
          borderRadius: 14,
          background: `linear-gradient(135deg, ${C.purple}, #a78bfa)`,
          ...flex('center'),
          justifyContent: 'center',
          flexShrink: 0
        }}>
          <IconComponent size={36} color={C.white} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ 
            ...flex('center'), 
            justifyContent: 'space-between',
            marginBottom: 6,
            gap: 12
          }}>
            <h3 style={{ 
              ...txt(18, 600),
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {job.title}
            </h3>
            <span style={{ 
              ...txt(13, 400, C.gray),
              flexShrink: 0,
              ...flex('center'),
              gap: 4
            }}>
              <Clock size={14} /> {job.posted}
            </span>
          </div>

          <div style={{ ...flex('center'), gap: 6, marginBottom: 8 }}>
            <span style={{ ...txt(14, 500, C.blue) }}>{job.company}</span>
            {job.verified && (
              <FontAwesomeIcon icon={faCheckCircle} size="sm" color={COLORS.blue} />
            )}
          </div>

          <div style={{ ...flex('center'), gap: 16 }}>
            <div style={{ ...flex('center'), gap: 4 }}>
              <MapPin size={14} color={C.gray} />
              <span style={{ ...txt(13, 400, C.gray) }}>{job.location}</span>
            </div>
            <div style={{ ...flex('center'), gap: 4 }}>
              <Briefcase size={14} color={C.gray} />
              <span style={{ ...txt(13, 400, C.gray) }}>{job.requirement}</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ 
        ...flex('center'), 
        justifyContent: 'space-between' 
      }}>
        <div>
          <span style={{ ...txt(12, 400, C.gray), display: 'block', marginBottom: 4 }}>
            Mức lương
          </span>
          <span style={{ ...txt(16, 700, C.blueText) }}>
            {job.salary}
          </span>
        </div>

        <div style={{ ...flex('center'), gap: 8 }}>
          <button
            onClick={() => setSaved(!saved)}
            style={{
              padding: '8px 16px',
              borderRadius: 20,
              background: saved ? '#fdf2f8' : C.white,
              border: `1px solid ${saved ? C.pink : C.border}`,
              color: saved ? C.pink : C.navy,
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              ...flex('center'),
              gap: 6,
              transition: 'all 0.2s'
            }}
          >
            <Heart 
              size={14} 
              fill={saved ? C.pink : 'none'} 
              color={saved ? C.pink : C.navy}
            />
            Lưu tin
          </button>

          <button style={{
            padding: '8px 16px',
            borderRadius: 20,
            border: 'none',
            background: C.blue,
            color: C.white,
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            ...flex('center'),
            gap: 6,
            transition: 'all 0.2s'
          }}
          onMouseEnter={e => e.currentTarget.style.background = C.blueText}
          onMouseLeave={e => e.currentTarget.style.background = C.blue}
          >
            <Info size={14} /> Chi tiết
          </button>
        </div>
      </div>
    </div>
  );
};

export default function PartTimeJobsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [industry, setIndustry] = useState('');
  const [location, setLocation] = useState('');

  const jobs = [
    {
      id: 1,
      title: 'Nhân viên Phục vụ Part-time',
      company: 'The Coffee House',
      location: 'Quận 1, TP.HCM',
      requirement: 'Không yêu cầu',
      salary: '25.000-30.000 VNĐ/giờ',
      posted: '2 giờ trước',
      verified: true,
      icon: Coffee
    },
    {
      id: 2,
      title: 'Gia sư Toán - Lý',
      company: 'TutorVN',
      location: 'Online/Offline',
      requirement: '1 năm',
      salary: '100.000-200.000 VNĐ/giờ',
      posted: '4 giờ trước',
      verified: true,
      icon: GraduationCap
    },
    {
      id: 3,
      title: 'Nhân viên Bán hàng Cuối tuần',
      company: 'Fashion Store ABC',
      location: 'Quận 3, TP.HCM',
      requirement: 'Không yêu cầu',
      salary: '22.000-28.000 VNĐ/giờ',
      posted: '1 ngày trước',
      verified: true,
      icon: ShoppingCart
    },
    {
      id: 4,
      title: 'Graphic Designer Part-time',
      company: 'Creative Studio Pro',
      location: 'Quận 1, TP.HCM',
      requirement: 'Không yêu cầu',
      salary: '30.000-40.000 VNĐ/giờ',
      posted: '2 ngày trước',
      verified: true,
      icon: Palette
    }
  ];

  return (
    <div style={{
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      background: C.grayBg,
      minHeight: '100vh'
    }}>
      <section style={{
        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 75%, #f97316 100%)',
        padding: '80px 40px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          maxWidth: 1200,
          margin: '0 auto',
          textAlign: 'center',
          position: 'relative',
          zIndex: 1
        }}>
          <h1 style={{ 
            ...txt(48, 700, C.white), 
            marginBottom: 16,
            textShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            Việc làm part-time
          </h1>
          <p style={{ 
            ...txt(18, 400, C.white), 
            marginBottom: 40,
            opacity: 0.95
          }}>
            Khám phá hơn 10,000+ cơ hội việc làm part-time được xác thực với mức lương hấp dẫn
          </p>

          <div style={{
            background: C.white,
            borderRadius: 16,
            padding: '16px',
            ...flex('center'),
            gap: 12,
            maxWidth: 1000,
            margin: '0 auto',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
          }}>
            <div style={{
              ...flex('center'),
              gap: 10,
              flex: 1,
              padding: '10px 14px',
              borderRadius: 8,
              background: C.white,
              border: `1px solid ${C.border}`
            }}>
              <Search size={20} color={C.gray} />
              <input
                placeholder="Tìm theo vị trí tuyển dụng"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  border: 'none',
                  outline: 'none',
                  fontSize: 15,
                  flex: 1,
                  background: 'transparent'
                }}
              />
            </div>

            <select
              value={industry}
              onChange={e => setIndustry(e.target.value)}
              style={{
                padding: '12px 16px',
                borderRadius: 8,
                border: `1px solid ${C.border}`,
                fontSize: 15,
                outline: 'none',
                cursor: 'pointer',
                minWidth: 180,
                appearance: 'none',
                background: `${C.white} url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2364748b' d='M6 9L1 4h10z'/%3E%3C/svg%3E") no-repeat right 16px center`
              }}
            >
              <option value="">Tất cả ngành nghề</option>
              <option value="fnb">F&B</option>
              <option value="retail">Bán hàng</option>
              <option value="education">Giáo dục</option>
              <option value="tech">Công nghệ</option>
            </select>

            <select
              value={location}
              onChange={e => setLocation(e.target.value)}
              style={{
                padding: '12px 16px',
                borderRadius: 8,
                border: `1px solid ${C.border}`,
                fontSize: 15,
                outline: 'none',
                cursor: 'pointer',
                minWidth: 180,
                appearance: 'none',
                background: `${C.white} url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2364748b' d='M6 9L1 4h10z'/%3E%3C/svg%3E") no-repeat right 16px center`
              }}
            >
              <option value="">Tất cả địa điểm</option>
              <option value="hanoi">Hà Nội</option>
              <option value="hcm">TP. Hồ Chí Minh</option>
              <option value="danang">Đà Nẵng</option>
            </select>

            <button style={{
              padding: '12px 32px',
              borderRadius: 8,
              border: 'none',
              background: C.purple,
              color: C.white,
              fontSize: 15,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
              whiteSpace: 'nowrap'
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#6d28d9'}
            onMouseLeave={e => e.currentTarget.style.background = C.purple}
            >
              Tìm kiếm
            </button>
          </div>
        </div>
      </section>

      <section style={{
        maxWidth: 1200,
        margin: '0 auto',
        padding: '60px 40px'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 24,
          marginBottom: 48
        }}>
          {jobs.map(job => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>

        <div style={{
          ...flex('center'),
          justifyContent: 'center',
          gap: 16
        }}>
          <button style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            border: `1px solid ${C.border}`,
            background: C.white,
            cursor: 'pointer',
            ...flex('center'),
            justifyContent: 'center',
            transition: 'all 0.2s'
          }}>
            <ChevronLeft size={20} color={C.gray} />
          </button>

          <span style={{ ...txt(15, 500, C.gray) }}>
            1/1 trang
          </span>

          <button style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            border: `1px solid ${C.border}`,
            background: C.white,
            cursor: 'pointer',
            ...flex('center'),
            justifyContent: 'center',
            transition: 'all 0.2s'
          }}>
            <ChevronRight size={20} color={C.gray} />
          </button>
        </div>
      </section>

      <style>{`
        input:focus, select:focus {
          border-color: ${C.purple} !important;
        }
        input::placeholder {
          color: ${C.grayLight};
        }
      `}</style>
    </div>
  );
}