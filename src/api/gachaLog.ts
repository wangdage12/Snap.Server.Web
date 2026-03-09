import request from '@/utils/request'

/** 祈愿记录条目 */
export interface GachaLogEntry {
  Excluded: boolean
  ItemCount: number
  Uid: string
}

/** 祈愿记录数据项 */
export interface GachaLogItem {
  GachaType: number
  Id: number
  ItemId: number
  QueryType: number
  Time: string
}

/** EndIds 类型 - 各祈愿类型的起始ID */
export interface EndIds {
  '100': number // 新手祈愿
  '200': number // 常驻祈愿
  '301': number // 角色活动祈愿
  '302': number // 武器活动祈愿
  '500': number // 集录祈愿
}

/**
 * 获取云抽卡记录列表
 * GET /GachaLog/Entries
 */
export function getGachaLogEntriesApi(): Promise<GachaLogEntry[]> {
  return request({
    url: '/GachaLog/Entries',
    method: 'get',
  })
}

/**
 * 获取云抽卡数据
 * POST /GachaLog/Retrieve
 * @param uid 用户游戏UID
 * @param endIds 各个祈愿类型的起始ID
 */
export function getGachaLogDataApi(uid: string, endIds: EndIds): Promise<GachaLogItem[]> {
  return request({
    url: '/GachaLog/Retrieve',
    method: 'post',
    data: {
      Uid: uid,
      EndIds: endIds,
    },
  })
}

/**
 * 祈愿类型映射 (QueryType -> 名称)
 */
export const GACHA_TYPE_NAMES: Record<number, string> = {
  100: '新手祈愿',
  200: '常驻祈愿',
  301: '角色活动祈愿',
  302: '武器活动祈愿',
  500: '集录祈愿',
}

/**
 * GachaType 到 QueryType 的映射
 * 用于合并共享保底的卡池
 */
export function gachaTypeToQueryType(gachaType: number): number {
  // 400 是角色活动祈愿的子类型，合并到 301
  if (gachaType === 400) return 301
  return gachaType
}

/**
 * 获取物品的祈愿类型名称
 */
export function getGachaTypeName(gachaType: number): string {
  const queryType = gachaTypeToQueryType(gachaType)
  return GACHA_TYPE_NAMES[queryType] || `未知类型(${gachaType})`
}
