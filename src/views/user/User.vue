<template>
  <div>
    <el-table :data="userList" border>
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
          <el-button type="primary" size="mini" icon="el-icon-edit"></el-button>
          <el-button
            type="danger"
            size="mini"
            icon="el-icon-delete"
            @click="deleteUser(slotProps.row.id)"
          ></el-button>
          <el-button
            type="warning"
            size="mini"
            icon="el-icon-setting"
          ></el-button>
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
  </div>
</template>

<script>
export default {
  data() {
    return {
      userList: [],
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 5,
      },
      total: 0,
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
      // users/:uId/state/:type
      const { data: res } = await this.$http.put(
        `users/${userinfo.id}/state/${userinfo.mg_state}`
      )
      console.log(res)
    },
    async deleteUser(uid) {
      const confirm = await this.$confirm(
        '此操作将永久删除该用户, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).catch((err) => err)
      if (!confirm) {
        return this.$message.info('没删除')
      }
      const { data: res } = await this.$http.delete(`users/${uid}`)
      console.log(res)
      this.$message.success(res.meta.msg)
      this.getUserList()
    },
  },
}
</script>

<style lang="less" scoped>
.pagination {
  padding-top: 15px;
}
</style>
