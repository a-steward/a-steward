// ===================== Yara 敏感信息安全配置 =====================
// 【重要】此文件必须加入.gitignore，绝对禁止提交到Git仓库！
// 此处填写你重置后的全新支付凭证，禁止使用之前已泄漏的旧密钥/旧ID
window.ENV_CONFIG = {
  // 微信支付正式商户信息【上线必改，替换为你的真实信息】
  WECHAT_MCH_ID: '你的微信支付商户号',
  WECHAT_APP_ID: '你的微信支付全新App ID',
  WECHAT_PAY_URL: 'http://localhost:8080/pay/wechat', // 上线替换为正式支付接口地址

  // 支付宝支付正式商户信息【按需填写，替换为你的真实信息】
  ALIPAY_APP_ID: '你的支付宝App ID',
  ALIPAY_PAY_URL: 'http://localhost:8080/pay/alipay' // 上线替换为正式支付接口地址
}

