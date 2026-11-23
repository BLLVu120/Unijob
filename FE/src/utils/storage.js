export const saveUser = (user) => {
  localStorage.setItem("user", JSON.stringify(user));
};

export const getUser = () => {
  const data = localStorage.getItem("user");
  return data ? JSON.parse(data) : null;
};

export const mergeUser = (data) => {
  const current = getUser() || {};
  const merged = { ...current, ...data };
  saveUser(merged);
  return merged;
};

export const logoutUserStorage = () => {
  localStorage.removeItem("user");
};