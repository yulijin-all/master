<template>
  <!-- 团长管理  团长列表 -->
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

      <el-table-column align="center" label="性别" prop="gender">
        <template slot-scope="scope">
          {{ genderDic[scope.row.gender] }}
        </template>
      </el-table-column>

      <el-table-column align="center" label="团长级别" prop="nickname"/>

      <el-table-column align="center" label="新老团长" prop="mobile"/>

      <el-table-column align="center" label="总余额" prop="birthday"/>

      <el-table-column align="center" label="操作" width="200" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button type="text" size="small" @click="lookopen(scope.row)">查看详情</el-button>
          <el-button type="text" size="small" @click="handleDetail(scope.row)">设置等级</el-button>
          <el-button type="text" style="color:red;" size="small" @click="lookgroup(scope.row)">查看团成员</el-button>
        </template>
      </el-table-column>

    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <!-- 设置用户等级 -->
    <el-dialog :visible.sync="isdialog" :title="dialogtitle" :before-close="handleClose" width="440px" class="mydialog">
      <el-form ref="approveForm" :model="approveForm" status-icon label-position="right" label-width="140px">
        <el-form-item label="设置用户等级：">
          <el-select v-model="approveForm.lv" placeholder="请选择">
            <el-option
              v-for="item in colonellist"
              :key="item.id"
              :label="item.label"
              :value="item.id"/>
          </el-select>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleClose">取 消</el-button>
        <el-button type="primary" @click="sersubmit">确 定</el-button>
      </span>
    </el-dialog>
    <!--查看详情  -->
    <el-dialog
      :visible.sync="detailDialogVisible"
      :before-close="setdetailDialogVisible"
      class="mydialog"
      title="用户详情"
      width="700px"
    >
      <el-form :data="agencyDetail" class="userFrom" label-position="right">
        <div class="userimg">
          <img :src="agencyDetail.userUrl" alt="" >
        </div>
        <el-form-item label="用户名称：" label-width="140px">
          <span>{{ agencyDetail.nickname }}</span>
        </el-form-item>
        <el-form-item label="用户手机号：" label-width="140px">
          {{ agencyDetail.mobile }}
        </el-form-item>
        <el-form-item label="用户性别：" label-width="140px">
          {{ genderDic[agencyDetail.gender] }}
        </el-form-item>
        <el-row>
          <el-col :span="12">
            <el-form-item label="用户生日：" label-width="140px">
              {{ agencyDetail.birthday }}
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="用户等级：" label-width="140px">
              {{ levelDic[agencyDetail.userLevel] }}
              {{ agencyDetail.birthday }}
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="用户是否是新用户：" label-width="140px">
              {{ agencyDetail.newLodUser == 1 ? "新用户" : "老用户" }}
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="用户账户余额：" label-width="140px">
              {{ agencyDetail.idRemainingsum }}
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="用户储值余额：" label-width="140px">
              {{ agencyDetail.storedRemainingsum }}
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="detailDialogVisible = false">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 打开团成员列表 -->
    <el-dialog :visible.sync="isfroupdialog" :title="dialoggrouptitle" :before-close="handlefroupClose" width="700px" class="mydialog">
      <div class="grouplist">
        <el-table :data="groupnumlist" border stripe style="width: 100%">
          <el-table-column align="center" prop="date" label="成员头像" width="140">
            <template slot-scope="scope">
              <div class="groupbox_img">
                <div class="group_img">
                  <img :src="scope.row.userUrl" alt="">
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column align="center" prop="nickname" label="成员姓名"/>
          <el-table-column align="center" prop="mobile" label="成员手机号"/>
        </el-table>
        <div class="tc mt10">
          <el-pagination :current-page.sync="grouppage.pageNum" :page-size="grouppage.pageSize" :total="grouppage.total" background layout="prev, pager, next"/>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="handlefroupClose">关 闭</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { fetchList } from '@/api/business/user'
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination
import { getmapdata } from '@/utils/mapall'
export default {
  name: 'Agentcheck',
  components: { Pagination },
  data() {
    return {
      list: null, //  数据列表
      total: 0, // 总数
      dialogtitle: '', // 设置代理商弹窗的标题
      listLoading: true, // 表格的loading
      approveDialogVisible: false, // 打开设置角色的弹窗
      approveForm: { lv: '' }, // 打开设置角色的弹窗
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
      mapoptions: getmapdata(), // 获取省市区地址列表
      isdialog: false, // 弹窗的变量
      isfroupdialog: false, // 团成员弹窗列表变量
      dialoggrouptitle: '',
      grouppage: { total: 0, pageNum: 1, pageSize: 10 }, // 团成员的分页
      groupnumlist: [
        { userUrl: require('@/assets/image/tansongyun.png'), nickname: '谭松韵', mobile: '13144445555' },
        { userUrl: require('@/assets/image/tansongyun.png'), nickname: '谭松韵', mobile: '13144445555' },
        { userUrl: require('@/assets/image/tansongyun.png'), nickname: '谭松韵', mobile: '13144445555' },
        { userUrl: require('@/assets/image/tansongyun.png'), nickname: '谭松韵', mobile: '13144445555' },
        { userUrl: require('@/assets/image/tansongyun.png'), nickname: '谭松韵', mobile: '13144445555' }
      ], // 团成员列表
      colonellist: [
        { label: '青铜', id: 1 },
        { label: '白银', id: 2 },
        { label: '黄金', id: 3 },
        { label: '白金', id: 4 }
      ], // 团长等级数组  - 需要通过接口获取
      detailDialogVisible: false, // 查看详情的变量
      agencyDetail: {
        userUrl: require('@/assets/image/tansongyun.png'),
        nickname: '谭松韵', // 名称
        mobile: '13144445555', // 手机
        gender: '2', // 性别
        birthday: '1990年5月31日', // 生日
        userLevel: '1', // 用户等级
        newLodUser: '老用户', // 是否是老用户或者是新用户
        idRemainingsum: '135555.50', // 账户余额
        storedRemainingsum: '10000.00', // 储值余额
        topupRemainingsum: '10000.00', // 充值余额
        pushedRemainingsum: '10000.00', // 近推余额
        belongtoPeople: '谭松韵妈妈', // 所属团长
        groupnumber: '20', // 团次数
        couponsRemainingsum: '300.00', // 优惠卷线上余额
        couponsOfflineRemainingsum: '10000.00' // 优惠价线下余额
      }// 详情的查看对象
    }
  },
  created() {
    this.getList()
    console.log()
  },
  methods: {
    // 关闭查看详情弹窗
    setdetailDialogVisible() {
      this.detailDialogVisible = false
    },
    // 初始化
    initgetList() {
      this.listQuery.page = 1
      this.listQuery.username = ''
      this.listQuery.mobile = ''
      this.getList()
    },
    // 关闭设置团长级别
    handleClose() {
      this.isdialog = false
    },
    // 点击设置团长级别的保存
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
    // 点击列表中的设置团长级别
    handleDetail(row) {
      this.dialogtitle = '升级团长 ' + row.nickname + ' 的级别'
      this.isdialog = true
      // 调接口直接设置为会员 ， 成功后刷新一下页面
    },
    // 打开详情窗口
    lookopen() {
      this.detailDialogVisible = true
    },
    // 打开团成员弹窗
    lookgroup(val) {
      this.dialoggrouptitle = '查看 ' + val.nickname + ' 团长的团成员'
      // 调接口获取成员列表
      this.isfroupdialog = true
    },
    // 关闭团成员的弹窗
    handlefroupClose() {
      this.isfroupdialog = false
    },
    // 拒绝此人成为代理商
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
