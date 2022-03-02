<template>
  <!-- 团长管理 - 团长申请列表 -->
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

      <el-table-column align="center" label="用户姓名" prop="nickname"/>

      <el-table-column align="center" label="手机号码" prop="mobile"/>

      <el-table-column align="center" label="性别" prop="gender">
        <template slot-scope="scope">
          {{ genderDic[scope.row.gender] }}
        </template>
      </el-table-column>

      <el-table-column align="center" label="申请时间" prop="birthday"/>

      <el-table-column align="center" label="操作" width="200" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button type="text" size="small" @click="handleDetail(scope.row)">同意</el-button>
          <el-button type="text" style="color:red;" size="small" @click="delItem(scope.row)">拒绝</el-button>
        </template>
      </el-table-column>

    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <!-- 用户升级为团长 同意 -->
    <el-dialog :visible.sync="isdialog" :title="dialogtitle" :before-close="handleClose" width="540px" class="mydialog">
      <el-form ref="approveForm" status-icon label-position="right" label-width="130px">
        <el-form-item label="设置用户等级：">
          <el-select v-model="approveForm.lv" placeholder="请选择">
            <el-option
              v-for="item in colonellist"
              :key="item.id"
              :label="item.label"
              :value="item.id"/>
          </el-select>
        </el-form-item>
        <el-form-item label="团长有效期：">
          <el-date-picker
            v-model="approveForm.itemr"
            :format="'yyyy-MM-dd'"
            type="daterange"
            value-format="yyyy-MM-dd"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"/>
        </el-form-item>
        <el-form-item label="是否上下级分佣：">
          <el-radio-group v-model="approveForm.radio">
            <el-radio :label="1">是</el-radio>
            <el-radio :label="0">否</el-radio>
          </el-radio-group>
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
  name: 'Partnercheck',
  components: { Pagination },
  data() {
    return {
      list: null, //  数据列表
      total: 0, // 总数
      ckpartnerlist: [], // 已选择合伙人店铺数组
      ckpartar: null, // 返回的店铺数组列表 - 选择的临时变量
      ckarr: [
        { name: '武汉第一店', id: 1 }, { name: '武汉第二店', id: 2 }, { name: '武汉第三店', id: 3 }, { name: '武汉第四店', id: 4 }, { name: '武汉第五店', id: 5 },
        { name: '武汉第一1店', id: 11 }, { name: '武汉第1二店', id: 12 }, { name: '武汉第1三店', id: 13 }, { name: '武汉第1四店', id: 14 }, { name: '武汉第1五店', id: 15 }
      ], // 需要调接口返回的店铺数组列表
      dialogtitle: '', // 设置代理商弹窗的标题
      listLoading: true, // 表格的loading
      approveForm: { lv: '', itemr: '', radio: null }, // 打开设置角色的弹窗
      colonellist: [
        { label: '青铜', id: 1 },
        { label: '白银', id: 2 },
        { label: '黄金', id: 3 },
        { label: '白金', id: 4 }
      ], // 团长等级数组  - 需要通过接口获取
      approveDialogVisible: false, // 打开设置角色的弹窗
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
    // 删除选中的店铺
    delitck(val) {
      this.ckpartnerlist.splice(val, 1)
      this.ckpartar.splice(val, 1)
    },
    // 获取选择的店铺对象
    setckpartnerlist(val) {
      if (val.length > 5) {
        val.splice(5, 1)
      }
      this.ckpartnerlist = val.map(it => { return JSON.parse(it) })
    },
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
      // 这里需要初始化
      this.ckpartar = null
      this.ckpartnerlist = []
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
      this.dialogtitle = '用户 ' + row.nickname + ' 升级为团长'
      this.isdialog = true
      // 调接口直接设置为会员 ， 成功后刷新一下页面
    },
    // 拒绝此人成为团长
    delItem(row) {
      this.$prompt('请填写拒绝理由', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /\S/,
        inputErrorMessage: '拒绝理由不能为空'
      }).then(({ value }) => {
        // 调接口设置是否成功 ， 成功后刷新列表
        this.$message({ type: 'success', message: '你的邮箱是: ' + value })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '取消输入'
        })
      })
      // this.$confirm('是否将这一位代理商 ' + row.nickname + " 删除？", '确认信息', {
      //           distinguishCancelAndClose: true,
      //           confirmButtonText: '确认',
      //           cancelButtonText: '取消'
      //       }).then( () => {
      //           //调接口直接删除 ， 成功后刷新一下页面
      //           this.$message({ message: '删除成功' });
      //       }).catch( () => {
      //           this.$message({ message: '取消' });
      //       })
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
