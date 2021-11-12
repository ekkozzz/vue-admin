<template>
  <div>
    <el-alert
      title="注意: 只允许为第三级分类设置相关参数!"
      type="warning"
      show-icon
      :closable="false"
    >
    </el-alert>
    <el-row class="cat_opt">
      <el-col>
        <span>选择商品分类：</span>
        <el-cascader
          style="width: 250px"
          v-model="selectCateKeys"
          :options="cateList"
          :props="{ expandTrigger: 'hover', ...cateProps }"
          @change="handleChange"
        ></el-cascader>
      </el-col>
    </el-row>
    <el-tabs v-model="activeName" @tab-click="handleTabClick">
      <el-tab-pane label="动态参数" name="many">
        <el-button
          type="primary"
          size="small"
          :disabled="isDisabled"
          @click="dialogVisible = true"
          >添加参数</el-button
        >
        <el-table :data="manyTableData" border stripe style="margin-top: 15px">
          <el-table-column type="expand">
            <template v-slot="props">
              <el-tag
                v-for="(item, i) in props.row.attr_vals"
                :key="i"
                closable
                @close="handleTagClose(i, props.row)"
                >{{ item }}
              </el-tag>
              <el-input
                class="input-new-tag"
                v-if="props.row.inputVisible"
                v-model="props.row.inputValue"
                ref="saveTagInput"
                size="small"
                @keyup.enter.native="handleInputConfirm(props.row)"
                @blur="handleInputConfirm(props.row)"
              >
              </el-input>
              <el-button
                v-else
                class="button-new-tag"
                size="small"
                @click="showInput(props.row)"
                >+ New Tag</el-button
              >
            </template>
          </el-table-column>
          <el-table-column type="index"></el-table-column>
          <el-table-column label="参数名称" prop="attr_name"></el-table-column>
          <el-table-column label="操作">
            <template v-slot="props">
              <el-button
                type="primary"
                size="mini"
                icon="el-icon-edit"
                @click="showDialog(props.row.attr_id)"
                >编辑</el-button
              >
              <el-button
                type="danger"
                size="mini"
                icon="el-icon-delete"
                @click="removeParams(props.row.attr_id)"
                >删除</el-button
              >
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
      <el-tab-pane label="静态属性" name="only">
        <el-button
          type="primary"
          size="small"
          :disabled="isDisabled"
          @click="dialogVisible = true"
          >添加属性</el-button
        >
        <el-table :data="onlyTableData" border stripe style="margin-top: 15px">
          <el-table-column type="expand">
            <template v-slot="props">
              <el-tag
                v-for="(item, i) in props.row.attr_vals"
                :key="i"
                closable
                @close="handleTagClose(i, props.row)"
                >{{ item }}
              </el-tag>
              <el-input
                class="input-new-tag"
                v-if="props.row.inputVisible"
                v-model="props.row.inputValue"
                ref="saveTagInput"
                size="small"
                @keyup.enter.native="handleInputConfirm(props.row)"
                @blur="handleInputConfirm(props.row)"
              >
              </el-input>
              <el-button
                v-else
                class="button-new-tag"
                size="small"
                @click="showInput(props.row)"
                >+ New Tag</el-button
              >
            </template>
          </el-table-column>
          <el-table-column type="index"></el-table-column>
          <el-table-column label="属性名称" prop="attr_name"></el-table-column>
          <el-table-column label="操作">
            <template v-slot="props">
              <el-button
                type="primary"
                size="mini"
                icon="el-icon-edit"
                @click="showDialog(props.row.attr_id)"
                >编辑</el-button
              >
              <el-button
                type="danger"
                size="mini"
                icon="el-icon-delete"
                @click="removeParams(props.row.attr_id)"
                >删除</el-button
              >
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>
    <el-dialog
      :title="'添加' + titleText"
      :visible.sync="dialogVisible"
      width="50%"
      @close="handleDialogClose"
    >
      <el-form
        :model="ruleForm"
        :rules="rules"
        ref="ruleForm"
        label-width="100px"
      >
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="ruleForm.attr_name"></el-input> </el-form-item
      ></el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleDialogClick">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      cateList: [],
      cateProps: {
        label: 'cat_name',
        value: 'cat_id',
        children: 'children',
      },
      selectCateKeys: [],
      activeName: 'many',
      manyTableData: [],
      onlyTableData: [],
      dialogVisible: false,
      ruleForm: {
        attr_name: '',
      },
      rules: {
        attr_name: [
          { required: true, message: '请输入名称', trigger: 'blur' },
          { min: 2, max: 8, message: '长度在 2 到 8 个字符', trigger: 'blur' },
        ],
      },
      attrId: null,
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    async getCateList() {
      const { data: res } = await this.$http.get('categories')
      console.log(res)
      this.cateList = res.data
    },
    // 级联选择器选择变化触发
    handleChange() {
      console.log(this.selectCateKeys)
      if (this.selectCateKeys.length !== 3) {
        this.selectCateKeys = []
        return
      }
      this.getParmasData()
    },
    async getParmasData() {
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes`,
        {
          params: { sel: this.activeName },
        }
      )
      res.data.forEach((item) => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(',') : []
        item.inputVisible = false
        item.inputValue = ''
      })
      if (this.activeName === 'many') {
        this.manyTableData = res.data
      } else {
        this.onlyTableData = res.data
      }
    },
    handleTabClick() {
      this.getParmasData()
    },
    // 对话框关闭清空值和验证
    handleDialogClose() {
      this.$refs.ruleForm.resetFields()
      this.attrId = this.$options.data().attrId
    },
    // 添加属性
    addParams() {
      this.$refs.ruleForm.validate(async (valid) => {
        if (!valid) return
        await this.$http.post(`categories/${this.cateId}/attributes`, {
          attr_name: this.ruleForm.attr_name,
          attr_sel: this.activeName,
        })
        this.dialogVisible = false
        this.getParmasData()
      })
    },
    // 显示修改框
    async showDialog(id) {
      this.dialogVisible = true
      this.attrId = id
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes/${id}`,
        {
          params: {
            attr_sel: this.activeName,
          },
        }
      )
      console.log(res)
      this.ruleForm.attr_name = res.data.attr_name
    },
    // 修改属性
    editParams() {
      this.$refs.ruleForm.validate(async (valid) => {
        if (!valid) return
        await this.$http.put(
          `categories/${this.cateId}/attributes/${this.attrId}`,
          {
            attr_name: this.ruleForm.attr_name,
            attr_sel: this.activeName,
          }
        )
        this.dialogVisible = false
        this.getParmasData()
      })
    },
    // 判断是添加还是修改
    handleDialogClick() {
      this.attrId ? this.editParams() : this.addParams()
    },
    async removeParams(id) {
      const confirm = await this.$confirm(
        '此操作将永久删除该分类, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).catch((err) => err)
      if (confirm !== 'confirm') return
      const { data: res } = await this.$http.delete(
        `categories/${this.cateId}/attributes/${id}`
      )
      console.log(res)
      this.getParmasData()
    },
    handleInputConfirm(row) {
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
        return
      }
      row.attr_vals.push(row.inputValue.trim())
      row.inputValue = ''
      row.inputVisible = false
      this.saveAttrVals(row)
    },
    showInput(row) {
      row.inputVisible = true
      this.$nextTick(() => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    async saveAttrVals(row) {
      const { data: res } = await this.$http.put(
        `categories/${this.cateId}/attributes/${row.attr_id}`,
        {
          attr_name: row.attr_name,
          attr_sel: this.activeName,
          attr_vals: row.attr_vals.join(','),
        }
      )
      console.log(res)
    },
    handleTagClose(i, row) {
      row.attr_vals.splice(i, 1)
      this.saveAttrVals(row)
    },
  },
  computed: {
    isDisabled() {
      if (this.selectCateKeys.length !== 3) {
        return true
      }
      return false
    },
    cateId() {
      if (this.selectCateKeys.length === 3) {
        return this.selectCateKeys[2]
      }
      return null
    },
    titleText() {
      if (this.activeName === 'many') {
        return '动态参数'
      } else {
        return '静态属性'
      }
    },
  },
}
</script>

<style lang="less" scoped>
.cat_opt {
  margin: 15px 0;
}
.el-tag {
  margin-right: 15px;
}
.input-new-tag {
  width: 90px;
  margin-left: 10px;
  vertical-align: bottom;
}
</style>
