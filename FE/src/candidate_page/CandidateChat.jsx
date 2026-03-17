import { useState, useEffect, useRef } from 'react';
import { Search, SendHorizontal } from 'lucide-react';
import { flex, txt } from '../utils/styles';
import { COLORS } from '../constants/colors';
import { getConversations, getMessages, sendMessage } from "../services/messageService";
import { getCurrentUser, getEmployerById } from "../services/authService";
import { getInitials, formatTime } from '../utils/textUtils';
const C = COLORS;

const ConversationItem = ({ conversation, active, onClick }) => {
  return (
    <div
      onClick={onClick}
      style={{
        padding: '16px 20px',
        borderBottom: `1px solid ${C.border}`,
        background: active ? C.grayBg : C.white,
        cursor: 'pointer',
        transition: 'all 0.2s',
        position: 'relative',
        overflowX: 'hidden'
      }}
    >
      <div style={{ ...flex('flex-start'), gap: 12 }}>
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <div style={{
            width: 48, height: 48, borderRadius: '50%',
            background: C.purple,
            ...flex('center'), justifyContent: 'center'
          }}>
            <span style={{ ...txt(16, 700, C.white) }}>
              {getInitials(conversation.company || "")}
            </span>
          </div>
        </div>

        <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
          <div style={{ ...flex('center'), justifyContent: 'space-between', marginBottom: 4 }}>
            <h4 style={{ ...txt(15, 600), overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {conversation.company}
            </h4>
            <span style={{ ...txt(12, 400, C.gray) }}>{conversation.time}</span>
          </div>
          <p style={{ 
            ...txt(13, 400, C.gray), 
            overflow: 'hidden', 
            textOverflow: 'ellipsis', 
            whiteSpace: 'nowrap',
            marginBottom: 4
          }}>
            {conversation.lastMessage || ""}
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
            justifyContent: 'center'
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
      color: isOwn ? C.white : C.navy
    }}>
      <p style={{ ...txt(14, 400, isOwn ? C.white : C.navy), margin: 0 }}>
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

export default function MessagesPage() {
  const [activeConversation, setActiveConversation] = useState(null);
  const [messageText, setMessageText] = useState("");
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);

  const bottomRef = useRef(null);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const user = getCurrentUser();
        const currentUserId = user?.candidate_id || user?.emp_id;
        const data = await getConversations(currentUserId);
        const sorted = (data || []).sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );

        const employerCache = {};

        const mapped = await Promise.all(
          sorted.map(async (message) => {
            const employerId = message.sender_id === currentUserId ? message.receiver_id : message.sender_id;
            if (!employerCache[employerId]) employerCache[employerId] = await getEmployerById(employerId);
            const employer = employerCache[employerId];

            return {
              id: message.message_id,
              employerId,
              company: employer?.emp_name || "Nhà tuyển dụng",
              lastMessage: message.content,
              time: formatTime(message.created_at),
              senderId: message.sender_id
            };
          })
        );

        const unique = {};
        mapped.forEach(c => {
          if (!unique[c.employerId]) unique[c.employerId] = c;
        });

        const conversationsList = Object.values(unique);
        setConversations(conversationsList);
        const latestMessage = sorted[0];

        if (latestMessage) {
          const employerId = latestMessage.sender_id === currentUserId ? latestMessage.receiver_id : latestMessage.sender_id;
          const selectedConversation = conversationsList.find(
            c => c.employerId === employerId
          );

          if (selectedConversation) setActiveConversation(selectedConversation);
        }

      } catch (err) {
        console.error(err);
      }
    };
    fetchConversations();
  }, []);

  useEffect(() => {
    if (!activeConversation?.employerId) return;

    const fetchMessages = async () => {
      try {
        const user = getCurrentUser();
        const currentUserId = user?.candidate_id || user?.emp_id;
        const data = await getMessages(currentUserId, activeConversation.employerId);
        const mapped = (data || [])
          .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
          .map(m => ({
            text: m.content,
            time: formatTime(m.created_at),
            isOwn: m.sender_id === currentUserId
          }));

        setMessages(mapped);
      } catch (err) {
        console.error(err);
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [activeConversation]);

  const handleSend = async () => {
    if (!messageText.trim() || !activeConversation) return;
    try {
      const user = getCurrentUser();
      const payload = {
        sender_id: user.candidate_id || user.emp_id,
        receiver_id: activeConversation.employerId,
        content: messageText
      };

      await sendMessage(payload);

      const currentUserId = user.candidate_id || user.emp_id;

      const data = await getMessages(currentUserId, activeConversation.employerId);

      const mapped = (data || [])
        .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
        .map(m => ({
          text: m.content,
          time: formatTime(new Date()),
          isOwn: m.sender_id === currentUserId
        }));

      setMessages(mapped);
      setConversations(prev => {
        const updated = prev.map(conv =>
          conv.employerId === activeConversation.employerId
            ? {
                ...conv,
                lastMessage: messageText,
                time: formatTime(new Date())
              }
            : conv
        );

        const active = updated.find(c => c.employerId === activeConversation.employerId);
        const others = updated.filter(c => c.employerId !== activeConversation.employerId);

        return [active, ...others];
      });

      setMessageText("");
    } catch (err) {
      console.error(err);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
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
                  border: 'none', outline: 'none', background: 'transparent',
                  fontSize: 14, color: C.navy, flex: 1
                }}
              />
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', width: '100%' }}>
            {conversations.map((conv) => (
              <ConversationItem
                key={conv.id}
                conversation={conv}
                active={activeConversation?.id === conv.id}
                onClick={() => setActiveConversation(conv)}
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
            background: C.white
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: '50%',
              background: C.purple,
              ...flex('center'), justifyContent: 'center',
              position: 'relative'
            }}>
              <span style={{ ...txt(16, 700, C.white) }}>
                {getInitials(activeConversation?.company || "")}
              </span>
              <div style={{
                position: 'absolute', bottom: 0, right: 0,
                width: 12, height: 12, borderRadius: '50%',
                background: C.green, border: `2px solid ${C.white}`
              }} />
            </div>
            <div>
              <h3 style={{ ...txt(17, 600) }}>{activeConversation?.company}</h3>
            </div>
          </div>

          <div style={{ 
            flex: 1, 
            overflowY: 'auto', 
            padding: '24px 32px',
            background: C.grayBg
          }}>
            {messages.map((msg, i) => (
              <MessageBubble key={i} message={msg} isOwn={msg.isOwn} />
            ))}
            <div ref={bottomRef} />
          </div>

          <div style={{
            padding: '20px 32px',
            borderTop: `1px solid ${C.border}`,
            background: C.white
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
                  flex: 1, padding: '12px 16px', borderRadius: 8,
                  border: `1px solid ${C.border}`, fontSize: 14,
                  outline: 'none', background: C.white
                }}
              />

              <button
                onClick={handleSend}
                style={{
                  width: 44, height: 44, borderRadius: '50%',
                  background: C.blue, border: 'none',
                  cursor: 'pointer', ...flex('center'), justifyContent: 'center',
                  transition: 'all 0.2s',
                  boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)'
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