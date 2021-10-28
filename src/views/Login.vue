<template>
  <div class="login-container">
    <div class="card-container">
      <el-card shadow="always">
        <div slot="header">
          <span>login</span>
        </div>
        <el-form ref="form" :model="form" :rules="rules">
          <el-form-item label="" size="normal" prop="username">
            <el-input
              v-model="form.username"
              prefix-icon="el-icon-user"
              clearable
            ></el-input>
          </el-form-item>
          <el-form-item label="" size="normal" prop="password">
            <el-input
              v-model="form.password"
              type="password"
              prefix-icon="el-icon-lock"
              show-password
            ></el-input>
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              size="default"
              @click="login"
              style="width: 100%"
              >登录</el-button
            >
          </el-form-item>
        </el-form>
      </el-card>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      form: {
        username: 'admin',
        password: '123456',
      },
      rules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 8, message: '长度在 3 到 8 个字符', trigger: 'blur' },
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          {
            min: 6,
            max: 18,
            message: '长度在 6 到 18 个字符',
            trigger: 'blur',
          },
        ],
      },
    }
  },
  methods: {
    login() {
      this.$refs.form.validate(async (valid) => {
        if (!valid) return
        const { data: res } = await this.$http.post('login', this.form)
        console.log(res)
        this.$message.success(res.meta.msg)
        this.$router.push('home')
      })
    },
  },
}
</script>

<style lang="less" scoped>
.login-container {
  width: 100%;
  height: 100vh;
  background: #2d3a4b;
  .card-container {
    width: 460px;
    padding-top: 160px;
    margin: 0 auto;
  }
}
</style>
