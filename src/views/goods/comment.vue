<template>
  <div class="app-container">

    <!-- 查询和其他操作 -->
    <div class="filter-container">
      <el-input v-model="listQuery.nickname" clearable size="mini" class="filter-item" style="width: 200px;" placeholder="请输入评论用户名"/>
      <el-input v-model="listQuery.goodsSn" clearable size="mini" class="filter-item" style="width: 200px;" placeholder="请输入商品序列号"/>
      <el-button class="filter-item" size="mini" type="primary" icon="el-icon-search" @click="handleFilter">查找</el-button>
      <el-button :loading="downloadLoading" size="mini" class="filter-item" type="warning" icon="el-icon-download" @click="handleDownload">导出</el-button>
    </div>

    <!-- 查询结果 -->
    <el-table v-loading="listLoading" ref="commentTable" :data="list" size="small" element-loading-text="正在查询中。。。" border fit highlight-current-row>

      <el-table-column type="expand" width="1">
        <template slot-scope="props">
          <div v-for="(replyItem,index) in repliers" :key="index" class="text item">
            <div class="avatar-wrapper">
              <img :src="replyItem.avatar" class="user-avatar">
            </div>
            <el-tag type="info" closable @close="handleCloseReply(replyItem.comentId)"> {{ replyItem.commenterName }} 于【{{ replyItem.addTime }}】回复 :</el-tag>
            <div class="reply-content">{{ replyItem.commentContent }}</div>
          </div>
          <el-form ref="replyForm" :inline="true" :model="replyForm" status-icon label-position="left" label-width="100px" style="width: 700px; margin-left:50px;">
            <el-form-item label="回复内容" prop="content">
              <el-input :autosize="{ minRows: 4, maxRows: 8}" v-model="replyForm.content" type="textarea" style="width: 400px; height: 100px"/>
            </el-form-item>
            <el-button v-permission="['POST /admin/comment/reply']" type="primary" class="op-btn" @click="reply">确定</el-button>
          </el-form>
        </template>
      </el-table-column>

      <el-table-column align="center" min-width="100px" label="用户" prop="nickname"/>

      <el-table-column align="center" min-width="200px" label="评价商品" prop="commentGoodsname"/>

      <el-table-column align="center" min-width="70px" label="打分" prop="star" sortable/>

      <el-table-column align="left" min-width="200px" label="评论内容" prop="content"/>

      <el-table-column align="center" min-width="120px" label="评论图片" prop="picUrls">
        <template slot-scope="scope">
          <img v-for="item in scope.row.picUrls" :key="item" :src="item" width="40">
        </template>
      </el-table-column>

      <el-table-column align="center" min-width="80px" label="是否回复" prop="replyNum">
        <template slot-scope="scope">
          <el-tag :type="scope.row.replyNum > 0 ? 'success' : 'danger' ">{{ scope.row.replyNum ? '已回复' : '未回复' }}</el-tag>
        </template>
      </el-table-column>

      <el-table-column align="center" min-width="120px" label="时间" prop="addTime"/>

      <el-table-column align="center" min-width="150px" label="操作" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button v-permission="['POST /admin/comment/queryReply']" type="primary" size="mini" @click="toogleExpand(scope.row)">回复</el-button>
          <el-button type="danger" size="mini" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <!-- 评论回复 -->
    <el-dialog :visible.sync="replyFormVisible" title="回复">
      <el-form ref="replyForm" :model="replyForm" status-icon label-position="left" label-width="100px" style="width: 400px; margin-left:50px;">
        <el-form-item label="回复内容" prop="content">
          <el-input :autosize="{ minRows: 4, maxRows: 8}" v-model="replyForm.content" type="textarea"/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="replyFormVisible = false">取消</el-button>
        <el-button type="primary" @click="reply">确定</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import { listComment, deleteComment, queryReply } from '@/api/business/comment'
import { replyComment } from '@/api/business/order'
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination
import { getToken } from '@/utils/auth'

export default {
  name: 'Comment',
  components: { Pagination },
  data() {
    return {
      list: undefined,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        userId: undefined,
        valueId: undefined,
        sort: 'add_time',
        order: 'desc'
      },
      downloadLoading: false,
      replyForm: {
        commentId: 0,
        content: ''
      },
      replyFormVisible: false,
      queryReplyParams: {},
      repliers: []
    }
  },
  computed: {
    headers() {
      return {
        'X-Dts-Admin-Token': getToken()
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      listComment(this.listQuery).then(response => {
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
    handleReply(row) {
      this.replyForm = { commentId: row.id, content: '' }
      this.replyFormVisible = true
    },
    toogleExpand(row) {
      this.queryReplyParams = { id: row.id }
      this.loadReplys()
      this.replyForm = { commentId: row.id, content: '' }
      const $table = this.$refs.commentTable
      this.list.map(item => {
        if (row.id !== item.id) {
          $table.toggleRowExpansion(item, false)
        }
      })
      $table.toggleRowExpansion(row)
    },
    reply() {
      replyComment(this.replyForm).then(response => {
        this.replyFormVisible = false
        this.queryReplyParams = { id: this.replyForm.commentId }
        this.loadReplys()
        this.$notify.success({
          title: '成功',
          message: '回复成功'
        })
      }).catch(response => {
        this.$notify.error({
          title: '失败',
          message: response.data.errmsg
        })
      })
    },
    loadReplys() {
      queryReply(this.queryReplyParams).then(response => {
        this.repliers = response.data.data
      }).catch(() => {
        this.repliers = []
      })
    },
    handleDelete(row) {
      deleteComment(row).then(response => {
        this.$notify({
          title: '成功',
          message: '删除成功',
          type: 'success',
          duration: 2000
        })
        const index = this.list.indexOf(row)
        this.list.splice(index, 1)
      })
    },
    handleCloseReply(replyId) {
      const deleteParams = { id: replyId }
      deleteComment(deleteParams).then(response => {
        this.loadReplys()
        this.$notify({
          title: '成功',
          message: '删除成功',
          type: 'success',
          duration: 2000
        })
      })
    },
    handleDownload() {
      this.downloadLoading = true
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = ['评论ID', '用户ID', '商品ID', '评论', '评论图片列表', '评论时间']
        const filterVal = ['id', 'userId', 'valueId', 'content', 'picUrls', 'addTime']
        excel.export_json_to_excel2(tHeader, this.list, filterVal, '商品评论信息')
        this.downloadLoading = false
      })
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  .user-avatar {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    float: left;
    margin-right: 10px;
  }
  .reply-content {
    margin: 10px;
  }
  .op-btn {
    margin-top: 30px;
  }
</style>
