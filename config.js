// ===================== Yara 全平台统一配置 =====================
// 上线前仅需修改此处，全平台自动同步，其他代码无需改动
// 100%不影响你的原有项目代码
window.YARA_CONFIG = {
  // ========== 1. 品牌基础配置 ==========
  brand: {
    name: 'Yara',
    fullName: 'Yara AI智能派单平台',
    slogan: '一站式全场景智能派单服务，精准匹配你的需求',
    logo: '', // 替换为你的品牌logo图片路径
    brandColor: '#409EFF', // 主品牌色，一键修改全平台主题
    customerService: {
      wechat: 'Yara001', // 客服微信
      phone: '400-123-4567', // 客服电话
      workTime: '周一至周日 9:00-22:00',
      onlineUrl: '#' // 在线客服链接
    },
    icp: '鲁ICP备12345678号-1', // 你的ICP备案号（商用必备）
    policeRecord: '鲁公网安备12345678号' // 公安备案号（商用必备）
  },

  // ========== 2. 后端接口配置 ==========
  api: {
    baseUrl: 'http://localhost:8080', // 你的后端接口地址，上线替换为正式域名
    timeout: 15000,
    uploadUrl: 'http://localhost:8080/upload' // 文件上传接口地址
  },

  // ========== 3. 支付配置（商用上线替换为你的正式商户信息） ==========
  pay: {
    wechat: {
      mchId: '1234567890',
      appId: 'wx1234567890abcdef',
      payUrl: 'http://localhost:8080/pay/wechat'
    },
    alipay: {
      appId: '2021000012345678',
      payUrl: 'http://localhost:8080/pay/alipay'
    }
  },

  // ========== 4. 服务与定价配置 ==========
  service: {
    types: [
      { value: 'career', label: '事业咨询', price: 199, desc: '职业规划、职场问题、创业指导', icon: 'OfficeBuilding', bgColor: '#409EFF' },
      { value: 'emotion', label: '情感咨询', price: 299, desc: '恋爱指导、婚姻修复、情绪疏导', icon: 'Heart', bgColor: '#F56C6C' },
      { value: 'life', label: '生活服务', price: 99, desc: '生活规划、跑腿代办、技能教学', icon: 'HomeFilled', bgColor: '#67C23A' },
      { value: 'game', label: '游戏陪玩', price: 39, desc: '游戏陪练、段位上分、玩法教学', icon: 'VideoPlay', bgColor: '#9B59B6' }
    ],
    vip: [
      { name: '月卡', price: 39, originalPrice: 59, days: 30, rights: ['下单9折优惠', '优先接单', '专属客服'] },
      { name: '季卡', price: 99, originalPrice: 179, days: 90, rights: ['下单8折优惠', '优先接单', '专属客服', '免费咨询2次'] },
      { name: '年卡', price: 299, originalPrice: 699, days: 365, rights: ['下单7折优惠', '置顶派单', '1v1专属顾问', '免费咨询10次', '专属优惠券'] }
    ]
  },

  // ========== 5. 运营配置 ==========
  operation: {
    banners: [
      { img: 'https://picsum.photos/1200/180?random=1', title: '新人首单立减50元', url: 'yara-price.html' },
      { img: 'https://picsum.photos/1200/180?random=2', title: '会员年卡限时299元', url: 'yara-price.html' },
      { img: 'https://picsum.photos/1200/180?random=3', title: '情感咨询专属优惠', url: 'yara-create-order.html?type=emotion' }
    ],
    notice: '【重要通知】平台全新升级，新增会员体系，下单享更低价格！',
    stat: {
      baidu: '', // 百度统计ID
      umeng: '' // 友盟统计ID
    }
  }
}

// 品牌色全局注入，一键修改全平台主题
document.documentElement.style.setProperty('--yara-brand-color', window.YARA_CONFIG.brand.brandColor)
