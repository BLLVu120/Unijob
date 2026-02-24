import { 
  MapPin, ChevronLeft, ChevronRight, Coffee, ShoppingCart, Users, Monitor, 
  Megaphone, Truck, Palette, FileText 
} from 'lucide-react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faCheckCircle, faLocationDot, faClock, faHourglassHalf, 
  faHeart, faCircleInfo, faMagnifyingGlass
} from "@fortawesome/free-solid-svg-icons";
import { COLORS } from '../constants/colors';
import { flex, txt } from '../utils/styles'; 

const HeroSection = () => (
  <section style={{
    background: `linear-gradient(135deg, rgba(102, 126, 234) 0%, rgba(255, 132, 0) 100%)`,
    padding: '80px 48px 120px',
    textAlign: 'center',
    position: 'relative',
    overflow: 'hidden'
  }}>
    <h1 style={{
      fontSize: '48px',
      fontWeight: '700',
      color: COLORS.white,
      marginBottom: '16px',
      letterSpacing: '-0.5px'
    }}>
      UNIJOB - Tìm việc làm part-time
    </h1>
    <p style={{
      fontSize: '18px',
      color: COLORS.white,
      opacity: 0.95,
      marginBottom: '40px',
      fontWeight: '400'
    }}>
      Hơn 10.000+ công việc part-time đang chờ bạn
    </p>
    <div style={{
      maxWidth: '800px',
      margin: '0 auto',
      display: 'flex',
      gap: '0',
      background: COLORS.white,
      borderRadius: '28px',
      padding: '8px',
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)'
    }}>
      <input
        type="text"
        placeholder="Vị trí tuyển dụng, tên công ty"
        style={{
          flex: 1,
          border: 'none',
          outline: 'none',
          padding: '12px 20px',
          fontSize: '15px',
          color: COLORS.navy,
          background: 'transparent'
        }}
      />
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginRight: '10px',
        padding: '0 16px',
        borderLeft: `1px solid ${COLORS.lightBg}`,
        cursor: 'pointer'
      }}>
        <MapPin size={18} color={COLORS.gray} />
        <span style={{
          fontSize: '15px',
          color: COLORS.navy,
          fontWeight: '500'
        }}>
          Địa điểm
        </span>
        <span style={{ fontSize: '12px', color: COLORS.gray }}>▼</span>
      </div>
      <button style={{
        padding: '12px 20px',
        borderRadius: '20px',
        border: 'none',
        background: COLORS.purple,
        color: COLORS.white,
        fontSize: '15px',
        fontWeight: '600',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        transition: 'all 0.2s',
        boxShadow: '0 4px 12px rgba(124, 124, 246, 0.3)'
      }}>
        <FontAwesomeIcon icon={faMagnifyingGlass} /> Tìm kiếm
      </button>
    </div>
  </section>
);

const CategoryCard = ({ icon: Icon, title, count }) => (
  <div style={{
    background: COLORS.purple,
    borderRadius: '20px',
    padding: '40px 24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
    cursor: 'pointer',
    transition: 'all 0.3s',
    boxShadow: '0 4px 12px rgba(124, 124, 246, 0.2)',
    minWidth: '160px'
  }}
  onMouseEnter={e => {
    e.currentTarget.style.transform = 'translateY(-8px)';
    e.currentTarget.style.boxShadow = '0 12px 24px rgba(124, 124, 246, 0.3)';
  }}
  onMouseLeave={e => {
    e.currentTarget.style.transform = 'translateY(0)';
    e.currentTarget.style.boxShadow = '0 4px 12px rgba(124, 124, 246, 0.2)';
  }}
  >
    <div style={{
      width: '64px',
      height: '64px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <Icon size={48} color={COLORS.white} strokeWidth={1.5} />
    </div>
    <h3 style={{
      fontSize: '16px',
      fontWeight: '600',
      color: COLORS.white,
      margin: 0,
      textAlign: 'center'
    }}>
      {title}
    </h3>
    <p style={{
      fontSize: '14px',
      color: COLORS.white,
      opacity: 0.9,
      margin: 0
    }}>
      {count}
    </p>
  </div>
);

const CategoriesSection = () => {
  const categories = [
    { icon: Coffee, title: 'F&B - Nhà hàng', count: '1.234 việc làm' },
    { icon: ShoppingCart, title: 'Bán hàng', count: '856 việc làm' },
    { icon: Users, title: 'Gia sư - Dạy học', count: '642 việc làm' },
    { icon: Monitor, title: 'Công nghệ thông tin', count: '523 việc làm' },
    { icon: Megaphone, title: 'Marketing', count: '445 việc làm' },
    { icon: Truck, title: 'Giao hàng', count: '389 việc làm' },
    { icon: Palette, title: 'Thiết kế', count: '312 việc làm' },
    { icon: FileText, title: 'Hành chính', count: '267 việc làm' }
  ];

  return (
    <section
      style={{
        background: COLORS.navyDark,
        padding: '80px 48px'
      }}
    >
      <h2
        style={{
          fontSize: '36px',
          fontWeight: '700',
          color: COLORS.white,
          textAlign: 'center',
          marginBottom: '48px',
          letterSpacing: '1px'
        }}
      >
        NGÀNH NGHỀ PHỔ BIẾN
      </h2>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '24px',                         
          maxWidth: '1200px',
          margin: '0 auto'
        }}
      >
        {categories.map((cat, idx) => (
          <CategoryCard key={idx} {...cat} />
        ))}
      </div>
    </section>
  );
};

