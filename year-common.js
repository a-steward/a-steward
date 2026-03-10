// ===================== 1. 全局常量与配置（立即执行，不等待DOM加载） =====================
const TOKEN_KEY = 'yara_token'
const USER_INFO_KEY = 'yara_user_info'
const VIP_INFO_KEY = 'yara_vip_info'
const BG_THEME_KEY = 'yara_bg_theme'

// 订单状态映射（商用全流程）
window.YARA_ORDER_STATUS = {
  0: { text: '已取消', type: 'info', canPay: false, canCancel: false, canRefund: false },
  1: { text: '待支付', type: 'warning', canPay: true, canCancel: true, canRefund: false },
  2: { text: '待接单', type: 'success', canPay: false, canCancel: true, canRefund: true },
  3: { text: '服务中', type: 'primary', canPay: false, canCancel: false, canRefund: true },
  4: { text: '待确认', type: 'warning', canPay: false, canCancel: false, canRefund: false, canConfirm: true },
  5: { text: '已完成', type: 'success', canPay: false, canCancel: false, canRefund: false, canComment: true },
  6: { text: '已关闭', type: 'info', canPay: false, canCancel: false, canRefund: false }
}

// 背景模版配置
window.YARA_BG_THEMES = {
  space: { name: '深空', css: 'var(--bg-space)' },
  forest: { name: '森林', css: 'var(--bg-forest)' },
  ocean: { name: '深海', css: 'var(--bg-ocean)' }
}

// AI全局配置（复用你现有的接口配置）
window.YARA_AI_CONFIG = {
  API_URL: window.ENV_CONFIG?.AI_API_URL || "https://ark.cn-beijing.volces.com/api/v3/chat/completions",
  MODEL: window.ENV_CONFIG?.AI_MODEL || "doubao-1-5-pro-32k-250115",
  API_KEY: window.ENV_CONFIG?.AI_API_KEY || "",
  SYSTEM_PROMPT: `你是Yara，用户的专属AI生活管家，专注回答事业、情感、生活、游戏相关问题，给出实用、可落地、有温度的解决方案，语言简洁易懂，不要太官方。结尾可以提示用户点击「一键生成派单」按钮，发布需求获取1v1专业人工服务。`
}

// 全局AI对话历史（跨页面保留）
window.YARA_GLOBAL_AI_HISTORY = [
  { id: 1, role: 'assistant', content: `你好！我是Yara，你的专属AI智能管家，有什么可以帮你的吗？无论是事业规划、情感问题、生活需求还是游戏相关，我都可以为你解答疑惑、生成解决方案，还能一键帮你发布派单需求，匹配专业人工服务哦~` }
]
window.YARA_GLOBAL_AI_CHAT_ID = 2

// ===================== 2. 存储与权限工具（全局可用） =====================
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
  },
  setBgTheme: (theme) => {
    localStorage.setItem(BG_THEME_KEY, theme)
    document.documentElement.style.setProperty('--bg-current', YARA_BG_THEMES[theme].css)
  },
  getBgTheme: () => {
    return localStorage.getItem(BG_THEME_KEY) || 'space'
  }
}

window.YARA_AUTH = {
  checkAuth: () => {
    const token = YARA_STORAGE.getToken()
    const isLoginPage = window.location.pathname.includes('yara-login.html')
    const isRegisterPage = window.location.pathname.includes('yara-register.html')
    const isHomePage = window.location.pathname.includes('index.html')
    const isAgreementPage = window.location.pathname.includes('agreement.html') || window.location.pathname.includes('privacy.html') || window.location.pathname.includes('yara-refund.html') || window.location.pathname.includes('yara-help.html')
    
    if (isLoginPage || isRegisterPage || isHomePage || isAgreementPage) return true
    if (!token) {
      ElMessage?.warning?.('请先登录后再操作')
      setTimeout(() => {
        window.location.href = 'yara-login.html?redirect=' + encodeURIComponent(window.location.href)
      }, 1000)
      return false
    }
    if (token && (isLoginPage || isRegisterPage)) {
      window.location.href = 'yara-index.html'
      return false
    }
    return true
  },
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
  logout: (showMessage = true) => {
    YARA_STORAGE.removeToken()
    if (showMessage) ElMessage?.success?.('退出登录成功')
    window.location.href = 'index.html'
  }
}

