<template>
  <div class="app-container">

    <!-- 查询和其他操作 -->
    <div class="filter-container">
      <el-input v-model="listQuery.username" clearable size="mini" class="filter-item" style="width: 200px;" placeholder="请输入操作人"/>
      <el-input v-model="listQuery.methodDesc" clearable size="mini" class="filter-item" style="width: 200px;" placeholder="请输入操作接口"/>
      <el-button v-permission="['GET /admin/log/list']" size="mini" class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">查找</el-button>
    </div>

    <!-- 查询结果 -->
    <el-table v-loading="listLoading" :data="list" size="small" element-loading-text="正在查询中。。。" border fit highlight-current-row>
      <el-table-column align="center" min-width="100px" label="请求来源IP" prop="sourceIp"/>
      <el-table-column :show-overflow-tooltip="true" align="center" min-width="180px" label="请求ULR" prop="requestUrl"/>
      <el-table-column align="center" min-width="50px" label="请求类型" prop="requestMethod"/>
      <el-table-column align="center" min-width="80px" label="操作管理员" prop="username"/>
      <el-table-column :show-overflow-tooltip="true" align="center" min-width="180px" label="接口描述" prop="methodDesc"/>
      <el-table-column :show-overflow-tooltip="true" align="center" min-width="260px" label="类.方法" prop="classMethod"/>
      <el-table-column :show-overflow-tooltip="true" align="center" min-width="260px" label="请求报文" prop="requestBody"/>
      <el-table-column :show-overflow-tooltip="true" align="center" min-width="260px" label="返回报文" prop="responseBody"/>
      <!--      <el-table-column align="center" min-width="60px" label="耗时" prop="spendTime"/>-->
      <el-table-column align="center" min-width="120px" label="创建时间" prop="addTime"/>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

  </div>
</template>
<style>
  .el-tooltip__popper {
    max-width: 600px;
    word-wrap: break-word;
    word-break: break-all;
    background:#006633 !important;
    color:#CCFFFF !important;
  }
</style>
<script>
import { listLog } from '@/api/business/log'
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination

export default {
  name: 'Log',
  components: { Pagination },
  data() {
    return {
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        username: undefined,
        methodDesc: undefined,
        sort: 'id',
        order: 'asc'
      },
      dialogFormVisible: false,
      dialogStatus: ''
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      listLog(this.listQuery).then(response => {
        this.list = response.data.data.items
        this.total = response.data.data.total
        this.listLoading = false
      }).catch(() => {
        this.list = []
        this.total = 0
        this.listLoading = false
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    }
  }
}
</script>
