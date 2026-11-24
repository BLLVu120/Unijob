import { useState, useEffect, useCallback, useRef } from 'react';
import { getConversations, getMessages, sendMessage } from '../services/messageService';

const POLL_MS = 5000;

export const formatChatTime = (value) => {
  if (!value) return '';
  const d = new Date(value);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) {
    return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  }
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return 'Hôm qua';
  return d.toLocaleDateString('vi-VN');
};

// Giờ trong bong bóng tin nhắn: luôn có giờ
// hôm nay → "09:12", hôm qua → "Hôm qua, 09:12", cũ hơn → "21/11/2026, 09:12"
export const formatMessageTime = (value) => {
  if (!value) return '';
  const d = new Date(value);
  const time = d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  const now = new Date();
  if (d.toDateString() === now.toDateString()) return time;
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return `Hôm qua, ${time}`;
  return `${d.toLocaleDateString('vi-VN')}, ${time}`;
};

/**
 * Chat giữa người dùng hiện tại (selfId) và các đối tác.
 * loadPeer(id) → Promise<{ name, position }> dùng để hiển thị thông tin đối tác.
 * initialPeerId: mở sẵn cuộc trò chuyện (kể cả khi chưa có tin nhắn nào).
 * BE chưa có websocket nên dữ liệu được làm mới định kỳ.
 */
export const useChat = ({ selfId, loadPeer, initialPeerId }) => {
  const [conversations, setConversations] = useState([]);
  const [peers, setPeers] = useState({});
  const [activePeerId, setActivePeerId] = useState(initialPeerId || null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const requested = useRef(new Set());

  const ensurePeer = useCallback((id) => {
    if (!id || requested.current.has(id)) return;
    requested.current.add(id);
    loadPeer(id)
      .then(info => setPeers(p => ({ ...p, [id]: info })))
      .catch(() => setPeers(p => ({ ...p, [id]: { name: 'Người dùng', position: '' } })));
  }, [loadPeer]);

  const refreshConversations = useCallback(async () => {
    if (!selfId) return;
    try {
      const rows = await getConversations(selfId);
      const list = rows
        .map(m => ({
          peerId: m.sender_id === selfId ? m.receiver_id : m.sender_id,
          lastMessage: m.content,
          lastAt: m.created_at,
          lastFromSelf: m.sender_id === selfId
        }))
        .sort((a, b) => new Date(b.lastAt) - new Date(a.lastAt));
      setConversations(list);
      list.forEach(c => ensurePeer(c.peerId));
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [selfId, ensurePeer]);

  const refreshMessages = useCallback(async (peerId) => {
    if (!selfId || !peerId) return;
    try {
      setMessages(await getMessages(selfId, peerId));
    } catch (err) {
      setError(err.message);
    }
  }, [selfId]);

  // Tải danh sách hội thoại + làm mới định kỳ
  useEffect(() => {
    refreshConversations();
    const timer = setInterval(refreshConversations, POLL_MS);
    return () => clearInterval(timer);
  }, [refreshConversations]);

  // Chưa chọn thì mở cuộc trò chuyện gần nhất
  const currentPeerId = activePeerId || conversations[0]?.peerId || null;

  // Tải tin nhắn của cuộc trò chuyện đang mở + làm mới định kỳ
  useEffect(() => {
    if (!currentPeerId) return;
    ensurePeer(currentPeerId);
    refreshMessages(currentPeerId);
    const timer = setInterval(() => refreshMessages(currentPeerId), POLL_MS);
    return () => clearInterval(timer);
  }, [currentPeerId, refreshMessages, ensurePeer]);

  const send = async (text) => {
    const content = text.trim();
    if (!content || !currentPeerId || sending) return false;
    setSending(true);
    try {
      await sendMessage({ sender_id: selfId, receiver_id: currentPeerId, content });
      await Promise.all([refreshMessages(currentPeerId), refreshConversations()]);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setSending(false);
    }
  };

  // Cuộc trò chuyện mới (chưa có tin nhắn) vẫn hiển thị trong danh sách
  const allConversations =
    currentPeerId && !conversations.some(c => c.peerId === currentPeerId)
      ? [{ peerId: currentPeerId, lastMessage: 'Bắt đầu cuộc trò chuyện', lastAt: null }, ...conversations]
      : conversations;

  return {
    conversations: allConversations,
    peers,
    activePeerId: currentPeerId,
    setActivePeerId,
    messages,
    loading,
    error,
    sending,
    send
  };
};