// ===================== 3. 统一接口请求封装 =====================
window.YARA_API = axios.create({
  baseURL: window.YARA_CONFIG?.api?.baseUrl || 'http://localhost:8080',
  timeout: window.YARA_CONFIG?.api?.timeout || 15000,
  headers: { 'Content-Type': 'application/json' }
})

YARA_API.interceptors.request.use(
  (config) => {
    const token = YARA_STORAGE.getToken()
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error)
)

YARA_API.interceptors.response.use(
  (response) => {
    const res = response.data
    if (res.code === 200) return res
    ElMessage?.error?.(res.message || '请求失败，请稍后重试')
    return Promise.reject(new Error(res.message || '请求失败'))
  },
  (error) => {
    const status = error.response?.status
    const message = error.response?.data?.message || error.message
    if (status === 401) {
      YARA_STORAGE.removeToken()
      ElMessage?.error?.('登录已过期，请重新登录')
      setTimeout(() => window.location.href = 'yara-login.html', 1000)
    } else if (status === 403) ElMessage?.error?.('你无权限访问该资源')
    else if (status === 404) ElMessage?.error?.('请求的资源不存在')
    else if (status === 500) ElMessage?.error?.('服务器内部错误')
    else ElMessage?.error?.(message || '网络异常')
    return Promise.reject(error)
  }
)

// ===================== 4. 统一业务接口管理 =====================
window.YARA_API_LIST = {
  login: (data) => YARA_API.post('/auth/login', data),
  register: (data) => YARA_API.post('/auth/register', data),
  sendSmsCode: (data) => YARA_API.post('/auth/send-code', data),
  forgetPassword: (data) => YARA_API.post('/auth/forget-password', data),
  getUserInfo: () => YARA_API.get('/user/info'),
  updateUserInfo: (data) => YARA_API.put('/user/info', data),
  getUserStat: () => YARA_API.get('/user/stat'),
  createOrder: (data) => YARA_API.post('/order/create', data),
  getOrderList: (params) => YARA_API.get('/order/list', { params }),
  getOrderDetail: (id) => YARA_API.get(`/order/detail/${id}`),
  cancelOrder: (id) => YARA_API.put(`/order/cancel/${id}`),
  confirmOrder: (id) => YARA_API.put(`/order/confirm/${id}`),
  refundOrder: (id, data) => YARA_API.post(`/order/refund/${id}`, data),
  commentOrder: (id, data) => YARA_API.post(`/order/comment/${id}`, data),
  getMyCommentList: () => YARA_API.get('/comment/my-list'),
  createPay: (data) => YARA_API.post('/pay/create', data),
  queryPayStatus: (orderNo) => YARA_API.get(`/pay/status/${orderNo}`),
  getVipList: () => YARA_API.get('/vip/list'),
  createVipOrder: (data) => YARA_API.post('/vip/create-order', data),
  getMyVipInfo: () => YARA_API.get('/vip/info'),
  getMyCouponList: (params) => YARA_API.get('/coupon/my-list', { params }),
  getAvailableCouponList: (orderAmount) => YARA_API.get(`/coupon/available?amount=${orderAmount}`),
  getHelpList: (params) => YARA_API.get('/help/list', { params }),
  createTicket: (data) => YARA_API.post('/help/ticket', data),
  uploadFile: (formData) => YARA_API.post(window.YARA_CONFIG?.api?.uploadUrl || 'http://localhost:8080/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

// ===================== 5. 统一支付封装 =====================
window.YARA_PAY = {
  async createPay(orderNo, payType = 'wechat', payScene = 'h5') {
    try {
      const res = await YARA_API_LIST.createPay({ orderNo, payType, payScene })
      const { payUrl, qrCode } = res.data
      if (payType === 'wechat' && payScene === 'qr') this.showPayQrModal(qrCode, orderNo)
      else if (payType === 'wechat' && payScene === 'h5') window.location.href = payUrl
      else if (payType === 'alipay') {
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
        <img src="${qrCode}" alt="支付二维码" width="200" height="200" style="border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);" />
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
      } else ElMessage.warning('未查询到支付结果')
    }).catch(() => ElMessage.info('支付已取消'))
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
      } catch (error) { console.error('查询支付状态失败', error) }
      if (count >= times) {
        clearInterval(timer)
        callback && callback(false)
      }
    }, interval)
  }
}

