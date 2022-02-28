import request from '@/utils/request'
import Qs from 'qs'

export function fetchList(query) {
  return request({
    url: '/bill/list',
    method: 'get',
    params: query,
    paramsSerializer: function(params) {
      return Qs.stringify(params, { arrayFormat: 'repeat' })
    }
  })
}

export function approveTrace(data) {
  return request({
    url: '/bill/approve',
    method: 'post',
    data
  })
}
