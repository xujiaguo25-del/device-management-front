/**
 * 権限管理関連サービス
 */

import { get, post, put } from '../api';
import type { DevicePermissionList, DevicePermissionInsert, ApiResponse, DictItem, UserInfo } from '../../types';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx-js-style';
import { saveAs } from 'file-saver';

/**
 * 権限リストを取得
 * @param params クエリパラメータ
 * @returns Promise 権限リストレスポンス
 */
export const getPermissions = async (params: {
    page?: number;
    size?: number;
    userId?: string;
    deviceId?: string;
}): Promise<ApiResponse<DevicePermissionList[]>> => {
    const queryParams = new URLSearchParams();
    if (params.page !== undefined) queryParams.append('page', params.page.toString());
    if (params.size !== undefined) queryParams.append('size', params.size.toString());
    if (params.userId) queryParams.append('userId', params.userId);
    if (params.deviceId) queryParams.append('deviceId', params.deviceId);

    const endpoint = `/permissions${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return get<ApiResponse<DevicePermissionList[]>>(endpoint);
};

/**
 * 権限を追加
 * @param permissionData 権限データ
 * @returns Promise
 */
export const addPermission = async (permissionData: DevicePermissionInsert): Promise<ApiResponse<any>> => {
    return post<ApiResponse<any>>('/permissions', permissionData);
};

/**
 * 権限詳細を取得
 * @param permissionId 権限ID
 * @returns Promise 権限詳細レスポンス
 */
export const getPermissionById = async (permissionId: string): Promise<ApiResponse<DevicePermissionList>> => {
    return get<ApiResponse<DevicePermissionList>>(`/permissions/${permissionId}`);
};

/**
 * 権限を編集
 * @param permissionId 権限ID
 * @param permissionData 権限データ
 * @returns Promise
 */
export const updatePermission = async (
    permissionId: string,
    permissionData: DevicePermissionInsert
): Promise<ApiResponse<any>> => {
    return put<ApiResponse<any>>(`/permissions/${permissionId}`, permissionData);
};

import {getAuthStore} from '../../stores/authStore'
/**
 * 権限リストをExcelにエクスポート
 * @param userInfo ユーザー情報、権限管理に使用
 * @param dictMap 辞書データマッピング、状態テキストの変換に使用
 */
export const exportPermissionsExcel = async (
    userInfo?: UserInfo | null,
    dictMap?: Record<string, DictItem[]>
): Promise<void> => {
    try {
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
        const token = getAuthStore().token;
        const response = await fetch(`${API_BASE_URL}/permissions/export`, {
            method: 'GET',
            headers: {
                'Authorization': token ? `Bearer ${token}` : '',
            },
        });

        if (response.ok) {
            const blob = await response.blob();
            const fileName = `権限リスト_${dayjs().format('YYYYMMDDHHmmss')}.xlsx`;
            saveAs(blob, fileName);
            return;
        }
    } catch (error) {
        console.warn('バックエンドのエクスポートAPIは使用できません。フロントエンドで生成してください:', error);
    }
    // 権限データを取得
    try {
        // 管理者かどうかで userId パラメータを切り替え
        const userId = userInfo?.USER_TYPE_NAME?.toUpperCase() === 'ADMIN' ? undefined : userInfo?.USER_ID;
        const response = await getPermissions({ page: 1, size: 10000, userId });
        if (response.code !== 200 || !response.data) {
            throw new Error('権限データの取得に失敗しました');
        }

        const permissions = response.data;
        
        // 辞書データを取得して状態テキストを変換する
        const domainStatusOptions = (dictMap?.['DOMAIN_STATUS'] || []) as DictItem[];
        const smartitStatusOptions = (dictMap?.['SMARTIT_STATUS'] || []) as DictItem[];
        const usbStatusOptions = (dictMap?.['USB_STATUS'] || []) as DictItem[];
        const antivirusStatusOptions = (dictMap?.['ANTIVIRUS_STATUS'] || []) as DictItem[];
        
        // 補助関数：dictId から dictItemName を検索
        const getLabel = (options: DictItem[], dictId?: number | null) => {
            if (dictId == null) return '';
            const it = options.find(o => o.dictId === dictId);
            return it ? it.dictItemName : '';
        };

        // 見出しを準備する
        const headers = [
            '権限ID', 'デバイスID', 'コンピュータ名', 'IPアドレス', 'ユーザーID', 'ユーザー名', '部門ID', 
            'ログインユーザー名', 'Domain状態', 'Domainグループ', 'SmartIT状態', 'USB状態', 'USBの有効期限',
            'アンチウイルス状態', '備考'
        ];

        // Excelデータを準備する（辞書データを使用して状態テキストを変換）
        const excelData = permissions.map(p => [
            p.permissionId,
            p.deviceId,
            p.computerName || '',
            p.ipAddress?.join(', ') || '',
            p.userId,
            p.name || '',
            p.deptId || '',
            p.loginUsername || '',
            getLabel(domainStatusOptions, p.domainStatus) || p.domainName || '',
            p.domainGroup || '',
            getLabel(smartitStatusOptions, p.smartitStatus) || p.smartitStatusText || '',
            getLabel(usbStatusOptions, p.usbStatus) || p.usbStatusText || '',
            p.usbExpireDate || '',
            getLabel(antivirusStatusOptions, p.antivirusStatus) || p.antivirusStatusText || '',
            p.remark || '',
        ]);

        // ワークブックを作成
        const wb = XLSX.utils.book_new();
        
        // データ配列を作成する（ヘッダー行 データ行）
        const allData = [headers, ...excelData];
        const ws = XLSX.utils.aoa_to_sheet(allData);

        // 列の幅を設定
        const colWidths = [
            { wch: 12 }, // 権限ID
            { wch: 12 }, // デバイスID
            { wch: 15 }, // コンピュータ名
            { wch: 20 }, // IPアドレス
            { wch: 12 }, // ユーザーID
            { wch: 12 }, // ユーザー名
            { wch: 12 }, // 部門ID
            { wch: 15 }, // ログインユーザー名
            { wch: 15 }, // Domain状態
            { wch: 12 }, // Domainグループ
            { wch: 15 }, // SmartIT状態
            { wch: 15 }, // USB状態
            { wch: 15 }, // USBの有効期限
            { wch: 15 }, // アンチウイルス状態
            { wch: 30 }, // 備考
        ];
        ws['!cols'] = colWidths;

        // 行の高さを設定
        ws['!rows'] = [
            { hpt: 25 }, // ヘッダー行の高さ
        ];

        // スタイルを定義
        const headerStyle = {
            font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 11 },
            fill: { fgColor: { rgb: '4472C4' } }, // 青色背景
            alignment: { 
                horizontal: 'center', 
                vertical: 'center',
                wrapText: true
            },
            border: {
                top: { style: 'thin', color: { rgb: '000000' } },
                bottom: { style: 'thin', color: { rgb: '000000' } },
                left: { style: 'thin', color: { rgb: '000000' } },
                right: { style: 'thin', color: { rgb: '000000' } }
            }
        };

        const cellStyle = {
            alignment: { 
                vertical: 'center',
                wrapText: true
            },
            border: {
                top: { style: 'thin', color: { rgb: 'D0D0D0' } },
                bottom: { style: 'thin', color: { rgb: 'D0D0D0' } },
                left: { style: 'thin', color: { rgb: 'D0D0D0' } },
                right: { style: 'thin', color: { rgb: 'D0D0D0' } }
            }
        };

        // ヘッダー行スタイルを適用
        for (let C = 0; C <= headers.length - 1; ++C) {
            const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C });
            if (!ws[cellAddress]) continue;
            ws[cellAddress].s = headerStyle;
        }

        // データ行スタイルを適用
        for (let R = 1; R <= excelData.length; ++R) {
            for (let C = 0; C <= headers.length - 1; ++C) {
                const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
                if (!ws[cellAddress]) continue;
                ws[cellAddress].s = cellStyle;
                
                // 状態列の特別処理（テキスト値に応じて色を設定）
                const colIndex = C;
                const value = ws[cellAddress].v;
                
                if (colIndex === 10) { // SmartIT状態（第11列，索引10）
                    if (value === '本地' || value === '远程') {
                        ws[cellAddress].s = {
                            ...cellStyle,
                            fill: { fgColor: { rgb: 'C6EFCE' } }, // 浅绿色
                            font: { color: { rgb: '006100' } } // 深绿色文字
                        };
                    } else if (value === '未安装') {
                        ws[cellAddress].s = {
                            ...cellStyle,
                            fill: { fgColor: { rgb: 'FFC7CE' } }, // 浅红色
                            font: { color: { rgb: '9C0006' } } // 深红色文字
                        };
                    }
                } else if (colIndex === 11) { // USB状態（第12列，索引11）
                    if (value === 'データ' || value === '3Gモデム') {
                        ws[cellAddress].s = {
                            ...cellStyle,
                            fill: { fgColor: { rgb: 'C6EFCE' } }, // 浅绿色
                            font: { color: { rgb: '006100' } } // 深绿色文字
                        };
                    } else if (value === '閉じる') {
                        ws[cellAddress].s = {
                            ...cellStyle,
                            fill: { fgColor: { rgb: 'FFC7CE' } }, // 浅红色
                            font: { color: { rgb: '9C0006' } } // 深红色文字
                        };
                    }
                } else if (colIndex === 13) { // アンチウイルス状態（第14列，索引13）
                    if (value === '自動') {
                        ws[cellAddress].s = {
                            ...cellStyle,
                            fill: { fgColor: { rgb: 'C6EFCE' } }, // 浅绿色
                            font: { color: { rgb: '006100' } } // 深绿色文字
                        };
                    } else if (value === '手動') {
                        ws[cellAddress].s = {
                            ...cellStyle,
                            fill: { fgColor: { rgb: 'FFE699' } }, // 浅黄色
                            font: { color: { rgb: '9C6500' } } // 深黄色文字
                        };
                    }
                }
            }
        }

        // ワークシートをワークブックに追加
        XLSX.utils.book_append_sheet(wb, ws, '権限リスト');

        // Excelファイルを生成
        const excelBuffer = XLSX.write(wb, { 
            bookType: 'xlsx', 
            type: 'array',
            cellStyles: true
        });

        // Blobオブジェクトを作成して保存
        const blob = new Blob([excelBuffer], { 
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
        });

        // file-saverを使用してファイルを保存し、ファイル名にタイムスタンプを含める
        const fileName = `権限リスト_${dayjs().format('YYYYMMDDHHmmss')}.xlsx`;
        saveAs(blob, fileName);
    } catch (error) {
        throw new Error('Excelのエクスポートに失敗しました: ' + (error instanceof Error ? error.message : String(error)));
    }
};