import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Building2, CheckCircle, Clock, Search, Eye, X, FileText, Hash, Layers, Users, Globe, Mail, MapPin, Briefcase, FileSearch, Check, ChevronDown
} from 'lucide-react';
import { flex, txt, card, field } from '../../utils/styles';
import { COLORS, TILE_GRADIENTS, GRADIENT } from '../../constants/colors';
import { PAGE_BTN_STYLE } from '../../constants/pageBtnStyle';
import { getAllEmployers, setEmployerVerified } from '../../services/authService';
import { jobService } from '../../services/jobService';
import { verifyTaxCode } from '../../services/verificationService';
import { isJobOpen, normalize } from '../../utils/jobFormat';
import PageHeader from '../../components/PageHeader';
import { ProfileDialog, ProfileCard, TileGrid, InfoTile, EmailText } from '../../components/ProfileKit';
import Toast from '../../components/Toast';
import { formatDate } from '../../utils/textUtils';
const C = COLORS;


// Hộp thoại chi tiết doanh nghiệp — cùng bố cục trang hồ sơ công ty
const CompanyDetailModal = ({ open, onClose, company, onApprove, onReject, busy }) => {
  const [lookup, setLookup] = useState(null);
  const [lookingUp, setLookingUp] = useState(false);

  if (!open || !company) return null;

  const handleLookup = async () => {
    setLookingUp(true);
    try {
      setLookup(await verifyTaxCode(company.taxCode));
    } catch (err) {
      setLookup({ is_valid: false, error: err.message });
    } finally {
      setLookingUp(false);
    }
  };

  const verified = company.status === 'verified';
  const fields = [
    { icon: Hash, label: 'Mã số thuế', value: company.taxCode },
    { icon: Layers, label: 'Ngành nghề', value: company.field },
    { icon: Users, label: 'Quy mô', value: company.scope },
    { icon: Globe, label: 'Website', value: company.websiteRaw },
    { icon: Mail, label: 'Email', value: company.email && <EmailText email={company.email} /> },
    { icon: MapPin, label: 'Địa chỉ', value: company.addressRaw }
  ].map((f, i) => ({ ...f, gradient: TILE_GRADIENTS[i] }));

  const footer = verified ? (
    <button onClick={onReject} disabled={busy} style={{
      height: 42, padding: '0 22px', borderRadius: 12, border: 'none', background: C.red, color: C.white,
      fontSize: 14, fontWeight: 600, cursor: busy ? 'wait' : 'pointer', opacity: busy ? 0.7 : 1, ...flex('center'), gap: 8
    }}>
      <X size={16} /> Hủy xác thực
    </button>
  ) : (
    <button onClick={onApprove} disabled={busy} style={{
      height: 42, padding: '0 22px', borderRadius: 12, border: 'none', background: C.green, color: C.white,
      fontSize: 14, fontWeight: 600, cursor: busy ? 'wait' : 'pointer', opacity: busy ? 0.7 : 1, ...flex('center'), gap: 8
    }}>
      <CheckCircle size={16} /> Xác thực doanh nghiệp
    </button>
  );

  return (
    <ProfileDialog open={open} onClose={onClose} footer={footer}>
      <ProfileCard
        flat
        initials={company.avatar}
        name={company.name}
        verified={verified}
        badges={[
          { icon: Building2, label: 'Nhà tuyển dụng', tone: 'purple' },
          verified
            ? { icon: CheckCircle, label: 'Doanh nghiệp đã xác thực', tone: 'green' }
            : { icon: Clock, label: 'Chờ xác thực', tone: 'orange' },
          { icon: Briefcase, label: `${company.jobCount} việc đang tuyển`, tone: 'purple' }
        ]}
      >
        <TileGrid>
          {fields.map(f => <InfoTile key={f.label} {...f} />)}
        </TileGrid>

        {/* Mô tả công ty */}
        <div style={{
          marginTop: 16, padding: '16px 20px', borderRadius: 14,
          background: C.grayBg, borderLeft: `4px solid ${C.purple}`
        }}>
          <p style={{ ...txt(14, 600, C.gray), marginBottom: 8, ...flex('center'), gap: 7 }}>
            <FileText size={16} /> Mô tả công ty
          </p>
          <p style={{ ...txt(15, 400, company.description ? C.darkGray : C.grayLight), lineHeight: 1.7, whiteSpace: 'pre-line' }}>
            {company.description || 'Công ty chưa cập nhật mô tả.'}
          </p>
        </div>

        {/* Tra cứu mã số thuế */}
        <div style={{
          marginTop: 16, padding: '14px 16px', borderRadius: 14, border: `1px solid ${C.border}`,
          ...flex('center'), gap: 14, flexWrap: 'wrap'
        }}>
          <span style={{
            width: 40, height: 40, borderRadius: 12, background: C.blueLight, flexShrink: 0,
            ...flex('center'), justifyContent: 'center'
          }}>
            <FileSearch size={19} color={C.purple} />
          </span>
          <div style={{ flex: 1, minWidth: 200 }}>
            <p style={{ ...txt(14, 700) }}>Tra cứu mã số thuế {company.taxCode || ''}</p>
            <p style={{ ...txt(13, 400, C.gray), marginTop: 2 }}>Đối chiếu với dữ liệu doanh nghiệp quốc gia</p>
          </div>
          <button
            onClick={handleLookup}
            disabled={lookingUp || !company.taxCode}
            style={{
              height: 38, padding: '0 16px', borderRadius: 10, border: `1px solid ${C.blueBorder}`,
              background: C.blueLight, color: C.purple, fontSize: 13, fontWeight: 600,
              cursor: lookingUp ? 'wait' : !company.taxCode ? 'not-allowed' : 'pointer',
              opacity: company.taxCode ? 1 : 0.5, ...flex('center'), gap: 6
            }}
          >
            <Search size={14} /> {lookingUp ? 'Đang tra cứu...' : 'Tra cứu'}
          </button>
        </div>

        {/* Kết quả tra cứu — cùng kiểu thẻ kết quả ở trang Xác thực: icon gradient | tiêu đề + mô tả | nhãn */}
        {lookup && (() => {
          const ok = !!lookup.company_info || lookup.is_valid;
          const info = lookup.company_info;
          const tone = ok ? C.green : C.red;
          const ResultIcon = ok ? Check : X;
          return (
            <div style={{
              marginTop: 16, borderRadius: 16, overflow: 'hidden', animation: 'slideDown .2s ease',
              border: `1px solid ${ok ? C.greenBorder : C.redBorder}`, background: ok ? C.greenBg : C.redBg
            }}>
              <div style={{ ...flex('center'), gap: 16, padding: '18px 20px' }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 16, flexShrink: 0,
                  background: ok ? GRADIENT.success : GRADIENT.danger,
                  ...flex('center'), justifyContent: 'center', boxShadow: '0 6px 16px rgba(15, 23, 42, 0.12)'
                }}>
                  <ResultIcon size={26} color={C.white} strokeWidth={2.75} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ ...txt(17, 700), lineHeight: 1.35 }}>
                    {info ? info.name : ok ? 'Mã số thuế đúng định dạng' : 'Không xác minh được mã số thuế'}
                  </p>
                  <p style={{ ...txt(13, 400, C.gray), marginTop: 2 }}>
                    {info ? (info.internationalName || 'Thông tin đăng ký theo mã số thuế')
                      : lookup.error || (ok ? 'Không lấy được chi tiết doanh nghiệp' : 'Mã số thuế không hợp lệ')}
                  </p>
                </div>
                <span style={{
                  padding: '5px 12px', borderRadius: 999, fontSize: 12, fontWeight: 600, flexShrink: 0,
                  background: C.white, color: tone, border: `1px solid ${ok ? C.greenBorder : C.redBorder}`
                }}>
                  {info ? 'Tìm thấy' : ok ? 'Hợp lệ' : 'Không hợp lệ'}
                </span>
              </div>
              {info?.address && (
                <div style={{
                  ...flex('flex-start'), gap: 8, padding: '12px 20px', background: C.white,
                  borderTop: `1px solid ${C.greenBorder}`, ...txt(14, 400, C.darkGray), lineHeight: 1.6
                }}>
                  <MapPin size={16} color={C.green} style={{ flexShrink: 0, marginTop: 2 }} />
                  <span><span style={{ ...txt(14, 600, C.gray) }}>Địa chỉ đăng ký: </span>{info.address}</span>
                </div>
              )}
            </div>
          );
        })()}
      </ProfileCard>
    </ProfileDialog>
  );
};

