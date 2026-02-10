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
 * @param params 搜索和筛选参数
 * @param params.q 搜索关键词，可搜索用户名、邮箱、_id
 * @param params.role 按角色筛选：maintainer, developer, user
 * @param params.email 按邮箱筛选
 * @param params.username 按用户名筛选
 * @param params.id 按用户ID筛选
 * @param params.is 按状态筛选：licensed, not-licensed
 */
export function getUserListApi(params?: {
  q?: string
  role?: string
  email?: string
  username?: string
  id?: string
  is?: string
}): Promise<UserListItem[]> {
  return request({
    url: '/web-api/users',
    method: 'get',
    params,
  })
}
