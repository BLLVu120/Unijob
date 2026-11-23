import { useState } from 'react';
import { Search, Paperclip, Image, SendHorizontal } from 'lucide-react';
import { flex, txt } from '../utils/styles';
import { COLORS  } from '../constants/colors';
const C = COLORS;

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
      <div style={{ ...flex('flex-start'), gap: 12 }}>
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
          paddingRight: conversation.unread ? 32 : 0 
        }}>
          <div style={{ 
            ...flex('center'), 
            justifyContent: 'space-between', 
            marginBottom: 4,
            gap: 8
          }}>
            <h4 style={{ 
              ...txt(15, 600), 
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
            ...txt(13, 400, C.gray), 
            overflow: 'hidden', 
            textOverflow: 'ellipsis', 
            whiteSpace: 'nowrap',
            marginBottom: 4,
            width: '100%'
          }}>
            {conversation.lastMessage}
          </p>
          <p style={{ 
            ...txt(12, 500, C.grayLight),
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

const MessageBubble = ({ message, isOwn }) => (
  <div style={{ 
    ...flex(isOwn ? 'flex-end' : 'flex-start'), 
    marginBottom: 16,
    justifyContent: isOwn ? 'flex-end' : 'flex-start'
  }}>
    <div style={{
      maxWidth: '70%',
      padding: '12px 16px',
      borderRadius: isOwn ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
      background: isOwn ? C.blueBubble : C.grayMsg,
      color: isOwn ? C.white : C.navy,
      wordWrap: 'break-word',
      overflowWrap: 'break-word'
    }}>
      <p style={{ 
        ...txt(14, 400, isOwn ? C.white : C.navy), 
        margin: 0,
        wordWrap: 'break-word',
        overflowWrap: 'break-word'
      }}>
        {message.text}
      </p>
      <span style={{ 
        ...txt(11, 400, isOwn ? 'rgba(255,255,255,0.75)' : C.gray), 
        display: 'block', 
        marginTop: 4 
      }}>
        {message.time}
      </span>
    </div>
  </div>
);


export default function EmployerMessagesPage() {
  const [activeConversation, setActiveConversation] = useState(0);
  const [messageText, setMessageText] = useState('');

  const conversations = [
    {
      id: 0,
      avatar: 'CH',
      name: 'Nguyễn Thị Tuyết Anh',
      lastMessage: 'Dạ em cảm ơn anh/chị a!',
      time: '10:30',
      position: 'Nhân viên Phục vụ',
      online: true
    },
    {
      id: 1,
      avatar: 'NV',
      name: 'Nguyễn Văn A',
      lastMessage: 'Em có thể bắt đầu làm việc từ tuần sau...',
      time: '09:15',
      position: 'Thu ngân Part-time'
    },
    {
      id: 2,
      avatar: 'MC',
      name: 'Phạm Minh Châu',
      lastMessage: 'Em đã gửi portfolio qua email rồi ạ',
      time: 'Hôm qua',
      position: 'Marketing Assistant'
    },
    {
      id: 3,
      avatar: 'MC',
      name: 'Võ Hoàng Long',
      lastMessage: 'Anh/chị cho em hỏi về lịch làm việc...',
      time: 'Hôm qua',
      position: 'Nhân viên Kho',
      unread: 2
    },
    {
      id: 4,
      avatar: 'HN',
      name: 'Đỗ Hương Ngọc',
      lastMessage: 'Em rất mong được làm việc tại đây',
      time: 'Hôm qua',
      position: 'Nhân viên Phục vụ'
    }
  ];

  const messages = [
    {
      text: 'Chào em Tuyết Anh, anh đã xem hồ sơ của em rồi. Em có thể đến phỏng vấn vào thứ 3 tuần sau được không?',
      time: '09:30',
      isOwn: true
    },
    {
      text: 'Dạ chào anh a. Em có thể đến phỏng vấn vào thứ 3 tuần sau a.',
      time: '09:32',
      isOwn: false
    },
    {
      text: 'Anh cho em hỏi địa chỉ và thời gian cụ thể với ạ?',
      time: '09:32',
      isOwn: false
    },
    {
      text: 'Được em. Địa chỉ là The Coffee House chi nhánh Quận 1, số 123 Đường ABC. Em đến lúc 2 giờ chiều nhé.',
      time: '09:35',
      isOwn: true
    },
    {
      text: 'Em nhớ mang theo CV và giấy tờ tùy thân nhé.',
      time: '09:35',
      isOwn: true
    },
    {
      text: 'Dạ em cảm ơn anh/chị a!',
      time: '09:36',
      isOwn: false
    }
  ];

  const handleSend = () => {
    if (messageText.trim()) {
      console.log('Sending:', messageText);
      setMessageText('');
    }
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
            <h2 style={{ ...txt(28, 700), marginBottom: 16 }}>Tin nhắn</h2>
            <div style={{
              ...flex('center'), gap: 10,
              background: C.grayBg, borderRadius: 8,
              padding: '10px 14px'
            }}>
              <Search size={18} color={C.gray} />
              <input
                placeholder="Tìm kiếm cuộc trò chuyện"
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
            {conversations.map((conv) => (
              <ConversationItem
                key={conv.id}
                conversation={conv}
                active={activeConversation === conv.id}
                onClick={() => setActiveConversation(conv.id)}
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
              <span style={{ ...txt(16, 700, C.white) }}>CH</span>
              <div style={{
                position: 'absolute', bottom: 0, right: 0,
                width: 12, height: 12, borderRadius: '50%',
                background: C.green, border: `2px solid ${C.white}`
              }} />
            </div>
            <div style={{ minWidth: 0, overflow: 'hidden' }}>
              <h3 style={{ 
                ...txt(17, 600),
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                Nguyễn Thị Tuyết Anh
              </h3>
              <p style={{ ...txt(13, 400, C.green) }}>Đang hoạt động</p>
            </div>
          </div>

          <div style={{ 
            flex: 1, 
            overflowY: 'auto',
            overflowX: 'hidden',
            padding: '24px 32px',
            background: C.grayBg
          }}>
            {messages.map((msg, i) => (
              <MessageBubble key={i} message={msg} isOwn={msg.isOwn} />
            ))}
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
                onKeyPress={handleKeyPress}
                placeholder="Nhập tin nhắn..."
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
                  boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)',
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