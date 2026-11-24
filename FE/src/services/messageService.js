import { apiRequest } from '../api/api';

const enc = encodeURIComponent;

// Tin nhắn cuối cùng của mỗi cuộc trò chuyện (BE trả về trong khóa "feedback")
export const getConversations = async (userId) => {
  const res = await apiRequest(`/v1/message/get_conversation_by_id?user_id=${enc(userId)}`);
  return res.feedback || res.conversations || [];
};

export const getMessages = async (user1Id, user2Id) => {
  const res = await apiRequest(
    `/v1/message/get_messages_by_id?user1_id=${enc(user1Id)}&user2_id=${enc(user2Id)}`
  );
  return (res.messages || []).sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
};

export const sendMessage = (payload) =>
  apiRequest('/v1/message/add_message', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
