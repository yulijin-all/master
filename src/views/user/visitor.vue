<template>
  <!-- 访客管理 -->
  <div class="app-container">
    <!-- 查询和其他操作 -->
    <div class="filter-container">
      <el-input v-model="listQuery.username" clearable size="small" class="filter-item" style="width: 200px;" placeholder="请输入用户名"/>
      <el-input v-model="listQuery.mobile" clearable size="small" class="filter-item" style="width: 200px;" placeholder="请输入手机号"/>
      <el-button class="filter-item" type="primary" size="mini" icon="el-icon-search" @click="handleFilter">查找</el-button>
      <el-button :loading="downloadLoading" size="mini" class="filter-item" type="warning" icon="el-icon-download" @click="handleDownload">导出</el-button>
      <el-tooltip class="item" effect="light" content="刷新" placement="top">
        <el-button class="filter-item filter-item-refresh" icon="el-icon-refresh" size="mini" circle @click="initgetList"/>
      </el-tooltip>
    </div>

    <!-- 查询结果 -->
    <el-table v-loading="listLoading" :data="list" size="small" element-loading-text="正在查询中..." border fit highlight-current-row>
      <el-table-column align="center" width="100px" label="用户ID" prop="id" sortable/>

      <el-table-column align="center" label="用户名" prop="nickname"/>

      <el-table-column align="center" label="手机号码" prop="mobile"/>

      <el-table-column align="center" label="性别" prop="gender">
        <template slot-scope="scope">
          {{ genderDic[scope.row.gender] }}
        </template>
      </el-table-column>

      <el-table-column align="center" label="生日" prop="birthday"/>

      <el-table-column align="center" label="用户等级" prop="userLevel">
        <template slot-scope="scope">
          <!-- {{ levelDic[scope.row.userLevel] }} -->
          访客
        </template>
      </el-table-column>

      <el-table-column align="center" label="状态" prop="status">
        <template slot-scope="scope">
          {{ statusDic[scope.row.status] }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作" width="200" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button v-permission="['GET /admin/user/detailApprove']" type="primary" size="small" @click="handleDetail(scope.row)">设置为会员</el-button>
        </template>
      </el-table-column>

    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

  </div>
</template>

<script>
import { fetchList } from '@/api/business/user'
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination

export default {
  name: 'Visitor',
  components: { Pagination },
  data() {
    return {
      list: null, //  数据列表
      total: 0, // 总数
      listLoading: true, // 表格的loading
      listQuery: {
        page: 1,
        limit: 20,
        username: undefined,
        mobile: undefined,
        sort: 'add_time',
        order: 'desc'
      }, // 头部搜索和列表的分页加排序
      downloadLoading: false, // 导出的loading
      genderDic: ['未知', '男', '女'], // 性别
      levelDic: ['普通用户', 'VIP用户', '代理'], // 级别 - 废弃
      statusDic: ['可用', '禁用', '注销', '代理申请'] // 用户状态
    }
  },
  created() {
    this.getList()
  },
  methods: {
    // 初始化
    initgetList() {
      this.listQuery.page = 1
      this.listQuery.username = ''
      this.listQuery.mobile = ''
      this.getList()
    },
    // 获取数据
    getList() {
      this.listLoading = true
      fetchList(this.listQuery).then(response => {
        this.list = response.data.data.items
        this.total = response.data.data.total
        this.listLoading = false
      }).catch(() => {
        this.list = []
        this.total = 0
        this.listLoading = false
      })
    },
    // 点击查找按钮
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    // 点击列表中的设置为会员
    handleDetail(row) {
      this.$confirm('是否将 ' + row.nickname + ' 设置为会员？', '确认信息', {
        distinguishCancelAndClose: true,
        confirmButtonText: '确认',
        cancelButtonText: '取消'
      }).then(() => {
        // 调接口直接设置为会员 ， 成功后刷新一下页面

      }).catch(() => {
        this.$message({ message: '取消' })
      })
    },
    handleDownload() {
      this.downloadLoading = true
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = ['用户名', '手机号码', '性别', '生日', '状态']
        const filterVal = ['username', 'mobile', 'gender', 'birthday', 'status']
        excel.export_json_to_excel2(tHeader, this.list, filterVal, '用户信息')
        this.downloadLoading = false
      })
    }
  }
}
</script>
