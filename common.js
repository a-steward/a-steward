// 等待配置文件加载完成
window.addEventListener('DOMContentLoaded', () => {
  if (!window.YARA_CONFIG) {
    console.error('Yara 配置文件加载失败，请检查yara-config.js是否正确引入')
    return
  }

  // ===================== 1. 全局常量与配置 =====================
  const CONFIG = window.YARA_CONFIG
  const TOKEN_KEY = 'yara_token'
  const USER_INFO_KEY = 'yara_user_info'
  const VIP_INFO_KEY = 'yara_vip_info'

  // 订单状态映射（商用全流程）
  window.YARA_ORDER_STATUS = {
    0: { text: '已取消', type: 'info', canPay: false, canCancel: false, canRefund: false },
    1: { text: '待支付', type: 'warning', canPay: true, canCancel: true, canRefund: false },
    2: { text: '待接单', type: 'success', canPay: false, canCancel: true, canRefund: true },
    3: { text: '服务中', type: 'primary', canPay: false, canCancel: false, canRefund: true },
    4: { text: '待确认', type: 'warning', canPay: false, canCancel: false, canRefund: false },
    5: { text: '已完成', type: 'success', canPay: false, canCancel: false, canRefund: false, canComment: true },
    6: { text: '已关闭', type: 'info', canPay: false, canCancel: false, canRefund: false }
  }

  // 订单类型映射
  window.YARA_ORDER_TYPE = {}
  CONFIG.service.types.forEach(item => {
    window.YARA_ORDER_TYPE[item.value] = item.label
  })

  // ===================== 2. 存储与权限工具 =====================
  window.YARA_STORAGE = {
    setToken: (token) => localStorage.setItem(TOKEN_KEY, token),
    getToken: () => localStorage.getItem(TOKEN_KEY) || '',
    removeToken: () => {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_INFO_KEY)
      localStorage.removeItem(VIP_INFO_KEY)
    },
    setUserInfo: (userInfo) => localStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo)),
    getUserInfo: () => {
      const info = localStorage.getItem(USER_INFO_KEY)
      return info ? JSON.parse(info) : {}
    },
    setVipInfo: (vipInfo) => localStorage.setItem(VIP_INFO_KEY, JSON.stringify(vipInfo)),
    getVipInfo: () => {
      const info = localStorage.getItem(VIP_INFO_KEY)
      return info ? JSON.parse(info) : { isVip: false, expireTime: '' }
    }
  }

  // 权限校验（未登录自动跳转登录页，不影响原有项目）
  window.YARA_AUTH = {
    checkAuth: () => {
      const token = YARA_STORAGE.getToken()
      const isLoginPage = window.location.pathname.includes('yara-login.html')
      const isRegisterPage = window.location.pathname.includes('yara-register.html')
      const isHomePage = window.location.pathname.includes('index.html')
      const isAgreementPage = window.location.pathname.includes('yara-') && window.location.pathname.includes('.html') && (window.location.pathname.includes('agreement') || window.location.pathname.includes('privacy') || window.location.pathname.includes('refund') || window.location.pathname.includes('help'))

      // 无需登录的页面直接放行
      if (isLoginPage || isRegisterPage || isHomePage || isAgreementPage) return true

      // 未登录拦截
      if (!token) {
        ElMessage.warning('请先登录后再操作')
        setTimeout(() => {
          window.location.href = 'yara-login.html?redirect=' + encodeURIComponent(window.location.href)
        }, 1000)
        return false
      }

      // 已登录用户访问登录/注册页，跳转到首页
      if (token && (isLoginPage || isRegisterPage)) {
        window.location.href = 'yara-index.html'
        return false
      }

      return true
    },

    // 检查是否为VIP
    checkVip: () => {
      const vipInfo = YARA_STORAGE.getVipInfo()
      if (!vipInfo.isVip) return false
      if (new Date(vipInfo.expireTime).getTime() < Date.now()) {
        vipInfo.isVip = false
        YARA_STORAGE.setVipInfo(vipInfo)
        return false
      }
      return true
    },

    // 退出登录
    logout: (showMessage = true) => {
      YARA_STORAGE.removeToken()
      if (showMessage) ElMessage.success('退出登录成功')
      window.location.href = 'index.html'
    }
  }

  // ===================== 3. 统一接口请求封装 =====================
  window.YARA_API = axios.create({
    baseURL: CONFIG.api.baseUrl,
    timeout: CONFIG.api.timeout,
    headers: {
      'Content-Type': 'application/json'
    }
  })

  // 请求拦截器：自动添加Token
  YARA_API.interceptors.request.use(
    (config) => {
      const token = YARA_STORAGE.getToken()
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    },
    (error) => Promise.reject(error)
  )

  // 响应拦截器：统一错误处理、权限拦截
  YARA_API.interceptors.response.use(
    (response) => {
      const res = response.data
      if (res.code === 200) {
        return res
      } else {
        ElMessage.error(res.message || '请求失败，请稍后重试')
        return Promise.reject(new Error(res.message || '请求失败'))
      }
    },
    (error) => {
      const status = error.response?.status
      const message = error.response?.data?.message || error.message

      if (status === 401) {
        YARA_STORAGE.removeToken()
        ElMessage.error('登录已过期，请重新登录')
        setTimeout(() => {
          window.location.href = 'yara-login.html'
        }, 1000)
      } else if (status === 403) {
        ElMessage.error('你无权限访问该资源，请联系客服')
      } else if (status === 404) {
        ElMessage.error('请求的资源不存在')
      } else if (status === 500) {
        ElMessage.error('服务器内部错误，请稍后重试')
      } else {
        ElMessage.error(message || '网络异常，请检查网络后重试')
      }
      return Promise.reject(error)
    }
  )

  // ===================== 4. 统一业务接口管理 =====================
  window.YARA_API_LIST = {
    // 账号相关
    login: (data) => YARA_API.post('/auth/login', data),
    register: (data) => YARA_API.post('/auth/register', data),
    sendSmsCode: (data) => YARA_API.post('/auth/send-code', data),
    forgetPassword: (data) => YARA_API.post('/auth/forget-password', data),
    getUserInfo: () => YARA_API.get('/user/info'),
    updateUserInfo: (data) => YARA_API.put('/user/info', data),
    getUserStat: () => YARA_API.get('/user/stat'),

    // 订单相关
    createOrder: (data) => YARA_API.post('/order/create', data),
    getOrderList: (params) => YARA_API.get('/order/list', { params }),
    getOrderDetail: (id) => YARA_API.get(`/order/detail/${id}`),
    cancelOrder: (id) => YARA_API.put(`/order/cancel/${id}`),
    confirmOrder: (id) => YARA_API.put(`/order/confirm/${id}`),
    refundOrder: (id, data) => YARA_API.post(`/order/refund/${id}`, data),
    commentOrder: (id, data) => YARA_API.post(`/order/comment/${id}`, data),
    getMyCommentList: () => YARA_API.get('/comment/my-list'),

    // 支付相关
    createPay: (data) => YARA_API.post('/pay/create', data),
    queryPayStatus: (orderNo) => YARA_API.get(`/pay/status/${orderNo}`),

    // 会员相关
    getVipList: () => YARA_API.get('/vip/list'),
    createVipOrder: (data) => YARA_API.post('/vip/create-order', data),
    getMyVipInfo: () => YARA_API.get('/vip/info'),

    // 优惠券相关
    getMyCouponList: (params) => YARA_API.get('/coupon/my-list', { params }),
    getAvailableCouponList: (orderAmount) => YARA_API.get(`/coupon/available?amount=${orderAmount}`),

    // 帮助中心相关
    getHelpList: (params) => YARA_API.get('/help/list', { params }),
    createTicket: (data) => YARA_API.post('/help/ticket', data),

    // 文件上传
    uploadFile: (formData) => YARA_API.post(CONFIG.api.uploadUrl, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  }

  // ===================== 5. 统一支付封装 =====================
  window.YARA_PAY = {
    async createPay(orderNo, payType = 'wechat', payScene = 'h5') {
      try {
        const res = await YARA_API_LIST.createPay({
          orderNo,
          payType,
          payScene
        })
        const { payUrl, qrCode } = res.data

        if (payType === 'wechat' && payScene === 'qr') {
          this.showPayQrModal(qrCode, orderNo)
        } else if (payType === 'wechat' && payScene === 'h5') {
          window.location.href = payUrl
        } else if (payType === 'alipay') {
          const div = document.createElement('div')
          div.innerHTML = payUrl
          document.body.appendChild(div)
          document.forms[0].submit()
        }

        return res
      } catch (error) {
        console.error('支付创建失败', error)
        throw error
      }
    },

    showPayQrModal(qrCode, orderNo) {
      ElMessageBox.alert(`
        <div class="yara-text-center">
          <p class="yara-mb-20">请使用微信扫码支付</p>
          <img src="${qrCode}" alt="支付二维码" width="200" height="200" />
          <p class="yara-mt-20">支付完成后请点击【已完成支付】</p>
        </div>
      `, '微信支付', {
        dangerouslyUseHTMLString: true,
        showCancelButton: true,
        confirmButtonText: '已完成支付',
        cancelButtonText: '取消支付',
        closeOnClickModal: false
      }).then(async () => {
        const res = await YARA_API_LIST.queryPayStatus(orderNo)
        if (res.data.status === 'success') {
          ElMessage.success('支付成功')
          window.location.reload()
        } else {
          ElMessage.warning('未查询到支付结果，请稍后刷新页面查看')
        }
      }).catch(() => {
        ElMessage.info('支付已取消')
      })
    },

    loopQueryPayStatus(orderNo, callback, times = 30, interval = 3000) {
      let count = 0
      const timer = setInterval(async () => {
        count++
        try {
          const res = await YARA_API_LIST.queryPayStatus(orderNo)
          if (res.data.status === 'success') {
            clearInterval(timer)
            callback && callback(true)
          }
        } catch (error) {
          console.error('查询支付状态失败', error)
        }

        if (count >= times) {
          clearInterval(timer)
          callback && callback(false)
        }
      }, interval)
    }
  }

  // ===================== 6. 通用工具函数 =====================
  window.YARA_UTILS = {
    formatPrice: (price) => '¥' + Number(price).toFixed(2),
    formatTime: (time, format = 'YYYY-MM-DD HH:mm:ss') => {
      if (!time) return '-'
      const date = new Date(time)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      const seconds = String(date.getSeconds()).padStart(2, '0')
      return format.replace('YYYY', year).replace('MM', month).replace('DD', day).replace('HH', hours).replace('mm', minutes).replace('ss', seconds)
    },
    getUrlParam: (name) => {
      const urlParams = new URLSearchParams(window.location.search)
      return urlParams.get(name)
    },
    validPhone: (phone) => /^1[3-9]\d{9}$/.test(phone),
    debounce: (func, wait) => {
      let timeout
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout)
          func(...args)
        }
        clearTimeout(timeout)
        timeout = setTimeout(later, wait)
      }
    },
    copyText: (text) => {
      navigator.clipboard.writeText(text).then(() => {
        ElMessage.success('复制成功')
      }).catch(() => {
        const input = document.createElement('input')
        input.value = text
        document.body.appendChild(input)
        input.select()
        document.execCommand('copy')
        document.body.removeChild(input)
        ElMessage.success('复制成功')
      })
    }
  }

  // ===================== 7. 全局事件绑定 =====================
  document.querySelectorAll('.yara-logout-btn').forEach(btn => {
    btn.addEventListener('click', () => YARA_AUTH.logout())
  })

  document.querySelectorAll('.yara-back-home').forEach(btn => {
    btn.addEventListener('click', () => window.location.href = 'index.html')
  })

  document.querySelectorAll('.yara-back-origin').forEach(btn => {
    btn.addEventListener('click', () => window.location.href = 'index.html')
  })

  window.addEventListener('load', () => {
    YARA_AUTH.checkAuth()
  })
})
