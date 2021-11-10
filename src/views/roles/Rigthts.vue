<template>
  <div>
    <el-table :data="rightsList" border stripe>
      <el-table-column type="index" label="#"> </el-table-column>
      <el-table-column label="权限名称" prop="authName"></el-table-column>
      <el-table-column label="路径" prop="path"></el-table-column>
      <el-table-column label="权限等级">
        <template #default="props">
          <el-tag v-if="props.row.level === '0'">一级</el-tag>
          <el-tag type="success" v-else-if="props.row.level === '1'"
            >二级</el-tag
          >
          <el-tag type="warning" v-else-if="props.row.level === '2'"
            >三级</el-tag
          >
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
export default {
  data() {
    return {
      rightsList: [],
    }
  },
  created() {
    this.getRightsList()
  },
  methods: {
    async getRightsList() {
      const { data: res } = await this.$http.get('rights/list')
      this.rightsList = res.data
      console.log(res)
    },
  },
}
</script>

<style></style>
