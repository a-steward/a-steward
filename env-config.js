// 全局环境配置（所有页面优先加载，敏感配置请妥善保管）
window.ENV_CONFIG = {
  // AI接口配置（已为你填好AccessKey，直接可用）
  AI_API_URL: "https://ark.cn-beijing.volces.com/api/v3/chat/completions",
  AI_MODEL: "doubao-1-5-pro-32k-250115",
  AI_API_KEY: "AKLTZTYwZWNmMTNhNjU0NDc0YThhMWQyZjMxMjU1M2YzZTE:WldKaFpESXhNV1ppWWpNNE5HRTJORGxrT0RZd1l6Z3hNR1kyTVdReVlUUQ==",

  // 后端API基础地址（纯静态页面无需修改，有后端服务再替换成你的接口地址）
  API_BASE_URL: "http://localhost:8080",
  // 文件上传接口地址
  UPLOAD_URL: "http://localhost:8080/upload"
}
