import axios from 'axios'

const http = axios.create({
  baseURL: 'https://lianghj.top:8888/api/private/v1/',
})

export default http
