export interface DictItem {
    dictId: number;
    dictItemName: string;
    sort: number;
}

export interface DictType {
    dictTypeCode: string;
    dictItems: DictItem[];
}

export const DICT_MOCK: DictType[] = [
    {"dictTypeCode":"SMARTIT_STATUS","dictItems":[{"dictId":41,"dictItemName":"インストール済み","sort":1},{"dictId":40,"dictItemName":"未インストール","sort":2}]},
    {"dictTypeCode":"DOMAIN_STATUS","dictItems":[{"dictId":39,"dictItemName":"参加済み","sort":1},{"dictId":38,"dictItemName":"未参加","sort":2}]},
    {"dictTypeCode":"OS_TYPE","dictItems":[{"dictId":21,"dictItemName":"Windows 10","sort":1},{"dictId":22,"dictItemName":"Windows 11","sort":2},{"dictId":23,"dictItemName":"macOS Ventura","sort":3},{"dictId":24,"dictItemName":"Linux Ubuntu 22.04","sort":4}]},
    {"dictTypeCode":"USER_TYPE","dictItems":[{"dictId":12,"dictItemName":"admin","sort":1},{"dictId":11,"dictItemName":"user","sort":2}]},
    {"dictTypeCode":"MEMORY_SIZE","dictItems":[{"dictId":28,"dictItemName":"8GB","sort":1},{"dictId":27,"dictItemName":"16GB","sort":2},{"dictId":26,"dictItemName":"32GB","sort":3},{"dictId":25,"dictItemName":"64GB","sort":4}]},
    {"dictTypeCode":"ANTIVIRUS_STATUS","dictItems":[{"dictId":47,"dictItemName":"インストール済み","sort":1},{"dictId":46,"dictItemName":"未インストール","sort":2},{"dictId":45,"dictItemName":"有効期限切れ","sort":3}]},
    {"dictTypeCode":"USB_STATUS","dictItems":[{"dictId":44,"dictItemName":"許可","sort":1},{"dictId":42,"dictItemName":"禁止","sort":2},{"dictId":43,"dictItemName":"一時許可","sort":3}]},
    {"dictTypeCode":"CONFIRM_STATUS","dictItems":[{"dictId":37,"dictItemName":"確認済み","sort":1},{"dictId":36,"dictItemName":"未確認","sort":2}]},
    {"dictTypeCode":"SSD_SIZE","dictItems":[{"dictId":32,"dictItemName":"256GB","sort":1},{"dictId":31,"dictItemName":"512GB","sort":2},{"dictId":30,"dictItemName":"1TB","sort":3},{"dictId":29,"dictItemName":"2TB","sort":4}]},
    {"dictTypeCode":"HDD_SIZE","dictItems":[{"dictId":35,"dictItemName":"1TB","sort":1},{"dictId":34,"dictItemName":"2TB","sort":2},{"dictId":33,"dictItemName":"4TB","sort":3}]} 
];

export function getDict(typeCode: string) {
    const entry = DICT_MOCK.find(d => d.dictTypeCode === typeCode);
    return entry ? entry.dictItems.slice().sort((a, b) => a.sort - b.sort) : [];
}

export function getDictMap(typeCode: string) {
    const map: Record<string | number, string> = {};
    getDict(typeCode).forEach(item => {
        map[item.dictId] = item.dictItemName;
        map[item.dictItemName] = item.dictItemName;
    });
    return map;
}

export default DICT_MOCK;
