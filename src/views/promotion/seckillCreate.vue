<template>
  <div class="app-container">
    <el-card class="box-card">
      <h3>秒杀商品基础配置</h3>
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="dataForm"
        label-width="150px"
      >
        <el-form-item label="商品" prop="goodsId">
          <el-select
            v-el-select-loadmore="loadmore"
            v-model="dataForm.goodsName"
            filterable
            clearable
            placeholder="请选择商品"
            style="width:60%"
            @clear="remove()"
            @change="selectProduct"
          >
            <el-option
              v-for="item in options"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            >
              <span>{{ item.name }}</span>
              <img :src="item.picUrl" style="height: 32px; float: right" >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="秒杀批次" prop="batchId">
          <el-select
            v-model="dataForm.batchId"
            placeholder="请选择批次"
            @change="handleChange"
          >
            <el-option
              v-for="item in batchList"
              :key="item.time"
              :label="item.time"
              :value="item.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="秒杀时间:" prop="seckillTime">
          <el-date-picker
            v-model="dataForm.seckillTime"
            type="daterange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            value-format="yyyy-MM-dd"
            style="height: 33px; width: 50%"
          />
        </el-form-item>
        <el-form-item label="是否可重复秒杀:" prop="repeatSeckill">
          <el-radio v-model="dataForm.repeatSeckill" :label="1">允许</el-radio>
          <el-radio
            v-model="dataForm.repeatSeckill"
            :label="0"
          >不允许</el-radio
          >
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="box-card">
      <h3>秒杀商品货品配置</h3>
      <el-table :data="products">
        <el-table-column property="value" label="货品规格">
          <template slot-scope="scope">
            <el-tag v-for="tag in scope.row.specifications" :key="tag">
              {{ tag }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column property="price" width="100" label="货品售价" />
        <el-table-column property="number" width="100" label="货品数量" />
        <el-table-column property="seckillPrice" width="100" label="秒杀价" />
        <el-table-column
          property="seckillNumber"
          width="100"
          label="秒杀数量"
        />
        <el-table-column property="url" width="100" label="货品图片">
          <template slot-scope="scope">
            <img v-if="scope.row.url" :src="scope.row.url" width="40" >
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          label="操作"
          width="100"
          class-name="small-padding fixed-width"
        >
          <template slot-scope="scope">
            <el-button
              type="primary"
              size="mini"
              @click="handleProductShow(scope.row)"
            >设置</el-button
            >
          </template>
        </el-table-column>
      </el-table>

      <el-dialog :visible.sync="productVisiable" title="设置秒杀货品">
        <el-form
          ref="productForm"
          :rules="rules"
          :model="productForm"
          status-icon
          label-position="left"
          label-width="100px"
          style="width: 400px; margin-left: 50px"
        >
          <el-form-item label="货品规格列" prop="specifications">
            <el-tag v-for="tag in productForm.specifications" :key="tag">
              {{ tag }}
            </el-tag>
          </el-form-item>
          <el-form-item label="秒杀价" prop="seckillPrice">
            <el-input v-model="productForm.seckillPrice" />
          </el-form-item>
          <el-form-item label="秒杀数量" prop="seckillNumber">
            <el-input v-model="productForm.seckillNumber" />
          </el-form-item>
          <el-form-item label="货品图片" prop="url">
            <img v-if="productForm.url" :src="productForm.url" class="avatar" >
            <i v-else class="el-icon-plus avatar-uploader-icon" />
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="productVisiable = false">取消</el-button>
          <el-button type="primary" @click="handleProductEdit">确定</el-button>
        </div>
      </el-dialog>
    </el-card>

    <div class="op-container">
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" @click="handlePublish">{{
        isAdmin ? "秒杀上架" : "秒杀上架"
      }}</el-button>
    </div>
  </div>
</template>

<style>
.el-card {
  margin-bottom: 10px;
}

.el-tag + .el-tag {
  margin-left: 10px;
}

.input-new-keyword {
  width: 90px;
  margin-left: 10px;
  vertical-align: bottom;
}

