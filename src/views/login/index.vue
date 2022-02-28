<template>
  <div class="login">
    <canvas id="canvas" ref="canvas" class="login-canvas" />
    <el-form ref="loginForm" :model="loginForm" :rules="loginRules" class="login-form">
      <h3 class="title">我的管理系统</h3>
      <el-form-item prop="username">
        <el-input v-model="loginForm.username" type="text" auto-complete="off" placeholder="账号">
          <svg-icon slot="prefix" icon-class="user" class="el-input__icon input-icon" />
        </el-input>
      </el-form-item>
      <el-form-item prop="password">
        <el-input
          v-model="loginForm.password"
          type="password"
          auto-complete="off"
          placeholder="密码"
          @keyup.enter.native="handleLogin"
        >
          <svg-icon slot="prefix" icon-class="password" class="el-input__icon input-icon" />
        </el-input>
      </el-form-item>
      <el-form-item prop="code">
        <el-input
          v-model="loginForm.code"
          auto-complete="off"
          placeholder="验证码"
          style="width: 63%"
          @keyup.enter.native="handleLogin"
        >
          <svg-icon slot="prefix" icon-class="validCode" class="el-input__icon input-icon" />
        </el-input>
        <div class="login-code">
          <img :src="codeUrl" @click="getCode">
        </div>
      </el-form-item>
      <el-checkbox v-model="loginForm.rememberMe" style="margin:0px 0px 25px 0px;">记住密码</el-checkbox>
      <el-form-item style="width:100%;">
        <el-button
          :loading="loading"
          size="medium"
          type="primary"
          style="width:100%;"
          @click.native.prevent="handleLogin">
          <span v-if="!loading">登 录</span>
          <span v-else>登 录 中...</span>
        </el-button>
      </el-form-item>
    </el-form>
    <!--  底部  -->
    <div class="el-login-footer">
      <span>Copyright © 2020-2030 我的版权所有.</span>
    </div>
  </div>
</template>

<script>
import { getCodeImg } from '@/api/login'
import Cookies from 'js-cookie'

export default {
  name: 'Login',
  data() {
    return {
      codeUrl: '',
      ctx: {},
      ts: 0,
      canvas: undefined,
      canvasW: undefined,
      canvasH: undefined,
      pixels: [],
      cookiePassword: '',
      loginForm: {
        username: '',
        password: '',
        rememberMe: false,
        code: '',
        uuid: ''
      },
      loginRules: {
        username: [
          { required: true, trigger: 'blur', message: '用户名不能为空' }
        ],
        password: [
          { required: true, trigger: 'blur', message: '密码不能为空' }
        ],
        code: [{ required: true, trigger: 'change', message: '验证码不能为空' }]
      },
      loading: false,
      redirect: undefined
    }
  },
  watch: {
    $route: {
      handler: function(route) {
        this.redirect = route.query && route.query.redirect
      },
      immediate: true
    }
  },
  created() {
    this.getCode()
    this.getCookie()
  },
  mounted() {
    this.canvas = window.document.getElementById('canvas')
    this.ctx = this.canvas.getContext('2d')
    this.initCanvas()
    this.moving()
  },
  methods: {
    initCanvas() {
      this.canvasW = this.canvas.width = window.innerWidth
      this.canvasH = this.canvas.height = window.innerHeight
      for (var x = -400; x < 400; x += 5) {
        for (var z = -250; z < 250; z += 5) {
          this.pixels.push({ x: x, y: 100, z: z })
        }
      }
      this.ts = 0
    },
    moving(ts) {
      const that = this
      requestAnimationFrame(that.moving, that.canvas)
      that.ctx.fillStyle = '#17293a'
      that.ctx.fillRect(0, 0, that.canvasW, that.canvasH)
      that.render(ts)
    },
    render(ts) {
      var imageData = this.ctx.getImageData(0, 0, this.canvasW, this.canvasH)
      var len = this.pixels.length
      var fov = 250
      var pixel, scale, x2d, y2d, c
      for (var i = 0; i < len; i++) {
        pixel = this.pixels[i]
        scale = fov / (fov + pixel.z)
        x2d = pixel.x * scale + this.canvasW / 2
        y2d = pixel.y * scale + this.canvasH / 2
        if (x2d >= 0 && x2d <= this.canvasW && y2d >= 0 && y2d <= this.canvasH) {
          c = (Math.round(y2d) * imageData.width + Math.round(x2d)) * 4
          imageData.data[c] = 17
          imageData.data[c + 1] = 122
          imageData.data[c + 2] = 181
          imageData.data[c + 3] = 255
        }
        pixel.z -= 0.4
        pixel.y = this.canvasH / 14 + Math.sin(i / len * 15 + (ts / 450)) * 10
        if (pixel.z < -fov) pixel.z += 2 * fov
      }
      this.ctx.putImageData(imageData, 0, 0)
    },
    getCode() {
      getCodeImg().then(res => {
        this.codeUrl = 'data:image/gif;base64,' + res.data.data.img
        this.loginForm.uuid = res.data.data.uuid
      })
    },
    getCookie() {
      const username = Cookies.get('username')
      const password = Cookies.get('password')
      const rememberMe = Cookies.get('rememberMe')
      this.loginForm = {
        username: username === undefined ? this.loginForm.username : username,
        password: password === undefined ? this.loginForm.password : password,
        rememberMe: rememberMe === undefined ? false : Boolean(rememberMe)
      }
    },
    handleLogin() {
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          this.loading = true
          if (this.loginForm.rememberMe) {
            Cookies.set('username', this.loginForm.username, { expires: 30 })
            Cookies.set('password', this.loginForm.password, { expires: 30 })
            Cookies.set('rememberMe', this.loginForm.rememberMe, { expires: 30 })
          } else {
            Cookies.remove('username')
            Cookies.remove('password')
            Cookies.remove('rememberMe')
          }
          this.$store.dispatch('LoginByUsername', this.loginForm).then(() => {
            this.loading = false
            this.$router.push({ path: this.redirect || '/' })
          }).catch(response => {
            this.$notify.error({
              title: '失败',
              message: response.data.errmsg
            })
            this.loading = false
            this.getCode()
          })
        }
      })
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss">
.login-canvas {
    top: 0;
    position: absolute;
    display: block;
    width: 100%;
    height: 100%;
}

.login {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  background-size: cover;
}

.title {
  margin: 0px auto 30px auto;
  text-align: center;
  color: #707070;
}

.login-form {
  z-index: 999;
  border-radius: 6px;
  background: #ffffff;
  opacity: 0.85;
  width: 400px;
  padding: 25px 25px 5px 25px;
  .el-input {
    height: 38px;
    input {
      height: 38px;
    }
  }
  .input-icon {
    height: 39px;
    width: 14px;
    margin-left: 2px;
  }
}

.login-tip {
  font-size: 13px;
  text-align: center;
  color: #bfbfbf;
}
.login-code {
  width: 33%;
  height: 38px;
  float: right;
  img {
    cursor: pointer;
    vertical-align: middle;
  }
}
.el-login-footer {
  height: 40px;
  line-height: 40px;
  position: fixed;
  bottom: 0;
  width: 100%;
  text-align: center;
  color: #fff;
  font-family: Arial;
  font-size: 12px;
  letter-spacing: 1px;
}
</style>

