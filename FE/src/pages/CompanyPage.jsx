import { useState } from 'react';
import {
  Search, Briefcase, 
  ChevronLeft, ChevronRight, Coffee, ShoppingCart,
  GraduationCap, Laptop
} from 'lucide-react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import { flex, txt } from '../utils/styles';
import { BG } from '../constants/backgrounds';
import { COLORS } from '../constants/colors';

const C = COLORS;
const CompanyCard = ({ company }) => {
  const IconComponent = company.icon;

  return (
    <div style={{
      background: C.white,
      borderRadius: 16,
      border: `1px solid ${C.border}`,
      padding: '28px',
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
      <div style={{ 
        ...flex('center'), 
        gap: 16, 
        paddingBottom: 20,
        borderBottom: `1px solid ${C.border}`,
        marginBottom: 20
      }}>
        <div style={{
          width: 72,
          height: 72,
          borderRadius: 14,
          background: `${C.blue}`,
          ...flex('center'),
          justifyContent: 'center',
          flexShrink: 0
        }}>
          <IconComponent size={36} color={C.white} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ ...flex('center'), gap: 5, marginBottom: 6 }}>
            <h3 style={{ 
              ...txt(18, 700),
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {company.name}
            </h3>
            {company.verified && (
              <FontAwesomeIcon icon={faCheckCircle} size="sm" color={COLORS.blue} />
            )}
          </div>
          <p style={{ 
            ...txt(14, 500, C.blue),
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {company.industry}
          </p>
        </div>
      </div>

      <div style={{ 
        ...flex('center'), 
        justifyContent: 'space-between' 
      }}>
        <div style={{ ...flex('center'), gap: 6 }}>
          <Briefcase size={16} color={C.blue} />
          <span style={{ ...txt(14, 500, C.blue) }}>
            {company.jobs} việc làm đang tuyển
          </span>
        </div>

        <button style={{
          padding: '8px 20px',
          borderRadius: 20,
          border: 'none',
          background: C.blue,
          color: C.white,
          fontSize: 14,
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'all 0.2s'
        }}
        onMouseEnter={e => e.currentTarget.style.background = C.purple}
        onMouseLeave={e => e.currentTarget.style.background = C.blue}
        >
          Xem chi tiết
        </button>
      </div>
    </div>
  );
};

export default function EmployersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [industry, setIndustry] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const companies = [
    {
      id: 1,
      name: 'The Coffee House',
      industry: 'F&B',
      jobs: 15,
      icon: Coffee,
      verified: true
    },
    {
      id: 2,
      name: 'Fashion Store ABC',
      industry: 'Bán hàng',
      jobs: 12,
      icon: ShoppingCart,
      verified: true
    },
    {
      id: 3,
      name: 'TutorVN',
      industry: 'Gia sư - Dạy học',
      jobs: 12,
      icon: GraduationCap,
      verified: true
    },
    {
      id: 4,
      name: 'Digital Agency XYZ',
      industry: 'Công nghệ thông tin',
      jobs: 6,
      icon: Laptop,
      verified: true
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
            Khám phá các nhà tuyển dụng uy tín
          </h1>
          <p style={{ 
            ...txt(18, 400, C.white), 
            marginBottom: 40,
            opacity: 0.95
          }}>
            Tìm hiểu về công ty, văn hóa làm việc và cơ hội nghề nghiệp tại hơn 5,000+ doanh nghiệp
          </p>

          <div style={{
            background: C.white,
            borderRadius: 16,
            padding: '16px',
            ...flex('center'),
            gap: 12,
            maxWidth: 900,
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
                placeholder="Tìm công ty, ngành nghề"
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
                minWidth: 200,
                appearance: 'none',
                background: `${C.white} ${BG.dropdown}`
              }}
            >
              <option value="">Tất cả ngành nghề</option>
              <option value="fnb">F&B</option>
              <option value="retail">Bán hàng</option>
              <option value="education">Giáo dục</option>
              <option value="tech">Công nghệ</option>
            </select>

            <button style={{
              padding: '12px 32px',
              borderRadius: 8,
              border: 'none',
              background: C.blue,
              color: C.white,
              fontSize: 15,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
              whiteSpace: 'nowrap'
            }}
            onMouseEnter={e => e.currentTarget.style.background = C.purple}
            onMouseLeave={e => e.currentTarget.style.background = C.blue}
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
          {companies.map(company => (
            <CompanyCard key={company.id} company={company} />
          ))}
        </div>

        <div style={{
          ...flex('center'),
          justifyContent: 'center',
          gap: 16
        }}>
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              border: `1px solid ${C.border}`,
              background: C.white,
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              opacity: currentPage === 1 ? 0.5 : 1,
              ...flex('center'),
              justifyContent: 'center',
              transition: 'all 0.2s'
            }}
          >
            <ChevronLeft size={20} color={C.gray} />
          </button>

          <span style={{ ...txt(15, 500, C.gray) }}>
            1/1 trang
          </span>

          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage >= 1}
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              border: `1px solid ${C.border}`,
              background: C.white,
              cursor: currentPage >= 1 ? 'not-allowed' : 'pointer',
              opacity: currentPage >= 1 ? 0.5 : 1,
              ...flex('center'),
              justifyContent: 'center',
              transition: 'all 0.2s'
            }}
          >
            <ChevronRight size={20} color={C.gray} />
          </button>
        </div>
      </section>

      <style>{`
        input:focus, select:focus {
          border-color: ${C.blue} !important;
        }
        input::placeholder {
          color: ${C.grayLight};
        }
      `}</style>
    </div>
  );
}