<template>
  <div>
    <div class="top-bar">
      <el-input
        v-model="queryInfo.query"
        placeholder=""
        @clear="getUserList"
        clearable
      >
        <template slot="append">
          <el-button
            type="primary"
            size="mini"
            @click="getUserList"
            icon="el-icon-search"
          ></el-button>
        </template>
      </el-input>
      <el-button
        type="primary"
        size="default"
        @click="dialogVisible = true"
        icon="el-icon-plus"
        >添加用户</el-button
      >
    </div>
    <el-table :data="userList" border v-loading="loading">
      <el-table-column type="index" label="#"> </el-table-column>
      <el-table-column prop="username" label="用户名"> </el-table-column>
      <el-table-column prop="email" label="邮箱"> </el-table-column>
      <el-table-column prop="mobile" label="电话"> </el-table-column>
      <el-table-column prop="role_name" label="角色"> </el-table-column>
      <el-table-column label="状态">
        <template #default="scope">
          <el-switch
            v-model="scope.row.mg_state"
            @change="changeUserState(scope.row)"
          >
          </el-switch>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="210px">
        <template #default="slotProps">
          <el-button
            type="primary"
            size="mini"
            icon="el-icon-edit"
            @click="getUserInfo(slotProps.row.id)"
          ></el-button>
          <el-button
            type="danger"
            size="mini"
            icon="el-icon-delete"
            @click="deleteUser(slotProps.row.id)"
          ></el-button>
          <el-tooltip
            content="分配角色"
            placement="top"
            effect="dark"
            :enterable="false"
          >
            <el-button
              type="warning"
              size="mini"
              icon="el-icon-setting"
              @click="getUserRole(slotProps.row)"
            ></el-button>
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>
    <div class="pagination">
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 20, 40]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </div>
    <el-dialog
      :title="uid ? '修改用户' : '添加用户'"
      :visible.sync="dialogVisible"
      width="50%"
      @close="handleClose"
    >
      <el-form
        :model="addForm"
        ref="addUserForm"
        :rules="rules"
        label-width="80px"
        :inline="false"
        size="normal"
      >
        <el-form-item label="用户名称" prop="username">
          <el-input v-model="addForm.username" :disabled="!!uid"></el-input>
        </el-form-item>
        <el-form-item label="用户密码" prop="password" v-if="!uid">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUser" v-if="uid">确 定</el-button>
        <el-button type="primary" @click="addUser" v-else>确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog title="分配角色" :visible.sync="dialogVisible2" width="50%">
      <p>当前用户：{{ userInfo.username }}</p>
      <p>
        <span>当前角色：</span>
        <el-tag>{{ userInfo.role_name }}</el-tag>
      </p>
      <p>
        <span>分配新角色：</span>
        <el-select v-model="selectRoleId">
          <el-option
            v-for="item in rolesList"
            :key="item.id"
            :label="item.roleName"
            :value="item.id"
          >
          </el-option>
        </el-select>
      </p>
      <span slot="footer">
        <el-button @click="dialogVisible2 = false">取消</el-button>
        <el-button type="primary" @click="setUserRole">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    let checkMobile = (rule, value, callback) => {
      const regMobile = /^(?:(?:\+|00)86)?1[3-9]\d{9}$/
      if (!value) {
        return callback(new Error('请输入手机号码'))
      }
      if (!regMobile.test(value)) {
        return callback(new Error('手机号码不合法'))
      }
      callback()
    }
    return {
      userList: [],
      loading: true,
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10,
      },
      total: 0,
      dialogVisible: false,
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: '',
      },
      rules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          {
            min: 3,
            max: 10,
            message: '长度在 3 到 10 个字符',
            trigger: 'blur',
          },
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
        email: [
          { required: true, message: '请输入邮箱地址', trigger: 'blur' },
          {
            type: 'email',
            message: '请输入正确的邮箱地址',
            trigger: ['blur', 'change'],
          },
        ],
        mobile: [{ required: true, validator: checkMobile, trigger: ['blur'] }],
      },
      uid: '',
      userInfo: {},
      rolesList: [],
      dialogVisible2: false,
      selectRoleId: '',
    }
  },
  created() {
    this.getUserList()
  },
  methods: {
    async getUserList() {
      const { data: res } = await this.$http.get('users', {
        params: this.queryInfo,
      })
      this.userList = res.data.users
      this.total = res.data.total
      this.loading = false
      console.log(res.data)
    },
    handleSizeChange(pagesize) {
      this.queryInfo.pagesize = pagesize
      this.getUserList()
    },
    handleCurrentChange(pagenum) {
      this.queryInfo.pagenum = pagenum
      this.getUserList()
    },
    async changeUserState(userinfo) {
      const { data: res } = await this.$http.put(
        `users/${userinfo.id}/state/${userinfo.mg_state}`
      )
      console.log(res)
    },
    async deleteUser(id) {
      const confirm = await this.$confirm(
        '此操作将永久删除该用户, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).catch((err) => err)
      console.log(confirm)
      if (confirm !== 'confirm') {
        return this.$message.info('没删除')
      }
      await this.$http.delete(`users/${id}`)

      this.getUserList()
    },
    resetForm() {
      this.dialogVisible = false
      this.dialogVisible2 = false
      setTimeout(() => {
        this.$refs.addUserForm.resetFields()
        this.addForm = {
          username: '',
          password: '',
          email: '',
          mobile: '',
        }
        this.uid = ''
        this.userInfo = {}
        this.selectRoleId = ''
      }, 500)
    },
    addUser() {
      this.$refs.addUserForm.validate(async (valid) => {
        if (!valid) return
        const { data: res } = await this.$http.post('users', this.addForm)
        console.log(res)
        this.resetForm()
        this.getUserList()
      })
    },

    async getUserInfo(id) {
      this.uid = id
      this.dialogVisible = true
      const { data: res } = await this.$http.get(`users/${id}`)
      this.addForm.username = res.data.username
      this.addForm.email = res.data.email
      this.addForm.mobile = res.data.mobile
      console.log(res, this.addForm)
    },
    editUser() {
      this.$refs.addUserForm.validate(async (valid) => {
        if (!valid) return
        await this.$http.put(`users/${this.uid}`, {
          email: this.addForm.email,
          mobile: this.addForm.mobile,
        })
        this.resetForm()
        this.getUserList()
      })
    },
    handleClose() {
      this.resetForm()
    },
    async getUserRole(userInfo) {
      this.dialogVisible2 = true
      this.userInfo = userInfo
      const { data: res } = await this.$http.get('roles')
      console.log(userInfo)
      this.rolesList = res.data
    },
    async setUserRole() {
      const { data: res } = await this.$http.put(
        `users/${this.userInfo.id}/role`,
        {
          rid: this.selectRoleId,
        }
      )
      console.log(res)
      this.resetForm()
      this.getUserList()
    },
  },
}
</script>

<style lang="less" scoped>
.top-bar {
  margin: 15px 0 20px 0;
  & > .el-input {
    width: 400px;
    margin-right: 25px;
  }
}
.pagination {
  padding-top: 15px;
}
</style>
