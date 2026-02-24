import { useState } from 'react';
import { Search, Download, CheckCircle, XCircle, FileText } from 'lucide-react';
import { flex, txt } from '../utils/styles';
import { COLORS } from '../constants/colors';
import { pageBtnStyle } from "../constants/pageBtnStyle";
const C = COLORS;

export default function TransactionHistoryPage() {
  const transactions = [
    {
      id: 'TXN001234',
      date: '01/01/2025',
      service: 'Gói Professional',
      method: 'Chuyển khoản',
      amount: '2.000.000',
      status: 'success'
    },
    {
      id: 'TXN001156',
      date: '15/12/2024',
      service: 'Làm mới tin tuyển dụng',
      method: 'Chuyển khoản',
      amount: '500.000',
      status: 'success'
    },
    {
      id: 'TXN001089',
      date: '15/12/2024',
      service: 'Gói Professional',
      method: 'Ví điện tử',
      amount: '2.000.000',
      status: 'success'
    },
    {
      id: 'TXN000923',
      date: '10/12/2024',
      service: 'Gói Basic',
      method: 'Thẻ tín dụng',
      amount: '500.000',
      status: 'success'
    },
    {
      id: 'TXN002005',
      date: '08/10/2024',
      service: 'Gói Basic',
      method: 'Thẻ tín dụng',
      amount: '500.000',
      status: 'failed'
    }
  ];
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [packageFilter, setPackageFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [page, setPage] = useState(1);
  const rowsPerPage = 5;
  const total = transactions.length;
  const totalPages = Math.ceil(total / rowsPerPage);
  const start = (page - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  const currentTransactions = transactions.slice(start, end);

  const displayTransactions = transactions;

  return (
    <div style={{
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      background: C.grayBg, minHeight: '100vh'
    }}>

     <main style={{ padding: '40px 48px' }}>
        <div style={{ 
          ...flex('center'), 
          justifyContent: 'space-between', 
          marginBottom: 32 
        }}>
          <h1 style={{ ...txt(32, 700) }}>Lịch sử giao dịch</h1>
          <button style={{
            padding: '10px 24px', borderRadius: 10,
            border: `1px solid ${C.border}`,
            background: C.white, color: C.blue,
            fontSize: 14, fontWeight: 600, cursor: 'pointer',
            ...flex('center'), gap: 8
          }}>
            <Download size={16} /> Xuất báo cáo
          </button>
        </div>

        <div style={{
          background: C.white, borderRadius: 16,
          border: `1px solid ${C.border}`,
          padding: '20px 24px', marginBottom: 24,
          ...flex('center'), gap: 16
        }}>
          <div style={{
            ...flex('center'), gap: 10, flex: 1,
            padding: '10px 14px', borderRadius: 8,
            border: `1px solid ${C.border}`
          }}>
            <Search size={18} color={C.gray} />
            <input
              placeholder="Tìm kiếm lịch sử giao dịch"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                border: 'none', outline: 'none',
                fontSize: 14, flex: 1, background: 'transparent'
              }}
            />
          </div>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            style={{
              padding: '10px 14px', borderRadius: 8,
              border: `1px solid ${C.border}`,
              fontSize: 14, outline: 'none', cursor: 'pointer',
              minWidth: 180,
              appearance: 'none',
              background: `${C.white} url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2364748b' d='M6 9L1 4h10z'/%3E%3C/svg%3E") no-repeat right 14px center`
            }}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="success">Thành công</option>
            <option value="failed">Thất bại</option>
          </select>

          <select
            value={packageFilter}
            onChange={e => setPackageFilter(e.target.value)}
            style={{
              padding: '10px 14px', borderRadius: 8,
              border: `1px solid ${C.border}`,
              fontSize: 14, outline: 'none', cursor: 'pointer',
              minWidth: 180,
              appearance: 'none',
              background: `${C.white} url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2364748b' d='M6 9L1 4h10z'/%3E%3C/svg%3E") no-repeat right 14px center`
            }}
          >
            <option value="">Tất cả gói</option>
            <option value="basic">Gói Basic</option>
            <option value="professional">Gói Professional</option>
            <option value="enterprise">Gói Enterprise</option>
          </select>

          <div style={{
            ...flex('center'), gap: 8,
            padding: '10px 14px', borderRadius: 8,
            border: `1px solid ${C.border}`,
            cursor: 'pointer', minWidth: 180
          }}>
            <input
              type="date"
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value)}
              style={{
                border: 'none',
                outline: 'none',
                fontSize: 14,
                background: 'transparent',
                cursor: 'pointer',
                width: '100%'
              }}
            />
          </div>
          <button style={{
            padding: '10px 32px', borderRadius: 8,
            border: 'none', background: C.blue,
            color: C.white, fontSize: 14, fontWeight: 600,
            cursor: 'pointer', whiteSpace: 'nowrap'
          }}>
            Lọc
          </button>
        </div>

        <div style={{
          background: C.white, borderRadius: 16,
          border: `1px solid ${C.border}`,
          overflow: 'hidden'
        }}>
          {displayTransactions.length > 0 ? (
            <>
              <table style={{
                width: '100%', borderCollapse: 'collapse'
              }}>
                <thead>
                  <tr style={{ background: C.grayBg }}>
                    {['MÃ GIAO DỊCH', 'NGÀY THANH TOÁN', 'DỊCH VỤ', 'PHƯƠNG THỨC', 'SỐ TIỀN', 'TRẠNG THÁI'].map(header => (
                      <th key={header} style={{
                        ...txt(12, 700, C.gray),
                        textAlign: 'left',
                        padding: '16px 20px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {currentTransactions.map((txn, i) => (
                    <tr key={txn.id} style={{
                      borderTop: `1px solid ${C.border}`,
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = C.grayBg}
                    onMouseLeave={e => e.currentTarget.style.background = C.white}
                    >
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{ ...txt(14, 600, C.blueText) }}>
                          {txn.id}
                        </span>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{ ...txt(14, 400) }}>{txn.date}</span>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{ ...txt(14, 400) }}>{txn.service}</span>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{ ...txt(14, 400) }}>{txn.method}</span>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{ ...txt(14, 700) }}>{txn.amount}</span>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        {txn.status === 'success' ? (
                          <span style={{
                            padding: '6px 14px', borderRadius: 16,
                            background: C.greenBg, color: C.green,
                            fontSize: 13, fontWeight: 600,
                            ...flex('center'), gap: 6,
                            display: 'inline-flex'
                          }}>
                            <CheckCircle size={14} /> Thành công
                          </span>
                        ) : (
                          <span style={{
                            padding: '6px 14px', borderRadius: 16,
                            background: C.redBg, color: C.red,
                            fontSize: 13, fontWeight: 600,
                            ...flex('center'), gap: 6,
                            display: 'inline-flex'
                          }}>
                            <XCircle size={14} /> Thất bại
                          </span>
                        )}
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
                  Hiển thị {start + 1}-{Math.min(end, total)} trong tổng số {total} giao dịch
                </span>
                <div style={{ ...flex('center'), gap: 8 }}>
                  {totalPages > 3 && page > 1 && (
                      <button onClick={() => setPage(page - 1)} style={pageBtnStyle}>←</button>
                  )}
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(p => p >= page - 1 && p <= page + 1)
                    .map(p => (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        style={{
                            ...pageBtnStyle,
                            border: p === page ? "none" : pageBtnStyle.border,
                            background: p === page ? C.blue : pageBtnStyle.background,
                            color: p === page ? C.white : undefined
                        }}
                      >
                        {p}
                      </button>
                    ))}
                    {totalPages > 3 && page < totalPages && (
                        <button onClick={() => setPage(page + 1)} style={pageBtnStyle}>→</button>
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
                width: 120,
                height: 120,
                borderRadius: '50%',
                background: C.grayBg,
                margin: '0 auto 24px',
                ...flex('center'),
                justifyContent: 'center'
              }}>
                <FileText size={56} color={C.grayLight} />
              </div>
              <h3 style={{ ...txt(20, 600), marginBottom: 8 }}>
                Chưa có giao dịch nào
              </h3>
              <p style={{ ...txt(15, 400, C.gray), marginBottom: 24, maxWidth: 400, margin: '0 auto' }}>
                Lịch sử giao dịch của bạn sẽ được hiển thị tại đây sau khi bạn thực hiện thanh toán đầu tiên.
              </p>
            </div>
          )}
        </div>
      </main>

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