// ===================== 6. 通用工具函数（新增动效+背景切换） =====================
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
  },
  // 数字滚动动画（统计卡片用）
  animateNumber: (element, target, duration = 2000) => {
    if (!element) return
    const start = 0
    const increment = target / (duration / 16)
    let current = start
    const timer = setInterval(() => {
      current += increment
      if (current >= target) {
        element.textContent = target
        clearInterval(timer)
      } else {
        element.textContent = Math.floor(current)
      }
    }, 16)
  },
  // 页面元素入场动画触发
  initScrollAnimation: () => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('yara-fade-in')
          observer.unobserve(entry.target)
        }
      })
    }, { threshold: 0.1 })
    document.querySelectorAll('.yara-animate-item').forEach(item => {
      observer.observe(item)
    })
  },
  // 背景模版切换初始化
  initBgTheme: () => {
    const theme = YARA_STORAGE.getBgTheme()
    document.documentElement.style.setProperty('--bg-current', YARA_BG_THEMES[theme].css)
  },
  // 全局背景切换器渲染
  renderBgSwitcher: () => {
    const currentTheme = YARA_STORAGE.getBgTheme()
    const switcher = document.createElement('div')
    switcher.className = 'yara-bg-switcher'
    switcher.innerHTML = `
      <div class="yara-bg-option space ${currentTheme === 'space' ? 'active' : ''}" data-theme="space" title="深空主题"></div>
      <div class="yara-bg-option forest ${currentTheme === 'forest' ? 'active' : ''}" data-theme="forest" title="森林主题"></div>
      <div class="yara-bg-option ocean ${currentTheme === 'ocean' ? 'active' : ''}" data-theme="ocean" title="深海主题"></div>
    `
    document.body.appendChild(switcher)
    // 绑定切换事件
    switcher.querySelectorAll('.yara-bg-option').forEach(option => {
      option.addEventListener('click', () => {
        const theme = option.dataset.theme
        YARA_STORAGE.setBgTheme(theme)
        // 更新active状态
        switcher.querySelectorAll('.yara-bg-option').forEach(opt => opt.classList.remove('active'))
        option.classList.add('active')
      })
    })
  },
  // 【新增】全局AI悬浮助手渲染
  renderAIFloatBtn: () => {
    // 避免重复渲染
    if (document.querySelector('.yara-ai-float-wrapper')) return
    const isLogin = YARA_STORAGE.getToken()
    const floatWrapper = document.createElement('div')
    floatWrapper.className = 'yara-ai-float-wrapper'
    floatWrapper.innerHTML = `
      <!-- 悬浮球按钮 -->
      <div class="yara-ai-float-btn" id="yaraAiFloatBtn">
        <el-icon class="chat-icon"><ChatDotRound /></el-icon>
        <el-icon class="close-icon"><Close /></el-icon>
      </div>
      <!-- AI面板（默认隐藏） -->
      <div class="yara-ai-panel" id="yaraAiPanel" style="display: none;">
        <div class="yara-ai-panel-header">
          <h3>Yara AI 智能管家</h3>
          <p>随时为你解答，一键生成派单</p>
        </div>
        <!-- 快捷跳转导航 -->
        <div class="yara-ai-quick-nav">
          <div class="yara-ai-nav-list">
            <div class="yara-ai-nav-item" data-url="index.html">首页</div>
            <div class="yara-ai-nav-item" data-url="yara-index.html">控制台</div>
            <div class="yara-ai-nav-item" data-url="yara-create-order.html">我要派单</div>
            <div class="yara-ai-nav-item" data-url="yara-order-list.html">订单管理</div>
            <div class="yara-ai-nav-item" data-url="yara-price.html">会员中心</div>
            <div class="yara-ai-nav-item" data-url="yara-user-center.html">个人中心</div>
          </div>
        </div>
        <!-- 对话区域 -->
        <div class="yara-ai-panel-messages" id="yaraAiPanelMessages">
          <!-- 对话内容由JS动态渲染 -->
        </div>
        <!-- 输入区域 -->
        <div class="yara-ai-panel-input-area">
          <div class="yara-ai-panel-input-wrapper">
            <input 
              type="text" 
              class="yara-ai-panel-input" 
              id="yaraAiPanelInput" 
              placeholder="输入你的问题，按回车发送..."
            />
            <button class="yara-ai-panel-send-btn" id="yaraAiPanelSendBtn">
              <el-icon><Promotion /></el-icon>
            </button>
          </div>
        </div>
      </div>
    `
    document.body.appendChild(floatWrapper)

    // 绑定事件
    const floatBtn = document.getElementById('yaraAiFloatBtn')
    const aiPanel = document.getElementById('yaraAiPanel')
    const input = document.getElementById('yaraAiPanelInput')
    const sendBtn = document.getElementById('yaraAiPanelSendBtn')
    const messagesContainer = document.getElementById('yaraAiPanelMessages')
    const navItems = document.querySelectorAll('.yara-ai-nav-item')

    // 面板展开/收起
    let panelOpen = false
    floatBtn.addEventListener('click', () => {
      panelOpen = !panelOpen
      if (panelOpen) {
        aiPanel.style.display = 'flex'
        floatBtn.classList.add('active')
        renderAiMessages() // 渲染历史对话
        setTimeout(() => messagesContainer.scrollTop = messagesContainer.scrollHeight, 100)
      } else {
        aiPanel.style.display = 'none'
        floatBtn.classList.remove('active')
      }
    })

    // 快捷跳转导航事件
    navItems.forEach(item => {
      item.addEventListener('click', () => {
        const url = item.dataset.url
        window.location.href = url
      })
    })

    // 发送消息函数
    const sendAiMessage = async () => {
      const text = input.value.trim()
      if (!text || !YARA_AI_CONFIG.API_KEY) return
      if (!isLogin) {
        ElMessage.warning('请先登录后再使用AI对话功能')
        setTimeout(() => window.location.href = 'yara-login.html', 1000)
        return
      }

      // 清空输入框
      input.value = ''
      // 添加用户消息
      YARA_GLOBAL_AI_HISTORY.push({ id: YARA_GLOBAL_AI_CHAT_ID++, role: 'user', content: text })
      renderAiMessages()
      messagesContainer.scrollTop = messagesContainer.scrollHeight

      // 生成AI回复
      const tempId = YARA_GLOBAL_AI_CHAT_ID++
      YARA_GLOBAL_AI_HISTORY.push({ id: tempId, role: 'assistant', content: '' })
      renderAiMessages()

      const messages = [
        { role: 'system', content: YARA_AI_CONFIG.SYSTEM_PROMPT },
        ...YARA_GLOBAL_AI_HISTORY.map(msg => ({ role: msg.role, content: msg.content }))
      ]

      try {
        const res = await fetch(YARA_AI_CONFIG.API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + YARA_AI_CONFIG.API_KEY
          },
          body: JSON.stringify({ model: YARA_AI_CONFIG.MODEL, messages, temperature: 0.7, stream: true })
        })
        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let fullContent = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          const chunk = decoder.decode(value)
          const lines = chunk.split('\n').filter(line => line.trim())
          
          for (const line of lines) {
            if (!line.startsWith('data: ')) continue
            const dataStr = line.slice(6)
            if (dataStr === '[DONE]') continue
            try {
              const data = JSON.parse(dataStr)
              const content = data.choices[0]?.delta?.content || ''
              fullContent += content
              const index = YARA_GLOBAL_AI_HISTORY.findIndex(item => item.id === tempId)
              if (index !== -1) YARA_GLOBAL_AI_HISTORY[index].content = fullContent
              renderAiMessages()
              messagesContainer.scrollTop = messagesContainer.scrollHeight
            } catch (e) {}
          }
        }
      } catch (e) {
        ElMessage.error('AI请求失败：' + e.message)
        console.error('AI请求错误', e)
      }
    }

    // 渲染对话内容
    const renderAiMessages = () => {
      messagesContainer.innerHTML = ''
      YARA_GLOBAL_AI_HISTORY.forEach(msg => {
        const msgDiv = document.createElement('div')
        msgDiv.className = `yara-ai-panel-message ${msg.role}`
        msgDiv.innerHTML = `
          <div class="yara-ai-panel-message-avatar">${msg.role === 'user' ? '我' : 'AI'}</div>
          <div class="yara-ai-panel-message-content">
            ${msg.content}
            ${msg.role === 'assistant' ? `<a class="yara-ai-fill-btn" style="color: var(--yara-brand-green);" data-content="${encodeURIComponent(msg.content)}">一键生成派单</a>` : ''}
          </div>
        `
        messagesContainer.appendChild(msgDiv)
      })

      // 绑定一键生成派单事件
      document.querySelectorAll('.yara-ai-fill-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation()
          const content = decodeURIComponent(btn.dataset.content)
          let autoType = ''
          if (content.includes('事业') || content.includes('职业') || content.includes('职场') || content.includes('创业')) autoType = 'career'
          else if (content.includes('情感') || content.includes('恋爱') || content.includes('婚姻') || content.includes('分手')) autoType = 'emotion'
          else if (content.includes('生活') || content.includes('跑腿') || content.includes('代办')) autoType = 'life'
          else if (content.includes('游戏') || content.includes('陪玩') || content.includes('上分')) autoType = 'game'
          
          sessionStorage.setItem('yara_auto_fill_order', JSON.stringify({
            type: autoType,
            title: `【AI生成】${content.slice(0, 30)}...`,
            description: content
          }))
          window.location.href = autoType ? `./yara-create-order.html?type=${autoType}` : './yara-create-order.html'
        })
      })
    }

    // 绑定发送事件
    sendBtn.addEventListener('click', sendAiMessage)
    input.addEventListener('keydown.enter', (e) => {
      e.preventDefault()
      sendAiMessage()
    })

    // 点击页面其他区域关闭面板
    document.addEventListener('click', (e) => {
      if (!floatWrapper.contains(e.target) && panelOpen) {
        panelOpen = false
        aiPanel.style.display = 'none'
        floatBtn.classList.remove('active')
      }
    })
  }
}

// ===================== 7. DOM加载完成后执行的初始化逻辑 =====================
window.addEventListener('DOMContentLoaded', () => {
  // 初始化背景主题
  YARA_UTILS.initBgTheme()
  // 渲染背景切换器
  YARA_UTILS.renderBgSwitcher()
  // 【新增】渲染全局AI悬浮按钮
  YARA_UTILS.renderAIFloatBtn()
  
  if (!window.YARA_CONFIG) {
    console.error('Yara 配置文件加载失败，请检查yara-config.js是否正确引入')
    return
  }
  // 订单类型映射
  window.YARA_ORDER_TYPE = {}
  YARA_CONFIG.service.types.forEach(item => {
    window.YARA_ORDER_TYPE[item.value] = item.label
  })
  // 全局事件绑定
  document.querySelectorAll('.yara-logout-btn').forEach(btn => {
    btn.addEventListener('click', () => YARA_AUTH.logout())
  })
  document.querySelectorAll('.yara-back-home').forEach(btn => {
    btn.addEventListener('click', () => window.location.href = 'index.html')
  })
  // 初始化入场动画
  YARA_UTILS.initScrollAnimation()
  // 权限校验
  YARA_AUTH.checkAuth()
})
