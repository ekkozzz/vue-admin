<template>
  <div>
    <el-row>
      <el-col>
        <el-button
          type="primary"
          size="default"
          icon="el-icon-plus"
          @click="showAddCateDialog"
          >添加分类</el-button
        >
      </el-col>
    </el-row>
    <el-table
      :data="cateList"
      border
      row-key="cat_id"
      :tree-props="{ children: 'children' }"
      v
    >
      <el-table-column label="#" type="index" width="60px"></el-table-column>
      <el-table-column label="分类名称" prop="cat_name"></el-table-column>
      <el-table-column label="是否有效">
        <template v-slot="props">
          <i
            style="color: green"
            class="el-icon-success"
            v-if="!props.row.cat_deleted"
          ></i>
          <i style="color: red" class="el-icon-error" v-else></i>
        </template>
      </el-table-column>
      <el-table-column label="排序">
        <template v-slot="props">
          <el-tag size="small" v-if="props.row.cat_level === 0">一级</el-tag>
          <el-tag
            size="small"
            type="success"
            v-else-if="props.row.cat_level === 1"
            >二级</el-tag
          >
          <el-tag size="small" type="warning" v-else>三级</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template v-slot="props">
          <el-button
            type="primary"
            size="mini"
            icon="el-icon-edit"
            @click="showEditCateDialog(props.row.cat_id)"
            >编辑</el-button
          >
          <el-button
            type="danger"
            size="mini"
            icon="el-icon-delete"
            @click="removeCate(props.row.cat_id)"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="queryInfo.pagenum"
      :page-sizes="[5, 10, 20, 30]"
      :page-size="queryInfo.pagesize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
    >
    </el-pagination>
    <el-dialog
      title="提示"
      :visible.sync="dialogVisible"
      width="50%"
      @close="dialogClose"
    >
      <el-form
        :model="ruleForm"
        :rules="rules"
        ref="ruleForm"
        label-width="100px"
      >
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="ruleForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类" v-if="!cid">
          <el-cascader
            :options="parentCateList"
            v-model="selectdKeys"
            :props="{
              expandTrigger: 'hover',
              checkStrictly: true,
              ...cascaderProps,
            }"
            clearable
            @change="parentCateChange"
          >
          </el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handelClick">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 10,
      },
      cateList: [],
      total: 0,
      dialogVisible: false,
      ruleForm: {
        cat_pid: 0,
        cat_name: '',
        cat_level: 0,
      },
      rules: {
        cat_name: [
          { required: true, message: '分类名称', trigger: 'blur' },
          {
            min: 2,
            max: 16,
            message: '长度在 2 到 16 个字符',
            trigger: 'blur',
          },
        ],
      },
      parentCateList: [],
      selectdKeys: [],
      cascaderProps: {
        label: 'cat_name',
        value: 'cat_id',
        children: 'children',
      },
      cid: '',
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    async getCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: this.queryInfo,
      })
      console.log(res)
      this.cateList = res.data.result
      this.total = res.data.total
    },
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getCateList()
    },
    handleCurrentChange(newCurren) {
      this.queryInfo.pagenum = newCurren
      this.getCateList()
    },
    async showAddCateDialog() {
      this.dialogVisible = true
      const { data: res } = await this.$http.get('categories', {
        params: { type: 2 },
      })
      console.log(res)
      this.parentCateList = res.data
    },
    parentCateChange() {
      if (this.selectdKeys.length > 0) {
        this.ruleForm.cat_pid = this.selectdKeys[this.selectdKeys.length - 1]
      } else {
        this.ruleForm.cat_pid = 0
      }
      this.ruleForm.cat_level = this.selectdKeys.length
      console.log(this.ruleForm)
    },
    addCate() {
      this.$refs.ruleForm.validate(async (valid) => {
        if (!valid) return
        const { data: res } = await this.$http.post('categories', this.ruleForm)
        console.log(res)
        this.dialogVisible = false
        this.getCateList()
      })
    },
    dialogClose() {
      this.$refs.ruleForm.resetFields()
      this.ruleForm = this.$options.data().ruleForm
      console.log(this.$options.data())
      this.selectdKeys = []
      this.cid = ''
    },
    async removeCate(id) {
      const comfirm = await this.$confirm(
        '此操作将永久删除该文件, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).catch((err) => err)
      console.log(comfirm)
      if (comfirm !== 'confirm') {
        return
      }
      await this.$http.delete(`categories/${id}`)
      this.getCateList()
    },
    async showEditCateDialog(id) {
      this.dialogVisible = true
      this.cid = id
      const { data: res } = await this.$http.get(`categories/${id}`)
      this.ruleForm.cat_name = res.data.cat_name
    },
    async editCate() {
      const { data: res } = await this.$http.put(`categories/${this.cid}`, {
        cat_name: this.ruleForm.cat_name,
      })
      console.log(res)
      this.dialogVisible = false

      this.getCateList()
    },
    handelClick() {
      this.cid ? this.editCate() : this.addCate()
    },
  },
}
</script>

<style lang="less" scoped>
.el-table {
  margin: 15px 0;
}
.el-cascader {
  width: 100%;
}
</style>
