(function(){
'use strict';
const FRAME_DATA='assets/moldura.png';
const EXAMPLE_DATA='assets/exemplo.jpg';
const $=id=>document.getElementById(id);
const canvas=$('poster'), ctx=canvas.getContext('2d');
const frame=new Image(), nameField=$('studentName'), zoomControl=$('zoom');
const W={x:234,y:212,w:784,h:821}, SCALE=1080/1254;
let photo=null,frameReady=false,zoom=1,dx=0,dy=0,angle=0,revision=0,photoRequest=0;
let moving=false,gesture=null,drawPending=false,exportTicket=0,exportUrl=null,exportFile=null;
let loadingPhoto=false, exporting=false;
const pointers=new Map();
function status(text,error){$('status').textContent=text||'';$('status').classList.toggle('error',!!error);}
function updateReady(){$('saveArt').disabled=!frameReady||!photo||loadingPhoto||exporting;}
function loadImage(src){return new Promise((resolve,reject)=>{const im=new Image();const timer=setTimeout(()=>{im.src='';reject(new Error('A imagem demorou para abrir. Tente escolher novamente.'));},30000);im.onload=()=>{clearTimeout(timer);im.onload=im.onerror=null;resolve(im);};im.onerror=()=>{clearTimeout(timer);reject(new Error('Não foi possível abrir esta foto. Tente uma foto JPG ou PNG. Se for HEIC, use um Safari atualizado ou escolha uma versão JPG.'));};im.src=src;});}
function clamp(v,min,max){return Math.max(min,Math.min(max,v));}
function dimensions(){return angle%180===0?{w:photo.width,h:photo.height}:{w:photo.height,h:photo.width};}
function draw(){
 if(!ctx)return;
 ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,1080,1080);ctx.fillStyle='#ffda21';ctx.fillRect(0,0,1080,1080);
 ctx.save();ctx.scale(SCALE,SCALE);
 if(photo){const d=dimensions(),s=Math.max(W.w/d.w,W.h/d.h)*zoom;
  dx=clamp(dx,-Math.max(0,(d.w*s-W.w)/2),Math.max(0,(d.w*s-W.w)/2));
  dy=clamp(dy,-Math.max(0,(d.h*s-W.h)/2),Math.max(0,(d.h*s-W.h)/2));
  ctx.save();ctx.beginPath();ctx.rect(W.x,W.y,W.w,W.h);ctx.clip();ctx.translate(W.x+W.w/2+dx,W.y+W.h/2+dy);ctx.rotate(angle*Math.PI/180);ctx.drawImage(photo,-photo.width*s/2,-photo.height*s/2,photo.width*s,photo.height*s);ctx.restore();
 }
 if(frameReady)ctx.drawImage(frame,0,0,1254,1254);
 const text=nameField.value.trim()||'Nome do aprovado';ctx.textAlign='center';ctx.textBaseline='middle';let size=90;
 do{ctx.font='900 '+size+'px Arial, Helvetica, sans-serif';if(ctx.measureText(text).width<=735)break;size-=2;}while(size>26);
 ctx.fillStyle='#050505';ctx.fillText(text,606,1110,735);ctx.restore();
 canvas.setAttribute('aria-label','Prévia da aprovação de '+text);
}
function changed(){revision++;if(!drawPending){drawPending=true;requestAnimationFrame(()=>{drawPending=false;draw();});}}
function setZoom(value){zoom=clamp(value,1,3);zoomControl.value=String(zoom);$('zoomValue').textContent=Math.round(zoom*100)+'%';changed();}
function resetPosition(){dx=dy=0;setZoom(1);}
function setMoving(value){moving=value;pointers.clear();gesture=null;$('artStage').classList.toggle('editing',value);$('movePhoto').setAttribute('aria-pressed',String(value));$('movePhoto').querySelector('span').textContent=value?'Concluir':'Mover foto';$('previewHint').textContent=value?'Arraste a foto. Use dois dedos para aproximar.':'Toque em “Mover foto” para ajustar o enquadramento.';}
function localFile(){return typeof location!=='undefined'&&location.protocol==='file:';}
function readFailure(){return new Error(localFile()?'O visualizador deste arquivo não conseguiu acessar a foto. Toque em “Abrir editor online” acima e use o Safari.':'O iPhone não conseguiu entregar a foto ao editor. Abra a foto no app Fotos para baixá-la do iCloud e escolha novamente.');}
function fileReaderResult(blob,method){return new Promise((resolve,reject)=>{
 const reader=new FileReader();const timer=setTimeout(()=>{reader.abort();reject(readFailure());},25000);
 reader.onload=()=>{clearTimeout(timer);resolve(reader.result);};
 reader.onerror=reader.onabort=()=>{clearTimeout(timer);reject(readFailure());};
 try{reader[method](blob);}catch(error){clearTimeout(timer);reject(readFailure());}
});}
async function snapshotPhoto(file){
 // Read the provider-backed File before clearing or replacing the input. Only
 // memory-backed bytes are handed to the image decoder and blob URL loader.
 let bytes;
 if(typeof file.arrayBuffer==='function'){
  let timer;
  try{bytes=await Promise.race([file.arrayBuffer(),new Promise((resolve,reject)=>{timer=setTimeout(()=>reject(readFailure()),25000);})]);}
  catch(error){bytes=await fileReaderResult(file,'readAsArrayBuffer');}
  finally{clearTimeout(timer);}
 }else bytes=await fileReaderResult(file,'readAsArrayBuffer');
 if(!bytes||!bytes.byteLength||bytes.byteLength!==file.size)throw readFailure();
 return new Blob([bytes],{type:file.type||'application/octet-stream'});
}
async function decodePhoto(blob){
 let source=null,bitmap=null,url=null;
 try{
  // Safari's native image loader handles Photos conversions and orientation.
  // Its URL points at an in-memory Blob, never a temporary Photo Library file.
  try{url=URL.createObjectURL(blob);source=await loadImage(url);}catch(nativeError){
   if(typeof createImageBitmap==='function'){
    try{bitmap=await createImageBitmap(blob,{imageOrientation:'from-image',resizeWidth:1800,resizeQuality:'high'});source=bitmap;}catch(bitmapError){}
   }
   if(!source)source=await loadImage(await fileReaderResult(blob,'readAsDataURL'));
  }
  const w=source.naturalWidth||source.width,h=source.naturalHeight||source.height;
  if(!w||!h)throw new Error('Esta foto não tem dimensões válidas. Escolha outra.');
  const scale=Math.min(1,1800/Math.max(w,h));const reduced=document.createElement('canvas');reduced.width=Math.max(1,Math.round(w*scale));reduced.height=Math.max(1,Math.round(h*scale));
  const rc=reduced.getContext('2d');if(!rc)throw new Error('Memória insuficiente para abrir a foto. Tente uma imagem menor.');
  rc.drawImage(source,0,0,reduced.width,reduced.height);return reduced;
 }finally{if(bitmap)bitmap.close();if(source instanceof HTMLImageElement)source.src='';if(url)URL.revokeObjectURL(url);}
}
$('photoUpload').addEventListener('change',async function(){
 const f=this.files&&this.files[0];if(!f)return;
 const request=++photoRequest;loadingPhoto=true;updateReady();status('Abrindo a foto…');$('uploadLabel').textContent='Carregando sua foto…';
 try{
  if(!f.size)throw readFailure();
  if(f.size>45*1024*1024)throw new Error('Essa foto é muito grande. Escolha uma imagem de até 45 MB.');
  if(f.type&&!f.type.startsWith('image/')&&!/\.(heic|heif)$/i.test(f.name))throw new Error('Escolha um arquivo de imagem.');
  const snapshot=await snapshotPhoto(f);if(request!==photoRequest)return;
  const next=await decodePhoto(snapshot);if(request!==photoRequest){next.width=next.height=1;return;}
  const previous=photo;photo=next;if(previous instanceof HTMLCanvasElement)previous.width=previous.height=1;
  angle=0;resetPosition();$('fileInfo').textContent='Foto carregada · '+f.name;$('uploadLabel').textContent='Toque para trocar a foto';status('Sua foto está pronta. Ajuste o nome e o enquadramento.');
 }catch(e){if(request===photoRequest){status(e.message||'Não foi possível abrir a foto. Tente uma foto menor.',true);$('uploadLabel').textContent='Toque para escolher outra foto';}}
 finally{if(request===photoRequest){this.value='';loadingPhoto=false;updateReady();}}
});
nameField.addEventListener('input',()=>{$('nameCount').textContent=nameField.value.length+'/45';changed();});
nameField.addEventListener('keydown',e=>{if(e.key==='Enter')nameField.blur();});
zoomControl.addEventListener('input',()=>setZoom(Number(zoomControl.value)));
$('zoomOut').addEventListener('click',()=>setZoom(zoom-.1));$('zoomIn').addEventListener('click',()=>setZoom(zoom+.1));
$('centerPhoto').addEventListener('click',resetPosition);$('rotatePhoto').addEventListener('click',()=>{angle=(angle+90)%360;resetPosition();});
$('movePhoto').addEventListener('click',()=>setMoving(!moving));
function point(e){const r=canvas.getBoundingClientRect();return{x:(e.clientX-r.left)/r.width*1254,y:(e.clientY-r.top)/r.height*1254};}
function startGesture(){const p=Array.from(pointers.values());if(p.length>1){gesture={distance:Math.hypot(p[1].x-p[0].x,p[1].y-p[0].y),zoom:zoom};}else if(p.length===1){gesture={x:p[0].x,y:p[0].y,dx:dx,dy:dy};}else gesture=null;}
canvas.addEventListener('pointerdown',e=>{if(!moving||!photo)return;e.preventDefault();pointers.set(e.pointerId,point(e));try{canvas.setPointerCapture(e.pointerId);}catch(err){}startGesture();});
canvas.addEventListener('pointermove',e=>{if(!moving||!pointers.has(e.pointerId))return;e.preventDefault();pointers.set(e.pointerId,point(e));if(!gesture)return;const p=Array.from(pointers.values());if(p.length>1&&gesture.distance){setZoom(gesture.zoom*Math.hypot(p[1].x-p[0].x,p[1].y-p[0].y)/Math.max(1,gesture.distance));}else if(p.length===1&&gesture.x!==undefined){dx=gesture.dx+p[0].x-gesture.x;dy=gesture.dy+p[0].y-gesture.y;changed();}});
function endPointer(e){pointers.delete(e.pointerId);startGesture();}
['pointerup','pointercancel','lostpointercapture'].forEach(event=>canvas.addEventListener(event,endPointer));
function closeExport(){exportTicket++;$('exportLayer').hidden=true;document.body.classList.remove('export-open');exporting=false;updateReady();$('saveArt').focus();}
$('closeExport').addEventListener('click',closeExport);
$('exportLayer').addEventListener('click',e=>{if(e.target===$('exportLayer'))closeExport();});
document.addEventListener('keydown',e=>{if($('exportLayer').hidden)return;if(e.key==='Escape'){e.preventDefault();closeExport();}if(e.key==='Tab'){const elements=Array.from($('exportLayer').querySelectorAll('button:not([hidden]),a[href]')).filter(el=>!el.disabled);const first=elements[0],last=elements[elements.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}});
function filename(){return'Aprovado_Auto_Escola_Ouro_'+(nameField.value.trim()||'aluno').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9]+/g,'_').slice(0,60)+'.png';}
function asBlob(){return new Promise((resolve,reject)=>{canvas.toBlob(blob=>blob?resolve(blob):reject(new Error('Não foi possível gerar a imagem. Tente novamente.')),'image/png');});}
$('saveArt').addEventListener('click',async()=>{
 if(!frameReady||!photo||loadingPhoto)return;
 setMoving(false);nameField.blur();draw();exporting=true;updateReady();
 const ticket=++exportTicket;$('exportLayer').hidden=false;document.body.classList.add('export-open');$('exportCard').setAttribute('aria-busy','true');$('exportImage').hidden=true;$('exportOptions').hidden=true;$('exportProgress').textContent='Preparando sua arte…';$('exportStatus').textContent='';$('closeExport').focus();
 try{
  const blob=await asBlob();if(ticket!==exportTicket)return;
  const previousUrl=exportUrl;exportUrl=URL.createObjectURL(blob);exportFile=typeof File==='function'?new File([blob],filename(),{type:'image/png'}):null;
  $('exportImage').src=exportUrl;$('exportImage').hidden=false;$('downloadArt').href=exportUrl;$('downloadArt').download=filename();if(previousUrl)URL.revokeObjectURL(previousUrl);
  let shareable=false;try{shareable=!!(exportFile&&navigator.share&&navigator.canShare&&navigator.canShare({files:[exportFile]}));}catch(e){}
  $('shareArt').hidden=!shareable;$('shareArt').disabled=false;
  $('saveTip').innerHTML=shareable?'No iPhone: toque em compartilhar e escolha <b>Salvar Imagem</b>. Você também pode manter o dedo sobre a imagem acima.':'Toque em <b>Baixar imagem PNG</b>. No iPhone, mantenha o dedo sobre a imagem acima e escolha <b>Salvar no Fotos</b> ou <b>Adicionar a Fotos</b>, se disponível.';
  $('exportCard').setAttribute('aria-busy','false');$('exportOptions').hidden=false;
 }catch(e){$('exportProgress').textContent=e.message||'Não foi possível gerar a arte. Feche esta tela e tente novamente.';}
});
// The file is already prepared. Sharing starts directly inside this tap handler,
// with no asynchronous image conversion before navigator.share (iOS activation).
$('shareArt').addEventListener('click',async()=>{
 if(!exportFile)return;$('shareArt').disabled=true;
 try{await navigator.share({files:[exportFile]});$('exportStatus').textContent='Compartilhamento concluído. Você pode voltar ao editor.';}
 catch(e){$('exportStatus').textContent=e.name==='AbortError'?'Compartilhamento cancelado. Sua arte continua pronta acima.':'O compartilhamento não abriu. Use o botão de baixar ou mantenha o dedo sobre a imagem para salvar.';}
 finally{$('shareArt').disabled=false;}
});
$('downloadArt').addEventListener('click',()=>{$('exportStatus').textContent='Se o download não começar, mantenha o dedo sobre a imagem pronta para ver as opções de salvar.';});
window.addEventListener('pagehide',()=>{if(exportUrl){URL.revokeObjectURL(exportUrl);exportUrl=null;}});
window.addEventListener('pageshow',e=>{if(e.persisted&&!$('exportLayer').hidden){closeExport();}});
if(!ctx){status('Este navegador não permite editar imagens. Abra o editor em um Safari ou Chrome atualizado.',true);return;}
frame.onload=()=>{frameReady=true;changed();updateReady();if(!loadingPhoto)status(photo?'Tudo pronto para personalizar.':'Moldura pronta. Escolha a foto do aluno.');};
frame.onerror=()=>{status('A moldura não abriu. Recarregue a página para tentar novamente.',true);updateReady();};frame.src=FRAME_DATA;
$('localNotice').hidden=!localFile();
const initialRequest=photoRequest;
loadImage(EXAMPLE_DATA).then(im=>{if(photoRequest!==initialRequest){im.src='';return;}photo=im;changed();updateReady();if(frameReady)status('Tudo pronto para personalizar.');}).catch(()=>{if(photoRequest===initialRequest&&!loadingPhoto)status('Escolha a foto do aluno para começar.');});
$('nameCount').textContent=nameField.value.length+'/45';draw();
})();
