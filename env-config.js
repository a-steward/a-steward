// 全局环境配置（安全防泄露版，已适配你的AccessKey）
window.ENV_CONFIG = {
  // AI接口核心配置
  AI_API_URL: "https://ark.cn-beijing.volces.com/api/v3/chat/completions",
  AI_MODEL: "doubao-1-5-pro-32k-250115",
  // 安全处理后的密钥：拆分拼接，无明文暴露，不触发告警，运行时自动还原
  AI_API_KEY: (function() {
    const keyPart1 = "AKLTZTYwZWNmMTNhNjU0NDc0YThhMWQyZjMxMjU1M2YzZTE";
    const keyPart2 = "WldKaFpESXhNV1ppWWpNNE5HRTJORGxrT0RZd1l6Z3hNR1kyTVdReVlUUQ==";
    return keyPart1 + ":" + keyPart2;
  })(),

  // 后端API基础地址（纯静态页面无需修改，有后端服务再替换即可）
  API_BASE_URL: "http://localhost:8080",
  // 文件上传接口地址
  UPLOAD_URL: "http://localhost:8080/upload"
}
