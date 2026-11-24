import { apiRequest } from '../api/api';
import { verifyTaxCode } from './verificationService';

/*
 * Phiên đăng nhập lưu trong localStorage["user"]:
 *   { ...hồ sơ từ BE (không có password), id, name, role, roleName }
 *
 * Lưu ý: BE chưa có API đăng nhập, nên FE lấy hồ sơ theo email rồi so khớp
 * mật khẩu. Mật khẩu KHÔNG bao giờ được lưu xuống trình duyệt.
 */

const USER_KEY = 'user';
const PENDING_KEY = 'pendingUser';

const ROLE_NAMES = {
  candidate: 'Ứng viên',
  employer: 'Nhà tuyển dụng'
};

const enc = encodeURIComponent;

const stripPassword = (record) => {
  if (!record) return record;
  // eslint-disable-next-line no-unused-vars
  const { password, ...rest } = record;
  return rest;
};

export const toSessionUser = (record, role) => {
  const clean = stripPassword(record);
  return role === 'employer'
    ? { ...clean, id: clean.emp_id, name: clean.emp_name, role, roleName: ROLE_NAMES.employer }
    : { ...clean, id: clean.candidate_id, name: clean.full_name, role, roleName: ROLE_NAMES.candidate };
};

/* ─── Phiên đăng nhập ─────────────────────────────────────────── */

export const getCurrentUser = () => {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY));
  } catch {
    return null;
  }
};

export const saveSession = (user) => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  return user;
};

export const logout = () => localStorage.removeItem(USER_KEY);

/* ─── Đọc hồ sơ ───────────────────────────────────────────────── */

const isFound = (record) => record && !Array.isArray(record) && record.email;

// Trả về hồ sơ đầy đủ (kể cả password) hoặc null nếu không tồn tại
const fetchCandidateByEmail = async (email) => {
  const res = await apiRequest(`/v1/candidate/get_by_email?email=${enc(email)}`);
  return isFound(res.candidate) ? res.candidate : null;
};

const fetchEmployerByEmail = async (email) => {
  try {
    const res = await apiRequest(`/v1/employer/get_by_email?email=${enc(email)}`);
    return isFound(res.employer) ? res.employer : null;
  } catch (err) {
    // BE trả lỗi 500 khi không tìm thấy employer
    if (err.message.startsWith('Không kết nối')) throw err;
    return null;
  }
};

const fetchByRole = (role, email) =>
  role === 'employer' ? fetchEmployerByEmail(email) : fetchCandidateByEmail(email);

export const getCandidateById = async (id) => {
  const res = await apiRequest(`/v1/candidate/get_by_id?id=${enc(id)}`);
  return isFound(res.candidate) ? stripPassword(res.candidate) : null;
};

export const getEmployerById = async (id) => {
  try {
    const res = await apiRequest(`/v1/employer/get_by_id?id=${enc(id)}`);
    return isFound(res.employer) ? stripPassword(res.employer) : null;
  } catch {
    return null;
  }
};

export const getAllEmployers = async () => {
  const res = await apiRequest('/v1/admin/get_all_employers');
  return (res.employers || []).map(stripPassword);
};

// Admin duyệt / hủy xác thực doanh nghiệp
export const setEmployerVerified = (email, verified) =>
  apiRequest('/v1/employer/update_info', {
    method: 'POST',
    body: JSON.stringify({ email, is_verified: verified })
  });

// BE xóa ứng viên theo email
export const deleteCandidate = (email) =>
  apiRequest(`/v1/candidate/delete?email=${enc(email)}`, { method: 'DELETE' });

export const getAllCandidates = async () => {
  const res = await apiRequest('/v1/admin/get_all_candidates');
  return (res.candidates || []).map(stripPassword);
};

/* ─── Đăng ký ─────────────────────────────────────────────────── */

const friendlyRegisterError = (err) => {
  const msg = err.message || '';
  if (/duplicate|unique/i.test(msg)) {
    if (/email/i.test(msg)) return new Error('Email đã được sử dụng');
    if (/phone/i.test(msg)) return new Error('Số điện thoại đã được sử dụng');
    return new Error('Thông tin đã tồn tại trong hệ thống');
  }
  return new Error(msg || 'Đăng ký thất bại');
};

