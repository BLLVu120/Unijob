import { useState, useEffect, useRef } from 'react';
import { useParams } from "react-router-dom";
import { Search, SendHorizontal } from 'lucide-react';
import { flex, txt } from '../utils/styles';
import { COLORS } from '../constants/colors';
import { getConversations, getMessages, sendMessage } from "../services/messageService";
import { getCurrentUser, getUserById } from "../services/authService";
import { getInitials, formatTime } from "../utils/textUtils";
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
        position: 'relative'
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
              {getInitials(conversation.name || "")}
            </span>
          </div>
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
  const { candidateId } = useParams();
  const [activeConversation, setActiveConversation] = useState(null);
  const [messageText, setMessageText] = useState("");
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);

  const bottomRef = useRef(null);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const user = getCurrentUser();
        const currentUserId = user.emp_id;
        const data = await getConversations(currentUserId);
        const sorted = (data || []).sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );

        const candidateCache = {};

        const mapped = await Promise.all(
          sorted.map(async (message) => {
          const candidateId = message.sender_id === currentUserId ? message.receiver_id : message.sender_id;

            if (!candidateCache[candidateId]) candidateCache[candidateId] = await getUserById(candidateId);
            const candidate = candidateCache[candidateId];

            return {
              id: message.message_id,
              candidateId,
              name: candidate?.full_name || "Ứng viên",
              lastMessage: message.content,
              time: formatTime(message.created_at),
              senderId: message.sender_id
            };
          })
        );

        const unique = {};
        mapped.forEach(c => {
          if (!unique[c.candidateId]) unique[c.candidateId] = c;
        });

        const conversationsList = Object.values(unique);
        setConversations(conversationsList);
        if (conversationsList.length > 0) {
          if (candidateId) {
            const found = conversationsList.find(
              c => String(c.candidateId) === String(candidateId)
            );

            if (found) setActiveConversation(found);
            else setActiveConversation(conversationsList[0]);
          } else {
            setActiveConversation(conversationsList[0]);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchConversations();
  }, []);

  useEffect(() => {
    if (!candidateId || conversations.length === 0) return;

    const found = conversations.find(
      c => String(c.candidateId) === String(candidateId)
    );

    if (found) {
      setActiveConversation(found);
    }
  }, [candidateId, conversations]);

  useEffect(() => {
    if (!activeConversation?.candidateId) return;

    const fetchMessages = async () => {
      try {
        const user = getCurrentUser();
        const currentUserId = user.emp_id;
        const data = await getMessages(currentUserId, activeConversation.candidateId);
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
        sender_id: user.emp_id,
        receiver_id: activeConversation.candidateId,
        content: messageText
      };

      await sendMessage(payload);

      setMessageText("");

    } catch (err) {
      console.error(err);
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
              <span style={{ ...txt(16, 700, C.white) }}>
                {getInitials(activeConversation?.name || "")}
              </span>
            </div>
            <div style={{ minWidth: 0, overflow: 'hidden' }}>
              <h3 style={{ 
                ...txt(17, 600),
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {activeConversation?.name}
              </h3>
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
            <div ref={bottomRef} />
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