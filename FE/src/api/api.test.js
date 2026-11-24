import { describe, it, expect, afterEach, vi } from 'vitest';
import { apiRequest, API_BASE } from './api';

const mockFetch = (status, body) => {
  const text = body === undefined ? '' : typeof body === 'string' ? body : JSON.stringify(body);
  const fn = vi.fn().mockResolvedValue({ ok: status >= 200 && status < 300, status, text: () => Promise.resolve(text) });
  vi.stubGlobal('fetch', fn);
  return fn;
};

afterEach(() => vi.unstubAllGlobals());

describe('apiRequest', () => {
  it('gọi đúng URL, gửi JSON và trả về dữ liệu', async () => {
    const fetch = mockFetch(200, { status: true, jobs: [1] });
    const data = await apiRequest('/v1/job/get_by_id?id=1', { method: 'POST', body: '{}' });
    expect(data).toEqual({ status: true, jobs: [1] });
    const [url, options] = fetch.mock.calls[0];
    expect(url).toBe(`${API_BASE}/v1/job/get_by_id?id=1`);
    expect(options.method).toBe('POST');
    expect(options.headers['Content-Type']).toBe('application/json');
  });

  it('phản hồi rỗng thì trả null', async () => {
    mockFetch(200);
    expect(await apiRequest('/x')).toBeNull();
  });

  it('BE trả 200 nhưng status false thì ném lỗi nghiệp vụ', async () => {
    mockFetch(200, { status: false, error: 'Email đã tồn tại' });
    await expect(apiRequest('/x')).rejects.toThrow('Email đã tồn tại');
  });

  it('lỗi HTTP: lấy message / detail chuỗi / detail mảng của FastAPI', async () => {
    mockFetch(400, { message: 'Sai dữ liệu' });
    await expect(apiRequest('/x')).rejects.toThrow('Sai dữ liệu');
    mockFetch(404, { detail: 'Not Found' });
    await expect(apiRequest('/x')).rejects.toThrow('Not Found');
    mockFetch(422, { detail: [{ msg: 'field required' }] });
    await expect(apiRequest('/x')).rejects.toThrow('field required');
  });

  it('lỗi HTTP không có nội dung JSON thì báo mã lỗi', async () => {
    mockFetch(500, '<html>Internal</html>');
    await expect(apiRequest('/x')).rejects.toThrow('Lỗi máy chủ (500)');
  });

  it('không kết nối được máy chủ', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
    await expect(apiRequest('/x')).rejects.toThrow('Không kết nối được máy chủ');
  });
});
