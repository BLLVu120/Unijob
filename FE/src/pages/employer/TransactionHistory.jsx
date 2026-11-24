import { useState, useEffect, useMemo } from 'react';
import { Search, Download, CheckCircle, XCircle, FileText, Clock } from 'lucide-react';
import { flex, txt, card, field } from '../../utils/styles';
import { COLORS } from '../../constants/colors';
import { PAGE_BTN_STYLE } from '../../constants/pageBtnStyle';
import { getCurrentUser } from '../../services/authService';
import { getTransactions, describeTransaction, parseProvider } from '../../services/paymentService';
import PageHeader from '../../components/PageHeader';
import { formatNumber } from '../../utils/textUtils';
const C = COLORS;

const STATUS_MAP = { completed: 'success', failed: 'failed', pending: 'pending', processing: 'pending' };

const toRow = (tx) => {
  const { provider, orderCode, kind, ref } = parseProvider(tx.provider_id);
  const date = new Date(tx.updated_at || tx.created_at);
  return {
    id: orderCode ? `#${orderCode}` : tx.transaction_id.slice(0, 8).toUpperCase(),
    date: date.toLocaleDateString('vi-VN'),
    isoDate: date.toISOString().slice(0, 10),
    service: describeTransaction(tx),
    packageKey: kind === 'plan' ? ref : kind,
    method: provider === 'payos' ? 'payOS' : 'VNPay',
    amount: formatNumber(tx.amount),
    rawAmount: tx.amount,
    status: STATUS_MAP[tx.status] || 'pending'
  };
};

const STATUS_TEXT = { success: 'Thành công', failed: 'Thất bại', pending: 'Đang chờ' };

const STATUS_TABS = [
  { id: '', label: 'Tất cả' },
  { id: 'success', label: 'Thành công' },
  { id: 'pending', label: 'Đang chờ' },
  { id: 'failed', label: 'Thất bại' }
];

const PACKAGE_TABS = [
  { id: '', label: 'Tất cả' },
  { id: 'basic', label: 'Gói Basic' },
  { id: 'professional', label: 'Gói Professional' },
  { id: 'enterprise', label: 'Gói Enterprise' },
  { id: 'renew', label: 'Làm mới tin' }
];

const exportCsv = (rows) => {
  const header = ['Mã giao dịch', 'Ngày thanh toán', 'Dịch vụ', 'Phương thức', 'Số tiền (VNĐ)', 'Trạng thái'];
  const lines = rows.map(r => [r.id, r.date, r.service, r.method, r.rawAmount, STATUS_TEXT[r.status]]);
  const csv = [header, ...lines]
    .map(cols => cols.map(c => `"${String(c).replace(/"/g, '""')}"`).join(','))
    .join('\n');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `lich-su-giao-dich-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

export default function TransactionHistory() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [filters, setFilters] = useState({ q: '', status: '', pkg: '', date: '' });
  const [page, setPage] = useState(1);

  useEffect(() => {
    getTransactions(getCurrentUser().emp_id)
      .then(list => setTransactions(list.map(toRow)))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const applyFilters = () => {
    setFilters(f => ({ ...f, q: searchQuery.trim().toLowerCase(), date: dateFilter }));
    setPage(1);
  };

  // Chip trạng thái / dịch vụ: lọc ngay khi bấm
  const selectChip = (key, value) => {
    setFilters(f => ({ ...f, [key]: value }));
    setPage(1);
  };

  const displayTransactions = useMemo(() => transactions.filter(t =>
    (!filters.q || `${t.id} ${t.service}`.toLowerCase().includes(filters.q)) &&
    (!filters.status || t.status === filters.status) &&
    (!filters.pkg || t.packageKey === filters.pkg) &&
    (!filters.date || t.isoDate === filters.date)
  ), [transactions, filters]);

  const rowsPerPage = 5;
  const total = displayTransactions.length;
  const totalPages = Math.max(1, Math.ceil(total / rowsPerPage));
  const start = (page - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  const currentTransactions = displayTransactions.slice(start, end);

  return (
    <div style={{
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      background: C.grayBg, minHeight: '100vh'
    }}>

     <main style={{ padding: '40px 48px' }}>
        <PageHeader title="Lịch sử giao dịch" subtitle="Các giao dịch thanh toán gói dịch vụ của công ty">
          <button
          onClick={() => exportCsv(displayTransactions)}
          disabled={displayTransactions.length === 0}
          style={{
            padding: '12px 24px', borderRadius: 10,
            border: 'none',
            background: C.info, color: C.white,
            fontSize: 15, fontWeight: 600,
            cursor: displayTransactions.length ? 'pointer' : 'not-allowed',
            opacity: displayTransactions.length ? 1 : 0.6,
            ...flex('center'), gap: 8
          }}>
            <Download size={18} /> Xuất báo cáo
          </button>
        </PageHeader>

        {/* Thẻ tìm kiếm */}
        <div style={{ ...card(), padding: 14, marginBottom: 14, ...flex('center'), gap: 10 }}>
          <div style={{ ...flex('center'), gap: 10, flex: 1, ...field() }}>
            <Search size={18} color={C.grayLight} />
            <input
              placeholder="Tìm theo mã giao dịch hoặc dịch vụ"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && applyFilters()}
              style={{ border: 'none', outline: 'none', boxShadow: 'none', fontSize: 14, flex: 1, background: 'transparent' }}
            />
          </div>
          <input
            type="date"
            value={dateFilter}
            onChange={e => setDateFilter(e.target.value)}
            title="Lọc theo ngày thanh toán"
            style={{
              ...field(),
              fontSize: 14, color: C.darkGray, outline: 'none', minWidth: 160
            }}
          />
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

        {/* Thẻ lọc: trạng thái + loại dịch vụ, bấm chip là lọc ngay */}
        <div style={{ ...card(), padding: '12px 16px', marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { label: 'Trạng thái:', key: 'status', tabs: STATUS_TABS, count: id => transactions.filter(t => t.status === id).length },
            { label: 'Dịch vụ:', key: 'pkg', tabs: PACKAGE_TABS, count: id => transactions.filter(t => t.packageKey === id).length }
          ].map(group => (
            <div key={group.key} style={{ ...flex('center'), gap: 10, flexWrap: 'wrap' }}>
              <span style={{ ...txt(14, 600, C.gray), width: 84, flexShrink: 0 }}>{group.label}</span>
              {group.tabs.map(tab => {
                const active = filters[group.key] === tab.id;
                const n = tab.id ? group.count(tab.id) : transactions.length;
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
                  {currentTransactions.map(txn => (
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
                        ) : txn.status === 'pending' ? (
                          <span style={{
                            padding: '6px 14px', borderRadius: 16,
                            background: C.yellowBg, color: C.amber,
                            fontSize: 13, fontWeight: 600,
                            ...flex('center'), gap: 6,
                            display: 'inline-flex'
                          }}>
                            <Clock size={14} /> Đang chờ
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
                <FileText size={40} color={C.grayLight} />
              </div>
              <h3 style={{ ...txt(20, 600), marginBottom: 8 }}>
                {loading ? 'Đang tải...'
                  : error ? 'Không tải được lịch sử giao dịch'
                  : transactions.length ? 'Không có giao dịch phù hợp với bộ lọc'
                  : 'Chưa có giao dịch nào'}
              </h3>
              <p style={{ ...txt(15, 400, error ? C.red : C.gray), marginBottom: 24, maxWidth: 400, margin: '0 auto' }}>
                {error || 'Lịch sử giao dịch của bạn sẽ được hiển thị tại đây sau khi bạn thực hiện thanh toán đầu tiên.'}
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