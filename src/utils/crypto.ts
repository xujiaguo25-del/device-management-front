/**
 * 暗号化ユーティリティ
 * バックエンドの CryptoUtil に対応（ECB で暗号化）
 */

import CryptoJS from 'crypto-js';

const KEY = '1234567890abcdef';
// crypto-js では ECB モードがデフォルトです

/**
 * AES 暗号化（ECB / PKCS5Padding）
 * @param plainText 平文
 * @returns Base64 エンコードされた暗号文
 */
export const encrypt = (plainText: string): string => {
  try {
    // crypto-js で AES 暗号化
    // CryptoJS.mode.ECB: ECB モード
    // CryptoJS.pad.Pkcs7: PKCS7 パディング（PKCS5 相当）
    const key = CryptoJS.enc.Utf8.parse(KEY);
    const encrypted = CryptoJS.AES.encrypt(plainText, key, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7,
    });
    
    // Base64 エンコードされた暗号文を返す
    return encrypted.toString();
  } catch (error) {
    console.error('暗号化に失敗しました:', error);
    throw new Error('暗号化に失敗しました');
  }
};

/**
 * AES 復号（ECB / PKCS5Padding）
 * @param base64 Base64 エンコードされた暗号文
 * @returns 平文
 */
export const decrypt = (base64: string): string => {
  try {
    const key = CryptoJS.enc.Utf8.parse(KEY);
    const decrypted = CryptoJS.AES.decrypt(base64, key, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7,
    });
    
    return decrypted.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error('復号に失敗しました:', error);
    throw new Error('復号に失敗しました');
  }
};
