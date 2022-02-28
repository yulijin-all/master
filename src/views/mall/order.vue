<template>
  <div class="app-container">

    <!-- 查询和其他操作 -->
    <div class="filter-container">
      <el-input v-model="listQuery.userId" clearable size="mini" class="filter-item" style="width: 200px;" placeholder="请输入用户ID"/>
      <el-input v-model="listQuery.orderSn" clearable size="mini" class="filter-item" style="width: 200px;" placeholder="请输入订单编号"/>
      <el-input v-model="listQuery.fetchCode" clearable size="mini" class="filter-item" style="width: 200px;" placeholder="请输入提货码"/>
      <el-select v-model="listQuery.orderStatusArray" multiple size="mini" style="width: 200px" class="filter-item" placeholder="请选择订单状态">
        <el-option v-for="(key, value) in statusMap" :key="key" :label="key" :value="value"/>
      </el-select>
      <el-button v-permission="['GET /admin/order/list']" size="mini" class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">查找</el-button>
      <el-button :loading="downloadLoading" size="mini" class="filter-item" type="warning" icon="el-icon-download" @click="handleDownload">导出</el-button>
    </div>

    <!-- 查询结果 -->
    <el-table v-loading="listLoading" :data="list" size="small" element-loading-text="正在查询中。。。" border fit highlight-current-row>

      <el-table-column align="center" min-width="100" label="订单编号" prop="orderSn" sortable/>

      <el-table-column align="center" min-width="100px" label="用户ID" prop="userId"/>

      <el-table-column align="center" min-width="80px" label="订单状态" prop="orderStatus">
        <template slot-scope="scope">
          <el-tag>{{ scope.row.orderStatus | orderStatusFilter }}</el-tag>
        </template>
      </el-table-column>

      <el-table-column align="center" min-width="90px" label="订单金额" prop="orderPrice"/>

      <el-table-column align="center" min-width="90px" label="支付金额" prop="actualPrice"/>

      <el-table-column align="center" min-width="120px" label="支付时间" prop="payTime"/>

      <el-table-column align="center" min-width="110px" label="物流单号" prop="shipSn"/>

      <el-table-column align="center" min-width="80px" label="物流渠道" prop="shipChannel"/>

      <el-table-column align="center" label="操作" min-width="200px" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button v-permission="['GET /admin/order/detail']" type="primary" size="mini" @click="handleDetail(scope.row)">详情</el-button>
          <el-button v-permission="['POST /admin/order/ship']" v-if="scope.row.orderStatus==201 && scope.row.freightType == 0" type="primary" size="mini" @click="handleShip(scope.row)">发货</el-button>
          <el-button v-permission="['POST /admin/order/confirm']" v-if="(scope.row.orderStatus==201 || scope.row.orderStatus==205) && scope.row.freightType == 1 && scope.row.fetchCode != '' && scope.row.fetchCode != null" type="primary" size="mini" @click="handleConfirm(scope.row)">提货</el-button>
          <el-button v-permission="['POST /admin/order/refund']" v-if="scope.row.hasRefund" type="warning" size="mini" @click="handleRefund(scope.row.id)">{{ (scope.row.orderStatus==201 && scope.row.freightType == 0) ? '退款' : '退货' }}</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <!-- 订单详情对话框 -->
    <el-dialog id="pdfDom" :visible.sync="orderDialogVisible" title="订单详情" width="800">
      <el-form :data="orderDetail" label-position="left">
        <el-form-item label="订单编号">
          <span>{{ orderDetail.order.orderSn }}</span>
        </el-form-item>
        <el-form-item label="订单状态">
          <template slot-scope="scope">
            <el-tag>{{ orderDetail.order.orderStatus | orderStatusFilter }}</el-tag>
            <el-tag v-if="orderDetail.order.fetchCode != null && orderDetail.order.fetchCode != ''">提货码：{{ orderDetail.order.fetchCode }} </el-tag>
          </template>
        </el-form-item>
        <el-form-item label="订单用户">
          <span>{{ orderDetail.user.nickname }}</span>
        </el-form-item>
        <el-form-item label="用户留言">
          <span>{{ orderDetail.order.message }}</span>
        </el-form-item>
        <el-form-item label="收货信息">
          <span>（收货人）{{ orderDetail.order.consignee }}</span>
          <span>（手机号）{{ orderDetail.order.mobile }}</span>
          <span>（地址）{{ orderDetail.order.address }}</span>
        </el-form-item>
        <el-form-item label="商品信息">
          <el-table :data="orderDetail.orderGoods" :row-style="isRefundGoods" size="small" border fit highlight-current-row>
            <el-table-column align="center" min-width="150px" label="商品名称" prop="goodsName" />
            <el-table-column align="center" min-width="80px" label="商品编号" prop="goodsSn" />
            <el-table-column align="center" min-width="65px" label="货品规格" prop="specifications" />
            <el-table-column align="center" min-width="50px" label="价格" prop="price" />
            <el-table-column align="center" min-width="50px" label="数量" prop="number" />
            <el-table-column align="center" min-width="55px" label="状态" prop="refundId" >
              <template slot-scope="scope">
                <el-tag>{{ scope.row.refundId ? '退货' : '正常' }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column align="center" min-width="50px" label="图片" prop="picUrl">
              <template slot-scope="scope">
                <img :src="scope.row.picUrl" width="40">
              </template>
            </el-table-column>
          </el-table>
        </el-form-item>
        <el-form-item label="费用信息">
          <span>
            (实际费用){{ orderDetail.order.actualPrice }}元 =
            (商品总价){{ orderDetail.order.goodsPrice }}元 +
            (快递费用){{ orderDetail.order.freightPrice }}元 -
            (优惠减免){{ orderDetail.order.couponPrice }}元 -
            (积分减免){{ orderDetail.order.integralPrice }}元
          </span>
        </el-form-item>
        <el-form-item label="支付信息">
          <span>（支付渠道）微信支付</span>
          <span>（支付时间）{{ orderDetail.order.payTime }}</span>
        </el-form-item>
        <el-form-item label="快递信息">
          <span>（快递公司）{{ orderDetail.order.shipChannel }}</span>
          <span>（快递单号）{{ orderDetail.order.shipSn }}</span>
          <span>（发货时间）{{ orderDetail.order.shipTime }}</span>
        </el-form-item>
        <el-form-item label="收货信息">
          <span>（确认收货时间）{{ orderDetail.order.confirmTime }}</span>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="printOrder(orderDetail)">打印</el-button>
        <el-button type="primary" @click="orderDialogVisible = false">关闭</el-button>
      </div>
    </el-dialog>

    <!-- 发货对话框 -->
    <el-dialog :visible.sync="shipDialogVisible" title="发货">
      <el-form ref="shipForm" :model="shipForm" status-icon label-position="left" label-width="100px" style="width: 400px; margin-left:50px;">
        <el-form-item label="快递公司" prop="shipChannel">
          <el-select v-model="shipForm.shipChannel">
            <el-option v-for="item in shipChannelList" :key="item.value" :label="item.label" :value="item.value"/>
          </el-select>
        </el-form-item>
        <el-form-item label="快递编号" prop="shipSn">
          <el-input v-model="shipForm.shipSn"/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="shipDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmShip">确定</el-button>
      </div>
    </el-dialog>

    <!-- 退款子订单详情对话框 -->
    <el-dialog :visible.sync="refundDialogVisible" title="退款(货)处理" width="800">
      <el-form :data="orderRefundDetail" label-position="left" label-width="100px">
        <el-form-item label="订单编号">
          <span>{{ orderRefundDetail.order.orderSn }}</span>
        </el-form-item>
        <el-form-item label="收货信息">
          <span>（收货人）{{ orderRefundDetail.order.consignee }}</span>
          <span>（手机号）{{ orderRefundDetail.order.mobile }}</span>
          <span> {{ orderRefundDetail.order.address }}</span>
        </el-form-item>

        <el-card v-for="(item,index) in orderRefundDetail.refundOrderList" :key="index" class="box-card">
          <div slot="header" class="clearfix">
            <span>退货单 {{ item.refundTrace.refundSn }}</span>
            <el-button style="float: right;padding: 3px 0px;color: red;font-size: large;" type="text">{{ item.refundTrace.status == 0 ? '待审批': item.refundTrace.status == 2 ? '审批拒绝':'审批通过' }}</el-button>
          </div>
          <el-form-item label="申请时间">
            <span>{{ item.refundTrace.addTime }}</span>
          </el-form-item>
          <el-form-item label="申请退款金额">
            <span>{{ item.refundTrace.refundApplyAmount }}</span>
          </el-form-item>
          <div>
            <el-table :data="item.refundGoods" size="small" border fit highlight-current-row>
              <el-table-column align="center" min-width="150px" label="商品名称" prop="goodsName" />
              <el-table-column align="center" min-width="65px" label="货品规格" prop="specifications" />
              <el-table-column align="center" min-width="50px" label="价格" prop="price" />
              <el-table-column align="center" min-width="50px" label="数量" prop="number" />
              <el-table-column align="center" min-width="55px" label="状态" prop="refundId" >
                <template slot-scope="scope">
                  <el-tag>{{ scope.row.refundId ? '退货' : '正常' }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column align="center" min-width="50px" label="图片" prop="picUrl">
                <template slot-scope="scope">
                  <img :src="scope.row.picUrl" width="40">
                </template>
              </el-table-column>
            </el-table>
          </div>
          <el-form-item label="退款原因">
            <span>{{ item.refundTrace.refundReason }}</span>
          </el-form-item>
          <el-form-item label="补充物流信息">
            <span>{{ item.refundTrace.freightMsg }}</span>
          </el-form-item>
          <el-form-item label="退款审批金额" prop="refundAmount">
            <el-input v-model="item.refundTrace.refundAmount" onkeyup="this.value=this.value.replace(/[^\d.]/g,'');" placeholder="0.00">
              <template slot="append">元</template>
            </el-input>
          </el-form-item>
          <el-form-item label="审批信息" prop="approveMsg">
            <el-input v-model="item.refundTrace.approveMsg" placeholder="请输入审批信息..."/>
          </el-form-item>
          <el-row type="flex" align="bottom" justify="center">
            <el-button v-if="item.refundTrace.status != 1 && item.refundTrace.status != 3" type="primary" @click="confirmRefund(3,item.refundTrace)">审批通过</el-button>
            <el-button v-if="item.refundTrace.status == 0" type="warning" @click="confirmRefund(2,item.refundTrace)">审批拒绝</el-button>
          </el-row>
        </el-card>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="refundDialogVisible = false">关闭</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<style>
.box-card {
  margin: 30px 0px;
}
.box-card .el-form-item {
  margin-bottom: 5px;
}
</style>

<script>
import { listOrder, shipOrder, refundOrder, detailOrder, listShipChannel, confirmOrder, detailRefundOrder } from '@/api/business/order'
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination
import checkPermission from '@/utils/permission' // 权限判断函数

const statusMap = {
  101: '未付款',
  102: '用户取消',
  103: '系统取消',
  201: '已付款',
  204: '团购中',
  202: '申请退款',
  203: '已退款',
  301: '已发货',
  401: '用户收货',
  402: '系统收货'
}

export default {
  name: 'Order',
  components: { Pagination },
  filters: {
    orderStatusFilter(status) {
      return statusMap[status]
    }
  },
  data() {
    return {
      list: undefined,
      total: 0,
      listLoading: true,
      shipChannelList: [],
      listQuery: {
        page: 1,
        limit: 20,
        id: undefined,
        name: undefined,
        orderStatusArray: [],
        sort: 'add_time',
        order: 'desc'
      },
      statusMap,
      orderDialogVisible: false,
      orderDetail: {
        order: {},
        user: {},
        orderGoods: []
      },
      shipForm: {
        orderId: undefined,
        shipChannel: undefined,
        shipSn: undefined
      },
      shipDialogVisible: false,
      refundForm: {
        orderId: undefined,
        refundMoney: undefined
      },
      orderRefundDetail: {
        order: {},
        user: {},
        refundOrderList: []
      },
      refundDialogVisible: false,
      downloadLoading: false
    }
  },
  created() {
    this.getList()
    this.getListShipChannel()
  },
  methods: {
    checkPermission,
    getList() {
      this.listLoading = true
      listOrder(this.listQuery).then(response => {
        this.list = response.data.data.items
        this.total = response.data.data.total
        this.listLoading = false
      }).catch(() => {
        this.list = []
        this.total = 0
        this.listLoading = false
      })
    },
    getListShipChannel() {
      listShipChannel().then(response => {
        this.shipChannelList = response.data.data.shipChannelList
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    handleDetail(row) {
      detailOrder(row.id).then(response => {
        this.orderDetail = response.data.data
      })
      this.orderDialogVisible = true
    },
    handleShip(row) {
      this.shipForm.orderId = row.id
      this.shipForm.shipChannel = row.shipChannel
      this.shipForm.shipSn = row.shipSn

      this.shipDialogVisible = true
      this.$nextTick(() => {
        this.$refs['shipForm'].clearValidate()
      })
    },
    handleConfirm(row) {
      this.$confirm('您确定用户已经提货？').then(() => {
        console.log('yes')
        confirmOrder({ orderId: row.id }).then(response => {
          this.$notify.success({
            title: '成功',
            message: '操作成功'
          })
          this.getList()
        }).catch(response => {
          this.$notify.error({
            title: '失败',
            message: response.data.errmsg
          })
        })
      }).catch(() => {
        console.log('cancel')
      })
    },
    confirmShip() {
      this.$refs['shipForm'].validate((valid) => {
        if (valid) {
          shipOrder(this.shipForm).then(response => {
            this.shipDialogVisible = false
            this.$notify.success({
              title: '成功',
              message: '确认发货成功'
            })
            this.getList()
          }).catch(response => {
            this.$notify.error({
              title: '失败',
              message: response.data.errmsg
            })
          })
        }
      })
    },
    handleRefund(orderId) {
      detailRefundOrder(orderId).then(response => {
        this.orderRefundDetail = response.data.data
        for (var i = 0; i < this.orderRefundDetail.refundOrderList.length; i++) {
          this.orderRefundDetail.refundOrderList[i].refundTrace.refundAmount = this.orderRefundDetail.refundOrderList[i].refundTrace.refundAmount ? this.orderRefundDetail.refundOrderList[i].refundTrace.refundAmount : this.orderRefundDetail.refundOrderList[i].refundTrace.refundApplyAmount
        }
      })
      this.refundDialogVisible = true
    },
    isRefundGoods({ row, column, rowIndex, columnIndex }) {
      if (row.refundId != null) {
        return {
          backgroundColor: '#ffc8c8'
        }
      }
    },
    confirmRefund(approveStatus, refundTrace) {
      refundTrace.approveStatus = approveStatus
      if (refundTrace.refundAmount == null || refundTrace.refundAmount <= 0.01) {
        this.$notify.error({
          title: '温馨提示',
          message: '请输入退款审批金额'
        })
        return
      }
      if (refundTrace.refundAmount > refundTrace.refundApplyAmount) {
        this.$notify.error({
          title: '温馨提示',
          message: '请输入审批金额不能大于申请金额'
        })
        return
      }
      if (refundTrace.approveMsg == null || refundTrace.approveMsg === '') {
        if (approveStatus === 3) {
          refundTrace.approveMsg = '审批通过'
        } else {
          this.$notify.error({
            title: '温馨提示',
            message: '请输入审批信息内容'
          })
          return
        }
      }
      refundOrder(refundTrace).then(response => {
        this.$notify.success({
          title: '操作提示',
          message: refundTrace.approveStatus === 3 ? '已审批通过' : '已审批拒绝'
        })
        this.handleRefund(refundTrace.orderId)
      }).catch(response => {
        this.$notify.error({
          title: '失败',
          message: response.data.errmsg
        })
      })
    },
    printOrder(orderDetail) {
      // 获取要打印的Dom内容
      let printHtml = '<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0"/><title>小票打印</title><style type="text/css">        *{padding:0;margin: 0;}        h1{font-size: 20px;}        h3{font-size: 16px;}        .left{            float: left;        }        .right{            float:right;        }        .clearfix{            clear: both;        }        ul{list-style: none;}        .print_container{            padding: 10px;            width: 300px;        }        .section1{        }        .section2 label{            display: block;        }        .section3 label{            display: block;        }        .section4{        }        .section4 .total label{            display: block;        }        .section4 .other_fee{            border-bottom: 1px solid #DADADA;        }        .section5 label{            display: block;        }</style></head><body style="background-color:#fff;"><div class="print_container"><h1>销售发货单</h1><span>*****************************************</span><div class="section2"><label>订单编号：{{orderSn}}</label><label>下单时间：{{payTime}}</label><label>配送方式：{{freightType}}</label></div><span>*****************************************</span><div class="section4"><div style="border-bottom: 1px solid #DADADA;"><table style="width: 100%;"><thead><tr><td width="70%">商品名称</td><td width="13%" style="text-align:center;">数量</td><td width="17%" style="text-align:right;">金额</td></tr></thead><tbody>{{goodsHtml}}</tbody></table></div><div class="other_fee"><div class="canh"><label class="left">商品总价</label><label class="right">{{goodsPrice}}</label><div class="clearfix"></div></div><div class="peis"><label class="left">配送费</label><label class="right">{{freightPrice}}</label><div class="clearfix"></div></div><div class="manj"><label class="left">立减优惠</label><label class="right">{{couponPrice}}</label><div class="clearfix"></div></div></div><div class="total"><label class="left">总计</label><label class="right">{{actualPrice}}</label><div class="clearfix"></div></div>{{payHtml}}<span>*****************************************</span></div><div class="section3"><div class="total"><label class="left">收货人：</label><label class="right">{{consignee}}</label><div class="clearfix"></div></div><div class="total"><label class="left">电话：</label><label class="right">{{mobile}}</label><div class="clearfix"></div></div><label>{{address}}</label></div><span>*****************************************</span><div class="section2"><label>【用户留言】<span style="font-size: 16px;">{{message}}</span></label></div></div></body></html>'
      const orderSn = orderDetail.order.orderSn
      printHtml = printHtml.replace('{{orderSn}}', orderSn)
      const payTime = orderDetail.order.payTime == null ? '' : orderDetail.order.payTime
      printHtml = printHtml.replace('{{payTime}}', payTime)
      const freightType = orderDetail.order.freightType === 1 ? '自提' : '快递'
      printHtml = printHtml.replace('{{freightType}}', freightType)
      let goodsHtml = ''
      for (var i = 0; i < orderDetail.orderGoods.length; i++) {
        const preS = orderDetail.orderGoods[i].refundId != null ? '<s>' : ''
        const endS = orderDetail.orderGoods[i].refundId != null ? '【已退货】</s>' : ''
        goodsHtml = goodsHtml + '<tr><td style="font-size: 14px;">' + preS + orderDetail.orderGoods[i].goodsName
        goodsHtml = goodsHtml + '【' + orderDetail.orderGoods[i].specifications + '】' + endS
        goodsHtml = goodsHtml + '</td><td style="text-align:center;">' + orderDetail.orderGoods[i].number + '</td><td style="text-align:right;">' + orderDetail.orderGoods[i].price + '</td></tr>'
      }
      printHtml = printHtml.replace('{{goodsHtml}}', goodsHtml)
      const goodsPrice = orderDetail.order.goodsPrice
      printHtml = printHtml.replace('{{goodsPrice}}', goodsPrice)
      const freightPrice = orderDetail.order.freightPrice
      printHtml = printHtml.replace('{{freightPrice}}', freightPrice)
      const couponPrice = orderDetail.order.couponPrice
      printHtml = printHtml.replace('{{couponPrice}}', couponPrice)
      const actualPrice = orderDetail.order.actualPrice
      printHtml = printHtml.replace('{{actualPrice}}', actualPrice)
      const payHtml = orderDetail.order.payTime == null ? '' : '<div style="text-align: right;"><label>顾客已付款</label></div>'
      printHtml = printHtml.replace('{{payHtml}}', payHtml)
      const consignee = orderDetail.order.consignee
      printHtml = printHtml.replace('{{consignee}}', consignee)
      const mobile = orderDetail.order.mobile
      printHtml = printHtml.replace('{{mobile}}', mobile)
      const address = orderDetail.order.address
      printHtml = printHtml.replace('{{address}}', address)
      const message = orderDetail.order.message
      printHtml = printHtml.replace('{{message}}', message)
      var printWin = window.open('', 'printWin', 'height=800, width=1000, top=50, left=50, toolbar=no, menubar=no, scrollbars=no, resizable=no,location=no, status=no')
      // const newDomHtml = window.document.getElementById('pdfDom').innerHTML
      printWin.window.document.body.innerHTML = printHtml
      printWin.print()
      return false
    },
    handleDownload() {
      this.downloadLoading = true
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = ['订单ID', '订单编号', '用户ID', '订单状态', '是否删除', '收货人', '收货联系电话', '收货地址']
        const filterVal = ['id', 'orderSn', 'userId', 'orderStatus', 'isDelete', 'consignee', 'mobile', 'address']
        excel.export_json_to_excel2(tHeader, this.list, filterVal, '订单信息')
        this.downloadLoading = false
      })
    }
  }
}
</script>
