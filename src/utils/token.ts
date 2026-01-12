/**
 * JWT Token 验证工具
 */

/**
 * 解析 JWT token 的 payload
 * @param token JWT token
 * @returns payload 对象或 null
 */
const parseJWTPayload = (token: string): any | null => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }
    
    // 解码 base64 payload
    const payload = parts[1];
    const decodedPayload = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decodedPayload);
  } catch (error) {
    console.error('JWT token 解析失败:', error);
    return null;
  }
};

/**
 * 检查 token 是否过期
 * @param token JWT token
 * @returns true 如果 token 有效（未过期），false 如果过期或无效
 */
export const isTokenValid = (token: string | null): boolean => {
  if (!token) {
    return false;
  }

  const payload = parseJWTPayload(token);
  if (!payload) {
    return false;
  }

  // 检查是否有 exp (expiration time) 字段
  if (payload.exp) {
    const currentTime = Math.floor(Date.now() / 1000); // 当前时间（秒）
    // 如果过期时间小于当前时间，token 已过期
    if (payload.exp < currentTime) {
      return false;
    }
  }

  return true;
};

/**
 * 检查 token 是否即将过期（在指定时间内过期）
 * @param token JWT token
 * @param bufferSeconds 缓冲时间（秒），默认 300 秒（5分钟）
 * @returns true 如果 token 即将过期
 */
export const isTokenExpiringSoon = (token: string | null, bufferSeconds: number = 300): boolean => {
  if (!token) {
    return false;
  }

  const payload = parseJWTPayload(token);
  if (!payload || !payload.exp) {
    return false;
  }

  const currentTime = Math.floor(Date.now() / 1000);
  const expirationTime = payload.exp;
  const timeUntilExpiration = expirationTime - currentTime;

  return timeUntilExpiration > 0 && timeUntilExpiration <= bufferSeconds;
};
