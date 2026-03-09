// Yara 运营统计工具
window.YARA_STAT = {
  // 页面访问统计
  pageView(pageName) {
    console.log(`页面访问：${pageName}`)
    // 百度统计
    if (window._hmt && YARA_CONFIG.operation.stat.baidu) {
      window._hmt.push(['_trackPageview', window.location.pathname])
    }
    // 友盟统计
    if (window.umeng && YARA_CONFIG.operation.stat.umeng) {
      window.umeng.trackEvent('page_view', { page: pageName })
    }
  },

  // 事件统计
  trackEvent(eventName, params = {}) {
    console.log(`事件触发：${eventName}`, params)
    if (window.umeng && YARA_CONFIG.operation.stat.umeng) {
      window.umeng.trackEvent(eventName, params)
    }
  }
}

