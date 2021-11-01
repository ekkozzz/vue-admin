<template>
  <div>
    <el-container class="main-container">
      <el-aside width="210px" :class="{ collapse: isCollapse }">
        <el-menu
          :default-active="$route.path"
          :unique-opened="true"
          :router="true"
          background-color="#304156"
          text-color="#bfcbd9"
          active-text-color="#409eff"
          :collapse="isCollapse"
          :collapse-transition="false"
        >
          <el-menu-item index="/index">
            <i class="el-icon-platform-eleme"></i>
            <span slot="title">Dashboard</span>
          </el-menu-item>

          <el-submenu
            :index="item.path"
            v-for="item in menuList"
            :key="item.id"
          >
            <template slot="title">
              <i :class="iconObj[item.id]"></i>
              <span>{{ item.authName }}</span>
            </template>
            <el-menu-item
              :index="`/${subItem.path}`"
              v-for="subItem in item.children"
              :key="subItem.id"
            >
              <template>
                <i class="el-icon-s-help"></i>
                <span>{{ subItem.authName }}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>

      <el-container class="main">
        <el-header>
          <div class="btn" @click="isCollapse = !isCollapse">
            <i class="el-icon-s-unfold" v-show="isCollapse"></i>
            <i class="el-icon-s-fold" v-show="!isCollapse"></i>
          </div>
          <Breadcrumb />
          <div>
            <el-button type="primary" size="small" @click="logout"
              >退出登录</el-button
            >
          </div>
        </el-header>

        <el-main style="overflow-x: hidden">
          <transition name="fade-transform" mode="out-in">
            <router-view></router-view>
          </transition>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script>
import Breadcrumb from '../components/Breadcrumb'
export default {
  data() {
    return {
      isCollapse: false,
      menuList: [],
      iconObj: {
        125: 'el-icon-user-solid',
        103: 'el-icon-s-check',
        102: 'el-icon-s-goods',
        101: 'el-icon-s-order',
        145: 'el-icon-s-marketing',
      },
    }
  },
  components: {
    Breadcrumb,
  },
  created() {
    this.getMenuList()
  },
  methods: {
    async getMenuList() {
      this.menuList = JSON.parse(sessionStorage.getItem('menulist')) || ''
      const { data: res } = await this.$http.get('menus')
      this.menuList = res.data
      sessionStorage.setItem('menulist', JSON.stringify(res.data))
    },
    logout() {
      sessionStorage.removeItem('token')
      this.$router.push('/login')
    },
  },
}
</script>

<style lang="less" scoped>
.main-container {
  height: 100vh;
  .el-aside {
    background: #304156;
    transition: 0.5s all;
    overflow: hidden;
    &.collapse {
      width: 64px !important;
    }
  }
  .el-menu {
    border: none;
  }
  .el-header {
    display: flex;
    align-items: center;
    height: 50px !important;
    background: #fff;
    box-shadow: 0 1px 4px rgb(0 21 41 / 8%);
    padding-right: 30px;
    .btn {
      width: 50px;
      height: 50px;
      font-size: 20px;
      line-height: 50px;
      text-align: center;
      cursor: pointer;
      &:hover {
        background: #f9f9f9;
      }
    }
    .el-breadcrumb {
      flex: 1;
    }
  }
}
.fade-transform-leave-active,
.fade-transform-enter-active {
  transition: all 0.5s;
}

.fade-transform-enter {
  opacity: 0;
  transform: translateX(-30px);
}

.fade-transform-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
