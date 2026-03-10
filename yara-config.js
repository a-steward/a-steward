// Yara 全局业务配置（所有页面通用，修改后全平台生效）
window.YARA_CONFIG = {
  // 品牌信息配置
  brand: {
    name: "Yara",
    fullName: "Yara AI智能派单平台",
    icp: "你的ICP备案号",
    policeRecord: "你的公安备案号",
    customerService: {
      phone: "400-123-4567",
      workTime: "周一至周日 9:00-22:00"
    }
  },
  // API接口配置
  api: {
    baseUrl: window.ENV_CONFIG.API_BASE_URL,
    timeout: 15000,
    uploadUrl: window.ENV_CONFIG.UPLOAD_URL
  },
  // 服务类型配置
  service: {
    types: [
      { value: "career", label: "事业规划", icon: "TrendCharts", price: 99, desc: "职业规划、职场咨询、创业指导、副业规划" },
      { value: "emotion", label: "情感咨询", icon: "Heart", price: 89, desc: "恋爱指导、婚姻咨询、分手挽回、情绪疏导" },
      { value: "life", label: "生活服务", icon: "HomeFilled", price: 59, desc: "跑腿代办、生活规划、技能教学、同城服务" },
      { value: "game", label: "游戏陪玩", icon: "VideoPlay", price: 39, desc: "游戏陪玩、上分代练、攻略教学、娱乐开黑" }
    ],
    // VIP会员套餐配置
    vip: [
      {
        name: "月卡会员",
        days: 30,
        price: 29,
        originalPrice: 59,
        rights: ["下单享8折优惠", "优先接单匹配", "每月2次免费咨询", "专属客服"]
      },
      {
        name: "季卡会员",
        days: 90,
        price: 79,
        originalPrice: 179,
        rights: ["下单享7.5折优惠", "优先接单匹配", "每月5次免费咨询", "专属客服", "专属优惠券礼包"]
      },
      {
        name: "年卡会员",
        days: 365,
        price: 199,
        originalPrice: 599,
        rights: ["下单享7折优惠", "优先接单匹配", "每月10次免费咨询", "1v1专属客服", "专属大额优惠券", "专属活动优先参与"]
      }
    ]
  }
}
