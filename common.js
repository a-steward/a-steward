function getUser() {
  return JSON.parse(localStorage.getItem('user') || '{"avatar":"","account":"","pwd":"","name":"","agreed":false}');
}
function saveUser(user) {
  localStorage.setItem('user', JSON.stringify(user));
}
function isAgreed() { return getUser().agreed === true; }
function isLogin() { return localStorage.getItem('token') === 'login'; }
function logout() { localStorage.removeItem('token'); location.href = 'login.html'; }
function checkLogin() { if (!isLogin()) location.href = 'login.html'; }
function checkAuth() {
  if (!isLogin()) { alert('请先登录！'); location.href = 'login.html'; return; }
  if (!isAgreed()) { alert('请先注册并同意协议！'); location.href = 'register.html'; return; }
  if (!isRealNameCertified()) { alert('请先完成实名认证！'); location.href = 'user.html'; return; }
}
function initDarkMode() {
  if (localStorage.getItem('dark') === '1') document.documentElement.classList.add('dark');
}
function toggleDark() {
  document.documentElement.classList.toggle('dark');
  localStorage.setItem('dark', document.documentElement.classList.contains('dark') ? '1' : '0');
}
function uploadAvatar(e) {
  const f = e.target.files[0]; if(!f) return;
  const r = new FileReader();
  r.onload = e=>{ let u=getUser(); u.avatar=e.target.result; saveUser(u); location.reload(); };
  r.readAsDataURL(f);
}
function getRealNameInfo() {
  return JSON.parse(localStorage.getItem('realname') || '{"realName":"","idCard":"","certified":false}');
}
function saveRealNameInfo(info) { localStorage.setItem('realname', JSON.stringify(info)); }
function isRealNameCertified() { return getRealNameInfo().certified === true; }
function getIdCardBirthday(idCard) {
  if (!idCard || idCard.length !== 18) return null;
  let y = idCard.slice(6,10), m = idCard.slice(10,12), d = idCard.slice(12,14);
  return `${y}-${m}-${d}`;
}
function submitRealNameSimple() {
  let realName = prompt('请输入真实姓名');
  if (!realName || realName.length < 2) return alert('请输入正确姓名');
  let idCard = prompt('请输入18位身份证号');
  if (!idCard || idCard.length !== 18) return alert('请输入18位身份证');
  saveRealNameInfo({ realName, idCard, certified:true });
  alert('实名认证完成！系统已自动记录您的生日');
}
function checkAutoBirthdayWish() {
  let cert = getRealNameInfo();
  if (!cert.certified || !cert.idCard) return;
  let birthday = getIdCardBirthday(cert.idCard);
  if(!birthday) return;
  if(new Date().toISOString().slice(0,10) === birthday) {
    alert(`🎉 生日快乐 ${cert.realName}！愿您平安喜乐，万事顺遂！`);
  }
}
function getAIMemorySimple() {
  return JSON.parse(localStorage.getItem('ai_mem') || '{"habit":"无","favor":"无"}');
}
function saveAIMemorySimple(m){ localStorage.setItem('ai_mem',JSON.stringify(m)); }
function setHabitSimple(t){ let m=getAIMemorySimple(); m.habit=t; saveAIMemorySimple(m); }
function setFavorSimple(t){ let m=getAIMemorySimple(); m.favor=t; saveAIMemorySimple(m); }
function getTasks() {
  return JSON.parse(localStorage.getItem('tasks') || JSON.stringify([
    { name:"每日签到", done:false, img:"", requiredImg:true },
    { name:"使用AI功能", done:false, img:"", requiredImg:true }
  ]));
}
function saveTasks(t){ localStorage.setItem('tasks',JSON.stringify(t)); }
function checkImageValid(file) {
  const maxSize = 5 * 1024 * 1024;
  const allowTypes = ['image/jpeg','image/png','image/jpg'];
  if(!allowTypes.includes(file.type)) { alert('仅支持JPG/PNG！'); return false; }
  if(file.size > maxSize) { alert('图片≤5M！'); return false; }
  return true;
}
function uploadTaskImg(index, e) {
  const file = e.target.files[0];
  if(!checkImageValid(file)) return;
  const reader = new FileReader();
  reader.onload = ev => {
    let tasks = getTasks();
    tasks[index].img = ev.target.result;
    tasks[index].done = true;
    saveTasks(tasks);
    alert('上传成功，任务完成！');
    renderTasks();
  };
  reader.readAsDataURL(file);
}
function getTaskRate() {
  let tasks = getTasks();
  let total = tasks.length;
  let done = tasks.filter(t=>t.done).length;
  return total === 0 ? 100 : Math.round((done/total)*100);
}
