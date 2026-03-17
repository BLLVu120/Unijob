import { apiRequest } from "../api/api";
import { saveUser, getUser, mergeUser, logoutUserStorage } from "../utils/storage";

/* INTERNAL USERS (ADMIN / MODERATOR) */

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

/* CANDIDATE */

export const registerUser = async (user) => {
  try {
    const data = await apiRequest("/v1/candidate/add", {
      method: "POST",
      body: JSON.stringify(user)
    });

    return data;
  } catch (err) {
    if (err.message.includes("email")) {
      throw new Error("Email đã tồn tại");
    }

    throw new Error(err.message || "Đăng ký thất bại");
  }
};

export const verifyEmail = async (code) => {
  if (!code) throw new Error("Mã xác nhận không đúng");
  if (code !== "123456") throw new Error("Mã xác nhận không đúng");

  const pendingUser = getPendingUser();
  if (!pendingUser) throw new Error("Không tìm thấy thông tin đăng ký");

  try {
    const isEmployer = !!pendingUser.emp_name;
    const endpoint = isEmployer
      ? `/v1/employer/get_by_email?email=${pendingUser.email}`
      : `/v1/candidate/get_by_email?email=${pendingUser.email}`;
    const res = await apiRequest(endpoint);
    const user = isEmployer ? res.employer : res.candidate;

    if (!user) throw new Error("Không tìm thấy tài khoản");

    const updatedUser = {
      ...user,
      is_verified: true
    };

    const updateEndpoint = isEmployer ? "/v1/employer/update_info" : "/v1/candidate/update_info";
    await apiRequest(updateEndpoint, {
      method: "POST",
      body: JSON.stringify(updatedUser)
    });

    clearPendingUser();

    return {
      success: true,
      email: user.email
    };

  } catch (err) {
    throw new Error(err.message || "Xác thực thất bại");
  }
};

export const loginUser = async (email, password) => {
  const res = await apiRequest(`/v1/candidate/get_by_email?email=${email}`);
  const candidate = res.candidate;

  if (!candidate?.email) throw new Error("Tài khoản không tồn tại");
  if (candidate.is_verified === false) throw new Error("Tài khoản chưa xác thực email");
  if (candidate.password !== password) throw new Error("Sai mật khẩu");

  const userData = {
    ...candidate,
    role: "candidate",
    lastLogin: new Date().toISOString()
  };

  saveUser(userData);
  return userData;
};

export const getProfile = async (email) => {
  const res = await apiRequest(`/v1/candidate/get_by_email?email=${email}`);
  const candidate = res.candidate;

  const userData = {
    ...candidate,
    role: "candidate"
  };

  saveUser(userData);
  return userData;
};

export const getUserById = async (id) => {
  const res = await apiRequest(`/v1/candidate/get_by_id?id=${id}`);
  return res.candidate;
};

export const updateUser = async (userData) => {
  await apiRequest("/v1/candidate/update_info", {
    method: "POST",
    body: JSON.stringify(userData)
  });

  const res = await apiRequest(`/v1/candidate/get_by_email?email=${userData.email}`);
  const candidate = res.candidate;

  return mergeUser({
    ...candidate,
    role: "candidate"
  });
};

export const deleteUser = async (id) => {
  await apiRequest(`/v1/candidate/delete?id=${id}`, {
    method: "DELETE"
  });

  localStorage.removeItem("user");
};

export const getCurrentUser = getUser;

export const setCurrentUser = (user) => {
  const current = JSON.parse(localStorage.getItem("user")) || {};
  const merged = {
    ...current,
    ...user
  };

  localStorage.setItem("user", JSON.stringify(merged));
};

export const logoutUser = logoutUserStorage;

/* EMPLOYER */

export const registerEmployer = async (employer) => {
  try {
    const data = await apiRequest("/v1/employer/add", {
      method: "POST",
      body: JSON.stringify(employer)
    });

    return data;

  } catch (err) {
    if (err.message.includes("email")) {
      throw new Error("Email đã tồn tại");
    }

    throw new Error(err.message || "Đăng ký thất bại");
  }
};

export const loginEmployer = async (email, password) => {
  const res = await apiRequest(`/v1/employer/get_by_email?email=${email}`);
  const employer = res.employer;

  if (!employer?.email) throw new Error("Tài khoản không tồn tại");
  if (employer.password !== password) throw new Error("Sai mật khẩu");

  const employerData = {
    ...employer,
    role: "employer",
    lastLogin: new Date().toISOString()
  };

  saveUser(employerData);
  return employerData;
};

export const getEmployerProfile = async (email) => {
  const res = await apiRequest(`/v1/employer/get_by_email?email=${email}`);
  const employer = res.employer;

  const employerData = {
    ...employer,
    role: "employer"
  };

  saveUser(employerData);
  return employerData;
};

export const getEmployerById = async (id) => {
  const res = await apiRequest(`/v1/employer/get_by_id?id=${id}`);
  return res.employer;
};

export const updateEmployer = async (employerData) => {
  await apiRequest("/v1/employer/update_info", {
    method: "POST",
    body: JSON.stringify(employerData)
  });

  const res = await apiRequest(`/v1/employer/get_by_email?email=${employerData.email}`);
  const employer = res.employer;

  return mergeUser({
    ...employer,
    role: "employer"
  });
};

export const getAllEmployers = async () => {
  const res = await apiRequest("/v1/admin/get_all_employers");
  return res.employers || [];
};

export const getCurrentEmployer = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  return user?.role === "employer" ? user : null;
};

export const setCurrentEmployer = (employer) => {
  localStorage.setItem("employer", JSON.stringify(employer));
};

export const logoutEmployer = logoutUserStorage;

/* EMAIL VERIFY (MOCK) */

export const setPendingUser = (user) => {
  localStorage.setItem("pendingUser", JSON.stringify(user));
};

export const getPendingUser = () => {
  return JSON.parse(localStorage.getItem("pendingUser"));
};

export const clearPendingUser = () => {
  localStorage.removeItem("pendingUser");
};

/* ADMIN USER MANAGEMENT (MOCK) */

export const getUsers = () => {
  return JSON.parse(localStorage.getItem("users") || "[]");
};

export const saveUsers = (users) => {
  localStorage.setItem("users", JSON.stringify(users));
};