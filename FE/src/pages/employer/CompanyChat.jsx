import { useState, useRef, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SendHorizontal, MessagesSquare, MessageCircle, Hand, AlertCircle } from 'lucide-react';
import StateBox from '../../components/StateBox';
import { flex, txt, field } from '../../utils/styles';
import { COLORS  } from '../../constants/colors';
import { getCurrentUser, getCandidateById } from '../../services/authService';
import { applicationService } from '../../services/applicationService';
import { jobService } from '../../services/jobService';
import { useChat, formatChatTime, formatMessageTime } from '../../hooks/useChat';
import { getInitials } from '../../utils/textUtils';
import { normalize } from '../../utils/jobFormat';
import MessageBubble from '../../components/MessageBubble';
import PageHeader from '../../components/PageHeader';
const C = COLORS;

// Khoảng cách và chiều cao dòng thống nhất trong thẻ cuộc trò chuyện
const LINE_GAP = 6;
const LINE_HEIGHT = 1.4;

const ConversationItem = ({ conversation, active, onClick }) => {
  const avatarColors = {
    'CH': C.purple,
    'NV': C.purple,
    'MC': C.purple,
    'HN': C.purple
  };

  return (
    <div
      onClick={onClick}
      style={{
        padding: '16px 20px',
        borderBottom: `1px solid ${C.border}`,
        background: active ? C.grayBg : C.white,
        cursor: 'pointer',
        transition: 'all 0.2s',
        position: 'relative'
      }}
    >
      {/* Avatar căn giữa theo chiều dọc so với khối chữ */}
      <div style={{ ...flex('center'), gap: 12 }}>
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <div style={{
            width: 48, height: 48, borderRadius: '50%',
            background: avatarColors[conversation.avatar] || C.blue,
            ...flex('center'), justifyContent: 'center'
          }}>
            <span style={{ ...txt(16, 700, C.white) }}>{conversation.avatar}</span>
          </div>
          {conversation.online && (
            <div style={{
              position: 'absolute', bottom: 0, right: 0,
              width: 12, height: 12, borderRadius: '50%',
              background: C.green, border: `2px solid ${C.white}`
            }} />
          )}
        </div>

        <div style={{
          flex: 1,
          minWidth: 0,
          paddingRight: conversation.unread ? 32 : 0,
          display: 'flex', flexDirection: 'column', gap: LINE_GAP
        }}>
          <div style={{ 
            ...flex('center'), 
            justifyContent: 'space-between',
            gap: 8
          }}>
            <h4 style={{ 
              ...txt(15, 600), lineHeight: LINE_HEIGHT, 
              overflow: 'hidden', 
              textOverflow: 'ellipsis', 
              whiteSpace: 'nowrap',
              flex: 1,
              minWidth: 0
            }}>
              {conversation.name}
            </h4>
            <span style={{ 
              ...txt(12, 400, C.gray), 
              flexShrink: 0,
              whiteSpace: 'nowrap'
            }}>
              {conversation.time}
            </span>
          </div>
          <p style={{ 
            ...txt(13, 400, C.gray), lineHeight: LINE_HEIGHT, 
            overflow: 'hidden', 
            textOverflow: 'ellipsis', 
            whiteSpace: 'nowrap',
            width: '100%'
          }}>
            {conversation.lastMessage}
          </p>
          <p style={{ 
            ...txt(12, 500, C.grayLight), lineHeight: LINE_HEIGHT,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            width: '100%'
          }}>
            Việc ứng tuyển: <span style={{ color: C.navy }}>{conversation.position}</span>
          </p>
        </div>

        {conversation.unread && (
          <div style={{
            position: 'absolute',
            right: 20,
            bottom: 20,
            width: 20,
            height: 20,
            borderRadius: '50%',
            background: C.blue,
            ...flex('center'),
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <span style={{ ...txt(11, 700, C.white) }}>{conversation.unread}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default function CompanyChat() {
  const [searchParams] = useSearchParams();
  const [self] = useState(getCurrentUser);
  const [messageText, setMessageText] = useState('');
  const [search, setSearch] = useState('');
  const appsPromise = useRef(null);

  // Hồ sơ ứng tuyển vào các tin của công ty (để biết ứng viên ứng tuyển vị trí nào)
  const loadPeer = useCallback(async (candidateId) => {
    if (!appsPromise.current) {
      appsPromise.current = jobService.getJobsByEmployer(self.emp_id)
        .then(jobs => Promise.all(jobs.map(job =>
          applicationService.getByJobId(job.job_id)
            .then(apps => apps.map(a => ({ ...a, title: job.title })))
            .catch(() => [])
        )))
        .then(lists => lists.flat())
        .catch(() => []);
    }
    const [candidate, apps] = await Promise.all([getCandidateById(candidateId), appsPromise.current]);
    const applied = apps.find(a => a.candidate_id === candidateId);
    return { name: candidate?.full_name || 'Ứng viên', position: applied?.title || '' };
  }, [self.emp_id]);

  const chat = useChat({
    selfId: self.emp_id,
    loadPeer,
    initialPeerId: searchParams.get('with')
  });

  const conversations = chat.conversations
    .map(c => {
      const peer = chat.peers[c.peerId] || {};
      return {
        id: c.peerId,
        avatar: getInitials(peer.name),
        name: peer.name || '...',
        lastMessage: c.lastFromSelf ? `Bạn: ${c.lastMessage}` : c.lastMessage,
        time: formatChatTime(c.lastAt),
        position: peer.position || '—'
      };
    })
    .filter(c => !search.trim() || normalize(c.name).includes(normalize(search.trim())));

  const activePeer = chat.peers[chat.activePeerId];
  const messages = chat.messages.map(m => ({
    text: m.content,
    time: formatMessageTime(m.created_at),
    isOwn: m.sender_id === self.emp_id
  }));

  const scrollRef = useRef(null);
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages.length]);

  const handleSend = async () => {
    if (await chat.send(messageText)) setMessageText('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div style={{
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      background: C.grayBg, height: '100vh', overflow: 'hidden'
    }}>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '380px 1fr',
        height: '100vh'
      }}>
        <div style={{ 
          background: C.white, 
          borderRight: `1px solid ${C.border}`,
          ...flex('flex-start', 'column'),
          alignItems: 'stretch',
          height: '100vh'
        }}>
          <div style={{ 
            padding: '24px 20px', 
            borderBottom: `1px solid ${C.border}`,
            width: '100%'
          }}>
            {/* Cùng kiểu thẻ tiêu đề (PageHeader) như các trang quản lý khác, thu gọn cho cột hẹp */}
            <PageHeader title="Tin nhắn" subtitle="Trao đổi với ứng viên" style={{ marginBottom: 16, padding: '18px 22px' }} />
            <div style={{
              ...flex('center'), gap: 10,
              ...field()
            }}>
              <Search size={18} color={C.gray} />
              <input
                placeholder="Tìm kiếm cuộc trò chuyện"
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  border: 'none', 
                  outline: 'none', 
                  background: 'transparent',
                  fontSize: 14, 
                  color: C.navy, 
                  flex: 1,
                  minWidth: 0
                }}
              />
            </div>
          </div>

          <div style={{ 
            flex: 1, 
            overflowY: 'auto',
            overflowX: 'hidden'
          }}>
            {chat.loading && conversations.length === 0 && (
              <div style={{ height: '100%', ...flex('center'), justifyContent: 'center' }}>
                <StateBox compact type="loading" title="Đang tải cuộc trò chuyện..." />
              </div>
            )}
            {!chat.loading && conversations.length === 0 && (
              <div style={{ height: '100%', ...flex('center'), justifyContent: 'center', padding: '0 12px' }}>
              <StateBox
                compact
                icon={MessagesSquare}
                title="Chưa có cuộc trò chuyện"
                message={<>Hãy nhắn tin cho ứng viên<br />từ trang "Ứng viên".</>}
              />
              </div>
            )}
            {conversations.map((conv) => (
              <ConversationItem
                key={conv.id}
                conversation={conv}
                active={chat.activePeerId === conv.id}
                onClick={() => chat.setActivePeerId(conv.id)}
              />
            ))}
          </div>
        </div>

        <div style={{ 
          ...flex('flex-start', 'column'),
          alignItems: 'stretch', 
          background: C.white,
          height: '100vh'
        }}>
          <div style={{
            ...flex('center'), gap: 12,
            padding: '20px 32px',
            borderBottom: `1px solid ${C.border}`,
            background: C.white,
            flexShrink: 0
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: '50%',
              background: C.purple,
              ...flex('center'), justifyContent: 'center',
              position: 'relative',
              flexShrink: 0
            }}>
              <span style={{ ...txt(16, 700, C.white) }}>{getInitials(activePeer?.name)}</span>
            </div>
            <div style={{ minWidth: 0, overflow: 'hidden' }}>
              <h3 style={{
                ...txt(17, 600),
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {activePeer?.name || (chat.activePeerId ? '...' : 'Chọn một cuộc trò chuyện')}
              </h3>
              {activePeer?.position && (
                <p style={{ ...txt(13, 400, C.gray) }}>Việc ứng tuyển: {activePeer.position}</p>
              )}
            </div>
          </div>

          {/* Lớp bọc để thẻ lỗi nổi ở giữa phía trên khung tin nhắn */}
          <div style={{ flex: 1, minHeight: 0, position: 'relative', display: 'flex', flexDirection: 'column' }}>
          <div ref={scrollRef} style={{
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            overflowX: 'hidden',
            padding: '24px 32px',
            background: C.grayBg
          }}>
            {!chat.activePeerId && (
              <div style={{ height: '100%', ...flex('center'), justifyContent: 'center' }}>
                <StateBox
                  compact
                  icon={MessageCircle}
                  title="Chọn một cuộc trò chuyện"
                  message="Chọn người ở danh sách bên trái để xem và gửi tin nhắn."
                />
              </div>
            )}
            {chat.activePeerId && messages.length === 0 && (
              <div style={{ height: '100%', ...flex('center'), justifyContent: 'center' }}>
                <StateBox
                  compact
                  icon={Hand}
                  title="Chưa có tin nhắn"
                  message="Hãy gửi lời chào để bắt đầu cuộc trò chuyện!"
                />
              </div>
            )}
            {messages.map((msg, i) => (
              <MessageBubble key={i} message={msg} isOwn={msg.isOwn} />
            ))}
          </div>
          {chat.error && (
            <div role="alert" style={{
              position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)', zIndex: 2,
              maxWidth: 'calc(100% - 48px)', ...flex('center'), gap: 10, padding: '10px 16px', borderRadius: 12,
              background: C.redBg, border: '1px solid #fbcaca', boxShadow: '0 6px 18px rgba(229, 72, 77, 0.15)',
              animation: 'slideDown .2s ease'
            }}>
              <AlertCircle size={18} color={C.red} style={{ flexShrink: 0 }} />
              <span style={{ ...txt(14, 500, C.red) }}>{chat.error}</span>
            </div>
          )}
          </div>

          <div style={{
            padding: '20px 32px',
            borderTop: `1px solid ${C.border}`,
            background: C.white,
            flexShrink: 0
          }}>
            <div style={{
              ...flex('center'), gap: 12
            }}>
              <input
                value={messageText}
                onChange={e => setMessageText(e.target.value)}
                onKeyDown={handleKeyPress}
                disabled={!chat.activePeerId || chat.sending}
                placeholder={chat.activePeerId ? 'Nhập tin nhắn...' : 'Chọn một cuộc trò chuyện để nhắn tin'}
                style={{
                  flex: 1, 
                  padding: '12px 16px', 
                  borderRadius: 8,
                  border: `1px solid ${C.border}`, 
                  fontSize: 14,
                  outline: 'none', 
                  background: C.white,
                  minWidth: 0
                }}
              />

              <button
                onClick={handleSend}
                style={{
                  width: 44, 
                  height: 44, 
                  borderRadius: '50%',
                  background: C.blue, 
                  border: 'none',
                  cursor: 'pointer', 
                  ...flex('center'), 
                  justifyContent: 'center',
                  transition: 'all 0.2s',
                  boxShadow: '0 2px 8px rgba(109, 93, 252, 0.3)',
                  flexShrink: 0
                }}
              >
                <SendHorizontal size={20} color={C.white} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        input:focus {
          border-color: ${C.blue} !important;
        }
        input::placeholder {
          color: ${C.grayLight};
        }
        ::-webkit-scrollbar {
          width: 6px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background: ${C.grayLight};
          border-radius: 3px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: ${C.gray};
        }
      `}</style>
    </div>
  );
}