<template>
  <div class="app-container">
    <!-- 查询和其他操作 -->
    <div class="filter-container">
      <el-input
        v-model="listQuery.goodsId"
        clearable
        size="mini"
        class="filter-item"
        style="width: 200px"
        placeholder="请输入商品编号" />
      <el-button
        v-permission="['GET /admin/seckill/list']"
        size="mini"
        class="filter-item"
        type="primary"
        icon="el-icon-search"
        @click="handleFilter">查找</el-button>
      <el-button
        v-permission="['POST /admin/seckill/create']"
        size="mini"
        class="filter-item"
        type="primary"
        icon="el-icon-edit"
        @click="handleCreate">添加</el-button>
      <el-button
        :loading="downloadLoading"
        size="mini"
        class="filter-item"
        type="warning"
        icon="el-icon-download"
        @click="handleDownload">导出
      </el-button>
    </div>

    <!-- 查询结果 -->
    <el-table
      v-loading="listLoading"
      :data="list"
      size="small"
      element-loading-text="正在查询中。。。"
      border
      fit
      highlight-current-row>
      <el-table-column
        align="center"
        min-width="60px"
        label="商品ID"
        prop="goodsId" />

      <el-table-column
        align="center"
        min-width="200"
        label="名称"
        prop="goodsName" />

      <el-table-column
        align="center"
        property="picUrl"
        label="图片">
        <template slot-scope="scope">
          <img
            :src="scope.row.picUrl"
            width="40" >
        </template>
      </el-table-column>

      <el-table-column
        align="center"
        min-width="80px"
        label="秒杀批次"
        prop="time" />

      <el-table-column
        align="center"
        min-width="60px"
        label="总数"
        prop="totalNumber"/>

      <el-table-column
        align="center"
        min-width="60px"
        label="剩余数"
        prop="leftNumber"
      />

      <el-table-column
        align="center"
        min-width="80px"
        label="是否结束"
        prop="finishTime">
        <template slot-scope="scope">
          <el-tag :type="scope.row.finishTime == null ? 'success' : 'danger' ">{{ scope.row.finishTime == null ? '否' : '结束' }}</el-tag>
        </template>
      </el-table-column>

      <el-table-column
        align="center"
        min-width="80px"
        label="开始时间"
        prop="startDay" />

      <el-table-column
        align="center"
        min-width="80px"
        label="结束时间"
        prop="endDay" />

      <el-table-column
        align="left"
        min-width="200px"
        label="操作"
        class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            v-permission="['POST /admin/seckill/update']"
            v-if="scope.row.finishTime==null"
            type="primary"
            size="mini"
            @click="handleUpdate(scope.row)">编辑</el-button>
          <el-button
            v-permission="['POST /admin/seckill/update']"
            v-if="scope.row.finishTime==null"
            type="primary"
            size="mini"
            @click="handleFinishGood(scope.row)">结束</el-button>
          <el-button
            v-permission="['POST /admin/seckill/delete']"
            type="danger"
            size="mini"
            @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加或修改对话框 -->
    <el-dialog
      :title="textMap[dialogStatus]"
      :visible.sync="dialogFormVisible">
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="dataForm"
        status-icon
        label-position="left"
        label-width="250px"
        style="width: 1000px; margin-left: 50px">
        <el-form-item
          label="商品"
          prop="goodsId">
          <el-select
            v-el-select-loadmore="loadmore"
            v-model="dataForm.goodsId"
            filterable
            placeholder="请选择商品">
            <el-option
              v-for="item in options"
              :key="item.name"
              :label="item.name"
              :value="item.id">
              <span>{{ item.name }}</span>
              <img
                :src="item.picUrl"
                style="height:32px;float: right" >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          label="秒杀金额"
          prop="price">
          <el-input
            v-model="dataForm.price"
            placeholder="请输入秒杀金额" />
        </el-form-item>
        <el-form-item
          label="秒杀数量"
          prop="discountMember">
          <el-input
            v-model="dataForm.discountMember"
            placeholder="请输入秒杀数量" />
        </el-form-item>
        <el-form-item
          label="秒杀进行日期"
          prop="startTime">
          <el-date-picker
            v-model="dataForm.startTime"
            type="datetime"
            placeholder="选择日期"
            value-format="yyyy-MM-dd HH:mm:ss" />
        </el-form-item>
        <el-form-item
          label="秒杀批次"
          prop="configId">
          <el-select
            v-model="dataForm.configId"
            placeholder="请选择批次"
            @change="handleChange">
            <el-option
              v-for="item in batchList"
              :key="item.time"
              :label="item.time"
              :value="item.id" />
          </el-select>
        </el-form-item>
      </el-form>
      <div
        slot="footer"
        class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button
          v-if="dialogStatus == 'create'"
          type="primary"
          @click="createData">确定</el-button>
        <el-button
          v-else
          type="primary"
          @click="updateData">确定</el-button>
      </div>
    </el-dialog>

    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="listQuery.page"
      :limit.sync="listQuery.limit"
      @pagination="getList" />

    <el-tooltip
      placement="top"
      content="返回顶部">
      <back-to-top :visibility-height="100" />
    </el-tooltip>
  </div>
