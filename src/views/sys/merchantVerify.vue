<template>
  <div class="app-container">

    <!-- 查询和其他操作 -->
    <div class="filter-container ">
      <el-input v-model="listQuery.merchantName" clearable size="mini" class="filter-item" style="width: 200px;" placeholder="商户名"/>
      <el-input v-model="listQuery.shopName" clearable size="mini" class="filter-item" style="width: 200px;" placeholder="店铺名称"/>
      <el-select v-model="listQuery.approveStatus" clearable size="mini" class="filter-item" filterable style="width: 200px;" placeholder="请选择审批状态" @change="change()">
        <el-option
          v-for="item in approveStatusArray"
          :key="item.value"
          :label="item.name"
          :value="item.value"/>
      </el-select>
      <el-button v-permission="['GET /admin/merchant/list']" size="mini" class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">查找</el-button>
      <el-button size="mini" class="filter-item" type="success" icon="el-icon-search" @click="queryReset">重置</el-button>
    </div>

    <!-- 查询结果 -->
    <el-table v-loading="listLoading" :data="list" size="small" element-loading-text="正在查询中。。。" border fit highlight-current-row>
      <el-table-column align="center" label="商户名" prop="username"/>
      <el-table-column align="center" label="头像" property="avatar">
        <template slot-scope="scope">
          <img v-if="scope.row.avatar" :src="scope.row.avatar" width="40">
        </template>
      </el-table-column>
      <el-table-column align="center" label="邮箱" prop="mail"/>
      <el-table-column align="center" label="电话号码" prop="tel"/>
      <el-table-column align="center" label="申请时间" prop="applyTime"/>
      <el-table-column align="center" label="店铺名" prop="shopName"/>
      <el-table-column align="center" label="主营类" prop="mainManage"/>
      <el-table-column align="center" label="身份证头像面" property="idHeadPic">
        <template slot-scope="scope">
          <img v-if="scope.row.idHeadPic" :src="scope.row.idHeadPic" width="80">
        </template>
      </el-table-column>
      <el-table-column align="center" label="身份证国徽面" property="idNationalEmblemPic">
        <template slot-scope="scope">
          <img v-if="scope.row.idNationalEmblemPic" :src="scope.row.idNationalEmblemPic" width="80">
        </template>
      </el-table-column>
      <el-table-column align="center" label="是否三证合一" prop="isThreeCertInOne"/>
      <el-table-column align="center" label="营业执照" property="businessLicensePic">
        <template slot-scope="scope">
          <img v-if="scope.row.businessLicensePic" :src="scope.row.businessLicensePic" width="40">
        </template>
      </el-table-column>
      <el-table-column align="center" label="审批意见" prop="approveOpinion"/>
      <el-table-column align="center" min-width="120px" label="操作" class-name="small-padding fixed-width">

        <template slot-scope="scope">
          <el-button v-permission="['POST /admin/merchant/verify']" v-if="scope.row.approveStatus == 1" size="mini" style="min-width: 80px;" type="primary" @click="handleApply(scope.row)">审核</el-button>
          <el-button v-if="scope.row.approveStatus == 0" size="mini" style="min-width: 80px;" plain type="success" disabled>审核通过</el-button>
          <el-button v-if="scope.row.approveStatus == null" size="mini" style="min-width: 80px;" plain type="danger" disabled>审核未通过</el-button>
        </template>

      </el-table-column>

    </el-table>
    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <!-- 审核对话框 -->
    <el-dialog :visible.sync="dialogFormVisible" class="apply_dialog" title="商户入驻审核">
      <el-form ref="dataForm" :model="dataForm" status-icon label-position="left" label-width="100px" style="width: 80%; margin:0 auto;">
        <el-form-item label="商户名" prop="bankName">
          <el-input v-model="dataForm.username" disabled/>
        </el-form-item>
        <el-form-item label="头像" prop="avatar">
          <img :src="dataForm.avatar" width="80">
        </el-form-item>
        <el-form-item label="邮箱" prop="mail">
          <el-input v-model="dataForm.mail" disabled/>
        </el-form-item>
        <el-form-item label="电话号码" prop="tel">
          <el-input v-model="dataForm.tel" disabled/>
        </el-form-item>
        <el-form-item label="申请时间" prop="applyTime">
          <el-input v-model="dataForm.applyTime" disabled/>
        </el-form-item>
        <el-form-item label="店铺名" prop="shopName">
          <el-input v-model="dataForm.shopName" disabled/>
        </el-form-item>
        <el-form-item label="主营类" prop="mainManage">
          <el-input v-model="dataForm.mainManage" disabled/>
        </el-form-item>
        <el-form-item label="身份证头像面" prop="idHeadPic">
          <img :src="dataForm.idHeadPic" width="80%">
        </el-form-item>
        <el-form-item label="身份证国徽面" prop="idNationalEmblemPic">
          <img :src="dataForm.idNationalEmblemPic" width="80%">
        </el-form-item>
        <el-form-item label="是否三证合一" prop="isThreeCertInOne">
          <el-input v-model="dataForm.isThreeCertInOne" disabled/>
        </el-form-item>
        <el-form-item label="营业执照" prop="businessLicensePic">
          <img :src="dataForm.businessLicensePic" width="80%">
        </el-form-item>
      </el-form>
      <div class="verify_btn">
        <el-button style="width:80px" type="primary" @click="verify(1,'通过')">通过</el-button>
        <el-button style="width:80px" type="danger" @click="verify(0,'不通过')">不通过</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import { listMerchantApply, verifyMerchantApply } from '@/api/business/merchantApply'
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination

