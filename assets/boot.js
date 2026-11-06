// Let a previous offline worker finish installing the complete new module set
// before importing an entry point that depends on it. Keep old public caches
// intact if connectivity is lost during the upgrade.
const build='campaign-v1';
const status=document.querySelector('#boot-state');
let language='vi';try{language=localStorage.getItem('oceo-language')||'vi';}catch{}
const copy={
 vi:['Đang mở Óc Eo…','Đang chuẩn bị phiên bản mới…','Chưa tải xong. Giữ kết nối và thử mở lại.','Tải lại'],
 en:['Opening Óc Eo…','Preparing the latest version…','Loading is incomplete. Stay connected and try again.','Reload'],
 zh:['正在打开Óc Eo…','正在准备新版本…','加载尚未完成，请保持联网后重试。','重新加载'],
}[language]||['Đang mở Óc Eo…','Đang chuẩn bị phiên bản mới…','Chưa tải xong. Giữ kết nối và thử mở lại.','Tải lại'];
function message(text){if(status){status.hidden=false;status.textContent=text;}}
async function waitForActivation(worker){
 if(!worker||worker.state==='activated'||worker.state==='redundant')return;
 message(copy[1]);
 await new Promise(resolve=>{
  const check=()=>{if(['activated','redundant'].includes(worker.state)){worker.removeEventListener('statechange',check);resolve();}};
  worker.addEventListener('statechange',check);check();
 });
}
try{
 message(copy[0]);
 if('serviceWorker' in navigator){
  try{
   const hadController=!!navigator.serviceWorker.controller;
   const registration=await navigator.serviceWorker.register(new URL('../sw.js',import.meta.url));
   if(hadController){
    try{await registration.update();}catch{/* An installed complete version can still open offline. */}
    await waitForActivation(registration.installing||registration.waiting);
   }
  }catch{/* Browsers that block workers can run from ordinary static assets. */}
 }
 const app=await import('./app.js');
 if(app.APP_BUILD!==build)throw Error('incomplete app version');
 if(status)status.hidden=true;
}catch{
 message(copy[2]);
 if(status){const retry=document.createElement('button');retry.type='button';retry.textContent=copy[3];retry.onclick=()=>location.reload();status.append(retry);}
}
