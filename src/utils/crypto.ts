/**
 * 加密工具类
 * 对应后端的 CryptoUtil，使用 ECB加密
 */

import CryptoJS from 'crypto-js';

const KEY = '1234567890abcdef';
// crypto-js 中 ECB 模式是默认的

/**
 * AES 加密（ECB 模式，PKCS5Padding）
 * @param plainText 明文
 * @returns Base64 编码的密文
 */
export const encrypt = (plainText: string): string => {
  try {
    // 使用 crypto-js 进行 AES 加密
    // CryptoJS.mode.ECB 是 ECB 模式
    // CryptoJS.pad.Pkcs7 是 PKCS7 填充（等同于 PKCS5）
    const key = CryptoJS.enc.Utf8.parse(KEY);
    const encrypted = CryptoJS.AES.encrypt(plainText, key, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7,
    });
    
    // 返回 Base64 编码的密文
    return encrypted.toString();
  } catch (error) {
    console.error('加密失败:', error);
    throw new Error('加密失败');
  }
};

/**
 * AES 解密（ECB 模式，PKCS5Padding）
 * @param base64 Base64 编码的密文
 * @returns 明文
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
    console.error('解密失败:', error);
    throw new Error('解密失败');
  }
};
