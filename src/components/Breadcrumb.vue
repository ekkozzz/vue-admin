<template>
  <el-breadcrumb separator="/">
    <transition-group name="breadcrumb">
      <el-breadcrumb-item
        v-for="(item, index) in levelList"
        :key="item.path + index"
      >
        <span
          v-if="item.redirect === 'noRedirect' || index == levelList.length - 1"
          class="no-redirect"
          >{{ item.meta.title }}</span
        >
        <a v-else @click.prevent="handleLink(item)">{{ item.meta.title }}</a>
      </el-breadcrumb-item>
    </transition-group>
  </el-breadcrumb>
</template>

<script>
let pathToRegexp = require('path-to-regexp')

export default {
  data() {
    return {
      levelList: [],
    }
  },
  watch: {
    $route(route) {
      if (route.path.startsWith('/redirect/')) return
      this.getlevelList()
    },
  },
  created() {
    this.getlevelList()
  },
  methods: {
    getlevelList() {
      let matched = this.$route.matched.filter(
        (item) => item.meta && item.meta.title
      )
      let first = matched[0]
      if (!this.isIndex(first)) {
        matched = [{ path: '/index', meta: { title: '首页' } }].concat(matched)
      }
      this.levelList = matched.filter(
        (item) => item.meta && item.meta.title !== false
      )
    },
    isIndex(route) {
      const name = route && route.name
      if (!name) {
        return false
      }
      return name.trim().toLocaleLowerCase() === 'index'.toLocaleLowerCase()
    },
    pathCompile(path) {
      const { params } = this.$route
      var toPath = pathToRegexp.compile(path)
      if (params) {
        return toPath(params)
      }
    },
    handleLink(item) {
      const { redirect, path } = item
      if (redirect) {
        this.$router.push(redirect)
        return
      }
      this.$router.push(this.pathCompile(path))
    },
  },
}
</script>
<style lang="less" scoped>
.el-breadcrumb {
  display: inline-block;
  font-size: 14px;
}
.breadcrumb-enter-active,
.breadcrumb-leave-active {
  transition: all 0.5s;
}

.breadcrumb-enter,
.breadcrumb-leave-active {
  opacity: 0;
  transform: translateX(20px);
}

.breadcrumb-move {
  transition: all 0.5s;
}

.breadcrumb-leave-active {
  position: absolute;
}
</style>
