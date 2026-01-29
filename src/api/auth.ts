import request from '@/utils/request'

/** 登录请求参数 */
export interface WebLoginParams {
  email: string
  password: string
}

/** 登录返回数据 */
export interface WebLoginResult {
  access_token: string
  expires_in: number
}

/**
 * WEB 登录 API
 * POST /web-api/login
 */
export function webLoginApi(data: WebLoginParams) {
  return request<WebLoginResult>({
    url: '/web-api/login',
    method: 'post',
    data,
  })
}
