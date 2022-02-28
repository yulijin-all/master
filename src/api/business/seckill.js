import request from '@/utils/request'

export function listSeckill(query) {
  return request({
    url: '/seckill/list',
    method: 'get',
    params: query
  })
}

export function deleteSeckill(data) {
  return request({
    url: '/seckill/delete',
    method: 'post',
    data
  })
}

export function publishSeckill(data) {
  return request({
    url: '/seckill/create',
    method: 'post',
    data
  })
}

export function getBatchConfig(data) {
  return request({
    url: '/seckill/getBatchConfig',
    method: 'post',
    data
  })
}
export function detailProduct(query) {
  return request({
    url: '/seckill/detailProduct',
    method: 'get',
    params: query
  })
}

export function detailSeckill(id) {
  return request({
    url: '/seckill/detail',
    method: 'get',
    params: { id }
  })
}

export function updateSeckill(data) {
  return request({
    url: '/seckill/update',
    method: 'post',
    data
  })
}

export function finishSeckill(data) {
  return request({
    url: '/seckill/finish',
    method: 'post',
    data
  })
}

export function listGoods(query) {
  return request({
    url: '/goods/list',
    method: 'get',
    params: query
  })
}