</template>

<script>
import {
  listSeckill,
  publishSeckill,
  deleteSeckill,
  updateSeckill,
  getBatchConfig,
  listGoods,
  finishSeckill
} from '@/api/business/seckill'
import BackToTop from '@/components/BackToTop'
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination
import { isInteger, notIntOrDecimal } from '@/utils/validate'
import { MessageBox } from 'element-ui'
export default {
  name: 'GrouponRule',
  components: { BackToTop, Pagination },
  directives: {
    'el-select-loadmore': {
      bind(el, binding) {
        // 获取element-ui定义好的scroll盒子
        const SELECTWRAP_DOM = el.querySelector(
          '.el-select-dropdown .el-select-dropdown__wrap'
        )
        SELECTWRAP_DOM.addEventListener('scroll', function() {
          const condition =
            this.scrollHeight - this.scrollTop <= this.clientHeight
          if (condition) {
            binding.value()
          }
        })
      }
    }
  },
  data() {
    return {
      pickerOptions0: {
        disabledDate(time) {
          return time.getTime() < Date.now() - 8.64e7
        }
      },
      batchList: [],
      total: 0,
      list: [],
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        goodsId: undefined,
        sort: 'add_time',
        order: 'desc'
      },
      downloadLoading: false,
      dataForm: {
        id: undefined,
        goodsId: '',
        price: '',
        discountMember: '',
        startTime: undefined,
        endTime: undefined,
        addTime: undefined,
        updateTime: undefined,
        configId: '',
        configTime: ''
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑',
        create: '创建'
      },
      rules: {
        goodsId: [{ required: true, message: '商品不能为空', trigger: 'blur' }],
        price: [
          { required: true, message: '秒杀金额不能为空', trigger: 'blur' },
          { validator: notIntOrDecimal, trigger: 'blur' }
        ],
        discountMember: [
          { required: true, message: '秒杀货品数不能为空', trigger: 'blur' },
          { validator: isInteger, trigger: 'blur' }
        ],
        startTime: [
          { required: true, message: '开始时间不能为空', trigger: 'blur' }
        ],
        configId: [
          { required: true, message: '秒杀批次不能为空', trigger: 'blur' }
        ]
      },
      value: '',
      options: [],
      formData: {
        pageIndex: 1,
        pageSize: 20
      }
    }
  },
  created() {
    this.getList()
    this.init()
  },
  mounted() {
    this.getGoodList(this.formData)
  },
  methods: {
    handleChange(val) {
      var obj = {}
      obj = this.batchList.find(function(item) {
        return item.id === val
      })
      // obj 就是被选中的那个对象，也就能拿到label值了。
      console.log(obj.time) // label值
      this.dataForm.configTime = obj.time
      console.log(val) // value值
    },
    init() {
      getBatchConfig().then(response => {
        this.batchList = response.data.data.batchList
      })
    },
    getList() {
      this.listLoading = true
      listSeckill(this.listQuery)
        .then(response => {
          this.list = response.data.data.items
          this.total = response.data.data.total
          this.listLoading = false
        })
        .catch(() => {
          this.list = []
          this.total = 0
          this.listLoading = false
        })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    resetForm() {
      this.dataForm = {
        id: undefined,
        goodsId: '',
        price: '',
        discountMember: '',
        startTime: undefined,
        endTime: undefined,
        addTime: undefined,
        updateTime: undefined,
        configId: ''
      }
    },
    handleCreate() {
      this.$router.push({ path: '/promotion/seckillCreate' })
    },
    createData() {
      this.$refs['dataForm'].validate(valid => {
        if (valid) {
          publishSeckill(this.dataForm)
            .then(response => {
              this.list.unshift(response.data.data)
              this.dialogFormVisible = false
              this.$notify.success({
                title: '成功',
                message: '创建秒杀规则成功'
              })
            })
            .catch(response => {
              this.$notify.error({
                title: '失败',
                message: response.data.errmsg
              })
            })
        }
      })
    },
    handleUpdate(row) {
      this.$router.push({ path: '/promotion/seckillEdit', query: { id: row.id }})
    },
    handleFinishGood(row) {
      this.dataForm = Object.assign({}, row)
      this.$confirm('该货品秒杀活动将结束, 是否继续?', '注意', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        for (const v of this.list) {
          row.leftNumber = 0
          this.dataForm = Object.assign({}, row)
          if (v.id === this.dataForm.id) {
            const index = this.list.indexOf(v)
            this.list.splice(index, 1, this.dataForm)
            break
          }
        }
        const finalGoods = {
          id: this.dataForm.id,
          goodsId: this.dataForm.goodsId
        }
        finishSeckill(finalGoods)
          .then(response => {
            this.$message({
              type: 'success',
              message: '结束成功!'
            })
            this.getList()
          })
          .catch(response => {
            MessageBox.alert('业务错误：' + response.data.errmsg, '警告', {
              confirmButtonText: '确定',
              type: 'error'
            })
          })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消结束'
        })
      })
    },
    updateData() {
      this.$refs['dataForm'].validate(valid => {
        if (valid) {
          updateSeckill(this.dataForm)
            .then(() => {
              for (const v of this.list) {
                if (v.id === this.dataForm.id) {
                  const index = this.list.indexOf(v)
                  this.list.splice(index, 1, this.dataForm)
                  break
                }
              }
              this.dialogFormVisible = false
              this.$notify.success({
                title: '成功',
                message: '更新秒杀规则成功'
              })
            })
            .catch(response => {
              this.$notify.error({
                title: '失败',
                message: response.data.errmsg
              })
            })
        }
      })
    },
    handleDelete(row) {
      deleteSeckill(row)
        .then(response => {
          this.$notify.success({
            title: '成功',
            message: '删除秒杀规则成功'
          })
          const index = this.list.indexOf(row)
          this.list.splice(index, 1)
        })
        .catch(response => {
          this.$notify.error({
            title: '失败',
            message: response.data.errmsg
          })
        })
    },
    handleDownload() {
      this.downloadLoading = true
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = [
          '商品ID',
          '名称',
          '首页主图',
          '折扣',
          '人数要求',
          '活动开始时间',
          '活动结束时间'
        ]
        const filterVal = [
          'id',
          'name',
          'pic_url',
          'discount',
          'discountMember',
          'addTime',
          'expireTime'
        ]
        excel.export_json_to_excel2(tHeader, this.list, filterVal, '商品信息')
        this.downloadLoading = false
      })
    },
    loadmore() {
      this.formData.pageIndex++
      this.getGoodList(this.formData)
    },
    getGoodList(formData) {
      this.listLoading = true
      listGoods(formData)
        .then(response => {
          const _res = response.data.data.items
          this.options = [...this.options, ..._res]
          this.listLoading = false
        })
        .catch(() => {
          this.total = 0
          this.listLoading = false
        })
      // 这里是接口请求数据, 带分页条件
    }
  }
}
</script>
