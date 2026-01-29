import request from '@/utils/request'

/** 公告数据类型 */
export interface Announcement {
  Content: string
  Id: number
  LastUpdateTime: number
  Link: string | null
  Locale: string | null
  MaxPresentVersion: string | null
  Severity: number
  Title: string
  Distribution: string | null
}

/** 公告列表响应数据类型 */
export interface AnnouncementListResponse {
  code: number
  data: Announcement[]
  message: string
}

/**
 * 获取公告列表 API
 * POST /Announcement/List
 */
export function getAnnouncementListApi(): Promise<Announcement[]> {
  return request({
    url: '/Announcement/List',
    method: 'post',
  })
}

/** 创建公告请求参数类型 */
export interface CreateAnnouncementRequest {
  Content: string
  Title: string
  Link?: string | null
  Locale?: string | null
  MaxPresentVersion?: string | null
  Severity?: number | null
  Distribution?: string | null
}

/** 创建公告响应数据类型 */
export interface CreateAnnouncementResponse {
  code: number
  data: {
    Id: number
  }
  message: string
}

/**
 * 创建公告 API
 * POST /web-api/announcement
 * 注意：由于request.ts拦截器处理，实际返回的是data部分，即 { Id: number }
 */
export function createAnnouncementApi(params: CreateAnnouncementRequest): Promise<{ Id: number }> {
  return request({
    url: '/web-api/announcement',
    method: 'post',
    data: params,
  })
}

/**
 * 编辑公告 API
 * PUT /web-api/announcement/{announcement_id}
 */
export function updateAnnouncementApi(id: number, params: CreateAnnouncementRequest): Promise<null> {
  return request({
    url: `/web-api/announcement/${id}`,
    method: 'put',
    data: params,
  })
}

/**
 * 删除公告 API
 * DELETE /web-api/announcement/{announcement_id}
 */
export function deleteAnnouncementApi(id: number): Promise<null> {
  return request({
    url: `/web-api/announcement/${id}`,
    method: 'delete',
  })
}

