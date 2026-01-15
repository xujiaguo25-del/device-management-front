/**
 * JWT Token 検証ユーティリティ
 */

/**
 * JWT token の payload を解析
 * @param token JWT token
 * @returns payload オブジェクトまたは null
 */
interface JWTPayload {
  exp?: number;
  [key: string]: unknown;
}

const parseJWTPayload = (token: string): JWTPayload | null => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }
    
    // base64 payload をデコード
    const payload = parts[1];
    const decodedPayload = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decodedPayload);
  } catch (error) {
    // 開発環境でのみエラーログを出力
    if (import.meta.env.DEV) {
      console.error('JWT token 解析に失敗しました:', error);
    }
    return null;
  }
};

/**
 * token が过期しているかチェック
 * @param token JWT token
 * @returns true の場合、token が有効（未过期）、false の場合、过期または無効
 */
export const isTokenValid = (token: string | null): boolean => {
  if (!token) {
    return false;
  }

  const payload = parseJWTPayload(token);
  if (!payload) {
    return false;
  }

  // exp (expiration time) フィールドがあるかチェック
  if (payload.exp) {
    const currentTime = Math.floor(Date.now() / 1000); // 現在時刻（秒）
    // 过期時刻が現在時刻より小さい場合、token は过期
    if (payload.exp < currentTime) {
      return false;
    }
  }

  return true;
};

/**
 * token が間もなく过期するかチェック（指定時間内に过期）
 * @param token JWT token
 * @param bufferSeconds バッファ時間（秒）、デフォルト 300 秒（5分）
 * @returns true の場合、token が間もなく过期
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
