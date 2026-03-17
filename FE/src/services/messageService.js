import { apiRequest } from "../api/api";

export const getConversations = async (userId) => {
  const res = await apiRequest(
    `/v1/message/get_conversation_by_id?user_id=${userId}`
  );

  return res.feedback || [];
};

export const getMessages = async (user1Id, user2Id) => {
  const res = await apiRequest(
    `/v1/message/get_messages_by_id?user1_id=${user1Id}&user2_id=${user2Id}`
  );

  return res.messages || [];
};

export const sendMessage = async (payload) => {
  return await apiRequest(`/v1/message/add_message`, {
    method: "POST",
    body: JSON.stringify(payload)
  });
};