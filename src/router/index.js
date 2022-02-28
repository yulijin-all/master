import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/views/layout/Layout'

/** note: Submenu only appear when children.length>=1
 *  detail see  https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
 **/

/**
* hidden: true                   if `hidden:true` will not show in the sidebar(default is false)
* alwaysShow: true               if set true, will always show the root menu, whatever its child routes length
*                                if not set alwaysShow, only more than one route under the children
*                                it will becomes nested mode, otherwise not show the root menu
* redirect: noredirect           if `redirect:noredirect` will no redirect in the breadcrumb
* name:'router-name'             the name is used by <keep-alive> (must set!!!)
* meta : {
    perms: ['GET /aaa','POST /bbb']     will control the page perms (you can set multiple perms)
    title: 'title'               the name show in submenu and breadcrumb (recommend set)
    icon: 'svg-name'             the icon show in the sidebar,
    noCache: true                if true ,the page will no be cached(default is false)
  }
**/
export const constantRouterMap = [
  {
    path: '/redirect',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '/redirect/:path*',
        component: () => import('@/views/redirect/index')
      }
    ]
  },
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },
  {
    path: '/auth-redirect',
    component: () => import('@/views/login/authredirect'),
    hidden: true
  },
  {
    path: '/404',
    component: () => import('@/views/errorPage/404'),
    hidden: true
  },
  {
    path: '/401',
    component: () => import('@/views/errorPage/401'),
    hidden: true
  },
  {
    path: '',
    component: Layout,
    redirect: 'dashboard',
    children: [
      {
        path: 'dashboard',
        component: () => import('@/views/dashboard/index'),
        name: 'Dashboard',
        meta: { title: 'dashboard', icon: 'dashboard', noCache: true }
      }
    ]
  }
]

export default new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRouterMap
})

