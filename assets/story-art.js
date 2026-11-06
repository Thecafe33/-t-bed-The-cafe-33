import {appURL} from './app-paths.js';
import {HERITAGE_IMAGES,heritageGraphic,heritageSymbol} from './heritage-symbols.js';
import {stampOutline} from './stamp-shape.js';

export const STORY_COPY={
 title:['Óc Eo, có dấu tôi.','Óc Eo, my own impression.','Óc Eo，留下我的印记。'],
 intro:['Chọn điểm đã nhận tem, thêm ảnh của bạn và tạo một story mang dấu riêng.','Choose an earned stop, add your own photo and make a story of your own.','选择已获得印章的地点，加入自己的照片，制作专属故事。'],
 single:['Một điểm nổi bật','One featured stop','一个精选地点'],trip:['Tối đa 3 tem đã có','Up to 3 earned stamps','最多3枚已获得的印章'],
 point:['Điểm muốn kể','Your featured stop','想分享的地点'],photo:['Thêm ảnh của bạn','Add your photo','添加你的照片'],
 remove:['Bỏ ảnh này','Remove photo','移除此照片'],fit:['Cách đặt ảnh','Photo framing','照片布局'],cover:['Phủ kín khung','Fill the frame','填满画框'],contain:['Giữ trọn ảnh','Show the whole photo','显示完整照片'],
 focalX:['Tâm ảnh ngang','Horizontal focus','水平位置'],focalY:['Tâm ảnh dọc','Vertical focus','垂直位置'],
 name:['Tên trên story','Name on your story','故事上的姓名'],nameHint:['Bạn muốn được gọi là gì?','What should we call you?','你希望如何称呼？'],
 caption:['Một câu của bạn','Your own words','写下你的话'],captionHint:['Điều gì ở Óc Eo khiến bạn muốn kể?','What about Óc Eo would you like to share?','Óc Eo有什么让你想分享？'],
 fact:['Thêm một chi tiết có nguồn','Include a sourced detail','加入有来源的小知识'],
 privacy:['Ảnh chỉ được xử lý trên thiết bị, không tải lên máy chủ.','Your photo is processed on this device and is not uploaded.','照片仅在此设备处理，不会上传。'],
 earlier:['Tem có thể đến từ những lần ghé trước. Ảnh không xác nhận bạn đã đi hết hành trình trong ngày.','Stamps may come from earlier visits. This image does not confirm a one-day itinerary was completed.','印章可能来自以往的到访。此图片不证明已在一天内完成行程。'],
 noPhoto:['Không thêm ảnh vẫn tạo được story bằng chữ và tem.','You can also create a story with words and stamps, without a photo.','不添加照片，也能用文字和印章制作故事。'],
 preview:['Ảnh story xem trước','Story image preview','故事图片预览'],rendering:['Đang chuẩn bị ảnh…','Preparing your image…','正在生成图片…'],ready:['Ảnh đã sẵn sàng · 1080 × 1920','Your image is ready · 1080 × 1920','图片已就绪 · 1080 × 1920'],
 options:['Chỉnh ảnh, tên và tem','Edit photo, name and stamps','调整照片、姓名和印章'],
 demo:['ẢNH MẪU','SAMPLE','示例'],demoPoint:['ĐIỂM MINH HOẠ','ILLUSTRATED STOP','示例地点'],demoNote:['ẢNH MẪU · KHÔNG XÁC NHẬN CHECK-IN','SAMPLE IMAGE · NO CHECK-IN CONFIRMATION','示例图片 · 不证明已签到'],
 source:['Xem tư liệu gốc ↗','Read the original source ↗','查看原始资料 ↗'],
 download:['Lưu ảnh PNG','Save PNG image','保存PNG图片'],share:['Mở bảng chia sẻ','Open share sheet','打开分享面板'],copy:['Sao chép link hành trình','Copy itinerary link','复制行程链接'],close:['Trở về','Go back','返回'],
 photoError:['Chưa đọc được ảnh này. Hãy thử JPEG, PNG hoặc WebP khác.','This image could not be read. Try another JPEG, PNG or WebP.','无法读取此图片，请换用JPEG、PNG或WebP。'],
 sizeError:['Ảnh tối đa 20 MB. Hãy chọn ảnh nhỏ hơn.','Choose a photo no larger than 20 MB.','请选择不超过20MB的照片。'],
 dimensionsError:['Ảnh có kích thước quá lớn để xử lý trên thiết bị. Hãy chọn bản nhỏ hơn.','This image is too large to process on this device. Choose a smaller copy.','此图片尺寸过大，请选择较小的版本。'],
 exportError:['Chưa tạo được ảnh. Bạn có thể thử lại.','The image could not be created. Please try again.','暂时无法生成图片，请重试。'],
 saved:['Đã mở tải ảnh. Trên iPhone, nếu ảnh mở ra, nhấn giữ hoặc chọn Chia sẻ → Lưu hình ảnh.','The download has opened. On iPhone, if the image opens, hold it or use Share → Save Image.','已打开下载。如iPhone显示图片，可长按或选择分享→存储图像。'],
 shareOpened:['Đã chuyển sang bảng chia sẻ. Hãy kiểm tra trong ứng dụng bạn chọn.','The share sheet has handled your image. Check the app you selected.','图片已交给分享面板，请在所选应用中确认。'],
 shareFallback:['Trình duyệt chưa chia sẻ được file ảnh. Đã mở tải PNG; bạn có thể sao chép link bên cạnh.','This browser cannot share an image file. The PNG download has opened; you can also copy the link.','此浏览器无法分享图片文件，已打开PNG下载，也可复制旁边的链接。'],
 copied:['Đã sao chép link hành trình.','Itinerary link copied.','已复制行程链接。'],copyError:['Chưa sao chép được. Bạn có thể chọn link bên dưới để chép thủ công.','Could not copy the link. Select the link below to copy it manually.','无法自动复制，可选择下方链接手动复制。'],
 noStamps:['Bạn cần có ít nhất một tem đã nhận để tạo story này.','Earn at least one stamp to create this story.','至少获得一枚印章后即可制作此故事。'],
 selected:['ĐIỂM ĐÃ NHẬN TEM','A STOP IN MY COLLECTION','已获得印章的地点'],unnamed:['Một người vừa chạm Óc Eo','An Óc Eo explorer','一位Óc Eo探索者'],
 defaultCaption:['Chạm di sản. Kể Óc Eo theo cách của mình.','Meet heritage. Share Óc Eo in your own way.','感受遗产，用自己的方式分享Óc Eo。'],
 stamps:['TEM TRONG ẢNH','STAMPS IN THIS IMAGE','图片中的印章'],illustration:['TEM MINH HOẠ DI SẢN ÓC EO','ÓC EO HERITAGE STAMP ILLUSTRATIONS','Óc Eo遗产印章插画'],
 ownPhoto:['ẢNH DO BẠN CHỌN','YOUR OWN PHOTO','你选择的照片'],artOnly:['MINH HOẠ CẢM HỨNG HIỆN VẬT','OBJECT-INSPIRED ILLUSTRATION','以文物为灵感的插画'],
 linkLead:['Đi Óc Eo theo hành trình này','Explore this Óc Eo itinerary','探索这条Óc Eo行程'],
 shareNote:['Tải ảnh hoặc mở bảng chia sẻ không có nghĩa bài đã được đăng lên mạng xã hội.','Saving an image or opening the share sheet does not confirm a social post was published.','保存图片或打开分享面板，不代表已发布社交帖子。'],
};
const FACTS={
 'go-giong-cat':['Nhẫn Nandin Giồng Cát được tìm thấy trong khai quật năm 2018.','The Giồng Cát Nandin ring was found in the 2018 excavation.','Giồng Cát的Nandin戒指于2018年发掘出土。'],
 'linh-son-bac':['Phù điêu Phật Linh Sơn Bắc được tìm thấy trong khai quật năm 2019.','The Linh Sơn Bắc Buddha relief was found in the 2019 excavation.','Linh Sơn Bắc佛像浮雕于2019年发掘出土。'],
 'nha-trung-bay-van-hoa-oc-eo':['Tư liệu Ban Quản lý ghi nhận phù điêu Phật Linh Sơn Bắc tại nhà trưng bày.','The authority’s source records the Linh Sơn Bắc relief at the exhibition house.','管理机构资料记录Linh Sơn Bắc佛像浮雕曾在展馆展出。'],
 'chua-linh-son':['Nguồn ghi bộ Linga–Yoni Linh Sơn được tìm thấy phía đông khu vực chùa năm 1985.','The source records the Linh Sơn Linga–Yoni east of the temple area in 1985.','来源记录Linh Sơn林伽–约尼于1985年在寺院区域东侧发现。'],
 'linh-son-nam':['Tư liệu đối chiếu mộ vò Linh Sơn Nam với mộ vò Gò Cây Trâm; cách đậy miệng khác nhau.','Sources compare the jar burials at Linh Sơn Nam and Gò Cây Trâm; their closures differ.','资料对比Linh Sơn Nam与Gò Cây Trâm瓮棺，两者盖口方式不同。'],
 'go-cay-tram':['Mộ vò Gò Cây Trâm có bình và nắp riêng, được ghi nhận trong khai quật 2018–2019.','Gò Cây Trâm’s jar burial has a separate lid and was recorded in the 2018–2019 excavations.','Gò Cây Trâm瓮棺有独立的盖，记录于2018至2019年的发掘。'],
};
export const storyMessages=[...Object.values(STORY_COPY),...Object.values(FACTS)];
export const storyText=(key,locale='vi')=>(STORY_COPY[key]||['','',''])[({vi:0,en:1,zh:2}[locale]||0)];
export const storyFact=(place,locale='vi')=>FACTS[place?.id]?.[({vi:0,en:1,zh:2}[locale]||0)]||'';
export const storyFactSource=place=>FACTS[place?.id]?heritageSymbol(place).sourceUrl||'':'';
const INK='#203d34',PAPER='#fbf8ef';
const imageCache=new Map();
const toDataURL=blob=>new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(blob);});
async function symbolImage(place){
 const key=heritageSymbol(place).key;
 if(!imageCache.has(key))imageCache.set(key,(async()=>{
  const images={};if(HERITAGE_IMAGES[key])try{const response=await fetch(appURL(HERITAGE_IMAGES[key]),{credentials:'omit'});if(response.ok)images[key]=await toDataURL(await response.blob());}catch{/* Use the source-led line illustration offline. */}
  const source=`<svg xmlns="http://www.w3.org/2000/svg" width="340" height="360" viewBox="0 0 170 180" color="${INK}">${heritageGraphic(key,{images})}</svg>`;
  const image=new Image();image.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(source);await image.decode();return image;
 })().catch(()=>{imageCache.delete(key);return null;}));
 return imageCache.get(key);
}
const family='"Be Vietnam",TownwalkSC,Arial,sans-serif';
function wrapped(ctx,value,width){
 const result=[];let line='';
 for(const char of Array.from(String(value).replace(/\r/g,''))){
  if(char==='\n'){result.push(line.trim());line='';continue;}
  const next=line+char;if(ctx.measureText(next).width<=width||!line){line=next;continue;}
  const space=line.lastIndexOf(' ');if(space>0){result.push(line.slice(0,space).trim());line=line.slice(space+1)+char;}else{result.push(line.trim());line=char;}
 }
 if(line.trim())result.push(line.trim());return result;
}
function textBox(ctx,value,{x,y,width,size=32,minSize=24,maxLines=3,lineHeight=1.3,weight=500,color=INK,align='left'}={}){
 let rows=[];for(;size>=minSize;size--){ctx.font=`${weight} ${size}px ${family}`;rows=wrapped(ctx,value,width);if(rows.length<=maxLines)break;}
 size=Math.max(size,minSize);ctx.font=`${weight} ${size}px ${family}`;
 if(rows.length>maxLines){rows=rows.slice(0,maxLines);let last=rows.at(-1);while(last&&ctx.measureText(last+'…').width>width)last=Array.from(last).slice(0,-1).join('');rows[rows.length-1]=last+'…';}
 ctx.fillStyle=color;ctx.textAlign=align;ctx.textBaseline='top';rows.forEach((line,i)=>ctx.fillText(line,x,y+i*size*lineHeight));return rows.length*size*lineHeight;
}
function stamp(ctx,place,image,x,y,w,h,locale,index=0){
 const path=new Path2D(stampOutline(w,h));ctx.save();ctx.translate(x,y);ctx.fillStyle='#203d3419';ctx.translate(3,4);ctx.fill(path);ctx.translate(-3,-4);ctx.fillStyle=['#dfe8c6','#e2daf5','#f6e4a8'][index%3];ctx.fill(path);ctx.clip(path);
 textBox(ctx,'ÓC EO',{x:19,y:18,width:w-38,size:15,minSize:15,maxLines:1,weight:800});
 if(image)containImage(ctx,image,30,38,w-60,Math.max(80,h-125));
 textBox(ctx,place.name,{x:w/2,y:h-75,width:w-35,size:21,minSize:16,maxLines:2,weight:800,align:'center'});ctx.restore();
}
function containImage(ctx,image,x,y,w,h){
 const iw=image.naturalWidth||image.width,ih=image.naturalHeight||image.height,scale=Math.min(w/iw,h/ih),dw=iw*scale,dh=ih*scale;
 ctx.drawImage(image,x+(w-dw)/2,y+(h-dh)/2,dw,dh);
}
/** Raster-only user content: no external photo URLs, metadata or profile identifiers. */
export async function renderStoryArtwork({photo=null,places,featured,name='',caption='',locale='vi',fit='cover',focusX=.5,focusY=.5,includeFact=true,journeyURL='',demo=false}){
 const fontText=[name,caption,featured.name,...places.map(p=>p.name),...Object.keys(STORY_COPY).map(key=>storyText(key,locale)),storyFact(featured,locale)].join(' ');
 await Promise.allSettled([document.fonts?.load(`800 64px ${family}`,fontText),document.fonts?.load(`500 34px ${family}`,fontText)]);
 if(document.fonts)await document.fonts.ready;
 const symbols=await Promise.all(places.map(symbolImage));
 const canvas=document.createElement('canvas');canvas.width=1080;canvas.height=1920;const ctx=canvas.getContext('2d');if(!ctx)throw Error('canvas unavailable');
 ctx.fillStyle=photo?INK:'#e2daf5';ctx.fillRect(0,0,1080,1920);
 const topInk=photo?PAPER:INK;
 if(photo){
  const frameH=1100,scale=fit==='contain'?Math.min(1080/photo.width,frameH/photo.height):Math.max(1080/photo.width,frameH/photo.height),w=photo.width*scale,h=photo.height*scale;
  ctx.save();ctx.beginPath();ctx.rect(0,0,1080,frameH);ctx.clip();ctx.drawImage(photo,(1080-w)*focusX,(frameH-h)*focusY,w,h);ctx.restore();
 }else{
  const picture=await symbolImage(featured);if(picture)containImage(ctx,picture,280,290,520,610);
 }
 if(photo){const shade=ctx.createLinearGradient(0,0,0,470);shade.addColorStop(0,'#000000a8');shade.addColorStop(1,'#00000000');ctx.fillStyle=shade;ctx.fillRect(0,0,1080,470);
 const bottom=ctx.createLinearGradient(0,800,0,1100);bottom.addColorStop(0,'#00000000');bottom.addColorStop(1,'#000000ba');ctx.fillStyle=bottom;ctx.fillRect(0,800,1080,300);}
 textBox(ctx,'ÓC EO.',{x:62,y:118,width:950,size:122,minSize:122,maxLines:1,weight:800,color:topInk});
 if(demo){ctx.fillStyle='#f6e4a8';ctx.fillRect(790,130,225,67);textBox(ctx,storyText('demo',locale),{x:902,y:149,width:205,size:27,minSize:23,maxLines:1,weight:800,align:'center'});}
 textBox(ctx,storyText('title',locale),{x:70,y:262,width:930,size:27,minSize:24,maxLines:1,color:topInk});
 textBox(ctx,storyText(demo?'demoPoint':'selected',locale),{x:66,y:925,width:948,size:19,minSize:18,maxLines:1,color:topInk,weight:800});
 textBox(ctx,featured.name,{x:62,y:968,width:950,size:46,minSize:30,maxLines:2,color:topInk,weight:800});
 ctx.fillStyle=PAPER;ctx.fillRect(0,1100,1080,820);
 textBox(ctx,name||storyText('unnamed',locale),{x:64,y:1140,width:952,size:43,minSize:27,maxLines:2,weight:800});
 textBox(ctx,caption||storyText('defaultCaption',locale),{x:64,y:1251,width:952,size:34,minSize:26,maxLines:3});
 ctx.fillStyle='#efb6a0';ctx.fillRect(42,1140,5,80);
 const fact=includeFact?storyFact(featured,locale):'';
 if(fact){ctx.fillStyle='#eef2e8';ctx.beginPath();ctx.roundRect(48,1370,984,78,18);ctx.fill();}
 if(fact)textBox(ctx,fact,{x:64,y:1383,width:952,size:24,minSize:19,maxLines:2,color:'#596f60'});
 const count=places.length,w=count===1?300:count===2?325:290,gap=28,total=count*w+(count-1)*gap;
 places.forEach((place,i)=>stamp(ctx,place,symbols[i],(1080-total)/2+i*(w+gap),1470,w,254,locale,i));
 textBox(ctx,`${count} ${storyText('stamps',locale)}`,{x:64,y:1760,width:952,size:22,minSize:20,maxLines:1,weight:800});
 const link=journeyURL?new URL(journeyURL).host+new URL(journeyURL).pathname.replace(/index\.html$/,''):'';
 textBox(ctx,link||'#OcEoTownwalk  #ChamOcEo',{x:64,y:1800,width:952,size:20,minSize:16,maxLines:1});
 textBox(ctx,`${storyText(demo?'demoNote':photo?'ownPhoto':'artOnly',locale)} · ${storyText('illustration',locale)}`,{x:64,y:1850,width:952,size:13,minSize:11,maxLines:2,color:'#596f60'});
 const blob=await new Promise((resolve,reject)=>canvas.toBlob(value=>value?resolve(value):reject(Error('PNG export failed')),'image/png'));
 return {canvas,blob,width:1080,height:1920};
}
