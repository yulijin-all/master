<template>
  <div class="app-container">

    <!-- 查询和其他操作 -->
    <div class="filter-container">
      <el-input v-model="listQuery.key" clearable size="mini" class="filter-item" style="width: 200px;" placeholder="请输入参数KEY"/>
      <el-input v-model="listQuery.keyWord" clearable size="mini" class="filter-item" style="width: 200px;" placeholder="请输入描述关键字"/>
      <el-button v-permission="['GET /admin/param/list']" size="mini" class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">查找</el-button>
      <el-button v-permission="['POST /admin/param/create']" size="mini" class="filter-item" type="primary" icon="el-icon-edit" @click="handleCreate">添加</el-button>
    </div>

    <!-- 查询结果 -->
    <el-table v-loading="listLoading" :data="list" size="small" element-loading-text="正在查询中。。。" border fit highlight-current-row>

      <el-table-column align="left" min-width="130px" label="参数KEY" prop="keyName"/>

      <el-table-column align="center" min-width="180px" label="参数值" prop="keyValue"/>

      <el-table-column align="left" min-width="240px" label="参数描述" prop="desc"/>

      <el-table-column align="center" min-width="120px" label="操作" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button v-permission="['POST /admin/param/update']" type="primary" size="mini" @click="handleUpdate(scope.row)">编辑</el-button>
          <el-button v-permission="['POST /admin/param/delete']" type="danger" size="mini" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <!-- 添加或修改对话框 -->
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="dataForm" status-icon label-position="left" label-width="100px" style="width: 400px; margin-left:50px;">
        <el-form-item label="参数KEY" prop="keyName">
          <el-input v-model="dataForm.keyName"/>
        </el-form-item>
        <el-form-item label="参数值" prop="keyValue">
          <el-input v-model="dataForm.keyValue"/>
        </el-form-item>
        <el-form-item label="参数描述" prop="desc">
          <el-input v-model="dataForm.desc"/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button v-if="dialogStatus=='create'" type="primary" @click="createData">确定</el-button>
        <el-button v-else type="primary" @click="updateData">确定</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import { listParam, createParam, updateParam, deleteParam } from '@/api/business/param'
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination

export default {
  name: 'Param',
  components: { Pagination },
  data() {
    return {
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        key: undefined,
        keyWord: undefined,
        sort: 'id',
        order: 'asc'
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑系统参数',
        create: '添加系统参数'
      },
      dataForm: {
        id: undefined,
        keyName: '',
        keyValue: '',
        desc: ''
      },
      rules: {
        keyName: [{ required: true, message: '参数KEY不能为空', trigger: 'blur' }],
        keyValue: [{ required: true, message: '参数值不能为空', trigger: 'blur' }],
        desc: [{ required: true, message: '参数描述不能为空', trigger: 'blur' }]
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      listParam(this.listQuery).then(response => {
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
    },
    resetForm() {
      this.dataForm = {
        id: undefined,
        keyName: '',
        keyValue: '',
        desc: ''
      }
    },
    handleCreate() {
      this.resetForm()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate(valid => {
        if (valid) {
          createParam(this.dataForm)
            .then(response => {
              this.list.unshift(response.data.data)
              this.dialogFormVisible = false
              this.$notify.success({
                title: '成功',
                message: '创建成功'
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
      this.dataForm = Object.assign({}, row)
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          updateParam(this.dataForm).then(() => {
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
              message: '更新成功'
            })
          }).catch(response => {
            this.$notify.error({
              title: '失败',
              message: response.data.errmsg
            })
          })
        }
      })
    },
    handleDelete(row) {
      deleteParam(row).then(response => {
        this.$notify.success({
          title: '成功',
          message: '删除成功'
        })
        const index = this.list.indexOf(row)
        this.list.splice(index, 1)
      }).catch(response => {
        this.$notify.error({
          title: '失败',
          message: response.data.errmsg
        })
      })
    }
  }
}
</script>
