import axios from 'axios'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

import Vue from 'vue'

const http = axios.create({
  baseURL: 'https://lianghj.top:8888/api/private/v1/',
})
// 添加请求拦截器
http.interceptors.request.use(
  function (config) {
    // 在发送请求之前做些什么
    if (sessionStorage.token) {
      config.headers.Authorization = sessionStorage.token
    }
    NProgress.start()
    return config
  },
  function (error) {
    // 对请求错误做些什么
    return Promise.reject(error)
  }
)

// 添加响应拦截器
http.interceptors.response.use(
  function (response) {
    // 对响应数据做点什么
    NProgress.done()
    if (
      response.data.meta.status === 200 ||
      response.data.meta.status === 201 ||
      response.data.meta.status === 204
    ) {
      Vue.prototype.$message.success(response.data.meta.msg)
    }
    return response
  },
  function (error) {
    // 对响应错误做点什么
    if (error.response.data.meta.msg) {
      Vue.$message.prototype.error(error.response.data.meta.msg)
    }
    return Promise.reject(error)
  }
)
export default http
