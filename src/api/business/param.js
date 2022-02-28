import request from '@/utils/request'

export function listParam(query) {
  return request({
    url: '/param/list',
    method: 'get',
    params: query
  })
}

export function createParam(data) {
  return request({
    url: '/param/create',
    method: 'post',
    data
  })
}

export function updateParam(data) {
  return request({
    url: '/param/update',
    method: 'post',
    data
  })
}

export function deleteParam(data) {
  return request({
    url: '/param/delete',
    method: 'post',
    data
  })
}