const initials = (name) =>
  (name || '?').trim().split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase();

const STATUS_STYLE = {
  verified: { label: 'Đã xác thực', bg: C.greenBg, text: C.green },
  pending: { label: 'Chờ xác thực', bg: C.yellowBg, text: C.amber }
};

const loadCompanies = async () => {
  const [employers, jobs] = await Promise.all([getAllEmployers(), jobService.getAllJobs()]);
  return employers.map(emp => {
    const status = emp.is_verified ? 'verified' : 'pending';
    const openJobs = jobs.filter(j => j.employer_id === emp.emp_id && isJobOpen(j)).length;
    return {
      id: emp.emp_id,
      email: emp.email,
      name: emp.emp_name,
      taxCode: emp.tax_code,
      taxId: emp.tax_code ? `MST: ${emp.tax_code}` : 'Chưa có MST',
      industry: emp.field || '—',
      field: emp.field || '',
      jobCount: openJobs,
      jobs: `${openJobs} việc`,
      status,
      statusLabel: STATUS_STYLE[status].label,
      statusColor: STATUS_STYLE[status].bg,
      statusText: STATUS_STYLE[status].text,
      avatar: initials(emp.emp_name),
      bgColor: C.purple,
      registeredDate: formatDate(emp.created_at),
      createdAt: emp.created_at,
      size: emp.scope || '—',
      website: emp.website || '—',
      address: emp.address || '—',
      scope: emp.scope || '',
      websiteRaw: emp.website || '',
      addressRaw: emp.address || '',
      description: emp.description || ''
    };
  });
};

