import request from '@/utils/request'

/** 用户信息数据结构 */
export interface UserInfo {
  CdnExpireAt: string
  GachaLogExpireAt: string
  IsLicensedDeveloper: boolean
  IsMaintainer: boolean
  NormalizedUserName: string
  UserName: string
}

/** 用户列表中的用户数据结构 */
export interface UserListItem {
  CdnExpireAt: string
  CreatedAt: string
  GachaLogExpireAt: string
  IsLicensedDeveloper: boolean
  IsMaintainer: boolean
  NormalizedUserName: string
  UserName: string
  _id: string
  email: string
}

/** API响应数据结构 */
export interface ApiResponse<T> {
  code: number
  data: T
  message: string
}

/**
 * 获取用户信息
 * GET /Passport/v2/UserInfo
 */
export function getUserInfoApi(): Promise<UserInfo> {
  return request({
    url: '/Passport/v2/UserInfo',
    method: 'get',
  })
}

/**
 * 获取用户列表
 * GET /web-api/users
 * @param q 搜索参数，可搜索用户名、邮箱、_id
 */
export function getUserListApi(q?: string): Promise<UserListItem[]> {
  const params: Record<string, any> = {}
  if (q) {
    params.q = q
  }
  
  return request({
    url: '/web-api/users',
    method: 'get',
    params,
  })
}
