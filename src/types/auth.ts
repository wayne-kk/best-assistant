export type User = {
  id: string;
  name: string;
  avatar?: string;
};

export type LoginCredentials = {
  account: string; // 手机号或邮箱
  password: string;
  rememberMe?: boolean;
};

export type LoginResult = {
  token: string;
  user: User;
  expiresIn?: number; // 秒，可选
};
