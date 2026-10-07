import { HTTP_STATUS } from '../../../src/constants';
import { ApiError, apiRequest } from '../../../src/services';

const BASE_URL = 'http://api.test';

const jsonResponse = (status: number, body: unknown) =>
  ({ ok: status >= 200 && status < 300, status, json: () => Promise.resolve(body) }) as Response;

describe('apiRequest', () => {
  const fetchMock = jest.fn();

  beforeEach(() => {
    process.env.EXPO_PUBLIC_API_URL = `${BASE_URL}/`;
    globalThis.fetch = fetchMock;
  });

  afterEach(() => {
    delete process.env.EXPO_PUBLIC_API_URL;
  });

  it('posts JSON with the bearer token and returns the body', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(200, { ok: true }));
    await expect(
      apiRequest('/api/x', { method: 'POST', body: { a: 1 }, token: 't' })
    ).resolves.toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledWith(`${BASE_URL}/api/x`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: 'Bearer t'
      },
      body: JSON.stringify({ a: 1 })
    });
  });

  it("throws the backend's status and message", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(401, { error: { code: 401, message: 'Nope' } }));
    await expect(apiRequest('/api/x')).rejects.toMatchObject({ status: 401, message: 'Nope' });
  });

  it('keeps the status for an error without the shared shape', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(502, 'bad gateway'));
    await expect(apiRequest('/api/x')).rejects.toMatchObject({ status: 502 });
  });

  it('throws status 0 when the request cannot be sent', async () => {
    fetchMock.mockRejectedValueOnce(new TypeError('Network request failed'));
    const error = await apiRequest('/api/x').catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).status).toBe(HTTP_STATUS.networkError);
  });
});
