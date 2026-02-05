import request from '@/utils/request'

/** 下载资源信息 */
export interface DownloadResource {
  id?: string
  created_at: string
  created_by: string
  download_url: string
  features: string | null
  file_hash: string | null
  file_size: string | null
  is_active: boolean | null
  package_type: string
  version: string
}

/**
 * 获取所有发布的资源
 * GET /download-resources
 */
export function getDownloadResourcesApi(): Promise<DownloadResource[]> {
  return request({
    url: '/download-resources',
    method: 'get',
  })
}

/**
 * 获取最新版本
 * GET /download-resources/latest
 */
export function getLatestVersionApi(): Promise<DownloadResource> {
  return request({
    url: '/download-resources/latest',
    method: 'get',
  })
}

/**
 * 获取资源列表（包含未激活的）
 * GET /web-api/download-resources
 * @param package_type 筛选包类型（msi或者msix）
 * @param is_active 筛选是否激活
 */
export function getDownloadResourceListApi(params?: {
  package_type?: string
  is_active?: string
}): Promise<DownloadResource[]> {
  return request({
    url: '/web-api/download-resources',
    method: 'get',
    params,
  })
}

/**
 * 获取单个资源详情
 * GET /web-api/download-resources/{resource_id}
 * @param resource_id 资源id
 */
export function getDownloadResourceDetailApi(resource_id: string): Promise<DownloadResource> {
  return request({
    url: `/web-api/download-resources/${resource_id}`,
    method: 'get',
  })
}

/**
 * 删除下载资源
 * DELETE /web-api/download-resources/{resource_id}
 * @param resource_id 资源id
 */
export function deleteDownloadResourceApi(resource_id: string): Promise<null> {
  return request({
    url: `/web-api/download-resources/${resource_id}`,
    method: 'delete',
  })
}

/** 创建资源请求参数类型 */
export interface CreateResourceRequest {
  version: string
  package_type: string
  download_url: string
  features?: string | null
  file_size?: string | null
  file_hash?: string | null
  is_active?: boolean | null
}

/** 创建资源响应数据类型 */
export interface CreateResourceResponse {
  id: string
}

/**
 * 创建新版本资源信息
 * POST /web-api/download-resources
 */
export function createDownloadResourceApi(params: CreateResourceRequest): Promise<CreateResourceResponse> {
  return request({
    url: '/web-api/download-resources',
    method: 'post',
    data: params,
  })
}

/**
 * 更新下载资源
 * PUT /web-api/download-resources/{resource_id}
 * @param resource_id 资源id
 */
export function updateDownloadResourceApi(resource_id: string, params: Partial<CreateResourceRequest>): Promise<null> {
  return request({
    url: `/web-api/download-resources/${resource_id}`,
    method: 'put',
    data: params,
  })
}