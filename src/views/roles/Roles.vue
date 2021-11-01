<template>
  <div>
    <el-button type="primary" icon="el-icon-plus" @click="dialogVisible = true"
      >添加角色</el-button
    >
    <el-table :data="rolesList" border stripe>
      <el-table-column type="expand">
        <template #default="props">
          <div style="padding: 0 50px">
            <el-row
              :class="['bdbottom', i1 === 0 ? 'bdtop' : '', 'flex-center']"
              v-for="(item1, i1) in props.row.children"
              :key="item1.id"
            >
              <el-col :span="5">
                <el-tag
                  size="normal"
                  closable
                  @close="removeRight(props.row, item1.id)"
                  >{{ item1.authName }}</el-tag
                >
                <i class="el-icon-caret-right"></i>
              </el-col>
              <el-col :span="19">
                <el-row
                  :class="[i2 === 0 ? '' : 'bdtop', 'flex-center']"
                  v-for="(item2, i2) in item1.children"
                  :key="item2.id"
                >
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      size="normal"
                      closable
                      @close="removeRight(props.row, item2.id)"
                    >
                      {{ item2.authName }}
                    </el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag
                      type="warning"
                      size="normal"
                      closable
                      @close="removeRight(props.row, item3.id)"
                      v-for="item3 in item2.children"
                      :key="item3.id"
                      >{{ item3.authName }}</el-tag
                    >
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="roleName" label="角色名称"> </el-table-column>
      <el-table-column prop="roleDesc" label="角色描述"> </el-table-column>
      <el-table-column label="操作" width="350px">
        <template #default="props">
          <el-button
            type="primary"
            size="mini"
            icon="el-icon-edit"
            @click="getRoleInfo(props.row.id)"
            >编辑</el-button
          >
          <el-button
            type="danger"
            size="mini"
            icon="el-icon-delete"
            @click="deleteRole(props.row.id)"
            >删除</el-button
          >
          <el-button
            type="warning"
            size="mini"
            icon="el-icon-setting"
            @click="getRightsList(props.row)"
            >分配权限</el-button
          >
        </template>
      </el-table-column>
    </el-table>
    <el-dialog
      :title="rid ? '修改角色' : '添加角色'"
      :visible.sync="dialogVisible"
      width="50%"
      @closed="handleClosed"
    >
      <el-form
        :model="roleForm"
        ref="roleForm"
        :rules="rules"
        label-width="80px"
        size="normal"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="roleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="roleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>

      <span slot="footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button
          type="primary"
          @click="handleClick"
          :disabled="!roleForm.roleName"
          >确 定</el-button
        >
      </span>
    </el-dialog>
    <el-dialog
      title="分配权限"
      :visible.sync="dialogVisible2"
      width="50%"
      @close="defKeys = []"
    >
      <el-tree
        :data="rightsList"
        :props="treeProps"
        show-checkbox
        node-key="id"
        :default-expand-all="true"
        :default-checked-keys="defKeys"
        ref="treeRef"
      ></el-tree>

      <span slot="footer">
        <el-button @click="dialogVisible2 = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      rolesList: [],
      dialogVisible: false,
      roleForm: {
        roleName: '',
        roleDesc: '',
      },
      rules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          { min: 2, max: 8, message: '长度在 2 到 8 个字符', trigger: 'blur' },
        ],
        roleDesc: [
          { min: 0, max: 16, message: '长度不能超过16个字符', trigger: 'blur' },
        ],
      },
      rid: '',
      dialogVisible2: false,
      rightsList: [],
      defKeys: [],
      treeProps: {
        children: 'children',
        label: 'authName',
      },
    }
  },
  created() {
    this.getRolesList()
  },
  methods: {
    async getRolesList() {
      const { data: res } = await this.$http.get('roles')
      console.log(res)
      this.rolesList = res.data
    },
    addRole() {
      this.$refs.roleForm.validate(async (valid) => {
        if (!valid) return
        const { data: res } = await this.$http.post('roles', {
          ...this.roleForm,
        })
        if (res.meta.status !== 201) {
          this.$message.error('用户创建失败')
        }
        this.getRolesList()
      })
    },
    handleClosed() {
      this.$refs.roleForm.resetFields()
      this.rid = ''
    },
    async deleteRole(id) {
      const confirm = await this.$confirm(
        '此操作将永久删除该角色，是否继续？',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).catch((err) => {
        return err
      })
      if (confirm !== 'confirm') {
        return this.$message.error('用户删除失败!')
      }
      await this.$http.delete(`roles/${id}`)
      this.getRolesList()
    },
    async getRoleInfo(id) {
      this.rid = id
      this.dialogVisible = true
      const { data: res } = await this.$http.get(`roles/${id}`)
      console.log(res)
      Object.keys(this.roleForm).forEach(
        (key) => (this.roleForm[key] = res.data[key])
      )
    },
    editRole(id) {
      this.$refs.roleForm.validate(async (valid) => {
        if (!valid) return
        const { data: res } = await this.$http.put(`roles/${id}`, this.roleForm)
        console.log(res)
        this.getRolesList()
      })
    },
    handleClick() {
      this.rid ? this.editRole(this.rid) : this.addRole()
      this.dialogVisible = false
    },
    async removeRight(roles, rightId) {
      console.log(rightId)
      const comfirm = await this.$confirm(
        '此操作将永久删除, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).catch((err) => err)
      if (comfirm !== 'confirm') {
        return this.$message.info('取消了删除')
      }
      const { data: res } = await this.$http.delete(
        `roles/${roles.id}/rights/${rightId}`
      )
      roles.children = res.data
    },
    async getRightsList(roles) {
      this.rid = roles.id
      this.dialogVisible2 = true
      const { data: res } = await this.$http.get('rights/tree')
      console.log(res)
      this.rightsList = res.data
      this.getLeafKeys(roles, this.defKeys)
    },
    getLeafKeys(node, arr) {
      // 如果当前node没有children属性则是三级节点
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach((item) => this.getLeafKeys(item, arr))
    },
    async allotRights() {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys(),
      ]
      const idStr = keys.join(',')
      const { data: res } = await this.$http.post(`roles/${this.rid}/rights`, {
        rids: idStr,
      })
      if (res.meta.status !== 200) {
        return this.$message.error('分配权限失败!')
      }
      this.getRolesList()
      this.dialogVisible2 = false
    },
  },
}
</script>

<style lang="less" scoped>
.el-table {
  margin-top: 15px;
}
.el-tag {
  margin: 7px;
}
.flex-center {
  display: flex;
  align-items: center;
}
.bdtop {
  border-top: 1px solid #eee;
}
.bdbottom {
  border-bottom: 1px solid #eee;
}
</style>
