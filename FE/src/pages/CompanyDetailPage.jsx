import { useState } from 'react';
import {
  Globe, Users, MapPin, Map, Search,
  Heart, Info, ChevronLeft, ChevronRight, Briefcase
} from 'lucide-react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import { flex, txt } from '../utils/styles';
import { COLORS } from '../constants/colors';

const C = COLORS;
const JobCard = ({ job }) => {
  const [saved, setSaved] = useState(false);

  return (
    <div style={{
      background: C.white, borderRadius: 12,
      border: `1px solid ${C.border}`,
      padding: '20px 24px', marginBottom: 16
    }}>
      <div style={{ 
        ...flex('flex-start'), 
        justifyContent: 'space-between', 
        marginBottom: 12 
      }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ ...txt(18, 600), marginBottom: 4 }}>
            {job.title}
          </h3>
          <p style={{ ...txt(14, 500, C.blue) }}>{job.company}</p>
        </div>
        <span style={{ 
          ...txt(13, 400, C.gray), 
          flexShrink: 0,
          ...flex('center'),
          gap: 4
        }}>
          <Clock size={14} /> {job.posted}
        </span>
      </div>

      <div style={{ 
        ...flex('center'), 
        justifyContent: 'space-between',
        paddingTop: 12,
        borderTop: `1px solid ${C.border}`
      }}>
        <div style={{ ...flex('center'), gap: 8 }}>
          <Briefcase size={16} color={C.gray} />
          <span style={{ ...txt(14, 600, C.blueText) }}>{job.salary}</span>
        </div>

        <div style={{ ...flex('center'), gap: 8 }}>
          <button
            onClick={() => setSaved(!saved)}
            style={{
              padding: '6px 16px', borderRadius: 20,
              background: saved ? '#fdf2f8' : C.white,
              border: `1px solid ${saved ? C.pink : C.border}`,
              color: saved ? C.pink : C.navy,
              fontSize: 13, fontWeight: 600,
              cursor: 'pointer',
              ...flex('center'), gap: 6
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
            padding: '6px 16px', borderRadius: 20,
            border: 'none', background: C.blue,
            color: C.white, fontSize: 13, fontWeight: 600,
            cursor: 'pointer', ...flex('center'), gap: 6
          }}>
            <Info size={14} /> Chi tiết
          </button>
        </div>
      </div>
    </div>
  );
};

const Clock = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
);

