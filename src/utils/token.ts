/**
 * JWT トークン検証ユーティリティ
 */

/**
 * JWT トークンの payload を解析します
 * @param token JWT token
 * @returns payload オブジェクトまたは null
 */
const parseJWTPayload = (token: string): any | null => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }
    
    // base64 エンコードされた payload をデコードします
    const payload = parts[1];
    const decodedPayload = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decodedPayload);
  } catch (error) {
    console.error('JWT token 解析失败:', error);
    return null;
  }
};

/**
 * トークンが期限切れかどうかをチェックします
 * @param token JWT token
 * @returns true: トークンが有効（期限内）の場合、false: 期限切れまたは無効な場合
 */
export const isTokenValid = (token: string | null): boolean => {
  if (!token) {
    return false;
  }

  const payload = parseJWTPayload(token);
  if (!payload) {
    return false;
  }

  // exp (有効期限) フィールドがあるかチェックします
  if (payload.exp) {
    const currentTime = Math.floor(Date.now() / 1000); // 現在時刻（秒）
    // exp が現在時刻より小さい場合、トークンは期限切れです
    if (payload.exp < currentTime) {
      return false;
    }
  }

  return true;
};

/**
 * トークンがまもなく期限切れになるかどうかをチェックします
 * @param token JWT token
 * @param bufferSeconds バッファ時間（秒）、デフォルトは 300 秒（5 分）
 * @returns true: トークンがまもなく期限切れになる場合
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