const SORTS = {
  newest: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  oldest: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
  name: (a, b) => a.name.localeCompare(b.name),
  jobs: (a, b) => b.jobCount - a.jobCount
};

const SELECT_STYLE = {
  ...field({ padding: '0 40px 0 14px' }), minWidth: 170, fontSize: 14, color: C.darkGray,
  outline: 'none', cursor: 'pointer', appearance: 'none', WebkitAppearance: 'none'
};

const STATUS_TABS = [
  { id: '', label: 'Tất cả' },
  { id: 'verified', label: 'Đã xác thực' },
  { id: 'pending', label: 'Chờ xác thực' }
];

export default function CompanyManagement() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState(null);
  const clearNotice = useCallback(() => setNotice(null), []);
  const [busy, setBusy] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({ q: '', status: '', field: '', sort: 'newest' });

  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [page, setPage] = useState(1);

  const reload = () =>
    loadCompanies()
      .then(setCompanies)
      .catch(err => setNotice({ type: 'error', text: `Không tải được danh sách: ${err.message}` }))
      .finally(() => setLoading(false));

  useEffect(() => { reload(); }, []);

  const fields = useMemo(() => [...new Set(companies.map(c => c.field).filter(Boolean))].sort(), [companies]);

  const displayCompanies = useMemo(() => {
    const q = normalize(filters.q.trim());
    return companies
      .filter(c =>
        (!q || normalize(`${c.name} ${c.taxCode} ${c.email}`).includes(q)) &&
        (!filters.status || c.status === filters.status) &&
        (!filters.field || c.field === filters.field)
      )
      .sort(SORTS[filters.sort]);
  }, [companies, filters]);

  const rowsPerPage = 5;
  const total = displayCompanies.length;
  const totalPages = Math.max(1, Math.ceil(total / rowsPerPage));
  const start = (page - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  const currentCompanies = displayCompanies.slice(start, end);

  const stats = [
    { icon: Building2, bgColor: C.grayBg, label: 'Tổng doanh nghiệp', value: companies.length },
    { icon: CheckCircle, bgColor: C.greenBg, label: 'Đã xác thực', value: companies.filter(c => c.status === 'verified').length },
    { icon: Clock, bgColor: C.yellowBg, label: 'Chờ xác thực', value: companies.filter(c => c.status === 'pending').length }
  ];

  const applyFilters = () => {
    setFilters(f => ({ ...f, q: searchQuery }));
    setPage(1);
  };

  // Chip trạng thái / ngành nghề: lọc ngay khi bấm
  const selectChip = (key, value) => {
    setFilters(f => ({ ...f, [key]: value }));
    setPage(1);
  };


  const setVerified = async (verified) => {
    const target = selectedCompany;
    setBusy(true);
    try {
      await setEmployerVerified(target.email, verified);
      setNotice({ type: 'success', text: `${verified ? 'Đã xác thực' : 'Đã hủy xác thực'} doanh nghiệp ${target.name}` });
      setViewModalOpen(false);
      setSelectedCompany(null);
      reload();
    } catch (err) {
      setNotice({ type: 'error', text: err.message });
    } finally {
      setBusy(false);
    }
  };

  const handleApprove = () => setVerified(true);

  const handleReject = () => {
    if (selectedCompany?.status === 'verified') {
      setVerified(false);
    } else {
      setNotice({ type: 'success', text: `Doanh nghiệp ${selectedCompany?.name} vẫn ở trạng thái chưa xác thực` });
      setViewModalOpen(false);
      setSelectedCompany(null);
    }
  };

  return (
    <div style={{
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      background: C.grayBg,
      minHeight: '100vh'
    }}>
      <main style={{ marginLeft: 240, padding: '40px 48px' }}>
        <PageHeader
          title="Doanh nghiệp"
          subtitle="Quản lý và xác thực các doanh nghiệp trên Unijob"
        />
        <Toast message={notice} onClose={clearNotice} />
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
          gap: 16,
          marginBottom: 24
        }}>
          {stats.map((stat, i) => (
            // Cùng kiểu thẻ thông số trang Tin tuyển dụng: icon trái, nhãn giữa, số sát phải
            <div key={i} style={{
              background: C.white, borderRadius: 16, border: `1px solid ${C.border}`,
              padding: '16px 20px', ...flex('center'), gap: 16
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: 12, flexShrink: 0,
                background: stat.bgColor, ...flex('center'), justifyContent: 'center'
              }}>
                <stat.icon size={24} color={C.navy} />
              </div>
              <p style={{ ...txt(14, 500, C.gray), flex: 1, minWidth: 0 }}>{stat.label}</p>
              <p style={{ ...txt(26, 700), flexShrink: 0 }}>{loading ? '…' : stat.value}</p>
            </div>
          ))}
        </div>

        {/* Thẻ tìm kiếm: ô tìm + sắp xếp + nút */}
        <div style={{ ...card(), padding: 14, marginBottom: 14, ...flex('center'), gap: 10 }}>
          <div style={{ ...flex('center'), gap: 10, flex: 1, ...field() }}>
            <Search size={18} color={C.grayLight} />
            <input
              placeholder="Tìm kiếm theo tên công ty, mã số thuế, email..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && applyFilters()}
              style={{ border: 'none', outline: 'none', boxShadow: 'none', fontSize: 14, flex: 1, background: 'transparent' }}
            />
          </div>
          {/* Ẩn mũi tên mặc định, dùng icon riêng căn giữa (giống dropdown các trang khác) */}
          <div style={{ position: 'relative' }}>
            <select
              value={filters.sort}
              onChange={e => { setFilters(f => ({ ...f, sort: e.target.value })); setPage(1); }}
              title="Sắp xếp"
              style={SELECT_STYLE}
            >
              <option value="newest">Mới đăng ký</option>
              <option value="oldest">Cũ nhất</option>
              <option value="name">Tên A-Z</option>
              <option value="jobs">Nhiều việc làm</option>
            </select>
            <ChevronDown size={16} color={C.gray} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          </div>
          <button
            onClick={applyFilters}
            style={{
              height: 44, padding: '0 22px', borderRadius: 12, border: 'none', background: C.purple,
              color: C.white, fontSize: 14, fontWeight: 600, cursor: 'pointer', ...flex('center'), gap: 8
            }}
          >
            <Search size={16} /> Tìm kiếm
          </button>
        </div>

        {/* Thẻ lọc: trạng thái + ngành nghề, bấm chip là lọc ngay */}
        <div style={{ ...card(), padding: '12px 16px', marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { label: 'Trạng thái:', key: 'status', tabs: STATUS_TABS, count: id => companies.filter(c => c.status === id).length },
            {
              label: 'Ngành nghề:', key: 'field',
              tabs: [{ id: '', label: 'Tất cả' }, ...fields.map(f => ({ id: f, label: f }))],
              count: id => companies.filter(c => c.field === id).length
            }
          ].map(group => (
            <div key={group.key} style={{ ...flex('center'), gap: 10, flexWrap: 'wrap' }}>
              <span style={{ ...txt(14, 600, C.gray), width: 96, flexShrink: 0 }}>{group.label}</span>
              {group.tabs.map(tab => {
                const active = filters[group.key] === tab.id;
                const n = tab.id ? group.count(tab.id) : companies.length;
                return (
                  <button
                    key={tab.id || 'all'}
                    onClick={() => selectChip(group.key, tab.id)}
                    style={{
                      height: 34, padding: '0 14px', borderRadius: 999, cursor: 'pointer',
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
                      {n}
                    </span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        <div style={{
          background: C.white,
          borderRadius: 16,
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          {currentCompanies.length > 0 ? (
            <>
              <div style={{
                padding: '20px 24px',
                borderBottom: `1px solid ${C.border}`
              }}>
                <h2 style={{ ...txt(18, 700) }}>
                  Danh sách doanh nghiệp ({displayCompanies.length.toLocaleString()})
                </h2>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: C.grayBg }}>
                    {['DOANH NGHIỆP', 'NGÀNH NGHỀ', 'VIỆC LÀM', 'TRẠNG THÁI', 'THAO TÁC'].map(h => (
                      <th key={h} style={{
                        ...txt(12, 700, C.gray),
                        textAlign: 'left',
                        padding: '16px 20px',
                        textTransform: 'uppercase'
                      }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {currentCompanies.map(company => (
                    <tr key={company.id} style={{ borderTop: `1px solid ${C.border}` }}>
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ ...flex('center'), gap: 12 }}>
                          <div style={{
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            background: company.bgColor,
                            ...flex('center'),
                            justifyContent: 'center'
                          }}>
                            <span style={{ ...txt(14, 700, C.white) }}>{company.avatar}</span>
                          </div>
                          <div>
                            <p style={{ ...txt(14, 600) }}>{company.name}</p>
                            <p style={{ ...txt(13, 400, C.gray) }}>{company.taxId}</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{ ...txt(14, 400) }}>{company.industry}</span>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{ ...txt(14, 400) }}>{company.jobs}</span>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{
                          padding: '6px 14px',
                          borderRadius: 16,
                          background: company.statusColor,
                          color: company.statusText,
                          fontSize: 13,
                          fontWeight: 600
                        }}>
                          {company.statusLabel}
                        </span>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ ...flex('center'), gap: 8 }}>
                          <button
                            onClick={() => {
                              setSelectedCompany(company);
                              setViewModalOpen(true);
                            }}
                            title="Xem chi tiết"
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: 10,
                              border: 'none',
                              background: C.blueLight,
                              cursor: 'pointer',
                              ...flex('center'),
                              justifyContent: 'center'
                            }}
                          >
                            <Eye size={17} color={C.purple} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{
                padding: '16px 20px',
                borderTop: `1px solid ${C.border}`,
                ...flex('center'),
                justifyContent: 'space-between'
              }}>
                <span style={{ ...txt(14, 400, C.gray) }}>
                  Hiển thị {start + 1}-{Math.min(end, total)} trong tổng số {total} doanh nghiệp
                </span>
                <div style={{ ...flex('center'), gap: 8 }}>
                  {totalPages > 3 && page > 1 && (
                      <button onClick={() => setPage(page - 1)} style={PAGE_BTN_STYLE}>←</button>
                  )}
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(p => p >= page - 1 && p <= page + 1)
                    .map(p => (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        style={{
                            ...PAGE_BTN_STYLE,
                            border: p === page ? 'none' : PAGE_BTN_STYLE.border,
                            background: p === page ? C.blue : PAGE_BTN_STYLE.background,
                            color: p === page ? C.white : undefined
                        }}
                      >
                        {p}
                      </button>
                    ))}
                    {totalPages > 3 && page < totalPages && (
                        <button onClick={() => setPage(page + 1)} style={PAGE_BTN_STYLE}>→</button>
                    )}
                </div>
              </div>
            </>
          ) : (
            <div style={{
              padding: '80px 40px',
              textAlign: 'center'
            }}>
              <div style={{
                width: 88,
                height: 88,
                borderRadius: '50%',
                background: C.grayBg,
                margin: '0 auto 20px',
                ...flex('center'),
                justifyContent: 'center'
              }}>
                <Building2 size={40} color={C.grayLight} />
              </div>
              <h3 style={{ ...txt(20, 600), marginBottom: 8 }}>
                {loading ? 'Đang tải...' : companies.length ? 'Không có doanh nghiệp phù hợp với bộ lọc' : 'Chưa có doanh nghiệp nào'}
              </h3>
              <p style={{
                ...txt(15, 400, C.gray),
                maxWidth: 400,
                margin: '0 auto 24px'
              }}>
                Danh sách doanh nghiệp sẽ xuất hiện tại đây khi có công ty đăng ký tài khoản mới.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      <CompanyDetailModal
        key={selectedCompany?.id}
        open={viewModalOpen}
        onClose={() => {
          setViewModalOpen(false);
          setSelectedCompany(null);
        }}
        company={selectedCompany}
        onApprove={handleApprove}
        onReject={handleReject}
        busy={busy}
      />

    </div>
  );
}