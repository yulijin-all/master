<template>
  <!-- 代理商管理 -->
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

      <el-table-column align="center" label="姓名" prop="nickname"/>

      <el-table-column align="center" label="手机号码" prop="mobile"/>

      <el-table-column align="center" label="性别" prop="gender">
        <template slot-scope="scope">
          {{ genderDic[scope.row.gender] }}
        </template>
      </el-table-column>

      <el-table-column align="center" label="生日" prop="birthday"/>

      <el-table-column align="center" label="代理地址" prop="agentMap" />

      <el-table-column align="center" label="操作" width="200" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button type="text" size="small" @click="handleDetail(scope.row)">添加代理</el-button>
          <el-button type="text" style="color:red;" size="small" @click="delItem(scope.row)">删除代理</el-button>
        </template>
      </el-table-column>

    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <!-- 用户设置代理商 -->
    <el-dialog :visible.sync="isdialog" :title="dialogtitle" :before-close="handleClose" width="440px" class="mydialog">
      <el-form ref="approveForm" :model="approveForm" status-icon label-position="right" label-width="100px">
        <el-form-item label="代理地址：" label-width="140px">
          <el-cascader v-model="approveForm.cascader" :options="mapoptions" :props="optionProps"/>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleClose">取 消</el-button>
        <el-button type="primary" @click="sersubmit">确 定</el-button>
      </span>
    </el-dialog>

  </div>
</template>

<script>
import { fetchList } from '@/api/business/user'
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination
import { getmapdata } from '@/utils/mapall'
export default {
  name: 'Agent',
  components: { Pagination },
  data() {
    return {
      list: null, //  数据列表
      total: 0, // 总数
      dialogtitle: '', // 设置代理商弹窗的标题
      listLoading: true, // 表格的loading
      approveDialogVisible: false, // 打开设置角色的弹窗
      approveForm: { cascader: '' }, // 打开设置角色的弹窗
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
      statusDic: ['可用', '禁用', '注销', '代理申请'], // 用户状态
      mapoptions: getmapdata(),
      isdialog: false, // 弹窗的变量
      optionProps: {
        value: 'Code',
        label: 'Name',
        children: 'ChildList'
      }
    }
  },
  created() {
    this.getList()
    console.log()
  },
  methods: {
    // 初始化
    initgetList() {
      this.listQuery.page = 1
      this.listQuery.username = ''
      this.listQuery.mobile = ''
      this.getList()
    },
    // 关闭设置代理商的弹窗
    handleClose() {
      this.isdialog = false
    },
    // 点击设置代理商的保存
    sersubmit() {
      console.log(this.approveForm)
      // 调接口保存，成功后刷新页面
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
    // 点击列表中的设置为代理商
    handleDetail(row) {
      this.dialogtitle = '是否申请将 ' + row.nickname + ' 升级为代理商'
      this.isdialog = true
      // 调接口直接设置为会员 ， 成功后刷新一下页面
    },
    // 删除
    delItem(row) {
      this.$confirm('是否将这一位代理商 ' + row.nickname + ' 删除？', '确认信息', {
        distinguishCancelAndClose: true,
        confirmButtonText: '确认',
        cancelButtonText: '取消'
      }).then(() => {
        // 调接口直接删除 ， 成功后刷新一下页面
        this.$message({ message: '删除成功' })
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