export default {
  name: 'Bank',
  components: { Pagination },
  data() {
    return {
      list: null,
      total: 0,
      listLoading: true,
      approveStatusArray: [
        { name: '全部', value: null },
        { name: '待审核', value: 1 },
        { name: '审核通过', value: 0 },
        { name: '审核不通过', value: 2 }
      ],
      listQuery: {
        page: 1,
        limit: 20,
        merchantName: undefined,
        shopName: undefined,
        approveStatus: undefined
      },
      dialogFormVisible: false,
      dataForm: {
        id: undefined,
        username: '',
        avatar: '',
        mail: '',
        tel: '',
        applyTime: '',
        shopName: '',
        mainManage: '',
        idHeadPic: '',
        idNationalEmblemPic: '',
        isThreeCertInOne: '',
        businessLicensePic: ''
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      listMerchantApply(this.listQuery).then(response => {
        this.list = response.data.data.items
        this.total = response.data.data.total
        this.listLoading = false
      }).catch(() => {
        this.list = []
        this.total = 0
        this.listLoading = false
      })
    },
    change() {
      this.$forceUpdate()
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    queryReset() {
      this.listQuery = {

      }
      this.handleFilter()
    },
    handleApply(row) {
      this.dataForm = Object.assign({}, row)
      this.dialogFormVisible = true
    },
    verify(type, msg) {
      if (type === 0) {
        // 审核不通过
        this.$prompt('输入审核意见', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          inputValidator: (value) => {
            if (value === '' || value === null || value === undefined || value.trim().length < 1) {
              return '审核意见不能为空'
            } else if (value.length > 150) {
              return '审核意见最多150字'
            }
          },
          inputErrorMessage: '审核意见有误'
        }).then(({ value }) => {
          if (value.length > 150) { return }
          const data = { isAdopt: type, adminId: this.dataForm.id, opinion: value }
          verifyMerchantApply(data).then(response => {
            this.dialogFormVisible = false
            this.$notify.success({
              title: '成功',
              message: '审核成功'
            })
            this.getList()
          }).catch(response => {
            this.$notify.error({
              title: '失败',
              message: response.data.errmsg
            })
          })
        }).catch(() => {

        })
      } else {
        // 审核通过
        this.$confirm('确认审核' + msg + '?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          const data = { isAdopt: type, adminId: this.dataForm.id }
          verifyMerchantApply(data).then(response => {
            this.dialogFormVisible = false
            this.$notify.success({
              title: '成功',
              message: '审核成功'
            })
            this.getList()
          }).catch(response => {
            this.$notify.error({
              title: '失败',
              message: response.data.errmsg
            })
          })
        }).catch(() => {
          // 几点取消的提示
        })
      }
    }
  }
}
</script>

<style>
  .apply_dialog{
    text-align: center;
  }
  .apply_dialog input{
    color:#807575 !important;
  }
  .apply_dialog .el-dialog{
    margin-top: 2vh !important;
  }
  .apply_dialog .el-dialog__title{
    font-weight: bold;
  }
  .verify_btn{
    text-align: center;
    position: fixed;
    top: 95%;
    left: 45%;
  }
</style>