export const registerCandidate = async (form) => {
  try {
    await apiRequest('/v1/candidate/add', {
      method: 'POST',
      body: JSON.stringify({
        full_name: form.fullName.trim(),
        dob: form.birthDate,
        gender: form.gender,
        email: form.email.trim(),
        password: form.password,
        phone_number: form.phone.trim(),
        address: form.address.trim(),
        cid: form.IdCard.trim()
      })
    });
  } catch (err) {
    throw friendlyRegisterError(err);
  }
  setPendingUser({ email: form.email.trim(), role: 'candidate', name: form.fullName.trim() });
};

export const registerEmployer = async (form) => {
  // Kiểm tra mã số thuế trước khi tạo tài khoản
  const taxCode = form.taxRegistrationNumber.trim();
  const tax = await verifyTaxCode(taxCode);
  if (!tax?.is_valid) {
    throw new Error(tax?.error || 'Mã số thuế không hợp lệ');
  }

  try {
    await apiRequest('/v1/employer/add', {
      method: 'POST',
      body: JSON.stringify({
        emp_name: form.companyName.trim(),
        representative_name: form.fullName.trim(),
        email: form.email.trim(),
        password: form.password,
        phone_number: form.phone.trim(),
        address: form.address.trim(),
        tax_code: form.taxRegistrationNumber.trim(),
        cid: form.IdCard.trim(),
        is_verified: false
      })
    });
  } catch (err) {
    throw friendlyRegisterError(err);
  }
  setPendingUser({ email: form.email.trim(), role: 'employer', name: form.companyName.trim() });
};

/* ─── Xác thực email bằng OTP ─────────────────────────────────── */

export const setPendingUser = (user) => localStorage.setItem(PENDING_KEY, JSON.stringify(user));

export const getPendingUser = () => {
  try {
    return JSON.parse(localStorage.getItem(PENDING_KEY));
  } catch {
    return null;
  }
};

export const clearPendingUser = () => localStorage.removeItem(PENDING_KEY);

export const sendOtp = (email) =>
  apiRequest('/v1/verification/send-otp', {
    method: 'POST',
    body: JSON.stringify({ email })
  });

const markVerified = (role, email) =>
  apiRequest(role === 'employer' ? '/v1/employer/update_info' : '/v1/candidate/update_info', {
    method: 'POST',
    body: JSON.stringify({ email, is_verified: true })
  });

// Kiểm tra OTP rồi đánh dấu tài khoản đã xác thực (BE verify-otp chưa tự làm việc này)
export const verifyOtp = async ({ email, role }, otp) => {
  await apiRequest('/v1/verification/verify-otp', {
    method: 'POST',
    body: JSON.stringify({ email, otp })
  });
  await markVerified(role, email);
};

/* ─── Đăng nhập ───────────────────────────────────────────────── */

export class UnverifiedAccountError extends Error {}

export const login = async (role, email, password) => {
  const record = await fetchByRole(role, email.trim());

  if (!record || record.password !== password) {
    throw new Error('Sai email hoặc mật khẩu');
  }

  if (role === 'candidate' && !record.is_verified) {
    setPendingUser({ email: record.email, role, name: record.full_name });
    throw new UnverifiedAccountError('Tài khoản chưa xác thực email');
  }

  return saveSession(toSessionUser(record, role));
};

/* ─── Cập nhật hồ sơ ──────────────────────────────────────────── */

// Tải lại hồ sơ từ BE và cập nhật phiên
export const refreshSession = async () => {
  const current = getCurrentUser();
  if (!current) return null;
  const record = await fetchByRole(current.role, current.email);
  if (!record) return current;
  return saveSession({ ...current, ...toSessionUser(record, current.role) });
};

// BE đặt is_verified = false nếu không gửi kèm, nên luôn gửi giá trị hiện tại
const updateProfile = async (role, fields) => {
  const current = getCurrentUser();
  await apiRequest(role === 'employer' ? '/v1/employer/update_info' : '/v1/candidate/update_info', {
    method: 'POST',
    body: JSON.stringify({ ...fields, email: current.email, is_verified: !!current.is_verified })
  });
  return refreshSession();
};

export const updateCandidateProfile = (fields) => updateProfile('candidate', fields);
export const updateEmployerProfile = (fields) => updateProfile('employer', fields);

export const changePassword = async (currentPassword, newPassword) => {
  const current = getCurrentUser();
  const record = await fetchByRole(current.role, current.email);
  if (!record || record.password !== currentPassword) {
    throw new Error('Mật khẩu hiện tại không đúng');
  }
  await updateProfile(current.role, { password: newPassword });
};