export const asyncRouterMap = [
  {
    path: '/user',
    component: Layout,
    redirect: 'noredirect',
    alwaysShow: true,
    name: 'userManage',
    meta: {
      title: '用户管理',
      icon: 'peoples'
    },
    children: [
      {
        path: 'user',
        component: () => import('@/views/user/user'),
        name: 'user',
        meta: {
          perms: ['GET /admin/user/list'],
          title: '会员管理',
          icon: 'user',
          noCache: true
        }
      },
      {
        path: 'account',
        component: () => import('@/views/user/account'),
        name: 'account',
        meta: {
          perms: ['GET /admin/account/list'],
          title: '佣金管理',
          icon: 'money',
          noCache: true
        }
      },
      {
        path: 'address',
        component: () => import('@/views/user/address'),
        name: 'address',
        meta: {
          perms: ['GET /admin/address/list'],
          title: '收货地址',
          icon: 'email',
          noCache: true
        }
      },
      {
        path: 'collect',
        component: () => import('@/views/user/collect'),
        name: 'collect',
        meta: {
          perms: ['GET /admin/collect/list'],
          title: '会员收藏',
          icon: 'star',
          noCache: true
        }
      },
      {
        path: 'footprint',
        component: () => import('@/views/user/footprint'),
        name: 'footprint',
        meta: {
          perms: ['GET /admin/footprint/list'],
          title: '会员足迹',
          icon: 'guide',
          noCache: true
        }
      },
      {
        path: 'history',
        component: () => import('@/views/user/history'),
        name: 'history',
        meta: {
          perms: ['GET /admin/history/list'],
          title: '搜索历史',
          icon: 'drag',
          noCache: true
        }
      },
      {
        path: 'feedback',
        component: () => import('@/views/user/feedback'),
        name: 'feedback',
        meta: {
          perms: ['GET /admin/feedback/list'],
          title: '意见反馈',
          icon: 'message',
          noCache: true
        }
      }
    ]
  },

  {
    path: '/mall',
    component: Layout,
    redirect: 'noredirect',
    alwaysShow: true,
    name: 'mallManage',
    meta: {
      title: '商场管理',
      icon: 'shopping'
    },
    children: [
      {
        path: 'region',
        component: () => import('@/views/mall/region'),
        name: 'region',
        meta: {
          title: '行政区域',
          icon: 'international',
          noCache: true
        }
      },
      {
        path: 'brand',
        component: () => import('@/views/mall/brand'),
        name: 'brand',
        meta: {
          perms: ['GET /admin/brand/list', 'POST /admin/brand/create', 'GET /admin/brand/read', 'POST /admin/brand/update', 'POST /admin/brand/delete'],
          title: '品牌制造商',
          icon: 'example',
          noCache: true
        }
      },
      {
        path: 'category',
        component: () => import('@/views/mall/category'),
        name: 'category',
        meta: {
          perms: ['GET /admin/category/list', 'POST /admin/category/create', 'GET /admin/category/read', 'POST /admin/category/update', 'POST /admin/category/delete'],
          title: '商品类目',
          icon: 'list',
          noCache: true
        }
      },
      {
        path: 'withdrawalrecord',
        component: () => import('@/views/mall/withdrawalrecord'),
        name: 'withdrawalrecord',
        meta: {
          perms: ['GET /admin/account/list'],
          title: '提现记录',
          icon: 'money',
          noCache: true
        }
      },
      {
        path: 'order',
        component: () => import('@/views/mall/order'),
        name: 'order',
        meta: {
          perms: ['GET /admin/order/list', 'GET /admin/order/detail', 'POST /admin/order/ordership', 'POST /admin/order/orderrefund', 'POST /admin/order/orderreply'],
          title: '订单管理',
          icon: 'nested',
          noCache: true
        }
      },
      {
        path: 'issue',
        component: () => import('@/views/mall/issue'),
        name: 'issue',
        meta: {
          perms: ['GET /admin/issue/list', 'POST /admin/issue/create', 'GET /admin/issue/read', 'POST /admin/issue/update', 'POST /admin/issue/delete'],
          title: '通用问题',
          icon: 'qq',
          noCache: true
        }
      },
      {
        path: 'keyword',
        component: () => import('@/views/mall/keyword'),
        name: 'keyword',
        meta: {
          perms: ['GET /admin/keyword/list', 'POST /admin/keyword/create', 'GET /admin/keyword/read', 'POST /admin/keyword/update', 'POST /admin/keyword/delete'],
          title: '关键词',
          icon: 'bug',
          noCache: true
        }
      }
    ]
  },

  {
    path: '/goods',
    component: Layout,
    redirect: 'noredirect',
    alwaysShow: true,
    name: 'goodsManage',
    meta: {
      title: '商品管理',
      icon: 'tab'
    },
    children: [
      {
        path: 'list',
        component: () => import('@/views/goods/list'),
        name: 'goodsList',
        meta: {
          perms: ['GET /admin/goods/list', 'POST /admin/goods/delete'],
          title: '商品列表',
          icon: 'list',
          noCache: true
        }
      },
      {
        path: 'create',
        component: () => import('@/views/goods/create'),
        name: 'goodsCreate',
        meta: {
          perms: ['POST /admin/goods/create'],
          title: '商品上架',
          icon: 'link',
          noCache: true
        }
      },
      {
        path: 'edit',
        component: () => import('@/views/goods/edit'),
        name: 'goodsEdit',
        meta: {
          perms: ['GET /admin/goods/detail', 'POST /admin/goods/update', 'POST /admin/goods/catAndBrand'],
          title: '商品编辑',
          icon: 'form',
          noCache: true
        },
        hidden: true
      },
      {
        path: 'comment',
        component: () => import('@/views/goods/comment'),
        name: 'goodsComment',
        meta: {
          perms: ['GET /admin/comment/list', 'POST /admin/comment/delete'],
          title: '商品评论',
          icon: 'message',
          noCache: true
        }
      }
    ]
  },
  {
    path: '/promotion',
    component: Layout,
    redirect: 'noredirect',
    alwaysShow: true,
    name: 'promotionManage',
    meta: {
      title: '推广管理',
      icon: 'size'
    },
    children: [
      {
        path: 'articleList',
        component: () => import('@/views/promotion/articleList'),
        name: 'articleList',
        meta: {
          perms: ['GET /admin/article/list', 'POST /admin/article/delete'],
          title: '公告列表',
          icon: 'language',
          noCache: true
        }
      },
      {
        path: 'articleCreate',
        component: () => import('@/views/promotion/articleCreate'),
        name: 'articleCreate',
        meta: {
          perms: ['POST /admin/article/create'],
          title: '发布公告',
          icon: 'link',
          noCache: true
        }
      },
      {
        path: 'articleEdit',
        component: () => import('@/views/promotion/articleEdit'),
        name: 'articleEdit',
        meta: {
          perms: ['GET /admin/article/detail', 'POST /admin/article/update'],
          title: '公告通知编辑',
          icon: 'form',
          noCache: true
        },
        hidden: true
      },
      {
        path: 'ad',
        component: () => import('@/views/promotion/ad'),
        name: 'ad',
        meta: {
          perms: ['GET /admin/ad/list', 'POST /admin/ad/create', 'GET /admin/ad/read', 'POST /admin/ad/update', 'POST /admin/ad/delete'],
          title: '广告管理',
          icon: 'clipboard',
          noCache: true
        }
      },
      {
        path: 'coupon',
        component: () => import('@/views/promotion/coupon'),
        name: 'coupon',
        meta: {
          perms: ['GET /admin/coupon/list', 'POST /admin/coupon/create', 'POST /admin/coupon/update', 'POST /admin/coupon/delete'],
          title: '优惠券管理',
          icon: 'money',
          noCache: true
        }
      },
      {
        path: 'couponDetail',
        component: () => import('@/views/promotion/couponDetail'),
        name: 'couponDetail',
        meta: {
          perms: ['GET /admin/coupon/list', 'GET /admin/coupon/listuser'],
          title: '优惠券详情',
          icon: 'tab',
          noCache: true
        },
        hidden: true
      },
      {
        path: 'topic',
        component: () => import('@/views/promotion/topic'),
        name: 'topic',
        meta: {
          perms: ['GET /admin/topic/list', 'POST /admin/topic/create', 'GET /admin/topic/read', 'POST /admin/topic/update', 'POST /admin/topic/delete'],
          title: '专题管理',
          icon: 'icon',
          noCache: true
        }
      },
      {
        path: 'seckillCreate',
        component: () => import('@/views/promotion/seckillCreate'),
        name: 'seckillCreate',
        meta: {
          perms: ['POST /admin/seckill/create'],
          title: '秒杀商品配置',
          icon: 'link',
          noCache: true
        },
        hidden: true
      },
      {
        path: 'seckill',
        component: () => import('@/views/promotion/seckill'),
        name: 'seckill',
        meta: {
          perms: ['GET /admin/seckill/list', 'POST /admin/seckill/create', 'POST /admin/seckill/update', 'POST /admin/seckill/delete', 'POST /admin/seckill/finish'],
          title: '秒杀商品列表',
          icon: 'table',
          noCache: true
        }
      },
      {
        path: 'seckillEdit',
        component: () => import('@/views/promotion/seckillEdit'),
        name: 'seckillEdit',
        meta: {
          perms: ['GET /admin/seckill/read', 'POST /admin/seckill/update'],
          title: '秒杀商品编辑',
          icon: 'form',
          noCache: true
        },
        hidden: true
      },
      {
        path: 'groupon-rule',
        component: () => import('@/views/promotion/grouponRule'),
        name: 'grouponRule',
        meta: {
          perms: ['GET /admin/groupon/list', 'POST /admin/groupon/create', 'POST /admin/groupon/update', 'POST /admin/groupon/delete'],
          title: '团购规则',
          icon: 'table',
          noCache: true
        }
      },
      {
        path: 'groupon-activity',
        component: () => import('@/views/promotion/grouponActivity'),
        name: 'grouponActivity',
        meta: {
          perms: ['GET /admin/groupon/listRecord'],
          title: '团购活动',
          icon: 'theme',
          noCache: true
        }
      }
    ]
  },

  {
    path: '/sys',
    component: Layout,
    redirect: 'noredirect',
    alwaysShow: true,
    name: 'sysManage',
    meta: {
      title: '系统管理',
      icon: 'component'
    },
    children: [
      {
        path: 'admin',
        component: () => import('@/views/sys/admin'),
        name: 'admin',
        meta: {
          perms: ['GET /admin/admin/list', 'POST /admin/admin/create', 'POST /admin/admin/update', 'POST /admin/admin/delete'],
          title: '管理员',
          icon: 'people',
          noCache: true
        }
      },
      {
        path: 'role',
        component: () => import('@/views/sys/role'),
        name: 'role',
        meta: {
          perms: ['GET /admin/role/list', 'POST /admin/role/create', 'POST /admin/role/update', 'POST /admin/role/delete', 'GET /admin/role/permissions', 'POST /admin/role/permissions'],
          title: '角色管理',
          icon: 'qq',
          noCache: true
        }
      },
      {
        path: 'param',
        component: () => import('@/views/sys/param'),
        name: 'param',
        meta: {
          perms: ['GET /admin/param/list', 'POST /admin/param/create', 'POST /admin/param/update', 'POST /admin/param/delete'],
          title: '系统参数管理',
          icon: 'edit',
          noCache: true
        }
      },
      {
        path: 'log',
        component: () => import('@/views/sys/log'),
        name: 'log',
        meta: {
          perms: ['GET /admin/log/list'],
          title: '操作日志',
          icon: 'log',
          noCache: true
        }
      },
      {
        path: 'os',
        component: () => import('@/views/sys/os'),
        name: 'os',
        meta: {
          perms: ['GET /admin/os/list', 'POST /admin/os/create', 'POST /admin/os/update', 'POST /admin/os/delete'],
          title: '对象存储',
          icon: 'lock',
          noCache: true
        }
      },
      {
        path: 'bank',
        component: () => import('@/views/sys/supportBank'),
        name: 'bank',
        meta: {
          perms: ['GET /admin/bank/list', 'POST /admin/bank/create', 'POST /admin/bank/update', 'POST /admin/bank/delete'],
          title: '支付行管理',
          icon: 'bank_card',
          noCache: true
        }
      },
      {
        path: 'merchant',
        component: () => import('@/views/sys/merchantVerify'),
        name: 'merchant',
        meta: {
          perms: ['GET /admin/merchant/list', 'POST /admin/merchant/verify'],
          title: '商户申请审核',
          icon: 'verify',
          noCache: true
        }
      }
    ]
  },

  {
    path: '/stat',
    component: Layout,
    redirect: 'noredirect',
    alwaysShow: true,
    name: 'statManage',
    meta: {
      title: '统计',
      icon: 'chart'
    },
    children: [
      {
        path: 'user',
        component: () => import('@/views/stat/user'),
        name: 'statUser',
        meta: {
          perms: ['GET /admin/stat/user'],
          title: '用户统计',
          icon: 'user',
          noCache: true
        }
      },
      {
        path: 'order',
        component: () => import('@/views/stat/order'),
        name: 'statOrder',
        meta: {
          perms: ['GET /admin/stat/order'],
          title: '订单统计',
          icon: 'shopping',
          noCache: true
        }
      },
      {
        path: 'goods',
        component: () => import('@/views/stat/goods'),
        name: 'statGoods',
        meta: {
          perms: ['GET /admin/stat/goods'],
          title: '商品统计',
          icon: 'table',
          noCache: true
        }
      }
    ]
  },
  {
    path: 'external-link',
    component: Layout,
    redirect: 'noredirect',
    alwaysShow: true,
    name: 'externalLink',
    meta: {
      title: '外链',
      icon: 'link'
    },
    children: [
      {
        path: 'https://cloud.tencent.com/product/cos',
        meta: {
          title: '腾讯云存储',
          icon: 'link',
          perms: ['POST /admin/role/permissions']
        }
      },
      {
        path: 'https://cloud.tencent.com/product/sms',
        meta: {
          title: '腾讯云短信',
          icon: 'link',
          perms: ['POST /admin/role/permissions']
        }
      },
      {
        path: 'https://pay.weixin.qq.com/index.php/core/home/login',
        meta: {
          title: '微信支付',
          icon: 'link',
          perms: ['POST /admin/role/permissions']
        }
      },
      {
        path: 'https://mpkf.weixin.qq.com/',
        meta: {
          title: '小程序客服',
          icon: 'link',
          perms: ['POST /admin/role/permissions']
        }
      },
      {
        path: 'https://www.alibabacloud.com/zh/product/oss',
        meta: {
          title: '阿里云存储',
          icon: 'link',
          perms: ['POST /admin/role/permissions']
        }
      },
      {
        path: 'https://www.qiniu.com/products/kodo',
        meta: {
          title: '七牛云存储',
          icon: 'link',
          perms: ['POST /admin/role/permissions']
        }
      },
      {
        path: 'http://www.kdniao.com/api-track',
        meta: {
          title: '快递鸟',
          icon: 'link',
          perms: ['POST /admin/role/permissions']
        }
      }
    ]
  },
  {
    path: '/profile',
    component: Layout,
    redirect: 'noredirect',
    alwaysShow: true,
    children: [
      {
        path: 'password',
        component: () => import('@/views/profile/password'),
        name: 'password',
        meta: { title: '修改密码', noCache: true }
      }
    ],
    hidden: true
  },

  { path: '*', redirect: '/404', hidden: true }
]