export default function CompanyDetailPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');

  const company = {
    name: 'THE COFFEE HOUSE',
    logo: 'CH',
    website: 'www.thecoffeehouse.com',
    size: '1000+ nhân viên',
    verified: true,
    address: 'Tầng 3, Tòa nhà VTC Online 18 Tam Trinh, Hai Bà Trưng, Hà Nội',
    description: `The Coffee House hiện tại có hơn 65 cửa hàng ở các thành phố lớn: Hà Nội và TP.Hồ Chí Minh, Biên Hòa và Đà Nẵng với tốc độ phát triển 4-5 cửa hàng mới được mở ra mỗi tháng và phục vụ gần 20.000 lượt khách mỗi ngày với triết lý "Niềm đam mê với hương vị, sự nhiệt thành khi phục vụ, kĩ năng pha chế độc đáo tạo chuyên sâu là tất cả những gì The Coffee House cam kết khi phục vụ bất kì sản phẩm nào cho khách hàng".

Chúng tôi mong muốn xây dựng The Coffee House không chỉ là nơi làm việc mà còn là ngôi nhà thứ hai cho mỗi nhân viên, nơi mỗi người tìm thấy niềm vui trong việc hết lòng giúp đỡ người khác và phần thưởng là tương lai thịnh vượng chung và sự phát triển bản thân thông qua thấu hiểu văn hóa làm việc.

Với sứ mạng trở thành hệ thống cà phê hàng đầu khu vực; The Coffee House luôn tìm kiếm những ứng viên tiềm năng có đam mê và nỗ lực để vươn tới thành công. Chúng tôi chào đón bạn gia nhập vào đội ngũ nhân viên chuyên nghiệp của đại gia đình chúng tôi.`
  };

  const jobs = [
    {
      id: 1,
      title: 'Nhân viên Phục vụ Part-time',
      company: 'The Coffee House',
      salary: '25.000-30.000 VNĐ/giờ',
      posted: 'Đăng 2 giờ trước'
    }
  ];

  return (
    <div style={{
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      background: C.grayBg, minHeight: '100vh'
    }}>
      <main style={{ 
        maxWidth: 1200, 
        margin: '0 auto', 
        padding: '40px 24px',
        display: 'grid',
        gridTemplateColumns: '1fr 420px',
        gap: 32,
        alignItems: 'start'
      }}>
        <div>
          <div style={{
            background: C.white, borderRadius: 16,
            border: `1px solid ${C.border}`,
            padding: '32px', marginBottom: 24
          }}>
            <div style={{ ...flex('center'), gap: 24 }}>
              <div style={{
                width: 90, height: 90, borderRadius: 16,
                background: 'linear-gradient(135deg, #f97316, #fb923c)',
                ...flex('center'), justifyContent: 'center',
                flexShrink: 0
              }}>
                <span style={{ 
                  ...txt(16, 800, C.white), 
                  textAlign: 'center', 
                  lineHeight: 1.2 
                }}>
                  THE<br/>COFFEE<br/>HOUSE
                </span>
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ ...flex('center'), gap: 8, marginBottom: 8 }}>
                  <h1 style={{ ...txt(28, 700) }}>{company.name}</h1>
                  {company.verified && (
                    <FontAwesomeIcon icon={faCheckCircle} size="lg" color={COLORS.blue} />
                  )}
                </div>
                <div style={{ ...flex('center'), gap: 20 }}>
                  <div style={{ ...flex('center'), gap: 6 }}>
                    <Globe size={16} color={C.gray} />
                    <span style={{ ...txt(14, 400, C.gray) }}>
                      {company.website}
                    </span>
                  </div>
                  <div style={{ ...flex('center'), gap: 6 }}>
                    <Users size={16} color={C.gray} />
                    <span style={{ ...txt(14, 400, C.gray) }}>
                      {company.size}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div style={{
            background: `linear-gradient(135deg, ${C.purple}, ${C.purpleDark})`,
            borderRadius: '16px 16px 0 0',
            padding: '20px 32px'
          }}>
            <h2 style={{ ...txt(22, 700, C.white) }}>Giới thiệu công ty</h2>
          </div>
          <div style={{
            background: C.white,
            borderRadius: '0 0 16px 16px',
            border: `1px solid ${C.border}`,
            borderTop: 'none',
            padding: '28px 32px',
            marginBottom: 24
          }}>
            <p style={{ 
              ...txt(15, 400, C.gray), 
              lineHeight: 1.8,
              whiteSpace: 'pre-line'
            }}>
              {company.description}
            </p>
          </div>

          <div style={{
            background: `linear-gradient(135deg, ${C.purple}, ${C.purpleDark})`,
            borderRadius: '16px 16px 0 0',
            padding: '20px 32px'
          }}>
            <h2 style={{ ...txt(22, 700, C.white) }}>Tuyển dụng</h2>
          </div>
          <div style={{
            background: C.white,
            borderRadius: '0 0 16px 16px',
            border: `1px solid ${C.border}`,
            borderTop: 'none',
            padding: '24px 32px'
          }}>
            <div style={{ 
              ...flex('center'), 
              gap: 12, 
              marginBottom: 24 
            }}>
              <div style={{
                ...flex('center'), gap: 10,
                background: C.white,
                border: `1px solid ${C.border}`,
                borderRadius: 8,
                padding: '10px 14px',
                flex: 1
              }}>
                <Search size={18} color={C.gray} />
                <input
                  placeholder="Tìm công việc, vị trí ứng tuyển"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{
                    border: 'none', outline: 'none',
                    fontSize: 14, flex: 1,
                    background: 'transparent'
                  }}
                />
              </div>

              <select
                value={location}
                onChange={e => setLocation(e.target.value)}
                style={{
                  padding: '10px 14px',
                  borderRadius: 8,
                  border: `1px solid ${C.border}`,
                  fontSize: 14,
                  outline: 'none',
                  cursor: 'pointer',
                  minWidth: 200
                }}
              >
                <option value="">Tất cả tỉnh/thành phố</option>
                <option value="hanoi">Hà Nội</option>
                <option value="hcm">TP. Hồ Chí Minh</option>
              </select>

              <button style={{
                padding: '10px 24px',
                borderRadius: 8,
                border: 'none',
                background: C.purple,
                color: C.white,
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer'
              }}>
                Tìm kiếm
              </button>
            </div>

            {jobs.map(job => (
              <JobCard key={job.id} job={job} />
            ))}

            <div style={{ 
              ...flex('center'), 
              justifyContent: 'center', 
              gap: 12,
              marginTop: 24
            }}>
              <button style={{
                width: 36, height: 36, borderRadius: '50%',
                border: `1px solid ${C.border}`,
                background: C.white,
                cursor: 'pointer',
                ...flex('center'), justifyContent: 'center'
              }}>
                <ChevronLeft size={18} color={C.gray} />
              </button>
              <span style={{ ...txt(14, 500, C.gray) }}>1/1 trang</span>
              <button style={{
                width: 36, height: 36, borderRadius: '50%',
                border: `1px solid ${C.border}`,
                background: C.white,
                cursor: 'pointer',
                ...flex('center'), justifyContent: 'center'
              }}>
                <ChevronRight size={18} color={C.gray} />
              </button>
            </div>
          </div>
        </div>

        <div style={{ top: 24 }}>
          <div style={{
            background: `linear-gradient(135deg, ${C.purple}, ${C.purpleDark})`,
            borderRadius: '16px 16px 0 0',
            padding: '18px 24px'
          }}>
            <h3 style={{ ...txt(20, 700, C.white) }}>Thông tin liên hệ</h3>
          </div>
          <div style={{
            background: C.white,
            borderRadius: '0 0 16px 16px',
            border: `1px solid ${C.border}`,
            borderTop: 'none',
            padding: '24px',
            marginBottom: 24
          }}>
            <div style={{ ...flex('flex-start'), gap: 10, marginBottom: 16 }}>
              <MapPin size={20} color={C.gray} style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <h4 style={{ ...txt(14, 600), marginBottom: 4 }}>
                  Địa chỉ công ty
                </h4>
                <p style={{ ...txt(14, 400, C.gray) }}>
                  {company.address}
                </p>
              </div>
            </div>
          </div>

          <div style={{
            background: `linear-gradient(135deg, ${C.purple}, ${C.purpleDark})`,
            borderRadius: '16px 16px 0 0',
            padding: '18px 24px'
          }}>
            <h3 style={{ 
              ...txt(20, 700, C.white),
              ...flex('center'),
              gap: 8
            }}>
              <Map size={20} /> Xem bản đồ
            </h3>
          </div>
          <div style={{
            background: C.white,
            borderRadius: '0 0 16px 16px',
            border: `1px solid ${C.border}`,
            borderTop: 'none',
            overflow: 'hidden'
          }}>
            <div style={{
              width: '100%',
              height: 300,
              background: '#e0e7ff',
              position: 'relative',
              ...flex('center'),
              justifyContent: 'center'
            }}>
              <MapPin size={48} color={C.purple} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}