.avatar-uploader .el-upload {
  width: 145px;
  height: 145px;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.avatar-uploader .el-upload:hover {
  border-color: #20a0ff;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 120px;
  height: 120px;
  line-height: 120px;
  text-align: center;
}

.avatar {
  width: 145px;
  height: 145px;
  display: block;
}
</style>

<script>
import {
  publishSeckill,
  getBatchConfig,
  listGoods,
  detailProduct
} from '@/api/business/seckill'
import Editor from '@tinymce/tinymce-vue'

import { MessageBox } from 'element-ui'
export default {
  name: 'GoodsCreate',
  components: { Editor },
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
      isAdmin: false,
      goods: { picUrl: '', gallery: [], brokerageType: 0, brokeragePrice: 0 },
      brokerageVisible: false,
      time: [],
      dataForm: {
        id: undefined,
        goodsId: '',
        goodsName: '',
        price: '',
        discountMember: '',
        seckillTime: [],
        batchId: '',
        configTime: '',
        repeatSeckill: 1,
        startDay: '',
        endDay: ''
      },
      specVisiable: false,
      options: [],
      formData: {
        page: 1,
        limit: 20,
        goodsId: null
      },
      multipleSpec: false,
      productVisiable: false,
      batchList: [],
      productForm: {
        id: 0,
        specifications: [],
        price: 0.0,
        number: 0,
        url: '',
        seckillNumber: 0,
        totalNumber: 0,
        seckillPrice: 0.0
      },
      products: [
      ],
      rules: {
        number: [
          { required: true, message: '货品数量不能为空', trigger: 'blur' }
        ]
      },
      dialogStatus: undefined,
      dialogVisible: false
    }
  },
  created() {
    this.initBatchConfig()
  },
  mounted() {
    this.getGoodList(this.formData)
  },
  methods: {
    remove() {
      this.products = []
    },
    loadmore() {
      this.formData.page++
      this.getGoodList(this.formData)
    },
    selectProduct(selVal) {
      this.dialogVisible = true
      this.listLoading = true
      var obj = { id: selVal }
      this.dataForm.goodsId = selVal
      detailProduct(obj)
        .then(response => {
          const _res = response.data.data.products
          this.products = _res
          this.listLoading = false
        })
        .catch(() => {
          this.total = 0
          this.listLoading = false
        })
      // 这里是接口请求数据, 带分页条件
    },
    handleChange(val) {
      var obj = {}
      obj = this.batchList.find(function(item) {
        return item.id === val
      })
      // obj 就是被选中的那个对象，也就能拿到label值了。
      console.log(obj.time) // label值
      this.dataForm.configTime = obj.time
      this.dataForm.configId = obj.id
      console.log(this.dataForm.configId) // value值
    },
    init: function() {},
    initBatchConfig() {
      getBatchConfig().then(response => {
        this.batchList = response.data.data.batchList
      })
    },
    handleCancel: function() {
      this.$router.push({ path: '/promotion/seckill' })
    },
    handlePublish: function() {
      this.$refs['dataForm'].validate(valid => {
        if (valid) {
          const finalGoods = {
            seckillGoods: this.dataForm,
            products: this.products
          }
          publishSeckill(finalGoods)
            .then(response => {
              this.$notify.success({
                title: '成功',
                message: '创建成功'
              })
              this.$router.push({ path: '/promotion/seckill' })
            })
            .catch(response => {
              MessageBox.alert('业务错误：' + response.data.errmsg, '警告', {
                confirmButtonText: '确定',
                type: 'error'
              })
            })
        } else {
          this.$notify.error({
            title: '温馨提示',
            message: '存在必要参数未正确填写，请检查!'
          })
          return
        }
      })
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
    },
    specToProduct() {
      if (this.specifications.length === 0) {
        return
      }
      // 根据specifications创建临时规格列表
      var specValues = []
      var spec = this.specifications[0].specification
      var values = []
      values.push(0)

      for (var i = 1; i < this.specifications.length; i++) {
        const aspec = this.specifications[i].specification

        if (aspec === spec) {
          values.push(i)
        } else {
          specValues.push(values)
          spec = aspec
          values = []
          values.push(i)
        }
      }
      specValues.push(values)

      // 根据临时规格列表生产货品规格
      // 算法基于 https://blog.csdn.net/tyhj_sf/article/details/53893125
      var productsIndex = 0
      var products = []
      var combination = []
      var n = specValues.length
      for (var s = 0; s < n; s++) {
        combination[s] = 0
      }
      var index = 0
      var isContinue = false
      do {
        var specifications = []
        for (var x = 0; x < n; x++) {
          var z = specValues[x][combination[x]]
          specifications.push(this.specifications[z].value)
        }
        products[productsIndex] = {
          id: productsIndex,
          specifications: specifications,
          price: 0.0,
          number: 0,
          url: ''
        }
        productsIndex++

        index++
        combination[n - 1] = index
        for (var j = n - 1; j >= 0; j--) {
          if (combination[j] >= specValues[j].length) {
            combination[j] = 0
            index = 0
            if (j - 1 >= 0) {
              combination[j - 1] = combination[j - 1] + 1
            }
          }
        }
        isContinue = false
        for (var p = 0; p < n; p++) {
          if (combination[p] !== 0) {
            isContinue = true
          }
        }
      } while (isContinue)

      this.products = products
    },
    handleProductShow(row) {
      this.productForm = Object.assign({}, row)
      this.productVisiable = true
    },
    uploadProductUrl: function(response) {
      this.productForm.url = response.data.url
    },
    handleProductEdit() {
      this.$refs['productForm'].validate(valid => {
        if (valid) {
          for (var i = 0; i < this.products.length; i++) {
            const v = this.products[i]
            this.productForm.totalNumber = this.productForm.seckillNumber
            if (v.id === this.productForm.id) {
              this.products.splice(i, 1, this.productForm)
              break
            }
          }
          this.productVisiable = false
        }
      })
    }
  }
}
</script>
