import type { LoginCredentials, LoginResult } from '../types/auth';

const BASE_URL = ''; // 接入 BFF 后填写，如 'https://api.example.com'

/**
 * 登录接口（预留）
 * 接入真实后端时：替换为 fetch(BASE_URL + '/auth/login', { method: 'POST', body: JSON.stringify({ account, password }) })
 * 并解析返回的 { token, user }，失败时 throw new Error(message)
 */
export async function login(credentials: LoginCredentials): Promise<LoginResult> {
  const { account, password } = credentials;

  if (BASE_URL) {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ account, password }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data?.message ?? `请求失败 ${res.status}`);
    }
    return {
      token: data.token ?? '',
      user: data.user ?? { id: '', name: account },
      expiresIn: data.expiresIn,
    };
  }

  // 无后端时：模拟登录（任意账号密码均可，延迟模拟网络）
  await new Promise((r) => setTimeout(r, 800));
  const trimmed = account.trim();
  if (!trimmed || !password) {
    throw new Error('请输入账号和密码');
  }
  return {
    token: `mock_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    user: {
      id: 'mock_user_id',
      name: trimmed.includes('@') ? trimmed.split('@')[0] : trimmed,
    },
  };
}
