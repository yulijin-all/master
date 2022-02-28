import request from '@/utils/request'

export function listMerchantApply(query) {
  return request({
    url: '/merchant/list',
    method: 'get',
    params: query
  })
}

export function verifyMerchantApply(data) {
  return request({
    url: '/merchant/verify',
    method: 'post',
    data
  })
}