const JobCard = ({ icon: Icon, title, company, location, schedule, salary }) => (
  <div style={{
    background: COLORS.white,
    borderRadius: '16px',
    padding: '24px',
    display: 'flex',
    gap: '20px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
    transition: 'all 0.3s',
    cursor: 'pointer',
    border: `1px solid ${COLORS.lightBg}`
  }}
  onMouseEnter={e => {
    e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.12)';
    e.currentTarget.style.transform = 'translateY(-4px)';
  }}
  onMouseLeave={e => {
    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)';
    e.currentTarget.style.transform = 'translateY(0)';
  }}
  >
    <div style={{
      width: '64px',
      height: '64px',
      borderRadius: '12px',
      background: COLORS.purple,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0
    }}>
      <Icon size={36} color={COLORS.white} />
    </div>
    <div style={{ flex: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
        <h3 style={{
          fontSize: '18px',
          fontWeight: '600',
          color: COLORS.navy,
          margin: 0
        }}>
          {title}
        </h3>
        <span style={{
          fontSize: '12px',
          color: COLORS.gray,
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          <FontAwesomeIcon icon={faClock} /> Đăng 2 giờ trước
        </span>
      </div>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        marginBottom: '8px'
      }}>
        <p style={{
          fontSize: '14px',
          color: COLORS.navy,
          margin: 0,
          fontWeight: '500'
        }}>
          {company}
        </p>
        <FontAwesomeIcon icon={faCheckCircle} size="sm" color={COLORS.blue} />
      </div>
      <div style={{
        display: 'flex',
        gap: '16px',
        fontSize: '13px',
        color: COLORS.gray,
        marginBottom: '20px'
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <FontAwesomeIcon icon={faLocationDot} /> {location}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <FontAwesomeIcon icon={faHourglassHalf} /> {schedule}
        </span>
      </div>
      <div style={{ 
        ...flex('center'), 
        justifyContent: 'space-between', 
      }}>
        <div>
          <span style={{ ...txt(12, 400, COLORS.gray), display: 'block', marginBottom: 4 }}>
            Mức lương
          </span>
          <span style={{ ...txt(16, 700, COLORS.blueText) }}>
            {salary}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button style={{
            padding: '8px 15px',
            borderRadius: '20px',
            border: 'none',
            background: COLORS.pink,
            color: COLORS.white,
            fontSize: '13px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: '0 2px 8px rgba(236, 72, 153, 0.25)'
          }}>
            <FontAwesomeIcon icon={faHeart} /> Lưu lại
          </button>
          <button style={{
            padding: '8px 15px',
            borderRadius: '20px',
            border: 'none',
            background: COLORS.blue,
            color: COLORS.white,
            fontSize: '13px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: '0 2px 8px rgba(59, 130, 246, 0.25)'
          }}>
            <FontAwesomeIcon icon={faCircleInfo} /> Chi tiết
          </button>
        </div>
      </div>
    </div>
  </div>
);

const JobsSection = () => {
  const jobs = [
    {
      icon: Coffee,
      title: 'Nhân viên Phục vụ Part-time',
      company: 'The Coffee House',
      location: 'Quận 1, TP.HCM',
      schedule: 'Không yêu cầu',
      salary: '25.000-30.000 VNĐ/giờ',
      isSaved: false
    },
    {
      icon: Users,
      title: 'Gia sư Toán - Lý',
      company: 'Tuần Việt',
      location: 'Online/Offline',
      schedule: '1 tiếng',
      salary: '150.000-200.000 VNĐ/giờ',
      isSaved: false
    },
    {
      icon: ShoppingCart,
      title: 'Nhân viên Bán hàng Cuối tuần',
      company: 'Fashion Store ABC',
      location: 'Quận 3, TP.HCM',
      schedule: 'Không yêu cầu',
      salary: '22.000-28.000 VNĐ/giờ',
      isSaved: false
    },
    {
      icon: Palette,
      title: 'Graphic Designer Part-time',
      company: 'Creative Studio Pro',
      location: 'Quận 1, TP.HCM',
      schedule: 'Không yêu cầu',
      salary: '30.000-40.000 VNĐ/giờ',
      isSaved: false
    }
  ];

  return (
    <section style={{
      background: `rgba(143, 160, 216) 0%`,
      padding: '80px 48px'
    }}>
      <h2 style={{
        fontSize: '36px',
        fontWeight: '700',
        color: COLORS.white,
        textAlign: 'center',
        marginBottom: '24px',
        letterSpacing: '1px'
      }}>
        TÌM VIỆC LÀM
      </h2>
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '16px',
        marginBottom: '48px'
      }}>
        <button style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          border: '#667eea',
          background: COLORS.white,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ position: 'relative' }}>
            <ChevronLeft
              size={20}
              stroke="#000"
              style={{       
                transform: 'translateY(10%)'
              }}
            />
          </div>
        </button>
        <span style={{
          fontSize: '14px',
          fontWeight: '600',
          color: COLORS.white
        }}>
          1/1 trang
        </span>
        <button style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          border: 'none',
          background: COLORS.white,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ position: 'relative' }}>
            <ChevronRight
              size={20}
              stroke="#000"
              style={{       
                transform: 'translateY(10%)'
              }}
            />
          </div>
        </button>
      </div>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
        gap: '24px'
      }}>
        {jobs.map((job, idx) => (
          <JobCard key={idx} {...job} />
        ))}
      </div>
    </section>
  );
};

export default function Home() {
  return (
    <div style={{
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      margin: 0,
      padding: 0
    }}>
      <HeroSection />
      <CategoriesSection />
      <JobsSection />
    </div>
  );
}