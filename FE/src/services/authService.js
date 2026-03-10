export const getUsers = () => {
  return JSON.parse(localStorage.getItem("users")) || [];
};

export const saveUsers = (users) => {
  localStorage.setItem("users", JSON.stringify(users));
};

export const setPendingUser = (user) => {
  localStorage.setItem("pendingUser", JSON.stringify(user));
};

export const getPendingUser = () => {
  return JSON.parse(localStorage.getItem("pendingUser"));
};

export const clearPendingUser = () => {
  localStorage.removeItem("pendingUser");
};

export const registerUser = (user) => {
  const users = getUsers();

  const emailExists = users.some(u => u.email === user.email);
  if (emailExists) throw new Error("Email đã tồn tại");

  const newUser = {
    ...user,
    verified: false,
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  saveUsers(users);
  return newUser;
};

export const verifyEmail = (code) => {
  if (code !== "123456") throw new Error("Mã xác nhận không đúng");
  const pendingUser = getPendingUser();

  if (!pendingUser) throw new Error("Không tìm thấy thông tin đăng ký");
  const users = getUsers();
  const emailExists = users.some(u => u.email === pendingUser.email);

  if (emailExists) {
    clearPendingUser();
    throw new Error("Email đã tồn tại");
  }

  const verifiedUser = {
    ...pendingUser,
    verified: true,
    createdAt: new Date().toISOString()
  };

  users.push(verifiedUser);
  saveUsers(users);
  clearPendingUser();
  return verifiedUser;
};

export const loginUser = (email, password) => {
  const users = getUsers();
  const user = users.find(u => u.email === email);

  if (!user) throw new Error("Tài khoản không tồn tại");
  if (user.password !== password) throw new Error("Sai mật khẩu");
  if (user.blocked === true) throw new Error("Tài khoản đã bị khóa");

  const updatedUser = {
    ...user,
    lastLogin: new Date().toISOString()
  };

  const newUsers = users.map(u =>
    u.email === updatedUser.email ? updatedUser : u
  );

  saveUsers(newUsers);
  setCurrentUser(updatedUser);
  return updatedUser;
};

export const getCurrentUser = () => {
  return JSON.parse(localStorage.getItem("user"));
};

export const setCurrentUser = (user) => {
  localStorage.setItem("user", JSON.stringify(user));
};

export const logoutUser = () => {
  localStorage.removeItem("user");
};

export const updateUser = (updatedUser) => {
  const users = getUsers();
  const newUsers = users.map(u =>
    u.email === updatedUser.email ? updatedUser : u
  );

  saveUsers(newUsers);
  setCurrentUser(updatedUser);
};

const internalUsers = [
  {
    email: "admin@gmail.com",
    password: "123456",
    role: "admin",
    name: "Admin System"
  },
  {
    email: "moderator@gmail.com",
    password: "123456",
    role: "moderator",
    name: "Moderator"
  }
];

export const loginInternal = (email, password) => {
  const user = internalUsers.find(u => u.email === email);
  if (!user) throw new Error("Tài khoản nội bộ không tồn tại");
  if (user.password !== password) throw new Error("Sai mật khẩu");
  
  localStorage.setItem("internalUser", JSON.stringify(user));
  return user;
};

export const getInternalUser = () => {
  return JSON.parse(localStorage.getItem("internalUser"));
};

export const logoutInternal = () => {
  localStorage.removeItem("internalUser");
};